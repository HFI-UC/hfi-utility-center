<script setup lang="ts">
import FileUpload, { FileUploadSelectEvent } from "primevue/fileupload";
import Button from "primevue/button";
import { uploadCOS } from "../api";
import { Ref, ref } from "vue";

const src: Ref<null | string> = ref(null);
const file: Ref<null | File> = ref(null);

const onFileSelect = (event: FileUploadSelectEvent) => {
    file.value = event.files[0];
    if (!file.value) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        src.value = e.target?.result as string;
    };
    reader.readAsDataURL(file.value);
};

const onUploadEvent = () => {
    if (!file.value) return;
    uploadCOS(file.value);
};
</script>

<template>
    <div class="flex flex-col items-center align-center">
        <div class="flex">
            <FileUpload
                mode="basic"
                @select="onFileSelect"
                accept="image/*"
                customUpload
                auto
                class="m-3"
            ></FileUpload>
            <Button
                @click="onUploadEvent"
                label="Upload"
                icon="pi pi-upload"
                class="m-3"
                severity="secondary"
            ></Button>
        </div>
        <img
            v-if="src"
            :src="src"
            alt="Image"
            class="shadow-md rounded-xl w-full sm:w-64 m-3"
        />
    </div>
</template>
