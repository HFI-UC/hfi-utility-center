<script setup lang="ts">
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { computed, ref } from "vue";
import z from "zod";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import FileUploader from "@/components/FileUploader.vue";
import type { EditorLoadEvent } from "primevue/editor";
import Quill from "quill";
import type { Delta } from "quill";
import { watch } from "vue";
import { useToast } from "primevue";
import { useI18n } from "vue-i18n";
import { PenSquare } from "lucide-vue-next";
import { useAuthGuard } from "@/utils/authGuard";
import { useRequest } from "vue-request";
import { getAdvertisementPrice, postCreateAdvertisement } from "@/api";
import router from "@/router";

useAuthGuard({
    requireLogin: true,
    requiredRole: ["student", "admin", "approver", "system"],
});

const resolver = computed(() =>
    zodResolver(
        z.object({
            title: z.string({ message: "Title is required." }).min(1, { message: "Title is required." }),
            link: z
                .url({ message: "Link must be a valid URL." })
                .nullable()
                .or(z.literal("")),
            duration: z
                .number({ message: "Duration is required." })
                .min(1, { message: "Duration must be at least 1 day." }),
            content: z.string({ message: "Content is required." }).min(1, { message: "Content is required." }),
        })
    )
);
const durationDays = ref(1);
const priceData = useRequest(() => getAdvertisementPrice(durationDays.value || 1), {
    refreshDeps: [durationDays],
    debounceInterval: 300,
});
const uploadLoading = ref(false);
const uploadedFiles = ref<string[]>([]);
const quillDelta = ref<Delta>();
const quill = ref<Quill | null>(null);
const previewWindow = ref<HTMLElement | null>(null);
watch(quillDelta, (newDelta) => {
    const quillInstance = new Quill(previewWindow.value as HTMLElement, {
        modules: {
            toolbar: false,
        },
        readOnly: true,
    });
    quillInstance.setContents(newDelta as Delta);
    if (previewWindow.value) previewWindow.value.style = "height: 200px;";
});
const initialValues = ref({
    title: null,
    link: null,
    duration: 1,
    content: null,
});
const submitLoading = ref(false);
const toast = useToast();
const { t } = useI18n();
const onSubmitEvent = async (form: FormSubmitEvent) => {
    if (uploadLoading.value) return;
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: t("common.fillInAllFields"),
            life: 2000,
        });
        return;
    }
    if (!uploadedFiles.value.length) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: "Please upload at least one image for the advertisement.",
            life: 2000,
        });
        return;
    }
    submitLoading.value = true;
    const response = await postCreateAdvertisement(
        form.values.title,
        uploadedFiles.value,
        quillDelta.value as Delta,
        form.values.link == "" ? null : form.values.link,
        form.values.duration
    );
    submitLoading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: "Advertisement created successfully.",
            life: 2000,
        });
        router.push("/ads");
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 2000,
        });
    }
};

const onEditorLoad = (event: EditorLoadEvent) => {
    quill.value = event.instance;
};

