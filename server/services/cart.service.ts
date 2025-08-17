import { pool } from '../db';
import { ApiError, ERROR_CODES } from '../utils/errors';

// AUDIT:System Overview -> E-commerce functionality

export const cartService = {
  async getCart(userId: number) {
    const [rows] = await pool.query<any[]>(
      `SELECT ci.course_id, ci.pricing_tier, ci.base_price, ci.added_at,
              c.title, c.image_url, cat.name AS category
       FROM cart_items ci
       JOIN courses c ON ci.course_id = c.id
       JOIN categories cat ON c.category_id = cat.id
       WHERE ci.user_id = ?`,
      [userId]
    );
    const items = rows.map(r => ({
      id: r.course_id,
      course: {
        id: r.course_id,
        title: r.title,
        image: r.image_url,
        category: r.category
      },
      pricingTier: r.pricing_tier,
      price: Number(r.base_price),
      addedAt: r.added_at
    }));
    const total = items.reduce((s, i) => s + i.price, 0);
    return { items, total, itemCount: items.length };
  },

  async addItem(userId: number, courseId: number, pricingTier: string) {
    const [[course]] = await pool.query<any[]>(
      `SELECT c.id, c.title, c.image_url, cat.name AS category
       FROM courses c
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = ?`,
      [courseId]
    );
    if (!course) {
      throw new ApiError(404, ERROR_CODES.COURSE_NOT_FOUND, 'Course not found');
    }
    const [[priceRow]] = await pool.query<any[]>(
      `SELECT price FROM course_pricing WHERE course_id = ? AND tier = ?`,
      [courseId, pricingTier]
    );
    if (!priceRow) {
      throw new ApiError(404, ERROR_CODES.VALIDATION_ERROR, 'Pricing tier not found');
    }
    const price = Number(priceRow.price);
    await pool.query(
      `INSERT INTO cart_items (user_id, course_id, pricing_tier, base_price)
       VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE pricing_tier=VALUES(pricing_tier), base_price=VALUES(base_price), added_at=CURRENT_TIMESTAMP`,
      [userId, courseId, pricingTier, price]
    );
    const cart = await this.getCart(userId);
    const cartItem = cart.items.find(i => i.course.id === courseId)!;
    return { cartItem, cartTotal: cart.total };
  },

  async removeItem(userId: number, courseId: number) {
    await pool.query(`DELETE FROM cart_items WHERE user_id = ? AND course_id = ?`, [userId, courseId]);
    const cart = await this.getCart(userId);
    return cart.total;
  }
};
