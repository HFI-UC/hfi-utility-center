<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
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
    Globe,
    Sparkles,
    Ellipsis,
    Megaphone,
    DollarSign,
} from "lucide-vue-next";
import { useRequest } from "vue-request";

import { getCheckLogin, getLogOut } from "../api";
import { usePrimeVue, useToast } from "primevue";
import en from "primelocale/en.json";
import zh_cn from "primelocale/zh-CN.json";
import { Rive, RuntimeLoader } from "@rive-app/canvas";
// @ts-ignore
import riveWASMResource from "@rive-app/canvas/rive.wasm";
import themeToggleUrl from "@/assets/theme-toggle.riv?inline";
import { useI18n } from "vue-i18n";
import { useLoginEvent, useIsLoading, triggerLoginUpdate } from "@/eventBus";

RuntimeLoader.setWasmUrl(riveWASMResource);

const { t, locale } = useI18n();
const isDark = defineModel<boolean>("isDark");
const isScrolled = ref(false);
const isMobile = ref(false);
const menu = ref();
const riveInstance = ref<Rive | null>(null);
const resizeTimeout = ref<number | null>(null);
const {
    data: loginData,
    refresh: refreshLoginData,
    loading: isLoginLoading,
} = useRequest(getCheckLogin);
const loginEvent = useLoginEvent();
const isPageLoading = useIsLoading();

watch(loginEvent, () => {
    refreshLoginData();
});

const handleScroll = () => {
    isScrolled.value = window.scrollY > 10;
};
const handleResize = () => {
    isMobile.value = window.innerWidth < 1200;
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
const otherMenu = ref();
const userMenu = ref();
const toggleReservationsMenu = (event: Event) => {
    reservationsMenu.value.toggle(event);
};

const toggleOtherMenu = (event: Event) => {
    otherMenu.value.toggle(event);
};

const toggleUserMenu = (event: Event) => {
    userMenu.value.toggle(event);
};

const toast = useToast();

const onLogOutEvent = async () => {
    const response = await getLogOut();
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("navbar.toast.logoutSuccessful"),
            life: 3000,
        });
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 3000,
        });
    }
    refreshLoginData();
    triggerLoginUpdate();
};

const reservationsMenuItems = computed(() => {
    return [
        {
            label: t("navbar.reservation.create"),
            iconComponent: Book,
            to: "/reservation/create",
        },
        {
            label: t("navbar.reservation.search"),
            iconComponent: Search,
            to: "/reservation/search",
        },
        {
            label: t("navbar.reservation.analytic"),
            iconComponent: ChartNoAxesCombined,
            to: "/reservation/analytics",
        },
    ];
});
const userRoleLevelMapping: Record<string, number> = {
    system: 4,
    admin: 3,
    approver: 2,
    student: 1,
};
const userRoleLevel = computed(
    () => userRoleLevelMapping[loginData.value?.data?.role as string] || 0,
);

const otherMenuItems = computed(() => {
    const items: any[] = [];
    if (userRoleLevel.value >= 1) {
        items.push({
            label: t("navbar.other.advertisement"),
            iconComponent: Megaphone,
            to: "/ads",
        });
    }
    if (userRoleLevel.value >= 2) {
        items.push({
            label: t("navbar.other.reservationManagement"),
            iconComponent: BookCheck,
            to: "/admin/reservation",
        });
    }
    if (userRoleLevel.value >= 3) {
        items.push({
            label: t("navbar.other.adsManagement"),
            iconComponent: Megaphone,
            to: "/admin/ads",
        });
        items.push({
            label: "Ad Pricing",
            iconComponent: DollarSign,
            to: "/admin/ads-pricing",
        });
        items.push({
            label: t("navbar.other.userManagement"),
            iconComponent: UserRound,
            to: "/admin/user",
        });
        items.push({
            label: t("navbar.other.facilityManagement"),
            iconComponent: DoorClosed,
            to: "/admin/facility",
        });
    }
    return items;
});

const menuItems = computed(() => {
    const items: any[] = [
        { label: t("navbar.home"), iconComponent: Home, to: "/" },
        { separator: true },
        {
            label: t("navbar.reservation.reservation"),
            items: reservationsMenuItems.value,
        },
        { separator: true },
        {
            label: t("navbar.utiverse"),
            iconComponent: Sparkles,
            to: "/utiverse",
        },
    ];
    items.push({ separator: true });
    if (userRoleLevel.value >= 1) {
        items.push({
            label: t("navbar.other.other"),
            items: otherMenuItems.value,
        });
        items.push({ separator: true });
    }
    if (!loginData.value?.success) {
        items.push({
            label: t("navbar.login"),
            iconComponent: LogIn,
            to: "/user/login",
        });
    } else {
        items.push({
            label: loginData.value.data.name,
            items: userMenuItems.value,
        });
    }

    return items;
});

