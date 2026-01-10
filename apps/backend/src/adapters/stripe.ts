import { config } from '@/config'
import Stripe from 'stripe'

export const stripe = new Stripe(config.services.STRIPE_SECRET_KEY)
