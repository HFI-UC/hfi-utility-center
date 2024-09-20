import axios from "axios"

export interface ApplicationInfo {
    studentName: string
    selectedRoom: number | null
    studentId: string
    email: string
    date: string
    startTime: string
    endTime: string
    reason: string
}

export interface RoomPolicyInfo {
    classroom: string
    days: string
    start_time: string
    end_time: string
}

export interface Policy {
    policy: RoomPolicyInfo[]
}

export interface ReservationInfo {
    success: boolean
    data: {
        name: string
        email: string
        time: string
        reason: string
        room: number
        auth: string
    }[]
}

export async function fetchPolicy() {
    const res = await axios.get<Policy>('/api/fetchPolicy.php')
    console.log(res.data)
    return res.data
}

export async function fetchReservation() {
    const res = await axios.get<ReservationInfo>('/api/getresv.php')
    console.log(res.data)
    return res.data
}

export async function postApplication(application: ApplicationInfo) {
    const startTime = new Date(
        `${application.date}T${application.startTime}`,
    );
    const endTime = new Date(
        `${application.date}T${application.endTime}`,
    );
    const res = await axios.post('/api/addres.php', {
        room: application.selectedRoom,
        email: application.email,
        time: `${startTime.getTime()}-${endTime.getTime()}`,
        name: application.studentName,
        reason: application.reason,
        sid: application.studentId
    })
    return res.data
}