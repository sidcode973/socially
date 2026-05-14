import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:ring-2 focus:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
