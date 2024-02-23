'use client'

import { useAuth } from '@/context/auth'
import { supabase } from '@/services/supabase'
import { useQuery } from '@tanstack/react-query'
import { Review } from '@/types/supabase/reviews'

import Link from 'next/link'
import { useLanguage } from '@/context/language'
import { DashboardReview, DashboardReviewSkeleton } from './dashboard-review'

export const DashboardUserLastReview = () => {
  return <div>work in progress.</div>

  // const { user } = useAuth()
  // const { language, dictionary } = useLanguage()

  // const { data: response, isLoading } = useQuery({
  //   queryKey: ['dashboard-user-last-review'],
  //   queryFn: async () =>
  //     await supabase
  //       .from('reviews_with_user')
  //       .select()
  //       .order('id', { ascending: false })
  //       .eq('user_id', user.id)
  //       .limit(1)
  //       .returns<Review[]>(),
  // })

  // if (isLoading) {
  //   return (
  //     <div className="space-y-4">
  //       <h3 className="text-lg font-semibold">
  //         {dictionary.dashboard.user_last_review.title}
  //       </h3>
  //       <DashboardReviewSkeleton />
  //     </div>
  //   )
  // }

  // if (!response?.data) return <></>

  // const lastReview = response.data[0]

  // return (
  //   <div className="space-y-4">
  //     <h3 className="text-lg font-semibold">
  //       {dictionary.dashboard.user_last_review.title}
  //     </h3>

  //     {lastReview ? (
  //       <DashboardReview review={lastReview} language={language} />
  //     ) : (
  //       <div className="justify flex flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
  //         <p>{dictionary.dashboard.user_last_review.no_review_message}</p>

  //         <Link
  //           href={`/${language}/app/movies/top-rated`}
  //           className="text-sm text-muted-foreground"
  //         >
  //           {dictionary.dashboard.user_last_review.no_review_action}
  //         </Link>
  //       </div>
  //     )}
  //   </div>
  // )
}
