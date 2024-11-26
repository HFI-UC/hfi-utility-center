import axios, { isAxiosError } from "axios";
import COS, { Credentials } from "cos-js-sdk-v5";

axios.defaults.baseURL =
    process.env.VERCEL_ENV == "production"
        ? "https://api.hfiuc.org"
        : "https://120.24.212.59/";

export interface ApplicationInfo {
    class: string;
    studentName: string;
    selectedRoom: number | null;
    studentId: string;
    email: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    selectedCampus: string;
    isAgreed: boolean;
}

export interface MaintenanceInfo {
    id?: number;
    studentName: string;
    subject: string;
    detail: string;
    location: string;
    email: string;
    campus: string;
    filePath: string;
    addTime?: number;
    status?: number;
}

export interface RoomPolicyInfo {
    id?: number;
    unavailable?: boolean;
    classroom: string;
    days: string;
    start_time: string;
    end_time: string;
}

export interface Clue {
    id?: number;
    campus: string;
    detail: string;
    location: string;
    filePath: string;
    contact: string;
    createdAt?: string;
}

export interface LostAndFoundInfo {
    id?: number;
    studentName: string;
    detail: string;
    location: string;
    email: string;
    campus: string;
    filePath: string;
    password: string;
    type: string;
    eventTime: string;
    createdAt?: string
    lastUpdated?: string
    reward?: string;
    altContact?: string;
    clues?: Clue[];
    isFound?: number;
}

export interface ReservationInfo {
    success: boolean;
    data: {
        id?: number;
        name: string;
        email: string;
        time: string;
        reason: string;
        room: number;
        sid?: number;
        addTime?: string;
        operator?: string;
        auth: string;
    }[];
}

export async function fetchPolicy() {
    const res = await axios.get<{ policy: RoomPolicyInfo[] }>(
        "/api/fetchPolicy.php",
    );
    return res.data;
}

export async function postReservation({
    query = undefined,
    room = undefined,
    token = undefined,
    time = undefined,
}: {
    query?: string;
    room?: string;
    token?: string;
    time?: Date;
}) {
    const data = new FormData();
    if (query) {
        data.set("query", query);
    }
    if (time) {
        data.set("time", time.getTime().toString());
    }
    if (room) {
        data.set("room", room);
    }
    if (token) {
        data.set("token", token);
        const res = await axios.post<ReservationInfo>(
            "/api/adminSearch.php",
            data,
        );
        return res.data;
    }
    const res = await axios.post<ReservationInfo>("/api/inquiry.php", data);
    return res.data;
}

export async function postApplication(application: ApplicationInfo) {
    const startTime = new Date(`${application.date}T${application.startTime}`);
    const endTime = new Date(`${application.date}T${application.endTime}`);

    const data = new FormData();
    data.append("room", application.selectedRoom?.toString() as string);
    data.append("email", application.email);
    data.append("time", `${startTime.getTime()}-${endTime.getTime()}`);
    data.append("name", `${application.studentName} / ${application.class}`);
    data.append("reason", application.reason);
    data.append("sid", application.studentId);
    try {
        const res = await axios.post<{ success: boolean; message: string }>(
            "/api/addres.php",
            data,
        );
        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return err.response.data;
        }
    }
}

export async function postLogin(user: string, password: string, token: string) {
    const data = new FormData();
    data.set("username", user);
    data.set("password", password);
    data.set("cf_token", token);
    try {
        const res = await axios.post<{
            success: boolean;
            message: string;
            token?: string;
        }>("/api/login.php", data);
        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return err.response.data;
        }
    }
}

export async function verifyAdmin(token: string): Promise<boolean> {
    const data = new FormData();
    data.set("token", token);
    try {
        const res = await axios.post<{ success: boolean }>(
            "/api/verify_admin.php",
            data,
        );
        return res.data.success;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return err.response.data.success;
        }
        return false;
    }
}

export async function getAction(token: string, action: string) {
    const data = new FormData();
    data.set("token", token);
    data.set("action", action);
    try {
        const res = await axios.post<{
            success: boolean;
            data?: {
                addTime: string;
                email: string;
                reason: string;
                room: number;
            };
            message?: string;
        }>("/api/approval_action.php", data);
        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return err.response.data;
        }
    }
}

export async function postAdminReservation(token: string) {
    if (token == "") return { data: [], success: false } as ReservationInfo;
    const data = new FormData();
    data.set("token", token);
    const res = await axios.post<ReservationInfo>("/api/getrequests.php", data);
    return res.data;
}

