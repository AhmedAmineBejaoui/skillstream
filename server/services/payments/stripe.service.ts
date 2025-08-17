import Stripe from 'stripe';
import 'dotenv/config';

// AUDIT:Tech Stack -> Stripe payment processing

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function createPaymentIntent(amount: number) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd'
  });
}

export async function retrievePaymentIntent(id: string) {
  return stripe.paymentIntents.retrieve(id);
}
