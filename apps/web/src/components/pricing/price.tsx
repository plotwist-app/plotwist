import { Check } from 'lucide-react'
import type { ComponentProps, PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

type PriceRootProps = ComponentProps<'li'> & PropsWithChildren
const PriceRoot = ({ className, ...props }: PriceRootProps) => {
  return (
    <li
      className={cn(
        'col-span-1 flex flex-col justify-between gap-8 rounded-2xl bg-foreground/[0.02] dark:bg-foreground/[0.03] ring-1 ring-foreground/[0.06] px-6 py-8',
        className
      )}
      {...props}
    />
  )
}

type PriceContentProps = ComponentProps<'div'> & PropsWithChildren
const PriceContent = ({ className, ...props }: PriceContentProps) => {
  return <div className={cn('space-y-6', className)} {...props} />
}

type PriceHeaderProps = ComponentProps<'div'>
const PriceHeader = (props: PriceHeaderProps) => {
  return <div className="flex flex-col gap-2" {...props} />
}

type PriceLabelProps = ComponentProps<'h4'>
const PriceLabel = (props: PriceLabelProps) => {
  return (
    <h4 className="text-lg font-semibold text-muted-foreground" {...props} />
  )
}

type PriceValueProps = ComponentProps<'h4'>
const PriceValue = ({ className, ...props }: PriceValueProps) => {
  return <span className={cn('text-3xl font-bold', className)} {...props} />
}

type PriceDescriptionProps = ComponentProps<'p'>
const PriceDescription = (props: PriceDescriptionProps) => {
  return <p className="text-sm text-muted-foreground leading-relaxed" {...props} />
}

type PriceBenefitsProps = ComponentProps<'ul'>
const PriceBenefits = (props: PriceBenefitsProps) => {
  return <ul className="space-y-3" {...props} />
}

type PriceBenefitProps = ComponentProps<'li'>
const PriceBenefit = ({ className, children, ...props }: PriceBenefitProps) => {
  return (
    <li className={cn('flex items-center gap-3', className)} {...props}>
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] dark:bg-foreground/[0.08]">
        <Check className="w-3 text-foreground/70" />
      </div>

      <span className="text-sm text-muted-foreground">{children}</span>
    </li>
  )
}

export const Price = {
  Root: PriceRoot,
  Content: PriceContent,
  Header: PriceHeader,
  Label: PriceLabel,
  Value: PriceValue,
  Description: PriceDescription,
  Benefits: PriceBenefits,
  Benefit: PriceBenefit,
}
