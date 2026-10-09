import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateInviteForm } from './create-invite-form'

const mocks = vi.hoisted(() => ({
  createTogetherRoom: vi.fn(),
  push: vi.fn(),
  setTogetherToken: vi.fn(),
  track: vi.fn(),
  language: 'pt-BR',
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('@/context/language', () => ({
  useLanguage: () => ({
    language: mocks.language,
    dictionary: {
      together: {
        your_name: 'Your name',
        your_name_placeholder: 'Name',
        create_invite: 'Start the night',
        creating: 'Preparing...',
        create_error: 'Could not create.',
        back: 'Back',
        create_heading: 'Create your invite',
      },
    },
  }),
}))

vi.mock('@/lib/analytics', () => ({
  track: mocks.track,
}))

vi.mock('@/services/together', () => ({
  createTogetherRoom: mocks.createTogetherRoom,
  setTogetherToken: mocks.setTogetherToken,
}))

vi.mock('./together-provider-step', () => ({
  TogetherProviderStep: ({
    region,
    providerIds,
    onRegionChange,
    onProviderIdsChange,
    onContinue,
    focusHeading,
  }: {
    region: string
    providerIds: number[]
    onRegionChange: (region: string) => void
    onProviderIdsChange: (providerIds: number[]) => void
    onContinue: () => void
    focusHeading?: boolean
  }) => (
    <div>
      <output aria-label="Selected region">{region}</output>
      <output aria-label="Selected providers">{providerIds.join('|')}</output>
      <output aria-label="Focus provider heading">
        {String(Boolean(focusHeading))}
      </output>
      <button
        type="button"
        onClick={() => {
          onRegionChange('BR')
          onProviderIdsChange([8, 337])
        }}
      >
        Select services
      </button>
      <button type="button" onClick={onContinue}>
        Continue
      </button>
    </div>
  ),
}))

describe('CreateInviteForm provider flow', () => {
  beforeEach(() => {
    mocks.language = 'pt-BR'
    mocks.createTogetherRoom.mockResolvedValue({
      room: { code: 'ABC123' },
      participantToken: 'host-token',
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders provider setup before the name step and creates with its values', async () => {
    render(<CreateInviteForm />)

    expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy()
    expect(screen.queryByLabelText('Your name')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Select services' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: ' Ana ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start the night' }))

    await waitFor(() =>
      expect(mocks.createTogetherRoom).toHaveBeenCalledWith({
        displayName: 'Ana',
        watchProviderIds: [8, 337],
        watchRegion: 'BR',
      })
    )
    expect(mocks.setTogetherToken).toHaveBeenCalledWith('ABC123', 'host-token')
    expect(mocks.push).toHaveBeenCalledWith('/pt-BR/ABC123')
    expect(mocks.track).toHaveBeenCalledWith('room_created', {
      providerCount: 2,
      region: 'BR',
    })
  })

  it('starts with the region of a Brazilian host and Any service', () => {
    render(<CreateInviteForm />)

    expect(screen.getByLabelText('Selected region').textContent).toBe('BR')
    expect(screen.getByLabelText('Selected providers').textContent).toBe('')
  })

  it('derives the default region from the page locale', () => {
    mocks.language = 'ja-JP'

    render(<CreateInviteForm />)

    expect(screen.getByLabelText('Selected region').textContent).toBe('JP')
  })

  it('focuses the name heading, then requests provider focus on Back', async () => {
    render(<CreateInviteForm />)

    expect(screen.getByLabelText('Focus provider heading').textContent).toBe(
      'false'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    const heading = screen.getByRole('heading', {
      name: 'Create your invite',
    })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(document.activeElement).not.toBe(screen.getByLabelText('Your name'))

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByLabelText('Focus provider heading').textContent).toBe(
      'true'
    )
  })

  it('keeps provider form state after room creation fails', async () => {
    mocks.createTogetherRoom.mockRejectedValueOnce(new Error('offline'))
    render(<CreateInviteForm />)

    fireEvent.click(screen.getByRole('button', { name: 'Select services' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: 'Ana' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start the night' }))
    await waitFor(() => expect(mocks.createTogetherRoom).toHaveBeenCalledOnce())

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByLabelText('Selected region').textContent).toBe('BR')
    expect(screen.getByLabelText('Selected providers').textContent).toBe(
      '8|337'
    )
  })
})
