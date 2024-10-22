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
import Dialog from "primevue/dialog";
import Checkbox from "primevue/checkbox";
import {
    type ApplicationInfo,
    postApplication,
    fetchPolicy,
    postReservation,
    type RoomPolicyInfo,
} from "../api";
import router from "../router/router";
import { useI18n } from "vue-i18n";

const { data: policyData } = useRequest(
    (): Promise<{ policy: RoomPolicyInfo[] }> => fetchPolicy(),
    {
        pollingInterval: 1000000,
    },
);

const policy = computed(() => policyData.value?.policy || []);

const { t } = useI18n();

const reservation: Ref<ApplicationInfo> = ref({
    class: "",
    studentName: "",
    selectedRoom: null,
    studentId: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
    selectedCampus: "",
    isAgreed: false,
});

const visible = ref(false);

const campus = computed(() => [t("campus.shipai"), t("campus.knowledgecity")]);

const classes = computed(() => [
    {
        label: t("campus.shipai"),
        items: [
            "Demis",
            "Yann",
            "Rana",
            "Kate",
            "Geoffrey",
            "Andrew",
            "Feifei",
            "Calatrava",
            "Wright",
            "Hadid",
            "Mies",
            "Gaudi",
        ],
    },
    {
        label: t("campus.knowledgecity"),
        items: [
            "Bendura",
            "Gibson",
            "Loftus",
            "Seligman",
            "Ainsworth",
            "Maslow",
            "Piaget",
            "Skinner",
        ],
    },
    {
        label: t("campus.office"),
        items: ["Teachers"],
    },
]);

const rooms = ref([
    [
        "iStudy Meeting Room 1",
        "iStudy Meeting Room 2",
        "606",
        "605",
        "603",
        "602",
        "601",
        "206",
        "105",
        "Writing Center 1",
        "Writing Center 2",
    ],
    ["512", "524"],
]);

const roomsOption = computed(() => {
    if (reservation.value.selectedCampus == "") return [];
    return reservation.value.selectedCampus == t("campus.shipai")
        ? rooms.value[0]
        : rooms.value[1];
});

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

    return options.filter((item) => {
        if (!date.value || !reservation.value.selectedRoom) return true;
        const time = new Date(`${reservation.value.date}T${item}`);
        return validatePolicy(time, reservation.value.selectedRoom);
    });
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

const validatePolicy = (time: Date, selectedRoom: number): boolean => {
    return !policy.value.some((rule) => {
        const days = rule.days.split(",");
        const day = time.getDay();
        if (
            selectedRoom === parseInt(rule.classroom) &&
            days.includes(day.toString())
        ) {
            const [startHour, startMinute] = rule.start_time
                .split(":")
                .map(Number);
            const [endHour, endMinute] = rule.end_time.split(":").map(Number);
            const policyStartDate = new Date(time.getTime());
            policyStartDate.setHours(startHour, startMinute);
            const policyEndDate = new Date(time.getTime());
            policyEndDate.setHours(endHour, endMinute);
            return policyEndDate >= time && policyStartDate <= time;
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
                item.classroom == reservation.value.selectedRoom?.toString(),
        );
        postReservation({
            room: reservation.value.selectedRoom.toString(),
        }).then(
            (res) =>
                (filteredBookingData.value = res.data.filter(
                    (item) => item.auth !== "no",
                )),
        );
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

watch(
    () => date.value,
    () => {
        if (date.value) {
            reservation.value.date = formatDate(date.value);
        }
    },
);

const onClickEvent = () => {
    loading.value = true;
    isCompleted.value = !Object.values(reservation.value).some(
        (value) => value === "" || value == null || value == false,
    );
    if (!isCompleted.value) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: t("toast.required_field"),
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
                router.push({
                    path: "/reservation/create",
                    query: { status: "error", message: res.message },
                });
            }
        },
    );
};

