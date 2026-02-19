'use client'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { Button } from '@plotwist/ui/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import type { GetUsersUsername200User } from '@/api/endpoints.schemas'
import { deleteSubscription } from '@/api/subscriptions'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'

type SubscriptionFormProps = {
  user: GetUsersUsername200User
}

export function SubscriptionForm({ user }: SubscriptionFormProps) {
  const { dictionary, language } = useLanguage()
  const router = useRouter()
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)

  const cancelMutation = useMutation({
    mutationFn: (when: 'now' | 'at_end_of_current_period') =>
      deleteSubscription({ when }),
    onSuccess: () => {
      toast.success(dictionary.cancel_subscription_success)
      router.refresh()
    },
    onError: () => {
      toast.error(dictionary.cancel_subscription_error)
    },
  })

  const isPro = user.subscriptionType === 'PRO'
  const isFree = user.subscriptionType === 'MEMBER'

  const handleUpgrade = async () => {
    try {
      const locale = language.split('-')[0] ?? 'en'
      const response = await fetch(
        `/api/checkout_sessions?locale=${locale}&email=${user.email}&username=${user.username}&redirect=checkout`,
        { method: 'POST' }
      )

      if (response.redirected) {
        window.location.href = response.url
      } else {
        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
        }
      }
    } catch {
      toast.error('Failed to start checkout')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          className={cn(
            'flex flex-col justify-between gap-6 rounded-lg border bg-background bg-gradient-to-b from-transparent to-muted/30 p-6 transition-all',
            isFree && 'border-2 border-primary shadow-md'
          )}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-muted-foreground">
                {dictionary.home_prices.free_plan.title}
              </h4>
            </div>

            <div className="space-y-1">
              <span className="text-3xl font-bold">
                {dictionary.home_prices.free_plan.price}
              </span>
              <p className="text-sm text-muted-foreground">
                {dictionary.home_prices.free_plan.description}
              </p>
            </div>

            <ul className="space-y-3">
              {dictionary.home_prices.free_plan.benefits.map(
                (benefit: string) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border bg-muted p-1">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {benefit}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          <Button
            variant={isFree ? 'secondary' : 'outline'}
            className="w-full"
            disabled={isFree}
          >
            {isFree
              ? dictionary.already_in_free
              : dictionary.home_prices.free_plan.start_now}
          </Button>
        </div>

        <div
          className={cn(
            'relative flex flex-col justify-between gap-6 rounded-lg border bg-background bg-gradient-to-b from-transparent to-muted/30 p-6 transition-all',
            isPro && 'border-2 border-primary shadow-md'
          )}
        >
          {!isPro && dictionary.home_prices.pro_plan.recommended && (
            <Badge
              variant="outline"
              className="absolute -top-3 left-1/2 -translate-x-1/2"
            >
              {dictionary.home_prices.pro_plan.recommended}
            </Badge>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-muted-foreground">
                {dictionary.home_prices.pro_plan.title}
              </h4>
            </div>

            <div className="space-y-1">
              <span className="text-3xl font-bold">
                {dictionary.home_prices.pro_plan.price}
              </span>
              <p className="text-sm text-muted-foreground">
                {dictionary.home_prices.pro_plan.description}
              </p>
            </div>

            <ul className="space-y-3">
              {dictionary.home_prices.pro_plan.benefits.map(
                (benefit: string) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border bg-muted p-1">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {benefit}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          {isPro ? (
            <div className="w-full">
              {!isConfirmingCancel ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setIsConfirmingCancel(true)}
                >
                  {dictionary.cancel_subscription}
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setIsConfirmingCancel(false)}
                    disabled={cancelMutation.isPending}
                  >
                    {dictionary.keep_subscription}
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() =>
                      cancelMutation.mutate('at_end_of_current_period')
                    }
                    disabled={cancelMutation.isPending}
                  >
                    {dictionary.cancel_subscription_confirm_title}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button onClick={handleUpgrade} className="w-full">
              {dictionary.get_14_days_free_pro ||
                dictionary.home_prices.pro_plan.subscribe}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
