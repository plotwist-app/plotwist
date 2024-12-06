import type { GetUserIdWatchedCountries200WatchedCountriesItem } from '@/api/endpoints.schemas'
import { cn } from '@/lib/utils'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import geography from './features.json'

type MapChartProps = {
  setTooltipContent: (content: string) => void
  data: GetUserIdWatchedCountries200WatchedCountriesItem[]
}

export function MapChart({ setTooltipContent, data }: MapChartProps) {
  const highlightedCountry = data[0]?.name

  return (
    <div id="map" className="w-full h-full">
      <ComposableMap>
        <ZoomableGroup>
          <Geographies geography={geography}>
            {({ geographies }) =>
              geographies.map(geo => {
                const name = geo.properties.name
                const isHighlighted = name === highlightedCountry
                const count =
                  data.find(country => country.name === name)?.count || 0

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className={cn(
                      'hover:!fill-muted-foreground hover:opacity-100 hover:border-dashed relative fill-muted-foreground/50 dark:fill-muted',

                      isHighlighted && 'fill-foreground',
                      count && !isHighlighted && 'fill-muted-foreground'
                    )}
                    style={{
                      default: {
                        outline: 'none',
                      },
                      pressed: {
                        outline: 'none',
                      },
                      hover: {
                        outline: 'none',
                      },
                    }}
                    onMouseEnter={() => {
                      setTooltipContent(`${geo.properties.name}: ${count}`)
                    }}
                    onMouseLeave={() => {
                      setTooltipContent('')
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
