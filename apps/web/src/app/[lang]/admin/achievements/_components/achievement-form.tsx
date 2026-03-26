'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from '@plotwist/ui/components/ui/alert-dialog'
import { Button } from '@plotwist/ui/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@plotwist/ui/components/ui/form'
import { Input } from '@plotwist/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@plotwist/ui/components/ui/select'
import { Separator } from '@plotwist/ui/components/ui/separator'
import { Switch } from '@plotwist/ui/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plotwist/ui/components/ui/tabs'
import { Textarea } from '@plotwist/ui/components/ui/textarea'
import { ChevronRight, ImagePlus, Trophy, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  postAdminAchievements,
  putAdminAchievementsId,
} from '@/api/admin-achievements'
import type { GetAdminAchievements200AchievementsItem } from '@/api/endpoints.schemas'
import { postImage } from '@/api/images'
import { TmdbItemPicker } from './tmdb-item-picker'

type Achievement = GetAdminAchievements200AchievementsItem

const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'ja-JP', label: '日本語' },
] as const

const CRITERIA_TYPES = [
  { value: 'ITEMS_WATCHED', label: 'Items Watched' },
  { value: 'ITEMS_IN_COLLECTION', label: 'Items in Collection' },
  { value: 'REVIEWS_WRITTEN', label: 'Reviews Written' },
  { value: 'FOLLOWERS_COUNT', label: 'Followers Count' },
  { value: 'FOLLOWING_COUNT', label: 'Following Count' },
  { value: 'LISTS_CREATED', label: 'Lists Created' },
  { value: 'FAVORITES_COUNT', label: 'Favorites Count' },
  { value: 'EPISODES_WATCHED', label: 'Episodes Watched' },
  { value: 'TMDB_SET', label: 'TMDB Set (Saga)' },
] as const

