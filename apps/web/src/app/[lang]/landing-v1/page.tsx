import type { Metadata } from 'next'
import { Link } from 'next-view-transitions'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { buildLanguageAlternates } from '@/utils/seo'
import { APP_URL } from '../../../../constants'
import { Images } from '../_components/images'
import { FeaturesShowcase } from './_components/features-showcase'
import { HowItWorks } from './_components/how-it-works'
import { TestimonialsSection } from './_components/testimonials-section'

const APP_STORE_URL =
  'https://apps.apple.com/app/plotwist-track-what-you-watch/id6758276399'

const STATS = [
  { value: '800+', label: 'Usuários ativos' },
  { value: '50k+', label: 'Filmes catalogados' },
  { value: '10k+', label: 'Séries e animes' },
  { value: '7', label: 'Idiomas suportados' },
]

const PLANS = [
  {
    name: 'Free',
    price: 'R$0',
    period: '/mês',
    description: 'Para começar seu tracking sem fricção.',
    features: [
      'Tracking de filmes e séries',
      'Reviews e notas',
      'Listas pessoais',
      'Perfil público',
    ],
    cta: 'Começar grátis',
    href: '/sign-up',
  },
  {
    name: 'Pro',
    price: 'R$5',
    period: '/mês',
    description: 'Para quem quer experiência completa e mais poder de descoberta.',
    features: [
      'Tudo do plano Free',
      'Recomendações mais profundas',
      'Conquistas e badges',
      'Insights avançados',
    ],
    cta: 'Testar 14 dias',
    href: '/sign-up?plan=pro',
    featured: true,
  },
]

const FAQS = [
  {
    question: 'A landing atual vai mudar?',
    answer:
      'Não. Essa versão v1 está em rota separada para comparação e refinamento incremental.',
  },
  {
    question: 'Posso usar no celular?',
    answer:
      'Sim. A página está com layout responsivo para mobile, tablet e desktop.',
  },
  {
    question: 'A proposta visual ainda pode evoluir?',
    answer:
      'Sim. Essa é uma base para iteração; tipografia, ritmo e direção estética podem ser refinados.',
  },
]

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)
  const title = `${dictionary.perfect_place_for_watching} ${dictionary.everything}`
  const description = dictionary.manage_rate_discover
  const image = `${APP_URL}/images/landing-page.jpg`

  return {
    title: {
      absolute: `${title} • Plotwist v1`,
    },
    description,
    openGraph: {
      title: `Plotwist v1 • ${title}`,
      description,
      siteName: 'Plotwist',
      url: `${APP_URL}/${lang}/landing-v1`,
      images: [{ url: image, width: 1280, height: 720, alt: title }],
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
    },
    alternates: buildLanguageAlternates(lang, '/landing-v1'),
  }
}

