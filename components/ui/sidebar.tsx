"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sidebarVariants = cva(
  "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "w-64",
        narrow: "w-16",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface SidebarContextValue {
  isOpen: boolean
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextValue>({
  isOpen: true,
  toggle: () => {},
})

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return <SidebarContext.Provider value={{ isOpen, toggle }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {}

export function Sidebar({ className, variant, ...props }: SidebarProps) {
  const { isOpen } = useSidebar()

  return (
    <div
      className={cn(
        sidebarVariants({
          variant: isOpen ? variant : "narrow",
        }),
        className,
      )}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 p-4 border-b", className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto p-4", className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 border-t", className)} {...props} />
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4", className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isActive?: boolean
  size?: "default" | "sm" | "lg"
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, asChild = false, isActive = false, size = "default", ...props }, ref) => {
    const { isOpen } = useSidebar()
    const Comp = asChild ? React.Fragment : "button"
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 py-1.5 text-sm",
      lg: "h-12 px-5 py-2.5",
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          "flex w-full items-center gap-3 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-accent text-accent-foreground hover:bg-accent/80"
            : "hover:bg-accent hover:text-accent-foreground",
          sizeClasses[size],
          !isOpen && "justify-center px-0",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export function SidebarMenuSub({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  const { isOpen } = useSidebar()

  return <ul className={cn("ml-4 space-y-1 border-l pl-2", !isOpen && "ml-0 border-l-0 pl-0", className)} {...props} />
}

export function SidebarMenuSubItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />
}

interface SidebarMenuSubButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isActive?: boolean
}

export const SidebarMenuSubButton = React.forwardRef<HTMLButtonElement, SidebarMenuSubButtonProps>(
  ({ className, asChild = false, isActive = false, ...props }, ref) => {
    const { isOpen } = useSidebar()
    const Comp = asChild ? React.Fragment : "button"

    return (
      <Comp
        ref={ref}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-accent text-accent-foreground hover:bg-accent/80"
            : "hover:bg-accent hover:text-accent-foreground",
          !isOpen && "justify-center px-0",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export function SidebarRail({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("absolute inset-y-0 right-0 w-1 cursor-ew-resize bg-border transition-opacity", className)}
      {...props}
    />
  )
}

export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = useSidebar()

  return (
    <div
      className={cn(
        "flex flex-col ml-64 transition-all duration-300 ease-in-out",
        isOpen ? "ml-64" : "ml-16",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggle } = useSidebar()

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

