import { PropsWithChildren } from 'react'

export const Container = (props: PropsWithChildren) => {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-4 lg:px-0" {...props} />
  )
}
