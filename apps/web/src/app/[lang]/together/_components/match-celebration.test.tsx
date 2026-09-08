import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TogetherMatch } from '@/services/together'
import { MatchCelebration } from './match-celebration'

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
}

describe('MatchCelebration', () => {
  it('renders an accessible dialog with the match summary', () => {
    render(
      <MatchCelebration
        match={match}
        copy={copy}
        onContinue={vi.fn()}
        onViewMatches={vi.fn()}
      />
    )

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByRole('heading', { name: copy.heading })).toBeTruthy()
    expect(screen.getByText(match.title)).toBeTruthy()
    expect(
      screen.getByText('2 people are interested · 100% match')
    ).toBeTruthy()
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
})
