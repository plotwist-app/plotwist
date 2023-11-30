import Image from 'next/image'
import { Person } from 'tmdb-ts'

type PersonCardProps = {
  person: Person
}

export const PersonCard = ({ person }: PersonCardProps) => {
  const { profile_path: profile, name } = person

  return (
    <div className="space-y-2">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-sm">
        <Image
          fill
          className="object-cover"
          src={`https://image.tmdb.org/t/p/original/${profile}`}
          alt={name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="">
        <span>{name}</span>
      </div>
    </div>
  )
}
