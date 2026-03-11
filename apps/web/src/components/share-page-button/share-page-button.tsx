'use client'

import { Button } from '@plotwist/ui/components/ui/button'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePostSharedUrl } from '@/api/shared-url'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import type { Language } from '@/types/languages'

type SharePageButtonProps = {
  language: Language
  path: string
}

export function SharePageButton({ language, path }: SharePageButtonProps) {
  const { user } = useSession()
  const { dictionary } = useLanguage()
  const postSharedUrl = usePostSharedUrl()

  const handleShare = async () => {
    const originalUrl = `${window.location.origin}/${language}/${path}`
    try {
      const { shortUrl } = await postSharedUrl.mutateAsync({
        data: { originalUrl },
      })
      await navigator.clipboard.writeText(shortUrl)
      toast.success(dictionary.link_copied_to_clipboard)
    } catch {
      toast.error('Failed to create share link')
    }
  }

  if (!user) return null

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleShare}
      disabled={postSharedUrl.isPending}
    >
      <Share2 size={14} className="mr-2" />
      {dictionary.share}
    </Button>
  )
}
