"use client"

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  XCircle,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Spinner } from "@/components/astryx"
import {
  ActionButton,
  NeoFooter,
  NeoPage,
  StatusBadge,
  Surface,
} from "@/components/neo/shared"
import {
  cancelReservation,
  previewCancellation,
  type CancellationPreview,
} from "@/lib/api/reservations"

export default function CancelReservationPage() {
  const params = useSearchParams()
  const token = params.get("token") || ""
  const [preview, setPreview] = useState<CancellationPreview>()
  const [loading, setLoading] = useState(Boolean(token))
  const [working, setWorking] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!token) return
    let active = true

    previewCancellation(token)
      .then((value) => {
        if (active) setPreview(value)
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "此取消链接无效或已过期。"
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  async function cancel() {
    setWorking(true)
    setError(undefined)
    try {
      await cancelReservation(token)
      setDone(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "暂时无法取消预约。")
    } finally {
      setWorking(false)
    }
  }

  return (
    <NeoPage>
      <main className="internal-main cancel-page">
        <div className="cancel-shell">
          <span className="page-overline">HFI Utility Center</span>
          <h1>{done ? "预约已取消" : "取消预约"}</h1>
          <p>
            {done
              ? "该时段已重新开放给其他同学。"
              : "请核对预约信息后再确认取消。"}
          </p>
          <Surface className="cancel-card">
            {loading ? (
              <div className="neo-load-state cancel-loading">
                <Spinner />
                <strong>正在读取预约</strong>
              </div>
            ) : null}
            {error || !token ? (
              <div className="cancel-message cancel-message--error">
                <XCircle size={20} />
                <span>{error || "取消链接不完整。"}</span>
              </div>
            ) : null}
            {done ? (
              <div className="cancel-message cancel-message--success">
                <CheckCircle2 size={24} />
                <div>
                  <strong>取消成功</strong>
                  <span>无需执行其他操作。</span>
                </div>
              </div>
            ) : null}
            {preview && !done ? (
              <div className="cancel-reservation">
                <div className="cancel-reservation__head">
                  <div>
                    <span className="page-overline">
                      Reservation #{preview.reservationId}
                    </span>
                    <h2>{preview.roomName}</h2>
                  </div>
                  <StatusBadge
                    tone={preview.status === "approved" ? "success" : "warning"}
                  >
                    {preview.status === "approved" ? "已确认" : "待审批"}
                  </StatusBadge>
                </div>
                <div className="cancel-detail-grid">
                  <div>
                    <MapPin size={17} />
                    <span>预约地点</span>
                    <strong>{preview.roomName}</strong>
                  </div>
                  <div>
                    <CalendarDays size={17} />
                    <span>预约日期</span>
                    <strong>{preview.startTime.slice(0, 10)}</strong>
                  </div>
                  <div>
                    <Clock3 size={17} />
                    <span>预约时间</span>
                    <strong>
                      {preview.startTime.slice(11, 16)} -{" "}
                      {preview.endTime.slice(11, 16)}
                    </strong>
                  </div>
                  <div>
                    <CheckCircle2 size={17} />
                    <span>预约人</span>
                    <strong>{preview.studentName}</strong>
                  </div>
                </div>
                <div className="cancel-tags">
                  <span>
                    {preview.purposeType === "personal"
                      ? "个人"
                      : preview.purposeType === "class"
                        ? "班级"
                        : preview.purposeType === "club"
                          ? "社团"
                          : "历史预约"}
                  </span>
                  {preview.needsMultimedia ? <span>需要多媒体设备</span> : null}
                </div>
              </div>
            ) : null}
            <div className="cancel-actions">
              {!done && preview ? (
                <ActionButton
                  variant="destructive"
                  disabled={working}
                  onClick={cancel}
                >
                  {working ? <Spinner /> : <XCircle size={16} />}确认取消预约
                </ActionButton>
              ) : null}
              <ActionButton variant="secondary" href="/">
                返回首页
              </ActionButton>
            </div>
          </Surface>
        </div>
      </main>
      <NeoFooter />
    </NeoPage>
  )
}
