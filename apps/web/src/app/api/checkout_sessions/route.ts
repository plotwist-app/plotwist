import { stripe } from '@/services/stripe'
import { NextRequest } from 'next/server'
import { Stripe } from 'stripe'

export async function POST(req: NextRequest) {
  const url = new URL(req.url)

  const email = url.searchParams.get('email')
  const locale = (url.searchParams.get('locale') ??
    'en') as Stripe.Checkout.SessionCreateParams.Locale

  const prices = await stripe.prices.list({
    product: 'prod_Pqs2HScixDThzJ',
  })

  const priceByLocale = prices.data.find((price) => {
    if (locale === 'ja') {
      return price.currency === 'jpy'
    }

    if (['de', 'es', 'fr', 'it'].includes(locale)) {
      return price.currency === 'eur'
    }

    if (locale === 'pt') {
      return price.currency === 'brl'
    }

    return price.currency === 'usd'
  })

  if (stripe && prices && email) {
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceByLocale ? priceByLocale.id : prices.data[0].id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'http://localhost:3000/thank-you',
        cancel_url: 'http://localhost:3000/fk-you',
        locale,
        customer_email: email,
      })

      if (session.url) {
        return Response.redirect(session.url, 303)
      }
    } catch (err) {
      console.error({ err })
    }
  }
}
