import { getTranslations } from "next-intl/server"

export default async function AboutPage() {
  const t = await getTranslations("about")
  return <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
    <p className="text-sm font-semibold text-red-600">{t("eyebrow")}</p>
    <h1 className="mt-4 max-w-4xl text-4xl font-semibold sm:text-6xl">{t("title")}</h1>
    <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">{t("body")}</p>
    <div className="mt-14 grid gap-10 border-t pt-8 md:grid-cols-2">
      <section><h2 className="text-xl font-semibold">{t("principleTitle")}</h2><p className="mt-3 leading-7 text-muted-foreground">{t("principleBody")}</p></section>
      <section><h2 className="text-xl font-semibold">{t("privacyTitle")}</h2><p className="mt-3 leading-7 text-muted-foreground">{t("privacyBody")}</p></section>
    </div>
  </main>
}
