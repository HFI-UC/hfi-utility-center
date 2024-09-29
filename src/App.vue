<script setup lang="ts">
import { RouterView } from "vue-router";
import { onMounted, ref } from "vue";
import Toast from "primevue/toast";
import Menubar from "primevue/menubar";
import { verifyAdmin } from "./api";
import Button from "primevue/button";
import "./styles/styles.css";
const items = ref([
    {
        label: "Homepage",
        icon: "pi pi-home",
        url: "/",
    },
    {
        label: "Reservation",
        icon: "pi pi-calendar-clock",
        items: [
            {
                label: "Application Form",
                icon: "pi pi-pen-to-square",
                url: "/reservation/create",
            },
            {
                label: "Reservation Status",
                icon: "pi pi-chart-bar",
                url: "/reservation/status",
            },
        ],
    },
]);

const iconClass = ref("pi-sun");

const toggleColorScheme = () => {
    const root = document.getElementsByTagName("html")[0];
    root.classList.toggle("p-dark");
    iconClass.value = iconClass.value === "pi-moon" ? "pi-sun" : "pi-moon";
};

const isAdmin = ref(false);

const signOut = () => {
    isAdmin.value = false;
    sessionStorage.removeItem("token");
    window.location.href = "/";
};

const signIn = () => {
    window.location.href = "/admin/login";
};

onMounted(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    verifyAdmin(token).then((res: { success: boolean; message: string }) => {
        if (res.success) {
            isAdmin.value = true;
            items.value.push({
                label: "Admin",
                icon: "pi pi-user",
                items: [
                    {
                        label: "Reservation Management",
                        icon: "pi pi-list-check",
                        url: "/admin/reservations",
                    },
                    {
                        label: "Policy Settings",
                        icon: "pi pi-building-columns",
                        url: "/admin/policy",
                    },
                ],
            });
        }
    });
});
</script>

<template>
    <Toast />
    <div>
        <Menubar :model="items" class="menubar">
            <template #start>
                <img src="./assets/logo.svg" class="m-1" style="height: 25px" />
            </template>
            <template #end>
                <Button v-if="!isAdmin" @click="signIn()" severity="success">
                    <i class="pi pi-sign-in"></i>
                    <span class="text-sm">Login</span>
                </Button>
                <Button v-if="isAdmin" @click="signOut()" severity="danger">
                    <i class="pi pi-sign-out"></i>
                    <span class="text-sm">Logout</span>
                </Button>
                <Button @click="toggleColorScheme()">
                    <i :class="`pi ${iconClass}`"></i>
                    <span class="text-sm">Color Mode</span>
                </Button>
            </template>
        </Menubar>
    </div>
    <div id="body">
        <RouterView />
    </div>
    <footer id="footer">
        <p>Powered by and created by MAKERs'.</p>
        <p>
            Copyright &copy; 2024 The co-author of HFI Utility Center. All
            rights reserved.
        </p>
        <p>
            This website is under
            <a href="https://www.gnu.org/licenses/agpl-3.0.html"
                >AGPL-3.0 License</a
            >
            and open-sourced on
            <a href="https://github.com/SilianZ/hfi-utility-center"
                ><i class="pi pi-github"></i> GitHub</a
            >.
        </p>
    </footer>
</template>

<style scoped>
#body {
    padding: 1rem 2rem 4rem 2rem;
}
.p-button {
    margin-left: 3px;
    margin-right: 3px;
}

#footer {
    text-align: center;
    padding: 2rem;
    color: white;
    background-color: var(--p-zinc-600);
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
