'use client'

import 'react-tooltip/dist/react-tooltip.css'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { BarChartHorizontal } from 'lucide-react'

import React from 'react'
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

function MapChart() {
  return (
    <>
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
                      'hover:fill-muted-foreground hover:opacity-100 relative',
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
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </>
  )
}

export function Countries() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            Países de Origem
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Distribuição por país de produção
          </p>
        </div>

        <BarChartHorizontal className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="mt-2 flex-1 -mx-6 -mb-6">
        <div className="border-t h-full  flex items-center justify-center">
          <MapChart />
        </div>
      </CardContent>
    </Card>
  )
}
