<script setup lang="ts">
import { useRequest } from "vue-request";
import AdminLogin from "../../components/AdminLogin.vue";
import {
    getAdmins,
    postCreateAdmin,
    postDeleteAdmin,
    postEditAdmin,
    postEditAdminPassword,
    type Admin,
} from "../../api";
import { PenLine, Plus, Trash2 } from "lucide-vue-next";
import Navbar from "../../components/Navbar.vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";
import type { FormSubmitEvent } from "@primevue/forms";
import { useToast } from "primevue";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const {
    data: admins,
    run: fetchAdmins,
    loading: adminsLoading,
} = useRequest(getAdmins);

const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ${String(date.getHours()).padStart(
        2,
        "0",
    )}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const toast = useToast();
const loading = ref(false);
const newAdminResolver = computed(() =>
    zodResolver(
        z.object({
            name: z
                .string(t("admin.admin.validation.nameRequired"))
                .min(1, t("admin.admin.validation.nameRequired")),
            email: z
                .email(t("admin.admin.validation.emailInvalid"))
                .min(1, t("admin.admin.validation.emailRequired")),
            password: z
                .string(t("admin.admin.validation.passwordRequired"))
                .min(6, t("admin.admin.validation.passwordMinLength")),
        }),
    ),
);
const newAdminInitialValues = ref({});
const newAdminVisible = ref(false);
const onNewAdminSubmit = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: t("common.fillInAllFields"),
            life: 2000,
        });
        return;
    }
    loading.value = true;
    const response = await postCreateAdmin(
        form.values.name,
        form.values.email,
        form.values.password,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.admin.toast.adminCreated", {
                name: form.values.name,
            }),
            life: 2000,
        });
        newAdminVisible.value = false;
        form.reset();
        fetchAdmins();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message || t("admin.admin.toast.failedToCreateAdmin"),
            life: 2000,
        });
    }
};

const editAdminPasswordId = ref(-1);
const editAdminPasswordResolver = computed(() =>
    zodResolver(
        z.object({
            password: z
                .string(t("admin.admin.validation.passwordRequired"))
                .min(6, t("admin.admin.validation.passwordMinLength")),
        }),
    ),
);
const editAdminPasswordInitialValues = ref({});
const editAdminPasswordVisible = ref(false);
const onEditAdminPasswordSubmit = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: t("common.fillInAllFields"),
            life: 2000,
        });
        return;
    }
    loading.value = true;
    const response = await postEditAdminPassword(
        editAdminPasswordId.value,
        form.values.password,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.admin.toast.passwordEdited", {
                id: editAdminPasswordId.value,
            }),
            life: 2000,
        });
        editAdminPasswordVisible.value = false;
        form.reset();
        fetchAdmins();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message ||
                t("admin.admin.toast.failedToEditPassword"),
            life: 2000,
        });
    }
};

