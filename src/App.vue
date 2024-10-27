<script setup lang="ts">
import { RouterView } from "vue-router";
import { onMounted, ref, computed, watch } from "vue";
import Toast from "primevue/toast";
import Menubar from "primevue/menubar";
import { verifyAdmin } from "./api";
import Button from "primevue/button";
import Select from "primevue/select";
import "./styles/styles.css";
import { useI18n } from "vue-i18n";

const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 6);

const { t, locale } = useI18n();

const changeLocale = (lang: string) => {
    localStorage.setItem("locale", lang);
    locale.value = lang;
};

const items = computed(() => {
    const data: any = [
        {
            label: t("menubar.homepage"),
            icon: "pi pi-home",
            url: "/",
        },
        {
            label: t("menubar.reservation.reservation"),
            icon: "pi pi-calendar-clock",
            items: [
                {
                    label: t("menubar.reservation.form"),
                    icon: "pi pi-pen-to-square",
                    url: "/reservation/create",
                },
                {
                    label: t("menubar.reservation.status"),
                    icon: "pi pi-chart-bar",
                    url: "/reservation/status",
                },
            ],
        },
        {
            label: t("menubar.maintenance"),
            icon: "pi pi-wrench",
            url: "/maintenance",
        },
    ];
    if (isAdmin.value) {
        data.push({
            label: t("menubar.admin.admin"),
            icon: "pi pi-user",
            items: [
                {
                    label: t("menubar.admin.reservation"),
                    icon: "pi pi-list-check",
                    url: "/admin/reservations",
                },
                {
                    label: t("menubar.admin.policy"),
                    icon: "pi pi-building-columns",
                    url: "/admin/policy",
                },
            ],
        });
    }
    return data;
});

const iconClass = ref("pi-sun");

const toggleColorScheme = () => {
    let color = localStorage.getItem("color") == "white" ? "dark" : "white";
    localStorage.setItem("color", color);
    const root = document.getElementsByTagName("html")[0];
    root.classList.toggle("p-dark");
    iconClass.value = color == "white" ? "pi-sun" : "pi-moon";
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
        key: "日本語",
        code: "ja_jp",
    },
    {
        key: "한국어",
        code: "ko_kr",
    },
    {
        key: "微软中文（不建议）",
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
        localStorage.getItem("color") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light");
    if (color == "dark") {
        localStorage.setItem("color", color);
        const root = document.getElementsByTagName("html")[0];
        root.classList.toggle("p-dark");
        iconClass.value = "pi-moon";
    }
    const token = sessionStorage.getItem("token");
    if (!token) return;
    if (await verifyAdmin(token)) {
        isAdmin.value = true;
    }
});
</script>

<template>
    <Toast />
    <div>
        <Menubar :model="items">
            <template #start>
                <img src="./assets/logo.svg" class="m-1" style="height: 25px" />
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
                        <i class="pi pi-globe" />
                    </template>
                </Select>
                <Button
                    v-if="!isAdmin"
                    @click="signIn()"
                    severity="success"
                    class="ms-2 me-2"
                    icon="pi pi-sign-in"
                >
                </Button>
                <Button
                    v-if="isAdmin"
                    @click="signOut()"
                    severity="danger"
                    class="ms-2 me-2"
                    icon="pi pi-sign-out"
                >
                </Button>
                <Button @click="toggleColorScheme()" :icon="`pi ${iconClass}`">
                </Button>
            </template>
        </Menubar>
    </div>
    <div id="body">
        <RouterView />
    </div>
    <footer id="footer">
        <i18n-t
            tag="p"
            keypath="footer.line1"
            scope="global"
            class="flex text-center justify-center"
        >
            <img class="ms-2 me-2" src="./assets/vercel.svg" width="90px" />
        </i18n-t>
        <p>
            {{ $t("footer.line2") }}
        </p>
        <p>
            {{ $t("footer.line3") }}
        </p>
        <i18n-t tag="p" keypath="footer.line4" scope="global">
            <a
                :href="`https://github.com/HFI-UC/hfi-utility-center/commit/${sha}`"
                ><i class="pi pi-sitemap"></i> {{ sha }}</a
            >
            <a href="https://www.gnu.org/licenses/agpl-3.0.html">{{
                $t("footer.license")
            }}</a>
            <a href="https://github.com/HFI-UC/hfi-utility-center"
                ><i class="pi pi-github"></i> GitHub</a
            >
        </i18n-t>
    </footer>
</template>

<style scoped>
#body {
    padding: 1rem 2rem 4rem 2rem;
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
}
</style>
