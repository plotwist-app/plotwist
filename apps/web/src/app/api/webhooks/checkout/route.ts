import Cors from 'micro-cors'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { env } from '@/env.mjs'
import { stripe } from '@/services/stripe'

Cors({
  allowMethods: ['POST', 'HEAD'],
})

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')

    if (!signature) return

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    )

    if (event.type === 'checkout.session.completed') {
      return NextResponse.json({ result: event, ok: true })
    }
  } catch {}
}
