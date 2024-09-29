<script setup lang="ts">
import ApplicationForm from "../components/ApplicationForm.vue";
import ApplicationStatus from "../components/ApplicationStatus.vue";

const props = defineProps<{
    status?: string;
    message?: string;
}>();
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <div class="card flex flex-col justify-center" id="timeline">
            <h1>Application Form</h1>
        </div>
    </div>
    <ApplicationForm v-if="!props.status" />
    <ApplicationStatus v-else :status="props.status" :message="props.message" />
</template>

<style scoped>
h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    text-align: center;
    unicode-bidi: isolate;
}
</style>
