import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'
import Cors from 'micro-cors'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

Cors({
  allowMethods: ['POST', 'HEAD'],
})

const resend = new Resend('re_YfR8Ma7w_HC2eYtKg1kYUz2Jcb5CAfHwX')

export async function POST(req: Request) {
  try {
    const { data: proUsers } = await supabase
      .from('profiles')
      .select()
      .eq('subscription_type', 'PRO')
      .returns<Profile[]>()

    const hasUsers = proUsers && proUsers.length > 0

    if (hasUsers) {
      const response = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'status451jr@gmail.com',
        subject: 'Hello World',
        html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
      })

      // await Promise.all(
      //   proUsers.map(async (user) => {
      //     console.log({ response })
      //   }),
      // )
    }

    return NextResponse.json({ result: null, ok: true })
  } catch (error) {
    return NextResponse.json({ error, ok: false })
  }
}
