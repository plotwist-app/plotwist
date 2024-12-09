'use client'

import type { GetListById200List } from '@/api/endpoints.schemas'
import { getGetListsQueryKey, usePatchListBanner } from '@/api/list'
import { ImagePicker } from '@/components/image-picker'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { useListMode } from '@/context/list-mode'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type ListBannerProps = {
  list: GetListById200List
}

export function ListBanner({ list }: ListBannerProps) {
  const { mode } = useListMode()
  const { dictionary } = useLanguage()
  const patchBanner = usePatchListBanner()
  const { refresh } = useRouter()

  if (mode === 'EDIT') {
    return (
      <ImagePicker.Root
        variant="list"
        onSelect={async (imageUrl, onClose) => {
          await patchBanner.mutateAsync(
            {
              data: {
                bannerUrl: imageUrl,
                listId: list.id,
              },
            },
            {
              onSuccess: async () => {
                await APP_QUERY_CLIENT.invalidateQueries({
                  queryKey: getGetListsQueryKey(),
                })

                refresh()
                onClose()

                toast.success(
                  dictionary.list_item_actions.cover_changed_successfully
                )
              },
            }
          )
        }}
      >
        <ImagePicker.Trigger>
          <section
            className={cn(
              'group relative flex aspect-banner w-full cursor-pointer items-center justify-center overflow-hidden rounded-none border-b lg:border lg:rounded-lg max-h-[55dvh]',
              !list.bannerUrl && 'border-dashed'
            )}
          >
            {list.bannerUrl && (
              <Image
                src={list.bannerUrl}
                alt=""
                fill
                className="object-cover"
              />
            )}

            <div className="z-5 absolute h-full w-full bg-black/30 opacity-0 transition-all group-hover:opacity-100" />

            <p className="spacing z-[6] scale-0 text-xs  font-bold uppercase tracking-wider text-white transition-all group-hover:scale-100">
              {dictionary.profile_banner.change_banner}
            </p>
          </section>
        </ImagePicker.Trigger>
      </ImagePicker.Root>
    )
  }

  return (
    <section className="relative flex aspect-banner w-full items-center justify-center overflow-hidden rounded-none border-b lg:border lg:rounded-lg max-h-[55dvh]">
      {list.bannerUrl && (
        <Image src={list.bannerUrl} alt="" fill className="object-cover" />
      )}
    </section>
  )
}
