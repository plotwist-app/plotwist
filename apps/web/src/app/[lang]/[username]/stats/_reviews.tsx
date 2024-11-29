import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Star } from 'lucide-react'

export function Reviews() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Avaliações</CardTitle>

        <Star className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">324</div>
        <p className="text-xs text-muted-foreground">avaliações realizadas</p>
      </CardContent>
    </Card>
  )
}
