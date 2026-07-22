import type { BootstrapData, Campus, Room, RoomPolicy, SchoolClass } from "@/lib/api/types"

const campuses: Campus[] = [
  { id: 1, name: "Shipai Campus", isPrivileged: false },
  { id: 2, name: "Knowledge City Campus", isPrivileged: false },
  { id: 3, name: "Office", isPrivileged: true },
]

const classes: SchoolClass[] = [
  [1, "Ainsworth", 1], [3, "Demis", 1], [4, "Rana", 1], [5, "Yann", 1],
  [6, "Calatrava", 1], [7, "Kate", 1], [9, "Andrew", 1], [10, "Feifei", 1],
  [11, "Gibson", 1], [12, "Loftus", 1], [13, "Seligman", 1], [14, "Maslow", 1],
  [15, "Piaget", 1], [16, "Skinner", 1], [25, "Bandura", 1], [8, "Geoffrey", 1],
  [17, "Aspect", 2], [19, "Kitaev", 2], [18, "Clauser", 2], [20, "Lieb", 2],
  [21, "Lukin", 2], [22, "Pan", 2], [23, "Shor", 2], [24, "Zeilinger", 2],
  [26, "Teachers", 3],
].map(([id, name, campus]) => ({ id: id as number, name: name as string, campus: campus as number }))

function policy(id: number, roomId: number, days: number[], startTime: number[], endTime: number[]): RoomPolicy {
  return { id, roomId, days, startTime, endTime, enabled: true }
}

const rooms: Room[] = [
  { id: 14, name: "iStudy Meeting Room 1", campus: 1, enabled: true, policies: [policy(5, 14, [0, 1, 2, 3, 4, 5, 6], [12, 0], [13, 0])] },
  { id: 15, name: "iStudy Meeting Room 2", campus: 1, enabled: true, policies: [policy(6, 15, [0, 1, 2, 3, 4, 5, 6], [12, 0], [13, 0])] },
  { id: 16, name: "Writing Center 1", campus: 1, enabled: true, policies: [policy(7, 16, [0, 1, 2, 3, 4, 5, 6], [12, 0], [13, 0])] },
  { id: 17, name: "Writing Center 2", campus: 1, enabled: true, policies: [policy(8, 17, [0, 1, 2, 3, 4, 5, 6], [12, 0], [13, 0])] },
  { id: 18, name: "606", campus: 1, enabled: true, policies: [policy(22, 18, [3], [19, 0], [21, 0])] },
  { id: 23, name: "206", campus: 1, enabled: true, policies: [] },
  { id: 24, name: "511", campus: 2, enabled: true, policies: [policy(9, 24, [0, 1, 2, 3], [6, 30], [12, 30]), policy(10, 24, [0, 1, 2, 3], [13, 30], [19, 0])] },
  { id: 25, name: "512", campus: 2, enabled: true, policies: [policy(11, 25, [0, 1, 2, 3], [6, 30], [12, 30]), policy(12, 25, [0, 1, 2, 3], [13, 30], [19, 0])] },
  { id: 26, name: "513", campus: 2, enabled: true, policies: [policy(13, 26, [0, 1, 2, 3], [6, 30], [12, 30]), policy(20, 26, [0], [19, 0], [21, 0]), policy(14, 26, [0, 1, 2, 3], [13, 30], [19, 0])] },
  { id: 21, name: "602", campus: 1, enabled: false, policies: [] },
  { id: 22, name: "601", campus: 1, enabled: false, policies: [] },
  { id: 28, name: "524", campus: 2, enabled: false, policies: [policy(2, 28, [0, 1, 2, 3, 4, 5, 6], [10, 15], [11, 10])] },
  { id: 29, name: "105", campus: 1, enabled: false, policies: [] },
  { id: 34, name: "104", campus: 1, enabled: false, policies: [] },
  { id: 27, name: "514", campus: 2, enabled: false, policies: [] },
  { id: 33, name: "303", campus: 1, enabled: true, policies: [policy(21, 33, [3], [19, 0], [21, 0])] },
  { id: 32, name: "603", campus: 1, enabled: false, policies: [] },
  { id: 19, name: "605", campus: 1, enabled: true, policies: [] },
  { id: 30, name: "501", campus: 2, enabled: false, policies: [policy(17, 30, [0, 1, 2, 3], [6, 30], [12, 30]), policy(18, 30, [0, 1, 2, 3], [13, 30], [19, 0])] },
  { id: 35, name: "502", campus: 2, enabled: true, policies: [] },
  { id: 36, name: "101", campus: 1, enabled: true, policies: [policy(23, 36, [0, 1, 2, 3, 4, 5, 6], [18, 0], [22, 0])] },
]

export const catalogSnapshot = {
  schemaVersion: 1,
  dataVersion: "production-catalog-2026-07-22",
  generatedAt: "2026-07-22T00:00:00.000Z",
  campuses,
  classes,
  rooms,
} satisfies Omit<BootstrapData, "specialFacilities">
