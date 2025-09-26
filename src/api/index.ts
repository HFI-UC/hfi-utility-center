import axios from "axios";

axios.defaults.baseURL = process.env.BACKEND_URL;
axios.defaults.withCredentials = true;
axios.defaults.validateStatus = () => true;

export interface ReservationRequestInfo {
    classId: number;
    studentName: string;
    room: number;
    studentId: string;
    email: string;
    date: Date;
    startTime: string;
    endTime: string;
    reason: string;
    campus: string;
    isAgreed: boolean;
    turnstileToken: string;
}

export interface Reservation {
    studentName: string;
    studentId?: string;
    email: string;
    startTime: string;
    endTime: string;
    className: string;
    roomName: string;
    reason: string;
    createdAt?: string;
    campusName?: string;
    latestExecutor?: string;
    status?: "pending" | "approved" | "rejected";
}

export interface RoomPolicy {
    id: number;
    room: number;
    days: number[];
    startTime: number[];
    endTime: number[];
    enabled: boolean;
}

export interface Room {
    id: number;
    name: string;
    campus: number;
}

export interface Class {
    id: number;
    name: string;
    campus: number;
    createdAt: string;
}

export interface Campus {
    id: number;
    name: string;
    createdAt: string;
    isPrivileged: boolean;
}

export interface BasicResponse {
    data: any;
    message: string | null;
    success: boolean;
}

export interface RoomApprover {
    id: number;
    room: number;
    admin: number;
}

export interface Admin {
    id: number;
    email: string;
    name: string;
}

export interface Analytics {
    today: {
        requests: number;
        reservations: number;
        reservationCreations: number;
        approvals: number;
        rejections: number;
    };
    weekly: {
        reservations: number[];
        reservationCreations: number[];
        approvals: number[];
        rejections: number[];
    };
    monthly: {
        reservations: number[];
        reservationCreations: number[];
        approvals: number[];
        rejections: number[];
    };
    daily: {
        requests: number[];
        reservations: number[];
        reservationCreations: number[];
        approvals: number[];
        rejections: number[];
    };
    cpu: number;
    memory: number;
    errorLogs: number;
}

export async function getCampuses() {
    const response = await axios.get<BasicResponse>("/campus/list");
    return response.data;
}

export async function getRooms() {
    const response = await axios.get<{
        success: boolean;
        data: Room[];
    }>("/room/list");
    return response.data;
}

export async function getClasses() {
    const response = await axios.get<BasicResponse & { data: Class[] }>(
        "/class/list",
    );
    return response.data;
}

export async function getPolicies() {
    const response = await axios.get<BasicResponse & { data: RoomPolicy[] }>(
        "/policy/list",
    );
    return response.data;
}

export async function postFetchReservations(
    keyword: string | null = null,
    room: number | null = null,
    status: string | null = null,
) {
    const response = await axios.post<BasicResponse>("/reservation/get", {
        keyword: keyword == "" ? null : keyword,
        room,
        status,
    });
    return response.data;
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export async function postCreateReservation(
    reservation: ReservationRequestInfo,
) {
    const data = {
        classId: reservation.classId,
        studentName: reservation.studentName,
        room: reservation.room,
        studentId: reservation.studentId,
        email: reservation.email,
        startTime:
            new Date(
                `${formatDate(reservation.date)}T${reservation.startTime}`,
            ).getTime() / 1000,
        endTime:
            new Date(
                `${formatDate(reservation.date)}T${reservation.endTime}`,
            ).getTime() / 1000,
        reason: reservation.reason,
        turnstileToken: reservation.turnstileToken
    };
    const response = await axios.post<BasicResponse>(
        "/reservation/create",
        data,
    );
    return response.data;
}

export async function postLogin(
    email: string | null,
    password: string | null,
    token: string | null,
    turnstileToken: string | null,
) {
    const response = await axios.post<BasicResponse>("/admin/login", {
        email,
        password,
        token,
        turnstileToken
    });
    return response.data;
}

export async function getCheckLogin() {
    const response = await axios.get<BasicResponse>("/admin/check-login");
    return response.data;
}

export async function getRecentReservations() {
    const response = await axios.get<BasicResponse & { data: Reservation[] }>(
        "/reservation/future",
    );
    return response.data;
}

export async function postApproveReservation(
    id: number,
    approved: boolean,
    reason: string | null = null,
) {
    const response = await axios.post<BasicResponse>(`/reservation/approval`, {
        id,
        reason,
        approved,
    });
    return response.data;
}

export async function getAllReservations() {
    const response = await axios.get<BasicResponse & { data: Reservation[] }>(
        "/reservation/all",
    );
    return response.data;
}

export function getExportReservations(
    startTime: number | null,
    endTime: number | null,
) {
    const params: Record<string, number> = {};
    params.startTime = startTime || -1;
    params.endTime = endTime || -1;
    const base = (axios.defaults.baseURL || "").replace(/\/$/, "");
    const stringParams: Record<string, string> = Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
    );
    const qs = new URLSearchParams(stringParams).toString();
    const downloadUrl = `${base}/reservation/export${qs ? `?${qs}` : ""}`;
    window.location.href = downloadUrl;
    return;
}

