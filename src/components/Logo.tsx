type Props = {
  className?: string
}

export function Logo({ className = 'h-6' }: Props) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}images/site-logo.png`}
      alt="BBQHeros — kook je eigen shit"
      className={`w-auto ${className}`}
    />
  )
}
