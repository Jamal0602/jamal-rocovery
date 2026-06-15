import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client"

export const metadata: Metadata = {
  title: "Space Hover — The Heart of Space Research",
  description: "An open, real-time aerospace platform by Cubiz Group.",
  icons: {
    icon: "https://file.cubiz.space/logo/png/ja.jpg",
    apple: "https://file.cubiz.space/logo/png/ja.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}
