<script setup lang="ts">
import { useRequest } from "vue-request";
import AdminLogin from "../../components/AdminLogin.vue";
import {
    getAllReservations,
    getExportReservations,
    getRecentReservations,
    postApproveReservation,
    postLogin,
} from "../../api";
import { onMounted, ref } from "vue";
import { Check, Download, SquareArrowOutUpRight, X } from "lucide-vue-next";
import { useToast } from "primevue";
import { type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { FilterMatchMode } from "@primevue/core/api";
import z from "zod";
import Navbar from "../../components/Navbar.vue";
import LoadingMask from "../../components/LoadingMask.vue";

const { data: futureReservations, run: fetchFutureReservations } = useRequest(
    getRecentReservations,
);

const { data: allReservations, run: fetchAllReservations } =
    useRequest(getAllReservations);

const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ${String(date.getHours()).padStart(
        2,
        "0",
    )}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const statusMapping: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
};
const severityMapping: Record<string, string> = {
    pending: "info",
    approved: "success",
    rejected: "danger",
};

const toast = useToast();

const approveReservation = async (id: number) => {
    loading.value = true;
    const response = await postApproveReservation(id, true);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Reservation Approved",
            detail: `Reservation #${id} has been approved.`,
            life: 3000,
        });
        fetchFutureReservations();
        fetchAllReservations();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message,
            life: 3000,
        });
    }
};

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const rejectReservation = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill in all required fields.",
            life: 2000,
        });
        return;
    }
    loading.value = true;
    const response = await postApproveReservation(
        rejectId.value,
        false,
        form.values.reason,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Reservation Rejected",
            detail: `Reservation #${rejectId.value} has been rejected for the following reason: ${form.values.reason}`,
            life: 3000,
        });
        form.reset();
        rejectVisible.value = false;
        fetchFutureReservations();
        fetchAllReservations();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message,
            life: 3000,
        });
    }
};
const rejectVisible = ref(false);
const loading = ref(false);
const rejectId = ref(-1);
const rejectResolver = ref(
    zodResolver(
        z.object({
            reason: z
                .string({ error: "Reason is required." })
                .min(1, { error: "Reason is required." }),
        }),
    ),
);
const rejectInitialValues = ref({ reason: null });

const reasons = ref([
    "Time Conflict - The selected time slot has been booked by another event.",
    "Insufficient Resources - There are not enough equipment or resources to support this reservation.",
    "Does Not Meet Reservation Criteria - The request does not meet specific conditions or rules for room usage.",
    "Under Maintenance - The room is under maintenance or upgrades and is temporarily unavailable.",
    "Safety Concerns - Usage is temporarily unavailable due to safety considerations.",
    "Incomplete Information - The submitted reservation information is incomplete or inaccurate.",
    "Policy Violation - The reserved activity violates the relevant policies of the school or institution.",
    "Frequent Reservations - The frequency of reservations by the same organization or individual is too high.",
    "Priority for Special Events - Resources are prioritized for special events or emergencies.",
]);

const exportVisible = ref(false);
const exportResolver = ref(
    zodResolver(
        z
            .object({
                option: z.number({ error: "Format is required." }),
                startTime: z.date().nullable().optional(),
                endTime: z.date().nullable().optional(),
            })
            .superRefine((data, context) => {
                if (data.option == 4) {
                    if (!data.startTime)
                        context.addIssue({
                            code: "custom",
                            path: ["startTime"],
                            message: "Start time is required.",
                        });
                    if (!data.endTime) {
                        context.addIssue({
                            code: "custom",
                            path: ["endTime"],
                            message: "End time is required.",
                        });
                    }
                    if (
                        data.startTime &&
                        data.endTime &&
                        data.startTime > data.endTime
                    ) {
                        context.addIssue({
                            code: "custom",
                            path: ["endTime"],
                            message: "End time must be after start time.",
                        });
                    }
                }
            }),
    ),
);
const exportInitialValues = ref({
    option: null,
    startTime: null,
    endTime: null,
});

const getToken = () => {
    const params = new URLSearchParams(window.location.search);
    return decodeURIComponent(params.get("token") || "");
};

onMounted(async () => {
    const token = getToken();
    if (token != "") {
        const response = await postLogin(null, null, token, null);
        if (response.success) {
            window.location.href = "/admin/reservation/";
        } else {
            toast.add({
                severity: "error",
                summary: "Error",
                detail: response.message,
                life: 6000,
            });
            setTimeout(
                () => (window.location.href = "/admin/reservation/"),
                6500,
            );
        }
    } else {
        adminVerify.value = true;
    }
});

