import Image from 'next/image'
import Link from 'next/link'
import { PersonWithMediaType } from 'tmdb-ts'

type SidebarSearchPersonProps = { person: PersonWithMediaType }

export const SidebarSearchPerson = ({ person }: SidebarSearchPersonProps) => {
  return (
    <Link
      className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
      href={`/app/people/${person.id}`}
    >
      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-muted-foreground">
        {person.profile_path ? (
          <Image
            fill
            className="object-cover"
            src={`https://image.tmdb.org/t/p/original/${person.profile_path}`}
            alt={person.name}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          person.name[0]
        )}
      </div>

      <span className="text-sm">{person.name}</span>
    </Link>
  )
}
