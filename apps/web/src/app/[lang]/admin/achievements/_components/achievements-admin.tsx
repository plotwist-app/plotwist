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
import { Switch } from '@plotwist/ui/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@plotwist/ui/components/ui/table'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  deleteAdminAchievementsId,
  putAdminAchievementsId,
} from '@/api/admin-achievements'
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

  async function handleToggleActive(achievement: Achievement) {
    try {
      const { data } = await putAdminAchievementsId(achievement.id, {
        isActive: !achievement.isActive,
      })
      setAchievements(prev =>
        prev.map(a => (a.id === data.achievement.id ? data.achievement : a))
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--gray-4)] px-8 py-4">
        <nav className="text-sm">
          <span className="font-medium text-[var(--gray-12)]">
            Achievements
          </span>
        </nav>
        <Button size="sm" asChild>
          <Link href={`/${lang}/admin/achievements/new`}>New Achievement</Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Name (en-US)</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Target</TableHead>
                <TableHead className="text-center">Level</TableHead>
                <TableHead className="text-center">Criteria</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    No achievements yet. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
              {achievements.map(achievement => (
                <TableRow key={achievement.id}>
                  <TableCell className="font-mono text-sm">
                    {achievement.slug}
                  </TableCell>
                  <TableCell>
                    {achievement.name['en-US'] ||
                      Object.values(achievement.name)[0] ||
                      '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{achievement.category}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {achievement.target}
                  </TableCell>
                  <TableCell className="text-center">
                    {achievement.level}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {achievement.criteria.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {achievement.sortOrder}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={achievement.isActive}
                      onCheckedChange={() => handleToggleActive(achievement)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/${lang}/admin/achievements/${achievement.id}/edit`}
                        >
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(achievement)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
