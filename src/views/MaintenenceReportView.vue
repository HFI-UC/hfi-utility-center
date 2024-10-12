<script setup lang="ts">
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";
import FileUpload, { FileUploadSelectEvent } from "primevue/fileupload";
import { ref, Ref } from "vue";
import { uploadCOS } from "../api";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import { MaintenanceInfo } from "../api";

const visible = ref(true);
const loading = ref(false);
const isCompleted = ref(true);
const src: Ref<null | string> = ref(null);
const file: Ref<null | File> = ref(null);
const toast = useToast();

const onFileSelect = (event: FileUploadSelectEvent) => {
    file.value = event.files[0];
    if (!file.value) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        src.value = e.target?.result as string;
    };
    reader.readAsDataURL(file.value);
};

const maintenance: Ref<MaintenanceInfo> = ref({
    studentName: "",
    summary: "",
    detail: "",
});

const onClickEvent = () => {
    loading.value = true;
    if (!file.value) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please choose a photo to upload!",
        });
        loading.value = false;
        return;
    }
    isCompleted.value = !Object.values(maintenance.value).some(
        (value) => value === "",
    );
    if (!isCompleted.value) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill out the required field!",
            life: 3000,
        });
        loading.value = false;
        return;
    }
    uploadCOS(file.value).then((res) => {
        toast.add({
            severity: res.success ? "success" : "error",
            summary: res.success ? "Success" : "Error",
            detail: res.message,
            life: 3000,
        });
    });
};
</script>

<template>
    <h1>Maintenance Report</h1>
    <Dialog
        v-model:visible="visible"
        modal
        class="w-[25rem]"
        header="Report for Maintenance"
    >
        <h3 class="font-bold m-4">1. Choose a photo</h3>
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
            </div>
            <img
                v-if="src"
                :src="src"
                class="shadow-md rounded-xl w-full sm:w-32 m-3"
            />
            <p v-if="file" class="m-3">{{ file.name }}</p>
        </div>
        <h3 class="font-bold m-4">2. Fill out the form</h3>
        <div class="flex flex-col items-center align-center">
            <FloatLabel class="m-[20px]">
                <InputText
                    id="studentName"
                    v-model="maintenance.studentName"
                    :invalid="!isCompleted && maintenance.studentName == ''"
                />
                <label for="studentName">Name</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <InputText
                    id="summary"
                    v-model="maintenance.summary"
                    :invalid="!isCompleted && maintenance.summary == ''"
                />
                <label for="summary">Summary</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <Textarea
                    id="detail"
                    v-model="maintenance.detail"
                    :invalid="!isCompleted && maintenance.detail == ''"
                />
                <label for="detail">Detail</label>
            </FloatLabel>
        </div>
        <div class="flex justify-end gap-2 m-3">
            <Button
                type="button"
                label="Cancel"
                severity="secondary"
                @click="visible = false"
            ></Button>
            <Button
                type="button"
                label="Submit"
                :loading="loading"
                icon="pi pi-plus"
                @click="onClickEvent()"
            ></Button>
        </div>
    </Dialog>
</template>

<style scoped>
.p-select,
.p-datepicker,
.p-textarea,
input {
    min-width: 17rem;
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
</style>
