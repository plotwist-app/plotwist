import Stripe from 'stripe'

console.log({
  stripeKey: process.env.STRIPE_SECRET_KEY,
  nodeEnv: process.env.NODE_ENV,
})

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
