type BannerProps = {
  url?: string
}

export const Banner = ({ url }: BannerProps) => {
  return (
    <div className={`h-[80vh] overflow-hidden border-b`}>
      <div
        style={{
          backgroundImage: `url('${url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="h-full w-full brightness-50"
        data-testid="banner"
      />
    </div>
  )
}
