<script setup lang="ts">
import { useRequest } from "vue-request";
import {
    getUsers,
    postCreateUser,
    postDeleteUser,
    postEditUser,
    postAdminEditUserPassword,
    type User,
} from "@/api";
import { PenLine, Plus, Trash2 } from "lucide-vue-next";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";
import type { FormSubmitEvent } from "@primevue/forms";
import { useToast } from "primevue";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import UserLogin from "@/components/UserLogin.vue";
import Tag from "primevue/tag";

const { t } = useI18n();
const {
    data: usersData,
    run: fetchUsers,
    loading: usersLoading,
} = useRequest(getUsers);

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

const roleOptions = computed(() => [
    { label: t("admin.user.role.admin"), value: "admin" },
    { label: t("admin.user.role.approver"), value: "approver" },
    { label: t("admin.user.role.student"), value: "student" },
    { label: t("admin.user.role.teacher"), value: "teacher" },
]);
const newUserResolver = computed(() =>
    zodResolver(
        z.object({
            name: z
                .string({ message: t("admin.user.validation.nameRequired") })
                .min(1, t("admin.user.validation.nameRequired")),
            email: z
                .email(t("admin.user.validation.emailInvalid"))
                .min(1, t("admin.user.validation.emailRequired")),
            password: z
                .string({
                    message: t("admin.user.validation.passwordRequired"),
                })
                .min(6, t("admin.user.validation.passwordMinLength")),
            role: z.string({ message: t("admin.user.validation.roleRequired")})
        })
    ),
);
const newUserInitialValues = ref({});
const newUserVisible = ref(false);
const onNewUserSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postCreateUser(
        form.values.name,
        form.values.email,
        form.values.password,
        form.values.role,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.user.toast.userCreated", {
                name: form.values.name,
            }),
            life: 2000,
        });
        newUserVisible.value = false;
        form.reset();
        fetchUsers();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message || t("admin.user.toast.failedToCreateUser"),
            life: 2000,
        });
    }
};

const editUserPasswordId = ref(-1);
const editUserPasswordResolver = computed(() =>
    zodResolver(
        z.object({
            password: z
                .string({
                    message: t("admin.user.validation.passwordRequired"),
                })
                .min(6, t("admin.user.validation.passwordMinLength")),
        }),
    ),
);
const editUserPasswordInitialValues = ref({});
const editUserPasswordVisible = ref(false);
const onEditUserPasswordSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postAdminEditUserPassword(
        editUserPasswordId.value,
        form.values.password,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.user.toast.passwordEdited", {
                id: editUserPasswordId.value,
            }),
            life: 2000,
        });
        editUserPasswordVisible.value = false;
        form.reset();
        fetchUsers();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message || t("admin.user.toast.failedToEditPassword"),
            life: 2000,
        });
    }
};

const editUserId = ref(-1);
const editUserResolver = computed(() =>
    zodResolver(
        z.object({
            name: z
                .string({ message: t("admin.user.validation.nameRequired") })
                .min(1, t("admin.user.validation.nameRequired")),
            email: z
                .email(t("admin.user.validation.emailInvalid"))
                .min(1, t("admin.user.validation.emailRequired")),
            role: z.string({ message: t("admin.user.validation.roleRequired")})
        }),
    ),
);
const editUserInitialValues = computed(() =>
    editUserId.value != -1
        ? {
              ...usersData.value?.data.find(
                  (user: User) => user.id === editUserId.value,
              ),
          }
        : {},
);
const editUserVisible = ref(false);
const onEditUserSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postEditUser(
        editUserId.value,
        form.values.name,
        form.values.email,
        form.values.role,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.user.toast.userEdited", {
                id: editUserId.value,
            }),
            life: 2000,
        });
        editUserVisible.value = false;
        form.reset();
        fetchUsers();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message || t("admin.user.toast.failedToEditUser"),
            life: 2000,
        });
    }
};

