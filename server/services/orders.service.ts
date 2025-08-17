import { pool } from '../db';
import { createPaymentIntent, retrievePaymentIntent } from './payments/stripe.service';
import { cartService } from './cart.service';
import { ApiError, ERROR_CODES } from '../utils/errors';

// AUDIT:System Overview -> E-commerce functionality

interface PendingCoupon {
  couponId: number;
  discountAmount: number;
}

const pendingCoupons = new Map<number, PendingCoupon>();

export const ordersService = {
  async createOrder(userId: number, couponCode?: string) {
    const cart = await cartService.getCart(userId);
    if (cart.items.length === 0) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, 'Cart is empty');
    }

    let discountAmount = 0;
    let couponId: number | null = null;
    if (couponCode) {
      const [[coupon]] = await pool.query<any[]>(
        `SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND valid_from <= NOW() AND valid_until >= NOW()`,
        [couponCode]
      );
      if (!coupon || (coupon.usage_limit && coupon.used_count >= coupon.usage_limit)) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, 'Invalid coupon');
      }
      couponId = coupon.id;
      discountAmount = coupon.discount_type === 'percentage'
        ? cart.total * (coupon.discount_value / 100)
        : coupon.discount_value;
    }

    const totalAmount = cart.total - discountAmount;
    const intent = await createPaymentIntent(totalAmount);
    const orderNumber = `ORD-${Date.now()}`;
    const [result] = await pool.query<any>(
      `INSERT INTO orders (user_id, order_number, total_amount, payment_status, payment_method, payment_transaction_id)
       VALUES (?,?,?,?,?,?)`,
      [userId, orderNumber, totalAmount, 'pending', 'stripe', intent.id]
    );
    const orderId = result.insertId as number;

    for (const item of cart.items) {
      await pool.query(
        `INSERT INTO order_items (order_id, course_id, pricing_tier, base_price) VALUES (?,?,?,?)`,
        [orderId, item.course.id, item.pricingTier, item.price]
      );
    }

    if (couponId) {
      pendingCoupons.set(orderId, { couponId, discountAmount });
    }

    return {
      id: orderId,
      orderNumber,
      totalAmount,
      paymentIntent: intent.id,
      clientSecret: intent.client_secret
    };
  },

  async confirmPayment(orderId: number) {
    const [[order]] = await pool.query<any[]>(`SELECT * FROM orders WHERE id = ?`, [orderId]);
    if (!order) {
      throw new ApiError(404, ERROR_CODES.VALIDATION_ERROR, 'Order not found');
    }
    const intent = await retrievePaymentIntent(order.payment_transaction_id);
    if (intent.status === 'succeeded') {
      await pool.query(`UPDATE orders SET payment_status = 'completed' WHERE id = ?`, [orderId]);
      const coupon = pendingCoupons.get(orderId);
      if (coupon) {
        await pool.query(
          `INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount) VALUES (?,?,?,?)`,
          [coupon.couponId, order.user_id, orderId, coupon.discountAmount]
        );
        await pool.query(`UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`, [coupon.couponId]);
        pendingCoupons.delete(orderId);
      }
      await pool.query(`DELETE FROM cart_items WHERE user_id = ?`, [order.user_id]);
      const [items] = await pool.query<any[]>(`SELECT course_id FROM order_items WHERE order_id = ?`, [orderId]);
      return { status: 'completed', enrolledCourses: items.map(i => i.course_id) };
    }
    return { status: intent.status, enrolledCourses: [] };
  }
};
