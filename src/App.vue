<script setup lang="ts">
import { RouterView } from "vue-router";
import { onMounted, ref, computed, watch } from "vue";
import Toast from "primevue/toast";
import Menubar from "primevue/menubar";
import { verifyAdmin } from "./api";
import Button from "primevue/button";
import Select from "primevue/select";
import ScrollTop from "primevue/scrolltop";
import en from "primelocale/en.json";
import zh_cn from "primelocale/zh-CN.json";
import { usePrimeVue } from "primevue/config";
import { useI18n } from "vue-i18n";
import { MenuItem } from "primevue/menuitem";
import { Rive } from "@rive-app/canvas";

const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

const { t, locale } = useI18n();
const primeVue = usePrimeVue();
const primeVueLocales: Record<string, any> = {
    zh_cn: zh_cn["zh-CN"],
    zh_ms: zh_cn["zh-CN"],
    en_us: en["en"],
};

const changeLocale = (lang: string) => {
    localStorage.setItem("locale", lang);
    locale.value = lang;
    primeVue.config.locale = { ...primeVueLocales[lang] };
};

const items = computed(() => {
    const data: MenuItem[] = [
        {
            label: t("menubar.homepage"),
            icon: "icon-house",
            url: "/",
        },
        {
            label: t("menubar.reservation.reservation"),
            icon: "icon-book-user",
            items: [
                {
                    label: t("menubar.reservation.form"),
                    icon: "icon-square-pen",
                    url: "/reservation/create",
                },
                {
                    label: t("menubar.reservation.status"),
                    icon: "icon-chart-column-decreasing",
                    url: "/reservation/status",
                },
            ],
        },
        {
            label: t("menubar.maintenance"),
            icon: "icon-wrench",
            url: "/maintenance",
        },
        {
            label: t("menubar.lostnfound"),
            icon: "icon-info",
            url: "/lostnfound",
        },
    ];
    if (isAdmin.value) {
        data.push({
            label: t("menubar.admin.admin"),
            icon: "icon-user-round",
            items: [
                {
                    label: t("menubar.admin.reservation"),
                    icon: "icon-book-check",
                    url: "/admin/reservations",
                },
                {
                    label: t("menubar.admin.policy"),
                    icon: "icon-book-text",
                    url: "/admin/policy",
                },
            ],
        });
    }
    if (selectedLocale.value == "zh_ms") {
        data.push({
            label: "？？？",
            icon: "icon-circle-help",
            url: "/what-the-hell-is-that",
        });
    }
    return data;
});

const localeOptions = ref([
    {
        key: "简体中文",
        code: "zh_cn",
    },
    {
        key: "English",
        code: "en_us",
    },
    {
        key: "微软中文（彩蛋）",
        code: "zh_ms",
    },
]);

const selectedLocale = ref("");

const isAdmin = ref(false);

const signOut = () => {
    isAdmin.value = false;
    sessionStorage.removeItem("token");
    window.location.href = "/";
};

const signIn = () => {
    window.location.href = "/admin/login";
};

watch(
    () => selectedLocale.value,
    (newLocale) => changeLocale(newLocale),
);

const colorTheme = ref("white");
const toggleColorScheme = () => {
    let color = sessionStorage.getItem("color") == "white" ? "dark" : "white";
    sessionStorage.setItem("color", color);
    const root = document.getElementsByTagName("html")[0];
    root.classList.toggle("p-dark");
    colorTheme.value = color == "white" ? "white" : "dark";
};
const stateChangeCount = ref(0);
onMounted(() => {
    const r = new Rive({
        src: "/theme-toggle.riv",
        // @ts-ignore
        canvas: document.getElementById("canvas"),
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
});

onMounted(async () => {
    selectedLocale.value = localStorage.getItem("locale") || "en_us";
    const color =
        sessionStorage.getItem("color") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light");
    if (color == "dark") {
        sessionStorage.setItem("color", color);
        const root = document.getElementsByTagName("html")[0];
        root.classList.toggle("p-dark");
        colorTheme.value = "dark";
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    if (await verifyAdmin(token)) {
        isAdmin.value = true;
    }
});
</script>

<template>
    <div id="global">
        <Toast />
        <div>
            <Menubar :model="items">
                <template #start>
                    <a href="/"
                        ><img
                            src="./assets/logo.svg"
                            class="m-1"
                            alt="logo"
                            style="height: 25px"
                    /></a>
                </template>
                <template #end>
                    <div class="flex gap-2">
                        <Select
                            :options="localeOptions"
                            v-model="selectedLocale"
                            optionValue="code"
                            optionLabel="key"
                            :style="{ width: '9rem' }"
                        >
                            <template #dropdownicon>
                                <i class="icon-globe" />
                            </template>
                        </Select>
                        <Button
                            v-if="!isAdmin"
                            @click="signIn()"
                            severity="success"
                            icon="icon-log-in"
                        >
                        </Button>
                        <Button
                            v-if="isAdmin"
                            @click="signOut()"
                            severity="danger"
                            icon="icon-log-out"
                        >
                        </Button>
                        <a href="#" class="flex items-center">
                            <canvas id="canvas" style="width: 80px"></canvas>
                        </a>
                    </div>
                </template>
            </Menubar>
        </div>
        <div id="body">
            <RouterView />
        </div>
    </div>
    <footer id="footer">
        <p>
            {{ $t("footer.line1") }}
        </p>
        <I18nT
            tag="p"
            keypath="footer.line2"
            scope="global"
            class="flex flex-wrap text-center justify-center gap-2"
        >
            <img src="./assets/vercel.svg" width="80px" alt="vercel" />
            <img src="./assets/cloudflare.svg" width="130px" alt="cloudflare" />
        </I18nT>
        <p>
            {{ $t("footer.line3") }}
        </p>
        <I18nT
            tag="p"
            class="flex gap-1 items-center justify-center flex-wrap"
            keypath="footer.line4"
            scope="global"
        >
            <a
                :href="`https://github.com/HFI-UC/hfi-utility-center/commit/${sha}`"
                class="flex items-center gap-1"
                ><i class="icon-git-commit-horizontal"></i> {{ sha }}</a
            >
            <a href="https://www.gnu.org/licenses/agpl-3.0.html">{{
                $t("footer.license")
            }}</a>
            <a
                href="https://github.com/HFI-UC/hfi-utility-center"
                class="flex items-center gap-1"
                ><i class="icon-github inline-block"></i> GitHub</a
            >
        </I18nT>
        <I18nT
            tag="p"
            keypath="footer.line5"
            scope="global"
            class="flex flex-wrap text-center justify-center"
        >
            <img
                class="ms-2 me-1"
                src="./assets/chatgpt.svg"
                width="100px"
                alt="chatgpt"
            />
        </I18nT>
    </footer>
    <ScrollTop />
</template>

<style scoped>
#body {
    padding: 1rem 2rem 4rem 2rem;
}

#global {
    margin: 14px;
}

#footer {
    text-align: center;
    padding: 2rem;
    color: white;
    background-color: var(--p-zinc-600);
}

button,
.p-select {
    border-radius: 0.5rem;
    height: 40px;
}

:deep(.p-menubar) {
    border-radius: 0.75rem;
}

#footer > p {
    margin: 5px;
}

#footer a {
    color: var(--p-primary-300);
    text-decoration: none;
    transition:
        0.4s color,
        0.2s background-color ease;
}

#footer a:hover {
    color: var(--p-highlight-text-color);
    background-color: var(--p-highlight-bg);
}

@media screen and (max-width: 720px) {
    #body {
        padding: 20px;
    }

    #global {
        margin: 4px;
    }
}
</style>
