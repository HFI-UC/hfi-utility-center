<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { onMounted, ref, computed } from "vue";
import {
    postReservationAccept,
    postReservationReject,
    verifyAdmin,
} from "../api";
import { useRequest } from "vue-request";
import { postAdminReservation } from "../api";
import router from "../router/router";
import Card from "primevue/card";
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import { useI18n } from "vue-i18n";

const toast = useToast();
const token = ref("");
const visible = ref(false);
const { t } = useI18n();
const reason = ref("");
const disabled = ref(false);
const reasons = ref([
    {
        name: "时间冲突 - 选择的时间段已被其他活动预订",
        code: "1",
    },
    {
        name: "资源不足 - 当前没有足够的设备或资源支持此次预约",
        code: "2",
    },
    {
        name: "不符合预约条件 - 预约请求不符合课室使用的特定条件或规则",
        code: "3",
    },
    { name: "维修中 - 课室正在进行维修或升级，暂时无法使用", code: "4" },
    { name: "安全问题 - 出于安全考虑，暂时无法批准使用", code: "5" },
    { name: "信息不完整 - 提交的预约信息不完整或不准确", code: "6" },
    { name: "违反政策 - 预约的活动违反了学校或机构的相关政策", code: "7" },
    { name: "预约过于频繁 - 同一组织或个人的预约频率过高", code: "8" },
    { name: "特殊活动优先 - 由于特殊活动或紧急情况，优先安排资源", code: "9" },
]);

const { data: booking } = useRequest(() => postAdminReservation(token.value), {
    pollingInterval: 3000,
});

const selectedBooking = ref();

const filteredBookingData = computed(
    () =>
        booking.value?.data
            .filter((item) => {
                const regex = new RegExp(query.value, "i");
                return (
                    query.value == "" ||
                    status.value[item.auth].match(regex) ||
                    item.email.match(regex) ||
                    item.name.match(regex) ||
                    item.reason.match(regex) ||
                    item.id?.toString().match(regex) ||
                    (roomMapping[item.room] || item.room.toString()).match(
                        regex,
                    ) ||
                    formatTime(item.time).match(regex) ||
                    formatDate(item.time).match(regex)
                );
            })
            .map((item) => ({ ...item, loading: false })) || [],
);

const unreviewedBookingData = computed(() =>
    filteredBookingData.value.filter((item) => item.auth == "non"),
);

const reviewedBookingData = computed(() =>
    filteredBookingData.value.filter((item) => item.auth != "non"),
);