const onEditorTextChange = () => {
    quillDelta.value = quill.value?.getContents() as Delta;
};
</script>
<template>
    <div class="flex items-center justify-center flex-col mt-24 mb-4">
        <h1 class="font-bold text-3xl my-4">
            {{ $t("ads.create.title") }}
        </h1>
        <Card class="xl:w-200 md:w-180 w-92">
            <template #content>
                <Form
                    v-slot="$form"
                    :resolver
                    :initialValues
                    @submit="onSubmitEvent"
                >
                    <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
                        <div class="md:col-span-2 col-span-1">
                            <FileUploader
                                v-model:uploadLoading="uploadLoading"
                                v-model:uploadedFiles="uploadedFiles"
                            ></FileUploader>
                            <p
                                class="text-xs dark:text-surface-300 text-surface-500 mt-2"
                            >
                                We will take the first image as your cover image
                                by default.
                            </p>
                        </div>
                        <IftaLabel class="md:col-span-2 col-span-1">
                            <InputText
                                id="title"
                                type="text"
                                name="title"
                                fluid
                            ></InputText>
                            <label for="title">Title</label>
                            <Message
                                class="mt-4"
                                v-if="$form.title?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.title.error?.message }}</Message
                            >
                        </IftaLabel>
                        <IftaLabel class="col-span-1">
                            <InputText id="link" type="url" name="link" fluid></InputText>
                            <label for="link">Link (Optional)</label>
                            <p
                                class="text-xs dark:text-surface-300 text-surface-500 mt-2"
                            >
                                External link to be shown on the detail page of
                                the advertisement.
                            </p>
                            <Message
                                class="mt-4"
                                v-if="$form.link?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.link.error?.message }}</Message
                            >
                        </IftaLabel>
                        <IftaLabel class="col-span-1">
                            <InputNumber
                                v-model="durationDays"
                                inputId="duration"
                                name="duration"
                                fluid
                                showButtons
                                :min="1"
                            ></InputNumber>
                            <label for="duration">Duration</label>
                            <p
                                class="text-xs dark:text-surface-300 text-surface-500 mt-2"
                            >
                                The duration (in days) for which the
                                advertisement will be active.
                            </p>
                            <Message
                                class="mt-4"
                                v-if="$form.duration?.invalid"
                                severity="error"
                                size="small"
                                >{{ $form.duration.error?.message }}</Message
                            >
                        </IftaLabel>
                        <div class="md:col-span-2 col-span-1">
                            <Editor
                                @load="onEditorLoad"
                                @textChange="onEditorTextChange"
                                :formats="[
                                    'bold',
                                    'italic',
                                    'underline',
                                    'strike',
                                    'script',
                                    'blockquote',
                                    'code-block',
                                    'code',
                                    'header',
                                    'list',
                                    'align',
                                    'direction',
                                    'background',
                                    'color',
                                    'link',
                                    'font',
                                    'size',
                                ]"
                                ref="editor"
                                name="content"
                                placeholder="Write your content here..."
                                :editorStyle="{ height: '300px' }"
                            >
                                <template v-slot:toolbar>
                                    <span class="ql-formats">
                                        <select class="ql-size"></select>
                                        <select class="ql-font"></select>
                                    </span>
                                    <span class="ql-formats">
                                        <button class="ql-bold"></button>
                                        <button class="ql-italic"></button>
                                        <button class="ql-underline"></button>
                                    </span>
                                    <span class="ql-formats">
                                        <select class="ql-align"></select>
                                        <button
                                            class="ql-list"
                                            value="ordered"
                                        ></button>
                                        <button
                                            class="ql-list"
                                            value="bullet"
                                        ></button>
                                    </span>
                                    <span class="ql-formats">
                                        <button class="ql-link"></button>
                                        <button class="ql-code-block"></button>
                                    </span>
                                    <span class="ql-formats">
                                        <select class="ql-color"></select>
                                        <select class="ql-background"></select>
                                    </span>
                                </template>
                            </Editor>
                            <p
                                class="text-xs dark:text-surface-300 text-surface-500 mt-2"
                            >
                                Edit your advertisement content in the editor.
                            </p>
                        </div>
                        <Message
                            class="md:col-span-2 col-span-1"
                            v-if="$form.content?.invalid"
                            severity="error"
                            size="small"
                            >{{ $form.content.error?.message }}</Message
                        >
                        <div class="md:col-span-2 col-span-1">
                            <p class="font-semibold">Preview</p>
                            <div
                                ref="previewWindow"
                                class="mt-2! border border-surface-200 dark:border-surface-700 rounded-border min-h-50"
                            ></div>
                        </div>
                        <p v-if="priceData.loading.value">Price: Loading...</p>
                        <p v-if="!priceData.loading.value && priceData.data.value?.data.originalPrice !== priceData.data.value?.data.finalPrice">Price: 
                            <span class="line-through text-surface-500 dark:text-surface-400">RMB {{ priceData.data.value?.data.originalPrice.toFixed(2) }}</span>
                            <span class="ml-2 font-semibold text-red-600 dark:text-red-400">RMB {{ priceData.data.value?.data.finalPrice.toFixed(2) }}</span>
                        </p>
                        <p v-if="!priceData.loading.value && priceData.data.value?.data.originalPrice === priceData.data.value?.data.finalPrice">Price: RMB {{ priceData.data.value?.data.finalPrice.toFixed(2) }}</p>
                        <Button type="submit" class="md:col-span-2 col-span-1" fluid :disabled="uploadLoading || submitLoading"><PenSquare></PenSquare>Submit</Button>
                    </div>
                </Form>
            </template>
        </Card>
    </div>
</template>
