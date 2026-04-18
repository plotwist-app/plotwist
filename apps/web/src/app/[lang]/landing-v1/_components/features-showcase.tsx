'use client'

import {
  BarChart3,
  Check,
  Clock,
  Eye,
  Play,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'

export function FeaturesShowcase() {
  return (
    <section className="space-y-8">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          Funcionalidades
        </span>
        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Tudo que você precisa pra
          <br />
          <span className="bg-gradient-to-r from-foreground to-foreground/55 bg-clip-text text-transparent">
            curtir o que assiste.
          </span>
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          Cada bloco abaixo mostra na prática como o Plotwist te ajuda a
          organizar, descobrir e compartilhar.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FeatureTracking />
        <FeatureDiscover />
        <FeatureStats />
        <FeatureSocial />
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  children,
  accent = 'from-foreground/10 via-transparent to-transparent',
  delay = '0ms',
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
  accent?: string
  delay?: string
}) {
  return (
    <article
      style={{ animationDelay: delay }}
      className={`group relative overflow-hidden rounded-3xl border border-border/70 bg-card/50 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-2xl hover:shadow-foreground/5 motion-safe:animate-[plotwistFadeUp_0.7s_ease-out_both]`}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br ${accent}`}
      />

      <div className="relative flex items-start justify-between">
        <div className="max-w-[70%]">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-foreground/90 transition-transform duration-500 group-hover:rotate-6">
          {icon}
        </div>
      </div>

      <div className="relative mt-6">{children}</div>
    </article>
  )
}

function FeatureTracking() {
  const items = [
    { title: 'Severance', subtitle: 'Temporada 2', progress: 70, icon: Eye },
    { title: 'The Bear', subtitle: 'Temporada 3', progress: 100, icon: Check },
    { title: 'Shogun', subtitle: 'Temporada 1', progress: 40, icon: Clock },
  ]

  return (
    <FeatureCard
      icon={<Play className="h-4 w-4" />}
      title="Tracking rápido"
      description="Marque episódios, temporadas e filmes em poucos toques."
      accent="from-emerald-500/10 via-transparent to-transparent"
      delay="0ms"
    >
      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div
            key={item.title}
            style={{ animationDelay: `${index * 120}ms` }}
            className="rounded-xl border border-border/60 bg-background/60 p-3 motion-safe:animate-[plotwistFadeUp_0.6s_ease-out_both]"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                  <item.icon className="h-3 w-3" />
                </span>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {item.progress}%
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-border/70">
              <div
                style={{
                  width: `${item.progress}%`,
                  animationDelay: `${300 + index * 120}ms`,
                }}
                className="h-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-foreground/80 to-foreground/40 motion-safe:animate-[plotwistGrow_0.9s_ease-out_forwards]"
              />
            </div>
          </div>
        ))}
      </div>
    </FeatureCard>
  )
}

function FeatureDiscover() {
  const movies = [
    { title: 'Oppenheimer', match: 98, hue: 30 },
    { title: 'Poor Things', match: 95, hue: 280 },
    { title: 'Past Lives', match: 92, hue: 200 },
  ]

  return (
    <FeatureCard
      icon={<TrendingUp className="h-4 w-4" />}
      title="Descoberta contextual"
      description="Recomendações reais baseadas no seu histórico, não em categorias genéricas."
      accent="from-fuchsia-500/10 via-transparent to-transparent"
      delay="80ms"
    >
      <div className="grid grid-cols-3 gap-2.5">
        {movies.map((movie, index) => (
          <div
            key={movie.title}
            style={{ animationDelay: `${100 + index * 120}ms` }}
            className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border/70 motion-safe:animate-[plotwistFadeUp_0.6s_ease-out_both]"
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, hsl(${movie.hue}, 35%, 22%) 0%, hsl(${movie.hue}, 25%, 12%) 100%)`,
              }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-[10px] font-semibold text-white">
                {movie.title}
              </p>
            </div>
            <div className="absolute right-1.5 top-1.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
              {movie.match}%
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Baseado em <span className="text-foreground">Dune</span>,{' '}
        <span className="text-foreground">Blade Runner 2049</span> e mais 12
        títulos.
      </p>
    </FeatureCard>
  )
}

function FeatureStats() {
  const stats = [
    { value: '605', label: 'Filmes' },
    { value: '69', label: 'Séries' },
    { value: '2.4k', label: 'Horas' },
  ]
  const genres = [
    { label: 'Drama', percentage: 65 },
    { label: 'Sci-Fi', percentage: 48 },
    { label: 'Ação', percentage: 35 },
  ]

  return (
    <FeatureCard
      icon={<BarChart3 className="h-4 w-4" />}
      title="Estatísticas pessoais"
      description="Veja sua evolução, gêneros favoritos e padrões de consumo."
      accent="from-sky-500/10 via-transparent to-transparent"
      delay="160ms"
    >
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            style={{ animationDelay: `${100 + index * 100}ms` }}
            className="rounded-xl border border-border/60 bg-background/60 p-3 text-center motion-safe:animate-[plotwistFadeUp_0.6s_ease-out_both]"
          >
            <p className="text-lg font-bold tabular-nums">{stat.value}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5">
        <p className="text-[11px] text-muted-foreground">
          Gêneros mais assistidos
        </p>
        {genres.map((genre, index) => (
          <div
            key={genre.label}
            className="flex items-center gap-3 text-[11px]"
          >
            <span className="w-20 text-muted-foreground">{genre.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/70">
              <div
                style={{
                  width: `${genre.percentage}%`,
                  animationDelay: `${400 + index * 120}ms`,
                }}
                className="h-full origin-left scale-x-0 rounded-full bg-foreground/70 motion-safe:animate-[plotwistGrow_0.9s_ease-out_forwards]"
              />
            </div>
            <span className="w-8 text-right tabular-nums text-muted-foreground">
              {genre.percentage}%
            </span>
          </div>
        ))}
      </div>
    </FeatureCard>
  )
}

function FeatureSocial() {
  const activities = [
    { user: 'M', name: 'Maria', action: 'terminou', title: 'Dune: Parte Dois' },
    { user: 'L', name: 'Lucas', action: 'começou', title: 'The Bear' },
    {
      user: 'A',
      name: 'Ana',
      action: 'avaliou',
      title: 'Shogun',
      rating: 5,
    },
  ]

  return (
    <FeatureCard
      icon={<Users className="h-4 w-4" />}
      title="Social e recomendações"
      description="Acompanhe amigos, troque indicações e descubra por quem você confia."
      accent="from-amber-500/10 via-transparent to-transparent"
      delay="240ms"
    >
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div
            key={activity.name}
            style={{ animationDelay: `${100 + index * 120}ms` }}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-2.5 motion-safe:animate-[plotwistSlideIn_0.6s_ease-out_both]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold">
              {activity.user}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs">
                <span className="font-medium">{activity.name}</span>
                <span className="text-muted-foreground"> {activity.action} </span>
                <span className="font-medium">{activity.title}</span>
              </p>
              {activity.rating ? (
                <div className="mt-0.5 flex gap-0.5">
                  {Array.from({ length: activity.rating }).map((_, i) => (
                    <Star
                      key={`${activity.name}-star-${i}`}
                      className="h-2.5 w-2.5 fill-foreground/70 text-foreground/70"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </FeatureCard>
  )
}
