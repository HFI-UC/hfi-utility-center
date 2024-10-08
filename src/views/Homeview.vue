<script setup lang="ts">
import Dialog from "primevue/dialog";
import { ref } from "vue";
const visible = ref(true);
</script>

<template>
    <Dialog
        v-model:visible="visible"
        header="Announcement"
        class="w-[25rem]"
        modal
    >
        <div class="flex items-center justify-center gap-4 mb-8">
            <p>
                You are using the
                <b class="font-bold">Beta Version (Cenozoic)</b> of HFI Utility
                Center! Go to
                <a href="https://hfiuc.org" style="color: var(--p-primary-500)"
                    >https://hfiuc.org/</a
                >
                if you want to sumbit a room application!
            </p>
        </div>
    </Dialog>
    <div class="flex flex-col items-center justify-center" id="home-container">
        <h1 class="flex">HFI Utility Center</h1>
        <h3 class="flex">Cenozoic</h3>
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
    font-size: 2.5em;
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

@media screen and (max-width: 720px) {
    h1 {
        font-size: 2.5rem;
    }
    h3 {
        font-size: 1.25rem;
    }
}
</style>
