import { useEffect } from "react"
import { FileText, X } from "lucide-react"

export default function DocumentModal({ open, onOpenChange, file }) {
  // Close modal on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-lg rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">Document</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex items-center gap-3 rounded-lg border m-4 p-3">
          <FileText className="h-6 w-6 text-gray-600" />
          <div className="flex-1">
            <p className="font-medium">{file?.name || "document"}</p>
            <p className="text-sm text-gray-500">Click download to view</p>
          </div>
          {file?.url && (
            <a
              href={file.url}
              download={file.name}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
            >
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