const formatDate = (time: string) => {
    const startTime = time.split("-")[0];
    const date = new Date(parseInt(startTime));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const query = ref("");

const formatTime = (time: string) => {
    const [start, end] = time.split("-");
    const startTime = new Date(parseInt(start));
    const endTime = new Date(parseInt(end));
    const formatHour = (date: Date): string =>
        `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return `${formatHour(startTime)} ~ ${formatHour(endTime)}`;
};

const onAcceptEvent = async () => {
    disabled.value = true;
    const res: { success: boolean; message: string } =
        await postReservationAccept(
            token.value,
            selectedBooking.value.id as number,
        );
    toast.add({
        severity: res.success ? "success" : "error",
        summary: res.success ? t("toast.success") : t("toast.error"),
        detail: res.message,
        life: 3000,
    });
    disabled.value = false;
};

const isCompleted = ref(true);

const onRejectEvent = async () => {
    isCompleted.value = true;
    disabled.value = true;
    if (reason.value == "") {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: t("toast.required_field"),
            life: 3000,
        });
        isCompleted.value = false;
        return;
    }
    const res: { success: boolean; message: string } =
        await postReservationReject(
            token.value,
            selectedBooking.value?.id as number,
            reason.value,
        );
    toast.add({
        severity: res.success ? "success" : "error",
        summary: res.success ? t("toast.success") : t("toast.error"),
        detail: res.message,
        life: 3000,
    });
    disabled.value = false;
    visible.value = false;
};

const status = computed<Record<string, string>>(() => ({
    non: t("reservation.card.tag.pending"),
    no: t("reservation.card.tag.rejected"),
    yes: t("reservation.card.tag.approved"),
}));

const severity: Record<string, string> = {
    non: "info",
    no: "danger",
    yes: "success",
};

const roomMapping: Record<string, string> = {
    101: "iStudy Meeting Room 1",
    102: "iStudy Meeting Room 2",
    103: "Writing Center 1",
    106: "Writing Center 2",
};

onMounted(async () => {
    token.value = sessionStorage.getItem("token") || "";
    if (!token.value || !(await verifyAdmin(token.value))) {
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
            :header="$t('reservation.reject.header')"
            :style="{ width: '25rem' }"
        >
            <div class="flex items-center justify-center gap-4 mb-8">
                <FloatLabel>
                    <label for="reason">{{
                        $t("reservation.reject.reason")
                    }}</label>
                    <Select
                        id="reason"
                        class="w-[22rem]"
                        :options="reasons"
                        :placeholder="$t('reservation.reject.reject_reason')"
                        optionLabel="name"
                        optionValue="code"
                        v-model="reason"
                        :invalid="!isCompleted && reason == ''"
                    ></Select
                ></FloatLabel>
            </div>
            <div class="flex justify-end gap-2">
                <Button
                    type="button"
                    :label="$t('reservation.reject.cancel')"
                    :disabled="disabled"
                    severity="secondary"
                    @click="(visible = false), (disabled = false)"
                ></Button>
                <Button
                    type="button"
                    :disabled="disabled"
                    :label="$t('reservation.reject.reject')"
                    severity="danger"
                    @click="onRejectEvent()"
                ></Button>
            </div>
        </Dialog>
        <h1>{{ $t("reservation.reservation") }}</h1>
        <div v-if="booking?.success" id="cards-container">
            <p v-if="booking.data.length == 0 && booking">
                {{ $t("reservation.empty") }}
            </p>
            <div v-else>
                <div class="justify-left mt-4 mb-4">
                    <IconField>
                        <InputIcon class="icon-search"></InputIcon>
                        <InputText
                            :placeholder="$t('reservation.search')"
                            v-model="query"
                        ></InputText>
                    </IconField>
                </div>
                <h2>{{ $t("reservation.unreviewed") }}</h2>
                <div v-if="unreviewedBookingData.length != 0">
                    <div class="flex flex-wrap justify-between gap-[1rem]">
                        <div v-for="booking in unreviewedBookingData" id="card">
                            <Card>
                                <template #content>
                                    <div class="ms-4 me-4">
                                        <h3>
                                            {{
                                                $t("reservation.card.header", [
                                                    booking.id,
                                                ])
                                            }}
                                        </h3>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.room")
                                            }}</b
                                            >{{
                                                roomMapping[booking.room] ||
                                                booking.room
                                            }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.name")
                                            }}</b
                                            >{{ booking.name }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.email")
                                            }}</b
                                            >{{ booking.email }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.date")
                                            }}</b
                                            >{{ formatDate(booking.time) }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.time")
                                            }}</b
                                            >{{ formatTime(booking.time) }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.reason")
                                            }}</b
                                            >{{ booking.reason }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.status")
                                            }}</b
                                            ><Tag
                                                :severity="
                                                    severity[booking.auth]
                                                "
                                                :value="status[booking.auth]"
                                            ></Tag>
                                        </p>
                                    </div>
                                </template>
                                <template #footer>
                                    <div class="m-4 flex gap-4">
                                        <Button
                                            outlined
                                            icon="icon-x"
                                            :label="
                                                $t('reservation.reject.reject')
                                            "
                                            @click="
                                                (reason = ''),
                                                    (visible = true),
                                                    (selectedBooking = booking)
                                            "
                                            :disabled="disabled"
                                            severity="danger"
                                            class="w-full"
                                        />
                                        <Button
                                            icon="icon-check"
                                            severity="success"
                                            :disabled="disabled"
                                            :label="$t('reservation.pass')"
                                            class="w-full"
                                            @click="
                                                (selectedBooking = booking),
                                                    onAcceptEvent()
                                            "
                                        ></Button>
                                    </div>
                                </template>
                            </Card>
                        </div>
                    </div>
                </div>
                <p v-else>{{ $t("reservation.empty") }}</p>
                <br />
                <h2>{{ $t("reservation.reviewed") }}</h2>
                <div v-if="reviewedBookingData.length != 0">
                    <div class="flex flex-wrap justify-between gap-[1rem]">
                        <div v-for="booking in reviewedBookingData" id="card">
                            <Card>
                                <template #content>
                                    <div class="ms-4 me-4">
                                        <h3>
                                            {{
                                                $t("reservation.card.header", [
                                                    booking.id,
                                                ])
                                            }}
                                        </h3>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.room")
                                            }}</b
                                            >{{
                                                roomMapping[booking.room] ||
                                                booking.room
                                            }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.name")
                                            }}</b
                                            >{{ booking.name }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.email")
                                            }}</b
                                            >{{ booking.email }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.date")
                                            }}</b
                                            >{{ formatDate(booking.time) }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.time")
                                            }}</b
                                            >{{ formatTime(booking.time) }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.reason")
                                            }}</b
                                            >{{ booking.reason }}
                                        </p>
                                        <p class="mb-2">
                                            <b>{{
                                                $t("reservation.card.status")
                                            }}</b
                                            ><Tag
                                                :severity="
                                                    severity[booking.auth]
                                                "
                                                :value="status[booking.auth]"
                                            ></Tag>
                                        </p>
                                    </div>
                                </template>
                                <template #footer>
                                    <div class="m-4 flex gap-4">
                                        <Button
                                            outlined
                                            v-if="booking.auth == 'yes'"
                                            icon="icon-x"
                                            :label="
                                                $t('reservation.reject.reject')
                                            "
                                            @click="
                                                (reason = ''),
                                                    (visible = true),
                                                    (selectedBooking = booking)
                                            "
                                            :disabled="disabled"
                                            severity="danger"
                                            class="w-full"
                                        />
                                        <Button
                                            v-else
                                            icon="icon-check"
                                            severity="success"
                                            :label="$t('reservation.pass')"
                                            class="w-full"
                                            :disabled="disabled"
                                            @click="
                                                (selectedBooking = booking),
                                                    onAcceptEvent()
                                            "
                                        ></Button>
                                    </div>
                                </template>
                            </Card>
                        </div>
                    </div>
                </div>
                <p v-else>{{ $t("reservation.empty") }}</p>
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
    font-size: 1.5em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

h2 {
    font-size: 1.6em;
    margin-block-start: 1.13em;
    margin-block-end: 1.13em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}
#card {
    width: calc(50% - 0.8rem);
}

button {
    border-radius: 0.5rem;
}

:deep(.p-inputtext),
.p-select,
.p-textarea {
    border-radius: 0.5rem !important;
    min-width: 17rem;
}

#cards-container {
    min-height: 650px;
}
b {
    font-weight: bold;
}
@media screen and (max-width: 720px) {
    #card {
        width: 100%;
    }
}
</style>
