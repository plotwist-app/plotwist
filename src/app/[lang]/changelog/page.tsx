import { Pattern } from '@/components/pattern'
import { MdxSupport } from './components/mdx-support'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

export async function generateMetadata({ params }: PageProps) {
  const {
    changelog: { title, description },
  } = await getDictionary(params.lang)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: '[PlotTwist]',
    },
    twitter: {
      title,
      description,
    },
  }
}

const ChangeLog = async ({ params }: PageProps) => {
  const { changelog } = await getDictionary(params.lang)

  return (
    <>
      <Pattern variant="checkered" />

      <div className="space-y-8">
        <div className="mx-auto flex h-[40vh] max-w-6xl flex-col items-center justify-center space-y-6 border-b p-4">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold lg:text-6xl">
              {changelog.title}
            </h1>

            <p className="lg:text-md text-sm text-muted-foreground">
              {changelog.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="cursor-not-allowed text-sm font-semibold underline underline-offset-2 opacity-50">
              {changelog.subscribe}
            </span>
          </div>
        </div>

        <MdxSupport />
      </div>
    </>
  )
}

export default ChangeLog
