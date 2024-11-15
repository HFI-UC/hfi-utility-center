<script setup lang="ts">
import {
    getLostAndFound,
    getCOS,
    Clue,
    uploadCOS,
    generateCosKey,
    postClue,
} from "../api";
import { useRequest } from "vue-request";
import { computed, onMounted, ref } from "vue";
import Card from "primevue/card";
import Image from "primevue/image";
import Tag from "primevue/tag";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Select from "primevue/select";
import { useI18n } from "vue-i18n";
import router from "../router/router";
import FileUpload, { FileUploadSelectEvent } from "primevue/fileupload";
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";

const props = defineProps<{
    id: number;
}>();

const view = ref(false);
const { t } = useI18n();
const src = ref("");
const visible = ref(false);
const isCompleted = ref(true);
const clue = ref<Clue>({
    contact: "",
    campus: "",
    detail: "",
    location: "",
    filePath: "",
});
const campus = computed(() => [
    { label: t("lostnfound.campus.shipai"), code: "shipai" },
    { label: t("lostnfound.campus.knowledgecity"), code: "kc" },
]);
const img = ref<null | string>(null);
const file = ref<null | File>(null);
const loading = ref(false);
const onFileSelect = (event: FileUploadSelectEvent) => {
    file.value = event.files[0];
    if (!file.value) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        img.value = e.target?.result as string;
    };
    reader.readAsDataURL(file.value);
};

const { data, run } = useRequest(
    () => getLostAndFound(0, props.id.toString(), ""),
    { manual: true },
);

const toast = useToast();

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
    clue.value.filePath = filePath;

    isCompleted.value = !Object.values(clue.value).some(
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

    const clueResult = await postClue(clue.value, props.id);

    toast.add({
        severity: clueResult.success ? "success" : "error",
        summary: clueResult.success ? t("toast.success") : t("toast.error"),
        detail: clueResult.message,
        life: 3000,
    });
    if (!clueResult.success) {
        loading.value = false;
        return;
    }
    resetForm();
    run();
};

onMounted(() => run());

const resetForm = () => {
    visible.value = false;
    clue.value = {
        contact: "",
        campus: "",
        detail: "",
        location: "",
        filePath: "",
    };
    img.value = file.value = null;
    loading.value = false;
};

const severity = ref(["info", "success"]);

const lostnfound = computed(
    () => data.value?.data.filter((item) => item.id == props.id)[0],
);

const typesMapping = computed<Record<string, string>>(() => ({
    found: t("lostnfound.type.found"),
    lost: t("lostnfound.type.lost"),
}));

const campusMapping: Record<string, string> = {
    shipai: t("lostnfound.campus.shipai"),
    kc: t("lostnfound.campus.knowledgecity"),
};

const status = computed(() => [
    t("lostnfound.status.pending"),
    t("lostnfound.status.completed"),
]);

const onViewEvent = async (path: string) => {
    src.value = "";
    view.value = true;
    src.value = await getCOS(path);
};
</script>