const deleteUser = async (id: number) => {
    loading.value = true;
    const response = await postDeleteUser(id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.user.toast.userDeleted", { id }),
            life: 2000,
        });
        fetchUsers();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message || t("admin.user.toast.failedToDeleteUser"),
            life: 2000,
        });
    }
};
</script>
<template>
    <UserLogin requireLogin requiredRole="admin"></UserLogin>
    <BlockUI :blocked="loading" fullScreen></BlockUI>
    <Dialog
        :header="$t('admin.user.dialog.newUser')"
        modal
        v-model:visible="newUserVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="newUserInitialValues"
            :resolver="newUserResolver"
            v-slot="$form"
            @submit="onNewUserSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText
                    name="name"
                    :placeholder="$t('admin.user.form.name')"
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
                    :placeholder="$t('admin.user.form.email')"
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
                    :placeholder="$t('admin.user.form.password')"
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
                <Select
                    :options="roleOptions"
                    name="role"
                    :placeholder="$t('admin.user.form.role')"
                    fluid
                    optionLabel="label"
                    optionValue="value"
                >
                </Select>
                <Message
                    v-if="$form.role?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.role.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="((newUserVisible = false), $form.reset())"
                    >{{ $t("admin.user.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><Plus></Plus>{{ $t("admin.user.button.create") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.user.dialog.editPassword')"
        modal
        v-model:visible="editUserPasswordVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="editUserPasswordInitialValues"
            :resolver="editUserPasswordResolver"
            v-slot="$form"
            @submit="onEditUserPasswordSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText
                    name="password"
                    :placeholder="$t('admin.user.form.password')"
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
                    @click="((editUserPasswordVisible = false), $form.reset())"
                    >{{ $t("admin.user.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><PenLine></PenLine
                    >{{ $t("admin.user.button.edit") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.user.dialog.editUser')"
        modal
        v-model:visible="editUserVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="editUserInitialValues"
            :resolver="editUserResolver"
            v-slot="$form"
            @submit="onEditUserSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText
                    name="name"
                    :placeholder="$t('admin.user.form.name')"
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
                    :placeholder="$t('admin.user.form.email')"
                    autocomplete="email"
                    fluid
                ></InputText>
                <Message
                    v-if="$form.email?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.email.error?.message }}</Message
                >
                <Select
                    :options="roleOptions"
                    name="role"
                    :placeholder="$t('admin.user.form.role')"
                    fluid
                    optionLabel="label"
                    optionValue="value"
                >
                </Select>
                <Message
                    v-if="$form.role?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.role.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="((editUserVisible = false), $form.reset())"
                    >{{ $t("admin.user.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><PenLine></PenLine
                    >{{ $t("admin.user.button.edit") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <div class="mt-[6rem] mb-4 md:mx-[3rem] 2xl:mx-[8rem] mx-4">
        <h1 class="font-bold text-3xl my-4">
            {{ $t("admin.user.title") }}
        </h1>
        <Card>
            <template #content>
                <DataTable
                    :value="usersData?.data"
                    class="text-nowrap"
                    :loading="usersLoading"
                >
                    <template #header>
                        <div class="flex items-center justify-between">
                            <span class="text-lg font-bold">{{
                                $t("admin.user.user")
                            }}</span>
                            <Button size="small" @click="newUserVisible = true"
                                ><Plus></Plus
                            ></Button>
                        </div>
                    </template>
                    <Column
                        field="id"
                        :header="$t('admin.user.table.id')"
                    ></Column>
                    <Column
                        field="name"
                        :header="$t('admin.user.table.name')"
                    ></Column>
                    <Column
                        field="email"
                        :header="$t('admin.user.table.email')"
                    ></Column>
                    <Column :header="$t('admin.user.table.role')">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.role" />
                        </template>
                    </Column>
                    <Column :header="$t('admin.user.table.password')">
                        <template #body="slotProps">
                            <Button
                                size="small"
                                @click="
                                    ((editUserPasswordVisible = true),
                                    (editUserPasswordId = slotProps.data.id))
                                "
                                ><PenLine></PenLine
                            ></Button>
                        </template>
                    </Column>
                    <Column :header="$t('admin.user.table.creationTime')">
                        <template #body="slotProps">
                            <span>{{
                                formatTime(new Date(slotProps.data.createdAt))
                            }}</span>
                        </template>
                    </Column>
                    <Column :header="$t('admin.user.table.action')">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button
                                    size="small"
                                    @click="
                                        ((editUserVisible = true),
                                        (editUserId = slotProps.data.id))
                                    "
                                    ><PenLine></PenLine
                                ></Button>
                                <Button
                                    size="small"
                                    @click="deleteUser(slotProps.data.id)"
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
