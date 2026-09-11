"use client"

import { useState } from "react"
import {
  ArrowUp,
  CalendarPlus,
  Download,
  Info,
  MapPin,
  Search,
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

const IOS_APP_URL =
  "https://apps.apple.com/us/app/hfi-utility-center/id6793809017"

export default function Page() {
  const nav = useTranslations("nav")
  const announcement = useTranslations("home.announcement")
  const [announcementOpen, setAnnouncementOpen] = useState(true)

  return (
    <>
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <section className="w-full max-w-4xl text-center">
          <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
            HFI Utility Center
          </h1>
          <div className="mt-5 flex items-center justify-center gap-10 text-lg font-medium tracking-tight sm:mt-10">
            <Link
              href="/reservation/create"
              className="inline-flex items-center gap-2 border-b-2 border-transparent pb-1 leading-none hover:border-current"
            >
              <CalendarPlus className="size-4" />
              {nav("book")}
            </Link>
            <Link
              href="/reservation/search"
              className="inline-flex items-center gap-2 border-b-2 border-transparent pb-1 leading-none hover:border-current"
            >
              <Search className="size-4" />
              {nav("reservations")}
            </Link>
          </div>
        </section>
      </main>

      <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader className="pr-8">
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info className="size-5" />
            </div>
            <DialogTitle className="text-xl">
              {announcement("title")}
            </DialogTitle>
            <DialogDescription>{announcement("description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <section className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="space-y-1">
                <h2 className="font-medium">{announcement("campusTitle")}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {announcement("campusDescription")}
                </p>
              </div>
            </section>

            <Separator />

            <section className="flex gap-3">
              <ArrowUp className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="space-y-3">
                <div className="space-y-1">
                  <h2 className="font-medium">
                    {announcement("priorityTitle")}
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {announcement("priorityDescription")}
                  </p>
                </div>
                <ol className="grid gap-2 text-sm sm:grid-cols-2">
                  {["teacher", "club", "presentation", "personal"].map(
                    (priority, index) => (
                      <li
                        key={priority}
                        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium ring-1 ring-border">
                          {index + 1}
                        </span>
                        {announcement(`priority.${priority}`)}
                      </li>
                    )
                  )}
                </ol>
              </div>
            </section>

            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {announcement("iosDescription")}
              </p>
              <Button asChild className="mt-3 w-full sm:w-auto">
                <a href={IOS_APP_URL} target="_blank" rel="noreferrer">
                  <Download />
                  {announcement("iosAction")}
                </a>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{announcement("close")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
