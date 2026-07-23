"use server"

import { getBootstrap } from "@/lib/api/catalog"
import { ApiError } from "@/lib/api/client"
import { createReservation, getAvailability } from "@/lib/api/reservations"
import type { AvailabilityData, BootstrapData } from "@/lib/api/types"

import {
  createReservationSchema,
  formValueToDate,
  rangeIsAvailable,
  type ReservationFormValues,
} from "./form"

type ActionError = "conflict" | "invalid" | "network" | "unknown"

type ActionResult<T> =
  | { data: T; error?: never }
  | {
      data?: never
      error: ActionError
      diagnostic?: { status?: number; code?: string; message?: string }
    }

function actionFailure(error: unknown): Exclude<ActionResult<never>, { data: never }> {
  if (error instanceof ApiError) {
    return {
      error:
        error.status === 0
          ? "network"
          : error.status === 409
            ? "conflict"
            : "unknown",
      diagnostic: {
        status: error.status,
        code: error.code,
        message: error.message,
      },
    }
  }
  return {
    error: "unknown",
    diagnostic: {
      message: error instanceof Error ? error.message : String(error),
    },
  }
}

export async function loadReservationCatalog(): Promise<
  ActionResult<BootstrapData>
> {
  try {
    return { data: await getBootstrap() }
  } catch (error) {
    return actionFailure(error)
  }
}

export async function checkReservationAvailability(
  roomId: number,
  date: string
): Promise<ActionResult<AvailabilityData>> {
  if (!Number.isInteger(roomId) || roomId <= 0 || !formValueToDate(date)) {
    return { error: "invalid" }
  }

  try {
    return { data: await getAvailability(roomId, date) }
  } catch (error) {
    return actionFailure(error)
  }
}

export async function submitReservation(
  values: ReservationFormValues
): Promise<ActionResult<{ reservationId?: number; message?: string }>> {
  const parsed = createReservationSchema(() => "Invalid input").safeParse(
    values
  )
  if (!parsed.success || !formValueToDate(parsed.data.date)) {
    return { error: "invalid" }
  }

  try {
    const availability = await getAvailability(
      parsed.data.room,
      parsed.data.date
    )
    if (
      !rangeIsAvailable(
        availability.slots,
        parsed.data.startTime,
        parsed.data.endTime
      )
    ) {
      return { error: "conflict" }
    }

    const response = await createReservation({
      classId: parsed.data.classId,
      room: parsed.data.room,
      studentName: parsed.data.studentName.trim(),
      studentId: parsed.data.studentId.trim().toUpperCase(),
      email: parsed.data.email.trim(),
      reason: parsed.data.reason.trim(),
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
    })
    return {
      data: {
        reservationId: response.data?.reservationId,
        message: response.message,
      },
    }
  } catch (error) {
    return actionFailure(error)
  }
}
