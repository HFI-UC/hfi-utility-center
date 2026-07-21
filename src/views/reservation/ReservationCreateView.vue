<script setup lang="ts">
import {
    Form,
    type FormFieldState,
    type FormSubmitEvent,
} from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";
import {
    getCampuses,
    getClasses,
    getRooms,
    getReservations,
    type Reservation,
    postCreateReservation,
    type Class,
    type Campus,
    type RoomPolicy,
} from "@/api";
import { computed, ref } from "vue";
import { useRequest } from "vue-request";
import {
    Check,
    Home,
    PartyPopper,
    PenSquare,
    RotateCcw,
} from "lucide-vue-next";
import confetti from "canvas-confetti";
import { useToast } from "primevue";
import { useI18n } from "vue-i18n";
import AdCarousel from "@/components/AdCarousel.vue";

const { t, tm } = useI18n();
const resolver = computed(() =>
    zodResolver(
        z.object({
            classId: z.number({
                error: t("reservation.create.validation.classRequired"),
            }),
            studentName: z
                .string({
                    error: t(
                        "reservation.create.validation.studentNameRequired"
                    ),
                })
                .min(1, {
                    message: t(
                        "reservation.create.validation.studentNameRequired"
                    ),
                }),
            room: z.number({
                error: t("reservation.create.validation.roomRequired"),
            }),
            studentId: z
                .string({
                    error: t(
                        "reservation.create.validation.studentId.required"
                    ),
                })
                .startsWith("GJ", {
                    message: t(
                        "reservation.create.validation.studentId.prefix"
                    ),
                })
                .min(10, {
                    message: t(
                        "reservation.create.validation.studentId.minLength"
                    ),
                })
                .refine((val) => /^\d{8}$/.test(val.slice(-8)), {
                    message: t(
                        "reservation.create.validation.studentId.digits"
                    ),
                }),
            email: z
                .email({
                    message: t("reservation.create.validation.email.format"),
                })
                .min(1, {
                    message: t("reservation.create.validation.email.required"),
                }),
            date: z.date({
                error: t("reservation.create.validation.dateRequired"),
            }),
            startTime: z
                .string({
                    error: t("reservation.create.validation.startTimeRequired"),
                })
                .min(1, {
                    message: t(
                        "reservation.create.validation.startTimeRequired"
                    ),
                }),
            endTime: z
                .string({
                    error: t("reservation.create.validation.endTimeRequired"),
                })
                .min(1, {
                    message: t("reservation.create.validation.endTimeRequired"),
                }),
            reason: z
                .string({
                    error: t("reservation.create.validation.reasonRequired"),
                })
                .min(1, {
                    message: t("reservation.create.validation.reasonRequired"),
                }),
            campus: z.number({
                error: t("reservation.create.validation.campusRequired"),
            }),
            isAgreed: z
                .boolean({ error: t("reservation.create.validation.isAgreed") })
                .refine((val) => val === true, {
                    message: t("reservation.create.validation.isAgreed"),
                }),
        })
    )
);

const { data: classData } = useRequest(getClasses);
const { data: campusData } = useRequest(getCampuses);
const { data: roomData } = useRequest(getRooms);
const room = computed(
    () => roomData.value?.data.filter((room) => room.enabled) || []
);
const classes = computed(() => {
    const _data = classData.value?.data;
    if (!_data) return [];
    const res: { campus: string; classes: any[] }[] = [];
    campusData.value?.data.some((c: Campus) => {
        const campusClasses = _data.filter(
            (item: Class) => item.campus === c.id
        );
        if (campusClasses.length) {
            res.push({ campus: c.name, classes: campusClasses });
        }
    });
    return res;
});
const reservations = ref<Reservation[]>([] as Reservation[]);

