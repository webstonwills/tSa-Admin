import { useTheme } from "next-themes"
import { ExternalLink, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Enhanced toast with built-in icons and styling
interface EnhancedToastOptions {
  duration?: number;
  icon?: React.ReactNode;
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  description?: string;
  closeButton?: boolean;
}

// Create enhanced toast utility
export const notify = {
  success: (message: string, options?: EnhancedToastOptions) => {
    return sonnerToast.success(message, {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      duration: 5000,
      className: "rounded-md border-green-200 shadow-md backdrop-blur-sm bg-white/95 dark:bg-gray-900/95",
      position: "top-center",
      ...options,
    });
  },
  error: (message: string, options?: EnhancedToastOptions) => {
    return sonnerToast.error(message, {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      duration: 6000,
      className: "rounded-md border-red-200 shadow-md backdrop-blur-sm bg-white/95 dark:bg-gray-900/95",
      position: "top-center",
      ...options,
    });
  },
  warning: (message: string, options?: EnhancedToastOptions) => {
    return sonnerToast.warning(message, {
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      duration: 6000,
      className: "rounded-md border-amber-200 shadow-md backdrop-blur-sm bg-white/95 dark:bg-gray-900/95",
      position: "top-center",
      ...options,
    });
  },
  info: (message: string, options?: EnhancedToastOptions) => {
    return sonnerToast.info(message, {
      icon: <Info className="h-5 w-5 text-blue-500" />,
      duration: 5000,
      className: "rounded-md border-blue-200 shadow-md backdrop-blur-sm bg-white/95 dark:bg-gray-900/95",
      position: "top-center",
      ...options,
    });
  },
  // More specialized versions
  authSuccess: (message: string, options?: EnhancedToastOptions) => {
    return sonnerToast.success(message, {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      duration: 5000,
      description: "You're now signed in. Redirecting...",
      className: "rounded-md border-green-200 shadow-md backdrop-blur-sm bg-white/95 dark:bg-gray-900/95",
      position: "top-center",
      ...options,
    });
  },
  authError: (message: string, options?: EnhancedToastOptions) => {
    return sonnerToast.error(message, {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      duration: 6000,
      description: "There was a problem with your authentication.",
      className: "rounded-md border-red-200 shadow-md backdrop-blur-sm bg-white/95 dark:bg-gray-900/95",
      position: "top-center",
      ...options,
    });
  },
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-4 md:max-w-[380px] w-[calc(100%-32px)] mb-2",
          title: "group-[.toast]:font-medium group-[.toast]:text-base",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm mt-1",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          // Add custom animation effects
          success: "group-[.toast]:border-l-4 group-[.toast]:border-l-green-500",
          error: "group-[.toast]:border-l-4 group-[.toast]:border-l-red-500",
          warning: "group-[.toast]:border-l-4 group-[.toast]:border-l-amber-500",
          info: "group-[.toast]:border-l-4 group-[.toast]:border-l-blue-500",
        },
      }}
      {...props}
    />
  )
}

// Only export the enhanced toast and Toaster
export { Toaster }
