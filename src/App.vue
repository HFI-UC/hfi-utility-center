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
                icon: "pi pi-table",
                url: "/reservation/create",
            },
        ],
    },
]);

const iconClass = ref("pi-sun");

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
                <Button @click="toggleColorScheme()" class="button">
                    <i :class="`pi ${iconClass}`" />
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
</style>
