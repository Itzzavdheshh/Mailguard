/**
 * Skeleton Component
 * Animated placeholder for loading states
 * Part of shadcn/ui component library
 */

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  )
}

export { Skeleton }
