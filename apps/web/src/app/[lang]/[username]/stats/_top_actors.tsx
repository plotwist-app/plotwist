import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Progress } from '@plotwist/ui/components/ui/progress'
import { BarChartHorizontal, User } from 'lucide-react'
import Image from 'next/image'
import { v4 } from 'uuid'

export function TopActors() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">Top 5 Atores</CardTitle>
          <p className="text-xs text-muted-foreground">
            Atores que mais aparecem no seu histórico
          </p>
        </div>
        <User className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="">
        <div className="space-y-4 mt-2">
          <div className="flex gap-2" key={v4()}>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden size-8 rounded-full border">
              <Image
                loading="lazy"
                src="https://image.tmdb.org/t/p/w500//jPsLqiYGSofU4s6BjrxnefMfabb.jpg"
                fill
                className="object-cover"
                sizes="100%"
                alt="aaa"
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Morgan Freeman</span>
                <span className="text-muted-foreground">20 títulos</span>
              </div>

              <Progress value={72} />
            </div>
          </div>

          <div className="flex gap-2" key={v4()}>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden size-8 rounded-full border">
              <Image
                loading="lazy"
                src="https://image.tmdb.org/t/p/w500//8A4PS5iG7GWEAVFftyqMZKl3qcr.jpg"
                fill
                className="object-cover"
                sizes="100%"
                alt="aaa"
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Robert Pattinson</span>
                <span className="text-muted-foreground">5 títulos</span>
              </div>

              <Progress value={20} />
            </div>
          </div>

          <div className="flex gap-2" key={v4()}>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden size-8 rounded-full border">
              <Image
                loading="lazy"
                src="https://image.tmdb.org/t/p/w500//5QApZVV8FUFlVxQpIK3Ew6cqotq.jpg"
                fill
                className="object-cover"
                sizes="100%"
                alt="aaa"
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Dwayne Johnson</span>
                <span className="text-muted-foreground">5 títulos</span>
              </div>

              <Progress value={20} />
            </div>
          </div>

          <div className="flex gap-2" key={v4()}>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden size-8 rounded-full border">
              <Image
                loading="lazy"
                src="https://image.tmdb.org/t/p/w500//5QApZVV8FUFlVxQpIK3Ew6cqotq.jpg"
                fill
                className="object-cover"
                sizes="100%"
                alt="aaa"
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Dwayne Johnson</span>
                <span className="text-muted-foreground">5 títulos</span>
              </div>

              <Progress value={20} />
            </div>
          </div>

          <div className="flex gap-2" key={v4()}>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden size-8 rounded-full border">
              <Image
                loading="lazy"
                src="https://image.tmdb.org/t/p/w500//5QApZVV8FUFlVxQpIK3Ew6cqotq.jpg"
                fill
                className="object-cover"
                sizes="100%"
                alt="aaa"
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Dwayne Johnson</span>
                <span className="text-muted-foreground">5 títulos</span>
              </div>

              <Progress value={20} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
