import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8"
    };

    return (
      <div ref={ref} className={cn("flex items-center justify-center", className)} {...props}>
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      </div>
    );
  }
);

Spinner.displayName = "Spinner"; 