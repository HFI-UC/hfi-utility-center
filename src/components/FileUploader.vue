<script setup lang="ts">
import { uploadCOS } from "@/api";
import { Plus, X } from "lucide-vue-next";
import type { FileUploadUploaderEvent } from "primevue/fileupload";
import { ref } from "vue";

const uploadedFilesModel = defineModel<string[]>("uploadedFiles", { default: () => [] });
const uploadLoading = defineModel<boolean>("uploadLoading");
const fileUploadRef = ref();

const getFilePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
};

const onClear = (clearCallback: Function) => {
    clearCallback();
    if (fileUploadRef.value) {
        fileUploadRef.value.uploadedFiles = [];
        fileUploadRef.value.uploadedFileCount = 0;
    }
    uploadedFilesModel.value = [];
};

const removeUploadedUrl = (index: number) => {
    if (!uploadedFilesModel.value) return;
    uploadedFilesModel.value = [
        ...uploadedFilesModel.value.slice(0, index),
        ...uploadedFilesModel.value.slice(index + 1)
    ];
};

const customUploader = async (event: FileUploadUploaderEvent) => {
    uploadLoading.value = true;
    const files = Array.isArray(event.files) ? event.files : [event.files];
    const newUploadedFiles: string[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadCOS(file);
        if (res.success && res.data) {
            newUploadedFiles.push(res.data);
        }
    }
    uploadLoading.value = false;
    
    uploadedFilesModel.value = [...(uploadedFilesModel.value || []), ...newUploadedFiles];
    
    if (fileUploadRef.value) {
        fileUploadRef.value.clear(); 
        fileUploadRef.value.uploadedFiles = [];
        fileUploadRef.value.uploadedFileCount = 0;
    }
};

const extractFilename = (url: string) => {
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/');
        return parts[parts.length - 1] || 'image';
    } catch(e) {
        const parts = url.split('/');
        return parts[parts.length - 1] || 'image';
    }
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
            <p v-if="!(uploadedFilesModel?.length)" class="text-sm dark:text-surface-300 text-surface-500">
                Drag photos here to upload.
            </p>
        </template>
        <template #header="{ chooseCallback, clearCallback, files }">
            <div class="flex flex-wrap justify-between items-center gap-4">
                <div class="flex gap-2">
                    <Button
                        @click="chooseCallback()"
                        severity="secondary"
                        size="small"
                        :disabled="uploadLoading || (uploadedFilesModel?.length || 0) + files.length >= 5"
                        ><Plus></Plus><span>Choose file(s)</span></Button
                    >
                    <Button
                        @click="onClear(clearCallback)"
                        severity="danger"
                        :disabled="
                            (!uploadedFilesModel?.length && !files?.length) ||
                            uploadLoading
                        "
                        size="small"
                        ><X></X><span>Clear</span></Button
                    >
                </div>
            </div>
        </template>
        <template
            #content="{
                files,
                removeFileCallback,
            }"
        >
            <div
                v-if="files.length > 0 || (uploadedFilesModel?.length || 0) > 0"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
            >
                <div
                    v-for="(fileStr, index) of uploadedFilesModel"
                    :key="'m_' + index"
                    class="p-8 rounded-border flex flex-col border border-surface items-center gap-4 col-span-1"
                >
                    <div
                        class="w-full h-60 overflow-hidden flex items-center justify-center"
                    >
                        <img
                            role="presentation"
                            :alt="extractFilename(fileStr)"
                            :src="fileStr"
                            class="max-w-full max-h-full object-contain rounded"
                        />
                    </div>
                    <span
                        :title="extractFilename(fileStr)"
                        class="truncate w-full text-center"
                        >{{ extractFilename(fileStr) }}</span
                    >
                    <Button
                        @click="removeUploadedUrl(index)"
                        outlined
                        severity="danger"
                        ><X></X
                    ></Button>
                </div>

                <div
                    v-for="(file, index) of files"
                    :key="file.name + file.type + file.size"
                    class="p-8 rounded-border flex flex-col border border-surface items-center gap-4 col-span-1"
                >
                    <div
                        class="w-full h-60 overflow-hidden flex items-center justify-center"
                    >
                        <img
                            role="presentation"
                            :alt="file.name"
                            :src="getFilePreviewUrl(file)"
                            class="max-w-full max-h-full object-contain rounded"
                        />
                    </div>
                    <span
                        :title="file.name"
                        class="truncate w-full text-center"
                        >{{ file.name }}</span
                    >
                    <Badge value="Pending" severity="warn" />
                    <Button
                        @click="removeFileCallback(index)"
                        variant="outlined"
                        severity="danger"
                        ><X></X
                    ></Button>
                </div>
            </div>
        </template>
    </FileUpload>
</template>
