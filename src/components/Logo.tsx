type Props = {
  className?: string
}

export function Logo({ className = 'h-6' }: Props) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}images/bbqheros-lockup-dark.svg`}
      alt="BBQHeros — kook je eigen shit"
      className={`w-auto ${className}`}
    />
  )
}
