import { stripe } from '@/services/stripe'
import type { NextRequest } from 'next/server'
import type { Stripe } from 'stripe'

export async function POST(req: NextRequest) {
  const url = new URL(req.url)

  const email = url.searchParams.get('email')
  const username = url.searchParams.get('username')
  const redirect = url.searchParams.get('redirect')

  const locale = (url.searchParams.get('locale') ??
    'en') as Stripe.Checkout.SessionCreateParams.Locale
  const country = req.headers.get('x-vercel-ip-country')

  const prices = await stripe.prices.list({
    product: process.env.STRIPE_PRODUCT_ID,
    type: 'recurring',
  })

  const priceByLocale = prices.data.find(price => {
    if (!price.recurring) {
      return false
    }

    switch (country) {
      case 'JP':
        return price.currency === 'jpy'
      case 'BR':
        return price.currency === 'brl'
      case 'DE':
      case 'ES':
      case 'FR':
      case 'IT':
        return price.currency === 'eur'
      default:
        return price.currency === 'usd'
    }
  })

  const price = priceByLocale ? priceByLocale.id : prices.data[0].id

  if (stripe && prices && email) {
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${url.origin}/${username}?subscription=pro`,
        cancel_url: `${url.origin}/`,
        locale,
        customer_email: email,
        subscription_data: {
          trial_period_days: 14,
        },
      })

      if (session.url) {
        if (redirect) {
          return Response.redirect(session.url, 303)
        }

        return Response.json({ url: session.url })
      }
    } catch (err) {
      console.error(err)
    }
  }
}
