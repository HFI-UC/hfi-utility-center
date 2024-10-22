<script setup lang="ts">
// import Dialog from "primevue/dialog";
// import { ref } from "vue";
// const visible = ref(true);
import router from "../router/router";
import Button from "primevue/button";
</script>

<template>
    <!-- <Dialog
        v-model:visible="visible"
        header="Announcement"
        class="w-[25rem]"
        modal
    >
        <div class="flex items-center justify-center gap-4 mb-8">
            <p>
                You are using the
                <b>Beta Version (Cenozoic)</b> of HFI Utility
                Center! Go to
                <a href="https://hfiuc.org" style="color: var(--p-primary-500)"
                    >https://hfiuc.org/</a
                >
                if you want to sumbit a room application!
            </p>
        </div>
    </Dialog> -->
    <div class="flex flex-col items-center justify-center" id="home-container">
        <h1 class="text-center">{{ $t("home.title") }}</h1>
        <h3 class="text-center">{{ $t("home.subtitle") }}</h3>
        <div class="mt-[4rem] flex flex-wrap gap-4 items-center justify-center">
            <Button
                :label="$t('home.button.form')"
                icon="pi pi-pen-to-square"
                @click="router.push('/reservation/create')"
            ></Button>
            <Button
                :label="$t('home.button.status')"
                icon="pi pi-chart-bar"
                severity="secondary"
                @click="router.push('/reservation/status')"
            ></Button>
        </div>
    </div>
</template>

<style scoped>
h1 {
    font-size: 5em;
    margin-block-start: 0.1em;
    margin-block-end: 0.1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: 900;
    background: linear-gradient(to right, #8a9cff, #bc3fff);
    background-clip: border-box;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    unicode-bidi: isolate;
}
h3 {
    font-size: 1.8em;
    margin-block-start: 0.1em;
    margin-block-end: 0.1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}
#home-container {
    height: 80vh;
}

button {
    border-radius: 0.5rem;
}

b {
    font-weight: bold;
}

@media screen and (max-width: 820px) {
    h1 {
        font-size: 2.3rem;
    }
    h3 {
        font-size: 1.1rem;
    }
}
</style>
