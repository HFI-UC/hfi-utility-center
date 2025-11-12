<script setup lang="ts">
import { useRequest } from "vue-request";
import {
    getAdmins,
    getCampuses,
    getClasses,
    getRooms,
    postCreateApprover,
    postCreateCampus,
    postCreateClass,
    postCreatePolicy,
    postCreateRoom,
    postDeleteApprover,
    postDeleteCampus,
    postDeleteClass,
    postDeletePolicy,
    postDeleteRoom,
    postEditCampus,
    postEditClass,
    postEditPolicy,
    postEditRoom,
    postToggleApproverNotificationsEnabled,
    postTogglePolicy,
    type Admin,
    type Campus,
    type Class,
    type Room,
    type RoomApprover,
    type RoomPolicy,
} from "../../api";
import {
    PenLine,
    Plus,
    Trash2,
    Pause,
    Play,
    BellOff,
    Bell,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import { useToast } from "primevue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { type FormSubmitEvent } from "@primevue/forms";
import z from "zod";
import { useI18n } from "vue-i18n";
import AdminLogin from "../../components/AdminLogin.vue";
import Navbar from "../../components/Navbar.vue";
import LoadingMask from "../../components/LoadingMask.vue";

const { t, tm } = useI18n();
const {
    data: rooms,
    run: fetchRooms,
    loading: roomsLoading,
} = useRequest(getRooms);
const {
    data: campuses,
    run: fetchCampuses,
    loading: campusesLoading,
} = useRequest(getCampuses);
const {
    data: classes,
    run: fetchClasses,
    loading: classesLoading,
} = useRequest(getClasses);
const { data: admins } = useRequest(getAdmins);
const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ${String(date.getHours()).padStart(
        2,
        "0"
    )}:${String(date.getMinutes()).padStart(2, "0")}`;
};
const loading = ref(false);
const toast = useToast();
const deleteRoom = async (id: number) => {
    loading.value = true;
    const response = await postDeleteRoom(id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.roomDeleted", { id }),
            life: 3000,
        });
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 3000,
        });
    }
};
const deleteCampus = async (id: number) => {
    loading.value = true;
    const response = await postDeleteCampus(id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.campusDeleted", { id }),
            life: 3000,
        });
        fetchCampuses();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 3000,
        });
    }
};

const deleteClass = async (id: number) => {
    loading.value = true;
    const response = await postDeleteClass(id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.classDeleted", { id }),
            life: 3000,
        });
        fetchClasses();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 3000,
        });
    }
};

const newCampusResolver = computed(() =>
    zodResolver(
        z.object({
            name: z
                .string({ error: t("admin.facility.validation.nameRequired") })
                .min(1, { error: t("admin.facility.validation.nameRequired") }),
        })
    )
);
const newCampusVisible = ref(false);
const newCampusInitialValues = ref({});
const onNewCampusSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postCreateCampus(form.values.name);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.campusCreated", {
                name: form.values.name,
            }),
            life: 3000,
        });
        fetchCampuses();
        newCampusVisible.value = false;
        form.reset();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 3000,
        });
    }
};
const newRoomResolver = computed(() =>
    zodResolver(
        z.object({
            name: z
                .string({ error: t("admin.facility.validation.nameRequired") })
                .min(1, { error: t("admin.facility.validation.nameRequired") }),
            campus: z.number({ error: t("admin.facility.validation.campusRequired") }),
        })
    )
);
const newRoomVisible = ref(false);
const newRoomInitialValues = ref({});
const onNewRoomSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postCreateRoom(form.values.name, form.values.campus);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.roomCreated", {
                name: form.values.name,
            }),
            life: 3000,
        });
        fetchRooms();
        newRoomVisible.value = false;
        form.reset();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 3000,
        });
    }
};

const room = ref<number>(-1);
const newClassResolver = computed(() =>
    zodResolver(
        z.object({
            name: z
                .string({ error: t("admin.facility.validation.nameRequired") })
                .min(1, { error: t("admin.facility.validation.nameRequired") }),
            campus: z.number({ error: t("admin.facility.validation.campusRequired") }),
        })
    )
);
const newClassVisible = ref(false);
const newClassInitialValues = ref({});

const onNewClassSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postCreateClass(
        form.values.name,
        form.values.campus
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.classCreated", {
                name: form.values.name,
            }),
            life: 3000,
        });
        fetchClasses();
        newClassVisible.value = false;
        form.reset();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 3000,
        });
    }
};

const policyViewVisible = ref(false);

const dayOptions = computed(() =>
    (tm("common.weekday.long") as string[]).map((label, index) => ({
        label,
        value: index,
    }))
);
const formatWeekDay = (days: number[]) => {
    const daysMapping = tm("common.weekday.short") as string[];
    return days.map((item) => daysMapping[item]).join(" ");
};

const newPolicyResolver = computed(() =>
    zodResolver(
        z.object({
            days: z
                .array(z.number().min(0).max(6), {
                    error: t("admin.facility.validation.weekdayRequired"),
                })
                .min(1, { error: t("admin.facility.validation.weekdayRequired") }),
            startTime: z.date({ error: t("admin.facility.validation.startTimeRequired") }),
            endTime: z.date({ error: t("admin.facility.validation.endTimeRequired") }),
        })
    )
);

const newPolicyInitialValues = ref({});
const newPolicyVisible = ref(false);
const onNewPolicySubmit = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: t("common.fillInAllFields"),
            life: 2000,
        });
        return;
    }
    if (form.values.startTime >= form.values.endTime) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: t("admin.facility.toast.startTimeBeforeEndTime"),
            life: 2000,
        });
        return;
    }
    loading.value = true;
    const response = await postCreatePolicy(
        room.value,
        [form.values.startTime.getHours(), form.values.startTime.getMinutes()],
        [form.values.endTime.getHours(), form.values.endTime.getMinutes()],
        form.values.days.sort()
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.policyCreated"),
            life: 2000,
        });
        newPolicyVisible.value = false;
        form.reset();
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message ||
                t("admin.facility.toast.failedToCreatePolicy"),
            life: 2000,
        });
    }
};

const editPolicyResolver = computed(() =>
    zodResolver(
        z.object({
            days: z
                .array(z.number().min(0).max(6), {
                    error: t("admin.facility.validation.weekdayRequired"),
                })
                .min(1, { error: t("admin.facility.validation.weekdayRequired") }),
            startTime: z.date({ error: t("admin.facility.validation.startTimeRequired") }),
            endTime: z.date({ error: t("admin.facility.validation.endTimeRequired") }),
        })
    )
);

const editPolicy = ref({} as RoomPolicy);
const editPolicyInitialValues = computed(() => {
    return {
        days: editPolicy.value.days,
    };
});
const editPolicyVisible = ref(false);

const onEditPolicySubmit = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: t("common.fillInAllFields"),
            life: 2000,
        });
        return;
    }
    if (form.values.startTime >= form.values.endTime) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: t("admin.facility.toast.startTimeBeforeEndTime"),
            life: 2000,
        });
        return;
    }
    loading.value = true;
    const response = await postEditPolicy(
        editPolicy.value.id,
        [form.values.startTime.getHours(), form.values.startTime.getMinutes()],
        [form.values.endTime.getHours(), form.values.endTime.getMinutes()],
        form.values.days.sort()
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.policyEdited"),
            life: 2000,
        });
        editPolicyVisible.value = false;
        form.reset();
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message ||
                t("admin.facility.toast.failedToEditPolicy"),
            life: 2000,
        });
    }
};

const deletePolicy = async (id: number) => {
    loading.value = true;
    const response = await postDeletePolicy(id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.policyDeleted"),
            life: 2000,
        });
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message ||
                t("admin.facility.toast.failedToDeletePolicy"),
            life: 2000,
        });
    }
};

const togglePolicy = async (id: number) => {
    loading.value = true;
    const response = await postTogglePolicy(id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.policyToggled"),
            life: 2000,
        });
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message ||
                t("admin.facility.toast.failedToTogglePolicy"),
            life: 2000,
        });
    }
};

const editClassResolver = computed(() =>
    zodResolver(
        z.object({
            campus: z.number({ error: t("admin.facility.validation.campusRequired") }),
            name: z
                .string({ error: t("admin.facility.validation.nameRequired") })
                .min(1, { error: t("admin.facility.validation.nameRequired") }),
        })
    )
);

const editClassInitialValues = ref({} as Class);
const editClassVisible = ref(false);
const onEditClassSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postEditClass(
        editClassInitialValues.value.id,
        form.values.name,
        form.values.campus
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.classEdited"),
            life: 2000,
        });
        editClassVisible.value = false;
        form.reset();
        fetchClasses();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message || t("admin.facility.toast.failedToEditClass"),
            life: 2000,
        });
    }
};

const editRoomResolver = computed(() =>
    zodResolver(
        z.object({
            campus: z.number({ error: t("admin.facility.validation.campusRequired") }),
            name: z
                .string({ error: t("admin.facility.validation.nameRequired") })
                .min(1, { error: t("admin.facility.validation.nameRequired") }),
            enabled: z.boolean({ error: t("admin.facility.validation.enabledRequired") }),
        })
    )
);

const editRoomInitialValues = ref({} as Room);
const editRoomVisible = ref(false);
const onEditRoomSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postEditRoom(
        editRoomInitialValues.value.id,
        form.values.name,
        form.values.campus,
        form.values.enabled
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.roomEdited"),
            life: 2000,
        });
        editRoomVisible.value = false;
        form.reset();
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message || t("admin.facility.toast.failedToEditRoom"),
            life: 2000,
        });
    }
};

const editCampusResolver = computed(() =>
    zodResolver(
        z.object({
            name: z
                .string({ error: t("admin.facility.validation.nameRequired") })
                .min(1, { error: t("admin.facility.validation.nameRequired") }),
        })
    )
);

const editCampusInitialValues = ref({} as Campus);
const editCampusVisible = ref(false);
const onEditCampusSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postEditCampus(
        editCampusInitialValues.value.id,
        form.values.name
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.campusEdited"),
            life: 2000,
        });
        editCampusVisible.value = false;
        form.reset();
        fetchCampuses();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message ||
                t("admin.facility.toast.failedToEditCampus"),
            life: 2000,
        });
    }
};
const approverViewVisible = ref(false);
const newApproverResolver = computed(() =>
    zodResolver(
        z.object({
            admin: z.object(
                {
                    id: z.number(),
                    email: z.string(),
                    name: z.string(),
                },
                { error: t("admin.facility.validation.adminRequired") }
            ),
        })
    )
);

const newApproverInitialValues = ref({});
const newApproverVisible = ref(false);
const onNewApproverSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postCreateApprover(room.value, form.values.admin.id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.approverCreated"),
            life: 2000,
        });
        newApproverVisible.value = false;
        form.reset();
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message ||
                t("admin.facility.toast.failedToCreateApprover"),
            life: 2000,
        });
    }
};

const toggleApproverNotificationsEnabled = async (id: number) => {
    loading.value = true;
    const response = await postToggleApproverNotificationsEnabled(id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.approverNotificationsToggled"),
            life: 2000,
        });
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message ||
                t("admin.facility.toast.failedToToggleApproverNotifications"),
            life: 2000,
        });
    }
};

const deleteApprover = async (id: number) => {
    loading.value = true;
    const response = await postDeleteApprover(id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: t("admin.facility.toast.approverDeleted"),
            life: 2000,
        });
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail:
                response.message ||
                t("admin.facility.toast.failedToDeleteApprover"),
            life: 2000,
        });
    }
};
</script>

<template>
    <BlockUI :blocked="loading" fullScreen></BlockUI>
    <Toast></Toast>
    <AdminLogin :requireLogin="true"></AdminLogin>
    <Navbar></Navbar>
    <LoadingMask></LoadingMask>
    <Dialog
        :header="$t('admin.facility.dialog.newCampus')"
        modal
        v-model:visible="newCampusVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="newCampusInitialValues"
            :resolver="newCampusResolver"
            v-slot="$form"
            @submit="onNewCampusSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText
                    name="name"
                    :placeholder="$t('admin.facility.form.name')"
                    fluid
                ></InputText>
                <Message
                    v-if="$form.name?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.name.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(newCampusVisible = false), $form.reset()"
                    >{{ $t("admin.facility.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><Plus></Plus
                    >{{ $t("admin.facility.button.create") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.facility.dialog.newRoom')"
        modal
        v-model:visible="newRoomVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="newRoomInitialValues"
            :resolver="newRoomResolver"
            v-slot="$form"
            @submit="onNewRoomSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText
                    name="name"
                    :placeholder="$t('admin.facility.form.name')"
                    fluid
                ></InputText>
                <Message
                    v-if="$form.name?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.name.error?.message }}</Message
                >
                <Select
                    :options="campuses?.data"
                    optionLabel="name"
                    optionValue="id"
                    :placeholder="$t('admin.facility.form.campus')"
                    name="campus"
                    fluid
                ></Select>
                <Message
                    v-if="$form.campus?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.campus.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(newRoomVisible = false), $form.reset()"
                    >{{ $t("admin.facility.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><Plus></Plus
                    >{{ $t("admin.facility.button.create") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.facility.dialog.newClass')"
        modal
        v-model:visible="newClassVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="newClassInitialValues"
            :resolver="newClassResolver"
            v-slot="$form"
            @submit="onNewClassSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText
                    name="name"
                    :placeholder="$t('admin.facility.form.name')"
                    fluid
                ></InputText>
                <Message
                    v-if="$form.name?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.name.error?.message }}</Message
                >
                <Select
                    :options="campuses?.data"
                    optionLabel="name"
                    optionValue="id"
                    :placeholder="$t('admin.facility.form.campus')"
                    name="campus"
                    fluid
                ></Select>
                <Message
                    v-if="$form.campus?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.campus.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(newClassVisible = false), $form.reset()"
                    >{{ $t("admin.facility.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><Plus></Plus
                    >{{ $t("admin.facility.button.create") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.facility.dialog.roomPolicy')"
        v-model:visible="policyViewVisible"
        modal
        maximizable
        class="xl:w-[50rem] w-[calc(100%-2rem)]"
    >
        <DataTable
            :loading="roomsLoading"
            :value="rooms?.data.find((_room) => _room.id === room)?.policies"
            class="text-nowrap"
        >
            <template #header>
                <div class="flex gap-2 justify-between">
                    <span class="text-lg font-bold">{{
                        $t("admin.facility.dialog.roomPolicy")
                    }}</span>
                    <Button size="small" @click="newPolicyVisible = true"
                        ><Plus></Plus
                    ></Button>
                </div>
            </template>
            <template #empty>
                <span>{{ $t("admin.facility.noPolicy") }}</span>
            </template>
            <Column field="id" :header="$t('admin.facility.table.id')">
            </Column>
            <Column :header="$t('admin.facility.table.weekday')">
                <template #body="slotProps">
                    {{ formatWeekDay(slotProps.data.days) }}
                </template>
            </Column>
            <Column :header="$t('admin.facility.table.time')">
                <template #body="slotProps">
                    {{
                        `${String(slotProps.data.startTime[0]).padStart(
                            2,
                            "0"
                        )}:${String(slotProps.data.startTime[1]).padStart(
                            2,
                            "0"
                        )} - ${String(slotProps.data.endTime[0]).padStart(
                            2,
                            "0"
                        )}:${String(slotProps.data.endTime[1]).padStart(
                            2,
                            "0"
                        )}`
                    }}
                </template>
            </Column>
            <Column :header="$t('admin.facility.table.status')">
                <template #body="slotProps">
                    <Tag
                        :value="
                            slotProps.data.enabled
                                ? $t('admin.facility.table.active')
                                : $t('admin.facility.table.inactive')
                        "
                        :severity="
                            slotProps.data.enabled ? 'success' : 'danger'
                        "
                    ></Tag>
                </template>
            </Column>
            <Column :header="$t('admin.facility.table.action')">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <Button
                            @click="togglePolicy(slotProps.data.id)"
                            size="small"
                            :severity="
                                slotProps.data.enabled ? 'warn' : 'success'
                            "
                        >
                            <Play v-if="!slotProps.data.enabled"></Play>
                            <Pause v-else></Pause>
                        </Button>
                        <Button
                            @click="
                                (editPolicyVisible = true),
                                    (editPolicy = slotProps.data)
                            "
                            size="small"
                            ><PenLine></PenLine
                        ></Button>
                        <Button
                            @click="deletePolicy(slotProps.data.id)"
                            size="small"
                            severity="danger"
                            ><Trash2></Trash2
                        ></Button>
                    </div>
                </template>
            </Column>
        </DataTable>
    </Dialog>
    <Dialog
        :header="$t('admin.facility.dialog.newApprover')"
        modal
        v-model:visible="newApproverVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="newApproverInitialValues"
            :resolver="newApproverResolver"
            v-slot="$form"
            @submit="onNewApproverSubmit"
        >
            <div class="flex flex-col gap-4">
                <Select
                    :options="
                        admins?.data.filter(
                            (admin: Admin) =>
                                !rooms?.data
                                    .find((r: Room) => r.id === room)
                                    ?.approvers.some(
                                        (approver: RoomApprover) =>
                                            approver.adminId === admin.id,
                                    ),
                        )
                    "
                    :placeholder="$t('admin.facility.form.admin')"
                    name="admin"
                    fluid
                >
                    <template #value="slotProps">
                        <div v-if="slotProps.value" class="flex flex-col">
                            <span class="font-bold">{{
                                slotProps.value.name
                            }}</span>
                            <span class="text-sm">{{
                                slotProps.value.email
                            }}</span>
                        </div>
                        <span v-else>
                            {{ slotProps.placeholder }}
                        </span>
                    </template>
                    <template #option="slotProps">
                        <div class="flex flex-col">
                            <span class="font-bold">{{
                                slotProps.option.name
                            }}</span>
                            <span class="text-sm">{{
                                slotProps.option.email
                            }}</span>
                        </div>
                    </template>
                </Select>
                <Message
                    v-if="$form.admin?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.admin.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(newApproverVisible = false), $form.reset()"
                    >{{ $t("admin.facility.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><Plus></Plus
                    >{{ $t("admin.facility.button.create") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.facility.dialog.roomApprover')"
        v-model:visible="approverViewVisible"
        modal
        maximizable
        class="md:w-[35rem] w-[calc(100%-2rem)]"
    >
        <DataTable
            :loading="roomsLoading"
            :value="rooms?.data.find((r) => r.id === room)?.approvers"
            class="text-nowrap"
        >
            <template #header>
                <div class="flex gap-2 justify-between">
                    <span class="text-lg font-bold">{{
                        $t("admin.facility.dialog.roomApprover")
                    }}</span>
                    <Button size="small" @click="newApproverVisible = true"
                        ><Plus></Plus
                    ></Button>
                </div>
            </template>
            <template #empty>
                <span>{{ $t("admin.facility.noApprover") }}</span>
            </template>
            <Column field="id" :header="$t('admin.facility.table.id')">
            </Column>
            <Column field="name" :header="$t('admin.facility.table.name')">
                <template #body="slotProps">
                    {{
                        admins?.data.find(
                            (admin: Admin) =>
                                admin.id === slotProps.data.adminId
                        )?.name
                    }}
                </template>
            </Column>
            <Column :header="$t('admin.facility.table.email')">
                <template #body="slotProps">
                    {{
                        admins?.data.find(
                            (admin: Admin) =>
                                admin.id === slotProps.data.adminId
                        )?.email
                    }}
                </template>
            </Column>
            <Column :header="$t('admin.facility.table.action')">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <Button
                            @click="
                                toggleApproverNotificationsEnabled(
                                    slotProps.data.id
                                )
                            "
                            size="small"
                            :severity="
                                slotProps.data.notificationsEnabled
                                    ? 'warn'
                                    : 'success'
                            "
                        >
                            <BellOff
                                v-if="!slotProps.data.notificationsEnabled"
                            ></BellOff>
                            <Bell v-else></Bell>
                        </Button>
                        <Button
                            @click="deleteApprover(slotProps.data.id)"
                            size="small"
                            severity="danger"
                            ><Trash2></Trash2
                        ></Button>
                    </div>
                </template>
            </Column>
        </DataTable>
    </Dialog>
    <Dialog
        :header="$t('admin.facility.dialog.newPolicy')"
        class="w-[23rem]"
        v-model:visible="newPolicyVisible"
        modal
        :closable="false"
    >
        <Form
            :resolver="newPolicyResolver"
            :initialValues="newPolicyInitialValues"
            v-slot="$form"
            @submit="onNewPolicySubmit"
        >
            <div class="flex flex-col gap-4">
                <MultiSelect
                    :options="dayOptions"
                    name="days"
                    optionLabel="label"
                    optionValue="value"
                    fluid
                    :placeholder="$t('admin.facility.form.weekday')"
                ></MultiSelect>
                <Message
                    v-if="$form.days?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.days.error?.message }}</Message
                >
                <DatePicker
                    timeOnly
                    name="startTime"
                    :placeholder="$t('admin.facility.form.startTime')"
                    :manualInput="false"
                    fluid
                ></DatePicker>
                <Message
                    v-if="$form.startTime?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.startTime.error?.message }}</Message
                >
                <DatePicker
                    timeOnly
                    name="endTime"
                    :placeholder="$t('admin.facility.form.endTime')"
                    :manualInput="false"
                    fluid
                ></DatePicker>
                <Message
                    v-if="$form.endTime?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.endTime.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(newPolicyVisible = false), $form.reset()"
                    >{{ $t("admin.facility.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><Plus></Plus
                    >{{ $t("admin.facility.button.create") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.facility.dialog.editPolicy')"
        class="w-[23rem]"
        v-model:visible="editPolicyVisible"
        modal
        :closable="false"
    >
        <Form
            :resolver="editPolicyResolver"
            :initialValues="editPolicyInitialValues"
            v-slot="$form"
            @submit="onEditPolicySubmit"
        >
            <div class="flex flex-col gap-4">
                <MultiSelect
                    :options="dayOptions"
                    name="days"
                    optionLabel="label"
                    optionValue="value"
                    fluid
                    :placeholder="$t('admin.facility.form.weekday')"
                ></MultiSelect>
                <Message
                    v-if="$form.days?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.days.error?.message }}</Message
                >
                <DatePicker
                    timeOnly
                    name="startTime"
                    :placeholder="$t('admin.facility.form.startTime')"
                    :manualInput="false"
                    fluid
                ></DatePicker>
                <Message
                    v-if="$form.startTime?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.startTime.error?.message }}</Message
                >
                <DatePicker
                    timeOnly
                    name="endTime"
                    :placeholder="$t('admin.facility.form.endTime')"
                    :manualInput="false"
                    fluid
                ></DatePicker>
                <Message
                    v-if="$form.endTime?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.endTime.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(editPolicyVisible = false), $form.reset()"
                    >{{ $t("admin.facility.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><PenLine></PenLine
                    >{{ $t("admin.facility.button.edit") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.facility.dialog.editClass')"
        modal
        v-model:visible="editClassVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="editClassInitialValues"
            :resolver="editClassResolver"
            v-slot="$form"
            @submit="onEditClassSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText
                    name="name"
                    :placeholder="$t('admin.facility.form.name')"
                    fluid
                ></InputText>
                <Message
                    v-if="$form.name?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.name.error?.message }}</Message
                >
                <Select
                    :options="campuses?.data"
                    optionLabel="name"
                    optionValue="id"
                    :placeholder="$t('admin.facility.form.campus')"
                    name="campus"
                    fluid
                ></Select>
                <Message
                    v-if="$form.campus?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.campus.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(editClassVisible = false), $form.reset()"
                    >{{ $t("admin.facility.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><PenLine></PenLine
                    >{{ $t("admin.facility.button.edit") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.facility.dialog.editRoom')"
        modal
        v-model:visible="editRoomVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="editRoomInitialValues"
            :resolver="editRoomResolver"
            v-slot="$form"
            @submit="onEditRoomSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText
                    name="name"
                    :placeholder="$t('admin.facility.form.name')"
                    fluid
                ></InputText>
                <Message
                    v-if="$form.name?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.name.error?.message }}</Message
                >
                <Select
                    :options="campuses?.data"
                    optionLabel="name"
                    optionValue="id"
                    :placeholder="$t('admin.facility.form.campus')"
                    name="campus"
                    fluid
                ></Select>
                <Message
                    v-if="$form.campus?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.campus.error?.message }}</Message
                >
                <div class="flex items-center gap-4 justify-center">
                    <span>{{ $t("admin.facility.form.enabled") }}</span>
                    <ToggleSwitch name="enabled"></ToggleSwitch>
                </div>
                <Message
                    v-if="$form.enabled?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.enabled.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(editRoomVisible = false), $form.reset()"
                    >{{ $t("admin.facility.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><PenLine></PenLine
                    >{{ $t("admin.facility.button.edit") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <Dialog
        :header="$t('admin.facility.dialog.editCampus')"
        modal
        v-model:visible="editCampusVisible"
        :closable="false"
        class="w-[23rem] mx-2"
    >
        <Form
            :initialValues="editCampusInitialValues"
            :resolver="editCampusResolver"
            v-slot="$form"
            @submit="onEditCampusSubmit"
        >
            <div class="flex flex-col gap-4">
                <InputText
                    name="name"
                    :placeholder="$t('admin.facility.form.name')"
                    fluid
                ></InputText>
                <Message
                    v-if="$form.name?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.name.error?.message }}</Message
                >
            </div>
            <div class="justify-end items-center flex gap-2 mt-4">
                <Button
                    type="button"
                    severity="secondary"
                    @click="(editCampusVisible = false), $form.reset()"
                    >{{ $t("admin.facility.button.cancel") }}</Button
                >
                <Button type="submit"
                    ><PenLine></PenLine
                    >{{ $t("admin.facility.button.edit") }}</Button
                >
            </div>
        </Form>
    </Dialog>
    <div class="mt-[6rem] mb-4 md:mx-[3rem] 2xl:mx-[8rem] mx-4">
        <h1 class="text-3xl font-bold my-4">
            {{ $t("admin.facility.title") }}
        </h1>
        <div class="flex flex-col gap-4">
            <Card>
                <template #content>
                    <DataTable
                        :value="rooms?.data"
                        class="text-nowrap"
                        :loading="roomsLoading"
                    >
                        <template #header>
                            <div class="flex justify-between items-center">
                                <span class="font-bold text-lg">{{
                                    $t("admin.facility.room")
                                }}</span>
                                <Button
                                    size="small"
                                    @click="newRoomVisible = true"
                                    ><Plus></Plus
                                ></Button>
                            </div>
                        </template>
                        <template #empty>
                            <span>{{ $t("admin.facility.noRoom") }}</span>
                        </template>
                        <Column
                            field="id"
                            :header="$t('admin.facility.table.id')"
                        ></Column>
                        <Column
                            field="name"
                            :header="$t('admin.facility.table.name')"
                        ></Column>
                        <Column :header="$t('admin.facility.table.status')">
                            <template #body="slotProps">
                                <Tag
                                    :value="
                                        slotProps.data.enabled
                                            ? $t('admin.facility.table.enabled')
                                            : $t(
                                                  'admin.facility.table.disabled'
                                              )
                                    "
                                    :severity="
                                        slotProps.data.enabled
                                            ? 'success'
                                            : 'danger'
                                    "
                                ></Tag>
                            </template>
                        </Column>
                        <Column :header="$t('admin.facility.table.campus')">
                            <template #body="slotProps">
                                {{
                                    campuses?.data.find(
                                        (c: Campus) =>
                                            c.id === slotProps.data.campus
                                    )?.name
                                }}
                            </template>
                        </Column>
                        <Column :header="$t('admin.facility.table.policy')">
                            <template #body="slotProps">
                                <Button
                                    size="small"
                                    @click="
                                        (policyViewVisible = true),
                                            (room = slotProps.data.id)
                                    "
                                >
                                    <PenLine></PenLine>
                                </Button>
                            </template>
                        </Column>
                        <Column :header="$t('admin.facility.table.approver')">
                            <template #body="slotProps">
                                <Button
                                    size="small"
                                    @click="
                                        (approverViewVisible = true),
                                            (room = slotProps.data.id)
                                    "
                                >
                                    <PenLine></PenLine>
                                </Button>
                            </template>
                        </Column>
                        <Column
                            :header="$t('admin.facility.table.creationTime')"
                        >
                            <template #body="slotProps">
                                {{
                                    formatTime(
                                        new Date(slotProps.data.createdAt)
                                    )
                                }}
                            </template>
                        </Column>
                        <Column :header="$t('admin.facility.table.action')">
                            <template #body="slotProps">
                                <div class="flex gap-2">
                                    <Button
                                        size="small"
                                        @click="
                                            (editRoomVisible = true),
                                                (editRoomInitialValues = {
                                                    ...slotProps.data,
                                                })
                                        "
                                    >
                                        <PenLine></PenLine
                                    ></Button>
                                    <Button
                                        size="small"
                                        severity="danger"
                                        @click="deleteRoom(slotProps.data.id)"
                                        ><Trash2></Trash2
                                    ></Button>
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
            <Card>
                <template #content>
                    <DataTable
                        :value="campuses?.data"
                        class="text-nowrap"
                        :loading="campusesLoading"
                    >
                        <template #header>
                            <div class="flex justify-between items-center">
                                <span class="font-bold text-lg">{{
                                    $t("admin.facility.campus")
                                }}</span>
                                <Button
                                    size="small"
                                    @click="newCampusVisible = true"
                                >
                                    <Plus></Plus>
                                </Button>
                            </div>
                        </template>
                        <template #empty>
                            <span>{{ $t("admin.facility.noCampus") }}</span>
                        </template>
                        <Column
                            field="id"
                            :header="$t('admin.facility.table.id')"
                        ></Column>
                        <Column
                            field="name"
                            :header="$t('admin.facility.table.name')"
                        ></Column>
                        <Column
                            :header="$t('admin.facility.table.creationTime')"
                        >
                            <template #body="slotProps">
                                {{
                                    formatTime(
                                        new Date(slotProps.data.createdAt)
                                    )
                                }}
                            </template>
                        </Column>
                        <Column :header="$t('admin.facility.table.action')">
                            <template #body="slotProps">
                                <div class="flex gap-2">
                                    <Button
                                        size="small"
                                        @click="
                                            (editCampusVisible = true),
                                                (editCampusInitialValues = {
                                                    ...slotProps.data,
                                                })
                                        "
                                        ><PenLine></PenLine
                                    ></Button>
                                    <Button
                                        size="small"
                                        severity="danger"
                                        @click="deleteCampus(slotProps.data.id)"
                                        ><Trash2></Trash2
                                    ></Button>
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
            <Card>
                <template #content>
                    <DataTable
                        :value="classes?.data"
                        class="text-nowrap"
                        :loading="classesLoading"
                    >
                        <template #header>
                            <div class="flex justify-between items-center">
                                <span class="font-bold text-lg">{{
                                    $t("admin.facility.class")
                                }}</span>
                                <Button
                                    size="small"
                                    @click="newClassVisible = true"
                                    ><Plus></Plus
                                ></Button>
                            </div>
                        </template>
                        <template #empty>
                            <span>{{ $t("admin.facility.noClass") }}</span>
                        </template>
                        <Column
                            field="id"
                            :header="$t('admin.facility.table.id')"
                        ></Column>
                        <Column
                            field="name"
                            :header="$t('admin.facility.table.name')"
                        ></Column>
                        <Column :header="$t('admin.facility.table.campus')">
                            <template #body="slotProps">
                                {{
                                    campuses?.data.find(
                                        (c: Campus) =>
                                            c.id === slotProps.data.campus
                                    )?.name
                                }}
                            </template>
                        </Column>
                        <Column
                            :header="$t('admin.facility.table.creationTime')"
                        >
                            <template #body="slotProps">
                                {{
                                    formatTime(
                                        new Date(slotProps.data.createdAt)
                                    )
                                }}
                            </template>
                        </Column>
                        <Column :header="$t('admin.facility.table.action')">
                            <template #body="slotProps">
                                <div class="flex gap-2">
                                    <Button
                                        size="small"
                                        @click="
                                            (editClassVisible = true),
                                                (editClassInitialValues = {
                                                    ...slotProps.data,
                                                })
                                        "
                                        ><PenLine></PenLine
                                    ></Button>
                                    <Button
                                        size="small"
                                        severity="danger"
                                        @click="deleteClass(slotProps.data.id)"
                                        ><Trash2></Trash2
                                    ></Button>
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
        </div>
    </div>
</template>
