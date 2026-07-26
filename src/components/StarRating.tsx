type Props = {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
}

export function StarRating({ value, onChange, size = 'md' }: Props) {
  return (
    <div className={`flex gap-0.5 ${SIZE_CLASSES[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`leading-none ${star <= value ? 'text-flame' : 'text-cream/20'} ${
            onChange ? 'cursor-pointer' : ''
          }`}
          aria-label={`${star} sterren`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
