<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import router from "../router/router";
import { ref, onMounted, computed, Ref } from "vue";
import {
    RoomPolicyInfo,
    verifyAdmin,
    postPolicy,
    postResume,
    postPause,
    postDelete,
    postAdd,
} from "../api";
import { useRequest } from "vue-request";
import Card from "primevue/card";
import Tag from "primevue/tag";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import MultiSelect from "primevue/multiselect";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import DatePicker from "primevue/datepicker";

const token = ref("");
const toast = useToast();
const id = ref(-1);
const { data: policy } = useRequest(
    (): Promise<{ policy: RoomPolicyInfo[] }> => postPolicy(token.value),
    { pollingInterval: 1000 },
);

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

const selectedRoom = ref("");
const selectedDays = ref([]);
const loading = ref(false);
const convertedDays = computed(() =>
    selectedDays.value.map((item) => days.value.indexOf(item)).sort(),
);

const isValid = ref(true);
const isStartTimeValid = ref(true);
const isEndTimeValid = ref(true);
const startDate: Ref<Date | null> = ref(null);
const endDate: Ref<Date | null> = ref(null);

const minStartDate = computed(() => {
    let time = new Date();
    time.setHours(0, 0);
    return time;
});

const maxStartDate = computed(() => {
    if (endDate.value) {
        let time = new Date(endDate.value.getTime());
        time.setMinutes(time.getMinutes() - 5);
        return time;
    }
    let time = new Date();
    time.setHours(23, 59);
    return time;
});

const minEndDate = computed(() => {
    if (startDate.value) {
        let time = new Date(startDate.value.getTime());
        time.setMinutes(time.getMinutes() + 5);
        return time;
    }
    let time = new Date();
    time.setHours(0, 5);
    return time;
});

const maxEndDate = computed(() => {
    let time = new Date();
    time.setHours(23, 55);
    return time;
});

const policyData = computed(() => policy.value?.policy || []);

const onResumeEvent = () => {
    postResume(token.value, id.value).then((res: { success: boolean }) => {
        toast.add({
            severity: res.success ? "success" : "error",
            summary: res.success ? "Success" : "Error",
            detail: res.success ? "Success!" : "An error occured.",
            life: 3000,
        });
    });
};

const onPauseEvent = () => {
    postPause(token.value, id.value).then((res: { success: boolean }) => {
        toast.add({
            severity: res.success ? "success" : "error",
            summary: res.success ? "Success" : "Error",
            detail: res.success ? "Success!" : "An error occured.",
            life: 3000,
        });
    });
};

const onDeleteEvent = () => {
    postDelete(token.value, id.value).then((res: { success: boolean }) => {
        toast.add({
            severity: res.success ? "success" : "error",
            summary: res.success ? "Success" : "Error",
            detail: res.success ? "Success!" : "An error occured.",
            life: 3000,
        });
    });
};

const onAddEvent = () => {
    isValid.value = true;
    isStartTimeValid.value =
        startDate.value instanceof Date &&
        startDate.value.getMinutes() % 5 === 0;
    isEndTimeValid.value =
        endDate.value instanceof Date && endDate.value.getMinutes() % 5 === 0;
    if (
        selectedDays.value.length == 0 ||
        startDate.value == null ||
        endDate.value == null ||
        selectedRoom.value == ""
    ) {
        isValid.value = false;
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill out the required field!",
            life: 3000,
        });
        return;
    }
    if (!isStartTimeValid.value || !isEndTimeValid.value) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "The selected time must be a multiple of 5!",
            life: 3000,
        });
        return;
    }
    const room =
        roomMappingToNumber[selectedRoom.value] || parseInt(selectedRoom.value);
    postAdd(
        token.value,
        room,
        convertedDays.value,
        startDate.value,
        endDate.value,
    ).then((res: { success: boolean }) => {
        toast.add({
            severity: res.success ? "success" : "error",
            summary: res.success ? "Success" : "Error",
            detail: res.success ? "Success!" : "An error occured.",
            life: 3000,
        });
        visible.value = false;
    });
};

const days = ref([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
]);

const formatDays = (time: string) => {
    const days = time.split(",");
    const daysMapping: { [key: string]: string } = {
        "1": "Monday",
        "2": "Tuesday",
        "3": "Wednesday",
        "4": "Thursday",
        "5": "Friday",
        "6": "Saturday",
        "0": "Sunday",
    };
    const convertedDays = [];
    for (const item of days) {
        convertedDays.push(daysMapping[item]);
    }
    return convertedDays.join(", ");
};

const roomMappingToString: { [key: number]: string } = {
    101: "iStudy Meeting Room 1",
    102: "iStudy Meeting Room 2",
    103: "Writing Center 1",
    106: "Writing Center 2",
};

const roomMappingToNumber: { [key: string]: number } = {
    "iStudy Meeting Room 1": 101,
    "iStudy Meeting Room 2": 102,
    "Writing Center 1": 103,
    "Writing Center 2": 106,
};

