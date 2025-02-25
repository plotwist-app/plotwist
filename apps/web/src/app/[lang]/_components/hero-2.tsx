import { Badge } from '@plotwist/ui/components/ui/badge'
import { Button } from '@plotwist/ui/components/ui/button'
import { Link } from 'next-view-transitions'

export async function Hero2() {
  return (
    <section className="mx-auto max-w-4xl flex flex-col gap-6 items-center py-24 text-center">
      <Badge variant="outline">
        ✨ Faça parte de uma comunidade de +400 usuários
      </Badge>

      <h2 className="text-6xl leading-[1.2]">
        O lugar perfeito para quem assiste de <b>tudo</b>
      </h2>

      <p className="text-muted-foreground text-lg max-w-2xl">
        Gerencie, avalie, descubra e compartilhe seus conteúdos favoritos. Crie
        listas, receba recomendações e acompanhe tudo o que já assistiu.
      </p>

      <Button asChild>
        <Link href="#pricing">Comece agora</Link>
      </Button>
    </section>
  )
}
