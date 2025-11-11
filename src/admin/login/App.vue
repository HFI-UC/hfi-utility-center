<script setup lang="ts">
import { type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { LogIn } from "lucide-vue-next";
import { useToast } from "primevue";
import { ref } from "vue";
import z from "zod";
import { postLogin } from "../../api";
import AdminLogin from "../../components/AdminLogin.vue";
import Navbar from "../../components/Navbar.vue";
import LoadingMask from "../../components/LoadingMask.vue";
import VueTurnstile from "vue-turnstile";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const turnstileSiteKey = process.env.CLOUDFLARE_KEY || "";
const resolver = (values: any) => {
    const schema = z.object({
        email: z.email({
            error: t("reservation.create.form.invalid.email.format"),
        }),
        password: z.string({ error: t("admin.login.form.password") }),
    });
    return zodResolver(schema)(values);
};

const toast = useToast();
const submitLoading = ref(false);
const turnstileToken = ref("");
const turnstileRef = ref();
const onSubmitEvent = async (form: FormSubmitEvent) => {
    if (turnstileToken.value == "") return;
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: t("toast.details.fillInAllFields"),
            life: 2000,
        });
        return;
    }
    submitLoading.value = true;
    const response = await postLogin(
        form.values.email,
        form.values.password,
        null,
        turnstileToken.value,
    );
    submitLoading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("toast.success"),
            detail: t("toast.details.loginSuccessful"),
            life: 2000,
        });
        setTimeout(
            () =>
                (window.location.href =
                    getRedirect() != "" ? getRedirect() : "/"),
            2500,
        );
    } else {
        toast.add({
            severity: "error",
            summary: t("toast.error"),
            detail: response.message,
            life: 2000,
        });
        turnstileRef.value?.reset();
        turnstileToken.value = "";
    }
};

const getRedirect = () => {
    const params = new URLSearchParams(window.location.search);
    return decodeURIComponent(params.get("redirect") || "");
};

const initialValues = ref({ email: null, password: null });
</script>
<template>
    <Toast></Toast>
    <Navbar></Navbar>
    <LoadingMask></LoadingMask>
    <AdminLogin :requireLogin="false" :redirect="getRedirect()"></AdminLogin>
    <div class="flex items-center justify-center flex-col mt-[6rem] mb-4">
        <h1 class="font-bold text-3xl my-4">{{ $t("admin.login.title") }}</h1>
        <Card class="sm:w-[25rem] w-[23rem]">
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
                            :placeholder="$t('admin.login.form.email')"
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
                            :placeholder="$t('admin.login.form.password')"
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
                                {{ $t("admin.login.humanVerification") }}
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
                            <LogIn></LogIn>{{ $t("admin.login.form.submit") }}
                        </Button>
                    </div>
                </Form>
            </template>
        </Card>
    </div>
</template>

