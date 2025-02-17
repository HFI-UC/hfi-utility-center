<script setup lang="ts">
import { RouterView } from "vue-router";
import { onMounted, ref, computed, watch } from "vue";
import Toast from "primevue/toast";
import Menubar from "primevue/menubar";
import { verifyAdmin } from "./api";
import Button from "primevue/button";
import Select from "primevue/select";
import "./styles/styles.css";
import ScrollTop from "primevue/scrolltop";
import { useI18n } from "vue-i18n";

const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

const { t, locale } = useI18n();

const changeLocale = (lang: string) => {
    localStorage.setItem("locale", lang);
    locale.value = lang;
};

const items = computed(() => {
    const data: any = [
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

const iconClass = ref("icon-sun");

const toggleColorScheme = () => {
    let color = sessionStorage.getItem("color") == "white" ? "dark" : "white";
    sessionStorage.setItem("color", color);
    const root = document.getElementsByTagName("html")[0];
    root.classList.toggle("p-dark");
    iconClass.value = color == "white" ? "icon-sun" : "icon-moon";
};

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
        iconClass.value = "icon-moon";
    }
    const token = sessionStorage.getItem("token");
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
                            style="height: 25px"
                    /></a>
                </template>
                <template #end>
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
                        class="ms-2 me-2"
                        icon="icon-log-in"
                    >
                    </Button>
                    <Button
                        v-if="isAdmin"
                        @click="signOut()"
                        severity="danger"
                        class="ms-2 me-2"
                        icon="icon-log-out"
                    >
                    </Button>
                    <Button @click="toggleColorScheme()" :icon="`${iconClass}`">
                    </Button>
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
        <i18n-t
            tag="p"
            keypath="footer.line2"
            scope="global"
            class="flex text-center justify-center"
        >
            <img class="ms-2 me-2" src="./assets/vercel.svg" width="80px" />
        </i18n-t>
        <p>
            {{ $t("footer.line3") }}
        </p>
        <i18n-t
            tag="p"
            class="flex gap-1 items-center justify-center"
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
        </i18n-t>
        <i18n-t
            tag="p"
            keypath="footer.line5"
            scope="global"
            class="flex flex-wrap text-center justify-center"
        >
            <img class="ms-2 me-1" src="./assets/chatgpt.svg" width="100px" />
        </i18n-t>
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