const formatTime = (date: Date): string =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
    ).padStart(2, "0")}`;

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatTableDate = (time: string) => {
    const date = new Date(time);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatTableWeekDay = (days: number[]) => {
    const daysMapping = tm("common.weekday.short") as string[];
    return days.map((item) => daysMapping[item]).join(" ");
};

const formatTableTime = (startTime: string, endTime: string) => {
    return `${formatTime(new Date(startTime))} - ${formatTime(
        new Date(endTime)
    )}`;
};

const generateTimeOptions = (
    date: Date | null,
    room: number | null,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
    selectedClass: number,
    validate = true
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

    if (!validate) return options;

    const _class = classData.value?.data.find(
        (item: Class) => item.id === selectedClass
    );
    const _campus: Campus | undefined = campusData.value?.data.find(
        (item: Campus) => item.id === _class?.campus
    );
    const res = options.filter((item) => {
        if (!date || !room || !_campus || _campus.isPrivileged) return true;
        const time = new Date(`${formatDate(date)}T${item}`);
        return validatePolicy(time, room) && validateTimeConflict(time);
    });
    return res;
};

const validateTimeConflict = (
    startTime: Date,
    endTime: Date | null = null
): boolean => {
    return !reservations.value.some((reservation) => {
        const existingStart = new Date(reservation.startTime);
        const existingEnd = new Date(reservation.endTime);
        if (endTime) {
            return existingEnd > startTime && existingStart < endTime;
        }
        return existingEnd > startTime && existingStart <= startTime;
    });
};

const getRoomPolicyData = (id: number) => {
    if (!room.value) return [];
    return (
        room.value
            .find((room) => room.id == id)
            ?.policies.filter((policy) => policy.enabled) || []
    );
};

const validatePolicy = (
    startTime: Date,
    selectedRoom: number,
    endTime: Date | null = null
): boolean => {
    if (!room.value) return true;
    const selectedRoomPolicy: RoomPolicy[] =
        room.value
            .find((room) => room.id == selectedRoom)
            ?.policies.filter((policy) => policy.enabled) || [];
    if (selectedRoomPolicy.length === 0) return true;

    return !selectedRoomPolicy.some((rule) => {
        const days = rule.days;
        const day = startTime.getDay();
        if (days.includes(day)) {
            const [startHour, startMinute] = rule.startTime;
            const [endHour, endMinute] = rule.endTime;
            const policyStart = new Date(startTime.getTime());
            policyStart.setHours(startHour, startMinute, 0, 0);
            const policyEnd = new Date(startTime.getTime());
            policyEnd.setHours(endHour, endMinute, 0, 0);

            if (endTime) {
                return policyEnd > startTime && policyStart < endTime;
            }
            return policyEnd > startTime && policyStart < startTime;
        }
        return false;
    });
};

const getStartTimeOptions = ({
    date,
    selectedRoom,
    selectedClass,
}: Record<string, FormFieldState | undefined>) => {
    if (!date?.value || !selectedRoom?.value || !selectedClass?.value)
        return [];

    let startHour = 8;
    let startMinute = 0;
    if (formatDate(date.value) === formatDate(new Date())) {
        const now = new Date();
        if (now.getHours() >= 8) {
            const rounded = Math.ceil(now.getMinutes() / 15) * 15;
            if (rounded === 60) {
                startHour = now.getHours() + 1;
                startMinute = 0;
            } else {
                startHour = now.getHours();
                startMinute = rounded;
            }
        }
    }

    return generateTimeOptions(
        date.value,
        selectedRoom.value,
        startHour,
        startMinute,
        21,
        15,
        selectedClass.value
    );
};

const getEndTimeOptions = ({
    startTime,
    date,
    selectedRoom,
    selectedClass,
}: Record<string, FormFieldState | undefined>) => {
    if (
        !startTime?.value ||
        !date?.value ||
        !selectedRoom?.value ||
        !selectedClass?.value
    )
        return [];
    const [startHours, startMinutes] = startTime.value.split(":").map(Number);
    const options = generateTimeOptions(
        date.value,
        selectedRoom.value,
        startHours,
        startMinutes + 15,
        Math.min(startHours + 2, 21),
        Math.min(startHours + 2, 21) === 21
            ? startHours + 2 === 21 && startMinutes === 0
                ? 0
                : Math.max(startMinutes, 30)
            : startMinutes,
        selectedClass.value,
        false
    );

    const _class = classData.value?.data.find(
        (item: Class) => item.id === selectedClass.value
    );
    const _campus: Campus | undefined = campusData.value?.data.find(
        (item: Campus) => item.id === _class?.campus
    );

    return options.filter((endTimeString) => {
        if (!date.value || !selectedRoom.value || _campus?.isPrivileged)
            return true;
        const start = new Date(`${formatDate(date.value)}T${startTime.value}`);
        const end = new Date(`${formatDate(date.value)}T${endTimeString}`);
        return (
            validatePolicy(start, selectedRoom.value, end) &&
            validateTimeConflict(start, end)
        );
    });
};

const minDate = computed(() => {
    const now = new Date();
    const maxTime = new Date();
    maxTime.setHours(21, 30);
    if (now > maxTime) now.setDate(now.getDate() + 1);
    now.setHours(0, 0, 0, 0);
    return now;
});
const maxDate = computed(() => {
    const time = new Date();
    time.setMonth(time.getMonth() + 1);
    time.setDate(time.getDate() - 1);
    return time;
});

const toast = useToast();
const reservationsFetchLoading = ref(false);
const fetchReservations = async (selectedRoom: FormFieldState) => {
    reservationsFetchLoading.value = true;
    reservations.value = (
        await getReservations(null, selectedRoom.value)
    ).data.reservations
        .filter(
            (reservation: Reservation) =>
                reservation.status != "rejected" &&
                new Date(reservation.startTime) >= new Date()
        )
        .sort(
            (a: Reservation, b: Reservation) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
        );
    reservationsFetchLoading.value = false;
};

const success = ref(false);
const successMessage = ref("");
const submitLoading = ref(false);
const onSubmitEvent = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: t("common.fillInAllFields"),
            life: 2000,
        });
        return;
    }
    submitLoading.value = true;
    const response = await postCreateReservation(
        form.values as any
    );
    submitLoading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("reservation.create.toast.reservationCreated"),
            life: 3000,
        });
        successMessage.value = response.message as string;
        success.value = true;
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 3000,
        });
    }
};
const terms = computed(() => tm("reservation.create.term.content") as string[]);
const onMoreConfetti = () => {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
};
const initialValues = ref({});
const termsVisible = ref(false);
</script>
<template>
    <Dialog
        :header="$t('reservation.create.term.title')"
        v-model:visible="termsVisible"
        modal
        class="sm:w-100 w-92"
    >
        <ul class="list-disc pl-5">
            <li v-for="item in terms">{{ item }}</li>
        </ul>
    </Dialog>
    <div class="flex items-center justify-center flex-col mt-24 mb-4">
        <h1 class="font-bold text-3xl my-4">
            {{ $t("reservation.create.title") }}
        </h1>
        <Card class="sm:w-100 w-92">
            <template #content>
                <Form
                    v-if="!success"
                    v-slot="$form"
                    :resolver="resolver"
                    :initialValues
                    @submit="onSubmitEvent"
                >
                    <Fieldset
                        :legend="$t('reservation.create.subtitle.personalInfo')"
                    >
                        <div class="flex flex-col gap-4">
                            <IftaLabel>
                                <InputText
                                    id="studentName"
                                    type="text"
                                    name="studentName"
                                    fluid
                                ></InputText
                                ><label for="studentName">{{
                                    $t("reservation.create.form.studentName")
                                }}</label></IftaLabel
                            >
                            <Message
                                v-if="$form.studentName?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.studentName.error?.message }}</Message
                            >
                            <IftaLabel>
                                <Select
                                    id="classId"
                                    optionGroupLabel="campus"
                                    optionGroupChildren="classes"
                                    optionLabel="name"
                                    optionValue="id"
                                    filter
                                    :options="classes"
                                    name="classId"
                                    fluid
                                >
                                    <template #optiongroup="slotProps">
                                        <div class="flex items-center">
                                            <div>
                                                {{ slotProps.option.campus }}
                                            </div>
                                        </div>
                                    </template>
                                </Select>
                                <label for="classId">{{
                                    $t("reservation.create.form.class")
                                }}</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.classId?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.classId.error?.message }}
                            </Message>
                            <IftaLabel>
                                <InputText
                                    id="studentId"
                                    type="text"
                                    name="studentId"
                                    fluid
                                ></InputText>
                                <label for="studentId">{{
                                    $t("reservation.create.form.studentId")
                                }}</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.studentId?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.studentId.error?.message }}</Message
                            >
                            <IftaLabel>
                                <InputText
                                    id="email"
                                    type="email"
                                    name="email"
                                    fluid
                                ></InputText>
                                <label for="email">{{
                                    $t("reservation.create.form.email")
                                }}</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.email?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.email.error?.message }}</Message
                            >
                        </div>
                    </Fieldset>
                    <Fieldset
                        v-if="$form.classId?.value"
                        :legend="
                            $t('reservation.create.subtitle.reservationInfo')
                        "
                    >
                        <div class="flex flex-col gap-4">
                            <IftaLabel>
                                <Select
                                    id="campus"
                                    @change="
                                        $form.room.value
                                            ? ($form.room.value = null)
                                            : undefined
                                    "
                                    :options="
                                        campusData?.data.filter(
                                            (campus: Campus) =>
                                                !campus.isPrivileged,
                                        )
                                    "
                                    name="campus"
                                    optionLabel="name"
                                    optionValue="id"
                                    fluid
                                >
                                </Select>
                                <label for="campus">{{
                                    $t("reservation.create.form.campus")
                                }}</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.campus?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.campus.error?.message }}</Message
                            >
                            <IftaLabel>
                                <Select
                                    id="room"
                                    @change="fetchReservations($form.room)"
                                    :options="
                                        room.filter(
                                            (item) =>
                                                item.campus ===
                                                $form.campus?.value
                                        ) || []
                                    "
                                    name="room"
                                    fluid
                                    optionLabel="name"
                                    optionValue="id"
                                >
                                </Select>
                                <label for="room">{{
                                    $t("reservation.create.form.room")
                                }}</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.room?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.room.error?.message }}</Message
                            >
                            <DataTable
                                v-if="$form.room && $form.room.value"
                                :value="reservations"
                                :loading="reservationsFetchLoading"
                            >
                                <template #header>
                                    <span class="font-bold">{{
                                        $t(
                                            "reservation.create.table.reservation.header"
                                        )
                                    }}</span>
                                </template>
                                <template #empty>
                                    <p>
                                        {{
                                            $t(
                                                "reservation.create.table.reservation.empty"
                                            )
                                        }}
                                    </p>
                                </template>
                                <Column
                                    :header="
                                        $t(
                                            'reservation.create.table.reservation.name'
                                        )
                                    "
                                >
                                    <template #body="slotProps">
                                        {{ slotProps.data.studentName }}
                                    </template>
                                </Column>
                                <Column
                                    :header="
                                        $t(
                                            'reservation.create.table.reservation.time'
                                        )
                                    "
                                >
                                    <template #body="slotProps">
                                        {{
                                            `${formatTableDate(
                                                slotProps.data.startTime
                                            )} / ${formatTableTime(
                                                slotProps.data.startTime,
                                                slotProps.data.endTime
                                            )}`
                                        }}
                                    </template>
                                </Column>
                            </DataTable>
                            <DataTable
                                v-if="
                                    $form.room &&
                                    $form.room.value &&
                                    $form.campus &&
                                    $form.campus.value
                                "
                                :value="getRoomPolicyData($form.room.value)"
                            >
                                <template #header>
                                    <span class="font-bold">{{
                                        $t(
                                            "reservation.create.table.policy.header"
                                        )
                                    }}</span>
                                </template>
                                <template #empty>
                                    <p>
                                        {{
                                            $t(
                                                "reservation.create.table.policy.empty"
                                            )
                                        }}
                                    </p>
                                </template>
                                <Column
                                    :header="
                                        $t(
                                            'reservation.create.table.policy.weekday'
                                        )
                                    "
                                >
                                    <template #body="slotProps">
                                        {{
                                            formatTableWeekDay(
                                                slotProps.data.days
                                            )
                                        }}
                                    </template>
                                </Column>
                                <Column
                                    :header="
                                        $t(
                                            'reservation.create.table.policy.time'
                                        )
                                    "
                                >
                                    <template #body="slotProps">
                                        {{
                                            `${String(
                                                slotProps.data.startTime[0]
                                            ).padStart(2, "0")}:${String(
                                                slotProps.data.startTime[1]
                                            ).padStart(2, "0")} - ${String(
                                                slotProps.data.endTime[0]
                                            ).padStart(2, "0")}:${String(
                                                slotProps.data.endTime[1]
                                            ).padStart(2, "0")}`
                                        }}
                                    </template>
                                </Column>
                            </DataTable>
                            <IftaLabel>
                                <DatePicker
                                    inputId="date"
                                    name="date"
                                    updateModelType="date"
                                    :manualInput="false"
                                    :minDate
                                    :maxDate
                                    fluid
                                >
                                </DatePicker>
                                <label for="date">{{
                                    $t("reservation.create.form.date")
                                }}</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.date?.invalid"
                                severity="error"
                                size="small"
                                dateFormat="yy/mm/dd"
                                >{{ $form.date.error?.message }}</Message
                            >
                            <IftaLabel v-if="$form.date?.value">
                                <Select
                                    id="startTime"
                                    @change="
                                        $form.endTime?.value
                                            ? ($form.endTime.value = null)
                                            : undefined
                                    "
                                    :options="
                                        getStartTimeOptions({
                                            date: $form.date,
                                            selectedRoom: $form.room,
                                            selectedClass: $form.classId,
                                        })
                                    "
                                    name="startTime"
                                    fluid
                                >
                                </Select>
                                <label for="startTime">{{
                                    $t("reservation.create.form.startTime")
                                }}</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.startTime?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.startTime.error?.message }}</Message
                            >
                            <IftaLabel v-if="$form.startTime?.value">
                                <Select
                                    id="endTime"
                                    :options="
                                        getEndTimeOptions({
                                            startTime: $form.startTime,
                                            date: $form.date,
                                            selectedRoom: $form.room,
                                            selectedClass: $form.classId,
                                        })
                                    "
                                    name="endTime"
                                    fluid
                                >
                                </Select>
                                <label for="endTime">{{
                                    $t("reservation.create.form.endTime")
                                }}</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.endTime?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.endTime.error?.message }}</Message
                            >
                            <IftaLabel>
                                <InputText
                                    id="reason"
                                    type="text"
                                    name="reason"
                                    fluid
                                ></InputText>
                                <label for="reason">{{
                                    $t("reservation.create.form.reason")
                                }}</label>
                                <p
                                    class="text-xs dark:text-surface-300 text-surface-500 mt-2"
                                >
                                    {{
                                        $t(
                                            "reservation.create.validation.detailedReason"
                                        )
                                    }}
                                </p>
                            </IftaLabel>
                            <Message
                                v-if="$form.reason?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.reason.error?.message }}</Message
                            >
                        </div>
                    </Fieldset>
                    <div class="flex items-center justify-center mt-3">
                        <Checkbox name="isAgreed" id="isAgreed" :binary="true" />
                        <i18n-t
                            keypath="reservation.create.form.termAgreement"
                            tag="label"
                            for="isAgreed"
                            scope="global"
                            class="ml-2 text-sm"
                        >
                            <a
                                @click="termsVisible = true"
                                class="text-sky-500 cursor-pointer"
                                >{{
                                    $t(
                                        "reservation.create.form.termAndCondition"
                                    )
                                }}</a
                            >.
                        </i18n-t>
                    </div>
                    <Message
                        v-if="$form.isAgreed?.invalid"
                        class="mt-2"
                        severity="error"
                        size="small"
                        >{{ $form.isAgreed.error.message }}</Message
                    >
                    <Button
                        type="submit"
                        fluid
                        class="mt-3"
                        :disabled="submitLoading"
                        ><PenSquare></PenSquare
                        >{{ $t("reservation.create.form.submit") }}</Button
                    >
                </Form>
                <div
                    v-else
                    class="flex justify-center flex-col gap-4 items-center"
                >
                    <Check class="text-green-500 h-80! w-25!"></Check>
                    <p class="text-center">{{ successMessage }}</p>
                    <div class="flex flex-wrap gap-2">
                        <Button
                            severity="info"
                            size="small"
                            as="RouterLink"
                            to="/"
                            ><Home></Home
                        ></Button>
                        <Button
                            severity="help"
                            size="small"
                            @click="onMoreConfetti()"
                            ><PartyPopper></PartyPopper
                        ></Button>
                        <Button
                            severity="warn"
                            size="small"
                            @click="success = false"
                            ><RotateCcw></RotateCcw>
                            {{
                                $t(
                                    "reservation.create.button.anotherReservation"
                                )
                            }}</Button
                        >
                    </div>
                    <i18n-t
                        keypath="reservation.create.form.poweredBy"
                        tag="p"
                        scope="global"
                        class="text-sm dark:text-surface-300 text-surface-500 flex items-center justify-center"
                    >
                        <svg
                            class="mx-2"
                            height="18"
                            viewBox="0 0 288 65"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M283.015 17.039C281.649 17.039 280.465 16.5673 279.464 15.6239C278.508 14.6357 278.029 13.4677 278.029 12.1201C278.029 10.7725 278.508 9.62698 279.464 8.68363C280.465 7.74029 281.649 7.26862 283.015 7.26862C284.381 7.26862 285.542 7.74029 286.498 8.68363C287.499 9.62698 288 10.7725 288 12.1201C288 13.4677 287.499 14.6357 286.498 15.6239C285.542 16.5673 284.381 17.039 283.015 17.039ZM279.327 56.4572V22.0926H286.702V56.4572H279.327Z"
                                fill="currentColor"
                            ></path>
                            <path
                                d="M242.922 56.4572V22.0926H249.888V26.8093H250.298C251.299 25.1472 252.779 23.7771 254.737 22.699C256.74 21.576 258.925 21.0145 261.293 21.0145C265.572 21.0145 268.782 22.2723 270.922 24.7878C273.062 27.3034 274.132 30.6276 274.132 34.7603V56.4572H266.824V35.7037C266.824 32.9186 266.119 30.8971 264.707 29.6393C263.296 28.3366 261.452 27.6853 259.176 27.6853C257.4 27.6853 255.852 28.1794 254.532 29.1677C253.212 30.111 252.164 31.3688 251.39 32.941C250.662 34.5133 250.298 36.1978 250.298 37.9946V56.4572H242.922Z"
                                fill="currentColor"
                            ></path>
                            <path
                                d="M233.84 17.039C232.474 17.039 231.29 16.5673 230.288 15.6239C229.332 14.6357 228.854 13.4677 228.854 12.1201C228.854 10.7725 229.332 9.62698 230.288 8.68363C231.29 7.74029 232.474 7.26862 233.84 7.26862C235.205 7.26862 236.366 7.74029 237.322 8.68363C238.324 9.62698 238.825 10.7725 238.825 12.1201C238.825 13.4677 238.324 14.6357 237.322 15.6239C236.366 16.5673 235.205 17.039 233.84 17.039ZM230.152 56.4572V22.0926H237.527V56.4572H230.152Z"
                                fill="currentColor"
                            ></path>
                            <path
                                d="M172.473 56.4572V22.0926H179.439V26.8093H179.848C180.85 25.1472 182.307 23.7771 184.219 22.699C186.131 21.576 188.248 21.0145 190.57 21.0145C193.165 21.0145 195.373 21.6209 197.194 22.8338C199.015 24.0466 200.313 25.574 201.087 27.4157C202.225 25.6189 203.773 24.114 205.731 22.9012C207.688 21.6434 210.079 21.0145 212.901 21.0145C216.999 21.0145 220.049 22.2498 222.052 24.7205C224.056 27.1462 225.057 30.3805 225.057 34.4234V56.4572H217.75V35.6363C217.75 32.8961 217.135 30.8971 215.906 29.6393C214.722 28.3366 213.061 27.6853 210.921 27.6853C209.236 27.6853 207.757 28.1569 206.482 29.1003C205.207 29.9987 204.206 31.234 203.477 32.8063C202.794 34.3785 202.453 36.1304 202.453 38.062V56.4572H195.146V35.6363C195.146 32.8961 194.531 30.8971 193.302 29.6393C192.072 28.3366 190.342 27.6853 188.112 27.6853C186.473 27.6853 185.038 28.1569 183.809 29.1003C182.58 30.0436 181.601 31.3014 180.873 32.8736C180.19 34.4459 179.848 36.1978 179.848 38.1294V56.4572H172.473Z"
                                fill="currentColor"
                            ></path>
                            <path
                                d="M151.836 57.5353C148.421 57.5353 145.371 56.7492 142.684 55.177C139.998 53.6047 137.881 51.4485 136.333 48.7083C134.831 45.9681 134.08 42.8461 134.08 39.3423C134.08 36.063 134.808 33.0309 136.265 30.2458C137.722 27.4606 139.748 25.2371 142.343 23.575C144.984 21.868 148.011 21.0145 151.426 21.0145C155.022 21.0145 158.073 21.7781 160.577 23.3054C163.126 24.8328 165.061 26.9216 166.382 29.5719C167.702 32.2223 168.362 35.2095 168.362 38.5337C168.362 39.0278 168.339 39.477 168.294 39.8813C168.294 40.2856 168.271 40.6001 168.225 40.8247H141.319C141.683 44.2387 142.889 46.7992 144.938 48.5062C147.032 50.2132 149.4 51.0667 152.04 51.0667C154.408 51.0667 156.366 50.5501 157.913 49.5169C159.461 48.4388 160.691 47.1136 161.601 45.5414L167.679 48.4388C166.177 51.1341 164.128 53.3352 161.533 55.0422C158.938 56.7043 155.705 57.5353 151.836 57.5353ZM151.494 27.2136C149.036 27.2136 146.941 27.9548 145.211 29.4372C143.481 30.9196 142.32 32.8961 141.728 35.3668H161.055C160.964 34.1988 160.577 32.9859 159.894 31.7282C159.211 30.4704 158.164 29.4147 156.753 28.5612C155.387 27.6628 153.634 27.2136 151.494 27.2136Z"
                                fill="currentColor"
                            ></path>
                            <path
                                d="M106.73 57.5353C103.224 57.5353 99.9233 56.9064 96.8274 55.6486C93.777 54.3909 91.0681 52.6389 88.7007 50.3929C86.3333 48.1019 84.4666 45.4291 83.1008 42.3745C81.7805 39.2749 81.1204 35.9283 81.1204 32.3346C81.1204 28.7409 81.7805 25.4167 83.1008 22.3621C84.4666 19.2625 86.3105 16.5897 88.6324 14.3437C90.9998 12.0527 93.7315 10.2783 96.8274 9.02054C99.9233 7.76275 103.224 7.13385 106.73 7.13385C110.463 7.13385 113.9 7.78521 117.042 9.08792C120.229 10.3906 122.892 12.2099 125.032 14.5458L119.842 19.5995C118.248 17.8475 116.336 16.4999 114.105 15.5566C111.92 14.6132 109.461 14.1415 106.73 14.1415C103.497 14.1415 100.515 14.9052 97.7835 16.4325C95.0518 17.9149 92.8437 20.0262 91.1592 22.7664C89.5202 25.4617 88.7007 28.6511 88.7007 32.3346C88.7007 36.0181 89.543 39.23 91.2275 41.9702C92.912 44.6654 95.1201 46.7767 97.8517 48.304C100.583 49.7864 103.565 50.5276 106.798 50.5276C109.757 50.5276 112.443 49.9886 114.856 48.9105C117.269 47.7874 119.204 46.2152 120.661 44.1938C122.163 42.1723 123.074 39.7466 123.393 36.9165H106.661V30.3805H130.427C130.7 31.5934 130.836 32.8736 130.836 34.2213V34.2887C130.836 38.9605 129.789 43.0483 127.695 46.5521C125.646 50.011 122.801 52.7063 119.159 54.6379C115.516 56.5695 111.373 57.5353 106.73 57.5353Z"
                                fill="currentColor"
                            ></path>
                            <path
                                d="M57.8647 29.0109C52.865 26.8587 48.4905 23.9061 44.7393 20.1567C40.99 16.4074 38.0373 12.031 35.8851 7.03132C35.0589 5.11516 34.395 3.14552 33.886 1.12608C33.72 0.465846 33.128 0.00109863 32.4475 0.00109863C31.7669 0.00109863 31.1749 0.465846 31.009 1.12608C30.4999 3.14552 29.836 5.11332 29.0098 7.03132C26.8576 12.031 23.905 16.4074 20.1556 20.1567C16.4063 23.9061 12.0299 26.8587 7.03022 29.0109C5.11406 29.8371 3.14442 30.501 1.12498 31.0101C0.464747 31.176 0 31.768 0 32.4486C0 33.1291 0.464747 33.7211 1.12498 33.8871C3.14442 34.3961 5.11222 35.06 7.03022 35.8862C12.0299 38.0384 16.4045 40.9911 20.1556 44.7404C23.9068 48.4897 26.8576 52.8661 29.0098 57.8658C29.836 59.782 30.4999 61.7516 31.009 63.771C31.1749 64.4313 31.7669 64.896 32.4475 64.896C33.128 64.896 33.72 64.4313 33.886 63.771C34.395 61.7516 35.0589 59.7838 35.8851 57.8658C38.0373 52.8661 40.99 48.4916 44.7393 44.7404C48.4886 40.9911 52.865 38.0384 57.8647 35.8862C59.7809 35.06 61.7505 34.3961 63.7699 33.8871C64.4302 33.7211 64.8949 33.1291 64.8949 32.4486C64.8949 31.768 64.4302 31.176 63.7699 31.0101C61.7505 30.501 59.7827 29.8371 57.8647 29.0109Z"
                                fill="white"
                            ></path>
                            <mask
                                id="mask0_10859_4895"
                                style="mask-type: alpha"
                                maskUnits="userSpaceOnUse"
                                x="0"
                                y="0"
                                width="65"
                                height="65"
                            >
                                <path
                                    d="M32.4473 0C33.1278 0 33.7197 0.464783 33.8857 1.125C34.3947 3.14441 35.0586 5.11414 35.8848 7.03027C38.0369 12.0299 40.99 16.406 44.7393 20.1553C48.4903 23.9045 52.8647 26.8576 57.8643 29.0098C59.7821 29.8359 61.7502 30.4998 63.7695 31.0088C64.4297 31.1748 64.8944 31.7668 64.8945 32.4473C64.8945 33.1278 64.4298 33.7198 63.7695 33.8857C61.7502 34.3947 59.7803 35.0586 57.8643 35.8848C52.8646 38.037 48.4885 40.99 44.7393 44.7393C40.99 48.4904 38.037 52.8646 35.8848 57.8643C35.0586 59.7822 34.3947 61.7502 33.8857 63.7695C33.7198 64.4298 33.1278 64.8945 32.4473 64.8945C31.7668 64.8944 31.1748 64.4297 31.0088 63.7695C30.4998 61.7502 29.8359 59.7803 29.0098 57.8643C26.8576 52.8647 23.9063 48.4885 20.1553 44.7393C16.4041 40.99 12.0299 38.0369 7.03027 35.8848C5.1123 35.0586 3.14441 34.3947 1.125 33.8857C0.464783 33.7197 0 33.1278 0 32.4473C8.67651e-05 31.7668 0.464826 31.1748 1.125 31.0088C3.14442 30.4998 5.11413 29.836 7.03027 29.0098C12.03 26.8575 16.406 23.9046 20.1553 20.1553C23.9046 16.406 26.8575 12.03 29.0098 7.03027C29.836 5.11229 30.4998 3.14442 31.0088 1.125C31.1748 0.464826 31.7668 8.67651e-05 32.4473 0Z"
                                    fill="black"
                                ></path>
                                <path
                                    d="M32.4473 0C33.1278 0 33.7197 0.464783 33.8857 1.125C34.3947 3.14441 35.0586 5.11414 35.8848 7.03027C38.0369 12.0299 40.99 16.406 44.7393 20.1553C48.4903 23.9045 52.8647 26.8576 57.8643 29.0098C59.7821 29.8359 61.7502 30.4998 63.7695 31.0088C64.4297 31.1748 64.8944 31.7668 64.8945 32.4473C64.8945 33.1278 64.4298 33.7198 63.7695 33.8857C61.7502 34.3947 59.7803 35.0586 57.8643 35.8848C52.8646 38.037 48.4885 40.99 44.7393 44.7393C40.99 48.4904 38.037 52.8646 35.8848 57.8643C35.0586 59.7822 34.3947 61.7502 33.8857 63.7695C33.7198 64.4298 33.1278 64.8945 32.4473 64.8945C31.7668 64.8944 31.1748 64.4297 31.0088 63.7695C30.4998 61.7502 29.8359 59.7803 29.0098 57.8643C26.8576 52.8647 23.9063 48.4885 20.1553 44.7393C16.4041 40.99 12.0299 38.0369 7.03027 35.8848C5.1123 35.0586 3.14441 34.3947 1.125 33.8857C0.464783 33.7197 0 33.1278 0 32.4473C8.67651e-05 31.7668 0.464826 31.1748 1.125 31.0088C3.14442 30.4998 5.11413 29.836 7.03027 29.0098C12.03 26.8575 16.406 23.9046 20.1553 20.1553C23.9046 16.406 26.8575 12.03 29.0098 7.03027C29.836 5.11229 30.4998 3.14442 31.0088 1.125C31.1748 0.464826 31.7668 8.67651e-05 32.4473 0Z"
                                    fill="url(#paint0_linear_10859_4895)"
                                ></path>
                            </mask>
                            <g mask="url(#mask0_10859_4895)">
                                <g filter="url(#filter0_f_10859_4895)">
                                    <ellipse
                                        cx="14.4072"
                                        cy="16.9504"
                                        rx="14.4072"
                                        ry="16.9504"
                                        transform="matrix(0.942341 0.334654 -0.334652 0.942342 -8.09058 13.9664)"
                                        fill="#FFE432"
                                    ></ellipse>
                                </g>
                                <g filter="url(#filter1_f_10859_4895)">
                                    <ellipse
                                        cx="27.4329"
                                        cy="2.5869"
                                        rx="18.6516"
                                        ry="19.0617"
                                        fill="#FC413D"
                                    ></ellipse>
                                </g>
                                <g filter="url(#filter2_f_10859_4895)">
                                    <ellipse
                                        cx="18.9512"
                                        cy="57.3856"
                                        rx="19.4934"
                                        ry="25.2529"
                                        transform="rotate(-2.79865 18.9512 57.3856)"
                                        fill="#00B95C"
                                    ></ellipse>
                                </g>
                                <g filter="url(#filter3_f_10859_4895)">
                                    <ellipse
                                        cx="18.9512"
                                        cy="57.3856"
                                        rx="19.4934"
                                        ry="25.2529"
                                        transform="rotate(-2.79865 18.9512 57.3856)"
                                        fill="#00B95C"
                                    ></ellipse>
                                </g>
                                <g filter="url(#filter4_f_10859_4895)">
                                    <ellipse
                                        cx="20.0204"
                                        cy="56.2114"
                                        rx="19.1065"
                                        ry="21.0345"
                                        transform="rotate(-31.3178 20.0204 56.2114)"
                                        fill="#00B95C"
                                    ></ellipse>
                                </g>
                                <g filter="url(#filter5_f_10859_4895)">
                                    <ellipse
                                        cx="67.391"
                                        cy="25.3267"
                                        rx="18.3463"
                                        ry="17.6668"
                                        fill="#3186FF"
                                    ></ellipse>
                                </g>
                                <g filter="url(#filter6_f_10859_4895)">
                                    <ellipse
                                        cx="21.222"
                                        cy="22.3842"
                                        rx="21.222"
                                        ry="22.3842"
                                        transform="matrix(0.795985 0.605316 -0.605314 0.795987 -2.85815 -7.53723)"
                                        fill="#FBBC04"
                                    ></ellipse>
                                </g>
                                <g filter="url(#filter7_f_10859_4895)">
                                    <ellipse
                                        cx="24.4687"
                                        cy="22.6039"
                                        rx="24.4687"
                                        ry="22.6039"
                                        transform="matrix(0.824033 0.566542 -0.566539 0.824035 40.1882 0.315002)"
                                        fill="#3186FF"
                                    ></ellipse>
                                </g>
                                <g filter="url(#filter8_f_10859_4895)">
                                    <path
                                        d="M54.9838 -2.33625C57.8168 1.51558 54.1765 9.00477 46.8529 14.3913C39.5293 19.7779 31.2957 21.022 28.4627 17.1702C25.6296 13.3184 29.27 5.82919 36.5935 0.442635C43.9171 -4.94392 52.1507 -6.18807 54.9838 -2.33625Z"
                                        fill="#749BFF"
                                    ></path>
                                </g>
                                <g filter="url(#filter9_f_10859_4895)">
                                    <ellipse
                                        cx="19.9023"
                                        cy="3.35597"
                                        rx="27.9712"
                                        ry="17.3877"
                                        transform="rotate(-42.848 19.9023 3.35597)"
                                        fill="#FC413D"
                                    ></ellipse>
                                </g>
                                <g filter="url(#filter10_f_10859_4895)">
                                    <ellipse
                                        cx="13.5831"
                                        cy="46.7501"
                                        rx="14.9887"
                                        ry="8.71667"
                                        transform="rotate(35.592 13.5831 46.7501)"
                                        fill="#FFEE48"
                                    ></ellipse>
                                </g>
                            </g>
                            <defs>
                                <filter
                                    id="filter0_f_10859_4895"
                                    x="-19.8236"
                                    y="13.1523"
                                    width="39.2739"
                                    height="43.2171"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="2.45965"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <filter
                                    id="filter1_f_10859_4895"
                                    x="-15.001"
                                    y="-40.257"
                                    width="84.8677"
                                    height="85.6878"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="11.8911"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <filter
                                    id="filter2_f_10859_4895"
                                    x="-20.7758"
                                    y="11.9273"
                                    width="79.454"
                                    height="90.9166"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="10.1086"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <filter
                                    id="filter3_f_10859_4895"
                                    x="-20.7758"
                                    y="11.9273"
                                    width="79.454"
                                    height="90.9166"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="10.1086"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <filter
                                    id="filter4_f_10859_4895"
                                    x="-19.8449"
                                    y="15.459"
                                    width="79.7306"
                                    height="81.5048"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="10.1086"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <filter
                                    id="filter5_f_10859_4895"
                                    x="29.8324"
                                    y="-11.5524"
                                    width="75.1172"
                                    height="73.7582"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="9.60613"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <filter
                                    id="filter6_f_10859_4895"
                                    x="-38.5827"
                                    y="-16.2526"
                                    width="78.1352"
                                    height="78.7578"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="8.70591"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <filter
                                    id="filter7_f_10859_4895"
                                    x="8.1068"
                                    y="-5.96578"
                                    width="78.877"
                                    height="77.5394"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="7.77473"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <filter
                                    id="filter8_f_10859_4895"
                                    x="13.5873"
                                    y="-18.4881"
                                    width="56.2718"
                                    height="51.8102"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="6.95694"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <filter
                                    id="filter9_f_10859_4895"
                                    x="-15.5259"
                                    y="-31.297"
                                    width="70.8565"
                                    height="69.3059"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="5.87598"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <filter
                                    id="filter10_f_10859_4895"
                                    x="-14.1676"
                                    y="20.9644"
                                    width="55.5015"
                                    height="51.5714"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood
                                        flood-opacity="0"
                                        result="BackgroundImageFix"
                                    ></feFlood>
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                    ></feBlend>
                                    <feGaussianBlur
                                        stdDeviation="7.27253"
                                        result="effect1_foregroundBlur_10859_4895"
                                    ></feGaussianBlur>
                                </filter>
                                <linearGradient
                                    id="paint0_linear_10859_4895"
                                    x1="18.4474"
                                    y1="43.4202"
                                    x2="52.1528"
                                    y2="15.0035"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#4893FC"></stop>
                                    <stop
                                        offset="0.27"
                                        stop-color="#4893FC"
                                    ></stop>
                                    <stop
                                        offset="0.776981"
                                        stop-color="#969DFF"
                                    ></stop>
                                    <stop
                                        offset="1"
                                        stop-color="#BD99FE"
                                    ></stop>
                                </linearGradient>
                            </defs>
                        </svg>
                    </i18n-t>
                </div>
            </template>
        </Card>
        <div class="w-full md:w-140 mt-8 mb-4">
            <h3 class="font-bold text-lg mb-4">Featured Advertisements</h3>
            <AdCarousel :count="2" />
        </div>
    </div>
</template>