const editAdminId = ref(-1);
const editAdminResolver = computed(() =>
    zodResolver(
        z.object({
            name: z
                .string(t("admin.admin.validation.nameRequired"))
                .min(1, t("admin.admin.validation.nameRequired")),
            email: z
                .email(t("admin.admin.validation.emailInvalid"))
                .min(1, t("admin.admin.validation.emailRequired")),
        }),
    ),
);
const editAdminInitialValues = computed(() =>
    editAdminId.value != -1
        ? {
              ...admins.value?.data.find(
                  (admin: Admin) => admin.id === editAdminId.value,
              ),
          }
        : {},
);
const editAdminVisible = ref(false);
const onEditAdminSubmit = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: t("common.fillInAllFields"),
            life: 2000,
        });
        return;
    }
    loading.value = true;
    const response = await postEditAdmin(
        editAdminId.value,
        form.values.name,
        form.values.email,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.admin.toast.adminEdited", {
                id: editAdminId.value,
            }),
            life: 2000,
        });
        editAdminVisible.value = false;
        form.reset();
        fetchAdmins();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message || t("admin.admin.toast.failedToEditAdmin"),
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
            summary: t("common.success"),
            detail: t("admin.admin.toast.adminDeleted", { id }),
            life: 2000,
        });
        fetchAdmins();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message || t("admin.admin.toast.failedToDeleteAdmin"),
            life: 2000,
        });
    }
};
</script>
<template>
    <Toast></Toast>
    <Navbar></Navbar>
    <AdminLogin :requireLogin="true"></AdminLogin>
    <BlockUI :blocked="loading" fullScreen></BlockUI>
    <Dialog
        :header="$t('admin.admin.dialog.newAdmin')"
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
                <InputText
                    name="name"
                    :placeholder="$t('admin.admin.form.name')"
                    fluid
                ></InputText>
                <Message
                    v-if="$form.name?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.name.error?.message }}</Message
                >
                <InputText
                    name="email"
                    :placeholder="$t('admin.admin.form.email')"
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
                    name="password"
                    :placeholder="$t('admin.admin.form.password')"
                    autocomplete="password"
                    type="password"
                    fluid
                ></InputText>
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
                    @click="((newAdminVisible = false), $form.reset())"
                    >{{ $t("admin.admin.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><Plus></Plus>{{ $t("admin.admin.button.create") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.admin.dialog.editPassword')"
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
                <InputText
                    name="password"
                    :placeholder="$t('admin.admin.form.password')"
                    autocomplete="password"
                    type="password"
                    fluid
                ></InputText>
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
                    @click="
                        ((editAdminPasswordVisible = false), $form.reset())
                    "
                    >{{ $t("admin.admin.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><PenLine></PenLine
                    >{{ $t("admin.admin.button.edit") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.admin.dialog.editAdmin')"
        modal
        v-model:visible="editAdminVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="editAdminInitialValues"
            :resolver="editAdminResolver"
            v-slot="$form"
            @submit="onEditAdminSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText
                    name="name"
                    :placeholder="$t('admin.admin.form.name')"
                    fluid
                ></InputText>
                <Message
                    v-if="$form.name?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.name.error?.message }}</Message
                >
                <InputText
                    name="email"
                    :placeholder="$t('admin.admin.form.email')"
                    autocomplete="email"
                    fluid
                ></InputText>
                <Message
                    v-if="$form.email?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.email.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="((editAdminVisible = false), $form.reset())"
                    >{{ $t("admin.admin.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><PenLine></PenLine
                    >{{ $t("admin.admin.button.edit") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <div class="mt-[6rem] mb-4 md:mx-[3rem] 2xl:mx-[8rem] mx-4">
        <h1 class="font-bold text-3xl my-4">
            {{ $t("admin.admin.title") }}
        </h1>
        <Card>
            <template #content>
                <DataTable
                    :value="admins?.data"
                    class="text-nowrap"
                    :loading="adminsLoading"
                >
                    <template #header>
                        <div class="flex items-center justify-between">
                            <span class="text-lg font-bold">{{
                                $t("admin.admin.admin")
                            }}</span>
                            <Button size="small" @click="newAdminVisible = true"
                                ><Plus></Plus
                            ></Button>
                        </div>
                    </template>
                    <Column
                        field="id"
                        :header="$t('admin.admin.table.id')"
                    ></Column>
                    <Column
                        field="name"
                        :header="$t('admin.admin.table.name')"
                    ></Column>
                    <Column
                        field="email"
                        :header="$t('admin.admin.table.email')"
                    ></Column>
                    <Column :header="$t('admin.admin.table.password')">
                        <template #body="slotProps">
                            <Button
                                size="small"
                                @click="
                                    ((editAdminPasswordVisible = true),
                                    (editAdminPasswordId = slotProps.data.id))
                                "
                                ><PenLine></PenLine
                            ></Button>
                        </template>
                    </Column>
                    <Column :header="$t('admin.admin.table.creationTime')">
                        <template #body="slotProps">
                            <span>{{
                                formatTime(new Date(slotProps.data.createdAt))
                            }}</span>
                        </template>
                    </Column>
                    <Column :header="$t('admin.admin.table.action')">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button
                                    size="small"
                                    @click="
                                        ((editAdminVisible = true),
                                        (editAdminId = slotProps.data.id))
                                    "
                                    ><PenLine></PenLine
                                ></Button>
                                <Button
                                    size="small"
                                    @click="deleteAdmin(slotProps.data.id)"
                                    severity="danger"
                                    ><Trash2></Trash2
                                ></Button>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>
