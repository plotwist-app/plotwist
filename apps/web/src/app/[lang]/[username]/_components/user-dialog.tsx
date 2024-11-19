'use client'

import {
  GetSocialLinks200SocialLinksItem,
  GetUsersUsername200User,
} from '@/api/endpoints.schemas'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plotwist/ui/components/ui/tabs'
import { PropsWithChildren, useState } from 'react'
import { UserForm } from './user-form'
import { SocialLinksForm } from './social-links-form'
import { useLanguage } from '@/context/language'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import { useSession } from '@/context/session'

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

        <DialogContent>{content}</DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="p-4">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}