export default async function LandingV1Page(props: PageProps) {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06)_0%,transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-20 pt-8 md:px-6 md:pt-10">
        <header className="flex items-center justify-between">
          <span className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs uppercase tracking-[0.2em]">
            Plotwist v1
          </span>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href={`/${lang}`}
              className="rounded-full border border-border px-3 py-1.5 transition hover:bg-secondary"
            >
              Atual
            </Link>
            <Link
              href={`/${lang}/landing-v2`}
              className="rounded-full border border-border px-3 py-1.5 transition hover:bg-secondary"
            >
              v2
            </Link>
          </div>
        </header>

        <section className="text-center">
          <p className="mx-auto inline-flex rounded-full border border-border/70 bg-secondary/50 px-4 py-2 text-xs">
            {dictionary.community_badge}
          </p>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
            <span>{dictionary.hero_title_line1}</span>
            <br />
            <span className="bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
              {dictionary.hero_title_line2}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            {dictionary.hero_subtitle}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${lang}#pricing`}
              className="rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              {dictionary.hero_cta_web}
            </Link>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-7 py-3 text-sm font-semibold transition hover:bg-secondary"
            >
              {dictionary.hero_cta_app}
            </a>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map(stat => (
              <article key={stat.label} className="text-center">
                <p className="text-2xl font-bold md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold md:text-3xl">
              Perfil, atividade e visão completa
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              A mesma proposta da landing original: destacar perfil, coleção,
              reviews, estatísticas e preferências.
            </p>
          </div>
          <Images />
        </section>

        <FeaturesShowcase />

        <HowItWorks />

        <TestimonialsSection />

        <section className="rounded-3xl border border-border bg-card/40 p-6 md:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
              <div className="mx-auto aspect-[9/18] max-w-[250px] rounded-[2rem] border border-border bg-card p-4">
                <div className="h-3 w-16 rounded-full bg-secondary" />
                <div className="mt-4 h-10 rounded-xl bg-secondary" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-20 rounded-full bg-secondary" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-[2/3] rounded-lg bg-secondary" />
                    <div className="aspect-[2/3] rounded-lg bg-secondary" />
                    <div className="aspect-[2/3] rounded-lg bg-secondary" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-24 rounded-full bg-secondary" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-[2/3] rounded-lg bg-secondary" />
                    <div className="aspect-[2/3] rounded-lg bg-secondary" />
                    <div className="aspect-[2/3] rounded-lg bg-secondary" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">
                Leve o Plotwist para qualquer lugar
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                No iPhone, seu tracking e descobertas continuam sincronizados para
                você nunca perder o fio do que está assistindo.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['iOS', 'Sincronização', 'Watchlist', 'Reviews'].map(item => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                {dictionary.hero_cta_app}
              </a>
            </div>
          </div>
        </section>

        <section id="pricing" className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold md:text-3xl">Planos</h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Comece no gratuito e suba para Pro quando quiser desbloquear mais.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {PLANS.map(plan => (
              <article
                key={plan.name}
                className={`relative overflow-hidden rounded-2xl border p-6 ${
                  plan.featured
                    ? 'border-foreground/30 bg-card'
                    : 'border-border/70 bg-card/40'
                }`}
              >
                {plan.featured ? (
                  <>
                    <div className="pointer-events-none absolute inset-0 -z-10">
                      <div className="absolute -inset-[190%] animate-[spin_14s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_0deg,rgba(255,255,255,0.38)_90deg,transparent_170deg,rgba(255,255,255,0.2)_230deg,transparent_320deg)]" />
                    </div>
                    <div className="pointer-events-none absolute inset-[1px] -z-10 rounded-[15px] bg-card" />
                    <div className="pointer-events-none absolute -bottom-8 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-foreground/20 blur-2xl animate-pulse" />
                  </>
                ) : null}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  {plan.featured ? (
                    <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background animate-pulse">
                      Recomendado
                    </span>
                  ) : null}
                </div>
                <div className="mt-5">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <ul className="mt-5 space-y-2">
                  {plan.features.map(feature => (
                    <li key={feature} className="text-sm text-muted-foreground">
                      - {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                    plan.featured
                      ? 'bg-foreground text-background hover:opacity-90'
                      : 'border border-border hover:bg-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold md:text-3xl">FAQ</h2>
          <div className="space-y-3">
            {FAQS.map(item => (
              <article
                key={item.question}
                className="rounded-2xl border border-border/70 bg-card/40 p-5"
              >
                <h3 className="text-sm font-semibold md:text-base">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="rounded-3xl border border-border/70 bg-card/40 px-5 py-6">
          <div className="flex flex-col items-start justify-between gap-4 text-sm text-muted-foreground md:flex-row md:items-center">
            <p>Plotwist v1 preview - foco em evolução visual incremental.</p>
            <div className="flex items-center gap-3">
              <Link href={`/${lang}`} className="hover:text-foreground">
                Landing atual
              </Link>
              <span className="text-border">/</span>
              <Link href={`/${lang}/landing-v2`} className="hover:text-foreground">
                Landing v2
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
