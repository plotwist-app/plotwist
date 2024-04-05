import Cors from 'micro-cors'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { stripe } from '@/services/stripe'
import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'

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
      process.env.STRIPE_WEBHOOK_SECRET!,
    )

    if (event.type === 'checkout.session.completed') {
      const email = event.data.object.customer_email
      const { data: profile } = await supabase
        .from('profiles')
        .select()
        .eq('email', email)
        .single<Profile>()

      if (profile) {
        await supabase.from('subscriptions').insert({
          type: 'MEMBER',
          user_id: profile.id,
        })

        await supabase
          .from('profiles')
          .update({ subscription_type: 'MEMBER' })
          .eq('id', profile.id)

        return NextResponse.json({ result: event, ok: true })
      }
    }

    return NextResponse.json({ result: null, ok: true })
  } catch (error) {
    return NextResponse.json({ error, ok: false })
  }
}
