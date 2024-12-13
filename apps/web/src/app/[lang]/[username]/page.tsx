'use client'

import type { GetUserActivities200UserActivitiesItem } from '@/api/endpoints.schemas'
import { useLayoutContext } from './_context'
import { useGetUserActivities } from '@/api/user-activities'
import { Avatar, AvatarImage } from '@plotwist/ui/components/ui/avatar'

type ActivityType = GetUserActivities200UserActivitiesItem['activityType']

export default function ActivityPage() {
  const { userId, avatarUrl } = useLayoutContext()
  const { data } = useGetUserActivities(userId)

  return (
    <div className="space-y-2">
      {data?.userActivities.map(({ activityType, id }) => {
        // renderizar o comp de acordo com o tipo correto
        const label: Record<ActivityType, string> = {
          ADD_ITEM: 'Adicionou ${item} à ${list}',
          CHANGE_STATUS: 'Marcou ${item} como ${status}',
          CREATE_LIST: 'Criou ${list}',
          CREATE_REPLY: 'Respondeu ${reply}',
          CREATE_REVIEW: 'Avaliou ${review}',
          DELETE_ITEM: 'Exclui ${item} de ${list}',
          DELETE_LIST: 'Excluir ${list}',
          FOLLOW_USER: 'Seguiu ${user}',
          LIKE_REPLY: 'Curtiu ${reply}',
          LIKE_REVIEW: 'Curtiu ${review}',
          UNFOLLOW_USER: 'Deixou de seguir ${user}',
          WATCH_EPISODE: 'Assistiu ${episodes.length} episódios',
        }

        return (
          <div key={id} className="flex gap-2">
            <Avatar className="size-8 border text-[10px] shadow">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} className="object-cover" />
              )}
            </Avatar>

            {label[activityType]}
          </div>
        )
      })}
    </div>
  )
}