const userMenuItems = computed(() => {
    const items: any[] = [];
    items.push({
        label: t("navbar.logout"),
        iconComponent: LogOut,
        command: onLogOutEvent,
    });
    return items;
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

const primeVue = usePrimeVue();
const primeVueLocales: Record<string, any> = {
    "zh-CN": zh_cn["zh-CN"],
    "zh-MS": zh_cn["zh-CN"],
    "en-US": en["en"],
};
const selectedLocale = ref("");
const changeLocale = (lang: string) => {
    localStorage.setItem("locale", lang);
    locale.value = lang;
    primeVue.config.locale = { ...primeVueLocales[lang] };
};
const localeOptions = computed(() => [
    {
        key: t("navbar.locale.zhCN"),
        code: "zh-CN",
    },
    {
        key: t("navbar.locale.enUS"),
        code: "en-US",
    },
    {
        key: t("navbar.locale.zhMS"),
        code: "zh-MS",
    },
]);

onMounted(async () => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    handleResize();

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

    selectedLocale.value = localStorage.getItem("locale") || "en-US";
    if (
        !localeOptions.value.find((o: any) => o.code === selectedLocale.value)
    ) {
        selectedLocale.value = "en-US";
    }
    changeLocale(selectedLocale.value);
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

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
});
</script>
<template>
    <ProgressBar
        mode="indeterminate"
        class="fixed inset-x-0 top-0 left-0 w-full h-1! z-50"
        v-if="isLoginLoading || isPageLoading"
    />
    <div
        :class="[
            'fixed inset-x-0 top-0 z-10 h-16 transition-all duration-300',
            isScrolled ? 'backdrop-blur-lg shadow' : 'bg-transparent',
        ]"
    >
        <div
            class="mx-8 flex justify-between items-center h-full"
            id="navbar"
        >
            <div class="flex gap-4 items-center">
                <RouterLink
                    class="font-bold md:text-lg text-md from-cyan-500 to-sky-500 bg-linear-to-r bg-clip-text text-transparent"
                    to="/"
                    >{{ $t("navbar.title") }}</RouterLink
                >
                <canvas
                    id="theme-canvas"
                    class="md:h-11.25 h-8.75 md:mx-4 mx-2 cursor-pointer"
                ></canvas>
                <template v-if="!isMobile">
                    <Button text severity="contrast" as="RouterLink" to="/">
                        <Home></Home>{{ $t("navbar.home") }}
                    </Button>
                    <Button
                        text
                        severity="contrast"
                        @click="toggleReservationsMenu"
                        aria-haspopup="true"
                        aria-controls="reservationsMenu"
                    >
                        <Book></Book>{{ $t("navbar.reservation.reservation") }}
                    </Button>
                    <Button
                        text
                        severity="contrast"
                        as="RouterLink"
                        to="/utiverse"
                    >
                        <Sparkles></Sparkles>{{ $t("navbar.utiverse") }}
                    </Button>
                    <Button
                        v-if="otherMenuItems.length > 0"
                        text
                        severity="contrast"
                        @click="toggleOtherMenu"
                        aria-haspopup="true"
                        aria-controls="otherMenu"
                    >
                        <Ellipsis></Ellipsis>{{ $t("navbar.other.other") }}
                    </Button>
                </template>
            </div>
            <div class="flex gap-4 items-center" v-if="!isMobile">
                <Select
                    @change="changeLocale(selectedLocale)"
                    :options="localeOptions"
                    v-model="selectedLocale"
                    optionValue="code"
                    optionLabel="key"
                    appendTo="#navbar"
                    overlayClass="!top-15"
                >
                    <template #dropdownicon>
                        <Globe></Globe>
                    </template>
                </Select>
                <Button
                    v-if="!loginData?.success"
                    text
                    severity="contrast"
                    as="RouterLink"
                    to="/user/login"
                >
                    <LogIn></LogIn>{{ $t("navbar.login") }}
                </Button>
                <Button
                    v-if="loginData?.success"
                    text
                    severity="contrast"
                    @click="toggleUserMenu"
                    aria-haspopup="true"
                    aria-controls="userMenu"
                >
                    <Avatar shape="circle"><UserRound></UserRound></Avatar>
                    {{ loginData.data.name }}
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
                    class="top-15! max-h-[90dvh] overflow-y-auto"
                    popup
                    appendTo="#navbar"
                >
                    <template #start>
                        <div class="mx-3">
                            <Select
                                @change="changeLocale(selectedLocale)"
                                :options="localeOptions"
                                v-model="selectedLocale"
                                optionValue="code"
                                optionLabel="key"
                                fluid
                                appendTo="#navbar"
                                overlayClass="!top-30"
                                class="my-2"
                            >
                                <template #dropdownicon>
                                    <Globe></Globe>
                                </template>
                            </Select>
                        </div>
                        <div
                            v-if="loginData?.success"
                            class="mx-4 my-3 flex flex-col items-center gap-2"
                        >
                            <Avatar shape="circle" size="large"
                                ><UserRound class="w-6! h-6!"></UserRound
                            ></Avatar>
                            <p class="text-lg font-semibold">
                                {{ loginData.data.name }}
                            </p>
                            <p class="text-sm">
                                RMB
                                {{
                                    loginData.data.balance?.toFixed(2) ?? "0.00"
                                }}
                            </p>
                        </div>
                    </template>
                    <template #item="{ item, props }">
                        <RouterLink
                            v-if="!item.separator && item.to"
                            :to="item.to"
                            v-bind="props.action"
                            class="flex items-center gap-2"
                        >
                            <component
                                :is="item.iconComponent"
                                class="w-4 h-4"
                                v-if="item.iconComponent"
                            />
                            <span>{{ item.label }}</span>
                        </RouterLink>
                        <a
                            v-else-if="!item.separator"
                            :href="item.url"
                            v-bind="props.action"
                            class="flex items-center gap-2"
                        >
                            <component
                                :is="item.iconComponent"
                                class="w-4 h-4"
                                v-if="item.iconComponent"
                            />
                            <span>{{ item.label }}</span>
                        </a>
                        <div v-else class="my-2">
                            <Divider />
                        </div>
                    </template>
                </Menu>
            </div>
            <Menu
                ref="reservationsMenu"
                id="reservationsMenu"
                :model="reservationsMenuItems"
                popup
                class="top-15!"
                appendTo="#navbar"
            >
                <template #item="slotProps">
                    <RouterLink
                        class="flex items-center gap-2 px-3 py-2"
                        :to="slotProps.item.to"
                    >
                        <component
                            :is="slotProps.item.iconComponent"
                            class="w-4 h-4"
                            v-if="slotProps.item.iconComponent"
                        />
                        {{ slotProps.item.label }}
                    </RouterLink>
                </template>
            </Menu>
            <Menu
                ref="otherMenu"
                id="otherMenu"
                :model="otherMenuItems"
                popup
                class="top-15!"
                appendTo="#navbar"
            >
                <template #item="slotProps">
                    <RouterLink
                        class="flex items-center gap-2 px-3 py-2"
                        :to="slotProps.item.to"
                    >
                        <component
                            :is="slotProps.item.iconComponent"
                            class="w-4 h-4"
                            v-if="slotProps.item.iconComponent"
                        />
                        {{ slotProps.item.label }}
                    </RouterLink>
                </template>
            </Menu>
            <Menu
                ref="userMenu"
                id="userMenu"
                :model="userMenuItems"
                popup
                class="top-15!"
                appendTo="#navbar"
            >
                <template #start>
                    <div
                        v-if="loginData?.success"
                        class="mx-4 my-3 flex flex-col items-center gap-2"
                    >
                        <Avatar shape="circle" size="large"
                            ><UserRound class="w-6! h-6!"></UserRound
                        ></Avatar>
                        <p class="text-lg font-semibold">
                            {{ loginData.data.name }}
                        </p>
                        <p class="text-sm">
                            RMB
                            {{ loginData.data.balance?.toFixed(2) ?? "0.00" }}
                        </p>
                    </div>
                </template>
                <template #item="{ item, props }">
                    <RouterLink
                        v-if="!item.separator && item.to"
                        :to="item.to"
                        v-bind="props.action"
                        class="flex items-center gap-2"
                    >
                        <component
                            :is="item.iconComponent"
                            class="w-4 h-4"
                            v-if="item.iconComponent"
                        />
                        <span>{{ item.label }}</span>
                    </RouterLink>
                    <a
                        v-else-if="!item.separator"
                        :href="item.url"
                        v-bind="props.action"
                        class="flex items-center gap-2"
                    >
                        <component
                            :is="item.iconComponent"
                            class="w-4 h-4"
                            v-if="item.iconComponent"
                        />
                        <span>{{ item.label }}</span>
                    </a>
                    <div v-else class="my-2">
                        <Divider />
                    </div>
                </template>
            </Menu>
        </div>
    </div>
</template>
