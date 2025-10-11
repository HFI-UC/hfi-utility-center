<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import { postReservation, type ReservationInfo } from "../api";
import { computed, onMounted, watch, ref } from "vue";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import { useI18n } from "vue-i18n";

const data = ref<ReservationInfo | null>(null);
const queried = ref(false);
const query = ref("");
const date = ref<Date | null>(null);
const room = ref("");
const { t, locale } = useI18n();
const options = computed(() => [
    t("status.option.keyword"),
    t("status.option.time"),
    t("status.option.room"),
]);
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
    "501",
    "511",
    "512",
    "513",
    "514",
    "524",
]);

const roomMappingToNumber: Record<string, number> = {
    "iStudy Meeting Room 1": 101,
    "iStudy Meeting Room 2": 102,
    "Writing Center 1": 103,
    "Writing Center 2": 106,
};
const searchOption = ref(t("status.option.keyword"));

watch(
    () => locale.value,
    () => {
        searchOption.value = t("status.option.keyword");
    },
);
const token = ref("");
const onSearch = async () => {
    queried.value = true;
    loading.value = true;
    const reservationParams = getReservationParams();
    if (reservationParams) {
        const res = await postReservation({
            ...reservationParams,
            token: token.value,
        });
        data.value = res;
    } else {
        data.value = { success: false, data: [] };
        queried.value = false;
    }
    loading.value = false;
};

const getReservationParams = () => {
    if (searchOption.value === t("status.option.time") && date.value) {
        date.value.setSeconds(0, 0);
        return { time: date.value };
    } else if (searchOption.value === t("status.option.room") && room.value) {
        return {
            room: (roomMappingToNumber[room.value] || room.value).toString(),
        };
    } else if (
        searchOption.value === t("status.option.keyword") &&
        query.value
    ) {
        return { query: query.value };
    }
    return null;
};

onMounted(() => {
    token.value = sessionStorage.getItem("token") || "";
});

const statusMapping = computed<Record<string, string>>(() => ({
    non: t("status.tag.pending"),
    yes: t("status.tag.approved"),
    no: t("status.tag.rejected"),
}));

const loading = ref(false);

const bookingData = computed(() => {
    if (!data.value) return [];
    return data.value.data
        .map((item) => ({
            id: `#${item.id as number}`,
            sid: item.sid as number,
            addTime: item.addTime || "",
            operator: item.operator || "",
            name: item.name,
            email: item.email,
            time: formatTime(item.time),
            date: formatDate(item.time),
            room: roomMappingToString[item.room] || item.room.toString(),
            status: statusMapping.value[item.auth],
            reason: item.reason,
            severity: getSeverity(item.auth),
        }))
        .sort((a, b) =>
            a.date === b.date
                ? b.time.localeCompare(a.time)
                : b.date.localeCompare(a.date),
        );
});

const formatDate = (time: string) => {
    const date = new Date(parseInt(time.split("-")[0]));
    return date.toISOString().split("T")[0];
};

const formatTime = (time: string) => {
    const [start, end] = time.split("-");
    return `${formatHour(new Date(parseInt(start)))} ~ ${formatHour(new Date(parseInt(end)))}`;
};

const formatHour = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const roomMappingToString: Record<number, string> = {
    101: "iStudy Meeting Room 1",
    102: "iStudy Meeting Room 2",
    103: "Writing Center 1",
    106: "Writing Center 2",
};

const getSeverity = (label: string): string => {
    switch (label) {
        case "non":
            return "info";
        case "no":
            return "danger";
        case "yes":
            return "success";
        default:
            return "info";
    }
};
</script>

<template>
    <DataTable
        class="text-nowrap"
        :value="bookingData"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
    >
        <template #empty>
            <p v-if="loading">
                {{ $t("status.table.loading") }}
            </p>
            <p v-else-if="queried && (!data || data.data.length === 0)">
                {{ $t("status.table.empty") }}
            </p>
            <p v-else-if="!queried">{{ $t("status.table.enter_keyword") }}</p>
        </template>
        <template #header>
            <div class="flex flex-col gap-3">
                <SelectButton
                    v-model="searchOption"
                    class="h-[40px]"
                    :options="options"
                    aria-labelledby="basic"
                />
                <div class="flex justify-start gap-3">
                    <Select
                        class="sm:w-[20rem] w-[70%]"
                        v-if="searchOption == $t('status.option.room')"
                        v-model="room"
                        v-tooltip.bottom="$t('status.tooltip.room')"
                        :placeholder="$t('status.option.room')"
                        :options="rooms"
                    />
                    <DatePicker
                        class="sm:w-[20rem] w-[70%]"
                        v-else-if="searchOption == $t('status.option.time')"
                        showTime
                        v-tooltip.bottom="$t('status.tooltip.time')"
                        v-model="date"
                        :placeholder="$t('status.option.time')"
                        dateFormat="yy/mm/dd"
                    />
                    <InputText
                        v-else
                        class="sm:w-[20rem] w-[70%]"
                        v-model="query"
                        v-tooltip.bottom="$t('status.tooltip.keyword')"
                        :placeholder="$t('status.option.keyword')"
                    />
                    <Button
                        class="sm:w-auto w-[30%]"
                        @click="onSearch()"
                        :label="$t('status.table.search')"
                        :loading="loading"
                        icon="icon-search"
                    ></Button>
                </div>
            </div>
        </template>
        <Column field="id" :header="$t('status.column.id')"></Column>
        <Column field="sid" :header="$t('status.column.sid')"></Column>
        <Column field="name" :header="$t('status.column.name')"></Column>
        <Column field="email" :header="$t('status.column.email')"></Column>
        <Column field="date" :header="$t('status.column.date')"></Column>
        <Column field="time" :header="$t('status.column.time')"></Column>
        <Column field="room" :header="$t('status.column.room')"></Column>
        <Column field="reason" :header="$t('status.column.reason')"></Column>
        <Column
            field="operator"
            :header="$t('status.column.operator')"
        ></Column>
        <Column field="addTime" :header="$t('status.column.add_time')"></Column>
        <Column field="status" :header="$t('status.column.status')">
            <template #body="{ data }">
                <Tag :severity="data.severity" :value="data.status"></Tag>
            </template>
        </Column>
    </DataTable>
</template>

<style scoped>
:deep(.p-inputtext),
.p-select {
    min-width: 15rem;
    border-radius: 0.5rem !important;
}

button {
    border-radius: 0.5rem;
}

@media screen and (max-width: 720px) {
    :deep(.p-inputtext),
    .p-select {
        min-width: 10rem;
    }
}
</style>