export async function postDeleteRoom(id: number) {
    const response = await axios.post<BasicResponse>("/room/delete", { id });
    return response.data;
}

export async function postDeleteCampus(id: number) {
    const response = await axios.post<BasicResponse>("/campus/delete", { id });
    return response.data;
}

export async function postDeleteClass(id: number) {
    const response = await axios.post<BasicResponse>("/class/delete", { id });
    return response.data;
}

export async function postCreateRoom(
    name: string,
    campus: number,
    policy: RoomPolicy[],
) {
    const response = await axios.post<BasicResponse>("/room/create", {
        name,
        campus,
        policy,
    });
    return response.data;
}

export async function postCreateCampus(name: string) {
    const response = await axios.post<BasicResponse>("/campus/create", {
        name,
    });
    return response.data;
}

export async function postCreateClass(name: string, campus: number) {
    const response = await axios.post<BasicResponse>("/class/create", {
        name,
        campus,
    });
    return response.data;
}

export async function postCreatePolicy(
    room: number,
    startTime: number[],
    endTime: number[],
    days: number[],
) {
    const response = await axios.post<BasicResponse>("/policy/create", {
        room,
        startTime,
        endTime,
        days,
    });
    return response.data;
}

export async function postEditPolicy(
    id: number,
    startTime: number[],
    endTime: number[],
    days: number[],
) {
    const response = await axios.post<BasicResponse>("/policy/edit", {
        id,
        startTime,
        endTime,
        days,
    });
    return response.data;
}

export async function postDeletePolicy(id: number) {
    const response = await axios.post<BasicResponse>("/policy/delete", { id });
    return response.data;
}

export async function postTogglePolicy(id: number) {
    const response = await axios.post<BasicResponse>("/policy/toggle", { id });
    return response.data;
}

export async function postEditClass(id: number, name: string, campus: number) {
    const response = await axios.post<BasicResponse>("/class/edit", {
        id,
        name,
        campus,
    });
    return response.data;
}

export async function postEditRoom(id: number, name: string, campus: number) {
    const response = await axios.post<BasicResponse>("/room/edit", {
        id,
        name,
        campus,
    });
    return response.data;
}

export async function postEditCampus(id: number, name: string) {
    const response = await axios.post<BasicResponse>("/campus/edit", {
        id,
        name,
    });
    return response.data;
}

export async function getLogOut() {
    const response = await axios.get<BasicResponse>("/admin/logout");
    return response.data;
}

export async function getApprovers() {
    const response = await axios.get<BasicResponse & { data: RoomApprover[] }>(
        "/approver/list",
    );
    return response.data;
}

export async function getAdmins() {
    const response = await axios.get<BasicResponse & { data: Admin[] }>(
        "/admin/list",
    );
    return response.data;
}

export async function postCreateApprover(room: number, admin: number) {
    const response = await axios.post<BasicResponse>("/approver/create", {
        room,
        admin,
    });
    return response.data;
}

export async function postDeleteApprover(id: number) {
    const response = await axios.post<BasicResponse>("/approver/delete", {
        id,
    });
    return response.data;
}

export async function postCreateAdmin(
    name: string,
    email: string,
    password: string,
) {
    const response = await axios.post<BasicResponse>("/admin/create", {
        name,
        email,
        password,
    });
    return response.data;
}

export async function postEditAdminPassword(
    admin: number,
    newPassword: string,
) {
    const response = await axios.post<BasicResponse>("/admin/edit-password", {
        admin,
        newPassword,
    });
    return response.data;
}

export async function postDeleteAdmin(id: number) {
    const response = await axios.post<BasicResponse>("/admin/delete", { id });
    return response.data;
}

export async function getGeneralAnalytics() {
    const response = await axios.get<BasicResponse & { data: Analytics }>(
        "/analytic/general",
    );
    return response.data;
}

export async function postEditAdmin(
    id: number,
    name: string,
    email: string,
) {
    const response = await axios.post<BasicResponse>("/admin/edit", {
        id,
        name,
        email,
    });
    return response.data;
}