<script setup lang="ts">
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import FileUpload from "primevue/fileupload";
import { ref, computed } from "vue";
import {
    LostAndFoundInfo,
    generateCosKey,
    uploadCOS,
    postLostAndFound,
} from "../api";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Select from "primevue/select";
import { FileUploadSelectEvent } from "primevue/fileupload";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";

const visible = ref(true);
const onFileSelect = (event: FileUploadSelectEvent) => {
    file.value = event.files[0];
    if (!file.value) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        src.value = e.target?.result as string;
    };
    reader.readAsDataURL(file.value);
};
const toast = useToast();
const loading = ref(false);
const { t } = useI18n();
const types = ref([
    {
        label: t("lostnfound.type.lost"),
        code: "lost",
    },
    { label: t("lostnfound.type.found"), code: "found" },
]);
const campus = computed(() => [
    { label: t("lostnfound.campus.shipai"), code: "shipai" },
    { label: t("lostnfound.campus.knowledgecity"), code: "kc" },
]);

// const campusMapping: Record<string, string> = {
//     shipai: t("lostnfound.campus.shipai"),
//     kc: t("lostnfound.campus.knowledgecity"),
// };
const lostnfound = ref<LostAndFoundInfo>({
    studentName: "",
    detail: "",
    location: "",
    email: "",
    filePath: "",
    password: "",
    campus: "",
    type: "",
});

const isCompleted = ref(true);
const src = ref<null | string>(null);
const file = ref<null | File>(null);

const onClickEvent = async () => {
    isCompleted.value = true;
    if (!file.value) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: t("toast.choose_photo"),
        });
        return;
    }

    loading.value = true;

    const filePath = generateCosKey(file.value.name.split(".").pop());
    lostnfound.value.filePath = filePath;

    isCompleted.value = !Object.values(lostnfound.value).some(
        (value) => value === "",
    );
    if (!isCompleted.value) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: t("toast.required_field"),
            life: 3000,
        });
        loading.value = false;
        return;
    }

    const uploadResult = await uploadCOS(file.value, filePath);
    if (!uploadResult.success) {
        loading.value = false;
        return;
    }

    const lostnfoundResult = await postLostAndFound(lostnfound.value);
    if (!lostnfoundResult.success) {
        loading.value = false;
        return;
    }

    toast.add({
        severity: lostnfoundResult.success ? "success" : "error",
        summary: lostnfoundResult.success
            ? t("toast.success")
            : t("toast.error"),
        detail: lostnfoundResult.message,
        life: 3000,
    });
    resetForm();
};

const resetForm = () => {
    visible.value = false;
    lostnfound.value = {
        studentName: "",
        detail: "",
        location: "",
        email: "",
        filePath: "",
        password: "",
        campus: "",
        type: "",
    };
    src.value = file.value = null;
    loading.value = false;
};
</script>

<template>
    <h1>{{ $t("lostnfound.lostnfound") }}</h1>
    <Dialog
        v-model:visible="visible"
        modal
        class="w-[25rem]"
        :header="$t('lostnfound.new_lostnfound.header')"
    >
        <p class="font-bold m-4">
            {{ $t("lostnfound.new_lostnfound.choose_photo") }}
        </p>
        <div class="flex flex-col items-center align-center">
            <div class="flex">
                <FileUpload
                    mode="basic"
                    @select="onFileSelect"
                    accept="image/*"
                    customUpload
                    auto
                    :chooseLabel="$t('lostnfound.new_lostnfound.choose')"
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
        <p class="font-bold m-4">
            {{ $t("lostnfound.new_lostnfound.fill_out") }}
        </p>
        <div class="flex flex-col items-center align-center">
            <FloatLabel class="m-[20px]">
                <InputText
                    id="name"
                    v-model="lostnfound.studentName"
                    :invalid="!isCompleted && lostnfound.studentName == ''"
                />
                <label for="name">{{
                    $t("lostnfound.new_lostnfound.name")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <InputText
                    id="email"
                    v-model="lostnfound.email"
                    :invalid="!isCompleted && lostnfound.email == ''"
                />
                <label for="email">{{
                    $t("lostnfound.new_lostnfound.email")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <InputText
                    id="password"
                    type="password"
                    v-model="lostnfound.password"
                    :invalid="!isCompleted && lostnfound.password == ''"
                />
                <label for="password">{{
                    $t("lostnfound.new_lostnfound.password")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <Select
                    id="type"
                    v-model="lostnfound.type"
                    :invalid="!isCompleted && lostnfound.type == ''"
                    :options="types"
                    optionLabel="label"
                    optionValue="code"
                />
                <label for="type">{{
                    $t("lostnfound.new_lostnfound.type")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <Select
                    id="campus"
                    v-model="lostnfound.campus"
                    :invalid="!isCompleted && lostnfound.type == ''"
                    :options="campus"
                    optionLabel="label"
                    optionValue="code"
                />
                <label for="campus">{{
                    $t("lostnfound.new_lostnfound.campus")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <InputText
                    id="location"
                    v-model="lostnfound.location"
                    :invalid="!isCompleted && lostnfound.location == ''"
                />
                <label for="location">{{
                    $t("lostnfound.new_lostnfound.location")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <InputText
                    id="detail"
                    v-model="lostnfound.detail"
                    :invalid="!isCompleted && lostnfound.detail == ''"
                />
                <label for="detail">{{
                    $t("lostnfound.new_lostnfound.detail")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <InputText id="reward" v-model="lostnfound.reward" />
                <label for="reward">{{
                    $t("lostnfound.new_lostnfound.reward")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <InputText
                    id="alternativeContact"
                    v-model="lostnfound.alternativeContact"
                />
                <label for="alternativeContact">{{
                    $t("lostnfound.new_lostnfound.alternative_contact")
                }}</label>
            </FloatLabel>
        </div>
        <div class="flex justify-end gap-2 m-3">
            <Button
                type="button"
                :label="$t('lostnfound.new_lostnfound.cancel')"
                severity="secondary"
                @click="visible = false"
            ></Button>
            <Button
                type="button"
                :label="$t('lostnfound.new_lostnfound.submit')"
                :loading="loading"
                icon="pi pi-plus"
                @click="onClickEvent()"
            ></Button>
        </div>
    </Dialog>
</template>

<style scoped>
:deep(.p-inputtext),
.p-select {
    border-radius: 0.5rem !important;
    min-width: 17rem;
}

button,
:deep(.p-button),
:deep(.p-image) {
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

#name {
    font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
}
</style>
