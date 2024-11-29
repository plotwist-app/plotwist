import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Star } from 'lucide-react'
import { v4 } from 'uuid'

export async function BestRated() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            Melhores avaliações
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Suas obras mais bem avaliadas
          </p>
        </div>
        <Star className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="mt-4">
        <div className="space-y-4">
          {[
            { title: 'O Poderoso Chefão', rating: 5, year: '1972' },
            { title: 'Breaking Bad', rating: 5, year: '2008' },
            { title: 'Pulp Fiction', rating: 5, year: '1994' },
            { title: 'Game of Thrones', rating: 5, year: '2011' },
            { title: 'Game of Thrones', rating: 5, year: '2011' },
            { title: 'Game of Thrones', rating: 5, year: '2011' },
            { title: 'Game of Thrones', rating: 5, year: '2011' },
          ].map(item => (
            <div key={item.title} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.year}</div>
              </div>

              <div className="flex items-center">
                {Array.from({ length: item.rating }).map(() => (
                  <Star
                    className="size-3 text-amber-400 fill-amber-400 mr-1"
                    key={v4()}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
