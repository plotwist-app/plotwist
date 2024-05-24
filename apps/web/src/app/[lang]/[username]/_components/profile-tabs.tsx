'use client'

import { Award, List, Star, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileReviews } from './profile-reviews'
import { ProfileLists } from './profile-lists'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Profile } from '@/types/supabase'
import { FullReview } from '@/services/api/reviews'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/context/language'
import { useCallback } from 'react'

const ProfileAchievements = dynamic(
  () => import('./profile-achievements').then((mod) => mod.ProfileAchievements),
  { ssr: false },
)

type ProfileTabsProps = {
  profile: Profile
  reviews: FullReview[]
}

export const ProfileTabs = ({ profile, reviews }: ProfileTabsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { language, dictionary } = useLanguage()

  const tab = searchParams.get('tab') ?? 'reviews'

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  function handleTabChange(tab: string) {
    router.push(pathname + '?' + createQueryString('tab', tab))
  }

  return (
    <Tabs defaultValue="reviews" value={tab} className="w-full">
      <div className="md:m-none p-none -mx-4 max-w-[100vw] overflow-x-scroll px-4 scrollbar-hide">
        <TabsList>
          <TabsTrigger
            onClick={() => handleTabChange('reviews')}
            value="reviews"
          >
            <Star className="mr-1" width={12} height={12} />
            {dictionary.profile.reviews}
          </TabsTrigger>

          <TabsTrigger onClick={() => handleTabChange('lists')} value="lists">
            <List className="mr-1" width={12} height={12} />
            {dictionary.profile.lists}
          </TabsTrigger>

          <TabsTrigger
            onClick={() => handleTabChange('achievements')}
            value="achievements"
          >
            <Award className="mr-1" width={12} height={12} />
            {dictionary.profile.achievements}
          </TabsTrigger>

          <TabsTrigger
            onClick={() => handleTabChange('communities')}
            value="communities"
            disabled
          >
            <Users className="mr-1" width={12} height={12} />

            {dictionary.profile.communities}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="reviews" className="mt-4">
        <ProfileReviews reviews={reviews} language={language} />
      </TabsContent>

      <TabsContent value="lists" className="mt-4">
        <ProfileLists userId={profile.id} />
      </TabsContent>

      <TabsContent value="achievements" className="mt-4">
        <ProfileAchievements dictionary={dictionary} />
      </TabsContent>
    </Tabs>
  )
}
