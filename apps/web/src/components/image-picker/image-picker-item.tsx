import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import Image from 'next/image'
import type { ComponentProps, PropsWithChildren } from 'react'

export const ImagePickerItem = {
  Root: (props: PropsWithChildren & ComponentProps<'div'>) => (
    <div
      className="group relative flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg p-8"
      {...props}
    />
  ),
  Image: ({ src }: { src: string }) => (
    <Image
      src={src}
      fill
      alt=""
      className="object-cover brightness-[50%] transition-all dark:brightness-[35%] dark:group-hover:brightness-[15%]"
    />
  ),
  Title: (props: PropsWithChildren) => (
    <p className="z-10 text-center font-semibold text-white" {...props} />
  ),
}

export const ImagePickerItemSkeleton = () => {
  return <Skeleton className="h-48 w-full" />
}