const formSchema = z.object({
  slug: z.string().min(1, 'Required').max(100),
  icon: z.string().min(1, 'Required'),
  color: z.string().max(10).optional(),
  target: z.number().int().positive('Must be positive'),
  category: z.enum(['general', 'saga']),
  level: z.number().int().positive('Must be positive'),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  criteriaType: z.string().min(1, 'Required'),
  criteriaMediaType: z.string().optional(),
  criteriaTmdbIds: z.array(z.number()).optional(),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  achievement?: Achievement
}

export function AchievementForm({ achievement }: Props) {
  const isEditing = !!achievement
  const router = useRouter()
  const pathname = usePathname()
  const lang = pathname.split('/')[1]
  const [loading, setLoading] = useState(false)
  const [names, setNames] = useState<Record<string, string>>({})
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initialValues: FormValues = achievement
    ? {
        slug: achievement.slug,
        icon: achievement.icon,
        color: (achievement as Record<string, unknown>).color as string ?? '',
        target: achievement.target,
        category: achievement.category as 'general' | 'saga',
        level: achievement.level,
        sortOrder: achievement.sortOrder,
        isActive: achievement.isActive,
        criteriaType: achievement.criteria.type,
        criteriaMediaType:
          'mediaType' in achievement.criteria
            ? (achievement.criteria.mediaType ?? '')
            : '',
        criteriaTmdbIds:
          achievement.criteria.type === 'TMDB_SET'
            ? achievement.criteria.tmdbIds
            : [],
      }
    : {
        slug: '',
        icon: 'pending-upload',
        color: '',
        target: 1,
        category: 'general' as const,
        level: 1,
        sortOrder: 0,
        isActive: true,
        criteriaType: 'ITEMS_WATCHED',
        criteriaMediaType: '',
        criteriaTmdbIds: [],
      }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    if (achievement) {
      setNames(achievement.name)
      setDescriptions(achievement.description)
      if (achievement.icon) {
        setIconPreview(achievement.icon)
      }
    }
  }, [achievement])

  function handleIconSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIconFile(file)
    setIconPreview(URL.createObjectURL(file))
    form.setValue('icon', 'pending-upload', { shouldValidate: true })
  }

  function handleIconRemove() {
    setIconFile(null)
    setIconPreview(null)
    form.setValue('icon', '', { shouldValidate: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function uploadIcon(): Promise<string> {
    if (!iconFile) {
      return form.getValues('icon')
    }

    const { data } = await postImage(
      { file: iconFile },
      { folder: 'achievement' }
    )

    return data.url
  }

  function buildCriteria(values: FormValues) {
    const { criteriaType, criteriaMediaType, criteriaTmdbIds } = values

    switch (criteriaType) {
      case 'ITEMS_WATCHED':
        return {
          type: 'ITEMS_WATCHED' as const,
          ...(criteriaMediaType
            ? { mediaType: criteriaMediaType as 'MOVIE' | 'TV_SHOW' }
            : {}),
        }
      case 'ITEMS_IN_COLLECTION':
        return {
          type: 'ITEMS_IN_COLLECTION' as const,
          ...(criteriaMediaType
            ? { mediaType: criteriaMediaType as 'MOVIE' | 'TV_SHOW' }
            : {}),
        }
      case 'TMDB_SET':
        return {
          type: 'TMDB_SET' as const,
          tmdbIds: criteriaTmdbIds ?? [],
          mediaType: (criteriaMediaType as 'MOVIE' | 'TV_SHOW') || 'MOVIE',
        }
      default:
        return { type: criteriaType } as Achievement['criteria']
    }
  }

  function onSubmit(values: FormValues) {
    setPendingValues(values)
    setConfirmOpen(true)
  }

  async function onConfirm() {
    if (!pendingValues) return
    setLoading(true)
    try {
      const iconUrl = await uploadIcon()
      const criteria = buildCriteria(pendingValues)
      const payload = {
        slug: pendingValues.slug,
        icon: iconUrl,
        color: pendingValues.color ?? '',
        target: pendingValues.target,
        category: pendingValues.category,
        level: pendingValues.level,
        sortOrder: pendingValues.sortOrder,
        isActive: pendingValues.isActive,
        criteria,
        name: names,
        description: descriptions,
      }

      if (isEditing) {
        await putAdminAchievementsId(achievement.id, payload)
        toast.success('Achievement updated')
      } else {
        await postAdminAchievements(payload)
        toast.success('Achievement created')
      }

      router.push(`/${lang}/admin/achievements`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setLoading(false)
      setConfirmOpen(false)
      setPendingValues(null)
    }
  }

  const criteriaType = form.watch('criteriaType')
  const showMediaType = [
    'ITEMS_WATCHED',
    'ITEMS_IN_COLLECTION',
    'TMDB_SET',
  ].includes(criteriaType)
  const showTmdbIds = criteriaType === 'TMDB_SET'

  return (
    <Form {...form}>
      <div className="flex items-center justify-between border-b border-[var(--gray-4)] px-8 py-4">
        <nav className="flex items-center gap-1.5 text-sm">
          <Trophy className="size-4 text-[var(--gray-9)]" />
          <Link
            href={`/${lang}/admin/achievements`}
            className="text-[var(--gray-11)] transition-colors hover:text-[var(--gray-12)]"
          >
            Achievements
          </Link>
          <ChevronRight className="size-3.5 text-[var(--gray-9)]" />
          <span className="font-medium text-[var(--gray-12)]">
            {isEditing ? 'Edit' : 'New Achievement'}
          </span>
        </nav>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/${lang}/admin/achievements`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            form="achievement-form"
          >
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <form
          id="achievement-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto max-w-2xl space-y-6"
        >
          {/* General */}
          <section className="space-y-6">
            <div>
              <h3 className="text-base font-semibold">General</h3>
              <p className="text-sm text-muted-foreground">
                Basic identification and appearance settings.
              </p>
            </div>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-x-4">
                  <FormLabel>Slug</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input placeholder="first_steps" {...field} />
                    </FormControl>
                    <FormMessage className="absolute left-0 top-full mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-x-4">
                  <FormLabel>Category</FormLabel>
                  <div className="relative">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="saga">Saga</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="absolute left-0 top-full mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-x-4">
                  <FormLabel>Level</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="max-w-24"
                      />
                    </FormControl>
                    <FormMessage className="absolute left-0 top-full mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-x-4">
                  <FormLabel>Sort Order</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="max-w-24"
                      />
                    </FormControl>
                    <FormMessage className="absolute left-0 top-full mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-x-4">
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          <Separator />

          {/* Appearance */}
          <section className="space-y-6">
            <div>
              <h3 className="text-base font-semibold">Appearance</h3>
              <p className="text-sm text-muted-foreground">
                Icon image for this achievement.
              </p>
            </div>

            <FormField
              control={form.control}
              name="icon"
              render={() => (
                <FormItem className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <FormLabel className="pt-2">Icon</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <div className="flex items-start gap-4">
                        {iconPreview ? (
                          <div className="relative">
                            {/* biome-ignore lint/performance/noImgElement: blob/S3 URL not optimizable */}
                            <img
                              src={iconPreview}
                              alt="Icon preview"
                              className="size-20 rounded-lg border object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleIconRemove}
                              className="absolute -right-2 -top-2 rounded-full border bg-background p-1 shadow-sm hover:bg-muted"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex size-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            <ImagePlus className="size-5" />
                            <span className="text-xs">Upload</span>
                          </button>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleIconSelect}
                          className="hidden"
                        />

                        {iconPreview && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="absolute left-0 top-full mt-1" />
                  </div>
                </FormItem>
              )}
            />
          </section>

          <Separator />

          {/* Progress */}
          <section className="space-y-6">
            <div>
              <h3 className="text-base font-semibold">Progress</h3>
              <p className="text-sm text-muted-foreground">
                Target value and evaluation criteria for completion.
              </p>
            </div>

            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-x-4">
                  <FormLabel>Target</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="max-w-24"
                      />
                    </FormControl>
                    <FormMessage className="absolute left-0 top-full mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="criteriaType"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-x-4">
                  <FormLabel>Criteria Type</FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select criteria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CRITERIA_TYPES.map(ct => (
                          <SelectItem key={ct.value} value={ct.value}>
                            {ct.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="absolute left-0 top-full mt-1" />
                  </div>
                </FormItem>
              )}
            />

            {showMediaType && (
              <FormField
                control={form.control}
                name="criteriaMediaType"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[140px_1fr] items-center gap-x-4">
                    <FormLabel>
                      Media Type{criteriaType !== 'TMDB_SET' ? ' (opt.)' : ''}
                    </FormLabel>
                    <div className="relative">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MOVIE">Movie</SelectItem>
                          <SelectItem value="TV_SHOW">TV Show</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="absolute left-0 top-full mt-1" />
                    </div>
                  </FormItem>
                )}
              />
            )}

            {showTmdbIds && (
              <FormField
                control={form.control}
                name="criteriaTmdbIds"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                    <FormLabel className="pt-2">TMDB Items</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <TmdbItemPicker
                          selectedIds={field.value ?? []}
                          mediaType={
                            (form.watch('criteriaMediaType') as
                              | 'MOVIE'
                              | 'TV_SHOW') || 'MOVIE'
                          }
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className="absolute left-0 top-full mt-1" />
                    </div>
                  </FormItem>
                )}
              />
            )}
          </section>

          <Separator />

          {/* Localization */}
          <section className="space-y-6">
            <div>
              <h3 className="text-base font-semibold">Localization</h3>
              <p className="text-sm text-muted-foreground">
                Translated name and description for each language.
              </p>
            </div>

            <Tabs defaultValue="en-US">
              <TabsList className="flex-wrap h-auto">
                {LANGUAGES.map(lang => (
                  <TabsTrigger key={lang.code} value={lang.code}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {LANGUAGES.map(lang => (
                <TabsContent key={lang.code} value={lang.code}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-[140px_1fr] items-center gap-x-4">
                      <label
                        htmlFor={`name-${lang.code}`}
                        className="text-sm font-medium"
                      >
                        Name
                      </label>
                      <Input
                        id={`name-${lang.code}`}
                        value={names[lang.code] ?? ''}
                        onChange={e =>
                          setNames(prev => ({
                            ...prev,
                            [lang.code]: e.target.value,
                          }))
                        }
                        placeholder={`Achievement name in ${lang.label}`}
                      />
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                      <label
                        htmlFor={`desc-${lang.code}`}
                        className="text-sm font-medium pt-2"
                      >
                        Description
                      </label>
                      <Textarea
                        id={`desc-${lang.code}`}
                        value={descriptions[lang.code] ?? ''}
                        onChange={e =>
                          setDescriptions(prev => ({
                            ...prev,
                            [lang.code]: e.target.value,
                          }))
                        }
                        placeholder={`Achievement description in ${lang.label}`}
                        rows={2}
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>
        </form>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preview
            </p>

            {/* iOS AchievementCard replica */}
            <div className="flex w-48 flex-col items-center rounded-[22px] bg-muted/60 px-4 pb-5 pt-5">
              <div className="mb-3.5">
                {iconPreview ? (
                  // biome-ignore lint/performance/noImgElement: blob/S3 URL not optimizable
                  <img
                    src={iconPreview}
                    alt="Preview"
                    className="size-24 object-contain"
                  />
                ) : (
                  <div className="flex size-24 items-center justify-center rounded-2xl bg-muted">
                    <ImagePlus className="size-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              <p className="text-center text-[15px] font-semibold leading-tight line-clamp-2">
                {names['en-US'] || 'Achievement Name'}
              </p>
              <p className="mt-1.5 text-center text-xs text-muted-foreground line-clamp-2">
                {descriptions['en-US'] || 'Achievement description'}
              </p>

              <div className="mt-4 w-full space-y-1.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="h-full rounded-full bg-foreground transition-all"
                    style={{
                      width: `${Math.min((3 / (form.watch('target') || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-center text-[11px] font-semibold tabular-nums text-muted-foreground">
                  3/{form.watch('target') || 1}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {isEditing
                ? 'Confirm the changes to this achievement?'
                : 'This is how the achievement will look. Confirm?'}
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  )
}