export async function postReservationAccept(token: string, id: number) {
    const data = new FormData();
    data.set("token", token);
    data.set("Id", id.toString());
    try {
        const res = await axios.post<{ success: boolean; message: string }>(
            "/api/accept.php",
            data,
        );
        return res.data;
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return err.response.data;
        }
    }
}

export async function postReservationReject(
    token: string,
    id: number,
    reason: string,
) {
    const data = new FormData();
    data.set("token", token);
    data.set("Id", id.toString());
    data.set("Reason", reason);
    try {
        const res = await axios.post<{ success: boolean; message: string }>(
            "/api/reject.php",
            data,
        );
        return res.data;
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return err.response.data;
        }
    }
}

export async function postPolicy(token: string) {
    if (token == "") return { success: false, policy: [] as RoomPolicyInfo[] };
    const data = new FormData();
    data.set("token", token);
    const res = await axios.post<{
        success: boolean;
        policy: RoomPolicyInfo[];
    }>("/api/getDisabledClassroomDetails.php", data);
    return res.data;
}

export async function postPolicyResume(token: string, id: number) {
    const data = new FormData();
    data.set("token", token);
    data.set("id", id.toString());
    const res = await axios.post<{ success: boolean }>(
        "/api/resumeDisabledClassroom.php",
        data,
    );
    return res.data;
}

export async function postPolicyPause(token: string, id: number) {
    const data = new FormData();
    data.set("token", token);
    data.set("id", id.toString());
    const res = await axios.post<{ success: boolean }>(
        "/api/pauseDisableClassroom.php",
        data,
    );
    return res.data;
}

export async function postPolicyDelete(token: string, id: number) {
    const data = new FormData();
    data.set("token", token);
    data.set("id", id.toString());
    const res = await axios.post<{ success: boolean }>(
        "/api/enableClassroom.php",
        data,
    );
    return res.data;
}

export async function postPolicyAdd(
    token: string,
    room: number,
    days: number[],
    start_time: Date,
    end_time: Date,
) {
    const startTime = `${start_time.getHours().toString().padStart(2, "0")}:${start_time.getMinutes().toString().padStart(2, "0")}:00`;
    const endTime = `${end_time.getHours()}:${end_time.getMinutes()}:00`;
    const data = new FormData();
    data.set("token", token);
    data.set("classroom", room.toString());
    days.some((item) => {
        data.append("days[]", item.toString());
    });
    data.set("start_time", startTime);
    data.set("end_time", endTime);
    const res = await axios.post<{ success: boolean }>(
        "/api/submit_classroom.php",
        data,
    );
    return res.data;
}

export function generateCosKey(ext: string = ""): string {
    return `file/${new Date().toISOString().slice(0, 10).replace(/-/g, "")}/${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${String(Math.floor(Math.random() * 1e6)).padStart(6, "0")}${ext ? "." + ext : ""}`;
}

export async function uploadCOS(
    file: File,
    cosKey: string,
): Promise<{ success: boolean; message: string }> {
    const cos = new COS({
        getAuthorization: async (options, callback) => {
            const data = new FormData();
            data.append("file-name", options.Key);
            data.append("cosKey", cosKey);

            const { SessionToken: SecurityToken, ...rest } = (
                await axios.post<{
                    credentials: { SessionToken: string } & Credentials;
                }>("/api/keygen.php", data)
            ).data.credentials;

            callback({ SecurityToken, ...rest });
        },
    });
    return new Promise(async (resolve) => {
        cos.uploadFile(
            {
                Bucket: "repair-1304562386",
                Region: "ap-guangzhou",
                Key: cosKey,
                Body: await file.arrayBuffer(),
            },
            (err, data) => {
                if (err) {
                    resolve({
                        success: false,
                        message: err.message,
                    });
                } else {
                    resolve({
                        success: true,
                        message: JSON.stringify(data),
                    });
                }
            },
        );
    });
}

export async function getCOS(filePath: string) {
    const data = new FormData();
    data.set("file_key", filePath);
    const res = await axios.post<string>("/api/cos_preview_url_gen.php", data);
    return res.data;
}

