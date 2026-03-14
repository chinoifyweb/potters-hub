import Image from "next/image"
import { cn } from "@/lib/utils"

interface ChurchLogoProps {
  size?: number
  className?: string
}

export function ChurchLogo({ size = 36, className }: ChurchLogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="TPHC Logo"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      priority
    />
  )
}

export function ChurchLogoIcon({ size = 20, className }: ChurchLogoProps) {
  return (
    <Image
      src="/icon.svg"
      alt="TPHC"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      priority
    />
  )
}
