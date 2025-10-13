<script setup lang="ts">
import { useRequest } from "vue-request";
import { getRooms, getReservations } from "../../api";
import { ref, computed } from "vue";
import Navbar from "../../components/Navbar.vue";
import LoadingMask from "../../components/LoadingMask.vue";
import { SquareArrowOutUpRight } from "lucide-vue-next";

const keyword = ref<string | null>(null);
const status = ref<{ id: string; name: string; severity: string } | null>(null);
const room = ref<number | null>(null);
const time = ref<Date[] | null>(null);
const pageOffset = ref(0);
const page = computed(() => Math.floor(pageOffset.value / 20));

const { data: reservations, loading: reservationsLoading } = useRequest(
    () =>
        getReservations(
            keyword.value,
            room.value,
            status.value?.id,
            page.value,
            time.value ? time.value[0] : null,
            time.value ? time.value[1] : null,
        ),
    {
        refreshDeps: [keyword, room, status, page, time],
        debounceInterval: 300,
    },
);

const { data: rooms } = useRequest(() => getRooms());

const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ${String(date.getHours()).padStart(
        2,
        "0",
    )}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const statusMapping: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
};
const severityMapping: Record<string, string> = {
    pending: "info",
    approved: "success",
    rejected: "danger",
};
const statusOptions = [
    { id: "pending", name: "Pending", severity: "info" },
    { id: "approved", name: "Approved", severity: "success" },
    { id: "rejected", name: "Rejected", severity: "danger" },
];
</script>
<template>
    <LoadingMask></LoadingMask>
    <Navbar></Navbar>
    <div class="mt-[6rem] mb-4 md:mx-[3rem] 2xl:mx-[8rem] mx-4">
        <h1 class="font-bold md:text-3xl text-2xl my-4">Reservation Search</h1>
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
                            <span class="font-bold text-lg">Reservations</span>
                            <div class="grid grid-cols-9 gap-2">
                                <InputText
                                    v-model="keyword"
                                    placeholder="Keyword"
                                    size="small"
                                    class="sm:col-span-3 md:col-span-2 col-span-9"
                                    fluid
                                ></InputText>
                                <Select
                                    showClear
                                    v-model="room"
                                    placeholder="Room"
                                    optionLabel="name"
                                    optionValue="id"
                                    :options="rooms?.data"
                                    size="small"
                                    class="sm:col-span-3 md:col-span-2 col-span-9"
                                    fluid
                                >
                                </Select>
                                <Select
                                    showClear
                                    v-model="status"
                                    placeholder="Status"
                                    :options="statusOptions"
                                    size="small"
                                    class="sm:col-span-3 md:col-span-2 col-span-9"
                                    fluid
                                >
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value">
                                            <Tag
                                                :value="slotProps.value.name"
                                                :severity="
                                                    slotProps.value.severity
                                                "
                                                class="h-5 !text-xs"
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
                                                class="h-5 !text-xs"
                                            ></Tag>
                                        </div>
                                    </template>
                                </Select>
                                <DatePicker
                                    showClear
                                    v-model="time"
                                    selectionMode="range"
                                    placeholder="Time Range"
                                    size="small"
                                    class="md:col-span-3 col-span-9"
                                    updateModelType="date"
                                    fluid
                                    showTime
                                    dateFormat="yy/mm/dd"
                                >
                                    <template #footer>
                                        <span
                                            class="text-sm flex justify-center mt-4"
                                            >*Select two time</span
                                        >
                                    </template>
                                </DatePicker>
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <p class="py-1">No available reservations.</p>
                    </template>
                    <Column field="id" header="ID"></Column>
                    <Column field="studentName" header="Student Name"></Column>
                    <Column field="email" header="E-mail">
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
                    <Column field="className" header="Class"></Column>
                    <Column field="roomName" header="Room"></Column>
                    <Column field="startTime" header="Start Time">
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.startTime)) }}
                        </template>
                    </Column>
                    <Column field="endTime" header="End Time">
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.endTime)) }}
                        </template>
                    </Column>
                    <Column field="reason" header="Reason"></Column>
                    <Column field="status" header="Status">
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
    </div>
</template>
