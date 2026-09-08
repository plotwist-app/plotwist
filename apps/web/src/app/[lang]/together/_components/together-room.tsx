'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/language'
import { getTogetherRoom, getTogetherToken } from '@/services/together'
import { buildTogetherInviteUrl } from '@/services/together-invite'
import { APP_URL } from '../../../../../constants'
import { InviteScreen } from './invite-screen'
import { JoinInviteForm } from './join-invite-form'
import { PrimaryButton } from './primary-button'
import { TogetherMark } from './together-mark'
import { TogetherShell } from './together-shell'
import { WaitingRoom } from './waiting-room'

const HOST_CONTINUED_KEY = (code: string) =>
  `plotwist.together.continued.${code}`

export function TogetherRoom({ code }: { code: string }) {
  const { dictionary, language } = useLanguage()
  const copy = dictionary.together
  const router = useRouter()
  const roomCode = code.toUpperCase()
  const [token, setToken] = useState<string | null>(null)
  const [continued, setContinued] = useState(false)

  useEffect(() => {
    setToken(getTogetherToken(roomCode))
    setContinued(sessionStorage.getItem(HOST_CONTINUED_KEY(roomCode)) === '1')
  }, [roomCode])

  const inviteUrl = buildTogetherInviteUrl(APP_URL, roomCode)

  const roomQuery = useQuery({
    queryKey: ['together-room', roomCode, token],
    queryFn: () => getTogetherRoom(roomCode, token),
    refetchInterval: 3000,
  })

  const room = roomQuery.data
  const hostName = room?.participants[0]?.displayName ?? copy.someone
  const isMember = Boolean(room?.me)
  const ready = (room?.participants.length ?? 0) >= 2
  const isFull = room
    ? room.participants.length >= room.room.maxParticipants
    : false

  function continueAsHost() {
    sessionStorage.setItem(HOST_CONTINUED_KEY(roomCode), '1')
    setContinued(true)
  }

  if (roomQuery.isLoading && !room) {
    return (
      <TogetherShell>
        <p className="together-body together-fg-muted py-20 text-center">
          {copy.loading}
        </p>
      </TogetherShell>
    )
  }

  if (roomQuery.isError || !room) {
    return (
      <TogetherShell>
        <h1 className="together-display">{copy.not_found}</h1>
        <PrimaryButton
          className="mt-8"
          onClick={() => router.push(`/${language}/together`)}
        >
          {copy.create_invite}
        </PrimaryButton>
      </TogetherShell>
    )
  }

  if (!isMember) {
    if (isFull) {
      return (
        <TogetherShell>
          <TogetherMark />
          <h1 className="together-display mt-8">{copy.room_full_title}</h1>
          <p className="together-body together-fg-muted mt-3">
            {copy.room_full_body}
          </p>
        </TogetherShell>
      )
    }

    return (
      <TogetherShell>
        <JoinInviteForm
          code={roomCode}
          hostName={hostName}
          participantCount={room.participants.length}
          maxParticipants={room.room.maxParticipants}
          onJoined={() => {
            setToken(getTogetherToken(roomCode))
            void roomQuery.refetch()
          }}
        />
      </TogetherShell>
    )
  }

  if (!continued && !ready) {
    return (
      <InviteScreen
        hostName={room.me?.displayName ?? hostName}
        inviteCode={roomCode}
        inviteUrl={inviteUrl}
        participantCount={room.participants.length}
        maxParticipants={room.room.maxParticipants}
        copy={copy}
        onContinue={continueAsHost}
      />
    )
  }

  return (
    <WaitingRoom
      names={room.participants.map(participant => participant.displayName)}
      participantIds={room.participants.map(participant => participant.id)}
      meId={room.me?.id}
      ready={ready}
      maxParticipants={room.room.maxParticipants}
      copy={copy}
      onStart={() => router.push(`/${language}/together/${roomCode}/vote`)}
    />
  )
}
