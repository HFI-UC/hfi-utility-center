<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
    Home,
    LogIn,
    LogOut,
    MenuIcon,
    Book,
    Search,
    UserRound,
    ChartNoAxesCombined,
    BookCheck,
    DoorClosed,
} from "lucide-vue-next";
import { useRequest } from "vue-request";
import { SpeedInsights } from '@vercel/speed-insights/vue';
import { Analytics } from '@vercel/analytics/vue';
import { getCheckLogin, getLogOut } from "../api";
import { useToast } from "primevue";
import { Rive, RuntimeLoader } from "@rive-app/canvas";
// @ts-ignore
import riveWASMResource from "@rive-app/canvas/rive.wasm";
// @ts-ignore
import themeToggleUrl from "@/assets/theme-toggle.riv?inline";
import { useI18n } from "vue-i18n";

RuntimeLoader.setWasmUrl(riveWASMResource);

const { t } = useI18n()
const isDark = defineModel<boolean>("isDark");
const isScrolled = ref(false);
const isMobile = ref(false);
const menu = ref();
const riveInstance = ref<any>(null);
const resizeTimeout = ref<number | null>(null);
const { data: loginData } = useRequest(getCheckLogin);

const handleScroll = () => {
    isScrolled.value = window.scrollY > 10;
};
const handleResize = () => {
    isMobile.value = window.innerWidth < 900;
    if (resizeTimeout.value) {
        clearTimeout(resizeTimeout.value);
    }
    resizeTimeout.value = window.setTimeout(() => {
        if (
            riveInstance.value &&
            typeof riveInstance.value.resizeDrawingSurfaceToCanvas ===
                "function"
        ) {
            riveInstance.value.resizeDrawingSurfaceToCanvas();
        }
    }, 150);
};
const toggleMenu = (event: Event) => {
    menu.value.toggle(event);
};

const reservationsMenu = ref();
const adminMenu = ref();
const toggleReservationsMenu = (event: Event) => {
    reservationsMenu.value.toggle(event);
};

const toggleAdminMenu = (event: Event) => {
    adminMenu.value.toggle(event);
};

const toast = useToast();

const onLogOutEvent = async () => {
    const response = await getLogOut();
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("toast.success"),
            detail: t("toast.details.logoutSuccessful"),
            life: 3000,
        });
    } else {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: response.message,
            life: 3000,
        });
    }
    setTimeout(() => {
        window.location.reload();
    }, 3500);
};

const reservationsMenuItems = computed(() => {
    const items = [
        {
            label: t("navbar.reservations.create"),
            iconComponent: Book,
            to: "/reservation/create/",
        },
        {
            label: t("navbar.reservations.search"),
            iconComponent: Search,
            to: "/reservation/search/",
        },
        {
            label: t("navbar.reservations.analytics"),
            iconComponent: ChartNoAxesCombined,
            to: "/reservation/analytics/",
        },
    ];
    return items;
});

const adminMenuItems = computed(() => {
    const items = [
        {
            label: t("navbar.admin.reservationManagement"),
            iconComponent: BookCheck,
            to: "/admin/reservation/",
        },
        {
            label: t("navbar.admin.facilityManagement"),
            iconComponent: DoorClosed,
            to: "/admin/facility/",
        },
        {
            label: t("navbar.admin.adminManagement"),
            iconComponent: UserRound,
            to: "/admin/admin/",
        },
    ];
    return items;
});

const menuItems = computed(() => {
    const items: any = [
        { label: t("navbar.home"), iconComponent: Home, to: "/" },
        {
            label: t("navbar.reservations.reservations"),
            iconComponent: Book,
            items: reservationsMenuItems.value,
        },
    ];
    items.push({ separator: true });
    if (!loginData.value?.success) {
        items.push({
            label: t("navbar.login"),
            iconComponent: LogIn,
            to: "/admin/login/",
        });
    } else {
        items.push({
            label: t("navbar.admin.admin"),
            iconComponent: UserRound,
            items: adminMenuItems.value,
        });
        items.push({ label: t("navbar.logout"), iconComponent: LogOut, to: "#" });
    }
    return items;
});

onMounted(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    handleResize();
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
});

const colorTheme = ref("white");
const toggleColorScheme = () => {
    isDark.value = !isDark.value;
    let color = sessionStorage.getItem("color") == "white" ? "dark" : "white";
    sessionStorage.setItem("color", color);
    const root = document.getElementsByTagName("html")[0];
    root.classList.toggle("p-dark");
    colorTheme.value = color == "white" ? "white" : "dark";
};
const stateChangeCount = ref(0);
const dataUrlToArrayBuffer = (dataUrl: string): ArrayBuffer => {
    const b64 = dataUrl.split(",")[1];
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
};
onMounted(() => {
    const r = new Rive({
        buffer: dataUrlToArrayBuffer(themeToggleUrl),
        // @ts-ignore
        canvas: document.getElementById("theme-canvas"),
        autoplay: true,
        pixelRatio: 5,
        stateMachines: "State Machine 1",
        onLoad: () => {
            const inputs = r.stateMachineInputs("State Machine 1");
            const darkInput = inputs.find((i) => i.name === "isDark");
            if (darkInput) darkInput.value = colorTheme.value == "dark";
            r.resizeDrawingSurfaceToCanvas();
        },
        onStateChange: () => {
            if (stateChangeCount.value) toggleColorScheme();
            stateChangeCount.value++;
        },
    });
    riveInstance.value = r;
});

