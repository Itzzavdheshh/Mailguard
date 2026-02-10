/**
 * Sonner Toast Component
 * Modern toast notifications for user feedback
 */

import { Toaster as Sonner } from "sonner"

function Toaster({ ...props }) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-800 group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-700 group-[.toaster]:shadow-xl",
          description: "group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:hover:bg-blue-500",
          cancelButton:
            "group-[.toast]:bg-slate-700 group-[.toast]:text-slate-100 group-[.toast]:hover:bg-slate-600",
          success:
            "group-[.toaster]:bg-slate-800 group-[.toaster]:text-emerald-400 group-[.toaster]:border-emerald-500/30",
          error:
            "group-[.toaster]:bg-slate-800 group-[.toaster]:text-rose-400 group-[.toaster]:border-rose-500/30",
          warning:
            "group-[.toaster]:bg-slate-800 group-[.toaster]:text-amber-400 group-[.toaster]:border-amber-500/30",
          info:
            "group-[.toaster]:bg-slate-800 group-[.toaster]:text-blue-400 group-[.toaster]:border-blue-500/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
