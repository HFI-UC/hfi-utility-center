<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import VueTurnstile from "vue-turnstile";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import Message from "primevue/message";
import InputIcon from "primevue/inputicon";
import { postLogin } from "../api";
import { useToast } from "primevue/usetoast";
import Card from "primevue/card";
import { Form, FormSubmitEvent } from "@primevue/forms";
import { useI18n } from "vue-i18n";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { watch } from "vue";

const cf_token = ref("");
const { t, locale } = useI18n();
const initialValues = reactive({
    user: "",
    password: "",
});
const resolver = ref(
    zodResolver(
        z.object({
            user: z.string().min(1, { message: "message.fill_out" }),
            password: z.string().min(1, { message: "message.fill_out" }),
        }),
    ),
);
const toast = useToast();
const loading = ref(false);
const key = ref(1)
watch(
    () => locale.value,
    () => {
        key.value++
    },
);

onMounted(() => {
    if (sessionStorage.getItem("token")) window.location.href = "/";
});

const langMapping: Record<string, string> = {
    zh_cn: "zh-cn",
    en_us: "en-us",
    zh_ms: "zh-cn",
};

const onSubmitEvent = (form: FormSubmitEvent) => {
    loading.value = true;
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: t("toast.required_field"),
            life: 3000,
        });
        loading.value = false;
        return;
    }
    if (cf_token.value == "") {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: t("toast.robot"),
            life: 3000,
        });
        loading.value = false;
        return;
    }
    postLogin(form.values.user, form.values.password, cf_token.value).then(
        (res: { success: boolean; message: string; token?: string }) => {
            if (res.success) {
                toast.add({
                    severity: "success",
                    summary: t("toast.success"),
                    detail: res.message,
                    life: 3000,
                });
                loading.value = false;
                sessionStorage.setItem("token", res.token as string);
                window.location.href = "/";
                return;
            } else {
                toast.add({
                    severity: "error",
                    summary: t("toast.error"),
                    detail: res.message,
                    life: 3000,
                });
                loading.value = false;
                return;
            }
        },
    );
};
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1>{{ $t("login.header") }}</h1>
        <Card>
            <template #content>
                <Form
                    class="flex flex-col items-center"
                    :initialValues
                    :resolver
                    v-slot="$form"
                    @submit="onSubmitEvent"
                >
                    <div
                        class="flex flex-col m-[10px] items-center justify-center gap-[20px]"
                    >
                        <div class="flex flex-col gap-2">
                            <IconField>
                                <InputIcon class="icon-user-round"></InputIcon>
                                <InputText
                                    name="user"
                                    :placeholder="$t('login.username')"
                                ></InputText
                            ></IconField>
                            <Message
                                v-if="$form.user?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{ $t($form.user.error?.message) }}</Message
                            >
                        </div>
                        <div class="flex flex-col gap-2">
                            <IconField>
                                <InputIcon class="icon-key-round"></InputIcon>
                                <InputText
                                    :placeholder="$t('login.password')"
                                    type="password"
                                    name="password"
                                ></InputText>
                            </IconField>
                            <Message
                                v-if="$form.password?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                                >{{
                                    $t($form.password.error?.message)
                                }}</Message
                            >
                        </div>
                        <p class="text-sm">{{ $t("login.cloudflare") }}</p>
                        <VueTurnstile
                            ref="turnstileRef"
                            :language="langMapping[locale]"
                            :key="key"
                            v-model="cf_token"
                            site-key="0x4AAAAAAAiw3hAxhw1fzq4B"
                        ></VueTurnstile>
                        <Button
                            icon="icon-log-in"
                            type="submit"
                            :disabled="cf_token == ''"
                            :label="$t('login.login')"
                            :loading="loading"
                        ></Button>
                    </div>
                </Form>
            </template>
        </Card>
    </div>
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

:deep(.p-inputtext) {
    border-radius: 0.5rem !important;
    min-width: 20rem;
}

button {
    border-radius: 0.5rem;
}
</style>
