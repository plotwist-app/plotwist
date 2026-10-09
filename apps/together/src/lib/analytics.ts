import type { TogetherDecision } from '@/services/together'

type AnalyticsEvents = {
  room_created: { providerCount: number; region: string }
  invite_shared: { channel: 'whatsapp' | 'copy' }
  room_joined: undefined
  voting_started: undefined
  swipe: { decision: TogetherDecision }
  match_shown: undefined
  plotwist_cta_clicked: undefined
}

export type AnalyticsEvent = keyof AnalyticsEvents

type TrackArgs<E extends AnalyticsEvent> = AnalyticsEvents[E] extends undefined
  ? [event: E]
  : [event: E, props: AnalyticsEvents[E]]

type Gtag = (command: 'event', event: string, params: object) => void

export function track<E extends AnalyticsEvent>(
  ...[event, props]: TrackArgs<E>
) {
  if (typeof window === 'undefined') return

  const gtag = (window as Window & { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return

  gtag('event', event, props ?? {})
}
