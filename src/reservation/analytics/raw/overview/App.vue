<script setup lang="ts">
import { useRequest } from "vue-request";
import { getOverviewAnalytics, type OverviewAnalytics } from "../../../../api";
import { computed } from "vue";
import type { ChartConfiguration } from "chart.js";

const { data: overviewAnalyticsData } = useRequest(getOverviewAnalytics);
const overviewAnalytics = computed<OverviewAnalytics | null>(
    () => overviewAnalyticsData.value?.data || null,
);
const overviewDailyChartData = computed(() => setOverviewDailyChartData());
const overviewWeeklyChartData = computed(() => setOverviewWeeklyChartData());
const overviewMonthlyChartData = computed(() => setOverviewMonthlyChartData());
const overviewDailyRequestChartData = computed(() =>
    setOverviewDailyRequestChartData(),
);
const overviewChartOptions = computed(() => setOverviewChartOptions());

const setOverviewDailyChartData = (): ChartConfiguration<"line">["data"] => {
    if (!overviewAnalytics.value) {
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
                data: overviewAnalytics.value.daily.reservations,
                tension: 0.4,
            },
            {
                label: "Reservation Creations",
                backgroundColor: "rgba(16, 185, 129, 0.5)",
                borderColor: "rgba(16, 185, 129, 1)",
                data: overviewAnalytics.value.daily.reservationCreations,
                tension: 0.4,
            },
            {
                label: "Reservation Approvals",
                backgroundColor: "rgba(234, 179, 8, 0.5)",
                borderColor: "rgba(234, 179, 8, 1)",
                data: overviewAnalytics.value.daily.approvals,
                tension: 0.4,
            },
            {
                label: "Reservation Rejections",
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                borderColor: "rgba(239, 68, 68, 1)",
                data: overviewAnalytics.value.daily.rejections,
                tension: 0.4,
            },
        ],
    };
};

const setOverviewWeeklyChartData = (): ChartConfiguration<"line">["data"] => {
    if (!overviewAnalytics.value) {
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
                data: overviewAnalytics.value.weekly.reservations,
                tension: 0.4,
            },
            {
                label: "Reservation Creations",
                backgroundColor: "rgba(16, 185, 129, 0.5)",
                borderColor: "rgba(16, 185, 129, 1)",
                data: overviewAnalytics.value.weekly.reservationCreations,
                tension: 0.4,
            },
            {
                label: "Reservation Approvals",
                backgroundColor: "rgba(234, 179, 8, 0.5)",
                borderColor: "rgba(234, 179, 8, 1)",
                data: overviewAnalytics.value.weekly.approvals,
                tension: 0.4,
            },
            {
                label: "Reservation Rejections",
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                borderColor: "rgba(239, 68, 68, 1)",
                data: overviewAnalytics.value.weekly.rejections,
                tension: 0.4,
            },
        ],
    };
};

const setOverviewMonthlyChartData = (): ChartConfiguration<"line">["data"] => {
    if (!overviewAnalytics.value) {
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
                data: overviewAnalytics.value.monthly.reservations,
                tension: 0.4,
            },
            {
                label: "Reservation Creations",
                backgroundColor: "rgba(16, 185, 129, 0.5)",
                borderColor: "rgba(16, 185, 129, 1)",
                data: overviewAnalytics.value.monthly.reservationCreations,
                tension: 0.4,
            },
            {
                label: "Reservation Approvals",
                backgroundColor: "rgba(234, 179, 8, 0.5)",
                borderColor: "rgba(234, 179, 8, 1)",
                data: overviewAnalytics.value.monthly.approvals,
                tension: 0.4,
            },
            {
                label: "Reservation Rejections",
                backgroundColor: "rgba(239, 68, 68, 0.5)",
                borderColor: "rgba(239, 68, 68, 1)",
                data: overviewAnalytics.value.monthly.rejections,
                tension: 0.4,
            },
        ],
    };
};

const setOverviewDailyRequestChartData =
    (): ChartConfiguration<"bar">["data"] => {
        if (!overviewAnalytics.value) {
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
                    data: overviewAnalytics.value.daily.requests,
                    borderRadius: 5,
                },
            ],
        };
    };

const setOverviewChartOptions = ():
    | ChartConfiguration<"line">["options"]
    | ChartConfiguration<"bar">["options"] => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--color-surface-900");
    const textColorSecondary = documentStyle.getPropertyValue(
        "--color-surface-500",
    );
    const surfaceBorder = documentStyle.getPropertyValue("--color-surface-200");
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    useBorderRadius: true,
                    borderRadius: 3,
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
                border: {
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
                border: {
                    color: surfaceBorder,
                },
            },
        },
    };
};
</script>

<template>
    <div class="mx-[3rem] my-[2rem]">
        <h1 class="font-bold text-xl text-sky-500">HFI Utility Center</h1>
        <h1 class="font-bold text-3xl my-4">
            Reservation Analytics - Overview
        </h1>
        <div class="grid grid-cols-4 gap-4">
            <Card class="col-span-2">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Reservations (Today)</h3>
                    <p class="text-2xl font-bold">
                        {{ overviewAnalytics?.today.reservations || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="col-span-2">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Approvals (Today)</h3>
                    <p class="text-2xl font-bold">
                        {{ overviewAnalytics?.today.approvals || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="col-span-2">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Rejections (Today)</h3>
                    <p class="text-2xl font-bold">
                        {{ overviewAnalytics?.today.rejections || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="col-span-2">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        Reservation Creations (Today)
                    </h3>
                    <p class="text-2xl font-bold">
                        {{
                            overviewAnalytics?.today.reservationCreations || "-"
                        }}
                    </p>
                </template>
            </Card>
            <Card class="col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Weekly (Last 7 Days)</h3>
                    <Chart
                        type="line"
                        :data="overviewWeeklyChartData"
                        :options="overviewChartOptions"
                        :height="250"
                    ></Chart>
                </template>
            </Card>
            <Card class="col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Daily (Last 30 Days)</h3>
                    <Chart
                        type="line"
                        :data="overviewDailyChartData"
                        :options="overviewChartOptions"
                        :height="250"
                    ></Chart>
                </template>
            </Card>
            <Card class="col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        Monthly (Last 1 Year)
                    </h3>
                    <Chart
                        type="line"
                        :data="overviewMonthlyChartData"
                        :options="overviewChartOptions"
                        :height="250"
                    ></Chart>
                </template>
            </Card>
            <Card class="col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        Daily Requests (Last 30 Days)
                    </h3>
                    <Chart
                        type="bar"
                        :data="overviewDailyRequestChartData"
                        :options="overviewChartOptions"
                        :height="250"
                    ></Chart>
                </template>
            </Card>
        </div>
    </div>
</template>

<style lang="css" scoped>
.p-card,
.p-card .p-card-body {
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 1px solid var(--color-surface-200) !important;
}
</style>
