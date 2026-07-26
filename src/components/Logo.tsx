type Props = {
  className?: string
}

export function LogoMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <rect width="20" height="20" fill="#FF5B14" />
      <rect x="2" y="5.6" width="16" height="2.6" fill="#0B0B0B" />
      <rect x="2" y="11.6" width="16" height="2.6" fill="#0B0B0B" />
    </svg>
  )
}

export function Logo({ className = '' }: Props) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="font-display tracking-tight">
        THE<span className="text-flame">GRILL</span>BOOK
      </span>
    </span>
  )
}
