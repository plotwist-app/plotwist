import { cn } from '@/lib/utils'
import { ComponentProps, PropsWithChildren } from 'react'

type HomePriceRootProps = ComponentProps<'li'> & PropsWithChildren
const HomePriceRoot = ({ className, ...props }: HomePriceRootProps) => {
  return (
    <li
      className={cn(
        'col-span-1 aspect-square space-y-4 rounded-md border px-4 py-6',
        className,
      )}
      {...props}
    />
  )
}

type HomePriceHeaderProps = ComponentProps<'div'>
const HomePriceHeader = (props: HomePriceHeaderProps) => {
  return <div className="space-y-2" {...props} />
}

type HomePriceLabelProps = ComponentProps<'h4'>
const HomePriceLabel = (props: HomePriceLabelProps) => {
  return (
    <h4 className="text-lg font-semibold text-muted-foreground" {...props} />
  )
}

type HomePriceValueProps = ComponentProps<'h4'>
const HomePriceValue = (props: HomePriceValueProps) => {
  return <span className="text-3xl font-bold" {...props} />
}

type HomePriceDescriptionProps = ComponentProps<'p'>
const HomePriceDescription = (props: HomePriceDescriptionProps) => {
  return <p className="text-sm text-muted-foreground" {...props} />
}

type HomePriceBenefitsProps = ComponentProps<'ul'>
const HomePriceBenefits = (props: HomePriceBenefitsProps) => {
  return <ul className="space-y-1" {...props} />
}

export const HomePrice = {
  Root: HomePriceRoot,
  Header: HomePriceHeader,
  Label: HomePriceLabel,
  Value: HomePriceValue,
  Description: HomePriceDescription,
  Benefits: HomePriceBenefits,
}
