<script setup lang="ts">
import Card from "primevue/card";
const props = defineProps<{
    message?: string;
    status?: string;
}>();
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <Card id="card">
            <template #content>
                <div
                    v-if="status == 'success'"
                    class="flex flex-col items-center justify-center"
                >
                    <h3>{{ $t("application.success") }}</h3>
                    <i
                        class="pi pi-check m-[2rem]"
                        id="status-icon"
                        style="color: var(--p-green-500)"
                    ></i>
                    <p class="w-[20rem] m-[1rem] text-center">
                        {{ props.message }}
                    </p>
                </div>
                <div
                    v-if="status == 'error'"
                    class="flex flex-col items-center justify-center"
                >
                    <h3>{{ $t("application.error") }}</h3>
                    <i
                        class="pi pi-times m-[2rem]"
                        id="status-icon"
                        style="color: var(--p-red-500)"
                    ></i>
                    <p class="w-[20rem] m-[1rem] text-center">
                        <span v-if="props.message == ''">{{
                            $t("reservation.fix_problem")
                        }}</span>
                        {{ props.message }}
                    </p>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
#card {
    width: 28rem;
}

#status-icon {
    font-size: 8rem;
}

h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

h3 {
    display: block;
    font-size: 1.5em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

@media screen and (max-width: 720px) {
    #card {
        width: 25rem;
    }

    h1 {
        font-size: 1.75rem;
    }
}
</style>
