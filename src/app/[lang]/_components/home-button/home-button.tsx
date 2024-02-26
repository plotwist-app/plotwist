import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getUserService } from '@/services/api/users/get-user'
import { Language } from '@/types/languages'

import Link from 'next/link'

type HomeButtonProps = {
  primaryButton: string
  language: Language
}

export const HomeButton = async ({
  primaryButton,
  language,
}: HomeButtonProps) => {
  const {
    data: { user },
  } = await getUserService()

  if (!user)
    return (
      <Button asChild variant="outline">
        <Link href={`/${language}/login`}>{primaryButton}</Link>
      </Button>
    )

  const username: string = user.user_metadata.username
  const initial = username[0].toUpperCase()

  return (
    <Button variant="outline" asChild>
      <Link href={`/${language}/app`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="mr-2 h-6 w-6 border text-[10px]">
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>

            <TooltipContent>{username}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {primaryButton}
      </Link>
    </Button>
  )
}
