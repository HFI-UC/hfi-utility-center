<script setup lang="ts">
import { type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { LogIn } from "lucide-vue-next";
import { useToast } from "primevue";
import { ref } from "vue";
import z from "zod";
import { postLogin } from "../../../api";
import AdminLogin from "../../../components/AdminLogin.vue";
import Navbar from "../../../components/Navbar.vue";
import LoadingMask from "../../../components/LoadingMask.vue";

const resolver = zodResolver(
    z.object({
        email: z.email({ error: "Wrong E-mail format." }),
        password: z
            .string({ error: "Password is required." })
    })
);

const toast = useToast();
const submitLoading = ref(false);
const onSubmitEvent = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill in all required fields.",
            life: 2000,
        });
        return;
    }
    submitLoading.value = true;
    const response = await postLogin(form.values.email, form.values.password, null);
    submitLoading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Login successful.",
            life: 2000,
        });
        setTimeout(
            () =>
                (window.location.href =
                    getRedirect() != "" ? getRedirect() : "/admin/dashboard"),
            2500
        );
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message,
            life: 2000,
        });
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
    <div class="flex items-center justify-center flex-col my-[6rem]">
        <h1 class="font-bold text-3xl my-4">Admin Login</h1>
        <Card class="sm:w-[25rem] w-[23rem]">
            <template #content>
                <Form
                    v-slot="$form"
                    :resolver
                    :initialValues
                    @submit="onSubmitEvent"
                >
                    <div class="flex flex-col justify-center gap-4">
                        <InputText
                            type="text"
                            name="email"
                            placeholder="E-mail"
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
                            placeholder="Password"
                            autocomplete="current-password"
                            fluid
                        ></InputText>
                        <Message
                            v-if="$form.password?.invalid"
                            severity="error"
                            size="small"
                            >{{ $form.password.error?.message }}</Message
                        >
                        <Button
                            type="submit"
                            severity="success"
                            :disabled="submitLoading"
                        >
                            <LogIn></LogIn>Login
                        </Button>
                    </div>
                </Form>
            </template>
        </Card>
    </div>
</template>
