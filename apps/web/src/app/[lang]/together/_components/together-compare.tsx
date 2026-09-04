'use client'

import { useLanguage } from '@/context/language'

export function TogetherCompare() {
  const { language } = useLanguage()

  return (
    <div className="together-compare">
      <section className="together-compare-pane">
        <div className="together-compare-label">
          <strong>Violet</strong>
          <span>Seguro · cinema + social + tech</span>
        </div>
        <iframe
          title="Together violet"
          src={`/${language}/together?theme=violet&compare=1`}
        />
      </section>
      <section className="together-compare-pane">
        <div className="together-compare-label">
          <strong>Butter</strong>
          <span>Identidade · cinema / cultura</span>
        </div>
        <iframe
          title="Together butter"
          src={`/${language}/together?theme=butter&compare=1`}
        />
      </section>
      <section className="together-compare-pane">
        <div className="together-compare-label">
          <strong>Coral</strong>
          <span>Viral · social / casal</span>
        </div>
        <iframe
          title="Together coral"
          src={`/${language}/together?theme=coral&compare=1`}
        />
      </section>
    </div>
  )
}
