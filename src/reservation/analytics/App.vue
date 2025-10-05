<script setup lang="ts">
import LoadingMask from "../../components/LoadingMask.vue";
import Navbar from "../../components/Navbar.vue";
import { useRequest } from "vue-request";
import {
    getExportOverviewReservationsAnalytics,
    getExportWeeklyReservationsAnalytics,
    getOverviewAnalytics,
    getWeeklyAnalytics,
    type OverviewAnalytics,
} from "../../api";
import { computed } from "vue";
import { ref } from "vue";
import VueTurnstile from "vue-turnstile";
import { Download, X } from "lucide-vue-next";
import type { ChartConfiguration, TooltipItem } from "chart.js";
import Chart from "primevue/chart";

const isDark = ref(false);
const { data: overviewAnalyticsData } = useRequest(getOverviewAnalytics, {
    pollingInterval: 60000,
});
const turnstileSiteKey = process.env.CLOUDFLARE_KEY || "";
const turnstileToken = ref("");
const turnstileRef = ref();
const overviewAnalytics = computed<OverviewAnalytics | null>(
    () => overviewAnalyticsData.value?.data || null
);

const overviewDailyChartData = computed(() => setOverviewDailyChartData());
const overviewWeeklyChartData = computed(() => setOverviewWeeklyChartData());
const overviewMonthlyChartData = computed(() => setOverviewMonthlyChartData());
const overviewDailyRequestChartData = computed(() =>
    setOverviewDailyRequestChartData()
);
const overviewChartOptions = computed(() => setOverviewChartOptions());

