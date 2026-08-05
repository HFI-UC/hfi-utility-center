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
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 align-baseline">
          {t("terms.link")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 rounded-lg border bg-popover shadow-2xl sm:max-w-3xl">
        <DialogHeader className="border-b pr-8 pb-5">
          <DialogTitle className="text-xl">{t("terms.title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("terms.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto py-5 pr-3">
          <ol className="space-y-4 pr-2 leading-7 text-muted-foreground">
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
        <DialogFooter className="border-t pt-5">
          <DialogClose asChild>
            <Button variant="outline">{t("terms.close")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
