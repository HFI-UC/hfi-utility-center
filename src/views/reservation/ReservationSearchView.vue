<script setup lang="ts">
import { useRequest } from "vue-request";
import { getRooms, getReservations, type ReservationStatus } from "@/api";
import { computed } from "vue";
import { SquareArrowOutUpRight } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AdCarousel from "@/components/AdCarousel.vue";

const route = useRoute();
const { t } = useI18n();

const statusOptions = computed(() => [
    {
        id: "pending",
        name: t("reservation.search.status.pending"),
        severity: "info",
    },
    {
        id: "approved",
        name: t("reservation.search.status.approved"),
        severity: "success",
    },
    {
        id: "rejected",
        name: t("reservation.search.status.rejected"),
        severity: "danger",
    },
]);

const getStatusOption = (id: string) =>
    statusOptions.value.find((o) => o.id === id);

const router = useRouter();

const updateQuery = (newQuery: Record<string, any>) => {
    const query = { ...route.query, ...newQuery };
    Object.keys(query).forEach(
        (key) => query[key] === undefined && delete query[key],
    );
    router.push({ query });
};

const keyword = computed({
    get: () => (route.query.keyword as string) || "",
    set: (val) => updateQuery({ keyword: val || undefined, page: undefined }),
});

const status = computed({
    get: () => (route.query.status as string) || null,
    set: (val) => updateQuery({ status: val || undefined, page: undefined }),
});

const room = computed({
    get: () => (route.query.room ? parseInt(route.query.room as string) : null),
    set: (val) => updateQuery({ room: val || undefined, page: undefined }),
});

const time = computed({
    get: () =>
        route.query.startTime && route.query.endTime
            ? [
                  new Date(parseInt(route.query.startTime as string)),
                  new Date(parseInt(route.query.endTime as string)),
              ]
            : null,
    set: (val) => {
        if (val && val.length === 2) {
            updateQuery({
                startTime: val[0].getTime(),
                endTime: val[1].getTime(),
                page: undefined,
            });
        } else {
            updateQuery({
                startTime: undefined,
                endTime: undefined,
                page: undefined,
            });
        }
    },
});

const pageOffset = computed({
    get: () =>
        route.query.page ? (parseInt(route.query.page as string) - 1) * 20 : 0,
    set: (val) => {
        const p = Math.floor(val / 20) + 1;
        updateQuery({ page: p > 1 ? p : undefined });
    },
});

const requestParams = computed(() => ({
    keyword: (route.query.keyword as string) || null,
    room: route.query.room ? parseInt(route.query.room as string) : null,
    status: (route.query.status as string) || null,
    page: route.query.page ? parseInt(route.query.page as string) - 1 : 0,
    startTime: route.query.startTime
        ? new Date(parseInt(route.query.startTime as string))
        : null,
    endTime: route.query.endTime
        ? new Date(parseInt(route.query.endTime as string))
        : null,
}));

const { data: reservations, loading: reservationsLoading } = useRequest(
    () =>
        getReservations(
            requestParams.value.keyword,
            requestParams.value.room,
            requestParams.value.status as ReservationStatus | null,
            requestParams.value.page,
            requestParams.value.startTime,
            requestParams.value.endTime,
        ),
    {
        refreshDeps: [requestParams],
        debounceInterval: 300,
    },
);

const { data: roomData } = useRequest(() => getRooms());

const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ${String(date.getHours()).padStart(
        2,
        "0",
    )}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const statusMapping = computed<Record<string, string>>(() => ({
    pending: t("reservation.search.status.pending"),
    approved: t("reservation.search.status.approved"),
    rejected: t("reservation.search.status.rejected"),
}));