onMounted(async () => {
    const color =
        sessionStorage.getItem("color") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light");
    if (color == "dark") {
        isDark.value = true;
        sessionStorage.setItem("color", color);
        const root = document.getElementsByTagName("html")[0];
        root.classList.toggle("p-dark");
        colorTheme.value = "dark";
    }
});
</script>
<template>
    <SpeedInsights></SpeedInsights>
    <Analytics></Analytics>
    <div
        :class="[
            'fixed inset-x-0 top-0 z-10 flex items-center h-[4rem] transition-all duration-300',
            isScrolled ? 'backdrop-blur-lg shadow' : 'bg-transparent',
        ]"
    >
        <div class="mx-[2rem] flex justify-between w-full" id="navbar">
            <div class="flex gap-4 items-center">
                <a
                    class="font-bold md:text-lg text-md from-cyan-500 to-sky-500 bg-linear-to-r bg-clip-text text-transparent"
                    href="/"
                    >{{ $t("navbar.title") }}</a
                >
                <canvas
                    id="theme-canvas"
                    class="md:h-[45px] h-[35px] md:mx-4 mx-2 cursor-pointer"
                ></canvas>
                <template v-if="!isMobile">
                    <Button text severity="contrast" as="a" href="/">
                        <Home></Home>{{ $t("navbar.home") }}
                    </Button>
                    <Button
                        text
                        severity="contrast"
                        @click="toggleReservationsMenu"
                        aria-haspopup="true"
                        aria-controls="reservationsMenu"
                    >
                        <Book></Book>{{ $t("navbar.reservations.reservations") }}
                    </Button>
                    <Button
                        v-if="loginData?.success"
                        text
                        severity="contrast"
                        @click="toggleAdminMenu"
                        aria-haspopup="true"
                        aria-controls="adminMenu"
                    >
                        <UserRound></UserRound>{{ $t("navbar.admin.admin") }}
                    </Button>
                </template>
            </div>
            <div class="flex gap-8 items-center" v-if="!isMobile">
                <Button
                    v-if="!loginData?.success"
                    text
                    severity="contrast"
                    as="a"
                    href="/admin/login/"
                >
                    <LogIn></LogIn>{{ $t("navbar.login") }}
                </Button>
                <Button
                    v-if="loginData?.success"
                    text
                    severity="contrast"
                    @click="onLogOutEvent"
                >
                    <LogOut></LogOut>{{ $t("navbar.logout") }}
                </Button>
            </div>
            <div v-else class="flex items-center gap-2">
                <Button
                    @click="toggleMenu"
                    text
                    aria-haspopup="true"
                    aria-controls="menu"
                    severity="contrast"
                >
                    <MenuIcon></MenuIcon>
                </Button>
                <Menu
                    ref="menu"
                    id="menu"
                    :model="menuItems"
                    class="!top-15"
                    popup
                    appendTo="#navbar"
                >
                    <template #item="slotProps">
                        <a
                            v-if="
                                !slotProps.item.separator &&
                                !slotProps.item.items
                            "
                            class="flex items-center gap-2 px-3 py-2"
                            :href="slotProps.item.to"
                            @click="
                                slotProps.item.label === 'Logout'
                                    ? ($event.preventDefault(), onLogOutEvent())
                                    : undefined
                            "
                        >
                            <component
                                :is="slotProps.item.iconComponent"
                                class="w-4 h-4"
                                v-if="slotProps.item.iconComponent"
                            />
                            {{ slotProps.item.label }}
                        </a>
                        <Menu
                            v-else-if="slotProps.item.items"
                            :model="slotProps.item.items"
                            popup
                            appendTo="#navbar"
                        >
                            <template #item="subSlotProps">
                                <a
                                    class="flex items-center gap-2 px-3 py-2"
                                    :href="subSlotProps.item.to"
                                >
                                    <component
                                        :is="subSlotProps.item.iconComponent"
                                        class="w-4 h-4"
                                        v-if="subSlotProps.item.iconComponent"
                                    />
                                    {{ subSlotProps.item.label }}
                                </a>
                            </template>
                        </Menu>
                        <Divider v-else class="my-2"></Divider>
                    </template>
                </Menu>
            </div>
            <Menu
                ref="reservationsMenu"
                id="reservationsMenu"
                :model="reservationsMenuItems"
                popup
                class="!top-15"
                appendTo="#navbar"
            >
                <template #item="slotProps">
                    <a
                        class="flex items-center gap-2 px-3 py-2"
                        :href="slotProps.item.to"
                    >
                        <component
                            :is="slotProps.item.iconComponent"
                            class="w-4 h-4"
                            v-if="slotProps.item.iconComponent"
                        />
                        {{ slotProps.item.label }}
                    </a>
                </template>
            </Menu>
            <Menu
                ref="adminMenu"
                id="adminMenu"
                :model="adminMenuItems"
                popup
                class="!top-15"
                appendTo="#navbar"
            >
                <template #item="slotProps">
                    <a
                        class="flex items-center gap-2 px-3 py-2"
                        :href="slotProps.item.to"
                    >
                        <component
                            :is="slotProps.item.iconComponent"
                            class="w-4 h-4"
                            v-if="slotProps.item.iconComponent"
                        />
                        {{ slotProps.item.label }}
                    </a>
                </template>
            </Menu>
        </div>
    </div>
</template>
