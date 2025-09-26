<script setup lang="ts">
import LoadingMask from '../../components/LoadingMask.vue';
import Navbar from '../../components/Navbar.vue';
import { useRequest } from 'vue-request';
import { getGeneralAnalytics, type Analytics } from '../../api';
import { computed, watch } from 'vue';
import { ref } from 'vue';

const isDark = ref(false);
const { data: generalAnalyticsData } = useRequest(getGeneralAnalytics, {
    pollingInterval: 60000,
});
const generalAnalytics = computed<Analytics>(() => generalAnalyticsData.value?.data || null);
const generalDailyChartData = ref<any>(null);
const generalWeeklyChartData = ref<any>(null);
const generalMonthlyChartData = ref<any>(null);
const generalDailyRequestChartData = ref<any>(null);
const generalChartOptions = computed(() => setGeneralChartOptions());

const setGeneralDailyChartData = () => {
    if (!generalAnalytics.value) {
        return {
            labels: [],
            datasets: [],
        };
    }
    const getDate = (daysAgo: number): string => {
        const monthNameMapping = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return `${monthNameMapping[date.getMonth()]} ${date.getDate()}`;
    };
    const labels = Array.from({ length: 30 }, (_, i) => getDate(29 - i));
    return {
        labels,
        datasets: [
            {
                label: "Reservations",
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgba(59, 130, 246, 1)",
                data: generalAnalytics.value.daily.reservations,
                tension: 0.4,
            },
            {
                label: "Reservation Creations",
                backgroundColor: "rgba(16, 185, 129, 0.5)",
                borderColor: "rgba(16, 185, 129, 1)",
                data: generalAnalytics.value.daily.reservationCreations,
                tension: 0.4,
            },
            {
                label: "Reservation Approvals",
                backgroundColor: "rgba(234, 179, 8, 0.5)",
                borderColor: "rgba(234, 179, 8, 1)",
                data: generalAnalytics.value.daily.approvals,
                tension: 0.4,
            },
            {
                label: "Reservation Rejections",
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                borderColor: "rgba(239, 68, 68, 1)",
                data: generalAnalytics.value.daily.rejections,
                tension: 0.4,
            },
        ],
    };
};

const setGeneralWeeklyChartData = () => {
    if (!generalAnalytics.value) {
        return {
            labels: [],
            datasets: [],
        };
    }
    const getDate = (daysAgo: number): string => {
        const monthNameMapping = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return `${monthNameMapping[date.getMonth()]} ${date.getDate()}`;
    };
    const labels = Array.from({ length: 7 }, (_, i) => getDate(6 - i));
    return {
        labels,
        datasets: [
            {
                label: "Reservations",
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgba(59, 130, 246, 1)",
                data: generalAnalytics.value.weekly.reservations,
                tension: 0.4,
            },
            {
                label: "Reservation Creations",
                backgroundColor: "rgba(16, 185, 129, 0.5)",
                borderColor: "rgba(16, 185, 129, 1)",
                data: generalAnalytics.value.weekly.reservationCreations,
                tension: 0.4,
            },
            {
                label: "Reservation Approvals",
                backgroundColor: "rgba(234, 179, 8, 0.5)",
                borderColor: "rgba(234, 179, 8, 1)",
                data: generalAnalytics.value.weekly.approvals,
                tension: 0.4,
            },
            {
                label: "Reservation Rejections",
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                borderColor: "rgba(239, 68, 68, 1)",
                data: generalAnalytics.value.weekly.rejections,
                tension: 0.4,
            },
        ],
    };
};

const setGeneralMonthlyChartData = () => {
    if (!generalAnalytics.value) {
        return {
            labels: [],
            datasets: [],
        };
    }
    const getMonth = (monthsAgo: number): string => {
        const monthNameMapping = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);
        return `${monthNameMapping[date.getMonth()]} ${date.getFullYear()}`;
    };
    const labels = Array.from({ length: 12 }, (_, i) => getMonth(11 - i));
    return {
        labels,
        datasets: [
            {
                label: "Reservations",
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgba(59, 130, 246, 1)",
                data: generalAnalytics.value.monthly.reservations,
                tension: 0.4,
            },
            {
                label: "Reservation Creations",
                backgroundColor: "rgba(16, 185, 129, 0.5)",
                borderColor: "rgba(16, 185, 129, 1)",
                data: generalAnalytics.value.monthly.reservationCreations,
                tension: 0.4,
            },
            {
                label: "Reservation Approvals",
                backgroundColor: "rgba(234, 179, 8, 0.5)",
                borderColor: "rgba(234, 179, 8, 1)",
                data: generalAnalytics.value.monthly.approvals,
                tension: 0.4,
            },
            {
                label: "Reservation Rejections",
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                borderColor: "rgba(239, 68, 68, 1)",
                data: generalAnalytics.value.monthly.rejections,
                tension: 0.4,
            },
        ],
    };
};

const setGeneralDailyRequestChartData = () => {
    if (!generalAnalytics.value) {
        return {
            labels: [],
            datasets: [],
        };
    }
    const getDate = (daysAgo: number): string => {
        const monthNameMapping = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return `${monthNameMapping[date.getMonth()]} ${date.getDate()}`;
    };
    const labels = Array.from({ length: 30 }, (_, i) => getDate(29 - i));
    return {
        labels,
        datasets: [
            {
                label: "Requests",
                backgroundColor: "rgba(239, 200, 68, 1)",
                data: generalAnalytics.value.daily.requests,
            },
        ],
    };
};

const setGeneralChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = isDark.value
        ? documentStyle.getPropertyValue("--color-surface-300")
        : documentStyle.getPropertyValue("--color-surface-900");
    const textColorSecondary = isDark.value
        ? documentStyle.getPropertyValue("--color-surface-200")
        : documentStyle.getPropertyValue("--color-surface-500");
    const surfaceBorder = isDark.value
        ? documentStyle.getPropertyValue("--color-surface-700")
        : documentStyle.getPropertyValue("--color-surface-200");
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                },
            },
        },
        interaction: {
            mode: "index",
            intersect: false,
        },
        scales: {
            x: {
                offset: true,
                ticks: {
                    color: textColorSecondary,
                },
                grid: {
                    color: surfaceBorder,
                },
            },
            y: {
                ticks: {
                    color: textColorSecondary,
                },
                grid: {
                    color: surfaceBorder,
                },
            },
        },
    };
};

watch(
    generalAnalytics,
    () => {
        if (!generalAnalytics.value) return;
        if (!generalDailyChartData.value) generalDailyChartData.value = setGeneralDailyChartData();
        else {
            for (let i = 0; i < 30; i++) {
                generalDailyChartData.value.labels[i] = setGeneralDailyChartData().labels[i];
                generalDailyChartData.value.datasets[0].data[i] =
                    setGeneralDailyChartData().datasets[0].data[i];
                generalDailyChartData.value.datasets[1].data[i] =
                    setGeneralDailyChartData().datasets[1].data[i];
                generalDailyChartData.value.datasets[2].data[i] =
                    setGeneralDailyChartData().datasets[2].data[i];
                generalDailyChartData.value.datasets[3].data[i] =
                    setGeneralDailyChartData().datasets[3].data[i];
            }
        }
        if (!generalWeeklyChartData.value)
            generalWeeklyChartData.value = setGeneralWeeklyChartData();
        else {
            for (let i = 0; i < 7; i++) {
                generalWeeklyChartData.value.labels[i] =
                    setGeneralWeeklyChartData().labels[i];
                generalWeeklyChartData.value.datasets[0].data[i] =
                    setGeneralWeeklyChartData().datasets[0].data[i];
                generalWeeklyChartData.value.datasets[1].data[i] =
                    setGeneralWeeklyChartData().datasets[1].data[i];
                generalWeeklyChartData.value.datasets[2].data[i] =
                    setGeneralWeeklyChartData().datasets[2].data[i];
                generalWeeklyChartData.value.datasets[3].data[i] =
                    setGeneralWeeklyChartData().datasets[3].data[i];
            }
        }
        if (!generalMonthlyChartData.value)
            generalMonthlyChartData.value = setGeneralMonthlyChartData();
        else {
            for (let i = 0; i < 12; i++) {
                generalMonthlyChartData.value.labels[i] =
                    setGeneralMonthlyChartData().labels[i];
                generalMonthlyChartData.value.datasets[0].data[i] =
                    setGeneralMonthlyChartData().datasets[0].data[i];
                generalMonthlyChartData.value.datasets[1].data[i] =
                    setGeneralMonthlyChartData().datasets[1].data[i];
                generalMonthlyChartData.value.datasets[2].data[i] =
                    setGeneralMonthlyChartData().datasets[2].data[i];
                generalMonthlyChartData.value.datasets[3].data[i] =
                    setGeneralMonthlyChartData().datasets[3].data[i];
            }
        }
        if (!generalDailyRequestChartData.value)
            generalDailyRequestChartData.value = setGeneralDailyRequestChartData();
        else {
            for (let i = 0; i < 30; i++) {
                generalDailyRequestChartData.value.labels[i] =
                    setGeneralDailyRequestChartData().labels[i];
                generalDailyRequestChartData.value.datasets[0].data[i] =
                    setGeneralDailyRequestChartData().datasets[0].data[i];
            }
        }
    },
    { immediate: true },
);
</script>

<template>
    <Navbar v-model:isDark="isDark"></Navbar>
    <LoadingMask></LoadingMask>
    <div class="mt-[6rem] mb-4 md:mx-[3rem] 2xl:mx-[8rem] mx-4">
        <h1 class="font-bold md:text-3xl text-2xl my-4">Reservation Analytics</h1>
        <h2 class="text-xl font-bold mt-8 mb-3">Overview</h2>
        <div class="grid grid-cols-4 gap-4">
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Reservations (Today)</h3>
                    <p class="text-2xl font-bold">
                        {{ generalAnalytics?.today.reservations || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Approvals (Today)</h3>
                    <p class="text-2xl font-bold">
                        {{ generalAnalytics?.today.approvals || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Rejections (Today)</h3>
                    <p class="text-2xl font-bold">
                        {{ generalAnalytics?.today.rejections || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        Reservation Creations (Today)
                    </h3>
                    <p class="text-2xl font-bold">
                        {{ generalAnalytics?.today.reservationCreations || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Weekly (Last 7 Days)</h3>
                    <Chart
                        type="line"
                        :data="generalWeeklyChartData"
                        :options="generalChartOptions"
                        :height="300"
                    ></Chart>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Daily (Last 30 Days)</h3>
                    <Chart
                        type="line"
                        :data="generalDailyChartData"
                        :options="generalChartOptions"
                        :height="300"
                    ></Chart>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        Monthly (Last 1 Year)
                    </h3>
                    <Chart
                        type="line"
                        :data="generalMonthlyChartData"
                        :options="generalChartOptions"
                        :height="300"
                    ></Chart>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        Daily Requests (Last 30 Days)
                    </h3>
                    <Chart
                        type="bar"
                        :data="generalDailyRequestChartData"
                        :options="generalChartOptions"
                        :height="300"
                    ></Chart>
                </template>
            </Card>
        </div>
    </div>
</template>