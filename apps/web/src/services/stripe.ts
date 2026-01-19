import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : (null as unknown as Stripe)
