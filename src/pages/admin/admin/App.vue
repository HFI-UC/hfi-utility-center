<script setup lang="ts">
import { useRequest } from "vue-request";
import AdminLogin from "../../../components/AdminLogin.vue";
import { getAdmins, postCreateAdmin, postDeleteAdmin, postEditAdminPassword } from "../../../api";
import { PenLine, Plus, Trash2 } from "lucide-vue-next";
import Navbar from "../../../components/Navbar.vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";
import type { FormSubmitEvent } from "@primevue/forms";
import { useToast } from "primevue";
import { ref } from "vue";

const { data: admins, run: fetchAdmins } = useRequest(getAdmins);

const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ${String(date.getHours()).padStart(
        2,
        "0"
    )}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const toast = useToast();
const loading = ref(false);
const newAdminResolver = ref(
    zodResolver(
        z.object({
            name: z.string("Name is required.").min(1, "Name is required."),
            email: z.email("Invalid email format.").min(1, "Email is required."),
            password: z.string("Name is required.").min(6, "Password must be at least 6 characters."),
        })
    )
);
const newAdminInitialValues = ref({});
const newAdminVisible = ref(false);
const onNewAdminSubmit = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill in all required fields.",
            life: 2000,
        });
        return;
    }
    loading.value = true;
    const response = await postCreateAdmin(form.values.name, form.values.email, form.values.password);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        newAdminVisible.value = false;
        form.reset();
        fetchAdmins();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to create admin.",
            life: 2000,
        });
    }
};

const editAdminPasswordId = ref(-1);
const editAdminPasswordResolver = ref(
    zodResolver(
        z.object({
            password: z.string("Password is required.").min(6, "Password must be at least 6 characters."),
        })
    )
);
const editAdminPasswordInitialValues = ref({});
const editAdminPasswordVisible = ref(false);
const onEditAdminPasswordSubmit = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please fill in all required fields.",
            life: 2000,
        });
        return;
    }
    loading.value = true;
    const response = await postEditAdminPassword(editAdminPasswordId.value, form.values.password);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        editAdminPasswordVisible.value = false;
        form.reset();
        fetchAdmins();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to edit admin password.",
            life: 2000,
        });
    }
};

const deleteAdmin = async (id: number) => {
    loading.value = true;
    const response = await postDeleteAdmin(id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        fetchAdmins();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to delete admin.",
            life: 2000,
        });
    }
};
</script>
<template>
    <Navbar></Navbar>
    <AdminLogin :requireLogin="true"></AdminLogin>
    <BlockUI :blocked="loading" fullScreen></BlockUI>
    <Dialog
        header="New Admin"
        modal
        v-model:visible="newAdminVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="newAdminInitialValues"
            :resolver="newAdminResolver"
            v-slot="$form"
            @submit="onNewAdminSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText name="name" placeholder="Name" fluid></InputText>
                <Message
                    v-if="$form.name?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.name.error?.message }}</Message
                >
                <InputText name="email" placeholder="E-mail" autocomplete="email" fluid></InputText>
                <Message
                    v-if="$form.email?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.email.error?.message }}</Message
                >
                <InputText name="password" placeholder="Password" autocomplete="password" type="password" fluid></InputText>
                <Message
                    v-if="$form.password?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.password.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(newAdminVisible = false), $form.reset()"
                    >Cancel</Button
                >
                <Button type="submit"><Plus></Plus>Create</Button>
            </div>
        </Form>
    </Dialog>
        <Dialog
        header="Edit Password"
        modal
        v-model:visible="editAdminPasswordVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="editAdminPasswordInitialValues"
            :resolver="editAdminPasswordResolver"
            v-slot="$form"
            @submit="onEditAdminPasswordSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText name="password" placeholder="Password" autocomplete="password" type="password" fluid></InputText>
                <Message
                    v-if="$form.password?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.password.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(newAdminVisible = false), $form.reset()"
                    >Cancel</Button
                >
                <Button type="submit"><PenLine></PenLine>Edit</Button>
            </div>
        </Form>
    </Dialog>
    <div class="my-[6rem] mx-[3rem]">
        <h1 class="font-bold text-3xl my-4">Admin Management</h1>
        <Card>
            <template #content>
                <DataTable :value="admins?.data">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <span class="text-lg font-bold">Admins</span>
                            <Button size="small" @click="newAdminVisible = true"><Plus></Plus></Button>
                        </div>
                    </template>
                    <Column field="id" header="ID"></Column>
                    <Column field="name" header="Name"></Column>
                    <Column field="email" header="Email"></Column>
                    <Column header="Password">
                        <template #body="slotProps">
                            <Button size="small" @click="(editAdminPasswordVisible = true), (editAdminPasswordId = slotProps.data.id)"><PenLine></PenLine></Button>
                        </template>
                    </Column>
                    <Column header="Creation Time">
                        <template #body="slotProps">
                            <span>{{
                                formatTime(new Date(slotProps.data.createdAt))
                            }}</span>
                        </template>
                    </Column>
                    <Column header="Actions">
                        <template #body="slotProps">
                            <Button size="small" @click="deleteAdmin(slotProps.data.id)" severity="danger"><Trash2></Trash2></Button>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>
