'use client'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plotwist/ui/components/ui/tabs'
import { CreditCard, Link, Settings, User } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { type PropsWithChildren, useState } from 'react'
import type {
  GetSocialLinks200SocialLinksItem,
  GetUsersUsername200User,
} from '@/api/endpoints.schemas'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { useMediaQuery } from '@/hooks/use-media-query'
import { SocialLinksForm } from './social-links-form'
import { SubscriptionForm } from './subscription-form'
import { UserForm } from './user-form'
import { UserPreferences } from './user-preferences'

type UserDialogProps = PropsWithChildren & {
  user: GetUsersUsername200User
  socialLinks: GetSocialLinks200SocialLinksItem[]
}

export function UserDialog({ user, socialLinks, children }: UserDialogProps) {
  const [tab, setTab] = useQueryState('tab')

  const [open, setOpen] = useState(
    tab
      ? ['account', 'social-links', 'preferences', 'subscription'].includes(tab)
      : false
  )

  const { dictionary } = useLanguage()
  const session = useSession()

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isOwner = user.id === session.user?.id

  const handleClose = () => {
    setOpen(false)
    setTab(null)
  }

  const content = (
    <Tabs
      orientation="vertical"
      defaultValue={tab ?? 'account'}
      onValueChange={setTab}
      className="flex h-full min-h-0 w-full flex-col overflow-hidden sm:flex-row"
    >
      <aside className="relative shrink-0 border-border/40 sm:bg-muted/15 sm:w-48 sm:border-b-0 sm:border-r sm:px-3 sm:py-4">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-muted/50 to-transparent sm:hidden" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-muted/50 to-transparent sm:hidden" />

        <div className="overflow-x-auto sm:overflow-x-visible">
          <TabsList className="flex h-auto min-w-max flex-row gap-1 bg-transparent p-2 sm:w-full sm:flex-col sm:p-0">
            <TabsTrigger
              value="account"
              className="flex shrink-0 justify-start gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground data-[state=active]:bg-muted/40 data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:w-full"
            >
              <User className="size-4" />
              {dictionary.account_data}
            </TabsTrigger>

            <TabsTrigger
              value="social-links"
              className="flex shrink-0 justify-start gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground data-[state=active]:bg-muted/40 data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:w-full"
            >
              <Link className="size-4" />
              {dictionary.social_links}
            </TabsTrigger>

            <TabsTrigger
              value="preferences"
              className="flex shrink-0 justify-start gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground data-[state=active]:bg-muted/40 data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:w-full"
            >
              <Settings className="size-4" />
              {dictionary.preferences}
            </TabsTrigger>

            <TabsTrigger
              value="subscription"
              className="flex shrink-0 justify-start gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground data-[state=active]:bg-muted/40 data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:w-full"
            >
              <CreditCard className="size-4" />
              {dictionary.subscription}
            </TabsTrigger>
          </TabsList>
        </div>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-auto p-4 sm:p-6">
        <TabsContent value="account" className="mt-0 w-full">
          <div className="mb-4 border-b border-border/40 pb-3">
            <h1 className="text-lg font-semibold">{dictionary.account_data}</h1>
          </div>
          <UserForm user={user} onClose={handleClose} />
        </TabsContent>

        <TabsContent value="social-links" className="mt-0 w-full">
          <div className="mb-4 border-b border-border/40 pb-3">
            <h1 className="text-lg font-semibold">{dictionary.social_links}</h1>
          </div>
          <SocialLinksForm socialLinks={socialLinks} onClose={handleClose} />
        </TabsContent>

        <TabsContent value="preferences" className="mt-0 w-full">
          <div className="mb-4 border-b border-border/40 pb-3">
            <h1 className="text-lg font-semibold">{dictionary.preferences}</h1>
          </div>
          <UserPreferences />
        </TabsContent>

        <TabsContent value="subscription" className="mt-0 w-full">
          <div className="mb-4 border-b border-border/40 pb-3">
            <h1 className="text-lg font-semibold">{dictionary.subscription}</h1>
          </div>
          <SubscriptionForm user={user} />
        </TabsContent>
      </div>
    </Tabs>
  )

  if (!isOwner) return

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={isOpen => {
          setOpen(isOpen)
          if (!isOpen) setTab(null)
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="flex h-[38rem] w-[min(56rem,95vw)] max-w-none max-h-[90vh] flex-col overflow-hidden p-0">
          <DialogTitle className="hidden" />

          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={isOpen => {
        setOpen(isOpen)
        if (!isOpen) setTab(null)
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-3/4">
        <DrawerTitle className="hidden" />
        <div className="p-4 overflow-auto">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}
