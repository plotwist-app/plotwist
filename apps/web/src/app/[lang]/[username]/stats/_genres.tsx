import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Progress } from '@plotwist/ui/components/ui/progress'
import { BarChartHorizontal } from 'lucide-react'

export function Genres() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Gêneros mais assistidos
        </CardTitle>
        <BarChartHorizontal className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="mt-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Ação</span>
            <span className="text-muted-foreground">42%</span>
          </div>
          <Progress value={42} />

          <div className="flex justify-between text-sm">
            <span>Drama</span>
            <span className="text-muted-foreground">28%</span>
          </div>
          <Progress value={28} />

          <div className="flex justify-between text-sm">
            <span>Comédia</span>
            <span className="text-muted-foreground">18%</span>
          </div>
          <Progress value={18} />
        </div>
      </CardContent>
    </Card>
  )
}
