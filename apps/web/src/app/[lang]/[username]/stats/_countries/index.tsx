'use client'

import 'react-tooltip/dist/react-tooltip.css'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { BarChartHorizontal } from 'lucide-react'
import { Tooltip } from 'react-tooltip'

import { useState } from 'react'

import { useGetUserIdWatchedCountriesSuspense } from '@/api/user-stats'
import { useLanguage } from '@/context/language'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { useLayoutContext } from '../../_context'
import { MapChart } from './map-chart'

export function Countries() {
  const { userId } = useLayoutContext()
  const { dictionary } = useLanguage()
  const { data } = useGetUserIdWatchedCountriesSuspense(userId)

  const [content, setContent] = useState('')

  return (
    <Card className="col-span-2 sm:col-span-1 flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            {dictionary.origin_countries}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {dictionary.distribution_by_countries}
          </p>
        </div>

        <BarChartHorizontal className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="mt-2 flex-1 -mx-6 -mb-6">
        <div className="border-t h-full flex items-center justify-center">
          <MapChart
            setTooltipContent={setContent}
            data={data.watchedCountries}
          />

          <Tooltip
            anchorId="map"
            content={content}
            float
            className="!rounded-md !bg-primary !opacity-100 !px-3 !py-1.5 !text-xs !text-primary-foreground"
            noArrow
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function CountriesSkeleton() {
  const { dictionary } = useLanguage()

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            {dictionary.origin_countries}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {dictionary.distribution_by_countries}
          </p>
        </div>

        <BarChartHorizontal className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="mt-2 flex-1 -mx-6 -mb-6">
        <Skeleton className="border-t h-full w-full" />
      </CardContent>
    </Card>
  )
}
