import COS, { type Credentials } from "cos-js-sdk-v5";
import axios from "axios";
import type { Delta } from "quill";

axios.defaults.baseURL = process.env.BACKEND_URL;
axios.defaults.withCredentials = true;
axios.defaults.validateStatus = () => true;
axios.defaults.xsrfCookieName = "_csrf";
axios.defaults.xsrfHeaderName = "x-csrf-token";
axios.defaults.withXSRFToken = true;

axios.interceptors.request.use(async (config) => {
    if (
        ["PUT", "POST", "DELETE", "PATCH"].includes(
            config.method?.toUpperCase() ?? ""
        )
    ) {
        await axios.get("/_csrf");
    }
    return config;
});

export type ReservationStatus = "pending" | "approved" | "rejected";

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
    status?: ReservationStatus;
}

export interface RoomPolicy {
    id: number;
    roomId: number;
    days: number[];
    startTime: number[];
    endTime: number[];
    enabled: boolean;
}

export interface Room {
    id: number;
    name: string;
    campus: number;
    policies: RoomPolicy[];
    approvers: RoomApprover[];
    enabled: boolean;
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

export interface ApiResponse<T = unknown> {
    data: T;
    message: string | null;
    success: boolean;
}

export interface RoomApprover {
    id: number;
    roomId: number;
    userId: number;
    notificationsEnabled: boolean;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    balance?: number;
}


export interface Advertisement {
    id: number;
    title: string;
    content: Delta;
    images: string[];
    link: string | null;
    durationDays: number;
    createdAt: string;
    expiresAt: string;
    rejectionReason: string | null;
    status: "active" | "expired" | "pending" | "rejected" | "payment-pending";
}

export interface AdsPricingConfig {
    id: number;
    pricePerDay: number;
    minDuration: number;
    maxDuration: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdsPricingDiscount {
    id: number;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OverviewAnalytics {
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

export interface WeeklyAnalytics {
    rooms: {
        roomName: string;
        reservations: number;
        reservationCreations: number;
    }[];
    totalReservations: number;
    totalReservationCreations: number;
    totalApprovals: number;
    totalRejections: number;
    reasons: { word: string; count: number }[];
    hourlyReservations: number[];
    dailyReservations: number[];
    dailyReservationCreations: number[];
}

export async function getCampuses() {
    const response = await axios.get<ApiResponse<Campus[]>>("/campus/list");
    return response.data;
}

export async function getRooms() {
    const response = await axios.get<ApiResponse<Room[]>>("/room/list");
    return response.data;
}

export async function getClasses() {
    const response = await axios.get<ApiResponse<Class[]>>("/class/list");
    return response.data;
}

export async function getReservations(
    keyword: string | null = null,
    roomId: number | null = null,
    status: ReservationStatus | null = null,
    page: number = 0,
    startTime: Date | null = null,
    endTime: Date | null = null
) {
    const response = await axios.get<
        ApiResponse<{ reservations: Reservation[]; total: number }>
    >("/reservation/get", {
        params: {
            keyword: keyword == "" ? null : keyword,
            roomId,
            status,
            page,
            startTime: startTime
                ? Math.floor(startTime.getTime() / 1000)
                : null,
            endTime: endTime ? Math.floor(endTime.getTime() / 1000) : null,
        },
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
    reservation: ReservationRequestInfo
) {
    const data = {
        classId: reservation.classId,
        studentName: reservation.studentName,
        room: reservation.room,
        studentId: reservation.studentId,
        email: reservation.email,
        startTime:
            new Date(
                `${formatDate(reservation.date)}T${reservation.startTime}`
            ).getTime() / 1000,
        endTime:
            new Date(
                `${formatDate(reservation.date)}T${reservation.endTime}`
            ).getTime() / 1000,
        reason: reservation.reason,
    };
    const response = await axios.post<ApiResponse>("/reservation/create", data);
    return response.data;
}

export async function postLogin(
    email: string | null,
    password: string | null,
    token: string | null,
    turnstileToken: string | null
) {
    const response = await axios.post<
        ApiResponse<{ token: string; user: User } | null>
    >("/user/login", {
        email,
        password,
        token,
        turnstileToken,
    });
    return response.data;
}

export async function getCheckLogin() {
    const response = await axios.get<ApiResponse<User>>("/user/check-login");
    return response.data;
}

export async function getUpcomingReservations() {
    const response = await axios.get<ApiResponse<Reservation[]>>(
        "/reservation/upcoming"
    );
    return response.data;
}

export async function postApproveReservation(
    id: number,
    approved: boolean,
    reason: string | null = null
) {
    const response = await axios.post<ApiResponse>(`/reservation/approval`, {
        id,
        reason,
        approved,
    });
    return response.data;
}

export function getExportReservations(
    startTime: number | null,
    endTime: number | null,
    mode: string = "by-room"
) {
    const params: Record<string, any> = {};
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    params.mode = mode;
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
    const response = await axios.post<ApiResponse>("/room/delete", { id });
    return response.data;
}

export async function postDeleteCampus(id: number) {
    const response = await axios.post<ApiResponse>("/campus/delete", { id });
    return response.data;
}

export async function postDeleteClass(id: number) {
    const response = await axios.post<ApiResponse>("/class/delete", { id });
    return response.data;
}

export async function postCreateRoom(name: string, campus: number) {
    const response = await axios.post<ApiResponse>("/room/create", {
        name,
        campus,
    });
    return response.data;
}

export async function postCreateCampus(name: string) {
    const response = await axios.post<ApiResponse>("/campus/create", {
        name,
    });
    return response.data;
}

export async function postCreateClass(name: string, campus: number) {
    const response = await axios.post<ApiResponse>("/class/create", {
        name,
        campus,
    });
    return response.data;
}

export async function postCreatePolicy(
    room: number,
    startTime: number[],
    endTime: number[],
    days: number[]
) {
    const response = await axios.post<ApiResponse>("/policy/create", {
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
    days: number[]
) {
    const response = await axios.post<ApiResponse>("/policy/edit", {
        id,
        startTime,
        endTime,
        days,
    });
    return response.data;
}

export async function postDeletePolicy(id: number) {
    const response = await axios.post<ApiResponse>("/policy/delete", { id });
    return response.data;
}

export async function postTogglePolicy(id: number) {
    const response = await axios.post<ApiResponse>("/policy/toggle", { id });
    return response.data;
}

export async function postEditClass(id: number, name: string, campus: number) {
    const response = await axios.post<ApiResponse>("/class/edit", {
        id,
        name,
        campus,
    });
    return response.data;
}

export async function postEditRoom(
    id: number,
    name: string,
    campus: number,
    enabled: boolean
) {
    const response = await axios.post<ApiResponse>("/room/edit", {
        id,
        name,
        campus,
        enabled,
    });
    return response.data;
}

export async function postEditCampus(id: number, name: string) {
    const response = await axios.post<ApiResponse>("/campus/edit", {
        id,
        name,
    });
    return response.data;
}

export async function getLogOut() {
    const response = await axios.get<ApiResponse>("/user/logout");
    return response.data;
}

export async function getUsers() {
    const response = await axios.get<ApiResponse<User[]>>("/user/list");
    return response.data;
}

export async function postCreateApprover(room: number, userId: number) {
    const response = await axios.post<ApiResponse>("/approver/create", {
        room,
        userId,
    });
    return response.data;
}

export async function postDeleteApprover(id: number) {
    const response = await axios.post<ApiResponse>("/approver/delete", {
        id,
    });
    return response.data;
}

export async function postCreateUser(
    name: string,
    email: string,
    password: string,
    role: string | null = null
) {
    const response = await axios.post<ApiResponse>("/user/create", {
        name,
        email,
        password,
        role,
    });
    return response.data;
}

export async function postAdminEditUserPassword(
    user: number,
    newPassword: string
) {
    const response = await axios.post<ApiResponse>("/user/edit-password", {
        user,
        newPassword,
    });
    return response.data;
}

export async function postDeleteUser(id: number) {
    const response = await axios.post<ApiResponse>("/user/delete", { id });
    return response.data;
}

export async function getOverviewAnalytics() {
    const response = await axios.get<ApiResponse<OverviewAnalytics>>(
        "/reservation/analytics/overview"
    );
    return response.data;
}

export async function getWeeklyAnalytics() {
    const response = await axios.get<ApiResponse<WeeklyAnalytics>>(
        "/reservation/analytics/weekly"
    );
    return response.data;
}

export async function postEditUser(
    id: number,
    name: string,
    email: string,
    role: string
) {
    const response = await axios.post<ApiResponse>("/user/edit", {
        id,
        name,
        email,
        role,
    });
    return response.data;
}

export async function getExportOverviewReservationsAnalytics(
    type: string,
    turnstileToken: string
) {
    const base = (axios.defaults.baseURL || "").replace(/\/$/, "");
    window.location.href = `${base}/reservation/analytics/overview/export?type=${type}&turnstileToken=${turnstileToken}`;
}

export async function getExportWeeklyReservationsAnalytics(
    type: string,
    turnstileToken: string
) {
    const base = (axios.defaults.baseURL || "").replace(/\/$/, "");
    window.location.href = `${base}/reservation/analytics/weekly/export?type=${type}&turnstileToken=${turnstileToken}`;
}

export async function postToggleApproverNotificationsEnabled(id: number) {
    const response = await axios.post<ApiResponse>(
        "/approver/toggle-notification",
        { id }
    );
    return response.data;
}

export async function postPreRegister(data: {
    email: string;
    turnstileToken: string | null;
}) {
    const response = await axios.post<ApiResponse>("/user/pre-register", data);
    return response.data;
}

export async function postRegister(
    name: string,
    password: string,
    studentId: string | null,
    token: string
) {
    const response = await axios.post<ApiResponse>("/user/register", {
        name,
        password,
        studentId,
        token,
    });
    return response.data;
}

export async function getAdvertisementPrice(durationDays: number) {
    const response = await axios.get<
        ApiResponse<{ originalPrice: number; finalPrice: number }>
    >("/ads/price", { params: { durationDays } });
    return response.data;
}

export async function postCreateAdvertisement(
    title: string,
    images: string[],
    content: Delta,
    link: string | null,
    durationDays: number
) {
    const response = await axios.post<ApiResponse>("/ads/create", {
        title,
        images,
        content: content,
        link,
        durationDays,
    });
    return response.data;
}

export async function getUserAdvertisements() {
    const response = await axios.get<ApiResponse<Advertisement[]>>(
        "/ads/me"
    );
    return response.data;
}

export async function getAllAdvertisements() {
    const response = await axios.get<ApiResponse<Advertisement[]>>(
        "/ads/all"
    );
    return response.data;
}

export async function uploadCOS(file: File) {
    const credential_res = await axios.get<
        ApiResponse<
            Credentials & {
                Token: string;
                Key: string;
                Bucket: string;
                Region: string;
            }
        >
    >("/cos/credentials", {
        params: { ext: `.${file.name.split(".").pop()}` },
    });
    const credential = credential_res.data.data;
    const cos = new COS({
        getAuthorization: async (_, callback) => {
            callback({
                ...credential,
                SecurityToken: credential.Token,
            });
        },
    });
    return new Promise<{ success: boolean; data: string | null }>(
        async (resolve) => {
            cos.uploadFile(
                {
                    Bucket: credential.Bucket,
                    Region: credential.Region,
                    Key: credential.Key,
                    Body: await file.arrayBuffer(),
                    ContentType: file.type,
                },
                (err) => {
                    if (err) {
                        resolve({
                            success: false,
                            data: null,
                        });
                        console.log(err);
                    } else {
                        resolve({
                            success: true,
                            data: credential.Key,
                        });
                    }
                }
            );
        }
    );
}

export async function postAdsApprovalUpdate(
    id: number,
    approved: boolean,
    rejectionReason: string | null = null
) {
    const response = await axios.post<ApiResponse>("/ads/approval", {
        id,
        approved,
        rejectionReason,
    });
    return response.data;
}

export async function getRandomAdvertisements(count: number = 1) {
    const response = await axios.get<ApiResponse<Advertisement[]>>(
        "/ads/random",
        { params: { count } }
    );
    return response.data;
}

export async function getAdvertisement(id: number) {
    const response = await axios.get<ApiResponse<Advertisement>>(
        `/ads/${id}`
    );
    return response.data;
}

export async function postEditAdvertisement(
    id: number,
    title: string,
    images: string[],
    content: Delta,
    link: string | null,
    durationDays: number
) {
    const response = await axios.post<ApiResponse>(`/ads/${id}/edit`, {
        title,
        images,
        content,
        link,
        durationDays,
    });
    return response.data;
}

export async function getAdsPricingConfig() {
    const response = await axios.get<ApiResponse<AdsPricingConfig>>(
        "/ads/pricing/config"
    );
    return response.data;
}

export async function postUpdateAdsPricingConfig(
    pricePerDay: number,
    minDuration: number,
    maxDuration: number
) {
    const response = await axios.post<ApiResponse>("/ads/pricing/config", {
        pricePerDay,
        minDuration,
        maxDuration,
    });
    return response.data;
}

export async function getAdsPricingDiscounts() {
    const response = await axios.get<ApiResponse<AdsPricingDiscount[]>>(
        "/ads/pricing/discounts"
    );
    return response.data;
}

export async function postCreateAdsPricingDiscount(
    discountPercentage: number,
    startDate: Date,
    endDate: Date,
    description: string
) {
    const response = await axios.post<ApiResponse>("/ads/pricing/discounts/create", {
        discountPercentage,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        description,
    });
    return response.data;
}

export async function postUpdateAdsPricingDiscount(
    id: number,
    discountPercentage: number,
    startDate: Date,
    endDate: Date,
    description: string,
    isActive: boolean
) {
    const response = await axios.post<ApiResponse>(`/ads/pricing/discounts/${id}/update`, {
        discountPercentage,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        description,
        isActive,
    });
    return response.data;
}

export async function postDeleteAdsPricingDiscount(id: number) {
    const response = await axios.post<ApiResponse>(`/ads/pricing/discounts/${id}/delete`);
    return response.data;
}