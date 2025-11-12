<script setup lang="ts">
import type { ChartConfiguration, TooltipItem } from "chart.js";
import { computed } from "vue";
import { useRequest } from "vue-request";
import { getWeeklyAnalytics } from "../../../../api";

const { data: weeklyAnalytics } = useRequest(getWeeklyAnalytics);

const weeklyRoomChartData = computed(() => setWeeklyRoomChartData());
const weeklyRoomChartOptions = computed(() => setWeeklyRoomChartOptions());
const weeklyReasonChartData = computed(() => setWeeklyReasonChartData());
const weeklyReasonChartOptions = computed(() => setWeeklyReasonChartOptions());
const weeklyHourlyReservationsChartData = computed(() =>
    setWeeklyHourlyReservationsChartData(),
);
const weeklyHourlyReservationsChartOptions = computed(() =>
    setWeeklyHourlyReservationsChartOptions(),
);
const weeklyDailyReservationsChartData = computed(() =>
    setWeeklyDailyReservationsChartData(),
);
const weeklyDailyReservationsChartOptions = computed(() =>
    setWeeklyDailyReservationsChartOptions(),
);
const weeklyDailyReservationCreationsChartData = computed(() =>
    setWeeklyDailyReservationCreationsChartData(),
);
const weeklyDailyReservationCreationsChartOptions = computed(() =>
    setWeeklyDailyReservationCreationsChartOptions(),
);

const setWeeklyRoomChartData = (): ChartConfiguration<"bar">["data"] => {
    if (!weeklyAnalytics.value) {
        return { labels: [], datasets: [] };
    }
    const labels = weeklyAnalytics.value.data.rooms.map(
        (room) => room.roomName,
    );
    return {
        labels,
        datasets: [
            {
                label: "Reservations",
                backgroundColor: "rgba(59, 130, 246, 1)",
                data: weeklyAnalytics.value.data.rooms.map(
                    (room) => room.reservations,
                ),
                borderRadius: 5,
            },
            {
                label: "Reservation Creations",
                backgroundColor: "rgba(16, 185, 129, 1)",
                data: weeklyAnalytics.value.data.rooms.map(
                    (room) => room.reservationCreations,
                ),
                borderRadius: 5,
            },
        ],
    };
};

const setWeeklyRoomChartOptions = (): ChartConfiguration<"bar">["options"] => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--color-surface-900");
    const textColorSecondary = documentStyle.getPropertyValue(
        "--color-surface-500",
    );
    const surfaceBorder = documentStyle.getPropertyValue("--color-surface-200");
    return {
        indexAxis: "y",
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

const setWeeklyReasonChartData =
    (): ChartConfiguration<"wordCloud">["data"] => {
        if (!weeklyAnalytics.value) {
            return { labels: [], datasets: [] };
        }
        const labels = weeklyAnalytics.value.data.reasons.map(
            (reason) => reason.word,
        );
        return {
            labels,
            datasets: [
                {
                    label: "",
                    data: weeklyAnalytics.value.data.reasons.map(
                        (reason) => reason.count * 10 + 10,
                    ),
                },
            ],
        };
    };

const setWeeklyReasonChartOptions =
    (): ChartConfiguration<"wordCloud">["options"] => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue(
            "--color-surface-500",
        );
        return {
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            return `${(context.raw - 10) / 10}`;
                        },
                    },
                },
            },
            elements: {
                word: {
                    color: textColorSecondary,
                },
            },
        };
    };

const setWeeklyHourlyReservationsChartData =
    (): ChartConfiguration<"bar">["data"] => {
        if (!weeklyAnalytics.value) {
            return { labels: [], datasets: [] };
        }
        const labels = Array.from({ length: 24 }, (_, i) => {
            const hour = i.toString().padStart(2, "0");
            return `${hour}:00`;
        });
        return {
            labels,
            datasets: [
                {
                    label: "Reservations",
                    backgroundColor: "rgba(203, 68, 68, 1)",
                    data: weeklyAnalytics.value.data.hourlyReservations,
                    borderRadius: 5,
                },
            ],
        };
    };

const setWeeklyHourlyReservationsChartOptions =
    (): ChartConfiguration<"bar">["options"] => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue("--color-surface-900");
        const textColorSecondary = documentStyle.getPropertyValue(
            "--color-surface-500",
        );
        const surfaceBorder = documentStyle.getPropertyValue(
            "--color-surface-200",
        );
        return {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        useBorderRadius: true,
                        borderRadius: 3,
                    },
                },
                tooltip: {
                    callbacks: {
                        title: (context: TooltipItem<"bar">[]) => {
                            return `${context[0].dataIndex
                                .toString()
                                .padStart(2, "0")}:00 - ${(
                                context[0].dataIndex + 1
                            )
                                .toString()
                                .padStart(2, "0")}:00`;
                        },
                    },
                },
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

