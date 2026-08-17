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
  DialogTrigger,
} from "@/components/ui/dialog"

export function ReservationTermsDialog() {
  const t = useTranslations("booking")
  const translatedTerms = t.raw("terms.items")
  const terms = Array.isArray(translatedTerms)
    ? translatedTerms.filter((term): term is string => typeof term === "string")
    : []

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer leading-snug font-medium underline underline-offset-4">
        {t("terms.link")}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("terms.title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("terms.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-3">
          <ol className="space-y-4 pr-2 leading-7 text-foreground">
            {terms.map((term, index) => (
              <li key={term} className="grid grid-cols-[2rem_minmax(0,1fr)]">
                <span aria-hidden="true" className="tabular-nums">
                  {index + 1}.
                </span>
                <span>{term}</span>
              </li>
            ))}
          </ol>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("terms.close")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
