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
    postFetchReservations,
    type Reservation,
    postCreateReservation,
    type Class,
    type Campus,
    getPolicies,
    type RoomPolicy
} from "../../../api";
import { computed, ref } from "vue";
import { useRequest } from "vue-request";
import { Check, Home, PartyPopper, PenSquare, RotateCcw } from "lucide-vue-next";
import confetti from "canvas-confetti";
import { useToast } from "primevue";
import Navbar from "../../../components/Navbar.vue";
import LoadingMask from "../../../components/LoadingMask.vue";

const resolver = zodResolver(
    z.object({
        classId: z.number({ error: "Class is required." }),
        studentName: z
            .string({ error: "Student name is required." })
            .min(1, { error: "Student name is required." }),
        room: z.number({ error: "Room is required." }),
        studentId: z
            .string({ error: "Student ID is required." })
            .min(1, { error: "Student ID is required." }),
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
    })
);

const { data: classData } = useRequest(getClasses);
const { data: campus } = useRequest(getCampuses);
const { data: room } = useRequest(getRooms);
const { data: roomPolicies } = useRequest(getPolicies);

const classes = computed(() => {
    const _data = classData.value?.data
    if (!_data) return []
    const res: {campus: string, classes: any[]}[] = []
    campus.value?.data.some((c: Campus) => {
        const campusClasses = _data.filter((item: Class) => item.campus === c.id)
        if (campusClasses.length) {
            res.push({ campus: c.name, classes: campusClasses })
        }
    })
    console.log(res)
    return res
})
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
    selectedClass: number
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

    const _class = classData.value?.data.find((item: Class) => item.id === selectedClass);
    const _campus: Campus = campus.value?.data.find((item: Campus) => item.id === _class?.campus);
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
    if (!roomPolicies.value) return [];
    const selectedRoomPolicy = roomPolicies.value.data.filter((policy: RoomPolicy) => policy.room === id && policy.enabled);
    return selectedRoomPolicy || [];
};

