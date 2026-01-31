import Stripe from 'stripe'
import { config } from '@/config'

// Stripe is optional in development - use a dummy key if not provided
const stripeKey =
  config.services.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_dev'

export const stripe = new Stripe(stripeKey)
