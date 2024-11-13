<script setup lang="ts">
import { getLostAndFound, getCOS } from "../api";
import { useRequest } from "vue-request";
import { computed, ref } from "vue";
import Card from "primevue/card";
import Image from "primevue/image";
import Tag from "primevue/tag";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { useI18n } from "vue-i18n";
import Dialog from "primevue/dialog";

const props = defineProps<{
    id: number;
}>();

const visible = ref(false);
const { t } = useI18n();
const src = ref("");

const { data } = useRequest(() =>
    getLostAndFound(0, props.id.toString(), true),
);
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
    visible.value = true;
    src.value = await getCOS(path);
};
</script>

<template>
    <h1>{{ $t("lostnfound.lostnfound") }}</h1>
    <Dialog v-model:visible="visible" class="w-[25rem]">
        <Image
            :src="src"
            preview
            class="w-full items-center justify-center"
        ></Image>
    </Dialog>
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
                            :header="$t('lostnfound.column.id')"
                        ></Column>
                        <Column :header="$t('lostnfound.column.campus')">
                            <template #body="{ data }">
                                <p>{{ campusMapping[data.campus] }}</p>
                            </template>
                        </Column>
                        <Column
                            field="location"
                            :header="$t('lostnfound.column.location')"
                        ></Column>
                        <Column
                            field="detail"
                            :header="$t('lostnfound.column.detail')"
                        ></Column>
                        <Column
                            field="contact"
                            :header="$t('lostnfound.column.contact')"
                        ></Column>
                        <Column :header="$t('lostnfound.column.image')">
                            <template #body="{ data }">
                                <Button
                                    icon="pi pi-eye"
                                    :label="$t('lostnfound.column.view')"
                                    @click="onViewEvent(data.filePath)"
                                ></Button>
                            </template>
                        </Column>
                        <Column
                            field="createdAt"
                            :header="$t('lostnfound.column.created_at')"
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

#image {
    width: 50%;
}

:deep(img) {
    height: 20rem;
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
