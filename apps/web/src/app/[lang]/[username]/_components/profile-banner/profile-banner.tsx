'use client'

import { ProfileBannerEdit } from './profile-banner-edit'

export const ProfileBanner = () => {
  const mode = 'EDIT'

  if (mode === 'EDIT') {
    return <ProfileBannerEdit />
  }

  return (
    <section className="group flex h-[30dvh] max-h-[720px] w-full cursor-pointer items-center justify-center rounded-none border lg:h-[55dvh] lg:rounded-lg">
      imagem porraaaaaaaaa
      {/* <Image src"/></Image> */}
    </section>
  )
}
