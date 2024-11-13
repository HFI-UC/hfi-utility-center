<script setup lang="ts">
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import FileUpload from "primevue/fileupload";
import Card from "primevue/card";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Image from "primevue/image";
import Tag from "primevue/tag";
import Paginator from "primevue/paginator";
import Skeleton from "primevue/skeleton";
import { ref, computed, onMounted, watch } from "vue";
import {
    LostAndFoundInfo,
    generateCosKey,
    uploadCOS,
    postLostAndFound,
    getLostAndFound,
} from "../api";
import router from "../router/router";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Select from "primevue/select";
import { FileUploadSelectEvent } from "primevue/fileupload";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { useRequest } from "vue-request";

const visible = ref(false);
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

const first = ref(0);

const { data, run } = useRequest(
    () => getLostAndFound(first.value, query.value),
    {
        manual: true,
    },
);

const lostnfoundData = computed(() => data.value?.data || []);

const campusMapping: Record<string, string> = {
    shipai: t("lostnfound.campus.shipai"),
    kc: t("lostnfound.campus.knowledgecity"),
};
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

const onSearchEvent = () => {
    if (query.value == "") return;
    run();
};

const query = ref("");
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

watch(
    () => first.value,
    () => run(),
);

const typesMapping = computed<Record<string, string>>(() => ({
    found: t("lostnfound.type.found"),
    lost: t("lostnfound.type.lost"),
}));

const status = computed(() => [
    t("lostnfound.status.pending"),
    t("lostnfound.status.completed"),
]);

const severity = ref(["info", "success"]);

onMounted(() => {
    run();
});
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
                    v-model="lostnfound.altContact"
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
    <div v-if="data?.success">
        <Button
            :label="$t('lostnfound.new_lostnfound.header')"
            icon="pi pi-plus"
            @click="visible = true"
        ></Button>
        <div class="flex gap-4 justify-left mt-4 mb-4">
            <IconField>
                <InputIcon class="pi pi-search"></InputIcon>
                <InputText
                    :placeholder="$t('lostnfound.search')"
                    v-model="query"
                ></InputText>
            </IconField>
            <Button
                :label="$t('lostnfound.search')"
                @click="onSearchEvent()"
                icon="pi pi-search"
            ></Button>
        </div>
        <p v-if="lostnfoundData.length == 0">
            {{ $t("lostnfound.empty") }}
        </p>
        <div class="flex flex-wrap justify-between gap-[1rem] mb-8">
            <div v-for="lostnfound in lostnfoundData" id="card">
                <Card>
                    <template #content>
                        <div class="ms-4 me-4 min-h-[48rem]">
                            <h3>
                                {{
                                    $t("lostnfound.card.header", [
                                        lostnfound.id,
                                    ])
                                }}
                            </h3>
                            <Image
                                :src="lostnfound.filePath"
                                class="w-full h-[20rem] items-center justify-center mt-4 mb-6"
                                preview
                            ></Image>
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
                    </template>
                    <template #footer>
                        <div class="m-4 flex gap-4" id="buttons">
                            <Button
                                class="w-full"
                                :label="$t('lostnfound.card.view_clues')"
                                @click="
                                    router.push(
                                        `/lostnfound/detail?id=${lostnfound.id}`,
                                    )
                                "
                            ></Button>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <Paginator
            v-if="lostnfoundData.length !== 0"
            class="justify-center"
            v-model:first="first"
            :rows="1"
            :totalRecords="data?.totalPages"
        ></Paginator>
    </div>
    <Skeleton v-else height="650px" style="border-radius: 0.75rem"></Skeleton>
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

:deep(.p-image-preview-mask) {
    border-radius: 0.5rem;
}

:deep(img) {
    max-height: 20rem;
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

#buttons {
    flex-wrap: nowrap;
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

p > #name {
    font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
}

#card {
    width: calc(50% - 0.8rem);
}

@media screen and (max-width: 720px) {
    #card {
        width: 100%;
    }
    #buttons {
        flex-wrap: wrap;
    }
}
</style>
