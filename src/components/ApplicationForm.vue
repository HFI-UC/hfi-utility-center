<script setup lang="ts">
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Select from "primevue/select";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { computed, ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { useRequest } from "vue-request";
import Dialog from "primevue/dialog";
import Checkbox from "primevue/checkbox";
import {
    type ApplicationInfo,
    postApplication,
    fetchPolicy,
    postReservation,
} from "../api";
import router from "../router/router";
import { useI18n } from "vue-i18n";

const { data: policyData } = useRequest(fetchPolicy);
const policy = computed(() => policyData.value?.policy || []);
const { t, locale } = useI18n();

const reservation = ref<ApplicationInfo>({
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

watch(
    () => locale.value,
    () => {
        reservation.value.selectedCampus = selectedRoom.value = "";
    },
);

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
    { label: t("campus.office"), items: ["Teachers"] },
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
    ["511", "512", "513", "524"],
]);

const roomsOption = computed(() => {
    return reservation.value.selectedCampus === ""
        ? []
        : reservation.value.selectedCampus === t("campus.shipai")
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
const date = ref<Date | null>(null);

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
const loading = ref(false);

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const roomMapping: Record<string, number> = {
    "iStudy Meeting Room 1": 101,
    "iStudy Meeting Room 2": 102,
    "Writing Center 1": 103,
    "Writing Center 2": 106,
};

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
            return (
                new Date(time.getTime()).setHours(startHour, startMinute) <=
                    time.getTime() &&
                new Date(time.getTime()).setHours(endHour, endMinute) >=
                    time.getTime()
            );
        }
        return false;
    });
};

watch(
    () => reservation.value.startTime,
    () => (reservation.value.endTime = ""),
);

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
                item.classroom === reservation.value.selectedRoom?.toString(),
        );
        postReservation({
            room: reservation.value.selectedRoom.toString(),
        }).then((res) => {
            filteredBookingData.value = res.data.filter(
                (item) => item.auth !== "no",
            );
        });
    },
);

