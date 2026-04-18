'use client'

import { ArrowRight, Compass, ListChecks, Sparkles } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: ListChecks,
    title: 'Adicione o que está assistindo',
    description:
      'Busque por filme ou série, escolha o status e comece seu histórico em segundos.',
    accent: 'from-emerald-500/15 to-transparent',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Evolua seu progresso',
    description:
      'Atualize episódios, temporadas e notas em uma linha do tempo simples e rápida.',
    accent: 'from-sky-500/15 to-transparent',
  },
  {
    step: '03',
    icon: Compass,
    title: 'Descubra com contexto',
    description:
      'Receba sugestões mais precisas com base no que você realmente gosta.',
    accent: 'from-fuchsia-500/15 to-transparent',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="space-y-8">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Fluxo
        </span>
        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Como funciona em
          <br />
          <span className="bg-gradient-to-r from-foreground to-foreground/55 bg-clip-text text-transparent">
            três passos rápidos.
          </span>
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          Pensado para ser intuitivo do primeiro toque ao hábito diário.
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-6 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <article
              key={step.step}
              style={{ animationDelay: `${index * 120}ms` }}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card/50 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-2xl hover:shadow-foreground/5 motion-safe:animate-[plotwistFadeUp_0.7s_ease-out_both]"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${step.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />

              <div className="relative flex items-start justify-between">
                <span className="text-5xl font-black leading-none text-foreground/10 transition-colors duration-500 group-hover:text-foreground/20">
                  {step.step}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/70 transition-transform duration-500 group-hover:rotate-6">
                  <step.icon className="h-4 w-4" />
                </span>
              </div>

              <h3 className="relative mt-5 text-lg font-semibold">
                {step.title}
              </h3>
              <p className="relative mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>

              {index < STEPS.length - 1 ? (
                <ArrowRight className="absolute right-4 top-4 hidden h-4 w-4 text-muted-foreground/40 md:block" />
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