const adminVerify = ref(false);

const exportReservations = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill in all required fields.",
            life: 2000,
        });
        return;
    }
    loading.value = true;
    const now = new Date();
    let startTime: Date | null = new Date();
    let endTime: Date | null = new Date();
    if (form.values.option === 0) {
        startTime.setHours(0, 0, 0, 0);
        endTime.setHours(23, 59, 59, 999);
    } else if (form.values.option === 1) {
        startTime.setDate(now.getDate() - now.getDay());
        startTime.setHours(0, 0, 0, 0);
        endTime.setDate(startTime.getDate() + 6);
        endTime.setHours(23, 59, 59, 999);
    } else if (form.values.option === 2) {
        startTime.setDate(1);
        startTime.setHours(0, 0, 0, 0);
        endTime.setMonth(endTime.getMonth() + 1);
        endTime.setDate(0);
        endTime.setHours(23, 59, 59, 999);
    } else if (form.values.option === 3) {
        startTime = null;
        endTime = null;
    } else {
        startTime = form.values.startTime;
        endTime = form.values.endTime;
    }
    if (startTime && endTime && allReservations?.value?.data) {
        const rangeStart = startTime.getTime();
        const rangeEnd = endTime.getTime();
        const hasAny = allReservations.value.data.some((r: any) => {
            const rs = new Date(r.startTime).getTime();
            const re = new Date(r.endTime).getTime();
            return rs <= rangeEnd && re >= rangeStart;
        });
        if (!hasAny) {
            loading.value = false;
            toast.add({
                severity: "error",
                summary: "No Reservations",
                detail: "There are no reservations in the selected time range.",
                life: 3000,
            });
            loading.value = false;
            return;
        }
    }

    getExportReservations(
        startTime ? Math.floor(startTime.getTime() / 1000) : null,
        endTime ? Math.floor(endTime.getTime() / 1000) : null,
    );
    loading.value = false;
    exportVisible.value = false;
    form.reset();
};

