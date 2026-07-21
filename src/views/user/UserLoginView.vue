<script setup lang="ts">
import { type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { LogIn } from "lucide-vue-next";
import { useToast } from "primevue";
import { ref } from "vue";
import z from "zod";
import { postLogin } from "@/api";
import VueTurnstile from "vue-turnstile";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { triggerLoginUpdate } from "@/eventBus";
import { useAuthGuard } from "@/utils/authGuard";

const { t } = useI18n();

useAuthGuard({ requireLogin: false, watchLoginEvent: false });

const router = useRouter();
const route = useRoute();
const turnstileSiteKey = process.env.CLOUDFLARE_KEY || "";
const resolver = zodResolver(
    z.object({
        email: z.email({
            error: t("user.login.validation.emailInvalid"),
        }),
        password: z.string({
            error: t("user.login.validation.passwordRequired"),
        }),
    })
);

const toast = useToast();
const submitLoading = ref(false);
const turnstileToken = ref("");
const turnstileRef = ref();

const getRedirect = () => {
    return (route.query.redirect as string) || "";
};

const onSubmitEvent = async (form: FormSubmitEvent) => {
    if (turnstileToken.value == "") return;
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: t("common.fillInAllFields"),
            life: 2000,
        });
        return;
    }
    submitLoading.value = true;
    const response = await postLogin(
        form.values.email,
        form.values.password,
        null,
        turnstileToken.value
    );
    submitLoading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("user.login.toast.loginSuccessful"),
            life: 2000,
        });
        triggerLoginUpdate();
        await router.push(getRedirect() != "" ? getRedirect() : "/");
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 2000,
        });
        turnstileRef.value?.reset();
        turnstileToken.value = "";
    }
};

const initialValues = ref({
    email: (route.query.email as string) || null,
    password: null,
});
</script>
<template>
    <div class="flex items-center justify-center flex-col mt-24 mb-4">
        <h1 class="font-bold text-3xl my-4">{{ $t("user.login.title") }}</h1>
        <Card class="sm:w-100 w-92">
            <template #content>
                <Form
                    v-slot="$form"
                    :resolver="resolver"
                    :initialValues
                    @submit="onSubmitEvent"
                >
                    <div class="flex flex-col justify-center gap-4">
                        <InputText
                            type="text"
                            name="email"
                            :placeholder="$t('user.login.form.email')"
                            autocomplete="email"
                            fluid
                        ></InputText>
                        <Message
                            v-if="$form.email?.invalid"
                            severity="error"
                            size="small"
                            >{{ $form.email.error?.message }}</Message
                        >
                        <InputText
                            type="password"
                            name="password"
                            :placeholder="$t('user.login.form.password')"
                            autocomplete="current-password"
                            fluid
                        ></InputText>
                        <Message
                            v-if="$form.password?.invalid"
                            severity="error"
                            size="small"
                            >{{ $form.password.error?.message }}</Message
                        >
                        <div class="flex items-center gap-2 flex-col">
                            <p class="text-center text-sm mt-3">
                                {{ $t("user.login.humanVerification") }}
                            </p>
                            <VueTurnstile
                                v-model="turnstileToken"
                                :siteKey="turnstileSiteKey"
                                ref="turnstileRef"
                                class="flex justify-center mt-2"
                            ></VueTurnstile>
                        </div>
                        <Button
                            type="submit"
                            severity="success"
                            :disabled="submitLoading || !turnstileToken"
                        >
                            <LogIn></LogIn>{{ $t("user.login.form.submit") }}
                        </Button>
                    </div>
                </Form>
                <p class="text-center mt-4 text-sm">
                    {{ $t("user.login.noAccount") }}
                    <RouterLink
                        to="/user/register"
                        class="text-sky-500 transition-colors duration-300 hover:text-sky-300"
                        >{{ $t("user.login.register") }}</RouterLink
                    >
                </p>
            </template>
        </Card>
    </div>
</template>
