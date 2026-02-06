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
    <Tabs defaultValue={tab ?? 'account'} onValueChange={setTab}>
      <div className="md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        <TabsList>
          <TabsTrigger value="account">{dictionary.account_data}</TabsTrigger>
          <TabsTrigger value="social-links">
            {dictionary.social_links}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            {dictionary.preferences}
          </TabsTrigger>
          <TabsTrigger value="subscription">
            {dictionary.subscription}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="account">
        <UserForm user={user} onClose={handleClose} />
      </TabsContent>

      <TabsContent value="social-links">
        <SocialLinksForm socialLinks={socialLinks} onClose={handleClose} />
      </TabsContent>

      <TabsContent value="preferences">
        <UserPreferences />
      </TabsContent>

      <TabsContent value="subscription">
        <SubscriptionForm user={user} />
      </TabsContent>
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

        <DialogContent className="max-w-xl">
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
      <DrawerContent>
        <DrawerTitle className="hidden" />
        <div className="p-4">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}
