<script setup lang="ts">
import { type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { Home, Mail, PartyPopper, UserRoundPlus } from "lucide-vue-next";
import { useToast } from "primevue";
import { ref } from "vue";
import z from "zod";
import { postPreRegister, postRegister } from "@/api";
import VueTurnstile from "vue-turnstile";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import confetti from "canvas-confetti";

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const route = useRoute();
const token = (route.query.token as string) || "";
const turnstileSiteKey = process.env.CLOUDFLARE_KEY || "";
const submitLoading = ref(false);
const turnstileToken = ref("");
const preRegisterResolver = zodResolver(
    z.object({
        email: z.email({
            message: t("user.register.validation.emailInvalid"),
        }),
    })
);

const preRegisterInitialValues = {
    email: null,
};
const preRegisterSuccess = ref(false);
const preRegisterSuccessMessage = ref("");
const onPreRegisterEvent = async (form: FormSubmitEvent) => {
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
    const response = await postPreRegister({
        email: form.values.email,
        turnstileToken: turnstileToken.value,
    });
    submitLoading.value = false;
    if (response.success) {
        preRegisterSuccess.value = true;
        preRegisterSuccessMessage.value = response.message as string;
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("user.register.toast.checkEmail"),
            life: 3000,
        });
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 3000,
        });
    }
};

const registerResolver = zodResolver(
    z
        .object({
            name: z.string().min(1, {
                message: t("user.register.validation.nameRequired"),
            }),
            password: z.string().min(6, {
                message: t("user.register.validation.passwordTooShort"),
            }),
            retypePassword: z.string().min(6, {
                message: t("user.register.validation.passwordTooShort"),
            }),
            studentId: z
                .string()
                .startsWith("GJ", {
                    message: t(
                        "reservation.create.validation.studentId.prefix"
                    ),
                })
                .min(10, {
                    message: t(
                        "reservation.create.validation.studentId.minLength"
                    ),
                })
                .refine((val) => /^\d{8}$/.test(val.slice(-8)), {
                    message: t(
                        "reservation.create.validation.studentId.digits"
                    ),
                })
                .optional()
                .nullable(),
        })
        .superRefine((data, ctx) => {
            if (data.password !== data.retypePassword) {
                ctx.addIssue({
                    code: "custom",
                    message: t("user.register.validation.passwordsDoNotMatch"),
                });
            }
        })
);

const registerInitialValues = {
    name: null,
    password: null,
    retypePassword: null,
    studentId: null,
};

const onRegisterEvent = async (form: FormSubmitEvent) => {
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
    const response = await postRegister(
        form.values.name,
        form.values.password,
        form.values.studentId,
        token
    );
    submitLoading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("user.register.toast.registrationSuccessful"),
            life: 2000,
        });
        router.push("/user/login");
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 2000,
        });
    }
};

const onMoreConfetti = () => {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
};
</script>
<template>
    <div class="flex items-center justify-center flex-col mt-24 mb-4">
        <h1 class="font-bold text-3xl my-4">{{ $t("user.register.title") }}</h1>
        <Card class="sm:w-100 w-92">
            <template #content>
                <Form
                    v-if="token == '' && !preRegisterSuccess"
                    v-slot="$form"
                    :resolver="preRegisterResolver"
                    :initialValues="preRegisterInitialValues"
                    @submit="onPreRegisterEvent"
                >
                    <div class="flex flex-col justify-center gap-4">
                        <InputText
                            type="text"
                            name="email"
                            :placeholder="$t('user.register.form.email')"
                            autocomplete="email"
                            fluid
                        ></InputText>
                        <Message
                            v-if="$form.email?.invalid"
                            severity="error"
                            size="small"
                            >{{ $form.email.error?.message }}</Message
                        >
                        <div class="flex items-center gap-2 flex-col">
                            <p class="text-center text-sm mt-3">
                                {{ $t("user.register.humanVerification") }}
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
                            fluid
                        >
                            <UserRoundPlus></UserRoundPlus
                            >{{ $t("user.register.form.submit") }}
                        </Button>
                    </div>
                </Form>
                <div
                    v-if="preRegisterSuccess"
                    class="flex justify-center flex-col gap-4 items-center"
                >
                    <Mail class="text-green-500 h-80! w-25!"></Mail>
                    <p class="text-center">{{ preRegisterSuccessMessage }}</p>
                    <div class="flex flex-wrap gap-2">
                        <Button
                            severity="info"
                            size="small"
                            as="RouterLink"
                            to="/"
                            ><Home></Home
                        ></Button>
                        <Button
                            severity="help"
                            size="small"
                            @click="onMoreConfetti()"
                            ><PartyPopper></PartyPopper
                        ></Button>
                    </div>
                </div>
                <Form
                    v-if="token != ''"
                    :resolver="registerResolver"
                    :initialValues="registerInitialValues"
                    @submit="onRegisterEvent"
                    v-slot="$form"
                >
                    <div class="flex flex-col justify-center gap-4">
                        <InputText
                            type="text"
                            name="name"
                            :placeholder="$t('user.register.form.name')"
                            autocomplete="username"
                            fluid
                        ></InputText>
                        <Message
                            v-if="$form.name?.invalid"
                            severity="error"
                            size="small"
                            >{{ $form.name.error?.message }}</Message
                        >
                        <InputText
                            type="password"
                            name="password"
                            :placeholder="$t('user.register.form.password')"
                            autocomplete="new-password"
                            fluid
                        ></InputText>
                        <Message
                            v-if="$form.password?.invalid"
                            severity="error"
                            size="small"
                            >{{ $form.password.error?.message }}</Message
                        >
                        <InputText
                            type="password"
                            name="retypePassword"
                            :placeholder="
                                $t('user.register.form.retypePassword')
                            "
                            autocomplete="new-password"
                            fluid
                        ></InputText>
                        <Message
                            v-if="$form.retypePassword?.invalid"
                            severity="error"
                            size="small"
                            >{{ $form.retypePassword.error?.message }}</Message
                        >
                        <InputText
                            type="text"
                            name="studentId"
                            :placeholder="$t('user.register.form.studentId')"
                            autocomplete="username"
                            fluid
                        ></InputText>
                        <Message
                            v-if="$form.studentId?.invalid"
                            severity="error"
                            size="small"
                            >{{ $form.studentId.error?.message }}</Message
                        >
                        <Button
                            type="submit"
                            severity="success"
                            :disabled="submitLoading"
                            fluid
                        >
                            <UserRoundPlus></UserRoundPlus
                            >{{ $t("user.register.form.submit") }}
                        </Button>
                    </div>
                </Form>
                <p v-if="token == ''" class="text-center mt-4 text-sm">
                    {{ $t("user.register.alreadyHaveAccount") }}
                    <RouterLink
                        to="/user/login"
                        class="text-sky-500 transition-colors duration-300 hover:text-sky-300"
                        >{{ $t("user.register.login") }}</RouterLink
                    >
                </p>
            </template>
        </Card>
    </div>
</template>
