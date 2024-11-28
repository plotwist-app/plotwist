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

import React, { useState } from 'react'

import { MapChart } from './map-chart'

export function Countries() {
  const [content, setContent] = useState('')

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
          <MapChart setTooltipContent={setContent} />
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
