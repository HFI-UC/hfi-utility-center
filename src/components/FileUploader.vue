<script setup lang="ts">
import { uploadCOS } from "@/api";
import { Plus, X } from "lucide-vue-next";
import type { FileUploadUploaderEvent } from "primevue/fileupload";
import { ref } from "vue";

const uploadedFiles = defineModel<string[]>("uploadedFiles");
const uploadLoading = defineModel<boolean>("uploadLoading");
const fileUploadRef = ref();

const onClear = (clearCallback: Function) => {
    clearCallback();
    if (fileUploadRef.value) {
        fileUploadRef.value.uploadedFiles = [];
        fileUploadRef.value.uploadedFileCount = 0;
    }
    uploadedFiles.value = [];
};

const customUploader = async (event: FileUploadUploaderEvent) => {
    uploadLoading.value = true;
    const files = Array.isArray(event.files) ? event.files : [event.files];
    const newUploadedFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadCOS(file);
        if (res.success) {
            Object.defineProperty(file, "key", {
                value: res.data,
                writable: false,
            });
            newUploadedFiles.push(file);
        }
    }
    uploadLoading.value = false;
    if (fileUploadRef.value) {
        fileUploadRef.value.clear();
        const existing = fileUploadRef.value.uploadedFiles || [];
        fileUploadRef.value.uploadedFiles = [...existing, ...newUploadedFiles];
        fileUploadRef.value.uploadedFileCount =
            fileUploadRef.value.uploadedFiles.length;
        uploadedFiles.value = fileUploadRef.value.uploadedFiles.map(
            (file: any) => file.key
        );
    }
    console.log(uploadedFiles.value);
};
</script>
<template>
    <FileUpload
        ref="fileUploadRef"
        accept="image/jpg, image/png, image/jpeg, image/gif, image/tmp, image/tiff"
        customUpload
        auto
        @uploader="customUploader"
        :maxFileSize="5 * 1024 * 1024"
        :multiple="true"
        :fileLimit="5"
        class="border-shadow-300 shadow-sm rounded-md"
    >
        <template #empty>
            <span>Drag photos here to upload.</span>
        </template>
        <template #header="{ chooseCallback, clearCallback, uploadedFiles }">
            <div
                class="flex flex-wrap justify-between items-center flex-1 gap-4"
            >
                <div class="flex gap-2">
                    <Button
                        @click="chooseCallback()"
                        severity="secondary"
                        size="small"
                        :disabled="uploadLoading"
                        ><Plus></Plus><span>Choose file(s)</span></Button
                    >
                    <Button
                        @click="onClear(clearCallback)"
                        severity="danger"
                        :disabled="
                            !uploadedFiles ||
                            uploadedFiles.length === 0 ||
                            uploadLoading
                        "
                        size="small"
                        ><X></X><span>Clear</span></Button
                    >
                </div>
            </div>
        </template>
    </FileUpload>
</template>
