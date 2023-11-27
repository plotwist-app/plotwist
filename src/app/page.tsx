export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="font-bold text-6xl">TMDB</h1>
      <p className="text-md">The Movie Database Front-end Project</p>

      <p className="text-sm opacity-50">
        Built with{' '}
        <a href="https://nextjs.org/" className="underline" target="_blank">
          Next.js
        </a>
        ,{' '}
        <a
          href="https://tailwindcss.com/"
          className="underline"
          target="_blank"
        >
          TailwindCSS
        </a>
        ,{' '}
        <a href="https://ui.shadcn.com/" className="underline" target="_blank">
          shadcn{' '}
        </a>
        and{' '}
        <a href="TMDB API services." className="underline" target="_blank">
          TMDB API services.
        </a>
      </p>
    </div>
  )
}
