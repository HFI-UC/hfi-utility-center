<script setup lang="ts">
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";
import FileUpload, { FileUploadSelectEvent } from "primevue/fileupload";
import { ref, computed, onMounted } from "vue";
import {
    generateCosKey,
    getMaintenance,
    postMaintenance,
    postMaintenanceAction,
    uploadCOS,
    verifyAdmin,
} from "../api";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Skeleton from "primevue/skeleton";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";
import Button from "primevue/button";
import Select from "primevue/select";
import Paginator from "primevue/paginator";
import Tag from "primevue/tag";
import Image from "primevue/image";
import Card from "primevue/card";
import { MaintenanceInfo } from "../api";
import { useRequest } from "vue-request";
import { useI18n } from "vue-i18n";

const visible = ref(false);
const token = ref(sessionStorage.getItem("token") || "");
const isAdmin = ref(false);
const { run, data } = useRequest(() => getMaintenance(token.value), {
    manual: true,
});
const { t } = useI18n();
const first = ref(0);
const filteredMaintenanceData = computed(
    () =>
        data.value?.data.filter((item) => {
            const regex = new RegExp(query.value, "i");
            return (
                query.value === "" ||
                item.subject.match(regex) ||
                item.detail.match(regex) ||
                item.id?.toString().match(regex) ||
                item.location.match(regex) ||
                item.studentName.match(regex) ||
                item.email.match(regex) ||
                status.value[item.status as number].match(regex)
            );
        }) || [],
);
const maintenanceData = computed(() =>
    filteredMaintenanceData.value.slice(first.value, first.value + 10),
);

const loading = ref(false);
const src = ref<null | string>(null);
const file = ref<null | File>(null);
const toast = useToast();
const campus = computed(() => [
    { label: t("maintenance.campus.shipai"), code: "shipai" },
    { label: t("maintenance.campus.knowledgecity"), code: "kc" },
]);
const status = computed(() => [
    t("maintenance.status.pending"),
    t("maintenance.status.solved"),
    t("maintenance.status.unscheduled"),
    t("maintenance.status.duplicated"),
]);
const severity = ["info", "success", "danger", "warn"];
const query = ref("");
const maintenance = ref<MaintenanceInfo>({
    studentName: "",
    subject: "",
    location: "",
    campus: "",
    email: "",
    filePath: "",
    detail: "",
});

const campusMapping: Record<string, string> = {
    shipai: t("maintenance.campus.shipai"),
    kc: t("maintenance.campus.knowledgecity"),
};
const onFileSelect = (event: FileUploadSelectEvent) => {
    file.value = event.files[0];
    if (!file.value) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        src.value = e.target?.result as string;
    };
    reader.readAsDataURL(file.value);
};

onMounted(async () => {
    run();
    if (token.value && (await verifyAdmin(token.value))) {
        isAdmin.value = true;
    }
});

const onActionEvent = (maintenance: MaintenanceInfo, action: number) => {
    postMaintenanceAction(token.value, maintenance.id as number, action).then(
        (res) => {
            toast.add({
                severity: res.success ? "success" : "error",
                summary: res.success ? t("toast.success") : t("toast.error"),
                detail: res.message,
                life: 2000,
            });
            if (res.success) {
                run();
            }
        },
    );
};

const isCompleted = ref(true);

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
    maintenance.value.filePath = filePath;

    isCompleted.value = !Object.values(maintenance.value).some(
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

    const maintenanceResult = await postMaintenance(maintenance.value);


    toast.add({
        severity: maintenanceResult.success ? "success" : "error",
        summary: maintenanceResult.success
            ? t("toast.success")
            : t("toast.error"),
        detail: maintenanceResult.message,
        life: 3000,
    });
    if (!maintenanceResult.success) {
        loading.value = false;
        return;
    }
    resetForm();
    run();
};

const resetForm = () => {
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
    src.value = file.value = null;
    loading.value = false;
};
</script>

