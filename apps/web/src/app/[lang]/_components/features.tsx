import { Language } from '@/types/languages'
import { List, Pencil, Users } from 'lucide-react'
import { ComponentProps } from 'react'

const Feature = {
  Root: (props: ComponentProps<'li'>) => (
    <li
      className="rounded-lg border overflow-hidden aspect-square flex flex-col justify-between"
      {...props}
    />
  ),
  Infos: (props: ComponentProps<'div'>) => <div className="p-4" {...props} />,
  Title: (props: ComponentProps<'h3'>) => (
    <h3 className="text-xl font-semibold mt-4" {...props} />
  ),
  Description: (props: ComponentProps<'h3'>) => (
    <h3 className="text-muted-foreground text-sm" {...props} />
  ),
}

export const Features = async () => {
  return (
    <section className="mx-auto max-w-6xl pb-32 space-y-6">
      <div className="flex justify-between gap-4">
        <h2 className="font-bold text-4xl w-1/2">Made for modern users</h2>

        <p className="text-muted-foreground w-3/4">
          Linear is shaped by the practices and principles that distinguish
          world-class product teams from the rest: relentless focus, fast
          execution, and a commitment to the quality of craft.
        </p>
      </div>

      <ul className="grid grid-cols-3 gap-4">
        <Feature.Root>
          <div className="aspect-square bg-muted"></div>

          <Feature.Infos>
            <Pencil className="size-6" />
            <Feature.Title>Análises</Feature.Title>
            <Feature.Description>Escreva análises tlgd</Feature.Description>
          </Feature.Infos>
        </Feature.Root>

        <Feature.Root>
          <div className="aspect-square bg-muted"></div>

          <Feature.Infos>
            <List className="size-6" />
            <Feature.Title>Listas</Feature.Title>
            <Feature.Description>Elabore listas</Feature.Description>
          </Feature.Infos>
        </Feature.Root>

        <Feature.Root>
          <div className="aspect-square bg-muted"></div>

          <Feature.Infos>
            <Users className="size-6" />
            <Feature.Title>Comunidades</Feature.Title>
            <Feature.Description>Participe de comunidades</Feature.Description>
          </Feature.Infos>
        </Feature.Root>
      </ul>
    </section>
  )
}
