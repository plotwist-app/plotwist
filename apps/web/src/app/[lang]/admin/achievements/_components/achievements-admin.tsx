'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@plotwist/ui/components/ui/alert-dialog'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { Button } from '@plotwist/ui/components/ui/button'
import { ImageIcon, Pencil, Trash2, Trophy } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteAdminAchievementsId } from '@/api/admin-achievements'
import type { GetAdminAchievements200AchievementsItem } from '@/api/endpoints.schemas'

type Achievement = GetAdminAchievements200AchievementsItem

type Props = {
  initialAchievements: Achievement[]
}

export function AchievementsAdmin({ initialAchievements }: Props) {
  const [achievements, setAchievements] =
    useState<Achievement[]>(initialAchievements)
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null)
  const pathname = usePathname()
  const lang = pathname.split('/')[1]

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteAdminAchievementsId(deleteTarget.id)
      setAchievements(prev => prev.filter(a => a.id !== deleteTarget.id))
      toast.success('Achievement deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeleteTarget(null)
    }
  }

  const general = achievements.filter(a => a.category === 'general')
  const sagas = achievements.filter(a => a.category === 'saga')

  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--gray-4)] px-8 py-4">
        <nav className="flex items-center gap-1.5 text-sm">
          <Trophy className="size-4 text-[var(--gray-9)]" />
          <span className="font-medium text-[var(--gray-12)]">
            Achievements
          </span>
        </nav>
        <Button size="sm" asChild>
          <Link href={`/${lang}/admin/achievements/new`}>New Achievement</Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {achievements.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No achievements yet. Create one to get started.
            </p>
          )}

          {general.length > 0 && (
            <AchievementGroup
              title="General"
              achievements={general}
              lang={lang}
              onDelete={setDeleteTarget}
            />
          )}

          {sagas.length > 0 && (
            <AchievementGroup
              title="Sagas"
              achievements={sagas}
              lang={lang}
              onDelete={setDeleteTarget}
            />
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete achievement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.slug}&quot; and
              remove all user progress for this achievement. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function AchievementGroup({
  title,
  achievements,
  lang,
  onDelete,
}: {
  title: string
  achievements: Achievement[]
  lang: string
  onDelete: (a: Achievement) => void
}) {
  return (
    <section>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map(a => (
          <AchievementCard
            key={a.id}
            achievement={a}
            lang={lang}
            onDelete={() => onDelete(a)}
          />
        ))}
      </div>
    </section>
  )
}

function AchievementCard({
  achievement,
  lang,
  onDelete,
}: {
  achievement: Achievement
  lang: string
  onDelete: () => void
}) {
  const name =
    achievement.name['en-US'] || Object.values(achievement.name)[0] || '—'
  const desc =
    achievement.description['en-US'] ||
    Object.values(achievement.description)[0] ||
    ''
  const iconUrl = achievement.icon

  return (
    <div className="group relative flex flex-col items-center rounded-[22px] bg-muted/60 px-4 pb-5 pt-5">
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!achievement.isActive && (
          <Badge
            variant="outline"
            className="pointer-events-none text-[10px] text-muted-foreground"
          >
            Inactive
          </Badge>
        )}
        <Button variant="ghost" size="icon" className="size-7" asChild>
          <Link href={`/${lang}/admin/achievements/${achievement.id}/edit`}>
            <Pencil className="size-3.5" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="mb-3.5">
        {iconUrl && iconUrl !== 'pending-upload' ? (
          // biome-ignore lint/performance/noImgElement: S3 URL not optimizable
          <img src={iconUrl} alt={name} className="size-20 object-contain" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-2xl bg-muted">
            <ImageIcon className="size-7 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <p className="line-clamp-2 text-center text-[15px] font-semibold leading-tight">
        {name}
      </p>
      <p className="mt-1.5 line-clamp-2 text-center text-xs text-muted-foreground">
        {desc}
      </p>

      <div className="mt-4 w-full space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: '0%' }}
          />
        </div>
        <p className="text-center text-[11px] font-semibold tabular-nums text-muted-foreground">
          0/{achievement.target}
        </p>
      </div>
    </div>
  )
}
