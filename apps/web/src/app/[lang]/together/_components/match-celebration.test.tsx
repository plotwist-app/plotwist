import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TogetherMatch } from '@/services/together'
import { MatchCelebration } from './match-celebration'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}))

vi.mock('@/components/poster-fallback', () => ({
  PosterFallback: ({ title }: { title: string }) => (
    <div role="img" aria-label={`No poster for ${title}`} />
  ),
}))

const match: TogetherMatch = {
  tmdbId: 603,
  mediaType: 'MOVIE',
  title: 'The Matrix',
  posterPath: '/matrix.jpg',
  voteAverage: 8.2,
  releaseDate: '1999-03-30',
  likeCount: 2,
  matchPercent: 100,
}

const copy = {
  heading: 'It’s a match',
  interestSummary: '{count} people are interested · {percent}% match',
  continueDiscovering: 'Continue discovering',
  viewMatches: 'View matches',
  close: 'Close match',
}

describe('MatchCelebration', () => {
  afterEach(cleanup)

  it('renders an accessible dialog with the match summary', () => {
    render(
      <MatchCelebration
        match={match}
        copy={copy}
        onContinue={vi.fn()}
        onViewMatches={vi.fn()}
      />
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeTruthy()
    expect(screen.getByRole('heading', { name: copy.heading })).toBeTruthy()
    expect(screen.getByText(match.title)).toBeTruthy()
    expect(
      screen.getByText('2 people are interested · 100% match')
    ).toBeTruthy()
    expect(
      screen.getByRole('img', { name: match.title }).getAttribute('src')
    ).toContain('/matrix.jpg')
    expect(screen.getByRole('button', { name: copy.close })).toBeTruthy()
    expect(dialog.className).toContain('[&>button]:text-[#f7f3ea]')
    expect(dialog.className).toContain('[&>button]:focus:ring-[#ff8b84]')
    expect(dialog.className).toContain('[&>button]:focus:ring-offset-[#0b0b09]')
  })

  it('includes maybe votes in a polled match interest summary', () => {
    render(
      <MatchCelebration
        match={{ ...match, maybeCount: 1 }}
        copy={copy}
        onContinue={vi.fn()}
        onViewMatches={vi.fn()}
      />
    )

    expect(
      screen.getByText('3 people are interested · 100% match')
    ).toBeTruthy()
  })

  it('renders the poster fallback when the match has no poster', () => {
    render(
      <MatchCelebration
        match={{ ...match, posterPath: null }}
        copy={copy}
        onContinue={vi.fn()}
        onViewMatches={vi.fn()}
      />
    )

    expect(
      screen.getByRole('img', { name: `No poster for ${match.title}` })
    ).toBeTruthy()
    expect(screen.queryByRole('img', { name: match.title })).toBeNull()
  })

  it('continues without viewing matches', () => {
    const onContinue = vi.fn()
    const onViewMatches = vi.fn()
    render(
      <MatchCelebration
        match={match}
        copy={copy}
        onContinue={onContinue}
        onViewMatches={onViewMatches}
      />
    )

    fireEvent.click(
      screen.getByRole('button', { name: copy.continueDiscovering })
    )

    expect(onContinue).toHaveBeenCalledOnce()
    expect(onViewMatches).not.toHaveBeenCalled()
  })

  it('opens the matches action without continuing', () => {
    const onContinue = vi.fn()
    const onViewMatches = vi.fn()
    render(
      <MatchCelebration
        match={match}
        copy={copy}
        onContinue={onContinue}
        onViewMatches={onViewMatches}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: copy.viewMatches }))

    expect(onViewMatches).toHaveBeenCalledOnce()
    expect(onContinue).not.toHaveBeenCalled()
  })

  it('traps keyboard focus and dismisses on Escape', async () => {
    const onContinue = vi.fn()
    render(
      <MatchCelebration
        match={match}
        copy={copy}
        onContinue={onContinue}
        onViewMatches={vi.fn()}
      />
    )

    const dialog = screen.getByRole('dialog')
    const viewMatches = screen.getByRole('button', {
      name: copy.viewMatches,
    })
    const close = screen.getByRole('button', { name: copy.close })

    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true)
    )

    close.focus()
    fireEvent.keyDown(close, { key: 'Tab', code: 'Tab' })
    expect(document.activeElement).toBe(viewMatches)

    fireEvent.keyDown(document.activeElement ?? document, {
      key: 'Escape',
      code: 'Escape',
    })
    expect(onContinue).toHaveBeenCalledOnce()
  })
})
