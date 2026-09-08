import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TogetherRoomState } from '@/services/together'
import { TogetherRoom } from './together-room'

const mocks = vi.hoisted(() => ({
  getRoom: vi.fn(),
  push: vi.fn(),
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

vi.mock('@/services/together', async importOriginal => {
  const original = await importOriginal<typeof import('@/services/together')>()
  return {
    ...original,
    getTogetherRoom: mocks.getRoom,
    getTogetherToken: () => 'member-token',
  }
})

vi.mock('@/services/together-invite', () => ({
  buildTogetherInviteUrl: () => 'https://plotwist.app/together/ROOM',
}))

vi.mock('../../../../../constants', () => ({
  APP_URL: 'https://plotwist.app',
}))

vi.mock('./invite-screen', () => ({
  InviteScreen: () => <div>Invite screen</div>,
}))

vi.mock('./join-invite-form', () => ({
  JoinInviteForm: () => <div>Join form</div>,
}))

vi.mock('./waiting-room', () => ({
  WaitingRoom: () => <div>Member waiting room</div>,
}))

vi.mock('./primary-button', () => ({
  PrimaryButton: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
}))

vi.mock('./together-mark', () => ({
  TogetherMark: () => <div>Together</div>,
}))

vi.mock('./together-shell', () => ({
  TogetherShell: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(promiseResolve => {
    resolve = promiseResolve
  })
  return { promise, resolve }
}

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('TogetherRoom token hydration', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('waits for a stored token before loading a full room for a valid member', async () => {
    const memberRoom = deferred<TogetherRoomState>()
    mocks.getRoom.mockImplementation(
      (_code: string, token: string | null | undefined) => {
        if (token === 'member-token') return memberRoom.promise

        return Promise.resolve({
          room: { maxParticipants: 20 },
          participants: Array.from({ length: 20 }, (_, index) => ({
            id: `participant-${index + 1}`,
            displayName: `Person ${index + 1}`,
          })),
          me: null,
        })
      }
    )

    render(<TogetherRoom code="room" />, { wrapper: wrapper() })

    await waitFor(() => expect(mocks.getRoom).toHaveBeenCalled())
    expect(mocks.getRoom).toHaveBeenCalledTimes(1)
    expect(mocks.getRoom).toHaveBeenCalledWith('ROOM', 'member-token')
    expect(screen.getByText('Loading...')).toBeTruthy()
    expect(screen.queryByText('This room is full.')).toBeNull()

    const participants = Array.from({ length: 20 }, (_, index) => ({
      id: `participant-${index + 1}`,
      displayName: `Person ${index + 1}`,
    }))
    memberRoom.resolve({
      room: {
        id: 'room-id',
        code: 'ROOM',
        watchProviderIds: [],
        watchRegion: 'BR',
        maxRuntime: null,
        mood: 'ANY',
        maxParticipants: 20,
        createdAt: '2026-09-08T00:00:00.000Z',
      },
      participants,
      me: participants[19],
      swipedIds: [],
    })

    expect(await screen.findByText('Member waiting room')).toBeTruthy()
    expect(screen.queryByText('This room is full.')).toBeNull()
  })
})
