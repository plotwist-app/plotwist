import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PopularReviews } from '../popular-reviews'

import * as reviewsService from '@/services/api/reviews'
import type { FullReview } from '@/services/api/reviews'

vi.mock('@supabase/supabase-js')
vi.mock('@/context/language', () => {
  return {
    useLanguage: () => {
      return {
        language: 'en-US',
        dictionary: {
          last_week: 'Last week',
          last_month: 'Last month',
          all_time: 'All time',
          popular_reviews: {
            title: 'Popular reviews',
            no_reviews_found: "We didn't find any reviews.",
            explore_popular_movies:
              'Explore popular movies, and give us your opinion.',
          },
        },
      }
    },
  }
})

describe('PopularReviews component tests', () => {
  it('should render popular reviews date range options', async () => {
    vi.spyOn(reviewsService, 'getPopularReviewsService').mockResolvedValue([])

    render(
      <QueryClientProvider client={new QueryClient()}>
        <PopularReviews />
      </QueryClientProvider>,
    )

    const dateFilterBadges = await screen.findByTestId('date-filter-badges')

    expect(within(dateFilterBadges).getByText(/last week/i)).toBeTruthy()
    expect(within(dateFilterBadges).getByText(/last month/i)).toBeTruthy()
    expect(within(dateFilterBadges).getByText(/all time/i)).toBeTruthy()
  })

  it('should render popular reviews list', async () => {
    vi.spyOn(reviewsService, 'getPopularReviewsService').mockResolvedValue([
      {
        id: '1',
        created_at: '2024-05-19T21:38:31.980978+00:00',
        user_id: '1',
        tmdb_id: 598,
        media_type: 'MOVIE',
        review: 'Fake review',
        rating: 0,
        tmdb_title: 'City of God',
        tmdb_poster_path: '/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg',
        tmdb_overview:
          "In the slums of Rio, two kids' paths diverge as one struggles to become a photographer and the other a kingpin.",
        language: 'en-US',
        likes_count: 0,
        user: {
          id: '1',
          username: 'Fake user',
          image_path: '/vHgf8NE7tXV4DJPEnqVLZDof8fT.jpg',
        },
      },
      {
        id: '2',
        created_at: '2024-05-19T21:33:50.17581+00:00',
        user_id: '1',
        tmdb_id: 2734,
        media_type: 'TV_SHOW',
        review: 'Test!\n',
        rating: 5,
        tmdb_title: 'Law & Order: Special Victims Unit',
        tmdb_poster_path: '/onmSVwYsPMYtO8OjLdjS8FfRNKb.jpg',
        tmdb_overview:
          'In the criminal justice system, sexually-based offenses are considered especially heinous. In New York City, the dedicated detectives who investigate these vicious felonies are members of an elite squad known as the Special Victims Unit. These are their stories.',
        language: 'en-US',
        likes_count: 0,
        user: {
          id: '1',
          username: 'Fake user',
          image_path: '/vHgf8NE7tXV4DJPEnqVLZDof8fT.jpg',
        },
      },
    ] as FullReview[])

    render(
      <QueryClientProvider client={new QueryClient()}>
        <PopularReviews />
      </QueryClientProvider>,
    )

    const fullReviewComponents = await screen.findAllByTestId('full-review')

    expect(fullReviewComponents).toHaveLength(2)
  })

  it('should render an empty state when no reviews are found', () => {
    vi.spyOn(reviewsService, 'getPopularReviewsService').mockResolvedValue([])

    render(
      <QueryClientProvider client={new QueryClient()}>
        <PopularReviews />,
      </QueryClientProvider>,
    )

    expect(screen.getByText(/we didn't find any reviews\./i)).toBeTruthy()
    expect(
      screen.getByText(/explore popular movies, and give us your opinion./i),
    ).toBeTruthy()
  })
})
