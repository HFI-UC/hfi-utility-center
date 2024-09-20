<script setup lang="ts">
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import Card from "primevue/card";
import Toast from "primevue/toast";
import { computed, ref, Ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useRequest } from "vue-request";
import {
    type Policy,
    type ReservationInfo,
    type ApplicationInfo,
    postApplication,
    fetchPolicy,
    fetchReservation
} from "../api";

const { data: policyData } = useRequest((): Promise<Policy> => fetchPolicy(), {
    pollingInterval: 1000000,
});

const { data: booking } = useRequest(
    (): Promise<ReservationInfo> => fetchReservation(),
    { pollingInterval: 1000000 },
);

const policy = computed(() => policyData.value?.policy || []);
const bookingData = computed(() => booking.value?.data || []);

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

const validateTimeConflict = (
    startTime: Date,
    endTime: Date,
    selectRoom: number,
): boolean => {
    return !bookingData.value.some((booking) => {
        const [start, end] = booking.time.split("-");
        const startDate = new Date(parseInt(start)),
            endDate = new Date(parseInt(end));
        return (
            selectRoom == booking.room &&
            endDate > startTime &&
            startDate < endTime
        );
    });
};

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
            days.includes((day - 1).toString())
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

const selectedRoom = ref("")

const onClickEvent = () => {
    if (date.value instanceof Date) {
        reservation.value.date = formatDate(date.value);
    }
    reservation.value.selectedRoom =
        roomMapping[selectedRoom.value] ||
        parseInt(selectedRoom.value);
    isCompleted.value = !Object.values(reservation.value).some(
        (value) => value === "" || value == null,
    );
    if (!isCompleted.value) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill out the blank!",
            life: 3000,
        });
        return;
    }

    const startTime = new Date(
        `${reservation.value.date}T${reservation.value.startTime}`,
    );
    const endTime = new Date(
        `${reservation.value.date}T${reservation.value.endTime}`,
    );

    if (!validateTimeConflict(startTime, endTime, reservation.value.selectedRoom)) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Selected time is not available! Choose another time instead.",
            life: 3000,
        });
        return;
    }

    if (!validatePolicy(startTime, endTime, reservation.value.selectedRoom)) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Selected time does not comply with room policy.",
            life: 3000,
        });
        return;
    }

    const data = postApplication(reservation.value)

    console.log(data)

};
</script>

<template>
    <Toast />
    <div class="flex flex-col items-center justify-center">
        <Card id="card">
            <template #content>
                <div class="flex flex-col items-center">
                    <h1>Application Form</h1>
                    <p>Fill out the form to submit a booking request.</p>

                    <div class="m-[10px]" id="form-container">
                        <FloatLabel class="m-[30px]">
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
                        <FloatLabel class="m-[30px]">
                            <Select
                                id="room"
                                v-model="selectedRoom"
                                :options="rooms"
                                :invalid="
                                    !isCompleted &&
                                    selectedRoom === ''
                                "
                            />
                            <label for="room">Room</label>
                        </FloatLabel>
                        <FloatLabel class="m-[30px]">
                            <InputText
                                id="id"
                                v-model="reservation.studentId"
                                :invalid="
                                    !isCompleted && reservation.studentId === ''
                                "
                            />
                            <label for="id">Student ID</label>
                        </FloatLabel>
                        <FloatLabel class="m-[30px]">
                            <InputText
                                id="name"
                                v-model="reservation.email"
                                :invalid="
                                    !isCompleted && reservation.email === ''
                                "
                            />
                            <label for="name">E-mail</label>
                        </FloatLabel>
                        <FloatLabel class="m-[30px]">
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
                        <FloatLabel class="m-[30px]">
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
                        <FloatLabel class="m-[30px]">
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
                        <FloatLabel class="m-[30px]">
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
                    <Button label="Submit" @click="onClickEvent" />
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

@media screen and (max-width: 720px) {
    #card {
        width: 25rem;
    }

    h3 {
        font-size: 1.25rem;
    }
}
</style>