<template>
    <h1>{{ $t("maintenance.maintenance") }}</h1>
    <div v-if="data?.success">
        <Button
            :label="$t('maintenance.new_maintenance.header')"
            icon="pi pi-plus"
            @click="visible = true"
        ></Button>
        <div class="justify-left mt-4 mb-4">
            <IconField>
                <InputIcon class="pi pi-search"></InputIcon>
                <InputText
                    :placeholder="$t('maintenance.search')"
                    v-model="query"
                ></InputText>
            </IconField>
        </div>
        <Dialog
            v-model:visible="visible"
            modal
            class="w-[25rem]"
            :header="$t('maintenance.new_maintenance.header')"
        >
            <p class="font-bold m-4">
                {{ $t("maintenance.new_maintenance.choose_photo") }}
            </p>
            <div class="flex flex-col items-center align-center">
                <div class="flex">
                    <FileUpload
                        mode="basic"
                        @select="onFileSelect"
                        accept="image/*"
                        customUpload
                        auto
                        :chooseLabel="$t('maintenance.new_maintenance.choose')"
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
                {{ $t("maintenance.new_maintenance.fill_out") }}
            </p>
            <div class="flex flex-col items-center align-center">
                <FloatLabel class="m-[20px]">
                    <InputText
                        id="studentName"
                        v-model="maintenance.studentName"
                        v-tooltip.bottom="$t('maintenance.tooltip.name')"
                        :invalid="!isCompleted && maintenance.studentName == ''"
                    />
                    <label for="studentName">{{
                        $t("maintenance.new_maintenance.name")
                    }}</label>
                </FloatLabel>
                <FloatLabel class="m-[20px]">
                    <InputText
                        id="email"
                        v-model="maintenance.email"
                        v-tooltip.bottom="
                            $t('maintenance.tooltip.email', [
                                'sam.xulf2024@gdhfi.com',
                            ])
                        "
                        :invalid="!isCompleted && maintenance.email == ''"
                    />
                    <label for="email">{{
                        $t("maintenance.new_maintenance.email")
                    }}</label>
                </FloatLabel>
                <FloatLabel class="m-[20px]">
                    <Select
                        id="campus"
                        v-model="maintenance.campus"
                        v-tooltip.bottom="$t('maintenance.tooltip.campus')"
                        :options="campus"
                        optionLabel="label"
                        optionValue="code"
                        :invalid="!isCompleted && maintenance.campus == ''"
                    />
                    <label for="campus">{{
                        $t("maintenance.new_maintenance.campus")
                    }}</label>
                </FloatLabel>

                <FloatLabel class="m-[20px]">
                    <InputText
                        id="subject"
                        v-model="maintenance.subject"
                        v-tooltip.bottom="$t('maintenance.tooltip.subject')"
                        :invalid="!isCompleted && maintenance.subject == ''"
                    />
                    <label for="subject">{{
                        $t("maintenance.new_maintenance.subject")
                    }}</label>
                </FloatLabel>
                <FloatLabel class="m-[20px]">
                    <Textarea
                        id="location"
                        v-model="maintenance.location"
                        v-tooltip.bottom="$t('maintenance.tooltip.location')"
                        :invalid="!isCompleted && maintenance.location == ''"
                    />
                    <label for="location">{{
                        $t("maintenance.new_maintenance.location")
                    }}</label>
                </FloatLabel>
                <FloatLabel class="m-[20px]">
                    <InputText
                        id="detail"
                        v-model="maintenance.detail"
                        v-tooltip.bottom="$t('maintenance.tooltip.detail')"
                        :invalid="!isCompleted && maintenance.detail == ''"
                    />
                    <label for="detail">{{
                        $t("maintenance.new_maintenance.detail")
                    }}</label>
                </FloatLabel>
            </div>
            <div class="flex justify-end gap-2 m-3">
                <Button
                    :label="$t('maintenance.new_maintenance.cancel')"
                    severity="secondary"
                    @click="visible = false"
                ></Button>
                <Button
                    :label="$t('maintenance.new_maintenance.submit')"
                    :loading="loading"
                    icon="pi pi-plus"
                    @click="onClickEvent()"
                ></Button>
            </div>
        </Dialog>
        <p v-if="maintenanceData.length == 0">
            {{ $t("maintenance.empty") }}
        </p>
        <div class="flex flex-wrap justify-between gap-[1rem] mb-8">
            <div v-for="maintenance in maintenanceData" id="card">
                <Card>
                    <template #content>
                        <div class="ms-4 me-4 min-h-[40rem]">
                            <h3>
                                {{
                                    $t("maintenance.card.header", [
                                        maintenance.id,
                                    ])
                                }}
                            </h3>
                            <h4>{{ maintenance.subject }}</h4>
                            <Image
                                :src="maintenance.filePath"
                                class="w-full h-[20rem] items-center justify-center mt-4 mb-6"
                                preview
                            ></Image>
                            <p class="mb-3" v-if="isAdmin">
                                <b>{{ $t("maintenance.card.name") }}</b>
                                {{ maintenance.studentName }}
                            </p>
                            <p class="mb-3" v-if="isAdmin">
                                <b>{{ $t("maintenance.card.email") }}</b>
                                {{ maintenance.email }}
                            </p>
                            <p class="mb-3">
                                <b>{{ $t("maintenance.card.location") }}</b>
                                {{ maintenance.location }}
                            </p>
                            <p class="mb-3">
                                <b>{{ $t("maintenance.card.campus") }}</b>
                                {{ campusMapping[maintenance.campus] }}
                            </p>
                            <p class="mb-3">
                                <b>{{ $t("maintenance.card.detail") }}</b>
                                {{ maintenance.detail }}
                            </p>
                            <p class="mb-3">
                                <b>{{ $t("maintenance.card.status") }}</b>
                                <Tag
                                    :value="
                                        status[maintenance.status as number]
                                    "
                                    :severity="
                                        severity[maintenance.status as number]
                                    "
                                ></Tag>
                            </p>
                        </div>
                    </template>
                    <template #footer v-if="isAdmin">
                        <div class="justify-left">
                            <p class="ms-4 font-bold">
                                {{ $t("maintenance.card.mark_as") }}
                            </p>
                        </div>
                        <div class="m-4 flex gap-4" id="buttons">
                            <Button
                                class="w-full"
                                :label="$t('maintenance.status.duplicated')"
                                severity="warn"
                                icon="pi pi-clone"
                                @click="onActionEvent(maintenance, 3)"
                            >
                            </Button>
                            <Button
                                class="w-full"
                                :label="$t('maintenance.status.unscheduled')"
                                severity="danger"
                                icon="pi pi-times"
                                @click="onActionEvent(maintenance, 2)"
                            >
                            </Button>
                            <Button
                                class="w-full"
                                :label="$t('maintenance.status.solved')"
                                severity="success"
                                icon="pi pi-check"
                                @click="onActionEvent(maintenance, 1)"
                            >
                            </Button>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <Paginator
            v-if="filteredMaintenanceData.length !== 0"
            class="justify-center"
            v-model:first="first"
            :rows="10"
            :totalRecords="filteredMaintenanceData.length"
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

:deep(.p-image-preview-mask) {
    border-radius: 0.5rem;
}

:deep(img) {
    max-height: 20rem;
}

h4 {
    font-size: 1.3em;
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
    #buttons {
        flex-wrap: wrap;
    }
}
</style>
