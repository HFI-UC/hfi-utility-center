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

const { data: policyData } = useRequest(
    (): Promise<{ policy: RoomPolicyInfo[] }> => fetchPolicy(),
    {
        pollingInterval: 1000000,
    },
);

const policy = computed(() => policyData.value?.policy || []);

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

const campus = ref(["Shipai Campus", "Knowledge City Campus"]);

const classes = ref([
    {
        label: "Shipai Campus",
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
        label: "Knowledge City Campus",
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
        "104",
        "Writing Center 1",
        "Writing Center 2",
    ],
    ["512", "524"],
]);

const roomsOption = computed(() => {
    if (reservation.value.selectedCampus == "") return [];
    return reservation.value.selectedCampus == "Shipai Campus"
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
            summary: "Error",
            detail: "Please fill out the required field!",
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

const rules = [
    [
        "English",
        [
            "◆ Please do not bring food and drinks into the study area to eat or drink. Students are responsible for keeping the study room clean and tidy.",
            "◆ Students should take care of their personal belongings (e.g., wallets, cell phones, computers). Please keep your valuables with you or lock them in a safe place. When leaving the classroom, please take your valuables with you; the school is not obligated to keep them.",
            "◆ After leaving the public area, students should take their personal belongings with them. The Administration Office will clean up the sanitation of the venue on a regular basis, and the school will not bear any responsibility for any loss.",
            "◆ Students should consciously maintain the cleanliness of the classroom and public order.",
            "◆ Please take care of and reasonably use the teaching equipment. If you find any problem or loss, please contact the Administration Office as soon as possible; if the equipment is lost due to students' reasons or if students are malicious or damage the teaching equipment, students should be responsible for the compensation.",
            "◆ When students leave the classroom, they should make sure that all electrical equipment (e.g. air-conditioners, fans, lights) are turned off and the remote control panel is returned to its designated location.",
            "◆ Students are not allowed to move the teaching equipment without permission.",
            "◆ Please do not occupy seats in any way. If students need to leave their seats, they should consciously take their personal belongings with them; or receive desktop books into their bags and place them on the side underneath the desks and chairs so that they do not interfere with other students' use of the seats; the teacher on duty will conduct regular inspections, and once occupancy of a seat is detected, the items occupying the seat will be removed or taken away in order to vacate the seat for other students.",
            "◆ Pay attention to public morality and personal image, do not lie down on benches or sofas.",
            "◆ Do not make loud noises in public places. Also, please put your cell phone on silent mode and consciously go outside to receive phone calls.",
            "◆ Prohibit the use of private power supply and high power electrical appliances, and do not move fire-fighting facilities without authorization.",
            "◆ No matters unrelated to study (including but not limited to mobile phone/computer electronic games (software APP), chess and cards, watching variety shows/films, etc.) are allowed in the study area at any time. Violation of the above requirements and regulations will be taken into account in the actual situation and will be enforced in accordance with the 'Regulations on the Management of Student Violations'.",
        ],
    ],
    [
        "简体中文",
        [
            "◆ 请勿携带食品和饮料进入自习区域饮食，学生有责任保持自习室干净整洁。",
            "◆ 学生应保管好个人物品（如钱包、手机、电脑），请将贵重物品随身携带或锁在安全的地方。离开教室时，请带走贵重物品，学校不承担保管义务。",
            "◆ 离开公共区域后，学生应将个人物品随身带走，行政办会定期清理场地卫生，如有遗失，学校不承担任何责任。",
            "◆ 学生需自觉维护好课室保洁、公共秩序。",
            "◆ 请爱护并合理使用教学设备，如果发现有问题或遗失，请尽快联系行政办；如果因学生原因造成设备遗失或学生恶意、损坏教学设备，学生应负责赔偿。",
            "◆ 学生离开教室时，应确保所有电器设备（如空调、风扇、灯）被关闭，并且遥控板被归还到指定位置。",
            "◆ 未经允许，学生不可以移动教学设备。",
            "◆ 请勿以任何方式占座，学生若需离开座位，请自觉将个人物品带离；或将桌面的书本收到书包里，放置在桌椅下方的侧边，不影响其它同学使用座位；值班老师将定期巡查，一旦发现有占座现象，占座物品将被移开或收走，以腾出座位给其他同学。",
            "◆ 注意公德和个人形象，勿在长椅或沙发上躺卧。",
            "◆ 公共场合不得大声喧哗，同时请将手机调为静音状态，自觉到室外接打电话。",
            "◆ 禁止私拉电源和使用高功率电器，未经批准请勿挪动消防设施。",
            "◆ 任何时段，自习区域不得进行与学习无关的事项（包括但不限于手机/电脑等电子游戏（软件APP）、棋牌、观看综艺/影视等）违反以上要求及规定，将结合实际情况，按照《学生违规管理条例》执行。",
        ],
    ],
];
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        header="Classroom Regulations"
        class="w-[25rem]"
    >
        <div v-for="i in rules" class="mb-8">
            <p class="font-bold mb-4">{{ i[0] }}</p>
            <p v-for="j in i[1]" class="mb-3">{{ j }}</p>
        </div>
    </Dialog>
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
                                v-tooltip.bottom="
                                    'Your Chinese name and English name (e.g. 山姆 Sam).'
                                "
                                :invalid="
                                    !isCompleted &&
                                    reservation.studentName === ''
                                "
                            />
                            <label for="name">Name</label>
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
                            <label for="room">Class</label>
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
                            <label for="id">Student ID</label>
                        </FloatLabel>
                        <FloatLabel class="m-[20px]">
                            <InputText
                                id="name"
                                v-model="reservation.email"
                                v-tooltip.bottom="
                                    'Your e-mail (e.g. sam.xulf2024@gdhfi.com).'
                                "
                                :invalid="
                                    !isCompleted && reservation.email === ''
                                "
                            />
                            <label for="name">E-mail</label>
                        </FloatLabel>
                        <h3>Room Information</h3>
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
                            <label for="campus">Campus</label>
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
                            <label for="date">Date</label>
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
                            <label for="startTime">Start Time</label>
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
                            <label for="endTime">End Time</label>
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
                            <label for="reason">Reason</label>
                        </FloatLabel>
                        <div class="flex items-center m-[20px]">
                            <Checkbox
                                v-model="reservation.isAgreed"
                                id="check"
                                v-tooltip.bottom="
                                    'You will need to follow the rules of the classroom to make an application.'
                                "
                                :invalid="!isCompleted && !reservation.isAgreed"
                                :binary="true"
                            />
                            <label for="check" class="ml-2">
                                I will follow the
                                <a @click="visible = true"
                                    >Classroom Regulations</a
                                >.
                            </label>
                        </div>
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
.p-textarea,
input {
    min-width: 20rem;
}

#card {
    width: 28rem;
}

#datatable {
    min-width: 20rem;
    margin: 20px;
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
    .p-select,
    .p-datepicker,
    .p-textarea,
    input {
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
