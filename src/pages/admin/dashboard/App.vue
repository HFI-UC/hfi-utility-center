<script setup lang="ts">
import { BookCheck, DoorClosed, UserRound } from "lucide-vue-next";
import AdminLogin from "../../../components/AdminLogin.vue";
import Navbar from "../../../components/Navbar.vue";
import LoadingMask from "../../../components/LoadingMask.vue";
import { useRequest } from "vue-request";
import { type Analytics, getAnalytics } from "../../../api";
import { computed, ref, watch } from "vue";

const isDark = ref(false)
const { data: analyticsData } = useRequest(getAnalytics, { pollingInterval: 60000 });
const analytics = computed<Analytics>(() => analyticsData.value?.data || null)
const dailyChartData = ref<any>(null)
const weeklyChartData = ref<any>(null)
const monthlyChartData = ref<any>(null)
const dailyRequestChartData = ref<any>(null)
const chartOptions = computed(() => setChartOptions());

const setDailyChartData = () => {
    if (!analytics.value) {
        return {
            labels: [],
            datasets: [],
        }
    }
    const getDate = (daysAgo: number): string => {
        const monthNameMapping = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return `${monthNameMapping[date.getMonth()]} ${date.getDate()}`;
    }
    const labels = Array.from({ length: 30 }, (_, i) => getDate(29 - i));
    return {
        labels,
        datasets: [
            {
                label: 'Reservations',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                data: analytics.value.daily.reservations,
                tension: 0.4,
            },
            {
                label: "Reservation Creations",
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgba(16, 185, 129, 1)',
                data: analytics.value.daily.reservationCreations,
                tension: 0.4,
            },
            {
                label: "Reservation Approvals",
                backgroundColor: 'rgba(234, 179, 8, 0.5)',
                borderColor: 'rgba(234, 179, 8, 1)',
                data: analytics.value.daily.approvals,
                tension: 0.4,
            },
            {
                label: "Reservation Rejections",
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderColor: 'rgba(239, 68, 68, 1)',
                data: analytics.value.daily.rejections,
                tension: 0.4,
            }
        ],
    };
}

const setWeeklyChartData = () => {
    if (!analytics.value) {
        return {
            labels: [],
            datasets: [],
        }
    }
    const getDate = (daysAgo: number): string => {
        const monthNameMapping = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return `${monthNameMapping[date.getMonth()]} ${date.getDate()}`;
    }
    const labels = Array.from({ length: 7 }, (_, i) => getDate(6 - i));
    return {
        labels,
        datasets: [
            {
                label: 'Reservations',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                data: analytics.value.weekly.reservations,
                tension: 0.4,
            },
            {
                label: "Reservation Creations",
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgba(16, 185, 129, 1)',
                data: analytics.value.weekly.reservationCreations,
                tension: 0.4,
            },
            {
                label: "Reservation Approvals",
                backgroundColor: 'rgba(234, 179, 8, 0.5)',
                borderColor: 'rgba(234, 179, 8, 1)',
                data: analytics.value.weekly.approvals,
                tension: 0.4,
            },
            {
                label: "Reservation Rejections",
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderColor: 'rgba(239, 68, 68, 1)',
                data: analytics.value.weekly.rejections,
                tension: 0.4,
            }
        ],
    };
}

const setMonthlyChartData = () => {
    if (!analytics.value) {
        return {
            labels: [],
            datasets: [],
        }
    }
    const getMonth = (monthsAgo: number): string => {
        const monthNameMapping = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);
        return `${monthNameMapping[date.getMonth()]} ${date.getFullYear()}`;
    }
    const labels = Array.from({ length: 12 }, (_, i) => getMonth(11 - i));
    return {
        labels,
        datasets: [
            {
                label: 'Reservations',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                data: analytics.value.monthly.reservations,
                tension: 0.4,
            },
            {
                label: "Reservation Creations",
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgba(16, 185, 129, 1)',
                data: analytics.value.monthly.reservationCreations,
                tension: 0.4,
            },
            {
                label: "Reservation Approvals",
                backgroundColor: 'rgba(234, 179, 8, 0.5)',
                borderColor: 'rgba(234, 179, 8, 1)',
                data: analytics.value.monthly.approvals,
                tension: 0.4,
            },
            {
                label: "Reservation Rejections",
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderColor: 'rgba(239, 68, 68, 1)',
                data: analytics.value.monthly.rejections,
                tension: 0.4,
            }
        ],
    };
}

const setDailyRequestChartData = () => {
        if (!analytics.value) {
        return {
            labels: [],
            datasets: [],
        }
    }
    const getDate = (daysAgo: number): string => {
        const monthNameMapping = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return `${monthNameMapping[date.getMonth()]} ${date.getDate()}`;
    }
    const labels = Array.from({ length: 30 }, (_, i) => getDate(29 - i));
    return {
        labels,
        datasets: [
            {
                label: "Requests",
                backgroundColor: 'rgba(239, 200, 68, 1)',
                data: analytics.value.daily.requests,
            }
        ],
    };
}

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = isDark.value ? documentStyle.getPropertyValue('--color-surface-300'): documentStyle.getPropertyValue('--color-surface-900');
    const textColorSecondary = isDark.value ? documentStyle.getPropertyValue('--color-surface-200'): documentStyle.getPropertyValue('--color-surface-500');
    const surfaceBorder = isDark.value ? documentStyle.getPropertyValue('--color-surface-700'): documentStyle.getPropertyValue('--color-surface-200');
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                offset: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        },
    };
}

