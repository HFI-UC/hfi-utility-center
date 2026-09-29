"use client"

import { ShieldAlert } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { EmptyState, LoadingState } from "@/components/layout/data-state"
import { PageHeader } from "@/components/layout/page-header"
import { getAdminSession } from "@/lib/api/auth"

import { StudentDirectory } from "../user/student-directory"

export default function AdminStudentsPage() {
  const t = useTranslations("admin")
  const [role, setRole] = useState<"global" | "room" | "unknown">("unknown")

  useEffect(() => {
    let active = true
    void getAdminSession()
      .then((session) => {
        if (active) setRole(session.role)
      })
      .catch(() => {
        if (active) setRole("room")
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title={t("studentsTitle")} description={t("studentsDescription")} />
      {role === "unknown" ? (
        <LoadingState label={t("studentsLoading")} />
      ) : role === "global" ? (
        <StudentDirectory />
      ) : (
        <EmptyState
          icon={ShieldAlert}
          title={t("studentsRestricted")}
          description={t("studentsRestrictedDescription")}
        />
      )}
    </div>
  )
}
