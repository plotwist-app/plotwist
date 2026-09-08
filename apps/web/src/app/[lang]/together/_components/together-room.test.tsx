import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TogetherRoom } from './together-room'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  roomState: null as {
    room: { maxParticipants: number }
    participants: { id: string; displayName: string }[]
    me: { id: string; displayName: string } | null
  } | null,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: mocks.roomState,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@/context/language', () => ({
  useLanguage: () => ({
    language: 'en-US',
    dictionary: {
      together: {
        someone: 'Someone',
        loading: 'Loading...',
        not_found: 'Not found',
        create_invite: 'Create invite',
        room_full_title: 'This room is full.',
        room_full_body: 'Ask the host to start a new room.',
      },
    },
  }),
}))

vi.mock('@/services/together', () => ({
  getTogetherRoom: vi.fn(),
  getTogetherToken: () => null,
}))

vi.mock('@/services/together-invite', () => ({
  buildTogetherInviteUrl: () => 'https://plotwist.app/together/ROOM',
}))

vi.mock('../../../../../constants', () => ({
  APP_URL: 'https://plotwist.app',
}))

vi.mock('./invite-screen', () => ({
  InviteScreen: ({
    participantCount,
    maxParticipants,
  }: {
    participantCount: number
    maxParticipants: number
  }) => <div>{`Invite ${participantCount}/${maxParticipants}`}</div>,
}))

vi.mock('./join-invite-form', () => ({
  JoinInviteForm: ({
    participantCount,
    maxParticipants,
  }: {
    participantCount: number
    maxParticipants: number
  }) => <div>{`Join form ${participantCount}/${maxParticipants}`}</div>,
}))

vi.mock('./waiting-room', () => ({
  WaitingRoom: ({
    names,
    maxParticipants,
  }: {
    names: string[]
    maxParticipants: number
  }) => <div>{`Waiting ${names.length}/${maxParticipants}`}</div>,
}))

vi.mock('./primary-button', () => ({
  PrimaryButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}))

vi.mock('./together-shell', () => ({
  TogetherShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

function participants(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `participant-${index + 1}`,
    displayName: `Person ${index + 1}`,
  }))
}

describe('TogetherRoom capacity', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it.each([
    2, 3,
  ])('keeps the join form available to a visitor when %i of 4 seats are filled', count => {
    mocks.roomState = {
      room: { maxParticipants: 4 },
      participants: participants(count),
      me: null,
    }

    render(<TogetherRoom code="room" />)

    expect(screen.getByText(`Join form ${count}/4`)).toBeTruthy()
    expect(screen.queryByText('This room is full.')).toBeNull()
  })

  it('shows a localized full-room state instead of the join form to a visitor', () => {
    mocks.roomState = {
      room: { maxParticipants: 4 },
      participants: participants(4),
      me: null,
    }

    render(<TogetherRoom code="room" />)

    expect(screen.getByText('This room is full.')).toBeTruthy()
    expect(screen.getByText('Ask the host to start a new room.')).toBeTruthy()
    expect(screen.queryByText(/Join form/)).toBeNull()
  })

  it('lets a valid member continue when the room is full', () => {
    const roomParticipants = participants(4)
    mocks.roomState = {
      room: { maxParticipants: 4 },
      participants: roomParticipants,
      me: roomParticipants[3],
    }

    render(<TogetherRoom code="room" />)

    expect(screen.getByText('Waiting 4/4')).toBeTruthy()
    expect(screen.queryByText('This room is full.')).toBeNull()
  })
})
