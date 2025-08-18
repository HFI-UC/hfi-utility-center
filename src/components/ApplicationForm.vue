<script setup lang="ts">
import { Form, FormFieldState, FormSubmitEvent } from "@primevue/forms";
import { reactive, ref, computed } from "vue";
import {
    ApplicationInfo,
    fetchPolicy,
    postApplication,
    postReservation,
    ReservationInfo,
    RoomPolicyInfo,
} from "../api";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useI18n, I18nT } from "vue-i18n";
import router from "../router/router";
import Button from "primevue/button";
import Message from "primevue/message";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import Card from "primevue/card";
import Select from "primevue/select";
import Dialog from "primevue/dialog";
import Column from "primevue/column";
import Checkbox from "primevue/checkbox";
import DataTable from "primevue/datatable";
import DatePicker from "primevue/datepicker";
import { useRequest } from "vue-request";
import { useToast } from "primevue";

const visible = ref(false);
const { t } = useI18n();
const toast = useToast()
const { data: policyData } = useRequest(fetchPolicy);
const policy = ref<RoomPolicyInfo[] | null>(null);
const reservation = ref<ReservationInfo | null>(null);
const initialValues = reactive<ApplicationInfo>({
    selectedClass: "",
    studentName: "",
    selectedRoom: null,
    studentId: "",
    email: "",
    date: null,
    startTime: "",
    endTime: "",
    reason: "",
    selectedCampus: "",
    isAgreed: false,
});

const campus = computed(() => [
    {
        label: t("campus.shipai"),
        code: "shipai",
    },
    {
        label: t("campus.knowledgecity"),
        code: "kc",
    },
]);

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
        label: t("campus.knowledgecity"),
        items: [
            "Aspect",
            "Clauser",
            "Kitaev",
            "Lieb",
            "Lukin",
            "Pan",
            "Shor",
            "Zeilinger",
        ],
    },
    { label: t("campus.office"), items: ["Teachers"] },
]);

const resolver = ref(
    zodResolver(
        z.object({
            selectedClass: z
                .string()
                .min(1, { message: "message.fill_out" }),
            studentName: z.string().min(1, { message: "message.fill_out" }),
            selectedRoom: z.number({ message: "message.fill_out" }),
            studentId: z
                .string()
                .min(1, { message: "message.fill_out" })
                .startsWith("GJ", { message: "message.start_with_gj" })
                .regex(/\d/, "message.contains_number"),
            email: z
                .string()
                .min(1, { message: "message.fill_out" })
                .email({
                    message: "message.invalid_email",
                }),
            date: z.date({ message: "message.fill_out" }),
            startTime: z.string().min(1, { message: "message.fill_out" }),
            endTime: z.string().min(1, { message: "message.fill_out" }),
            reason: z.string().min(1, { message: "message.fill_out" }),
            selectedCampus: z
                .string()
                .min(1, { message: "message.fill_out" }),
            isAgreed: z
                .boolean()
                .refine((value) => value, { message: "message.fill_out" }),
        }),
    ),
);

const getRooms = ({
    selectedCampus,
}: {
    selectedCampus: FormFieldState | undefined;
}) => {
    if (!selectedCampus || selectedCampus.value == "") return [];
    const rooms = [
        [
            {
                label: "iStudy Meeting Room 1",
                code: 101,
            },
            {
                label: "iStudy Meeting Room 2",
                code: 102,
            },
            {
                label: "605",
                code: 605,
            },
            {
                label: "603",
                code: 603,
            },
            {
                label: "602",
                code: 602,
            },
            {
                label: "601",
                code: 601,
            },
            {
                label: "206",
                code: 206,
            },
            {
                label: "105",
                code: 105,
            },
            {
                label: "Writing Center 1",
                code: 103,
            },
            {
                label: "Writing Center 2",
                code: 106,
            },
        ],
        [
            {
                label: "511",
                code: 511,
            },
            {
                label: "512",
                code: 512,
            },
            {
                label: "513",
                code: 513,
            },
            {
                label: "524",
                code: 524,
            },
        ],
    ];
    return selectedCampus.value == "shipai" ? rooms[0] : rooms[1];
};

const getData = ({ selectedRoom }: Record<string, FormFieldState>) => {
    postReservation({ room: selectedRoom.value }).then((res) => {
        reservation.value = {
            data: res.data.filter((item) => item.auth != "no"),
            success: true,
        };
    });
    if (policyData.value)
        policy.value = policyData.value.policy.filter(
            (item) => item.classroom == selectedRoom.value.toString(),
        );
};

const minDate = ref(new Date());
const maxDate = computed(() => {
    const time = new Date();
    time.setMonth(time.getMonth() + 1);
    return time;
});

const formatTime = (date: Date): string =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

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

