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
import VueTurnstile from "vue-turnstile";

const turnstileSiteKey = process.env.CLOUDFLARE_KEY || "";
const resolver = zodResolver(
    z.object({
        classId: z.number({ error: "Class is required." }),
        studentName: z
            .string({ error: "Student name is required." })
            .min(1, { error: "Student name is required." }),
        room: z.number({ error: "Room is required." }),
        studentId: z
            .string({ error: "Student ID is required." })
            .min(10, {
                error: "Student ID must be at least 10 characters long (e.g. GJ12345678).",
            })
            .startsWith("GJ", { error: "Student ID must start with 'GJ'." }),
        email: z
            .email({ error: "Wrong E-mail format." })
            .min(1, { error: "E-mail is required." }),
        date: z.date({ error: "Date is required." }),
        startTime: z
            .string({ error: "Start time is required." })
            .min(1, { error: "Start time is required." }),
        endTime: z
            .string({ error: "End time is required." })
            .min(1, { error: "End time is required." }),
        reason: z
            .string({ error: "Reason is required." })
            .min(1, { error: "Reason is required." }),
        campus: z.number({ error: "Campus is required." }),
        isAgreed: z
            .boolean({ error: "Please fill out this field." })
            .refine((val) => val === true, {
                message: "You must agree to the terms and conditions.",
            }),
    }),
);

