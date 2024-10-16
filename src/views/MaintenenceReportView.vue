<script setup lang="ts">
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";
import FileUpload, { FileUploadSelectEvent } from "primevue/fileupload";
import { ref, Ref, computed } from "vue";
import {
    generateCosKey,
    getMaintenance,
    postMaintenance,
    uploadCOS,
} from "../api";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Message from "primevue/message";
import Paginator from "primevue/paginator";
import Tag from "primevue/tag";
import Card from "primevue/card";
import { MaintenanceInfo } from "../api";
import { useRequest } from "vue-request";

const visible = ref(false);
const token = ref();
const { data } = useRequest(
    (): Promise<{ success: boolean; data: MaintenanceInfo[] }> =>
        getMaintenance(token.value),
    { pollingInterval: 15000 },
);

const first = ref(0);
const maintenanceData = computed(
    () => data.value?.data.splice(first.value, first.value + 10).filter((item) => item.status == 0) || [],
);
const loading = ref(false);
const isCompleted = ref(true);
const src: Ref<null | string> = ref(null);
const file: Ref<null | File> = ref(null);
const toast = useToast();
const campus = ref(["Shipai Campus", "Knowledge City Campus"]);

const status = [
    "Pending",
    "Approved",
    "Rejected"
]

const severity = [
    "info",
    "success",
    "error"
]

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
    subject: "",
    location: "",
    campus: "",
    email: "",
    filePath: "",
    detail: "",
});

const onClickEvent = async () => {
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
    maintenance.value.filePath = generateCosKey(
        file.value.name.split(".").pop(),
    );
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
    const uploadResult = await uploadCOS(
        file.value,
        maintenance.value.filePath,
    );

    toast.add({
        severity: uploadResult.success ? "success" : "error",
        summary: uploadResult.success ? "Success" : "Error",
        detail: uploadResult.message,
        life: 3000,
    });

    if (!uploadResult.success) {
        loading.value = false;
        return;
    }

    const maintenanceResult = await postMaintenance(maintenance.value);

    if (!maintenanceResult.success) {
        loading.value = false;
        return;
    }

    toast.add({
        severity: maintenanceResult.success ? "success" : "error",
        summary: maintenanceResult.success ? "Success" : "Error",
        detail: maintenanceResult.message,
        life: 3000,
    });
    loading.value = false;
    visible.value = false;
    maintenance.value = {
        studentName: "",
        subject: "",
        location: "",
        campus: "",
        email: "",
        filePath: "",
        detail: "",
    };
};
</script>

<template>
    <h1>Maintenance Report</h1>
    <div v-if="data?.success">
        <Message severity="warn">This page is still in development.</Message>
        <Button
            label="Report for maintenance"
            class="mt-3 mb-3"
            icon="pi pi-plus"
            @click="visible = true"
        ></Button>
        <Dialog
            v-model:visible="visible"
            modal
            class="w-[25rem]"
            header="Report for Maintenance"
        >
            <p class="font-bold m-4">1. Choose a photo</p>
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
                    class="shadow-md rounded-xl w-full sm:w-64 m-3"
                />
                <p v-if="file" id="name" class="m-3">{{ file.name }}</p>
            </div>
            <p class="font-bold m-4">2. Fill out the form</p>
            <div class="flex flex-col items-center align-center">
                <FloatLabel class="m-[20px]">
                    <InputText
                        id="studentName"
                        v-model="maintenance.studentName"
                        v-tooltip.bottom="
                            'Your Chinese name and English name (e.g. 山姆 Sam).'
                        "
                        :invalid="!isCompleted && maintenance.studentName == ''"
                    />
                    <label for="studentName">Name</label>
                </FloatLabel>
                <FloatLabel class="m-[20px]">
                    <InputText
                        id="email"
                        v-model="maintenance.email"
                        v-tooltip.bottom="
                            'Your e-mail (e.g. sam.xulf2024@gdhfi.com).'
                        "
                        :invalid="!isCompleted && maintenance.email == ''"
                    />
                    <label for="email">E-mail</label>
                </FloatLabel>
                <FloatLabel class="m-[20px]">
                    <Select
                        id="campus"
                        v-model="maintenance.campus"
                        v-tooltip.bottom="
                            'The campus where the maintenance was reported.'
                        "
                        :options="campus"
                        :invalid="!isCompleted && maintenance.campus == ''"
                    />
                    <label for="campus">Campus</label>
                </FloatLabel>

                <FloatLabel class="m-[20px]">
                    <InputText
                        id="subject"
                        v-model="maintenance.subject"
                        v-tooltip.bottom="
                            'The subject of your report (e.g. AC Doesn\'t Work).'
                        "
                        :invalid="!isCompleted && maintenance.subject == ''"
                    />
                    <label for="subject">Subject</label>
                </FloatLabel>
                <FloatLabel class="m-[20px]">
                    <Textarea
                        id="location"
                        v-model="maintenance.location"
                        v-tooltip.bottom="
                            'The location you want to report for maintenance (e.g. The classroom).'
                        "
                        :invalid="!isCompleted && maintenance.location == ''"
                    />
                    <label for="location">Location</label>
                </FloatLabel>
                <FloatLabel class="m-[20px]">
                    <Textarea
                        id="detail"
                        v-model="maintenance.detail"
                        v-tooltip.bottom="
                            'The details of your report (e.g. We can not turn on the AC).'
                        "
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
        <p v-if="maintenanceData.length == 0">
            There are currently no applications.
        </p>
        <div class="flex flex-wrap justify-between gap-[1rem] mb-4">
            <div v-for="maintenance in maintenanceData" id="card">
                <Card>
                    <template #content>
                        <div class="ms-4 me-4">
                            <h3>Maintenance #{{ maintenance.id }}</h3>
                            <h4>{{ maintenance.subject }}</h4>
                            <!-- <img
                                :src="getImageSrc(maintenance.filePath)"
                                class="shadow-md rounded-xl w-full sm:w-64 mt-3 mb-3"
                            /> -->
                            <p class="mb-2">
                                <b>Location: </b>
                                {{ maintenance.location }}
                            </p>
                            <p class="mb-2">
                                <b>Campus: </b>
                                {{ maintenance.campus }}
                            </p>
                            <p class="mb-2">
                                <b>Detail: </b>
                                {{ maintenance.detail }}
                            </p>
                            <p class="mb-2">
                                <b>Status: </b>
                                <Tag :value="status[maintenance.status as number]" :severity="severity[maintenance.status as number]"></Tag>
                            </p>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <Paginator
            v-if="maintenanceData.length !== 0"
            class="justify-center"
            :rows="10"
            :totalRecords="maintenanceData.length"
        ></Paginator>
    </div>
</template>

<style scoped>
:deep(.p-inputtext),
.p-select,
.p-textarea {
    border-radius: 0.5rem !important;
    min-width: 17rem;
}

button,
:deep(.p-button) {
    border-radius: 0.5rem;
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

b {
    font-weight: bold;
}

h3 {
    font-size: 1.5em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

h4 {
    font-size: 1.2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

#card {
    width: calc(50% - 0.8rem);
}

#name {
    font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
}

@media screen and (max-width: 720px) {
    #card {
        width: 100%;
    }
}
</style>