const rules = computed(() =>
    Array.from({ length: 12 }, (_, i) => t(`application.rule.${i + 1}`)),
);
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="$t('application.rule.rule')"
        class="w-[25rem]"
    >
        <p v-for="i in rules" class="mb-3">{{ i }}</p>
    </Dialog>
    <div class="flex flex-col items-center justify-center">
        <Card id="card">
            <template #content>
                <div class="flex flex-col items-center">
                    <div
                        class="flex flex-col m-[10px] items-center justify-center"
                        id="form-container"
                    >
                        <h3 class="text-center">
                            {{ $t("application.personal_info") }}
                        </h3>
                        <FloatLabel class="m-[20px]">
                            <InputText
                                id="name"
                                v-model="reservation.studentName"
                                v-tooltip.bottom="
                                    'Your Chinese name and English name (e.g. 山姆 Sam).'
                                "
                                :invalid="
                                    !isCompleted &&
                                    reservation.studentName === ''
                                "
                            />
                            <label for="name">{{
                                $t("application.name")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Select
                                id="class"
                                v-model="reservation.class"
                                v-tooltip.bottom="'Your class.'"
                                optionGroupLabel="label"
                                optionGroupChildren="items"
                                filter
                                :options="classes"
                                :invalid="
                                    !isCompleted && reservation.class === ''
                                "
                            >
                                <template #optiongroup="slotProps">
                                    <div class="flex items-center">
                                        <div>{{ slotProps.option.label }}</div>
                                    </div>
                                </template>
                            </Select>
                            <label for="class">{{
                                $t("application.class")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <InputText
                                id="id"
                                v-model="reservation.studentId"
                                v-tooltip.bottom="
                                    'Your student ID (e.g. GJ12345678).'
                                "
                                :invalid="
                                    !isCompleted && reservation.studentId === ''
                                "
                            />
                            <label for="id">{{ $t("application.id") }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <InputText
                                id="email"
                                v-model="reservation.email"
                                v-tooltip.bottom="
                                    'Your e-mail (e.g. sam.xulf2024@gdhfi.com).'
                                "
                                :invalid="
                                    !isCompleted && reservation.email === ''
                                "
                            />
                            <label for="email">{{
                                $t("application.email")
                            }}</label>
                        </FloatLabel>
                        <h3 class="text-center">
                            {{ $t("application.room_info") }}
                        </h3>
                        <FloatLabel class="m-[20px]">
                            <Select
                                id="campus"
                                v-model="reservation.selectedCampus"
                                v-tooltip.bottom="
                                    'Campus to which you are applying.'
                                "
                                :options="campus"
                                :invalid="
                                    !isCompleted &&
                                    reservation.selectedCampus === ''
                                "
                            />
                            <label for="campus">{{
                                $t("application.campus")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Select
                                id="room"
                                v-tooltip.bottom="
                                    'Room to which you are applying.'
                                "
                                v-model="selectedRoom"
                                :options="roomsOption"
                                :invalid="!isCompleted && selectedRoom === ''"
                            />
                            <label for="room">{{
                                $t("application.room")
                            }}</label>
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
                            <Column header="Name">
                                <template #body="slotProps">
                                    {{ slotProps.data.name.split(" / ")[0] }}
                                </template>
                            </Column>
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
                                <span class="text-lg font-bold"
                                    >Unavailable Time</span
                                >
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
                                v-tooltip.bottom="'Date of reservation.'"
                                date-format="yy/mm/dd"
                                :min-date="minDate"
                                :max-date="maxDate"
                                :manual-input="false"
                                :invalid="!isCompleted && date === null"
                            />
                            <label for="date">{{
                                $t("application.date")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Select
                                v-tooltip.bottom="'Start time of reservation.'"
                                id="startTime"
                                v-model="reservation.startTime"
                                :options="startTimeOptions"
                                :invalid="
                                    !isCompleted && reservation.startTime === ''
                                "
                            />
                            <label for="startTime">{{
                                $t("application.start_time")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Select
                                id="endTime"
                                v-model="reservation.endTime"
                                v-tooltip.bottom="'End time of reservation.'"
                                :options="endTimeOptions"
                                :invalid="
                                    !isCompleted && reservation.endTime === ''
                                "
                            />
                            <label for="endTime">{{
                                $t("application.end_time")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Textarea
                                id="reason"
                                v-model="reservation.reason"
                                v-tooltip.bottom="
                                    'Reason of reservation (e.g. I wanna practise my TOEFL test).'
                                "
                                :invalid="
                                    !isCompleted && reservation.reason === ''
                                "
                            />
                            <label for="reason">{{
                                $t("application.reason")
                            }}</label>
                        </FloatLabel>
                        <div class="flex items-center mt-[20px] mb-[20px]">
                            <Checkbox
                                v-model="reservation.isAgreed"
                                id="check"
                                v-tooltip.bottom="
                                    'You will need to follow the rules of the classroom to make an application.'
                                "
                                :invalid="!isCompleted && !reservation.isAgreed"
                                :binary="true"
                            />
                            <label for="check" class="ml-2 text-sm">
                                <i18n-t
                                    keypath="application.checkbox"
                                    scope="global"
                                >
                                    <a @click="visible = true">{{
                                        $t("application.rule.rule")
                                    }}</a
                                    >.
                                </i18n-t>
                            </label>
                        </div>
                    </div>
                    <Button
                        icon="pi pi-upload"
                        :label="$t('application.submit')"
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

:deep(.p-inputtext),
.p-select,
.p-textarea {
    border-radius: 0.5rem !important;
    min-width: 20rem;
}

#card {
    width: 28rem;
}

#datatable {
    min-width: 20rem;
    margin: 20px;
}

button {
    border-radius: 0.5rem;
}

a {
    color: var(--p-primary-600);
    text-decoration: none;
    transition:
        0.4s color,
        0.2s background-color ease;
}

a:hover {
    color: var(--p-highlight-text-color);
    background-color: var(--p-highlight-bg);
}

@media screen and (max-width: 720px) {
    #card {
        width: calc(100% - 1.5rem);
    }
    h3 {
        font-size: 1.45rem;
    }
    :deep(.p-inputtext),
    .p-select,
    .p-textarea {
        min-width: 16rem;
    }

    #datatable {
        min-width: 16rem;
    }

    h1 {
        font-size: 1.75rem;
    }
}
</style>