const validatePolicy = (time: Date, selectedRoom: number): boolean => {
    if (!room.value || !roomPolicies.value) return true;
    const selectedRoomPolicy: RoomPolicy[] = roomPolicies.value.data.filter((policy: RoomPolicy) => policy.room === selectedRoom && policy.enabled);
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
    selectedClass
}: Record<string, FormFieldState | undefined>) => {
    if (!date?.value || !selectedRoom?.value || !selectedClass?.value) return [];

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
    selectedClass
}: Record<string, FormFieldState | undefined>) => {
    console.log(selectedClass?.value)
    if (!startTime?.value || !date?.value || !selectedRoom?.value || !selectedClass?.value) return [];
    const [startHours, startMinutes] = startTime.value.split(":").map(Number);
    return generateTimeOptions(
        date.value,
        selectedRoom.value,
        startHours,
        startMinutes + 15,
        21 >= startHours + 2 ? startHours + 2 : 21,
        30 > startMinutes && 21 <= startHours + 2 ? 30 : startMinutes,
        selectedClass.value
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

const fetchReservations = async (selectedRoom: FormFieldState) => {
    reservations.value = (
        await postFetchReservations(null, selectedRoom.value)
    ).data.filter((reservation: Reservation) => reservation.status != "rejected") as Reservation[];
};

const success = ref(false);
const successMessage = ref("");
const submitLoading = ref(false);
const onSubmitEvent = async (form: FormSubmitEvent) => {
    console.log(form.values);
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill in all required fields.",
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
    <Dialog header="Classroom Regulations" v-model:visible="termsVisible" modal class="sm:w-[25rem] w-[23rem]">
        <ul class="list-disc pl-5">
            <li>Do not bring food and drinks into the study area. Students are responsible for keeping the study room clean and tidy.</li>
            <li>Students should take good care of their personal belongings (such as wallets, phones, and computers). Valuable items should be carried or locked in a secure place. When leaving the classroom, students should take their valuable items with them, as the school does not assume any responsibility for their safekeeping.</li>
            <li>After leaving public areas, students should take their personal belongings with them. The administrative office will periodically clean the area, and the school will not be responsible for any lost items.</li>
            <li>Students should consciously maintain the cleanliness of the classroom and public order.</li>
            <li>Please take care of and use the teaching equipment responsibly. If any problems or losses are discovered, contact the administrative office as soon as possible. If a student causes equipment loss or maliciously damages the equipment, the student will be responsible for compensation.</li>
            <li>When students leave the classroom, they should ensure that all electrical equipment (such as air conditioners, fans, and lights) is turned off, and the remote control is returned to the designated location.</li>
            <li>Students are not allowed to move teaching equipment without permission.</li>
            <li>Do not reserve seats in any way. If students need to leave their seats, they should take their personal belongings with them, or place their books in their bags and put them under the desk without affecting other students' use of the seat. The duty teacher will periodically inspect the area, and any reserved items found will be removed or taken away to make the seat available for others.</li>
            <li>Be mindful of public decency and personal image, and do not lie down on benches or sofas.</li>
            <li>Do not speak loudly in public places, and set your phone to silent mode. Please go outside to make phone calls.</li>
            <li>It is forbidden to pull power sources privately or use high-powered electrical appliances. Do not move fire safety equipment without permission.</li>
            <li>At any time, the study area must not be used for non-study-related activities (including but not limited to video games on phones/computers, board games, watching variety shows or movies, etc.). Violation of these rules will be handled according to the "Student Violation Management Regulations" based on the actual situation.</li>
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
                        <div class="flex justify-center flex-col gap-4">
                            <InputText
                                type="text"
                                name="studentName"
                                placeholder="Name"
                                fluid
                            ></InputText>
                            <Message
                                v-if="$form.studentName?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.studentName.error?.message }}</Message
                            >
                            <Select
                                optionGroupLabel="campus"
                                optionGroupChildren="classes"
                                optionLabel="name"
                                optionValue="id"
                                filter
                                :options="classes"
                                placeholder="Class"
                                name="classId"
                                fluid
                            >
                                <template #optiongroup="slotProps">
                                    <div class="flex items-center">
                                        <div>{{ slotProps.option.campus }}</div>
                                    </div>
                                </template>
                            </Select>
                            <Message
                                v-if="$form.class?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.class.error?.message }}</Message
                            >
                            <InputText
                                type="text"
                                name="studentId"
                                placeholder="Student ID"
                                fluid
                            ></InputText>
                            <Message
                                v-if="$form.studentId?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.studentId.error?.message }}</Message
                            ><InputText
                                type="text"
                                name="email"
                                placeholder="E-mail"
                                fluid
                            ></InputText>
                            <Message
                                v-if="$form.email?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.email.error?.message }}</Message
                            >
                        </div>
                    </Fieldset>
                    <Fieldset legend="Room Information">
                        <div class="flex justify-center flex-col gap-4">
                            <Select
                                @change="$form.room.value ? $form.room.value = null : undefined"
                                :options="campus?.data"
                                placeholder="Campus"
                                name="campus"
                                optionLabel="name"
                                optionValue="id"
                                fluid
                            >
                            </Select>
                            <Message
                                v-if="$form.campus?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.campus.error?.message }}</Message
                            >
                            <Select
                                @change="fetchReservations($form.room)"
                                :options="
                                    room?.data.filter(
                                        (item) =>
                                            item.campus === $form.campus.value
                                    ) || []
                                "
                                placeholder="Room"
                                name="room"
                                fluid
                                optionLabel="name"
                                optionValue="id"
                            >
                                <template #empty>
                                    <p v-if="!$form.campus.value" class="w-[18rem]">No available options. Please select the campus first.</p>
                                    <p v-else>No available options.</p>
                                </template>
                            </Select>
                            <Message
                                v-if="$form.room?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.room.error?.message }}</Message
                            >
                            <DataTable
                                v-if="$form.room && $form.room.value"
                                :value="reservations"
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
                                                slotProps.data.days
                                            )
                                        }}
                                    </template>
                                </Column>
                                <Column header="Times">
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
                            <DatePicker
                                placeholder="Date"
                                name="date"
                                :manualInput="false"
                                :minDate
                                :maxDate
                                fluid
                            >
                            </DatePicker>
                            <Message
                                v-if="$form.date?.invalid"
                                severity="error"
                                size="small"
                                date-format="yy/mm/dd"
                                >{{ $form.date.error?.message }}</Message
                            >
                            <Select
                                @change="$form.endTime.value ? $form.endTime.value = null : undefined"
                                :options="
                                    getStartTimeOptions({
                                        date: $form.date,
                                        selectedRoom: $form.room,
                                        selectedClass: $form.classId,
                                    })
                                "
                                placeholder="Start Time"
                                name="startTime"
                                fluid
                            >
                                <template #empty>
                                    <p v-if="!$form.campus.value || !$form.room.value || !$form.classId.value || !$form.date.value" class="w-[18rem]">No available options. Please select the campus, room, date, or class first.</p>
                                    <p v-else>No available options.</p>
                                </template>
                            </Select>
                            <Message
                                v-if="$form.startTime?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.startTime.error?.message }}</Message
                            >
                            <Select
                                :options="
                                    getEndTimeOptions({
                                        startTime: $form.startTime,
                                        date: $form.date,
                                        selectedRoom: $form.room,
                                        selectedClass: $form.classId,
                                    })
                                "
                                placeholder="End Time"
                                name="endTime"
                                fluid
                            >
                                <template #empty>
                                    <p v-if="!$form.startTime.value" class="w-[18rem]">No available options. Please select the start time first.</p>
                                    <p v-else>No available options.</p>
                                </template>
                            </Select>
                            <Message
                                v-if="$form.endTime?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.endTime.error?.message }}</Message
                            >
                            <InputText
                                type="text"
                                name="reason"
                                placeholder="Reason"
                                fluid
                            ></InputText>
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
                            I agree to the <a @click="termsVisible = true" class="text-sky-500 cursor-pointer">Classroom Regulations</a>.
                        </label>
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
                        <Button
                            severity="info"
                            size="small"
                            as="a"
                            href="/"
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
                            href="/reservation/create"
                            ><RotateCcw></RotateCcw> Create another
                            reservation</Button
                        >
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