watch(analytics, () => {
    if (!analytics.value) return;
    if (!dailyChartData.value) dailyChartData.value = setDailyChartData();
    else {
        for (let i = 0; i < 30; i++) {
            dailyChartData.value.labels[i] = setDailyChartData().labels[i];
            dailyChartData.value.datasets[0].data[i] = setDailyChartData().datasets[0].data[i];
            dailyChartData.value.datasets[1].data[i] = setDailyChartData().datasets[1].data[i];
            dailyChartData.value.datasets[2].data[i] = setDailyChartData().datasets[2].data[i];
            dailyChartData.value.datasets[3].data[i] = setDailyChartData().datasets[3].data[i];
        }
    }
    if (!weeklyChartData.value) weeklyChartData.value = setWeeklyChartData();
    else {
        for (let i = 0; i < 7; i++) {
            weeklyChartData.value.labels[i] = setWeeklyChartData().labels[i];
            weeklyChartData.value.datasets[0].data[i] = setWeeklyChartData().datasets[0].data[i];
            weeklyChartData.value.datasets[1].data[i] = setWeeklyChartData().datasets[1].data[i];
            weeklyChartData.value.datasets[2].data[i] = setWeeklyChartData().datasets[2].data[i];
            weeklyChartData.value.datasets[3].data[i] = setWeeklyChartData().datasets[3].data[i];
        }
    }
    if (!monthlyChartData.value) monthlyChartData.value = setMonthlyChartData();
    else {
        for (let i = 0; i < 12; i++) {
            monthlyChartData.value.labels[i] = setMonthlyChartData().labels[i];
            monthlyChartData.value.datasets[0].data[i] = setMonthlyChartData().datasets[0].data[i];
            monthlyChartData.value.datasets[1].data[i] = setMonthlyChartData().datasets[1].data[i];
            monthlyChartData.value.datasets[2].data[i] = setMonthlyChartData().datasets[2].data[i];
            monthlyChartData.value.datasets[3].data[i] = setMonthlyChartData().datasets[3].data[i];
        }
    }
    if (!dailyRequestChartData.value) dailyRequestChartData.value = setDailyRequestChartData();
    else {
        for (let i = 0; i < 30; i++) {
            dailyRequestChartData.value.labels[i] = setDailyRequestChartData().labels[i];
            dailyRequestChartData.value.datasets[0].data[i] = setDailyRequestChartData().datasets[0].data[i];
        }
    }
}, { immediate: true });

const formatBytes = (bytes: number | undefined): string | null => {
    if (bytes === undefined) return null;
    const units = ['iB', 'KiB', 'MiB', 'GiB', 'TiB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}

</script>

<template>
    <AdminLogin :requireLogin="true"></AdminLogin>
    <Navbar v-model:isDark="isDark"></Navbar>
    <LoadingMask></LoadingMask>
    <div class="mt-[6rem] mb-4 md:mx-[3rem] mx-4">
        <h1 class="font-bold text-3xl my-4">Admin Dashboard</h1>
        <h2 class="font-bold text-lg mt-8 mb-3">Application Entrance</h2>
        <div class="flex flex-wrap gap-3 items-center">
            <Button as="a" href="/admin/reservation" size="small"
                ><BookCheck></BookCheck>Reservation Management</Button
            >
            <Button as="a" href="/admin/facility" size="small"
                ><DoorClosed></DoorClosed>Facility Management</Button
            >
            <Button as="a" href="/admin/admin" size="small"
                ><UserRound></UserRound>Admin Management</Button
            >
        </div>
        <h2 class="font-bold text-lg mt-8 mb-3 flex items-center gap-2">Analytics<Tag value="Live" severity="success"></Tag></h2>
        <div class="grid grid-cols-4 gap-4">
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Reservations (Today)</h3>
                    <p class="text-2xl font-bold">{{ analytics?.today.reservations }}</p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Approvals (Today)</h3>
                    <p class="text-2xl font-bold">{{ analytics?.today.approvals }}</p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Rejections (Today)</h3>
                    <p class="text-2xl font-bold">{{ analytics?.today.rejections }}</p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Reservation Creations (Today)</h3>
                    <p class="text-2xl font-bold">{{ analytics?.today.reservationCreations }}</p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Requests (Today)</h3>
                    <p class="text-2xl font-bold">{{ analytics?.today.requests }}</p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">CPU Usage</h3>
                    <p class="text-2xl font-bold">{{ analytics?.cpu.toFixed(2) }}%</p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Memory Usage</h3>
                    <p class="text-2xl font-bold">{{ formatBytes(analytics?.memory) }}</p>
                </template>
            </Card>
            <Card class="lg:col-span-1 sm:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Error Logs</h3>
                    <p class="text-2xl font-bold">{{ analytics?.errorLogs }}</p>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Weekly (Last 7 Days)</h3>
                    <Chart type="line" :data="weeklyChartData" :options="chartOptions" :height="300"></Chart>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Daily (Last 30 Days)</h3>
                    <Chart type="line" :data="dailyChartData" :options="chartOptions" :height="300"></Chart>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Monthly (Last 1 Year)</h3>
                    <Chart type="line" :data="monthlyChartData" :options="chartOptions" :height="300"></Chart>
                </template>
            </Card>
            <Card class="lg:col-span-2 col-span-4">
                <template #content>
                    <h3 class="font-bold text-lg mb-4">Daily Requests (Last 30 Days)</h3>
                    <Chart type="bar" :data="dailyRequestChartData" :options="chartOptions" :height="300"></Chart>
                </template>
            </Card>
        </div>
    </div>
</template>
