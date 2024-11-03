<script setup lang="ts">
import { onMounted, ref } from "vue";
import VueTurnstile from "vue-turnstile";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import FloatLabel from "primevue/floatlabel";
import { postLogin } from "../api";
import { useToast } from "primevue/usetoast";
import Card from "primevue/card";
import { useI18n } from "vue-i18n";

const cf_token = ref("");
const user = ref("");
const password = ref("");
const { t } = useI18n();
const toast = useToast();
const isCompleted = ref(true);
const loading = ref(false);

onMounted(() => {
    if (sessionStorage.getItem("token")) window.location.href = "/";
});

const onClickEvent = () => {
    isCompleted.value = true;
    loading.value = true;
    if (user.value == "" || password.value == "") {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: t("toast.required_field"),
            life: 3000,
        });
        isCompleted.value = false;
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
    postLogin(user.value, password.value, cf_token.value).then(
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
                <div class="flex flex-col items-center">
                    <FloatLabel class="m-[20px]">
                        <IconField>
                            <InputIcon class="pi pi-user"></InputIcon>
                            <InputText
                                id="user"
                                v-model="user"
                                :invalid="user == '' && !isCompleted"
                            ></InputText
                        ></IconField>
                        <label for="user">{{ $t("login.username") }}</label>
                    </FloatLabel>
                    <FloatLabel class="m-[20px]">
                        <IconField>
                            <InputIcon class="pi pi-key"></InputIcon>
                            <InputText
                                id="password"
                                v-model="password"
                                :invalid="password == '' && !isCompleted"
                                @keyup.enter="onClickEvent()"
                                type="password"
                            ></InputText>
                        </IconField>
                        <label for="password">{{ $t("login.password") }}</label>
                    </FloatLabel>
                    <p class="text-sm">{{ $t("login.cloudflare") }}</p>
                    <VueTurnstile
                        class="m-[20px]"
                        v-model="cf_token"
                        site-key="0x4AAAAAAAiw3hAxhw1fzq4B"
                    ></VueTurnstile>
                    <Button
                        icon="pi pi-sign-in"
                        @click="onClickEvent()"
                        :disabled="cf_token == ''"
                        :label="$t('login.login')"
                        :loading="loading"
                    ></Button>
                </div>
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
