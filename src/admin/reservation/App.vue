<script setup lang="ts">
import { useRequest } from "vue-request";
import AdminLogin from "../../components/AdminLogin.vue";
import {
    getReservations,
    getExportReservations,
    getFutureReservations,
    getRooms,
    postApproveReservation,
    postLogin,
} from "../../api";
import { computed, onMounted, ref } from "vue";
import { Check, Download, SquareArrowOutUpRight, X } from "lucide-vue-next";
import { useToast } from "primevue";
import { type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";
import Navbar from "../../components/Navbar.vue";
import LoadingMask from "../../components/LoadingMask.vue";

const {
    data: futureReservations,
    run: fetchFutureReservations,
} = useRequest(getFutureReservations);

const searchKeyword = ref<string | null>(null);
const searchTime = ref<Date[] | null>(null);
const searchStatus = ref<{ id: string; name: string; severity: string } | null>(
    null,
);
const searchRoom = ref<number | null>(null);
const statusOptions = [
    { id: "pending", name: "Pending", severity: "info" },
    { id: "approved", name: "Approved", severity: "success" },
    { id: "rejected", name: "Rejected", severity: "danger" },
];
const pageOffset = ref(0);
const page = computed(() => Math.floor(pageOffset.value / 20));

const {
    data: allReservations,
    run: fetchAllReservations,
    loading: allReservationsLoading,
} = useRequest(
    () =>
        getReservations(
            searchKeyword.value,
            searchRoom.value,
            searchStatus.value?.id,
            page.value,
            searchTime.value ? searchTime.value[0] : null,
            searchTime.value ? searchTime.value[1] : null,
        ),
    {
        refreshDeps: [
            searchKeyword,
            searchTime,
            searchStatus,
            searchRoom,
            page,
        ],
        debounceInterval: 300,
    },
);

const { data: rooms } = useRequest(getRooms);
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
        z.object({
            option: z.number({ error: "Format is required." }),
            time: z.array(z.date().nullable()).length(2).optional(),
            mode: z.literal(["by-room", "single-sheet"]),
        }),
    ),
);

const modeOptions = [
    { label: "By room", code: "by-room" },
    { label: "Single sheet", code: "single-sheet" },
];
const exportInitialValues = ref({
    option: null,
    time: [null, null],
    mode: null,
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
        startTime = form.values.time[0];
        endTime = form.values.time[1];
    }
    const _allReservations = await getReservations(
        searchKeyword.value,
        searchRoom.value,
        searchStatus.value?.id,
        0,
        startTime,
        endTime,
    );
    if (startTime && endTime && _allReservations?.data) {
        const rangeStart = startTime.getTime();
        const rangeEnd = endTime.getTime();
        const hasAny = _allReservations.data.reservations.some((r: any) => {
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
        startTime && form.values.option == 4
            ? Math.floor(startTime.getTime() / 1000)
            : null,
        endTime && form.values.option == 4
            ? Math.floor(endTime.getTime() / 1000)
            : null,
        form.values.mode,
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
                    name="time"
                    placeholder="Time"
                    selectionMode="range"
                    updateModelType="date"
                    dateFormat="yy/mm/dd"
                    fluid
                ></DatePicker>
                <Message
                    v-if="$form.time?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.time.error?.message }}</Message
                >
                <Select
                    name="mode"
                    fluid
                    optionLabel="label"
                    optionValue="code"
                    placeholder="Select an export mode"
                    :options="modeOptions"
                ></Select>
                <Message
                    v-if="$form.mode?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.mode.error?.message }}</Message
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
                    :rows="20"
                    :value="allReservations?.data.reservations"
                    :loading="allReservationsLoading"
                    lazy
                    :totalRecords="allReservations?.data.total"
                    class="text-nowrap"
                    v-model:first="pageOffset"
                >
                    <template #header>
                        <div class="flex flex-col gap-4">
                            <span class="font-bold text-lg"
                                >All Reservations</span
                            >
                            <div class="grid grid-cols-9 gap-2">
                                <InputText
                                    v-model="searchKeyword"
                                    placeholder="Keyword"
                                    size="small"
                                    class="sm:col-span-3 md:col-span-2 col-span-9"
                                    fluid
                                ></InputText>
                                <Select
                                    showClear
                                    v-model="searchRoom"
                                    placeholder="Room"
                                    optionLabel="name"
                                    optionValue="id"
                                    :options="rooms?.data"
                                    size="small"
                                    class="sm:col-span-3 md:col-span-2 col-span-9"
                                    fluid
                                >
                                </Select>
                                <Select
                                    showClear
                                    v-model="searchStatus"
                                    placeholder="Status"
                                    :options="statusOptions"
                                    size="small"
                                    class="sm:col-span-3 md:col-span-2 col-span-9"
                                    fluid
                                >
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value">
                                            <Tag
                                                :value="slotProps.value.name"
                                                :severity="
                                                    slotProps.value.severity
                                                "
                                                class="h-5 !text-xs"
                                            ></Tag>
                                        </div>
                                    </template>
                                    <template #option="slotProps">
                                        <div class="flex flex-col">
                                            <Tag
                                                :value="slotProps.option.name"
                                                :severity="
                                                    slotProps.option.severity
                                                "
                                                class="h-5 !text-xs"
                                            ></Tag>
                                        </div>
                                    </template>
                                </Select>
                                <DatePicker
                                    showClear
                                    v-model="searchTime"
                                    selectionMode="range"
                                    placeholder="Time Range"
                                    size="small"
                                    class="md:col-span-3 col-span-9"
                                    updateModelType="date"
                                    fluid
                                    showTime
                                    dateFormat="yy/mm/dd"
                                >
                                    <template #footer>
                                        <span
                                            class="text-sm flex justify-center mt-4"
                                            >*Select two time</span
                                        >
                                    </template>
                                </DatePicker>
                                <Button
                                    @click="exportVisible = true"
                                    size="small"
                                    :disabled="
                                        allReservations?.data.reservations
                                            .length === 0
                                    "
                                    class="md:col-span-3 lg:col-span-2 xl:col-span-1 col-span-9"
                                    fluid
                                    ><Download></Download>Export (.xlsx)</Button
                                >
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <p class="py-1">No available reservations.</p>
                    </template>
                    <Column field="id" header="ID"></Column>
                    <Column field="studentName" header="Student Name"></Column>
                    <Column field="studentId" header="Student ID"></Column>
                    <Column field="email" header="E-mail">
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
                    <Column field="className" header="Class"></Column>
                    <Column field="roomName" header="Room"></Column>
                    <Column field="startTime" header="Start Time">
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.startTime)) }}
                        </template>
                    </Column>
                    <Column field="endTime" header="End Time">
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.endTime)) }}
                        </template>
                    </Column>
                    <Column field="reason" header="Reason">
                        <template #body="slotProps">
                            <div class="whitespace-normal w-[30rem]">
                                {{ slotProps.data.reason }}
                            </div>
                        </template>
                    </Column>
                    <Column field="createdAt" header="Creation Time">
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.createdAt)) }}
                        </template>
                    </Column>
                    <Column field="latestExecutor" header="Latest Executor">
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
                    <Column field="status" header="Status">
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
