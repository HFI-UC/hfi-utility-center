<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import router from "../router/router";
import { ref, onMounted, computed } from "vue";
import {
    verifyAdmin,
    postPolicy,
    postPolicyResume,
    postPolicyPause,
    postPolicyDelete,
    postPolicyAdd,
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
import { useI18n } from "vue-i18n";

const token = ref("");
const toast = useToast();
const { t } = useI18n();
const id = ref(-1);
const { data: policy } = useRequest(() => postPolicy(token.value), {
    pollingInterval: 3000,
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
    "Writing Center 1",
    "Writing Center 2",
    "511",
    "512",
    "513",
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
const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);

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
    postPolicyResume(token.value, id.value).then(
        (res: { success: boolean }) => {
            toast.add({
                severity: res.success ? "success" : "error",
                summary: res.success ? t("toast.success") : t("toast.error"),
                detail: res.success
                    ? t("toast.success_msg")
                    : t("toast.error_occured"),
                life: 3000,
            });
        },
    );
};

const onPauseEvent = () => {
    postPolicyPause(token.value, id.value).then((res: { success: boolean }) => {
        toast.add({
            severity: res.success ? "success" : "error",
            summary: res.success ? t("toast.success") : t("toast.error"),
            detail: res.success
                ? t("toast.success_msg")
                : t("toast.error_occured"),
            life: 3000,
        });
    });
};

const onDeleteEvent = () => {
    postPolicyDelete(token.value, id.value).then(
        (res: { success: boolean }) => {
            toast.add({
                severity: res.success ? "success" : "error",
                summary: res.success ? t("toast.success") : t("toast.error"),
                detail: res.success
                    ? t("toast.success_msg")
                    : t("toast.error_occured"),
                life: 3000,
            });
        },
    );
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
            summary: t("toast.error"),
            detail: t("toast.required_field"),
            life: 3000,
        });
        return;
    }
    if (!isStartTimeValid.value || !isEndTimeValid.value) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: t("toast.multiple"),
            life: 3000,
        });
        return;
    }
    const room =
        roomMappingToNumber[selectedRoom.value] || parseInt(selectedRoom.value);
    postPolicyAdd(
        token.value,
        room,
        convertedDays.value,
        startDate.value,
        endDate.value,
    ).then((res: { success: boolean }) => {
        toast.add({
            severity: res.success ? "success" : "error",
            summary: res.success ? t("toast.success") : t("toast.error"),
            detail: res.success
                ? t("toast.success_msg")
                : t("toast.error_occured"),
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
    const daysMapping: Record<string, string> = {
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

const roomMappingToString: Record<number, string> = {
    101: "iStudy Meeting Room 1",
    102: "iStudy Meeting Room 2",
    103: "Writing Center 1",
    106: "Writing Center 2",
};

const roomMappingToNumber: Record<string, number> = {
    "iStudy Meeting Room 1": 101,
    "iStudy Meeting Room 2": 102,
    "Writing Center 1": 103,
    "Writing Center 2": 106,
};

const getSeverity = (status: boolean) => (status ? "success" : "danger");
const getTag = (status: boolean) =>
    status ? t("policy.tag.active") : t("policy.tag.inactive");
const visible = ref();

onMounted(async () => {
    token.value = sessionStorage.getItem("token") || "";
    if (!token.value || !(await verifyAdmin(token.value))) {
        token.value = "";
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: t("toast.login_first"),
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
            :header="$t('policy.new_policy.header')"
            :style="{ width: '25rem' }"
        >
            <div class="flex flex-col items-center justify-center">
                <Select
                    id="room"
                    class="w-[22rem] m-3"
                    :options="rooms"
                    v-model="selectedRoom"
                    :placeholder="$t('policy.new_policy.room')"
                    :invalid="!isValid && selectedRoom == ''"
                ></Select>

                <MultiSelect
                    id="days"
                    class="w-[22rem] m-3"
                    :options="days"
                    v-model="selectedDays"
                    :placeholder="$t('policy.new_policy.days')"
                    :invalid="!isValid && selectedDays.length == 0"
                ></MultiSelect>

                <DatePicker
                    class="w-[22rem] m-3"
                    v-model="startDate"
                    :placeholder="$t('policy.new_policy.start_time')"
                    timeOnly
                    :minDate="minStartDate"
                    :maxDate="maxStartDate"
                    :invalid="!isStartTimeValid || (!isValid && !startDate)"
                >
                </DatePicker>

                <DatePicker
                    class="w-[22rem] m-3"
                    v-model="endDate"
                    :placeholder="$t('policy.new_policy.end_time')"
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
                    :label="$t('policy.new_policy.cancel')"
                    severity="secondary"
                    @click="visible = false"
                ></Button>
                <Button
                    type="button"
                    :label="$t('policy.new_policy.add')"
                    :loading="loading"
                    icon="icon-plus"
                    @click="onAddEvent()"
                ></Button>
            </div>
        </Dialog>
        <h1>{{ $t("policy.policy") }}</h1>
        <div v-if="policy?.success" id="cards-container">
            <Button
                class="mt-2 mb-4"
                icon="icon-plus"
                :label="$t('policy.new_policy.header')"
                @click="visible = true"
            ></Button>
            <p v-if="policyData.length == 0">
                {{ $t("policy.empty") }}
            </p>
            <div class="flex flex-wrap justify-between gap-[1rem]">
                <div v-for="policy in policyData" id="card">
                    <Card>
                        <template #content>
                            <div class="h-[11rem] ms-4 me-4">
                                <h3 class="mt-4 mb-4">
                                    {{
                                        roomMappingToString[
                                            parseInt(policy.classroom)
                                        ] || policy.classroom
                                    }}
                                </h3>
                                <p class="mb-4 gap-4">
                                    <b>{{ $t("policy.card.status") }}</b
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
                                <p class="mb-4">
                                    <b>{{ $t("policy.card.days") }}</b
                                    >{{ formatDays(policy.days) }}
                                </p>
                                <p class="mb-4">
                                    <b>{{ $t("policy.card.time") }}</b
                                    >{{
                                        `${policy.start_time.slice(0, 5)} ~ ${policy.end_time.slice(0, 5)}`
                                    }}
                                </p>
                            </div></template
                        >
                        <template #footer>
                            <div class="m-4 flex gap-4">
                                <Button
                                    outlined
                                    icon="icon-trash-2"
                                    :label="$t('policy.card.delete')"
                                    severity="danger"
                                    class="w-full"
                                    @click="
                                        (id = policy.id as number),
                                            onDeleteEvent()
                                    "
                                />
                                <Button
                                    v-if="!policy.unavailable"
                                    icon="icon-play"
                                    severity="success"
                                    :label="$t('policy.card.resume')"
                                    class="w-full"
                                    @click="
                                        (id = policy.id as number),
                                            onResumeEvent()
                                    "
                                ></Button>
                                <Button
                                    v-if="policy.unavailable"
                                    icon="icon-pause"
                                    severity="danger"
                                    :label="$t('policy.card.stop')"
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
        </div>
        <Skeleton
            v-else
            height="650px"
            style="border-radius: 0.75rem"
        ></Skeleton>
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
    font-size: 1.4em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

button {
    border-radius: 0.5rem;
}

#cards-container {
    min-height: 650px;
}
b {
    font-weight: bold;
}
#card {
    width: calc(50% - 0.8rem);
}

@media screen and (max-width: 820px) {
    #card {
        width: 100%;
    }
}
</style>
