'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@plotwist/ui/components/ui/alert-dialog'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { Button } from '@plotwist/ui/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { GetUsersUsername200User } from '@/api/endpoints.schemas'
import { deleteSubscription } from '@/api/subscriptions'
import { useLanguage } from '@/context/language'

type SubscriptionFormProps = {
  user: GetUsersUsername200User
}

export function SubscriptionForm({ user }: SubscriptionFormProps) {
  const { dictionary } = useLanguage()
  const router = useRouter()

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

  if (!isPro) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          {dictionary.subscription_plan}:{' '}
          <Badge variant="secondary">
            {dictionary.home_prices.free_plan.title}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {dictionary.subscription_plan}: <Badge>PRO</Badge>
      </div>

      <div className="flex flex-col gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-fit">
              {dictionary.cancel_subscription}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {dictionary.cancel_subscription_confirm_title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {dictionary.cancel_subscription_confirm_description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{dictionary.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  cancelMutation.mutate('at_end_of_current_period')
                }
                disabled={cancelMutation.isPending}
                className="bg-muted text-muted-foreground hover:bg-muted/90"
              >
                {dictionary.cancel_at_end_of_period}
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => cancelMutation.mutate('now')}
                disabled={cancelMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {dictionary.cancel_now}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
