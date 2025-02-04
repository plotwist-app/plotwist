'use client'

import type { Season } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { Poster } from '@/components/poster'

import { Link } from 'next-view-transitions'
import { useState } from 'react'
import { Button } from '@plotwist/ui/components/ui/button'
import { Eye, Grid } from 'lucide-react'
import { TvSerieSeasonsOverview } from './tv-serie-seasons-overview'

type TvSerieSeasonsProps = {
  seasons: Season[]
  id: number
  language: Language
}

export const TvSerieSeasons = ({
  seasons,
  language,
  id,
}: TvSerieSeasonsProps) => {
  const [variant, setVariant] = useState<'grid' | 'overview'>('grid')

  const filteredSeasons = seasons.filter(
    season => season.season_number !== 0 && season.episode_count > 0
  )

  const renderContent = () => {
    if (variant === 'grid') {
      return (
        <div className="grid grid-cols-3 gap-4 md:grid-cols-5 items-start">
          {filteredSeasons.map(
            ({ poster_path: poster, name, season_number: seasonNumber }) => (
              <Link
                href={`/${language}/tv-series/${id}/seasons/${seasonNumber}`}
                key={seasonNumber}
              >
                <Poster url={poster} alt={name} />
              </Link>
            )
          )}
        </div>
      )
    }

    return <TvSerieSeasonsOverview seasons={filteredSeasons} />
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          variant={variant === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVariant('grid')}
        >
          <Grid className="size-4 mr-2" />
          Grid
        </Button>

        <Button
          variant={variant === 'overview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVariant('overview')}
        >
          <Eye className="size-4 mr-2" />
          Visão geral
        </Button>
      </div>

      {renderContent()}
    </div>
  )
}
