import type { ReactNode } from 'react'

type DirectionCardProps = {
  label: string
  title: string
  description: string
  recommended?: boolean
  children: ReactNode
}

function MiniPoster({ tone }: { tone: 'coral' | 'violet' | 'butter' }) {
  const background = {
    coral: 'from-[#562d29]',
    violet: 'from-[#40325e]',
    butter: 'from-[#5d522d]',
  }[tone]

  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-[10px] border border-white/10 bg-gradient-to-br ${background} to-[#171715] shadow-xl`}
    >
      <span className="absolute inset-x-2 bottom-2 h-1.5 rounded-full bg-white/60" />
    </div>
  )
}

function PreviewHeader({ light = false }: { light?: boolean }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      <div className="relative mr-3 h-4 w-6">
        <span className="absolute left-0 top-0 size-4 rounded-full bg-[#ff645a]" />
        <span
          className={`absolute left-2 top-0 size-4 rounded-full border-2 border-[#ff645a] ${
            light ? 'bg-[#f7f3ea]' : 'bg-[#0b0b09]'
          }`}
        />
      </div>
      <span className="h-2 w-10 rounded-full bg-[#ff645a]" />
      <span
        className={`h-2 w-8 rounded-full ${light ? 'bg-black/15' : 'bg-white/15'}`}
      />
      <span
        className={`h-2 w-8 rounded-full ${light ? 'bg-black/15' : 'bg-white/15'}`}
      />
      <span
        className={`ml-auto size-7 rounded-full ${light ? 'bg-black' : 'bg-white'}`}
      />
    </div>
  )
}

function DirectionCard({
  label,
  title,
  description,
  recommended,
  children,
}: DirectionCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-[20px] border bg-[#161513] ${
        recommended
          ? 'border-[#ff645a] shadow-[0_0_0_4px_rgba(255,100,90,0.14)]'
          : 'border-white/10'
      }`}
    >
      {children}
      <div className="border-t border-white/10 p-5">
        <p className="together-kicker text-[#ff8a82]">{label}</p>
        <h2 className="together-heading mt-2">{title}</h2>
        <p className="together-meta together-fg-muted mt-2">{description}</p>
        {recommended && (
          <span className="together-kicker mt-4 inline-flex rounded-full bg-[#ff645a]/15 px-3 py-1.5 text-[#ff8a82]">
            Recomendado
          </span>
        )}
      </div>
    </article>
  )
}

function PosterGrid() {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2.5">
      <MiniPoster tone="coral" />
      <MiniPoster tone="violet" />
      <MiniPoster tone="butter" />
    </div>
  )
}

export default function DesignPreviewPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="together-kicker together-fg-accent">
          Plotwist · exploração visual
        </p>
        <h1 className="together-display mt-4 md:text-6xl">
          Até onde o Together deve definir o novo Plotwist?
        </h1>
        <p className="together-body together-fg-muted mx-auto mt-5 max-w-2xl">
          As três direções usam a mesma personalidade cinematográfica em
          intensidades diferentes.
        </p>
      </header>

      <section className="mt-12 grid gap-5 lg:grid-cols-3">
        <DirectionCard
          label="Opção A"
          title="Cópia literal"
          description="Dark mode permanente, coral, tickets e botões redondos em todas as superfícies."
        >
          <div className="min-h-[390px] bg-[#0b0b09] p-5 text-[#f7f3ea]">
            <PreviewHeader />
            <p className="together-kicker text-[#ff645a]">
              Sua noite de cinema
            </p>
            <p className="mt-2 text-[32px] font-semibold leading-[0.96] tracking-[-0.045em]">
              O que você
              <br />
              vai assistir?
            </p>
            <p className="mt-3 text-xs text-white/55">
              Toda a experiência sempre escura e imersiva.
            </p>
            <PosterGrid />
            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f7f3ea] p-3 text-[#0b0b09]">
              <strong className="text-xs">Continue descobrindo</strong>
              <span className="rounded-full bg-[#ff645a] px-3 py-2 text-[10px] font-semibold text-white">
                Explorar
              </span>
            </div>
          </div>
        </DirectionCard>

        <DirectionCard
          label="Opção B"
          title="Sistema cinematográfico"
          description="O DNA do Together vira design system, adaptado à função e à densidade de cada página."
          recommended
        >
          <div className="min-h-[390px] bg-gradient-to-b from-[#0b0b09] from-50% to-[#f7f3ea] to-50% p-5 text-[#f7f3ea]">
            <PreviewHeader />
            <p className="together-kicker text-[#ff645a]">
              Feito para você
            </p>
            <p className="mt-2 text-[32px] font-semibold leading-[0.96] tracking-[-0.045em]">
              Histórias que
              <br />
              ficam com você.
            </p>
            <p className="mt-3 text-xs text-white/55">
              Imersão onde importa; clareza para organizar.
            </p>
            <div className="mt-8">
              <PosterGrid />
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#161513] p-3 text-[#f7f3ea]">
              <strong className="text-xs">
                Sua coleção, com personalidade
              </strong>
              <span className="rounded-full bg-[#ff645a] px-3 py-2 text-[10px] font-semibold text-white">
                Ver lista
              </span>
            </div>
          </div>
        </DirectionCard>

        <DirectionCard
          label="Opção C"
          title="Adaptação leve"
          description="Mantém a estrutura atual e aplica apenas tipografia, coral e detalhes da identidade do Together."
        >
          <div className="min-h-[390px] bg-[#f7f3ea] p-5 text-[#0b0b09]">
            <PreviewHeader light />
            <p className="together-kicker text-[#ff645a]">Descubra agora</p>
            <p className="mt-2 text-[32px] font-semibold leading-[0.96] tracking-[-0.045em]">
              Seu universo
              <br />
              de histórias.
            </p>
            <p className="mt-3 text-xs text-black/55">
              A estrutura conhecida com uma nova camada visual.
            </p>
            <PosterGrid />
            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#161513] p-3 text-[#f7f3ea]">
              <strong className="text-xs">Novidades para você</strong>
              <span className="rounded-full bg-[#ff645a] px-3 py-2 text-[10px] font-semibold text-white">
                Abrir
              </span>
            </div>
          </div>
        </DirectionCard>
      </section>
    </main>
  )
}
