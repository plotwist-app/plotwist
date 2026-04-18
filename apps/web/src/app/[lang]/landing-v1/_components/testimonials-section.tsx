'use client'

import { Quote, Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Ana',
    age: 24,
    role: 'Cinéfila casual',
    rating: 5,
    quote:
      'Parei de esquecer episódios. O Plotwist virou meu lugar padrão para organizar tudo.',
    accent: 'from-emerald-500/20 via-transparent to-transparent',
    avatarBg: 'bg-emerald-500/15 text-emerald-200',
  },
  {
    name: 'Lucas',
    age: 29,
    role: 'Maratonista de séries',
    rating: 5,
    quote:
      'Combinar tracking com recomendações faz diferença real no que eu escolho assistir.',
    accent: 'from-sky-500/20 via-transparent to-transparent',
    avatarBg: 'bg-sky-500/15 text-sky-200',
  },
  {
    name: 'Marina',
    age: 22,
    role: 'Fã de animes',
    rating: 5,
    quote:
      'Curti muito o ritmo da interface. Resolve meu fluxo sem ficar pesado ou confuso.',
    accent: 'from-fuchsia-500/20 via-transparent to-transparent',
    avatarBg: 'bg-fuchsia-500/15 text-fuchsia-200',
  },
]

export function TestimonialsSection() {
  return (
    <section className="space-y-8">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Comunidade
        </span>
        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Quem usa,
          <br />
          <span className="bg-gradient-to-r from-foreground to-foreground/55 bg-clip-text text-transparent">
            curte de verdade.
          </span>
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          Feedback real para validar direção de produto e experiência.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((item, index) => (
          <article
            key={item.name}
            style={{ animationDelay: `${index * 120}ms` }}
            className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card/50 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-2xl hover:shadow-foreground/5 motion-safe:animate-[plotwistFadeUp_0.7s_ease-out_both]"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
            />

            <Quote className="relative h-6 w-6 text-foreground/30 transition-transform duration-500 group-hover:scale-110" />

            <p className="relative mt-4 text-sm leading-relaxed text-foreground/90">
              {item.quote}
            </p>

            <div className="relative mt-5 flex items-center gap-3 border-t border-border/50 pt-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${item.avatarBg}`}
              >
                {item.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {item.name}, {item.age}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.role}
                </p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star
                    key={`${item.name}-star-${i}`}
                    className="h-3 w-3 fill-foreground/80 text-foreground/80"
                  />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
