import type { Metadata } from 'next'
import { Link } from 'next-view-transitions'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { buildLanguageAlternates } from '@/utils/seo'
import { APP_URL } from '../../../../constants'

const APP_STORE_URL =
  'https://apps.apple.com/app/plotwist-track-what-you-watch/id6758276399'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)
  const title = `${dictionary.perfect_place_for_watching} ${dictionary.everything}`
  const description = dictionary.manage_rate_discover
  const image = `${APP_URL}/images/landing-page.jpg`

  return {
    title: {
      absolute: `${title} • Plotwist Labs`,
    },
    description,
    openGraph: {
      title: `Plotwist Labs • ${title}`,
      description,
      siteName: 'Plotwist',
      url: `${APP_URL}/${lang}/landing-v2`,
      images: [
        {
          url: image,
          width: 1280,
          height: 720,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
    },
    alternates: buildLanguageAlternates(lang, '/landing-v2'),
  }
}

export default async function LandingV2Page(props: PageProps) {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.24),transparent_36%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.26),transparent_35%),radial-gradient(circle_at_50%_85%,rgba(244,63,94,0.24),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background:linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-20 pt-8 md:px-10 md:pt-12">
        <header className="flex items-center justify-between">
          <div className="rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.24em] text-zinc-200">
            Plotwist Labs
          </div>

          <Link
            href={`/${lang}`}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-zinc-100 transition hover:border-white/45 hover:bg-white/10"
          >
            Ver landing atual
          </Link>
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.26em] text-cyan-200/90">
              {dictionary.community_badge}
            </p>

            <h1 className="text-balance text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">
              {dictionary.hero_title_line1}
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                {dictionary.hero_title_line2}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base text-zinc-200/85 md:text-lg">
              {dictionary.hero_subtitle}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href={`/${lang}#pricing`}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:translate-y-[-1px] hover:bg-zinc-100"
              >
                {dictionary.hero_cta_web}
              </Link>

              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/45 hover:bg-white/20"
              >
                {dictionary.hero_cta_app}
              </a>

              <span className="text-sm text-zinc-300/85">
                {dictionary.manage_rate_discover}
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-8 h-28 w-28 rounded-full bg-cyan-400/30 blur-2xl" />
            <div className="absolute -bottom-8 right-4 h-24 w-24 rounded-full bg-fuchsia-400/30 blur-2xl" />

            <div className="relative space-y-4">
              <article className="rotate-[-4deg] rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/15 to-cyan-100/5 p-5 shadow-[0_16px_40px_-20px_rgba(34,211,238,0.7)]">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">
                  Orbit #01
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Seu diário visual de filmes e séries
                </h2>
                <p className="mt-2 text-sm text-zinc-200/85">
                  Faça tracking, histórico, progresso e reviews em um fluxo
                  rápido, sem atrito.
                </p>
              </article>

              <article className="translate-x-5 rotate-[2deg] rounded-3xl border border-violet-300/25 bg-gradient-to-br from-violet-400/15 to-violet-100/5 p-5 shadow-[0_16px_40px_-20px_rgba(167,139,250,0.75)]">
                <p className="text-xs uppercase tracking-[0.16em] text-violet-200">
                  Orbit #02
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Descoberta guiada pelo seu gosto
                </h2>
                <p className="mt-2 text-sm text-zinc-200/85">
                  Encontre o próximo título com contexto, não só por lista
                  genérica.
                </p>
              </article>

              <article className="rotate-[-2deg] rounded-3xl border border-fuchsia-300/25 bg-gradient-to-br from-fuchsia-400/15 to-fuchsia-100/5 p-5 shadow-[0_16px_40px_-20px_rgba(232,121,249,0.75)]">
                <p className="text-xs uppercase tracking-[0.16em] text-fuchsia-200">
                  Orbit #03
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Comunidade com sinal de qualidade
                </h2>
                <p className="mt-2 text-sm text-zinc-200/85">
                  Veja atividade real, perfis e curadoria para decidir melhor o
                  que assistir.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-white/15 bg-black/25 p-6 backdrop-blur-xl md:grid-cols-3">
          {[
            {
              label: 'Capture',
              value: 'Marque o que assistiu em segundos',
            },
            {
              label: 'Understand',
              value: 'Veja progresso, histórico e preferências',
            },
            {
              label: 'Share',
              value: 'Conecte-se com pessoas de gosto parecido',
            },
          ].map(item => (
            <article
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-300">
                {item.label}
              </p>
              <p className="mt-3 text-sm text-zinc-100">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-white/15 bg-gradient-to-r from-white/10 to-white/5 p-8 text-center md:p-10">
          <p className="text-sm uppercase tracking-[0.22em] text-zinc-300">
            New Landing Preview
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
            Uma direção visual mais marcante, sem mexer na landing atual.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-200/90">
            Se curtir essa base, no próximo passo eu alinhei com seu exemplo do
            v0 para refinar tipografia, ritmo visual e microdetalhes.
          </p>
        </section>
      </div>
    </main>
  )
}