const exportOptions = [
    { label: "Export reservations for today", code: 0 },
    { label: "Export reservations for this week", code: 1 },
    { label: "Export reservations for this month", code: 2 },
    { label: "Export every reservations", code: 3 },
    { label: "Custom range", code: 4 },
];
</script>
<template>
    <AdminLogin :requireLogin="true" v-if="adminVerify"></AdminLogin>
    <BlockUI :blocked="loading" fullScreen></BlockUI>
    <LoadingMask></LoadingMask>
    <Navbar></Navbar>
    <Toast></Toast>
    <Dialog
        v-model:visible="rejectVisible"
        header="Reject Reservation"
        :blockScroll="false"
        :closable="false"
        modal
        class="w-[23rem]"
    >
        <Form
            v-slot="$form"
            :resolver="rejectResolver"
            :initialValues="rejectInitialValues"
            @submit="rejectReservation"
        >
            <div class="flex flex-col gap-4">
                <Select
                    name="reason"
                    fluid
                    placeholder="Reason"
                    :options="reasons"
                ></Select>
                <Message
                    v-if="$form.reason?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.reason.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(rejectVisible = false), $form.reset()"
                    >Cancel</Button
                >
                <Button type="submit" severity="danger"><X></X>Reject</Button>
            </div>
        </Form>
    </Dialog>
    <Dialog
        v-model:visible="exportVisible"
        header="Export Reservations"
        :blockScroll="false"
        :closable="false"
        modal
        class="w-[23rem]"
    >
        <Form
            v-slot="$form"
            :resolver="exportResolver"
            :initialValues="exportInitialValues"
            @submit="exportReservations"
        >
            <div class="flex flex-col gap-4">
                <Select
                    name="option"
                    fluid
                    placeholder="Select an option"
                    optionLabel="label"
                    optionValue="code"
                    :options="exportOptions"
                ></Select>
                <Message
                    v-if="$form.option?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.option.error?.message }}</Message
                >
                <DatePicker
                    v-if="$form.option?.value === 4"
                    showTime
                    showSeconds
                    :maxDate="$form.endTime?.value || undefined"
                    name="startTime"
                    placeholder="Start Time"
                    fluid
                ></DatePicker>
                <Message
                    v-if="$form.startTime?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.startTime.error?.message }}</Message
                >
                <DatePicker
                    v-if="$form.option?.value === 4"
                    showTime
                    showSeconds
                    :minDate="$form.startTime?.value || undefined"
                    name="endTime"
                    placeholder="End Time"
                    fluid
                ></DatePicker>
                <Message
                    v-if="$form.endTime?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.endTime.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(exportVisible = false), $form.reset()"
                    >Cancel</Button
                >
                <Button type="submit" severity="primary"
                    ><Download></Download>Export</Button
                >
            </div>
        </Form>
    </Dialog>
    <div class="mt-[6rem] mb-4 md:mx-[3rem] 2xl:mx-[8rem] mx-4">
        <h1 class="font-bold md:text-3xl text-2xl my-4">
            Reservation Management
        </h1>
        <Card class="w-full">
            <template #content>
                <DataView
                    layout="grid"
                    :value="
                        futureReservations?.data.sort((a: any) =>
                            a.status === 'pending' ? -1 : 1,
                        )
                    "
                    paginator
                    :rows="6"
                >
                    <template #header>
                        <span class="font-bold text-lg"
                            >Future Reservations</span
                        >
                    </template>
                    <template #empty>
                        <p class="m-4">No future reservations found.</p>
                    </template>
                    <template #grid="slotProps">
                        <div class="grid grid-cols-12 gap-4 my-4">
                            <div
                                v-for="(item, index) in slotProps.items"
                                :key="index"
                                class="col-span-12 lg:col-span-4 md:col-span-6"
                            >
                                <div
                                    class="rounded-lg border-surface-200 dark:border-surface-700 border-1 p-4 flex flex-col w-full"
                                >
                                    <h2 class="font-bold text-xl mb-2">
                                        Reservation #{{ item.id }}
                                    </h2>
                                    <Fieldset>
                                        <template #legend>
                                            <h3 class="font-medium text-sm">
                                                Student Information
                                            </h3>
                                        </template>
                                        <div
                                            class="grid grid-cols-6 gap-4 font-medium"
                                        >
                                            <div class="col-span-3">
                                                <p
                                                    class="text-sm text-surface-500"
                                                >
                                                    Student Name
                                                </p>
                                                <p class="sm:text-lg text-md">
                                                    {{ item.studentName }}
                                                </p>
                                            </div>
                                            <div class="col-span-3">
                                                <p
                                                    class="text-sm text-surface-500"
                                                >
                                                    Student ID
                                                </p>
                                                <p class="sm:text-lg text-md">
                                                    {{ item.studentId }}
                                                </p>
                                            </div>
                                            <div class="col-span-6">
                                                <p
                                                    class="text-sm text-surface-500"
                                                >
                                                    E-mail
                                                </p>
                                                <a
                                                    class="sm:text-lg text-md transition-colors duration-300 hover:text-sky-500 text-wrap"
                                                    :href="`mailto:${item.email}`"
                                                >
                                                    {{ item.email }}
                                                    <SquareArrowOutUpRight
                                                        class="inline"
                                                    ></SquareArrowOutUpRight>
                                                </a>
                                            </div>
                                            <div class="col-span-3">
                                                <p
                                                    class="text-sm text-surface-500"
                                                >
                                                    Class
                                                </p>
                                                <p class="sm:text-lg text-md">
                                                    {{ item.className }}
                                                </p>
                                            </div>
                                            <div class="col-span-3">
                                                <p
                                                    class="text-sm text-surface-500"
                                                >
                                                    Campus
                                                </p>
                                                <p class="sm:text-lg text-md">
                                                    {{ item.campusName }}
                                                </p>
                                            </div>
                                        </div>
                                    </Fieldset>
                                    <Fieldset>
                                        <template #legend>
                                            <h3 class="font-medium text-sm">
                                                Reservation Details
                                            </h3>
                                        </template>
                                        <div
                                            class="grid grid-cols-6 gap-4 font-medium"
                                        >
                                            <div class="col-span-3">
                                                <p
                                                    class="text-sm text-surface-500"
                                                >
                                                    Room
                                                </p>
                                                <p class="sm:text-lg text-md">
                                                    {{ item.roomName }}
                                                </p>
                                            </div>
                                            <div class="col-span-3">
                                                <p
                                                    class="text-sm text-surface-500"
                                                >
                                                    Start Time
                                                </p>
                                                <p class="sm:text-lg text-md">
                                                    {{
                                                        formatTime(
                                                            new Date(
                                                                item.startTime,
                                                            ),
                                                        )
                                                    }}
                                                </p>
                                            </div>
                                            <div class="col-span-3">
                                                <p
                                                    class="text-sm text-surface-500"
                                                >
                                                    End Time
                                                </p>
                                                <p class="sm:text-lg text-md">
                                                    {{
                                                        formatTime(
                                                            new Date(
                                                                item.endTime,
                                                            ),
                                                        )
                                                    }}
                                                </p>
                                            </div>
                                            <div class="col-span-3">
                                                <p
                                                    class="text-sm text-surface-500"
                                                >
                                                    Status
                                                </p>
                                                <Tag
                                                    :value="
                                                        statusMapping[
                                                            item.status
                                                        ]
                                                    "
                                                    :severity="
                                                        severityMapping[
                                                            item.status
                                                        ]
                                                    "
                                                ></Tag>
                                            </div>
                                            <div class="col-span-6">
                                                <p
                                                    class="text-sm text-surface-500"
                                                >
                                                    Reason
                                                </p>
                                                <p class="sm:text-lg text-md">
                                                    {{ item.reason }}
                                                </p>
                                            </div>
                                        </div>
                                    </Fieldset>
                                    <div
                                        class="flex gap-2 mt-4 sm:flex-nowrap flex-wrap"
                                    >
                                        <Button
                                            v-if="item.status != 'approved'"
                                            fluid
                                            @click="approveReservation(item.id)"
                                            size="small"
                                            severity="success"
                                            ><Check></Check>Approve</Button
                                        >
                                        <Button
                                            v-if="item.status != 'rejected'"
                                            fluid
                                            @click="
                                                (rejectVisible = true),
                                                    (rejectId = item.id)
                                            "
                                            size="small"
                                            severity="danger"
                                            ><X></X>Reject</Button
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataView>
            </template>
        </Card>
        <Card class="w-full mt-4">
            <template #content>
                <DataTable
                    paginator
                    :rows="10"
                    :value="allReservations?.data"
                    class="text-nowrap"
                    removableSort
                    v-model:filters="filters"
                >
                    <template #header>
                        <div
                            class="flex items-center justify-between flex-wrap gap-4"
                        >
                            <span class="font-bold text-lg"
                                >All Reservations</span
                            >
                            <div
                                class="flex gap-2 flex-col w-full sm:w-auto sm:flex-row"
                            >
                                <InputText
                                    v-model="filters['global'].value"
                                    placeholder="Keyword Search"
                                    size="small"
                                    class="sm:w-auto w-full"
                                />
                                <Button
                                    @click="exportVisible = true"
                                    size="small"
                                    :disabled="
                                        allReservations?.data.length === 0
                                    "
                                    class="sm:w-auto w-full"
                                    ><Download></Download>Export (.xlsx)</Button
                                >
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <p class="py-1">No available reservations.</p>
                    </template>
                    <Column field="id" header="ID" sortable></Column>
                    <Column
                        field="studentName"
                        header="Student Name"
                        sortable
                    ></Column>
                    <Column
                        field="studentId"
                        header="Student ID"
                        sortable
                    ></Column>
                    <Column field="email" header="E-mail" sortable>
                        <template #body="slotProps">
                            <a
                                :href="`mailto:${slotProps.data.email}`"
                                class="transition-colors duration-300 hover:text-sky-500"
                                >{{ slotProps.data.email }}
                                <SquareArrowOutUpRight
                                    class="inline"
                                ></SquareArrowOutUpRight
                            ></a>
                        </template>
                    </Column>
                    <Column field="className" header="Class" sortable></Column>
                    <Column field="roomName" header="Room" sortable></Column>
                    <Column field="startTime" header="Start Time" sortable>
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.startTime)) }}
                        </template>
                    </Column>
                    <Column field="endTime" header="End Time" sortable>
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.endTime)) }}
                        </template>
                    </Column>
                    <Column field="reason" header="Reason"></Column>
                    <Column field="createdAt" header="Creation Time" sortable>
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.createdAt)) }}
                        </template>
                    </Column>
                    <Column
                        field="latestExecutor"
                        header="Latest Executor"
                        sortable
                    >
                        <template #body="slotProps">
                            <a
                                v-if="slotProps.data.latestExecutor"
                                :href="`mailto:${slotProps.data.latestExecutor}`"
                                class="transition-colors duration-300 hover:text-sky-500"
                                >{{ slotProps.data.latestExecutor }}
                                <SquareArrowOutUpRight
                                    class="inline"
                                ></SquareArrowOutUpRight
                            ></a>
                            <span v-else> - </span>
                        </template>
                    </Column>
                    <Column field="status" header="Status" sortable>
                        <template #body="slotProps">
                            <Tag
                                :value="statusMapping[slotProps.data.status]"
                                :severity="
                                    severityMapping[slotProps.data.status]
                                "
                            ></Tag>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>