const { data: classData } = useRequest(getClasses);
const { data: campus } = useRequest(getCampuses);
const { data: roomData } = useRequest(getRooms);
const room = computed(
    () => roomData.value?.data.filter((room) => room.enabled) || [],
);
const classes = computed(() => {
    const _data = classData.value?.data;
    if (!_data) return [];
    const res: { campus: string; classes: any[] }[] = [];
    campus.value?.data.some((c: Campus) => {
        const campusClasses = _data.filter(
            (item: Class) => item.campus === c.id,
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
        date.getMinutes(),
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
        "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatTableWeekDay = (days: number[]) => {
    const daysMapping = [
        "Mon.",
        "Tue.",
        "Wed.",
        "Thu.",
        "Fri.",
        "Sat.",
        "Sun.",
    ];
    return days.map((item) => daysMapping[item]).join(" ");
};

const formatTableTime = (startTime: string, endTime: string) => {
    return `${formatTime(new Date(startTime))} - ${formatTime(
        new Date(endTime),
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

    const _class = classData.value?.data.find(
        (item: Class) => item.id === selectedClass,
    );
    const _campus: Campus = campus.value?.data.find(
        (item: Campus) => item.id === _class?.campus,
    );
    const res = options.filter((item) => {
        if (!date || !room || _campus.isPrivileged) return true;
        const time = new Date(`${formatDate(date)}T${item}`);
        return validatePolicy(time, room) && validateTimeConflict(time);
    });
    return res;
};

const validateTimeConflict = (time: Date): boolean => {
    return !reservations.value.some((reservation) => {
        const startDate = new Date(reservation.startTime);
        const endDate = new Date(reservation.endTime);
        return endDate >= time && startDate <= time;
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

const validatePolicy = (time: Date, selectedRoom: number): boolean => {
    if (!room.value) return true;
    const selectedRoomPolicy: RoomPolicy[] =
        room.value
            .find((room) => room.id == selectedRoom)
            ?.policies.filter((policy) => policy.enabled) || [];
    if (selectedRoomPolicy.length === 0) return true;
    return !selectedRoomPolicy.some((rule) => {
        const days = rule.days;
        const day = time.getDay();
        if (days.includes(day)) {
            const [startHour, startMinute] = rule.startTime;
            const [endHour, endMinute] = rule.endTime;
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
        selectedClass.value,
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
    return generateTimeOptions(
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
    );
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
                new Date(reservation.startTime) >= new Date(),
        )
        .sort(
            (a: Reservation, b: Reservation) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime(),
        );
    reservationsFetchLoading.value = false;
};

const success = ref(false);
const successMessage = ref("");
const submitLoading = ref(false);
const turnstileToken = ref("");
const turnstileRef = ref();
const onSubmitEvent = async (form: FormSubmitEvent) => {
    if (turnstileToken.value == "") return;
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill in all required fields.",
            life: 2000,
        });
        return;
    }
    form.values.turnstileToken = turnstileToken.value;
    submitLoading.value = true;
    const response = await postCreateReservation(
        form.values as ReservationRequestInfo,
    );
    submitLoading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Reservation Created",
            detail: "Your reservation has been created successfully.",
            life: 3000,
        });
        successMessage.value = response.message as string;
        success.value = true;
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message,
            life: 3000,
        });
        turnstileRef.value?.reset();
        turnstileToken.value = "";
    }
};
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
        header="Classroom Regulations"
        v-model:visible="termsVisible"
        modal
        class="sm:w-[25rem] w-[23rem]"
    >
        <ul class="list-disc pl-5">
            <li>
                Do not bring food and drinks into the study area. Students are
                responsible for keeping the study room clean and tidy.
            </li>
            <li>
                Students should take good care of their personal belongings
                (such as wallets, phones, and computers). Valuable items should
                be carried or locked in a secure place. When leaving the
                classroom, students should take their valuable items with them,
                as the school does not assume any responsibility for their
                safekeeping.
            </li>
            <li>
                After leaving public areas, students should take their personal
                belongings with them. The administrative office will
                periodically clean the area, and the school will not be
                responsible for any lost items.
            </li>
            <li>
                Students should consciously maintain the cleanliness of the
                classroom and public order.
            </li>
            <li>
                Please take care of and use the teaching equipment responsibly.
                If any problems or losses are discovered, contact the
                administrative office as soon as possible. If a student causes
                equipment loss or maliciously damages the equipment, the student
                will be responsible for compensation.
            </li>
            <li>
                When students leave the classroom, they should ensure that all
                electrical equipment (such as air conditioners, fans, and
                lights) is turned off, and the remote control is returned to the
                designated location.
            </li>
            <li>
                Students are not allowed to move teaching equipment without
                permission.
            </li>
            <li>
                Do not reserve seats in any way. If students need to leave their
                seats, they should take their personal belongings with them, or
                place their books in their bags and put them under the desk
                without affecting other students' use of the seat. The duty
                teacher will periodically inspect the area, and any reserved
                items found will be removed or taken away to make the seat
                available for others.
            </li>
            <li>
                Be mindful of public decency and personal image, and do not lie
                down on benches or sofas.
            </li>
            <li>
                Do not speak loudly in public places, and set your phone to
                silent mode. Please go outside to make phone calls.
            </li>
            <li>
                It is forbidden to pull power sources privately or use
                high-powered electrical appliances. Do not move fire safety
                equipment without permission.
            </li>
            <li>
                At any time, the study area must not be used for
                non-study-related activities (including but not limited to video
                games on phones/computers, board games, watching variety shows
                or movies, etc.). Violation of these rules will be handled
                according to the "Student Violation Management Regulations"
                based on the actual situation.
            </li>
        </ul>
    </Dialog>
    <div class="flex items-center justify-center flex-col mt-[6rem] mb-4">
        <h1 class="font-bold text-3xl my-4">New Reservation</h1>
        <Card class="sm:w-[25rem] w-[23rem]">
            <template #content>
                <Form
                    v-if="!success"
                    v-slot="$form"
                    :resolver
                    :initialValues
                    @submit="onSubmitEvent"
                >
                    <Fieldset legend="Personal Information">
                        <div class="flex flex-col gap-4">
                            <IftaLabel
                                ><label>Name</label>
                                <InputText
                                    type="text"
                                    name="studentName"
                                    fluid
                                ></InputText
                            ></IftaLabel>
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
                                <label>Class</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.class?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.class.error?.message }}
                            </Message>
                            <IftaLabel>
                                <InputText
                                    type="text"
                                    name="studentId"
                                    fluid
                                ></InputText>
                                <label>Student ID</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.studentId?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.studentId.error?.message }}
                            </Message>
                            <IftaLabel>
                                <InputText
                                    type="text"
                                    name="email"
                                    fluid
                                ></InputText>
                                <label>E-mail</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.email?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.email.error?.message }}
                            </Message>
                        </div>
                    </Fieldset>
                    <Fieldset legend="Room Information">
                        <div class="flex flex-col gap-4">
                            <IftaLabel>
                                <Select
                                    @change="
                                        $form.room.value
                                            ? ($form.room.value = null)
                                            : undefined
                                    "
                                    :options="
                                        campus?.data.filter(
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
                                <label>Campus</label>
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
                                                $form.campus.value,
                                        ) || []
                                    "
                                    name="room"
                                    fluid
                                    optionLabel="name"
                                    optionValue="id"
                                >
                                    <template #empty>
                                        <p
                                            v-if="!$form.campus.value"
                                            class="w-[18rem]"
                                        >
                                            No available options. Please fill in
                                            the below field.
                                        </p>
                                        <p v-else>No available options.</p>
                                    </template>
                                </Select>
                                <label>Room</label>
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
                                        >Reservation Info</span
                                    >
                                </template>
                                <template #empty>
                                    <p>No available reservation.</p>
                                </template>
                                <Column header="Name">
                                    <template #body="slotProps">
                                        {{ slotProps.data.studentName }}
                                    </template>
                                </Column>
                                <Column header="Date / Time">
                                    <template #body="slotProps">
                                        {{
                                            `${formatTableDate(
                                                slotProps.data.startTime,
                                            )} / ${formatTableTime(
                                                slotProps.data.startTime,
                                                slotProps.data.endTime,
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
                                        >Disabled Times</span
                                    >
                                </template>
                                <template #empty>
                                    <p>No policy available for this room.</p>
                                </template>
                                <Column header="Weekdays">
                                    <template #body="slotProps">
                                        {{
                                            formatTableWeekDay(
                                                slotProps.data.days,
                                            )
                                        }}
                                    </template>
                                </Column>
                                <Column header="Time">
                                    <template #body="slotProps">
                                        {{
                                            `${String(
                                                slotProps.data.startTime[0],
                                            ).padStart(2, "0")}:${String(
                                                slotProps.data.startTime[1],
                                            ).padStart(2, "0")} - ${String(
                                                slotProps.data.endTime[0],
                                            ).padStart(2, "0")}:${String(
                                                slotProps.data.endTime[1],
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
                                <label>Date</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.date?.invalid"
                                severity="error"
                                size="small"
                                dateFormat="yy/mm/dd"
                                >{{ $form.date.error?.message }}</Message
                            >
                            <IftaLabel>
                                <Select
                                    @change="
                                        $form.endTime.value
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
                                    <template #empty>
                                        <p
                                            v-if="
                                                !$form.campus.value ||
                                                !$form.room.value ||
                                                !$form.classId.value ||
                                                !$form.date.value
                                            "
                                            class="w-[18rem]"
                                        >
                                            No available options. Please fill in
                                            the below field.
                                        </p>
                                        <p v-else>No available options.</p>
                                    </template>
                                </Select>
                                <label>Start Time</label>
                            </IftaLabel>
                            <Message
                                v-if="$form.startTime?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.startTime.error?.message }}</Message
                            >
                            <IftaLabel>
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
                                    <template #empty>
                                        <p
                                            v-if="!$form.startTime.value"
                                            class="w-[18rem]"
                                        >
                                            No available options. Please fill in
                                            the below field.
                                        </p>
                                        <p v-else>No available options.</p>
                                    </template>
                                </Select>
                                <label>End Time</label>
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
                                <label>Reason</label>
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
                        <label class="ml-2 text-sm">
                            I agree to the
                            <a
                                @click="termsVisible = true"
                                class="text-sky-500 cursor-pointer"
                                >Classroom Regulations</a
                            >.
                        </label>
                    </div>
                    <Message
                        v-if="$form.isAgreed?.invalid"
                        class="mt-2"
                        severity="error"
                        size="small"
                        >{{ $form.isAgreed.error.message }}</Message
                    >
                    <p class="text-center text-sm mt-3">
                        Let us know you're human
                    </p>
                    <VueTurnstile
                        v-model="turnstileToken"
                        :siteKey="turnstileSiteKey"
                        ref="turnstileRef"
                        class="flex justify-center mt-2"
                    ></VueTurnstile>
                    <Button
                        type="submit"
                        fluid
                        class="mt-3"
                        :disabled="!turnstileToken || submitLoading"
                        ><PenSquare></PenSquare>Submit</Button
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
                            ><RotateCcw></RotateCcw> Create another
                            reservation</Button
                        >
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
