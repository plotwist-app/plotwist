import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { WatchProviderItem, WatchProviders, WatchProvidersProps } from '.'

const PROPS: WatchProvidersProps = {
  id: 767,
  variant: 'movie',
  language: 'en-US',
}

describe('WatchProviders', () => {
  afterEach(() => cleanup())

  it('should be able to render WatchProviders dropdown server component', async () => {
    render(await WatchProviders(PROPS))

    const trigger = screen.getByTestId('watch-providers-trigger')
    expect(trigger).toBeTruthy()
  })

  it('should be able to render WatchProviders providers sections', async () => {
    render(await WatchProviders({ ...PROPS, defaultOpen: true }))

    expect(screen.getByText('Stream')).toBeTruthy()
    expect(screen.getByText('Rent')).toBeTruthy()
    expect(screen.getByText('Buy')).toBeTruthy()
  })

  it('should be able to render WatchProvidersItem', async () => {
    const watchProviderItem = {
      logo_path: '/rugttVJKzDAwVbM99gAV6i3g59Q.jpg',
      provider_id: 257,
      provider_name: 'fuboTV',
      display_priority: 7,
    }

    render(<WatchProviderItem item={watchProviderItem} />)
    expect(watchProviderItem.provider_name).toBeTruthy()
  })
})