const severityMapping: Record<string, string> = {
    pending: "info",
    approved: "success",
    rejected: "danger",
};
</script>
<template>
    <div class="mt-24 mb-4 md:mx-12 2xl:mx-32 mx-4">
        <h1 class="font-bold md:text-3xl text-2xl my-4">
            {{ $t("reservation.search.title") }}
        </h1>
        <Card class="w-full mt-4">
            <template #content>
                <DataTable
                    paginator
                    lazy
                    :value="reservations?.data.reservations || []"
                    :totalRecords="reservations?.data.total"
                    :loading="reservationsLoading"
                    :rows="20"
                    v-model:first="pageOffset"
                    class="text-nowrap"
                >
                    <template #header>
                        <div class="flex justify-between flex-col gap-4">
                            <span class="font-bold text-lg">{{
                                $t("reservation.search.reservation")
                            }}</span>
                            <div class="grid grid-cols-9 gap-2">
                                <InputText
                                    v-model="keyword"
                                    :placeholder="
                                        $t(
                                            'reservation.search.placeholder.keyword',
                                        )
                                    "
                                    size="small"
                                    class="sm:col-span-3 md:col-span-2 col-span-9"
                                    fluid
                                ></InputText>
                                <Select
                                    showClear
                                    v-model="room"
                                    :placeholder="
                                        $t(
                                            'reservation.search.placeholder.room',
                                        )
                                    "
                                    optionLabel="name"
                                    optionValue="id"
                                    :options="roomData?.data"
                                    size="small"
                                    class="sm:col-span-3 md:col-span-2 col-span-9"
                                    fluid
                                >
                                </Select>
                                <Select
                                    showClear
                                    v-model="status"
                                    :placeholder="
                                        $t(
                                            'reservation.search.placeholder.status',
                                        )
                                    "
                                    :options="statusOptions"
                                    optionLabel="name"
                                    optionValue="id"
                                    size="small"
                                    class="sm:col-span-3 md:col-span-2 col-span-9"
                                    fluid
                                >
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value">
                                            <Tag
                                                :value="
                                                    getStatusOption(
                                                        slotProps.value,
                                                    )?.name
                                                "
                                                :severity="
                                                    getStatusOption(
                                                        slotProps.value,
                                                    )?.severity
                                                "
                                                class="h-5 text-xs!"
                                            ></Tag>
                                        </div>
                                    </template>
                                    <template #option="slotProps">
                                        <div class="flex flex-col">
                                            <Tag
                                                :value="slotProps.option.name"
                                                :severity="
                                                    slotProps.option.severity
                                                "
                                                class="h-5 text-xs!"
                                            ></Tag>
                                        </div>
                                    </template>
                                </Select>
                                <DatePicker
                                    showClear
                                    v-model="time"
                                    selectionMode="range"
                                    :placeholder="
                                        $t(
                                            'reservation.search.placeholder.time',
                                        )
                                    "
                                    size="small"
                                    class="md:col-span-3 col-span-9"
                                    :manualInput="false"
                                    fluid
                                    dateFormat="yy/mm/dd"
                                >
                                    <template #footer>
                                        <span
                                            class="text-sm flex justify-center mt-4"
                                            >{{
                                                $t(
                                                    "reservation.search.selectTwoDate",
                                                )
                                            }}</span
                                        >
                                    </template>
                                </DatePicker>
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <p class="py-1">
                            {{ $t("reservation.search.noReservation") }}
                        </p>
                    </template>
                    <Column
                        field="id"
                        :header="$t('reservation.search.table.id')"
                    ></Column>
                    <Column
                        field="studentName"
                        :header="$t('reservation.search.table.studentName')"
                    ></Column>
                    <Column
                        field="email"
                        :header="$t('reservation.search.table.email')"
                    >
                        <template #body="slotProps">
                            <a
                                :href="`mailto:${slotProps.data.email}`"
                                class="transition-colors duration-300 hover:text-sky-500"
                                >{{ slotProps.data.email }}
                                <SquareArrowOutUpRight
                                    class="inline"
                                ></SquareArrowOutUpRight
                            ></a>
                        </template>
                    </Column>
                    <Column
                        field="className"
                        :header="$t('reservation.search.table.class')"
                    ></Column>
                    <Column
                        field="roomName"
                        :header="$t('reservation.search.table.room')"
                    ></Column>
                    <Column
                        field="startTime"
                        :header="$t('reservation.search.table.startTime')"
                    >
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.startTime)) }}
                        </template>
                    </Column>
                    <Column
                        field="endTime"
                        :header="$t('reservation.search.table.endTime')"
                    >
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.endTime)) }}
                        </template>
                    </Column>
                    <Column
                        field="reason"
                        :header="$t('reservation.search.table.reason')"
                    ></Column>
                    <Column
                        field="status"
                        :header="$t('reservation.search.table.status')"
                    >
                        <template #body="slotProps">
                            <Tag
                                :value="statusMapping[slotProps.data.status]"
                                :severity="
                                    severityMapping[slotProps.data.status]
                                "
                            ></Tag>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
        <div class="w-full mt-8">
            <h3 class="font-bold text-lg mb-4">Featured Advertisements</h3>
            <AdCarousel :count="2" />
        </div>
    </div>
</template>
