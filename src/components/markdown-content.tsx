"use client"

import type { ComponentPropsWithoutRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

const PROSE = cn(
  "min-w-0 text-sm break-words",
  "[&>*]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
  "[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold",
  "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold",
  "[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold",
  "[&_p]:my-2",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
  "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:my-1 [&_li]:ps-1",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
  "[&_strong]:font-semibold",
  "[&_blockquote]:my-2 [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
  "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_table]:my-2 [&_table]:w-full [&_table]:text-xs",
  "[&_th]:border-b [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-medium",
  "[&_td]:border-b [&_td]:px-2 [&_td]:py-1",
  "[&_hr]:my-4 [&_hr]:border-border",
  "[&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-md",
)

function MarkdownLink({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  const external = /^https?:\/\//i.test(href)
  return (
    <a
      {...props}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  )
}

export function MarkdownContent({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn(PROSE, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownLink }}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