const setOverviewDailyChartData = (): ChartConfiguration<"line">["data"] => {
    if (!overviewAnalytics.value) {
        return { labels: [], datasets: [] };
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
        return { labels: [], datasets: [] };
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
        return { labels: [], datasets: [] };
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
            return { labels: [], datasets: [] };
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

const { data: weeklyAnalytics } = useRequest(getWeeklyAnalytics);

const weeklyRoomChartData = computed(() => setWeeklyRoomChartData());
const weeklyRoomChartOptions = computed(() => setWeeklyRoomChartOptions());
const weeklyReasonChartData = computed(() => setWeeklyReasonChartData());
const weeklyReasonChartOptions = computed(() => setWeeklyReasonChartOptions());
const weeklyHourlyReservationsChartData = computed(() =>
    setWeeklyHourlyReservationsChartData()
);
const weeklyHourlyReservationsChartOptions = computed(() =>
    setWeeklyHourlyReservationsChartOptions()
);
const weeklyDailyReservationsChartData = computed(() =>
    setWeeklyDailyReservationsChartData()
);
const weeklyDailyReservationsChartOptions = computed(() =>
    setWeeklyDailyReservationsChartOptions()
);
const weeklyDailyReservationCreationsChartData = computed(() =>
    setWeeklyDailyReservationCreationsChartData()
);
const weeklyDailyReservationCreationsChartOptions = computed(() =>
    setWeeklyDailyReservationCreationsChartOptions()
);

const setWeeklyRoomChartData = (): ChartConfiguration<"bar">["data"] => {
    if (!weeklyAnalytics.value) {
        return { labels: [], datasets: [] };
    }
    const labels = weeklyAnalytics.value.data.rooms.map(
        (room) => room.roomName
    );
    return {
        labels,
        datasets: [
            {
                label: "Reservations",
                backgroundColor: "rgba(59, 130, 246, 1)",
                data: weeklyAnalytics.value.data.rooms.map(
                    (room) => room.reservations
                ),
                borderRadius: 5,
            },
            {
                label: "Reservation Creations",
                backgroundColor: "rgba(16, 185, 129, 1)",
                data: weeklyAnalytics.value.data.rooms.map(
                    (room) => room.reservationCreations
                ),
                borderRadius: 5,
            },
        ],
    };
};

const setWeeklyRoomChartOptions = (): ChartConfiguration<"bar">["options"] => {
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
            (reason) => reason.word
        );
        return {
            labels,
            datasets: [
                {
                    label: "",
                    data: weeklyAnalytics.value.data.reasons.map(
                        (reason) => reason.count * 10 + 10
                    ),
                },
            ],
        };
    };

const setWeeklyReasonChartOptions =
    (): ChartConfiguration<"wordCloud">["options"] => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = isDark.value
            ? documentStyle.getPropertyValue("--color-surface-200")
            : documentStyle.getPropertyValue("--color-surface-500");
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

const turnstileVisible = ref(false);
const exportLoading = ref(false);
const handleTurnstile = async () => {
    turnstileVisible.value = true;
    exportLoading.value = true;
    while (exportLoading.value && turnstileToken.value == "") {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!exportLoading.value) return;
    exportLoading.value = false;
    turnstileVisible.value = false;
};
const onExportOverview = async (type: string) => {
    await handleTurnstile();
    await getExportOverviewReservationsAnalytics(type, turnstileToken.value);
    turnstileToken.value = "";
};

const onExportWeekly = async (type: string) => {
    await handleTurnstile();
    await getExportWeeklyReservationsAnalytics(type, turnstileToken.value);
    turnstileToken.value = "";
};
</script>

<template>
    <Navbar v-model:isDark="isDark"></Navbar>
    <LoadingMask></LoadingMask>
    <Dialog
        header="Human Verification"
        :closable="false"
        v-model:visible="turnstileVisible"
        class="w-[23rem]"
        modal
    >
        <p class="text-center text-sm mt-3">Let us know you're human</p>
        <VueTurnstile
            v-model="turnstileToken"
            :siteKey="turnstileSiteKey"
            ref="turnstileRef"
            class="flex justify-center my-4"
        ></VueTurnstile>
        <Button
            fluid
            severity="secondary"
            @click="(exportLoading = false), (turnstileVisible = false)"
            ><X></X>Cancel</Button
        >
    </Dialog>
    <div class="mt-[6rem] mb-4 md:mx-[3rem] 2xl:mx-[8rem] mx-4">
        <h1 class="font-bold md:text-3xl text-2xl my-4">
            Reservation Analytics
        </h1>
        <div class="flex items-center justify-between mt-8 mb-3">
            <h2 class="text-xl font-bold">Overview</h2>
            <div class="flex gap-2 items-center">
                <Button
                    size="small"
                    @click="onExportOverview('pdf')"
                    :disabled="exportLoading"
                    ><Download></Download>Export (.pdf)</Button
                >
                <Button
                    size="small"
                    @click="onExportOverview('png')"
                    :disabled="exportLoading"
                    ><Download></Download>Export (.png)</Button
                >
            </div>
        </div>
        <div class="grid grid-cols-4 gap-4">
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Reservations (Today)</h3>
                    <p class="text-2xl font-bold">
                        {{ overviewAnalytics?.today.reservations || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Approvals (Today)</h3>
                    <p class="text-2xl font-bold">
                        {{ overviewAnalytics?.today.approvals || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Rejections (Today)</h3>
                    <p class="text-2xl font-bold">
                        {{ overviewAnalytics?.today.rejections || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
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
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Weekly (Last 7 Days)</h3>
                    <Chart
                        type="line"
                        :data="overviewWeeklyChartData"
                        :options="overviewChartOptions"
                        :height="300"
                    ></Chart>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Daily (Last 30 Days)</h3>
                    <Chart
                        type="line"
                        :data="overviewDailyChartData"
                        :options="overviewChartOptions"
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
                        :data="overviewMonthlyChartData"
                        :options="overviewChartOptions"
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
                        :data="overviewDailyRequestChartData"
                        :options="overviewChartOptions"
                        :height="300"
                    ></Chart>
                </template>
            </Card>
        </div>
        <div class="flex items-center justify-between mt-8 mb-3">
            <h2 class="text-xl font-bold">Weekly (Last Week)</h2>
            <div class="flex gap-2 items-center">
                <Button
                    size="small"
                    @click="onExportWeekly('pdf')"
                    :disabled="exportLoading"
                    ><Download></Download>Export (.pdf)</Button
                >
                <Button
                    size="small"
                    @click="onExportWeekly('png')"
                    :disabled="exportLoading"
                    ><Download></Download>Export (.png)</Button
                >
            </div>
        </div>
        <div class="grid grid-cols-4 gap-4">
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Reservations</h3>
                    <p class="text-2xl font-bold">
                        {{ weeklyAnalytics?.data.totalReservations || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Approvals</h3>
                    <p class="text-2xl font-bold">
                        {{ weeklyAnalytics?.data.totalApprovals || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Rejections</h3>
                    <p class="text-2xl font-bold">
                        {{ weeklyAnalytics?.data.totalRejections || "-" }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        Reservation Creations
                    </h3>
                    <p class="text-2xl font-bold">
                        {{
                            weeklyAnalytics?.data.totalReservationCreations ||
                            "-"
                        }}
                    </p>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Reasons</h3>
                    <Chart
                        type="wordCloud"
                        :data="weeklyReasonChartData"
                        :options="weeklyReasonChartOptions"
                        :height="300"
                    ></Chart>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Hourly Reservations</h3>
                    <Chart
                        type="bar"
                        :data="weeklyHourlyReservationsChartData"
                        :options="weeklyHourlyReservationsChartOptions"
                        :height="300"
                    ></Chart>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Daily Reservations</h3>
                    <Chart
                        type="line"
                        :data="weeklyDailyReservationsChartData"
                        :options="weeklyDailyReservationsChartOptions"
                        :height="300"
                    ></Chart>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        Daily Reservation Creations
                    </h3>
                    <Chart
                        type="line"
                        :data="weeklyDailyReservationCreationsChartData"
                        :options="weeklyDailyReservationCreationsChartOptions"
                        :height="300"
                    ></Chart>
                </template>
            </Card>
            <Card class="col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">
                        Top 5 Room Statistics
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
