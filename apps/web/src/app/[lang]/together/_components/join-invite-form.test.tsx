import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/services/api-client'
import { JoinInviteForm } from './join-invite-form'

const mocks = vi.hoisted(() => ({
  error: vi.fn(),
  joinRoom: vi.fn(),
  push: vi.fn(),
  setToken: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('sonner', () => ({
  toast: { error: mocks.error },
}))

vi.mock('@/context/language', () => ({
  useLanguage: () => ({
    language: 'en-US',
    dictionary: {
      together: {
        group_kicker: 'A night together',
        join_title: '{name} invited you.',
        have_invite_title: 'Join the night',
        join_subtitle: 'Enter your name.',
        participant_count: 'In the group: {current}',
        invite_code_label: 'Invite code',
        invite_code_placeholder: 'ABC123',
        your_name: 'Your name',
        your_name_placeholder: 'Name',
        joining: 'Joining...',
        join: 'Join',
        join_error: 'Could not join this invite.',
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
    joinTogetherRoom: mocks.joinRoom,
    setTogetherToken: mocks.setToken,
  }
})

function submitJoin() {
  fireEvent.change(screen.getByLabelText('Your name'), {
    target: { value: 'Ana' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Join' }))
}

describe('JoinInviteForm capacity errors', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders localized full-room feedback and notifies the parent', async () => {
    mocks.joinRoom.mockRejectedValue(
      new ApiError(
        'Request failed with status 400',
        400,
        { message: 'Room is full.' },
        new Headers()
      )
    )
    const onRoomFull = vi.fn()

    render(
      <JoinInviteForm
        code="ABC123"
        hostName="Host"
        participantCount={3}
        onRoomFull={onRoomFull}
      />
    )
    submitJoin()

    expect(await screen.findByText('This room is full.')).toBeTruthy()
    expect(screen.getByText('Ask the host to start a new room.')).toBeTruthy()
    expect(onRoomFull).toHaveBeenCalledOnce()
    expect(mocks.error).not.toHaveBeenCalled()
  })

  it('preserves generic handling for other API failures', async () => {
    mocks.joinRoom.mockRejectedValue(
      new ApiError(
        'Request failed with status 400',
        400,
        { message: 'Display name is required.' },
        new Headers()
      )
    )

    render(
      <JoinInviteForm code="ABC123" hostName="Host" participantCount={3} />
    )
    submitJoin()

    await waitFor(() =>
      expect(mocks.error).toHaveBeenCalledWith('Could not join this invite.')
    )
    expect(screen.queryByText('This room is full.')).toBeNull()
  })

  it('does not treat malformed error data as a capacity response', async () => {
    mocks.joinRoom.mockRejectedValue(
      new ApiError('Request failed with status 400', 400, null, new Headers())
    )

    render(<JoinInviteForm code="ABC123" hostName="Host" />)
    submitJoin()

    await waitFor(() =>
      expect(mocks.error).toHaveBeenCalledWith('Could not join this invite.')
    )
    expect(screen.queryByText('This room is full.')).toBeNull()
  })

  it('shows the current participant count without advertising a maximum', () => {
    render(
      <JoinInviteForm code="ABC123" hostName="Host" participantCount={19} />
    )

    expect(screen.getByText('In the group: 19')).toBeTruthy()
    expect(screen.queryByText(/\/ 20|up to|maximum/i)).toBeNull()
  })

  it('requires the stable capacity status as well as its payload', async () => {
    mocks.joinRoom.mockRejectedValue(
      new ApiError(
        'Request failed with status 409',
        409,
        { message: 'Room is full.' },
        new Headers()
      )
    )

    render(<JoinInviteForm code="ABC123" hostName="Host" />)
    submitJoin()

    await waitFor(() =>
      expect(mocks.error).toHaveBeenCalledWith('Could not join this invite.')
    )
    expect(screen.queryByText('This room is full.')).toBeNull()
  })
})