const setWeeklyDailyReservationsChartData =
    (): ChartConfiguration<"line">["data"] => {
        if (!weeklyAnalytics.value) {
            return { labels: [], datasets: [] };
        }
        const labels = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            const dayOfWeek = date.getDay();
            const daysToLastMonday = dayOfWeek === 0 ? 13 : dayOfWeek + 6;
            date.setDate(date.getDate() - daysToLastMonday + i);
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
            return `${monthNameMapping[date.getMonth()]} ${date.getDate()}`;
        });
        return {
            labels,
            datasets: [
                {
                    label: "Reservations",
                    backgroundColor: "rgba(59, 130, 246, 0.5)",
                    borderColor: "rgba(59, 130, 246, 1)",
                    data: weeklyAnalytics.value.data.dailyReservations,
                    tension: 0.4,
                },
            ],
        };
    };

const setWeeklyDailyReservationsChartOptions =
    (): ChartConfiguration<"line">["options"] => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue("--color-surface-900");
        const textColorSecondary = documentStyle.getPropertyValue(
            "--color-surface-500",
        );
        const surfaceBorder = documentStyle.getPropertyValue(
            "--color-surface-200",
        );
        return {
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

const setWeeklyDailyReservationCreationsChartData =
    (): ChartConfiguration<"line">["data"] => {
        if (!weeklyAnalytics.value) {
            return { labels: [], datasets: [] };
        }
        const labels = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            const dayOfWeek = date.getDay();
            const daysToLastMonday = dayOfWeek === 0 ? 13 : dayOfWeek + 6;
            date.setDate(date.getDate() - daysToLastMonday + i);
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
            return `${monthNameMapping[date.getMonth()]} ${date.getDate()}`;
        });
        return {
            labels,
            datasets: [
                {
                    label: "Reservation Creations",
                    backgroundColor: "rgba(16, 185, 129, 0.5)",
                    borderColor: "rgba(16, 185, 129, 1)",
                    data: weeklyAnalytics.value.data.dailyReservationCreations,
                    tension: 0.4,
                },
            ],
        };
    };

const setWeeklyDailyReservationCreationsChartOptions =
    (): ChartConfiguration<"line">["options"] => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue("--color-surface-900");
        const textColorSecondary = documentStyle.getPropertyValue(
            "--color-surface-500",
        );
        const surfaceBorder = documentStyle.getPropertyValue(
            "--color-surface-200",
        );
        return {
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
            {{ $t("reservation.analytic.weekly.title") }}
        </h1>
        <div class="grid grid-cols-4 gap-4">
            <Card class="col-span-2">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">{{ $t("reservation.analytic.weekly.reservation") }}</h3>
                    <p class="text-2xl font-bold">
                        {{ weeklyAnalytics?.data.totalReservations || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="col-span-2">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">{{ $t("reservation.analytic.weekly.approval") }}</h3>
                    <p class="text-2xl font-bold">
                        {{ weeklyAnalytics?.data.totalApprovals || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="col-span-2">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">{{ $t("reservation.analytic.weekly.rejection") }}</h3>
                    <p class="text-2xl font-bold">
                        {{ weeklyAnalytics?.data.totalRejections || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="col-span-2">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        {{ $t("reservation.analytic.weekly.creation") }}
                    </h3>
                    <p class="text-2xl font-bold">
                        {{
                            weeklyAnalytics?.data.totalReservationCreations ||
                            "-"
                        }}
                    </p>
                </template>
            </Card>
            <Card class="col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">{{ $t("reservation.analytic.weekly.reason") }}</h3>
                    <Chart
                        type="wordCloud"
                        :data="weeklyReasonChartData"
                        :options="weeklyReasonChartOptions"
                        :height="590"
                    ></Chart>
                </template>
            </Card>
            <Card class="col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">{{ $t("reservation.analytic.weekly.hourlyReservation") }}</h3>
                    <Chart
                        type="bar"
                        :data="weeklyHourlyReservationsChartData"
                        :options="weeklyHourlyReservationsChartOptions"
                        :height="260"
                    ></Chart>
                </template>
            </Card>
            <Card class="col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">{{ $t("reservation.analytic.weekly.dailyReservation") }}</h3>
                    <Chart
                        type="line"
                        :data="weeklyDailyReservationsChartData"
                        :options="weeklyDailyReservationsChartOptions"
                        :height="260"
                    ></Chart>
                </template>
            </Card>
            <Card class="col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        {{ $t("reservation.analytic.weekly.dailyCreation") }}
                    </h3>
                    <Chart
                        type="line"
                        :data="weeklyDailyReservationCreationsChartData"
                        :options="weeklyDailyReservationCreationsChartOptions"
                        :height="260"
                    ></Chart>
                </template>
            </Card>
            <Card class="col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        {{ $t("reservation.analytic.weekly.topRoom") }}
                    </h3>
                    <div
                        :style="{
                            height:
                                (weeklyAnalytics?.data.rooms.length || 0) * 50 +
                                20 +
                                'px',
                        }"
                    >
                        <Chart
                            type="bar"
                            :data="weeklyRoomChartData"
                            :options="weeklyRoomChartOptions"
                            class="h-full"
                        ></Chart>
                    </div>
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
