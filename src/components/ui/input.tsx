import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base shadow-sm transition-all duration-300 ease-in-out placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