export async function postMaintenance(
    maintenance: MaintenanceInfo,
): Promise<{ success: boolean; message: string }> {
    const data = new FormData();
    data.set("studentName", maintenance.studentName);
    data.set("subject", maintenance.subject);
    data.set("detail", maintenance.detail);
    data.set("campus", maintenance.campus);
    data.set("filePath", maintenance.filePath);
    data.set("location", maintenance.location);
    data.set("email", maintenance.email);
    try {
        const res = await axios.post<{ success: boolean; message: string }>(
            "/api/submit_repair.php",
            data,
        );
        return res.data;
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return err.response.data as { success: boolean; message: string };
        } else {
            return {
                success: false,
                message: "Error.",
            };
        }
    }
}
function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMaintenance(token: string) {
    const res =
        token == ""
            ? await axios.get<{ success: boolean; data: MaintenanceInfo[] }>(
                  "/api/inquiry_repair.php",
              )
            : await axios.post<{ success: boolean; data: MaintenanceInfo[] }>(
                  "/api/get_repair.php",
                  new URLSearchParams({ token }),
              );
    const { data } = res;
    data.data = await Promise.all(
        data.data.map(async (item, index) => {
            await delay(index * 100);
            return {
                ...item,
                filePath: await getCOS(item.filePath),
            };
        }),
    );
    return data;
}

export async function postMaintenanceAction(
    token: string,
    id: number,
    action: number,
) {
    const data = new FormData();
    data.set("token", token);
    data.set("id", id.toString());
    data.set("action", action.toString());
    const res = await axios.post<{ success: boolean; message: string }>(
        "/api/process_repair.php",
        data,
    );
    return res.data;
}

export async function getHitokoto() {
    const query = new URLSearchParams("c=a&c=b&c=c&c=f&c=h&c=j&c=l");
    const res = await axios.get<{
        hitokoto: string;
        from_who: string;
        from: string;
    }>("https://v1.hitokoto.cn", { params: query });
    return res.data;
}

export async function postLostAndFound(lostnfound: LostAndFoundInfo) {
    const data = new FormData();
    data.set("type", lostnfound.type);
    data.set("email", lostnfound.email);
    data.set("student_name", lostnfound.studentName);
    data.set("detail", lostnfound.detail);
    data.set("file_path", lostnfound.filePath);
    data.set("location", lostnfound.location);
    data.set("password", lostnfound.password);
    data.set("event_time", lostnfound.eventTime)
    data.set("campus", lostnfound.campus);
    if (lostnfound.altContact) data.set("alt_contact", lostnfound.altContact);
    if (lostnfound.reward) data.set("reward", lostnfound.reward);
    try {
        const res = await axios.post<{ success: boolean; message: string }>(
            "/api/submit_lnf.php",
            data,
        );
        return res.data;
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return err.response.data as { success: boolean; message: string };
        } else {
            return {
                success: false,
                message: "Error.",
            };
        }
    }
}

export async function getLostAndFound(
    page: number,
    query: string,
    token: string,
    clue?: boolean,
) {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (token !== "") params.set("token", token)
    if (clue) params.set("include_clues", "true");
    if (query !== "") params.set("query", query);
    const { data } = await axios.get<{
        success: boolean;
        data: LostAndFoundInfo[];
        totalPages: number;
    }>("/api/fetch_lnf.php", { params: params });
    data.data = await Promise.all(
        data.data.map(async (item, index) => {
            await delay(index * 100);
            return {
                ...item,
                filePath: await getCOS(item.filePath),
            };
        }),
    );
    return data;
}

export async function postClue(clue: Clue, id: number) {
    const data = new FormData();
    data.set("detail", clue.detail);
    data.set("filePath", clue.filePath);
    data.set("location", clue.location);
    data.set("campus", clue.campus);
    data.set("contact", clue.contact);
    data.set("lost_info_id", id.toString());
    try {
        const res = await axios.post<{ success: boolean; message: string }>(
            "/api/submit_clue.php",
            data,
        );
        return res.data;
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return err.response.data as { success: boolean; message: string };
        } else {
            return {
                success: false,
                message: "Error.",
            };
        }
    }
}

export async function postLostAndFoundAction(
    id: number,
    action: number,
    password: string,
) {
    const data = new FormData();
    const actions = ["not_found", "found", "hidden"];
    data.set("id", id.toString());
    data.set("password", password);
    data.set("action", actions[action].toString());
    try {
        const res = await axios.post<{ success: boolean; message: string }>(
            "/api/update_lnf_status.php",
            data,
        );
        return res.data;
    } catch (err) {
        if (isAxiosError(err) && err.response) {
            return err.response.data as { success: boolean; message: string };
        } else {
            return {
                success: false,
                message: "Error.",
            };
        }
    }
}
