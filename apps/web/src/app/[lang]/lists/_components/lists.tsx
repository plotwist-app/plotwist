'use client'

import { useLanguage } from '@/context/language'
import { useLists } from '@/context/lists'

import { ListCard, ListCardSkeleton } from '@/components/list-card'
import { NoAccountTooltip } from '@/components/no-account-tooltip'

import { useSession } from '@/context/session'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import { LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { v4 } from 'uuid'
import { ListForm } from './list-form'

const LIMIT = 3

export const Lists = () => {
  const { lists, isLoading } = useLists()
  const { dictionary, language } = useLanguage()
  const { user } = useSession()

  if (!user) {
    return (
      <div className="grid-cols:1 grid gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        <NoAccountTooltip>
          <button
            className="aspect-video cursor-not-allowed rounded-md border border-dashed opacity-50"
            type="button"
          >
            {dictionary.list_form.create_new_list}
          </button>
        </NoAccountTooltip>
      </div>
    )
  }

  if (isLoading)
    return (
      <div className="grid-cols:1 grid gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map(_ => (
          <ListCardSkeleton key={v4()} />
        ))}
      </div>
    )

  return (
    <div className="grid-cols:1 grid gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
      {lists.slice(0, LIMIT).map(list => (
        <ListCard key={list.id} list={list} />
      ))}

      {lists.length < LIMIT &&
        Array.from({ length: LIMIT - lists.length }).map((_, index) => {
          if (user.subscriptionType === 'MEMBER' && index !== 0) {
            return (
              <TooltipProvider delayDuration={0} key={v4()}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/${language}/pricing`}
                      className="flex items-center justify-center aspect-video rounded-md border border-dashed text-muted-foreground/50 p-8 uppercase"
                    >
                      <LockKeyhole />
                    </Link>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>{dictionary.upgrade_list_message}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }

          return (
            <ListForm
              trigger={
                <button
                  className="group aspect-video rounded-md border border-dashed"
                  type="button"
                >
                  <p className="scale-0 text-xs font-bold uppercase text-muted-foreground transition-all group-hover:scale-100">
                    {dictionary.list_form.create_new_list}
                  </p>
                </button>
              }
              key={v4()}
            />
          )
        })}
    </div>
  )
}