const formatTableDate = (time: string) => {
    const startTime = time.split("-")[0];
    const date = new Date(parseInt(startTime));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatTableDay = (time: string) => {
    const days = time.split(",");
    const daysMapping: Record<string, string> = {
        "1": "Mon.",
        "2": "Tue.",
        "3": "Wed.",
        "4": "Thu.",
        "5": "Fri.",
        "6": "Sat.",
        "0": "Sun.",
    };
    return days.map((item) => daysMapping[item]).join(" ");
};

const formatTableTime = (time: string) => {
    const [start, end] = time.split("-");
    return `${formatTime(new Date(parseInt(start)))} ~ ${formatTime(new Date(parseInt(end)))}`;
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
        (value) => !value,
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

    postApplication(reservation.value).then((res) => {
        loading.value = false;
        router.push({
            path: "/reservation/create",
            query: {
                status: res.success ? "success" : "error",
                message: res.message,
            },
        });
    });
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
                            <IconField>
                                <InputText
                                    id="name"
                                    v-model="reservation.studentName"
                                    v-tooltip.bottom="
                                        $t('application.tooltip.name')
                                    "
                                    :invalid="
                                        !isCompleted &&
                                        reservation.studentName === ''
                                    "
                                />
                                <InputIcon class="pi pi-user"></InputIcon>
                            </IconField>
                            <label for="name">{{
                                $t("application.name")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Select
                                id="class"
                                v-model="reservation.class"
                                v-tooltip.bottom="
                                    $t('application.tooltip.class')
                                "
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
                                <template #dropdownicon>
                                    <i class="pi pi-address-book"></i>
                                </template>
                            </Select>
                            <label for="class">{{
                                $t("application.class")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <IconField>
                                <InputText
                                    id="id"
                                    v-model="reservation.studentId"
                                    v-tooltip.bottom="
                                        $t('application.tooltip.id')
                                    "
                                    :invalid="
                                        !isCompleted &&
                                        reservation.studentId === ''
                                    "
                                />
                                <InputIcon class="pi pi-id-card"></InputIcon>
                            </IconField>
                            <label for="id">{{ $t("application.id") }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <IconField>
                                <InputText
                                    id="email"
                                    v-model="reservation.email"
                                    v-tooltip.bottom="
                                        $t('application.tooltip.email', [
                                            'sam.xulf2024@gdhfi.com',
                                        ])
                                    "
                                    :invalid="
                                        !isCompleted && reservation.email === ''
                                    "
                                />
                                <InputIcon class="pi pi-envelope"></InputIcon>
                            </IconField>
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
                                    $t('application.tooltip.campus')
                                "
                                :options="campus"
                                :invalid="
                                    !isCompleted &&
                                    reservation.selectedCampus === ''
                                "
                            >
                                <template #dropdownicon>
                                    <i class="pi pi-map-marker"></i>
                                </template>
                            </Select>
                            <label for="campus">{{
                                $t("application.campus")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Select
                                id="room"
                                v-tooltip.bottom="
                                    $t('application.tooltip.room')
                                "
                                v-model="selectedRoom"
                                :options="roomsOption"
                                :invalid="!isCompleted && selectedRoom === ''"
                            >
                                <template #dropdownicon>
                                    <i class="pi pi-building"></i>
                                </template>
                            </Select>
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
                                <span class="text-lg font-bold">{{
                                    $t("application.table.reservations")
                                }}</span>
                            </template>
                            <template #empty>
                                <p>{{ $t("application.table.empty") }}</p>
                            </template>
                            <Column :header="$t('application.table.name')">
                                <template #body="slotProps">
                                    {{ slotProps.data.name.split(" / ")[0] }}
                                </template>
                            </Column>
                            <Column :header="$t('application.table.time')">
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
                                <span class="text-lg font-bold">{{
                                    $t("application.table.unavailable")
                                }}</span>
                            </template>
                            <template #empty>
                                <p>{{ $t("application.table.empty") }}</p>
                            </template>
                            <Column :header="$t('application.table.days')">
                                <template #body="slotProps">
                                    {{
                                        `${formatTableDay(slotProps.data.days)}`
                                    }}
                                </template>
                            </Column>
                            <Column :header="$t('application.table.hours')">
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
                                v-tooltip.bottom="
                                    $t('application.tooltip.date')
                                "
                                date-format="yy/mm/dd"
                                showIcon
                                fluid
                                iconDisplay="input"
                                :min-date="minDate"
                                :max-date="maxDate"
                                :manual-input="false"
                                :invalid="!isCompleted && date === null"
                            >
                            </DatePicker>
                            <label for="date">{{
                                $t("application.date")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Select
                                v-tooltip.bottom="
                                    $t('application.tooltip.start_time')
                                "
                                id="startTime"
                                v-model="reservation.startTime"
                                :options="startTimeOptions"
                                :invalid="
                                    !isCompleted && reservation.startTime === ''
                                "
                            >
                                <template #dropdownicon>
                                    <i class="pi pi-calendar-minus"></i>
                                </template>
                            </Select>
                            <label for="startTime">{{
                                $t("application.start_time")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <Select
                                id="endTime"
                                v-model="reservation.endTime"
                                v-tooltip.bottom="
                                    $t('application.tooltip.end_time')
                                "
                                :options="endTimeOptions"
                                :invalid="
                                    !isCompleted && reservation.endTime === ''
                                "
                            >
                                <template #dropdownicon>
                                    <i class="pi pi-calendar-plus"></i>
                                </template>
                            </Select>
                            <label for="endTime">{{
                                $t("application.end_time")
                            }}</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <IconField>
                                <InputText
                                    id="reason"
                                    v-model="reservation.reason"
                                    v-tooltip.bottom="
                                        $t('application.tooltip.reason')
                                    "
                                    :invalid="
                                        !isCompleted &&
                                        reservation.reason === ''
                                    "
                                />
                                <InputIcon
                                    class="pi pi-info-circle"
                                ></InputIcon>
                            </IconField>
                            <label for="reason">{{
                                $t("application.reason")
                            }}</label>
                        </FloatLabel>
                        <div class="flex items-center mt-[20px] mb-[20px]">
                            <Checkbox
                                v-model="reservation.isAgreed"
                                id="check"
                                v-tooltip.bottom="
                                    $t('application.tooltip.checkbox')
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
    font-size: 2em;
    margin: 0.67em 0;
    font-weight: bold;
}

h3 {
    font-size: 1.5em;
    margin: 2rem 0 3rem;
    font-weight: bold;
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
        color 0.4s,
        background-color 0.2s ease;
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
    .p-textarea,
    #datatable {
        min-width: 16rem;
    }
    h1 {
        font-size: 1.75rem;
    }
}
</style>
