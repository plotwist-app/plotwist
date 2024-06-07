'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, usePathname } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { Forward, X } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'
import {
  RecommendationDialogProfile,
  RecommendationDialogProfileSkeleton,
} from './recommendation-dialog-profile'

import { Profile } from '@/types/supabase'

import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'
import { useRecommendations } from '@/hooks/use-recommendations'
import { getFollowingProfiles } from '@/services/api/followers/get-following-profiles'

export const RecommendationDialogProfiles = () => {
  const { dictionary } = useLanguage()
  const { user } = useAuth()
  const { handleCreate } = useRecommendations()
  const params = useParams<{ id: string }>()
  const pathname = usePathname()

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([])

  const { data: profiles, isLoading } = useQuery({
    queryFn: async () => await getFollowingProfiles(user!.id),
    queryKey: ['following'],
  })

  const handleSelect = (action: 'remove' | 'add', profile: Profile) => {
    setSelectedProfiles((prev) => {
      if (action === 'add') {
        return [...prev, profile]
      }

      return prev.filter((prevProfile) => prevProfile.id !== profile.id)
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    handleCreate.mutate(
      {
        receiverUsersIds: selectedProfiles.map((profile) => profile.id),
        senderUserId: user!.id,
        mediaType: pathname.includes('movies') ? 'MOVIE' : 'TV_SHOW',
        tmdbId: Number(params.id),
        message: String(formData.get('message')),
      },
      {
        onSettled: () => {
          setOpen(false)
          setSelectedProfiles([])
          toast.success(dictionary.recommendation_sended_successfully)
        },
      },
    )
  }

  const Content = () => {
    if (isLoading || !profiles) {
      return (
        <>
          {Array.from({ length: 10 }).map((_, index) => {
            return <RecommendationDialogProfileSkeleton key={index} />
          })}
        </>
      )
    }

    const filteredProfiles = profiles.filter((profile) =>
      profile.username.toLowerCase().includes(search.toLowerCase()),
    )

    return (
      <>
        {filteredProfiles.map((profile) => {
          return (
            <RecommendationDialogProfile
              profile={profile}
              key={profile.id}
              handleSelect={handleSelect}
              checked={selectedProfiles.some((item) => item.id === profile.id)}
            />
          )
        })}
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-6 px-2.5 py-0.5 text-xs" variant="outline">
          <Forward className="mr-2 size-3" />
          {dictionary.recommend}
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-0 p-0">
        <DialogHeader className="space-y-4 border-b p-4">
          <DialogTitle>{dictionary.recommend}</DialogTitle>

          <div className="flex items-center gap-2">
            <span>{dictionary.to}:</span>

            <div className="flex w-full flex-wrap items-center gap-1 rounded-lg border px-4 py-2">
              {selectedProfiles.map((profile) => {
                return (
                  <div
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-foreground px-3 py-0.5 text-background hover:bg-foreground/50"
                    key={profile.id}
                    onClick={() => handleSelect('remove', profile)}
                  >
                    <span className="text-xs">{profile.username}</span>
                    <X className="size-4" />
                  </div>
                )
              })}

              <input
                type="text"
                placeholder={dictionary.search}
                className="w-[20ch] border-none bg-transparent outline-none"
                onChange={({ target: { value } }) => setSearch(value)}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="h-[500px] space-y-4 overflow-y-auto py-4">
          <h5 className="px-4 font-bold">{dictionary.suggestions}</h5>
          <Content />
        </div>

        <form
          className="flex flex-col gap-4 border-t p-4"
          onSubmit={(event) => handleSubmit(event)}
        >
          <input
            className="w-full border-none bg-transparent text-sm outline-none"
            placeholder={dictionary.write_a_message}
            name="message"
          />

          <Button
            disabled={selectedProfiles.length === 0 || handleCreate.isPending}
            type="submit"
          >
            {dictionary.recommend}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
