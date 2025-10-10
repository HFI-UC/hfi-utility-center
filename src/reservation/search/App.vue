<script setup lang="ts">
import { useRequest } from "vue-request";
import { getRooms, postFetchReservations } from "../../api";
import { ref } from "vue";
import Navbar from "../../components/Navbar.vue";
import LoadingMask from "../../components/LoadingMask.vue";

const keyword = ref<string | null>(null);
const status = ref<string | null>(null);
const room = ref<number | null>(null);

const { data: reservations, loading: reservationsLoading } = useRequest(
    () => postFetchReservations(keyword.value, room.value, status.value),
    {
        refreshDeps: [keyword, room, status],
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
    { id: "pending", name: "Pending" },
    { id: "approved", name: "Approved" },
    { id: "rejected", name: "Rejected" },
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
                    :value="reservations?.data"
                    :loading="reservationsLoading"
                    :rows="10"
                    class="text-nowrap"
                    removableSort
                >
                    <template #header>
                        <div
                            class="flex justify-between lg:flex-row flex-col gap-4"
                        >
                            <span class="font-bold text-lg">Reservations</span>
                            <div class="flex gap-2 sm:flex-row flex-col">
                                <InputText
                                    v-model="keyword"
                                    placeholder="Keyword"
                                    size="small"
                                    class="lg:!w-[13rem] !w-full"
                                ></InputText>
                                <Select
                                    showClear
                                    v-model="room"
                                    placeholder="Room"
                                    optionLabel="name"
                                    optionValue="id"
                                    :options="rooms?.data"
                                    size="small"
                                    class="lg:!w-[13rem] !w-full"
                                >
                                </Select>
                                <Select
                                    showClear
                                    v-model="status"
                                    placeholder="Status"
                                    optionLabel="name"
                                    optionValue="id"
                                    :options="statusOptions"
                                    size="small"
                                    class="lg:!w-[13rem] !w-full"
                                >
                                </Select>
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <p class="py-1">No available reservations.</p>
                    </template>
                    <Column field="id" header="ID" sortable></Column>
                    <Column
                        field="studentName"
                        header="Student Name"
                        sortable
                    ></Column>
                    <Column field="email" header="E-mail" sortable>
                        <template #body="slotProps">
                            <a
                                :href="`mailto:${slotProps.data.email}`"
                                class="transition-colors duration-300 hover:text-surface-500"
                                >{{ slotProps.data.email }}
                                <SquareArrowOutUpRight
                                    class="inline"
                                ></SquareArrowOutUpRight
                            ></a>
                        </template>
                    </Column>
                    <Column field="className" header="Class" sortable></Column>
                    <Column field="roomName" header="Room" sortable></Column>
                    <Column field="startTime" header="Start Time" sortable>
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.startTime)) }}
                        </template>
                    </Column>
                    <Column field="endTime" header="End Time" sortable>
                        <template #body="slotProps">
                            {{ formatTime(new Date(slotProps.data.endTime)) }}
                        </template>
                    </Column>
                    <Column field="reason" header="Reason"></Column>
                    <Column field="status" header="Status" sortable>
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
