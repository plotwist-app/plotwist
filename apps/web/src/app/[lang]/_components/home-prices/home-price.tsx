import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { ComponentProps, PropsWithChildren } from 'react'

type HomePriceRootProps = ComponentProps<'li'> & PropsWithChildren
const HomePriceRoot = ({ className, ...props }: HomePriceRootProps) => {
  return (
    <li
      className={cn(
        'col-span-1 flex flex-col justify-between gap-8 rounded-md border bg-background bg-gradient-to-b from-transparent to-muted/30 px-4 py-6',
        className,
      )}
      {...props}
    />
  )
}

type HomePriceContentProps = ComponentProps<'div'> & PropsWithChildren
const HomePriceContent = ({ className, ...props }: HomePriceContentProps) => {
  return <div className={cn('space-y-4', className)} {...props} />
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
const HomePriceValue = ({ className, ...props }: HomePriceValueProps) => {
  return <span className={cn('text-3xl font-bold', className)} {...props} />
}

type HomePriceDescriptionProps = ComponentProps<'p'>
const HomePriceDescription = (props: HomePriceDescriptionProps) => {
  return <p className="text-sm text-muted-foreground" {...props} />
}

type HomePriceBenefitsProps = ComponentProps<'ul'>
const HomePriceBenefits = (props: HomePriceBenefitsProps) => {
  return <ul className="space-y-2" {...props} />
}

type HomePriceBenefitProps = ComponentProps<'li'>
const HomePriceBenefit = ({
  className,
  children,
  ...props
}: HomePriceBenefitProps) => {
  return (
    <li className={cn('flex items-center gap-2', className)} {...props}>
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted p-1">
        <Check className="w-3" />
      </div>

      <span className="text-sm text-muted-foreground">{children}</span>
    </li>
  )
}

export const HomePrice = {
  Root: HomePriceRoot,
  Content: HomePriceContent,
  Header: HomePriceHeader,
  Label: HomePriceLabel,
  Value: HomePriceValue,
  Description: HomePriceDescription,
  Benefits: HomePriceBenefits,
  Benefit: HomePriceBenefit,
}
