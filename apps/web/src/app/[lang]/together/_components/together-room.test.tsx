import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TogetherRoom } from './together-room'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refetch: vi.fn(),
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
    refetch: mocks.refetch,
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
  }: {
    participantCount: number
  }) => <div>{`Invite ${participantCount}`}</div>,
}))

vi.mock('./join-invite-form', () => ({
  JoinInviteForm: ({
    participantCount,
    onRoomFull,
  }: {
    participantCount: number
    onRoomFull?: () => void
  }) => (
    <div>
      {`Join form ${participantCount}`}
      <button type="button" onClick={onRoomFull}>
        Simulate full error
      </button>
    </div>
  ),
}))

vi.mock('./waiting-room', () => ({
  WaitingRoom: ({
    names,
    isFull,
  }: {
    names: string[]
    isFull: boolean
  }) => <div>{`Waiting ${names.length} ${isFull ? 'full' : 'open'}`}</div>,
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

  it.each([2, 19])(
    'keeps the join form available to a visitor when %i participants have joined',
    count => {
    mocks.roomState = {
      room: { maxParticipants: 20 },
      participants: participants(count),
      me: null,
    }

    render(<TogetherRoom code="room" />)

    expect(screen.getByText(`Join form ${count}`)).toBeTruthy()
    expect(screen.queryByText('This room is full.')).toBeNull()
    }
  )

  it('shows a localized full-room state instead of the join form to a visitor', () => {
    mocks.roomState = {
      room: { maxParticipants: 20 },
      participants: participants(20),
      me: null,
    }

    render(<TogetherRoom code="room" />)

    expect(screen.getByText('This room is full.')).toBeTruthy()
    expect(screen.getByText('Ask the host to start a new room.')).toBeTruthy()
    expect(screen.queryByText(/Join form/)).toBeNull()
  })

  it('refetches room state when a concurrent join reports full capacity', () => {
    mocks.roomState = {
      room: { maxParticipants: 20 },
      participants: participants(19),
      me: null,
    }

    render(<TogetherRoom code="room" />)
    fireEvent.click(screen.getByRole('button', { name: 'Simulate full error' }))

    expect(mocks.refetch).toHaveBeenCalledOnce()
  })

  it('lets a valid member continue when the room is full', () => {
    const roomParticipants = participants(20)
    mocks.roomState = {
      room: { maxParticipants: 20 },
      participants: roomParticipants,
      me: roomParticipants[3],
    }

    render(<TogetherRoom code="room" />)

    expect(screen.getByText('Waiting 20 full')).toBeTruthy()
    expect(screen.queryByText('This room is full.')).toBeNull()
  })
})
