"use client"

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import clsx from "clsx"

export default function ContactItem({ contact, active, onClick }) {
  const initials = (contact?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.button
      layout
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors",
        active ? "bg-brand text-brand-foreground" : "hover:bg-muted/60 bg-transparent"
      )}
    >
      <div className="h-10 w-10">
        <img src={contact?.avatar || "/placeholder.svg"} alt={contact?.name || "Contact"} />
        <p>{initials}</p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate font-medium">{contact?.name}</p>
          {contact?.lastTime ? (
            <span className={clsx("ml-2 text-xs", active ? "opacity-90" : "text-muted-foreground")}>
              {contact.lastTime}
            </span>
          ) : null}
        </div>
        {contact?.lastMessage ? (
          <p className={clsx("truncate text-sm", active ? "opacity-90" : "text-muted-foreground")}>
            {contact.lastMessage}
          </p>
        ) : null}
      </div>
    </motion.button>
  )
}
