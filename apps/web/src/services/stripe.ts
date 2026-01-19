import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// Only initialize Stripe if the secret key is provided
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : (null as unknown as Stripe)
