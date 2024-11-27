'use client'

import type {
  GetSocialLinks200SocialLinksItem,
  GetUsersUsername200User,
} from '@/api/endpoints.schemas'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { useMediaQuery } from '@/hooks/use-media-query'
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
import { type PropsWithChildren, useState } from 'react'
import { SocialLinksForm } from './social-links-form'
import { UserForm } from './user-form'

type UserDialogProps = PropsWithChildren & {
  user: GetUsersUsername200User
  socialLinks: GetSocialLinks200SocialLinksItem[]
}

export function UserDialog({ user, socialLinks, children }: UserDialogProps) {
  const [open, setOpen] = useState(false)
  const { dictionary } = useLanguage()
  const session = useSession()

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isOwner = user.id === session.user?.id

  const content = (
    <Tabs defaultValue="account">
      <div className="md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        <TabsList>
          <TabsTrigger value="account">{dictionary.account_data}</TabsTrigger>
          <TabsTrigger value="social-links">
            {dictionary.social_links}
          </TabsTrigger>
          <TabsTrigger value="subscription" disabled>
            {dictionary.subscription}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="account">
        <UserForm user={user} onClose={() => setOpen(false)} />
      </TabsContent>

      <TabsContent value="social-links">
        <SocialLinksForm
          socialLinks={socialLinks}
          onClose={() => setOpen(false)}
        />
      </TabsContent>
    </Tabs>
  )

  if (!isOwner) return

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogTitle className="hidden" />

          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="hidden" />
        <div className="p-4">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}
