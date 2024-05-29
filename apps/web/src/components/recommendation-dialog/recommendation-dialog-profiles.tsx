import { getProfilesOrderedByFollowing } from '@/services/api/followers/get-following'
import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { tmdbImage } from '@/utils/tmdb/image'
import { Checkbox } from '../ui/checkbox'
import { DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/button'

export const RecommendationDialogProfiles = () => {
  const { data: profiles, isLoading } = useQuery({
    queryFn: async () => await getProfilesOrderedByFollowing(),
    queryKey: ['following'],
  })

  const [selectedProfilesIds, setSelectedProfilesIds] = useState<string[]>([])

  const handleSelection = (action: 'remove' | 'add', profileId: string) => {
    setSelectedProfilesIds((prev) => {
      if (action === 'add') {
        return [...prev, profileId]
      }

      return prev.filter((id) => id !== profileId)
    })
  }

  if (isLoading) {
    return (
      <>
        <DialogHeader className="space-y-4 border-b p-4">
          <DialogTitle>Recomendar</DialogTitle>

          <div className="flex items-center gap-2">
            <span>Para:</span>
            <Input placeholder="Buscar..."></Input>
          </div>
        </DialogHeader>

        <div>
          <p>skeleton</p>
        </div>
      </>
    )
  }

  return (
    <>
      <DialogHeader className="space-y-4 border-b p-4">
        <DialogTitle>Recomendar</DialogTitle>

        <div className="flex items-center gap-2">
          <span>Para:</span>

          <div className="flex w-full flex-wrap items-center gap-1 rounded-lg border p-2">
            {profiles
              ?.filter((profile) => selectedProfilesIds.includes(profile.id))
              .map((profile) => {
                return (
                  <div
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-foreground px-3 py-0.5 text-background hover:bg-foreground/50"
                    key={profile.id}
                    onClick={() => handleSelection('remove', profile.id)}
                  >
                    <span className="text-xs">{profile.username}</span>
                    <X className="size-4" />
                  </div>
                )
              })}

            <input
              type="text"
              placeholder="buscar..."
              className="w-[20ch] border-none outline-none"
            />
          </div>
        </div>
      </DialogHeader>

      <div className="h-[500px] space-y-4 overflow-y-auto py-4">
        <h5 className="px-4 font-bold">Sugestões</h5>

        <div>
          {profiles?.map((profile) => {
            const checked = selectedProfilesIds.includes(profile.id)

            return (
              <div
                className="flex cursor-pointer items-center justify-between gap-4 px-4 py-2 hover:bg-muted"
                onClick={() =>
                  handleSelection(checked ? 'remove' : 'add', profile.id)
                }
                key={profile.id}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 text-xs">
                    {profile.image_path && (
                      <AvatarImage
                        src={tmdbImage(profile.image_path, 'w500')}
                        className="object-cover"
                      />
                    )}

                    <AvatarFallback className="border">
                      {profile.username[0]}
                    </AvatarFallback>
                  </Avatar>

                  <span>{profile.username}</span>
                </div>

                <Checkbox
                  onCheckedChange={(newChecked) =>
                    handleSelection(newChecked ? 'add' : 'remove', profile.id)
                  }
                  checked={checked}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t p-4">
        <input
          className="w-full border-none text-sm outline-none"
          placeholder="Escreva uma mensagem..."
        />

        <Button disabled={selectedProfilesIds.length === 0}>Recomendar</Button>
      </div>
    </>
  )
}
