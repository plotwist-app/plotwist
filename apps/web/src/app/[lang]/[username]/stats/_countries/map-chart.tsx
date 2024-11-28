import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import geography from './features.json'
import { cn } from '@/lib/utils'

const filmDistribution = {
  'United States': 100,
  Brazil: 50,
  Russia: 50,
  Canada: 50,
  India: 25,
  Italy: 25,
}

const maxFilms = Math.max(...Object.values(filmDistribution))

type MapChartProps = {
  setTooltipContent: (content: string) => void
}

export function MapChart({ setTooltipContent }: MapChartProps) {
  return (
    <div id="map" className="w-full h-full">
      <ComposableMap>
        <ZoomableGroup>
          <Geographies geography={geography}>
            {({ geographies }) =>
              geographies.map(geo => {
                const country = geo.properties.name

                const value =
                  filmDistribution[country as keyof typeof filmDistribution] ||
                  0

                const opacityPercentage = Math.floor((value / maxFilms) * 100)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className={cn(
                      'hover:fill-muted-foreground hover:opacity-100 hover:border-dashed relative',
                      value ? 'fill-foreground' : 'fill-muted'
                    )}
                    style={{
                      default: {
                        opacity: value ? `${opacityPercentage}%` : '100%',
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
                      setTooltipContent(`${geo.properties.name}: ${value}`)
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