const generateTimeOptions = (
    date: Date | null,
    selectedRoom: number | null,
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
        start.setMinutes(start.getMinutes() + 15);
    }

    const res = options.filter((item) => {
        if (!date || !selectedRoom) return true;
        const time = new Date(`${formatDate(date)}T${item}`);
        return (
            validatePolicy(time) &&
            validateTimeConflict(time)
        );
    });
    return res;
};

const validateTimeConflict = (time: Date): boolean => {
    if (!reservation.value) return true;
    return !reservation.value.data.some((booking) => {
        const [start, end] = booking.time.split("-");
        const startDate = new Date(parseInt(start)),
            endDate = new Date(parseInt(end));
        return (
            endDate >= time && startDate <= time
        );
    });
};

const validatePolicy = (time: Date): boolean => {
    if (!policy.value) return true;
    return !policy.value.some((rule) => {
        const days = rule.days.split(",");
        const day = time.getDay();
        if (
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

const getStartTimeOptions = ({
    date,
    selectedRoom,
}: Record<string, FormFieldState | undefined>) => {
    if (!date || !selectedRoom || selectedRoom.value == "" || !date.value) {
        return [];
    }
    return generateTimeOptions(date.value, selectedRoom.value, 6, 30, 21, 15);
};

const getEndTimeOptions = ({
    startTime,
    date,
    selectedRoom,
}: Record<string, FormFieldState | undefined>) => {
    if (
        !startTime ||
        !date ||
        !selectedRoom ||
        selectedRoom.value == "" ||
        startTime.value == "" ||
        !date.value
    )
        return [];
    const [startHours, startMinutes] = startTime.value.split(":").map(Number);
    return generateTimeOptions(
        date.value,
        selectedRoom.value,
        startHours,
        startMinutes + 15,
        21,
        15,
    );
};

const loading = ref(false);
const onSubmitEvent = (form: FormSubmitEvent) => {
    loading.value = true;
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: t("toast.required_field"),
            life: 3000,
        });
        loading.value = false;
        return;
    }
    postApplication(form.values as ApplicationInfo).then((res) => {
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
    <div class="flex items-center justify-center">
        <Card class="w-[28rem]">
            <template #content>
                <Form
                    v-slot="$form"
                    :initialValues
                    :resolver
                    @submit="onSubmitEvent"
                >
                    <div
                        class="flex flex-col m-[10px] items-center justify-center gap-[20px]"
                    >
                        <h2 class="text-center">
                            {{ $t("application.personal_info") }}
                        </h2>
                        <div class="flex flex-col gap-2">
                            <IconField>
                                <InputText
                                    name="studentName"
                                    :placeholder="$t('application.name')"
                                    type="text"
                                    v-tooltip.bottom="
                                        $t('application.tooltip.name')
                                    "
                                />
                                <InputIcon class="icon-user-round"></InputIcon>
                            </IconField>
                            <Message
                                v-if="$form.studentName?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ $t($form.studentName.error?.message) }}</Message
                            >
                        </div>
                        <div class="flex flex-col gap-2">
                            <Select
                                name="selectedClass"
                                v-tooltip.bottom="
                                    $t('application.tooltip.class')
                                "
                                optionGroupLabel="label"
                                optionGroupChildren="items"
                                filter
                                :placeholder="$t('application.class')"
                                :options="classes"
                            >
                                <template #optiongroup="slotProps">
                                    <div class="flex items-center">
                                        <div>{{ slotProps.option.label }}</div>
                                    </div>
                                </template>
                                <template #dropdownicon>
                                    <i class="icon-school"></i>
                                </template>
                            </Select>
                            <Message
                                v-if="$form.selectedClass?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{
                                    $t($form.selectedClass.error?.message)
                                }}</Message
                            >
                        </div>
                        <div class="flex flex-col gap-2">
                            <IconField>
                                <InputText
                                    name="studentId"
                                    :placeholder="$t('application.id')"
                                    v-tooltip.bottom="
                                        $t('application.tooltip.id')
                                    "
                                />
                                <InputIcon class="icon-id-card"></InputIcon>
                            </IconField>
                            <Message
                                v-if="$form.studentId?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ $t($form.studentId.error?.message) }}</Message
                            >
                        </div>
                        <div class="flex flex-col gap-2">
                            <IconField>
                                <InputText
                                    name="email"
                                    :placeholder="$t('application.email')"
                                    v-tooltip.bottom="
                                        $t('application.tooltip.email', [
                                            'sam.xulf2024@gdhfi.com',
                                        ])
                                    "
                                />
                                <InputIcon class="icon-mail"></InputIcon>
                            </IconField>
                            <Message
                                v-if="$form.email?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ $t($form.email.error?.message) }}</Message
                            >
                        </div>
                        <h2 class="text-center">
                            {{ $t("application.room_info") }}
                        </h2>
                        <div class="flex flex-col gap-2">
                            <Select
                                name="selectedCampus"
                                v-tooltip.bottom="
                                    $t('application.tooltip.campus')
                                "
                                optionLabel="label"
                                optionValue="code"
                                :placeholder="$t('application.campus')"
                                :options="campus"
                                @change="$form.selectedRoom.value = null"
                            >
                                <template #dropdownicon>
                                    <i class="icon-building-2"></i>
                                </template>
                            </Select>
                            <Message
                                v-if="$form.selectedCampus?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{
                                    $t($form.selectedCampus.error?.message)
                                }}</Message
                            >
                        </div>
                        <div class="flex flex-col gap-2">
                            <Select
                                name="selectedRoom"
                                v-tooltip.bottom="
                                    $t('application.tooltip.room')
                                "
                                optionLabel="label"
                                optionValue="code"
                                :options="getRooms($form as any)"
                                :placeholder="$t('application.room')"
                                @change="getData($form as any)"
                            >
                                <template #dropdownicon>
                                    <i class="icon-building"></i>
                                </template>
                            </Select>
                            <Message
                                v-if="$form.selectedRoom?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{
                                    $t($form.selectedRoom.error?.message)
                                }}</Message
                            >
                        </div>
                        <DataTable
                            v-if="
                                $form.selectedRoom?.value &&
                                $form.selectedRoom.value != '' &&
                                reservation
                            "
                            :value="reservation.data"
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
                            v-if="
                                $form.selectedRoom?.value &&
                                $form.selectedRoom.value != '' &&
                                policy
                            "
                            :value="policy"
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
                        <div class="flex flex-col gap-2">
                            <DatePicker
                                name="date"
                                v-tooltip.bottom="
                                    $t('application.tooltip.date')
                                "
                                date-format="yy/mm/dd"
                                showIcon
                                fluid
                                :placeholder="$t('application.date')"
                                iconDisplay="input"
                                :min-date="minDate"
                                :max-date="maxDate"
                                :manual-input="false"
                            >
                            <template #inputicon="slotProps">
                                <i class="icon-calendar" @click="slotProps.clickCallback" />
                            </template>
                            </DatePicker>
                            <Message
                                v-if="$form.date?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ $t($form.date.error?.message) }}</Message
                            >
                        </div>
                        <div class="flex flex-col gap-2">
                            <Select
                                v-tooltip.bottom="
                                    $t('application.tooltip.start_time')
                                "
                                name="startTime"
                                :placeholder="$t('application.start_time')"
                                :options="getStartTimeOptions($form as any)"
                            >
                                <template #dropdownicon>
                                    <i class="icon-calendar-arrow-up"></i>
                                </template>
                            </Select>
                            <Message
                                v-if="$form.startTime?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ $t($form.startTime.error?.message) }}</Message
                            >
                        </div>
                        <div class="flex flex-col gap-2">
                            <Select
                                name="endTime"
                                v-tooltip.bottom="
                                    $t('application.tooltip.end_time')
                                "
                                :placeholder="$t('application.end_time')"
                                :options="getEndTimeOptions($form as any)"
                            >
                                <template #dropdownicon>
                                    <i class="icon-calendar-arrow-down"></i>
                                </template>
                            </Select>
                            <Message
                                v-if="$form.endTime?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ $t($form.endTime.error?.message) }}</Message
                            >
                        </div>
                        <div class="flex flex-col gap-2">
                            <IconField>
                                <InputText
                                    name="reason"
                                    :placeholder="$t('application.reason')"
                                    v-tooltip.bottom="
                                        $t('application.tooltip.reason')
                                    "
                                />
                                <InputIcon
                                    class="icon-info"
                                ></InputIcon>
                            </IconField>
                            <Message
                                v-if="$form.reason?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ $t($form.reason.error?.message) }}</Message
                            >
                        </div>
                        <div class="flex flex-col items-center gap-2">
                            <div class="flex items-center">
                                <Checkbox
                                    name="isAgreed"
                                    v-tooltip.bottom="
                                        $t('application.tooltip.checkbox')
                                    "
                                    :binary="true"
                                />
                                <label class="ml-2 text-sm">
                                    <I18nT
                                        keypath="application.checkbox"
                                        scope="global"
                                    >
                                        <a @click="visible = true">{{
                                            $t("application.rule.rule")
                                        }}</a
                                        >.
                                    </I18nT>
                                </label>
                            </div>
                            <Message
                                v-if="$form.isAgreed?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ $t($form.isAgreed.error?.message) }}</Message
                            >
                        </div>
                        <Button
                            icon="icon-upload"
                            type="submit"
                            :label="$t('application.submit')"
                            :loading="loading"
                        />
                    </div>
                </Form>
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

h2 {
    font-size: 1.5em;
    margin: 0.67em 0;
    font-weight: bold;
}

:deep(.p-inputtext),
.p-select,
.p-textarea {
    border-radius: 0.5rem !important;
    min-width: 20rem;
}

#datatable {
    min-width: 23rem;
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
    h2 {
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
