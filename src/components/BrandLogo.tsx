interface BrandLogoProps {
  className?: string
}

export function BrandLogo({ className }: BrandLogoProps) {
  return <img src="/dmk-logo.webp" alt="De_Mayor Kitchen logo" className={className} />
}
