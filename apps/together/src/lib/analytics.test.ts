import { afterEach, describe, expect, it, vi } from 'vitest'
import { track } from './analytics'

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void }

describe('track', () => {
  afterEach(() => {
    delete (window as GtagWindow).gtag
  })

  it('is a no-op when gtag is not loaded', () => {
    expect(() =>
      track('room_created', { providerCount: 2, region: 'BR' })
    ).not.toThrow()
  })

  it('forwards the event and its props to gtag', () => {
    const gtag = vi.fn()
    ;(window as GtagWindow).gtag = gtag

    track('invite_shared', { channel: 'whatsapp' })

    expect(gtag).toHaveBeenCalledWith('event', 'invite_shared', {
      channel: 'whatsapp',
    })
  })

  it('sends an empty params object for events without props', () => {
    const gtag = vi.fn()
    ;(window as GtagWindow).gtag = gtag

    track('plotwist_cta_clicked')

    expect(gtag).toHaveBeenCalledWith('event', 'plotwist_cta_clicked', {})
  })
})
