import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Logo } from '@/components/logo'
import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import { useOnboarding } from '../onboarding-context'

export function OnboardingWelcome({ lang }: { lang: string }) {
  const { nextStep, dictionary } = useOnboarding()
  const language = (lang as Language) || 'en-US'

  const title =
    dictionary?.welcome_title || 'Track, discover and never miss a title'
  const subtitle =
    dictionary?.welcome_subtitle ||
    'Join the community of movie and TV show lovers.'
  const cta = dictionary?.get_started || 'Get started'

  const { data } = useQuery({
    queryKey: ['onboarding-welcome-posters', language],
    queryFn: () =>
      tmdb.movies.discover({
        filters: { sort_by: 'vote_count.desc' },
        language,
        page: 1,
      }),
  })

  const posters =
    (data?.results
      .slice(0, 20)
      .map(m => m.poster_path)
      .filter(Boolean) as string[]) ?? []

  const col1 = posters.filter((_, i) => i % 5 === 0)
  const col2 = posters.filter((_, i) => i % 5 === 1)
  const col3 = posters.filter((_, i) => i % 5 === 2)
  const col4 = posters.filter((_, i) => i % 5 === 3)
  const col5 = posters.filter((_, i) => i % 5 === 4)

  const Column = ({ images, duration, delayOffset, className }: any) => (
    <div
      className={`flex flex-col gap-4 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] will-change-transform animate-scroll-up ${className}`}
      style={
        {
          '--duration': `${duration}s`,

          animationDelay: `-${delayOffset}s`,
        } as React.CSSProperties
      }
    >
      {[...images, ...images].map((path, i) => (
        <div
          key={`${i}`}
          className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-neutral-800 shadow-xl"
        >
          <Image
            src={tmdbImage(path as string, 'w500')}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  )

  return (
    <div className="relative flex flex-1 h-screen w-full flex-col bg-black overflow-hidden">
      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(-50% - 0.5rem)); }
        }
        .animate-scroll-up {
          animation: scroll-up var(--duration, 40s) linear infinite;
        }
      `}</style>

      <div className="absolute inset-0 z-0 opacity-40 md:opacity-30">
        <div
          className="flex w-full justify-center gap-4 p-4"
          style={{ transform: 'rotate(-5deg) scale(1.25) translateY(-5%)' }}
        >
          <Column
            images={col1}
            duration={40}
            delayOffset={10}
            className="hidden lg:flex"
          />
          <Column
            images={col2}
            duration={45}
            delayOffset={25}
            className="hidden md:flex pt-12"
          />
          <Column
            images={col3}
            duration={38}
            delayOffset={5}
            className="pt-6"
          />
          <Column images={col4} duration={42} delayOffset={20} className="" />
          <Column
            images={col5}
            duration={35}
            delayOffset={15}
            className="pt-16"
          />
          <Column
            images={col1}
            duration={39}
            delayOffset={8}
            className="hidden md:flex pt-8"
          />
          <Column
            images={col2}
            duration={48}
            delayOffset={30}
            className="hidden lg:flex pt-2"
          />
        </div>
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent md:bg-gradient-to-t md:from-black md:via-black/60 md:to-black/30" />
      <div className="absolute inset-0 z-10 hidden md:block bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] opacity-70" />

      <div className="relative z-20 flex flex-1 flex-col justify-end md:justify-center items-start md:items-center px-6 pb-12 md:pb-0 text-left md:text-center w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-start md:items-center w-full"
        >
          <div className="mb-4 md:mb-6 bg-app-foreground flex items-center justify-center rounded-xl shadow-lg p-3 md:p-4 opacity-90 transition-opacity hover:opacity-100">
             <div className="brightness-0 invert"><Logo size={32} /></div>
          </div>
          
          <h1 className="mb-3 text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-2xl drop-shadow-xl text-balance">
            {title}
          </h1>
          
          <p className="mb-8 text-sm md:text-base text-neutral-400 max-w-md drop-shadow-md">
            {subtitle}
          </p>
          
          <div className="w-full max-w-xs">
            <button
              onClick={nextStep}
              className="w-full rounded-full bg-white py-3 text-center text-sm font-semibold text-black transition-transform active:scale-95 shadow-lg hover:bg-neutral-200"
            >
              {cta}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
