import React from "react"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
import { Paperclip, Phone, Video, Info, ArrowLeft } from "lucide-react"

export default function ChatHeader({ contact, onBack, onOpenPinned }) {
  const initials = (contact?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex items-center gap-3 border-b border-border px-3 py-2 md:px-4 md:py-3 bg-soft-gray">
      {/* Back Button (mobile only) */}
      {onBack && (
        <div className="md:hidden">
          <button variant="ghost" size="icon" onClick={onBack} aria-label="Back to contacts">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Avatar */}
      <div className="h-9 w-9">
        <img src={contact?.avatar || "/placeholder.svg"} alt={contact?.name || "Contact"} />
        <p>{initials}</p>
      </div>

      {/* Contact Info */}
      <div className="min-w-0 flex-1">
        <h2 className="text-sm md:text-base font-medium truncate">{contact?.name || "—"}</h2>
        <p className="text-xs text-muted-foreground truncate">Online • Tap paperclip for pinned files</p>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <button variant="ghost" size="icon" aria-label="Call">
          <Phone className="h-5 w-5" />
        </button>
        <button variant="ghost" size="icon" aria-label="Video">
          <Video className="h-5 w-5" />
        </button>
        <button variant="ghost" size="icon" aria-label="Info">
          <Info className="h-5 w-5" />
        </button>
        <button
          variant="secondary"
          size="icon"
          onClick={onOpenPinned}
          aria-label="Pinned files"
          className="bg-brand text-brand-foreground hover:opacity-90"
        >
          <Paperclip className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