<template>
    <h1>{{ $t("lostnfound.lostnfound") }}</h1>
    <Dialog v-model:visible="view" modal class="min-w-[20rem]">
        <div class="flex items-center justify-center">
            <Image
                :src="src"
                preview
                class="w-64 lg:w-auto items-center justify-center"
            ></Image>
        </div>
    </Dialog>
    <Dialog
        v-model:visible="visible"
        modal
        :header="$t('lostnfound.new_clue.header')"
        class="w-[25rem]"
    >
        <p class="font-bold m-4">
            {{ $t("lostnfound.new_clue.choose_photo") }}
        </p>
        <div class="flex flex-col items-center align-center">
            <div class="flex">
                <FileUpload
                    mode="basic"
                    @select="onFileSelect"
                    accept="image/*"
                    customUpload
                    auto
                    :chooseLabel="$t('lostnfound.new_clue.choose')"
                    class="m-3"
                ></FileUpload>
            </div>
            <img
                v-if="img"
                :src="img"
                class="shadow-md rounded-xl w-full sm:w-64 m-3"
            />
            <p v-if="file" id="file" class="m-3">{{ file.name }}</p>
        </div>
        <p class="font-bold m-4">
            {{ $t("lostnfound.new_clue.fill_out") }}
        </p>
        <div class="flex flex-col items-center align-center">
            <FloatLabel class="m-[20px]">
                <InputText
                    id="contact"
                    v-model="clue.contact"
                    :invalid="!isCompleted && clue.contact == ''"
                />
                <label for="contact">{{
                    $t("lostnfound.new_clue.contact")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <Select
                    id="campus"
                    v-model="clue.campus"
                    :invalid="!isCompleted && clue.campus == ''"
                    :options="campus"
                    optionLabel="label"
                    optionValue="code"
                />
                <label for="campus">{{
                    $t("lostnfound.new_clue.campus")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <InputText
                    id="location"
                    v-model="clue.location"
                    :invalid="!isCompleted && clue.location == ''"
                />
                <label for="location">{{
                    $t("lostnfound.new_clue.location")
                }}</label>
            </FloatLabel>
            <FloatLabel class="m-[20px]">
                <InputText
                    id="detail"
                    v-model="clue.detail"
                    :invalid="!isCompleted && clue.detail == ''"
                />
                <label for="detail">{{
                    $t("lostnfound.new_clue.detail")
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
    <Button
        class="mb-4"
        :label="$t('lostnfound.clue.back')"
        icon="pi pi-arrow-left"
        @click="router.go(-1)"
    ></Button>
    <div v-if="lostnfound">
        <Card>
            <template #content>
                <div class="ms-4 me-4 mb-4">
                    <h3>
                        {{ $t("lostnfound.card.header", [lostnfound.id]) }}
                    </h3>
                    <div
                        class="flex items-center justify-center mt-4 gap-[2.5rem] w-full"
                        id="content"
                    >
                        <Image
                            :src="lostnfound.filePath"
                            class="items-center justify-center"
                            id="image"
                            preview
                        ></Image>
                        <div class="h-full" id="text">
                            <p class="mb-3">
                                <b>{{ $t("lostnfound.card.type") }}</b>
                                {{ typesMapping[lostnfound.type] }}
                            </p>
                            <p class="mb-3">
                                <b>{{ $t("lostnfound.card.name") }}</b>
                                {{ lostnfound.studentName }}
                            </p>
                            <p class="mb-3">
                                <b>{{ $t("lostnfound.card.email") }}</b>
                                {{ lostnfound.email }}
                            </p>
                            <p class="mb-3">
                                <b>{{ $t("lostnfound.card.campus") }}</b>
                                {{ campusMapping[lostnfound.campus] }}
                            </p>
                            <p class="mb-3">
                                <b>{{ $t("lostnfound.card.location") }}</b>
                                {{ lostnfound.location }}
                            </p>
                            <p class="mb-3">
                                <b>{{ $t("lostnfound.card.detail") }}</b>
                                {{ lostnfound.detail }}
                            </p>
                            <p class="mb-3" v-if="lostnfound.altContact">
                                <b>{{
                                    $t("lostnfound.card.alternative_contact")
                                }}</b>
                                {{ lostnfound.altContact }}
                            </p>
                            <p class="mb-3" v-if="lostnfound.reward">
                                <b>{{ $t("lostnfound.card.reward") }}</b>
                                {{ lostnfound.reward }}
                            </p>
                            <p class="mb-3">
                                <b>{{ $t("lostnfound.card.status") }}</b>
                                <Tag
                                    :value="
                                        status[lostnfound.isFound as number]
                                    "
                                    :severity="
                                        severity[lostnfound.isFound as number]
                                    "
                                ></Tag>
                            </p>
                        </div>
                    </div>
                </div>
            </template>
        </Card>
        <Card class="mt-8">
            <template #content>
                <div class="ms-4 me-4">
                    <h3>{{ $t("lostnfound.clue.clue") }}</h3>
                    <Button
                        :label="$t('lostnfound.new_clue.header')"
                        icon="pi pi-plus"
                        @click="visible = true"
                    ></Button>
                    <DataTable
                        :value="lostnfound.clues"
                        paginator
                        :rows="10"
                        class="mt-4 mb-4"
                    >
                        <template #empty>
                            <p>{{ $t("lostnfound.empty") }}</p>
                        </template>
                        <Column
                            field="id"
                            :header="$t('lostnfound.clue.column.id')"
                        ></Column>
                        <Column :header="$t('lostnfound.clue.column.campus')">
                            <template #body="{ data }">
                                <p>{{ campusMapping[data.campus] }}</p>
                            </template>
                        </Column>
                        <Column
                            field="location"
                            :header="$t('lostnfound.clue.column.location')"
                        ></Column>
                        <Column
                            field="detail"
                            :header="$t('lostnfound.clue.column.detail')"
                        ></Column>
                        <Column
                            field="contact"
                            :header="$t('lostnfound.clue.column.contact')"
                        ></Column>
                        <Column :header="$t('lostnfound.clue.column.image')">
                            <template #body="{ data }">
                                <Button
                                    icon="pi pi-eye"
                                    :label="$t('lostnfound.clue.view')"
                                    @click="onViewEvent(data.filePath)"
                                ></Button>
                            </template>
                        </Column>
                        <Column
                            field="createdAt"
                            :header="$t('lostnfound.clue.column.created_at')"
                        ></Column>
                    </DataTable>
                </div>
            </template>
        </Card>
    </div>
    <Skeleton v-else height="650px" style="border-radius: 0.75rem"></Skeleton>
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
    unicode-bidi: isolate;
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

:deep(.p-inputtext),
.p-select {
    border-radius: 0.5rem !important;
    min-width: 17rem;
}

#image {
    width: 50%;
}

:deep(img) {
    max-height: 20rem;
}

#file {
    font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
}

#text {
    width: 50%;
}

button,
:deep(.p-button),
:deep(.p-image) {
    border-radius: 0.5rem;
}

:deep(.p-image-preview-mask) {
    border-radius: 0.5rem;
}

@media screen and (max-width: 720px) {
    #image {
        width: 100%;
    }
    #text {
        width: 100%;
    }
    #content {
        flex-wrap: wrap;
    }
}
</style>
