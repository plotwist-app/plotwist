import type { Dictionary } from '@/utils/dictionaries'

type SocialProofProps = {
  dictionary: Dictionary
}

export function SocialProof({ dictionary }: SocialProofProps) {
  const stats = [
    { value: dictionary.social_proof_users_value, label: dictionary.social_proof_users_label },
    { value: dictionary.social_proof_titles_value, label: dictionary.social_proof_titles_label },
    { value: dictionary.social_proof_languages_value, label: dictionary.social_proof_languages_label },
    { value: dictionary.social_proof_platforms_value, label: dictionary.social_proof_platforms_label },
  ]

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 lg:py-20">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
            <span className="text-3xl font-bold tracking-tight md:text-4xl">
              {stat.value}
            </span>
            <span className="text-sm text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
