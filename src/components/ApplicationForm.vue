<script setup lang="ts">
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { computed, ref, Ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { useRequest } from "vue-request";
import {
    type ApplicationInfo,
    postApplication,
    fetchPolicy,
    postReservation,
    type RoomPolicyInfo,
} from "../api";
import router from "../router/router";

const { data: policyData } = useRequest(
    (): Promise<{ policy: RoomPolicyInfo[] }> => fetchPolicy(),
    {
        pollingInterval: 1000000,
    },
);

const policy = computed(() => policyData.value?.policy || []);

const reservation: Ref<ApplicationInfo> = ref({
    studentName: "",
    selectedRoom: null,
    studentId: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
});

const rooms = ref([
    "iStudy Meeting Room 1",
    "iStudy Meeting Room 2",
    "606",
    "605",
    "603",
    "602",
    "601",
    "206",
    "105",
    "104",
    "Writing Center 1",
    "Writing Center 2",
    "514",
    "524",
]);

const minDate = ref(new Date());
const maxDate = computed(() => {
    const time = new Date();
    time.setMonth(time.getMonth() + 1);
    return time;
});

const formatTime = (date: Date): string =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const interval = ref(15);
const date: Ref<Date | null> = ref(null);

const generateTimeOptions = (
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
) => {
    const options: string[] = [];
    const start = new Date();
    start.setHours(startHour, startMinute, 0, 0);
    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    while (start <= end) {
        options.push(formatTime(new Date(start)));
        start.setMinutes(start.getMinutes() + interval.value);
    }

    return options;
};

const startTimeOptions = computed(() => generateTimeOptions(6, 30, 21, 15));

const endTimeOptions = computed(() => {
    if (!reservation.value.startTime) return [];
    const [startHours, startMinutes] = reservation.value.startTime
        .split(":")
        .map(Number);
    return generateTimeOptions(
        startHours,
        startMinutes + interval.value,
        21,
        15,
    );
});

const toast = useToast();
const isCompleted = ref(true);

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const roomMapping: { [key: string]: number } = {
    "iStudy Meeting Room 1": 101,
    "iStudy Meeting Room 2": 102,
    "Writing Center 1": 103,
    "Writing Center 2": 106,
};

const loading = ref(false);

const validatePolicy = (
    startTime: Date,
    endTime: Date,
    selectedRoom: number,
): boolean => {
    return !policy.value.some((rule) => {
        const days = rule.days.split(",");
        const day = startTime.getDay();
        if (
            selectedRoom === parseInt(rule.classroom) &&
            days.includes(day.toString())
        ) {
            const [startHour, startMinute] = rule.start_time
                .split(":")
                .map(Number);
            const [endHour, endMinute] = rule.end_time.split(":").map(Number);
            const policyStartDate = new Date(startTime.getTime());
            policyStartDate.setHours(startHour, startMinute);
            const policyEndDate = new Date(startTime.getTime());
            policyEndDate.setHours(endHour, endMinute);
            return policyEndDate > startTime && policyStartDate < endTime;
        }
        return false;
    });
};

const selectedRoom = ref("");
const filteredBookingData = ref([] as any);
const filteredPolicyData = ref([] as any);

watch(
    () => selectedRoom.value,
    (newValue) => {
        reservation.value.selectedRoom =
            roomMapping[newValue] || parseInt(newValue);
        filteredPolicyData.value = policy.value.filter(
            (item) =>
                parseInt(item.classroom) === reservation.value.selectedRoom,
        );
        postReservation(reservation.value.selectedRoom.toString()).then((res) => filteredBookingData.value = res.data)
    },
);

const formatTableDate = (time: string) => {
    const startTime = time.split("-")[0];
    const date = new Date(parseInt(startTime));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatTableDay = (time: string) => {
    const days = time.split(",");
    const daysMapping: { [key: string]: string } = {
        "1": "Mon.",
        "2": "Tue.",
        "3": "Wed.",
        "4": "Thu.",
        "5": "Fri.",
        "6": "Sat.",
        "0": "Sun.",
    };
    const convertedDays = [];
    for (const item of days) {
        convertedDays.push(daysMapping[item]);
    }
    return convertedDays.join(" ");
};

const formatTableTime = (time: string) => {
    const [start, end] = time.split("-");
    const startTime = new Date(parseInt(start));
    const endTime = new Date(parseInt(end));
    const formatHour = (date: Date): string =>
        `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return `${formatHour(startTime)} ~ ${formatHour(endTime)}`;
};

const onClickEvent = () => {
    loading.value = true;
    if (date.value instanceof Date) {
        reservation.value.date = formatDate(date.value);
    }
    reservation.value.selectedRoom =
        roomMapping[selectedRoom.value] || parseInt(selectedRoom.value);
    isCompleted.value = !Object.values(reservation.value).some(
        (value) => value === "" || value == null,
    );
    if (!isCompleted.value) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill out the required field!",
            life: 3000,
        });
        loading.value = false;
        return;
    }

    const startTime = new Date(
        `${reservation.value.date}T${reservation.value.startTime}`,
    );
    const endTime = new Date(
        `${reservation.value.date}T${reservation.value.endTime}`,
    );

    if (!validatePolicy(startTime, endTime, reservation.value.selectedRoom)) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Selected time does not comply with room policy.",
            life: 3000,
        });
        loading.value = false;
        return;
    }

    postApplication(reservation.value).then(
        (res: { success: boolean; message: string }) => {
            if (res.success) {
                loading.value = false;
                router.push({
                    path: "/reservation/create",
                    query: { status: "success", message: res.message },
                });
            } else {
                loading.value = false;
                toast.add({
                    severity: "error",
                    summary: "Error",
                    detail: res.message,
                    life: 3000,
                });
            }
        },
    );
};
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <Card id="card">
            <template #content>
                <div class="flex flex-col items-center">
                    <div
                        class="flex flex-col m-[10px] items-center justify-center"
                        id="form-container"
                    >
                        <h3>Personal Information</h3>
                        <FloatLabel class="m-[20px]">
                            <InputText
                                id="name"
                                v-model="reservation.studentName"
                                :invalid="
                                    !isCompleted &&
                                    reservation.studentName === ''
                                "
                            />
                            <label for="name">Name</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <InputText
                                id="id"
                                v-model="reservation.studentId"
                                :invalid="
                                    !isCompleted && reservation.studentId === ''
                                "
                            />
                            <label for="id">Student ID</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <InputText
                                id="name"
                                v-model="reservation.email"
                                :invalid="
                                    !isCompleted && reservation.email === ''
                                "
                            />
                            <label for="name">E-mail</label>
                        </FloatLabel>
                        <h3>Room Information</h3>
                        <FloatLabel class="m-[20px]">
                            <Select
                                id="room"
                                v-model="selectedRoom"
                                :options="rooms"
                                :invalid="!isCompleted && selectedRoom === ''"
                            />
                            <label for="room">Room</label>
                        </FloatLabel>
                        <DataTable
                            v-if="reservation.selectedRoom"
                            :value="filteredBookingData"
                            id="datatable"
                        >
                            <template #header>
                                <span class="text-lg font-bold"
                                    >Reservations</span
                                >
                            </template>
                            <template #empty>
                                <p>No available data.</p>
                            </template>
                            <Column field="name" header="Name"></Column>
                            <Column header="Date / Time">
                                <template #body="slotProps">
                                    {{
                                        `${formatTableDate(slotProps.data.time)} / ${formatTableTime(slotProps.data.time)}`
                                    }}
                                </template>
                            </Column>
                        </DataTable>
                        <DataTable
                            v-if="reservation.selectedRoom"
                            :value="filteredPolicyData"
                            id="datatable"
                        >
                            <template #header>
                                <span class="text-lg font-bold">Unavailable Time</span>
                            </template>
                            <template #empty>
                                <p>No available data.</p>
                            </template>
                            <Column header="Day(s)">
                                <template #body="slotProps">
                                    {{
                                        `${formatTableDay(slotProps.data.days)}`
                                    }}
                                </template>
                            </Column>
                            <Column header="Hours">
                                <template #body="slotProps">
                                    {{
                                        `${slotProps.data.start_time.slice(0, 5)} ~ ${slotProps.data.end_time.slice(0, 5)}`
                                    }}
                                </template>
                            </Column>
                        </DataTable>
                        <FloatLabel class="m-[20px]">
                            <DatePicker
                                id="date"
                                v-model="date"
                                date-format="yy/mm/dd"
                                :min-date="minDate"
                                :max-date="maxDate"
                                :manual-input="false"
                                :invalid="!isCompleted && date === null"
                            />
                            <label for="date">Date</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Select
                                id="startTime"
                                v-model="reservation.startTime"
                                :options="startTimeOptions"
                                :invalid="
                                    !isCompleted && reservation.startTime === ''
                                "
                            />
                            <label for="startTime">Start Time</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Select
                                id="endTime"
                                v-model="reservation.endTime"
                                :options="endTimeOptions"
                                :invalid="
                                    !isCompleted && reservation.endTime === ''
                                "
                            />
                            <label for="endTime">End Time</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Textarea
                                id="reason"
                                v-model="reservation.reason"
                                :invalid="
                                    !isCompleted && reservation.reason === ''
                                "
                            />
                            <label for="reason">Reason</label>
                        </FloatLabel>
                    </div>
                    <Button
                        icon="pi pi-upload"
                        label="Submit"
                        :loading="loading"
                        @click="onClickEvent()"
                    />
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

h3 {
    font-size: 1.5em;
    margin-block-start: 2rem;
    margin-block-end: 3rem;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

.p-select,
.p-datepicker,
.p-textarea {
    min-width: 20rem;
}

#card {
    width: 28rem;
}

input {
    min-width: 20rem;
}

#datatable {
    min-width: 23rem;
    margin: 20px;
}

@media screen and (max-width: 720px) {
    #card {
        width: 25rem;
    }

    h1 {
        font-size: 1.75rem;
    }
}
</style>
