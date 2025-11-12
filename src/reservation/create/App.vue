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
    type ReservationRequestInfo,
    getReservations,
    type Reservation,
    postCreateReservation,
    type Class,
    type Campus,
    type RoomPolicy,
} from "../../api";
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
import Navbar from "../../components/Navbar.vue";
import LoadingMask from "../../components/LoadingMask.vue";
import { useI18n } from "vue-i18n";

const { t, tm } = useI18n();
const resolver = computed(() =>
    zodResolver(
        z.object({
            classId: z.number({
                error: t("reservation.create.validation.classRequired"),
            }),
            studentName: z
                .string({ error: t("reservation.create.validation.studentNameRequired") })
                .min(1, {
                    message: t("reservation.create.validation.studentNameRequired"),
                }),
            room: z.number({ error: t("reservation.create.validation.roomRequired") }),
            studentId: z
                .string({
                    error: t("reservation.create.validation.studentId.required"),
                })
                .startsWith("GJ", {
                    message: t("reservation.create.validation.studentId.prefix"),
                })
                .min(10, {
                    message: t(
                        "reservation.create.validation.studentId.minLength"
                    ),
                })
                .refine((val) => /^\d{8}$/.test(val.slice(-8)), {
                    message: t("reservation.create.validation.studentId.digits"),
                }),
            email: z
                .email({
                    message: t("reservation.create.validation.email.format"),
                })
                .min(1, {
                    message: t("reservation.create.validation.email.required"),
                }),
            date: z.date({ error: t("reservation.create.validation.dateRequired") }),
            startTime: z
                .string({ error: t("reservation.create.validation.startTimeRequired") })
                .min(1, {
                    message: t("reservation.create.validation.startTimeRequired"),
                }),
            endTime: z
                .string({ error: t("reservation.create.validation.endTimeRequired") })
                .min(1, { message: t("reservation.create.validation.endTimeRequired") }),
            reason: z
                .string({ error: t("reservation.create.validation.reasonRequired") })
                .min(1, { message: t("reservation.create.validation.reasonRequired") }),
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
    const daysMapping = tm("reservation.create.weekday") as string[];
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
    const _campus: Campus = campusData.value?.data.find(
        (item: Campus) => item.id === _class?.campus
    );
    const res = options.filter((item) => {
        if (!date || !room || _campus.isPrivileged) return true;
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
        return existingEnd > startTime && existingStart < startTime;
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
        form.values as ReservationRequestInfo
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
const terms = computed(
    () => tm("reservation.create.term.content") as string[]
);
const onMoreConfetti = () => {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
};
const initialValues = ref<ReservationRequestInfo>({} as ReservationRequestInfo);
const termsVisible = ref(false);
</script>
<template>
    <Toast></Toast>
    <Navbar></Navbar>
    <LoadingMask></LoadingMask>
    <Dialog
        :header="$t('reservation.create.term.title')"
        v-model:visible="termsVisible"
        modal
        class="sm:w-[25rem] w-[23rem]"
    >
        <ul class="list-disc pl-5">
            <li v-for="item in terms">{{ item }}</li>
        </ul>
    </Dialog>
    <div class="flex items-center justify-center flex-col mt-[6rem] mb-4">
        <h1 class="font-bold text-3xl my-4">
            {{ $t("reservation.create.title") }}
        </h1>
        <Card class="sm:w-[25rem] w-[23rem]">
            <template #content>
                <Form
                    v-if="!success"
                    v-slot="$form"
                    :resolver="resolver"
                    :initialValues
                    @submit="onSubmitEvent"
                >
                    <Fieldset :legend="$t('reservation.create.subtitle.personalInfo')">
                        <div class="flex flex-col gap-4">
                            <IftaLabel>
                                <InputText
                                    type="text"
                                    name="studentName"
                                    fluid
                                ></InputText
                                ><label>{{
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
                                <label>{{
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
                                    type="text"
                                    name="studentId"
                                    fluid
                                ></InputText>
                                <label>{{
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
                                    type="text"
                                    name="email"
                                    fluid
                                ></InputText>
                                <label>{{
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
                    <Fieldset v-if="$form.studentName?.value && $form.classId?.value && $form.studentId?.value && $form.email?.value" :legend="$t('reservation.create.subtitle.reservationInfo')">
                        <div class="flex flex-col gap-4">
                            <IftaLabel>
                                <Select
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
                                <label>{{
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
                                <label>{{
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
                                    <span class="font-bold"
                                        >{{ $t("reservation.create.table.reservation.header") }}</span
                                    >
                                </template>
                                <template #empty>
                                    <p>{{ $t("reservation.create.table.reservation.empty") }}</p>
                                </template>
                                <Column :header="$t('reservation.create.table.reservation.name')">
                                    <template #body="slotProps">
                                        {{ slotProps.data.studentName }}
                                    </template>
                                </Column>
                                <Column :header="$t('reservation.create.table.reservation.time')">
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
                                    <span class="font-bold"
                                        >{{ $t("reservation.create.table.policy.header") }}</span
                                    >
                                </template>
                                <template #empty>
                                    <p>{{ $t("reservation.create.table.policy.empty") }}</p>
                                </template>
                                <Column :header="$t('reservation.create.table.policy.weekday')">
                                    <template #body="slotProps">
                                        {{
                                            formatTableWeekDay(
                                                slotProps.data.days
                                            )
                                        }}
                                    </template>
                                </Column>
                                <Column :header="$t('reservation.create.table.policy.time')">
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
                                    name="date"
                                    updateModelType="date"
                                    :manualInput="false"
                                    :minDate
                                    :maxDate
                                    fluid
                                >
                                </DatePicker>
                                <label>{{
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
                                <label>{{
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
                                <label>{{
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
                                    type="text"
                                    name="reason"
                                    fluid
                                ></InputText>
                                <label>{{
                                    $t("reservation.create.form.reason")
                                }}</label>
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
                        <Checkbox name="isAgreed" :binary="true" />
                        <i18n-t keypath="reservation.create.form.termAgreement" tag="label" scope="global" class="ml-2 text-sm">
                            <a
                                @click="termsVisible = true"
                                class="text-sky-500 cursor-pointer"
                                >{{ $t('reservation.create.form.termAndCondition') }}</a
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
                    <Check class="text-green-500 !h-80 !w-25"></Check>
                    <p class="text-center">{{ successMessage }}</p>
                    <div class="flex flex-wrap gap-2">
                        <Button severity="info" size="small" as="a" href="/"
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
                            as="a"
                            href="/reservation/create/"
                            ><RotateCcw></RotateCcw> {{ $t("reservation.create.button.anotherReservation") }}</Button
                        >
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
