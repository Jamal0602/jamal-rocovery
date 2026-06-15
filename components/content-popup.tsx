"use client"
import { useState } from "react"
import type React from "react"

import AdvancedPopup from "@/components/advanced-popup"

interface ContentPopupProps {
  children: React.ReactNode
  type: "post" | "project" | "event"
  item: any
  onTagClick?: (tag: string) => void
}

export default function ContentPopup({ children, type, item, onTagClick }: ContentPopupProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer h-full">
        {children}
      </div>

      <AdvancedPopup isOpen={isOpen} onClose={handleClose} item={item} type={type} />
    </>
  )
}