const getSeverity = (status: boolean) => (status ? "success" : "danger");
const getTag = (status: boolean) => (status ? "Active" : "Inactive");
const visible = ref();

onMounted(() => {
    token.value = sessionStorage.getItem("token") || "";
    if (
        !token.value ||
        !verifyAdmin(token.value).then(
            (res: { success: boolean; message: string }) => res.success,
        )
    ) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please login first!",
            life: 2000,
        });
        setTimeout(() => {
            router.go(-1);
        }, 3000);
    }
});
</script>

<template>
    <div v-if="token !== ''">
        <Dialog
            v-model:visible="visible"
            modal
            header="Add a new policy"
            :style="{ width: '25rem' }"
        >
            <div class="flex flex-col items-center justify-center">
                <Select
                    id="room"
                    class="w-[22rem] m-3"
                    :options="rooms"
                    v-model="selectedRoom"
                    placeholder="Room"
                    :invalid="!isValid && selectedRoom == ''"
                ></Select>

                <MultiSelect
                    id="days"
                    class="w-[22rem] m-3"
                    :options="days"
                    v-model="selectedDays"
                    placeholder="Day(s)"
                    :invalid="!isValid && selectedDays.length == 0"
                ></MultiSelect>

                <DatePicker
                    class="w-[22rem] m-3"
                    v-model="startDate"
                    placeholder="Start time"
                    timeOnly
                    :minDate="minStartDate"
                    :maxDate="maxStartDate"
                    :invalid="!isStartTimeValid || (!isValid && !startDate)"
                >
                </DatePicker>

                <DatePicker
                    class="w-[22rem] m-3"
                    v-model="endDate"
                    placeholder="End time"
                    timeOnly
                    :minDate="minEndDate"
                    :maxDate="maxEndDate"
                    :invalid="!isEndTimeValid || (!isValid && !endDate)"
                >
                </DatePicker>
            </div>
            <div class="flex justify-end gap-2 m-3">
                <Button
                    type="button"
                    label="Cancel"
                    severity="secondary"
                    @click="visible = false"
                ></Button>
                <Button
                    type="button"
                    label="Add"
                    :loading="loading"
                    icon="pi pi-plus"
                    @click="onAddEvent()"
                ></Button>
            </div>
        </Dialog>
        <h1>Policy Settings</h1>
        <Card v-if="policyData.length !== 0" id="cards-container">
            <template #content>
                <Button
                    class="m-2"
                    icon="pi pi-plus"
                    label="Add a new policy"
                    @click="visible = true"
                ></Button>
                <p v-if="policyData.length == 0">
                    There are currently no policies.
                </p>
                <div class="flex flex-wrap justify-center">
                    <div v-for="policy in policyData" id="card">
                        <Card class="m-2">
                            <template #content>
                                <div class="h-[13rem]">
                                    <h3 class="m-4">
                                        {{
                                            roomMappingToString[
                                                parseInt(policy.classroom)
                                            ] || policy.classroom
                                        }}
                                    </h3>
                                    <p class="m-4 gap-4">
                                        <b class="font-bold">Status: </b
                                        ><Tag
                                            :severity="
                                                getSeverity(
                                                    policy.unavailable as boolean,
                                                )
                                            "
                                            :value="
                                                getTag(
                                                    policy.unavailable as boolean,
                                                )
                                            "
                                        ></Tag>
                                    </p>
                                    <p class="m-4">
                                        <b class="text-bold">Day(s): </b
                                        >{{ formatDays(policy.days) }}
                                    </p>
                                    <p class="m-4">
                                        <b class="text-bold">Time: </b
                                        >{{
                                            `${policy.start_time.slice(0, 5)} ~ ${policy.end_time.slice(0, 5)}`
                                        }}
                                    </p>
                                </div></template
                            >
                            <template #footer>
                                <div class="flex gap-4 mt-1">
                                    <Button
                                        outlined
                                        icon="pi pi-trash"
                                        label="Delete"
                                        severity="danger"
                                        class="w-full"
                                        @click="
                                            (id = policy.id as number),
                                                onDeleteEvent()
                                        "
                                    />
                                    <Button
                                        v-if="!policy.unavailable"
                                        icon="pi pi-play"
                                        severity="success"
                                        label="Resume"
                                        class="w-full"
                                        @click="
                                            (id = policy.id as number),
                                                onResumeEvent()
                                        "
                                    ></Button>
                                    <Button
                                        v-if="policy.unavailable"
                                        icon="pi pi-pause"
                                        severity="danger"
                                        label="Stop"
                                        class="w-full"
                                        @click="
                                            (id = policy.id as number),
                                                onPauseEvent()
                                        "
                                    ></Button>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </template>
        </Card>
        <Skeleton v-else height="650px"></Skeleton>
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

#card {
    width: 33%;
}

h3 {
    font-size: 1.4em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

#cards-container {
    min-height: 650px;
}

@media screen and (max-width: 930px) {
    #card {
        width: 50%;
    }
}

@media screen and (max-width: 720px) {
    #card {
        width: 100%;
    }
}
</style>
