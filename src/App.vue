<script setup lang="ts">
import { RouterView } from "vue-router";
import { ref } from "vue";
import Menubar from "primevue/menubar";
import Button from "primevue/button";
import "./styles.css";
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
                label: "Application Status",
                icon: "pi pi-table",
                url: "/reservation/status",
            },
        ],
    },
]);

const iconClass = ref("pi-sun");

function redirect() {
    window.location.href = "/Administration.html"
}

function toggleColorScheme() {
    const root = document.getElementsByTagName("html")[0];
    root.classList.toggle("p-dark");
    iconClass.value = iconClass.value === "pi-moon" ? "pi-sun" : "pi-moon";
}
</script>

<template>
    <div>
        <Menubar :model="items" class="menubar">
            <template #start>
                <img src="./assets/logo.svg" class="m-1" style="height: 25px" />
            </template>
            <template #end>
                <Button
                    @click="redirect()"
                    style="
                        background-color: var(--p-teal-500);
                        border-color: var(--p-teal-500);
                    "
                >
                    <i class="pi pi-sign-in"></i>
                    <span class="text-sm">Login</span>
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
</template>

<style scoped>
#body {
    padding: 1rem 2rem 4rem 2rem;
}
.p-button {
    margin-left: 3px;
    margin-right: 3px;
}
</style>
