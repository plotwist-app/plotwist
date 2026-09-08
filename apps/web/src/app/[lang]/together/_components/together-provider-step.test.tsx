import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TogetherProviderStep } from './together-provider-step'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  regions: vi.fn(),
}))

vi.mock('@/context/language', () => ({
  useLanguage: () => ({
    language: 'en-US',
    dictionary: {
      together: {
        provider_heading: 'Where do you watch?',
        provider_explanation: 'Choose every service you can use.',
        provider_region: 'Region',
        provider_any: 'Any service',
        provider_loading: 'Finding services...',
        provider_error: 'Could not load services.',
        provider_retry: 'Try again',
        provider_continue: 'Continue',
        provider_selected: 'Selected',
      },
    },
  }),
}))

vi.mock('@/services/tmdb', () => ({
  tmdb: {
    watchProviders: {
      list: mocks.list,
      regions: mocks.regions,
    },
  },
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

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

const providers = [
  {
    provider_id: 8,
    provider_name: 'Netflix',
    logo_path: '/netflix.jpg',
    display_priority: 1,
    display_priorities: {},
  },
  {
    provider_id: 337,
    provider_name: 'Disney Plus',
    logo_path: '/disney.jpg',
    display_priority: 2,
    display_priorities: {},
  },
]

describe('TogetherProviderStep', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows loading, then renders region and keyboard-operable provider toggles', async () => {
    mocks.regions.mockResolvedValue([
      {
        iso_3166_1: 'BR',
        english_name: 'Brazil',
        native_name: 'Brasil',
      },
    ])
    mocks.list.mockResolvedValue(providers)
    const onRegionChange = vi.fn()
    const onProviderIdsChange = vi.fn()

    render(
      <TogetherProviderStep
        region="BR"
        providerIds={[]}
        onRegionChange={onRegionChange}
        onProviderIdsChange={onProviderIdsChange}
        onContinue={vi.fn()}
      />,
      { wrapper: wrapper() }
    )

    expect(screen.getByText('Finding services...')).toBeTruthy()
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('heading', { name: 'Where do you watch?' })
      )
    )

    const netflix = await screen.findByRole('button', { name: 'Netflix' })
    expect(netflix.tagName).toBe('BUTTON')
    expect(netflix.tabIndex).toBe(0)
    expect(netflix.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(netflix)
    expect(onProviderIdsChange).toHaveBeenCalledWith([8])
    expect(mocks.list).toHaveBeenCalledWith('movie', {
      language: 'en-US',
      watch_region: 'BR',
    })
  })

  it('marks saved providers selected and exposes Any service to clear them', async () => {
    mocks.regions.mockResolvedValue([])
    mocks.list.mockResolvedValue(providers)
    const onProviderIdsChange = vi.fn()

    render(
      <TogetherProviderStep
        region="BR"
        providerIds={[8, 337]}
        onRegionChange={vi.fn()}
        onProviderIdsChange={onProviderIdsChange}
        onContinue={vi.fn()}
      />,
      { wrapper: wrapper() }
    )

    const netflix = await screen.findByRole('button', {
      name: 'Netflix Selected',
    })
    expect(netflix.getAttribute('aria-pressed')).toBe('true')
    expect(netflix.querySelector('svg')).toBeTruthy()
    const anyService = screen.getByRole('button', { name: 'Any service' })
    expect(anyService.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(anyService)
    expect(onProviderIdsChange).toHaveBeenCalledWith([])
  })

  it('clears saved providers only after the host changes region', async () => {
    mocks.regions.mockResolvedValue([
      {
        iso_3166_1: 'BR',
        english_name: 'Brazil',
        native_name: 'Brasil',
      },
      {
        iso_3166_1: 'US',
        english_name: 'United States',
        native_name: 'United States',
      },
    ])
    mocks.list.mockResolvedValue(providers)
    const onRegionChange = vi.fn()
    const onProviderIdsChange = vi.fn()

    render(
      <TogetherProviderStep
        region="BR"
        providerIds={[8]}
        onRegionChange={onRegionChange}
        onProviderIdsChange={onProviderIdsChange}
        onContinue={vi.fn()}
      />,
      { wrapper: wrapper() }
    )

    await screen.findByRole('button', { name: 'Netflix' })
    expect(onProviderIdsChange).not.toHaveBeenCalled()

    fireEvent.change(screen.getByRole('combobox', { name: 'Region' }), {
      target: { value: 'US' },
    })

    expect(onRegionChange).toHaveBeenCalledWith('US')
    expect(onProviderIdsChange).toHaveBeenCalledWith([])
  })

  it('keeps retry, Any service, and Continue available after loading fails', async () => {
    mocks.regions.mockResolvedValue([])
    mocks.list.mockRejectedValue(new Error('offline'))
    const onProviderIdsChange = vi.fn()
    const onContinue = vi.fn()

    render(
      <TogetherProviderStep
        region="BR"
        providerIds={[8]}
        onRegionChange={vi.fn()}
        onProviderIdsChange={onProviderIdsChange}
        onContinue={onContinue}
      />,
      { wrapper: wrapper() }
    )

    expect(await screen.findByText('Could not load services.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Any service' }))
    expect(onProviderIdsChange).toHaveBeenCalledWith([])

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('continues with no providers when Any service is selected', async () => {
    mocks.regions.mockResolvedValue([])
    mocks.list.mockResolvedValue(providers)
    const onContinue = vi.fn()

    render(
      <TogetherProviderStep
        region="BR"
        providerIds={[]}
        onRegionChange={vi.fn()}
        onProviderIdsChange={vi.fn()}
        onContinue={onContinue}
      />,
      { wrapper: wrapper() }
    )

    await screen.findByRole('button', { name: 'Netflix' })
    expect(
      screen
        .getByRole('button', { name: 'Any service Selected' })
        .getAttribute('aria-pressed')
    ).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onContinue).toHaveBeenCalledOnce()
  })
})
