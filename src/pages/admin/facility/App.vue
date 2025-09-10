<script setup lang="ts">
import { useRequest } from "vue-request";
import {
    getAdmins,
    getApprovers,
    getCampuses,
    getClasses,
    getPolicies,
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
    postTogglePolicy,
    type Admin,
    type Campus,
    type Class,
    type Room,
    type RoomApprover,
    type RoomPolicy,
} from "../../../api";
import { PenLine, Plus, Trash2, Pause, Play } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useToast } from "primevue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { type FormSubmitEvent } from "@primevue/forms";
import z from "zod";
import AdminLogin from "../../../components/AdminLogin.vue";
import Navbar from "../../../components/Navbar.vue";
import LoadingMask from "../../../components/LoadingMask.vue";

const { data: rooms, run: fetchRooms } = useRequest(getRooms);
const { data: campuses, run: fetchCampuses } = useRequest(getCampuses);
const { data: classes, run: fetchClasses } = useRequest(getClasses);
const { data: policies, run: fetchPolicies } = useRequest(getPolicies);
const { data: approvers, run: fetchApprovers } = useRequest(getApprovers);
const { data: admins } = useRequest(getAdmins);
const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ${String(date.getHours()).padStart(
        2,
        "0",
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
            summary: "Room Deleted",
            detail: `Room #${id} has been deleted.`,
            life: 3000,
        });
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
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
            summary: "Campus Deleted",
            detail: `Campus #${id} has been deleted.`,
            life: 3000,
        });
        fetchCampuses();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
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
            summary: "Class Deleted",
            detail: `Class #${id} has been deleted.`,
            life: 3000,
        });
        fetchClasses();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message,
            life: 3000,
        });
    }
};

const newCampusResolver = ref(
    zodResolver(
        z.object({
            name: z
                .string({ error: "Name is required." })
                .min(1, { error: "Name is required." }),
        }),
    ),
);
const newCampusVisible = ref(false);
const newCampusInitialValues = ref({});
const onNewCampusSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postCreateCampus(form.values.name);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Campus Created",
            detail: `Campus "${form.values.name}" has been created.`,
            life: 3000,
        });
        fetchCampuses();
        newCampusVisible.value = false;
        form.reset();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message,
            life: 3000,
        });
    }
};
const newRoomResolver = ref(
    zodResolver(
        z.object({
            name: z
                .string({ error: "Name is required." })
                .min(1, { error: "Name is required." }),
            campus: z.number({ error: "Campus is required." }),
        }),
    ),
);
const newRoomVisible = ref(false);
const newRoomInitialValues = ref({});
const roomPolicy = computed(() => {
    return policies?.value?.data.filter(
        (policy: RoomPolicy) => policy.room === room.value,
    );
});
const roomApprover = computed(() => {
    return approvers?.value?.data.filter(
        (approver: RoomApprover) => approver.room === room.value,
    );
});
const onNewRoomSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postCreateRoom(
        form.values.name,
        form.values.campus,
        roomPolicy.value,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Room Created",
            detail: `Room "${form.values.name}" has been created.`,
            life: 3000,
        });
        fetchRooms();
        newRoomVisible.value = false;
        form.reset();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message,
            life: 3000,
        });
    }
};

const room = ref<number>(-1);
const newClassResolver = ref(
    zodResolver(
        z.object({
            name: z
                .string({ error: "Name is required." })
                .min(1, { error: "Name is required." }),
            campus: z.number({ error: "Campus is required." }),
        }),
    ),
);
const newClassVisible = ref(false);
const newClassInitialValues = ref({});

const onNewClassSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postCreateClass(
        form.values.name,
        form.values.campus,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Class Created",
            detail: `Class "${form.values.name}" has been created.`,
            life: 3000,
        });
        fetchClasses();
        newClassVisible.value = false;
        form.reset();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message,
            life: 3000,
        });
    }
};

const policyViewVisible = ref(false);

const dayOptions = ref([
    { label: "Monday", value: 0 },
    { label: "Tuesday", value: 1 },
    { label: "Wednesday", value: 2 },
    { label: "Thursday", value: 3 },
    { label: "Friday", value: 4 },
    { label: "Saturday", value: 5 },
    { label: "Sunday", value: 6 },
]);
const formatWeekDay = (days: number[]) => {
    const daysMapping = [
        "Mon.",
        "Tue.",
        "Wed.",
        "Thu.",
        "Fri.",
        "Sat.",
        "Sun.",
    ];
    return days.map((item) => daysMapping[item]).join(" ");
};

const newPolicyResolver = ref(
    zodResolver(
        z.object({
            days: z
                .array(z.number().min(0).max(6), { error: "Day is required." })
                .min(1, { error: "At least one day must be selected." }),
            startTime: z.date({ error: "Start time is required." }),
            endTime: z.date({ error: "End time is required." }),
        }),
    ),
);

const newPolicyInitialValues = ref({});
const newPolicyVisible = ref(false);
const onNewPolicySubmit = async (form: FormSubmitEvent) => {
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
    const response = await postCreatePolicy(
        room.value,
        [form.values.startTime.getHours(), form.values.startTime.getMinutes()],
        [form.values.endTime.getHours(), form.values.endTime.getMinutes()],
        form.values.days.sort(),
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        newPolicyVisible.value = false;
        form.reset();
        fetchPolicies();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to create policy.",
            life: 2000,
        });
    }
};

const editPolicyResolver = ref(
    zodResolver(
        z.object({
            days: z
                .array(z.number().min(0).max(6), { error: "Day is required." })
                .min(1, { error: "At least one day must be selected." }),
            startTime: z.date({ error: "Start time is required." }),
            endTime: z.date({ error: "End time is required." }),
        }),
    ),
);

const editPolicy = ref({} as RoomPolicy);
const editPolicyInitialValues = computed(() => {
    return {
        days: editPolicy.value.days,
        startTime: new Date(
            0,
            0,
            0,
            editPolicy.value.startTime[0],
            editPolicy.value.startTime[1],
        ),
        endTime: new Date(
            0,
            0,
            0,
            editPolicy.value.endTime[0],
            editPolicy.value.endTime[1],
        ),
    };
});
const editPolicyVisible = ref(false);

const onEditPolicySubmit = async (form: FormSubmitEvent) => {
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
    const response = await postEditPolicy(
        editPolicy.value.id,
        [form.values.startTime.getHours(), form.values.startTime.getMinutes()],
        [form.values.endTime.getHours(), form.values.endTime.getMinutes()],
        form.values.days.sort(),
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        editPolicyVisible.value = false;
        form.reset();
        fetchPolicies();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to edit policy.",
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
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        fetchPolicies();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to delete policy.",
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
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        fetchPolicies();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to toggle policy.",
            life: 2000,
        });
    }
};

const editClassResolver = ref(
    zodResolver(
        z.object({
            campus: z.number({ error: "Campus is required." }),
            name: z
                .string({ error: "Name is required." })
                .min(1, { error: "Name is required." }),
        }),
    ),
);

const editClassInitialValues = ref({} as Class);
const editClassVisible = ref(false);
const onEditClassSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postEditClass(
        editClassInitialValues.value.id,
        form.values.name,
        form.values.campus,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        editClassVisible.value = false;
        form.reset();
        fetchClasses();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to edit class.",
            life: 2000,
        });
    }
};

const editRoomResolver = ref(
    zodResolver(
        z.object({
            campus: z.number({ error: "Campus is required." }),
            name: z
                .string({ error: "Name is required." })
                .min(1, { error: "Name is required." }),
        }),
    ),
);

const editRoomInitialValues = ref({} as Room);
const editRoomVisible = ref(false);
const onEditRoomSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postEditRoom(
        editRoomInitialValues.value.id,
        form.values.name,
        form.values.campus,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        editRoomVisible.value = false;
        form.reset();
        fetchRooms();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to edit room.",
            life: 2000,
        });
    }
};

const editCampusResolver = ref(
    zodResolver(
        z.object({
            name: z
                .string({ error: "Name is required." })
                .min(1, { error: "Name is required." }),
        }),
    ),
);

const editCampusInitialValues = ref({} as Campus);
const editCampusVisible = ref(false);
const onEditCampusSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postEditCampus(
        editCampusInitialValues.value.id,
        form.values.name,
    );
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        editCampusVisible.value = false;
        form.reset();
        fetchCampuses();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to edit campus.",
            life: 2000,
        });
    }
};
const approverViewVisible = ref(false);
const newApproverResolver = ref(
    zodResolver(
        z.object({
            admin: z.object(
                {
                    id: z.number(),
                    email: z.string(),
                    name: z.string(),
                },
                { error: "Admin is required." },
            ),
        }),
    ),
);

const newApproverInitialValues = ref({});
const newApproverVisible = ref(false);
const onNewApproverSubmit = async (form: FormSubmitEvent) => {
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
    const response = await postCreateApprover(room.value, form.values.admin.id);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        newApproverVisible.value = false;
        form.reset();
        fetchApprovers();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to create approver.",
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
            summary: "Success",
            detail: response.message,
            life: 2000,
        });
        fetchApprovers();
    } else {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: response.message || "Failed to delete policy.",
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
        header="New Campus"
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
                <InputText name="name" placeholder="Name" fluid></InputText>
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
                    >Cancel</Button
                >
                <Button type="submit"><Plus></Plus>Create</Button>
            </div>
        </Form>
    </Dialog>
    <Dialog
        header="New Room"
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
                <InputText name="name" placeholder="Name" fluid></InputText>
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
                    placeholder="Campus"
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
                    >Cancel</Button
                >
                <Button type="submit"><Plus></Plus>Create</Button>
            </div>
        </Form>
    </Dialog>
    <Dialog
        header="New Class"
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
                <InputText name="name" placeholder="Name" fluid></InputText>
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
                    placeholder="Campus"
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
                    >Cancel</Button
                >
                <Button type="submit"><Plus></Plus>Create</Button>
            </div>
        </Form>
    </Dialog>
    <Dialog
        header="Room Policies"
        v-model:visible="policyViewVisible"
        modal
        class="xl:w-[50rem] w-[calc(100%-2rem)]"
    >
        <DataTable :value="roomPolicy" class="text-nowrap">
            <template #header>
                <div class="flex gap-2 justify-between">
                    <span class="text-lg font-bold">Room Policies</span>
                    <Button size="small" @click="newPolicyVisible = true"
                        ><Plus></Plus
                    ></Button>
                </div>
            </template>
            <template #empty>
                <span>No policies found.</span>
            </template>
            <Column field="id" header="ID"> </Column>
            <Column header="Weekdays">
                <template #body="slotProps">
                    {{ formatWeekDay(slotProps.data.days) }}
                </template>
            </Column>
            <Column header="Time">
                <template #body="slotProps">
                    {{
                        `${String(slotProps.data.startTime[0]).padStart(
                            2,
                            "0",
                        )}:${String(slotProps.data.startTime[1]).padStart(
                            2,
                            "0",
                        )} - ${String(slotProps.data.endTime[0]).padStart(
                            2,
                            "0",
                        )}:${String(slotProps.data.endTime[1]).padStart(
                            2,
                            "0",
                        )}`
                    }}
                </template>
            </Column>
            <Column header="Status">
                <template #body="slotProps">
                    <Tag
                        :value="slotProps.data.enabled ? 'Active' : 'Inactive'"
                        :severity="
                            slotProps.data.enabled ? 'success' : 'danger'
                        "
                    ></Tag>
                </template>
            </Column>
            <Column header="Actions">
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
        header="New Room Approver"
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
                                !roomApprover?.some(
                                    (approver: RoomApprover) =>
                                        approver.admin === admin.id,
                                ),
                        )
                    "
                    placeholder="Admin"
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
                    >Cancel</Button
                >
                <Button type="submit"><Plus></Plus>Create</Button>
            </div>
        </Form>
    </Dialog>
    <Dialog
        header="Room Approvers"
        v-model:visible="approverViewVisible"
        modal
        class="md:w-[33rem] w-[calc(100%-2rem)]"
    >
        <DataTable :value="roomApprover" class="text-nowrap">
            <template #header>
                <div class="flex gap-2 justify-between">
                    <span class="text-lg font-bold">Room Approvers</span>
                    <Button size="small" @click="newApproverVisible = true"
                        ><Plus></Plus
                    ></Button>
                </div>
            </template>
            <template #empty>
                <span>No approvers found.</span>
            </template>
            <Column field="id" header="ID"> </Column>
            <Column field="name" header="Name">
                <template #body="slotProps">
                    {{
                        admins?.data.find(
                            (admin: Admin) => admin.id === slotProps.data.admin,
                        )?.name
                    }}
                </template>
            </Column>
            <Column header="E-mail">
                <template #body="slotProps">
                    {{
                        admins?.data.find(
                            (admin: Admin) => admin.id === slotProps.data.admin,
                        )?.email
                    }}
                </template>
            </Column>
            <Column header="Actions">
                <template #body="slotProps">
                    <div class="flex gap-2">
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
        header="New Policy"
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
                    placeholder="Weekdays"
                ></MultiSelect>
                <Message
                    v-if="$form.days?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.days.error?.message }}</Message
                >
                <DatePicker
                    showTime
                    timeOnly
                    name="startTime"
                    :maxDate="$form.endTime?.value"
                    placeholder="Start Time"
                    :manualInput="false"
                ></DatePicker>
                <Message
                    v-if="$form.startTime?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.startTime.error?.message }}</Message
                >
                <DatePicker
                    showTime
                    timeOnly
                    name="endTime"
                    placeholder="End Time"
                    :minDate="$form.startTime?.value"
                    :manualInput="false"
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
                    >Cancel</Button
                >
                <Button type="submit"><Plus></Plus>Create</Button>
            </div>
        </Form>
    </Dialog>
    <Dialog
        header="Edit Room Policy"
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
                    placeholder="Weekdays"
                ></MultiSelect>
                <Message
                    v-if="$form.days?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.days.error?.message }}</Message
                >
                <DatePicker
                    showTime
                    timeOnly
                    name="startTime"
                    :maxDate="$form.endTime?.value"
                    placeholder="Start Time"
                    :manualInput="false"
                ></DatePicker>
                <Message
                    v-if="$form.startTime?.invalid"
                    severity="error"
                    size="small"
                    >{{ $form.startTime.error?.message }}</Message
                >
                <DatePicker
                    showTime
                    timeOnly
                    name="endTime"
                    placeholder="End Time"
                    :minDate="$form.startTime?.value"
                    :manualInput="false"
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
                    >Cancel</Button
                >
                <Button type="submit"><PenLine></PenLine>Edit</Button>
            </div>
        </Form>
    </Dialog>
    <Dialog
        header="Edit Class"
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
                <InputText name="name" placeholder="Name" fluid></InputText>
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
                    placeholder="Campus"
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
                    >Cancel</Button
                >
                <Button type="submit"><PenLine></PenLine>Edit</Button>
            </div>
        </Form>
    </Dialog>
    <Dialog
        header="Edit Room"
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
                <InputText name="name" placeholder="Name" fluid></InputText>
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
                    placeholder="Campus"
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
                    @click="(editRoomVisible = false), $form.reset()"
                    >Cancel</Button
                >
                <Button type="submit"><PenLine></PenLine>Edit</Button>
            </div>
        </Form>
    </Dialog>
    <Dialog
        header="Edit Room"
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
                <InputText name="name" placeholder="Name" fluid></InputText>
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
                    >Cancel</Button
                >
                <Button type="submit"><PenLine></PenLine>Edit</Button>
            </div>
        </Form>
    </Dialog>
    <div class="mt-[6rem] mb-4 md:mx-[3rem] mx-4">
        <h1 class="text-3xl font-bold my-4">Facility Management</h1>
        <div class="grid gap-4 grid-cols-6 items-start">
            <Card class="md:col-span-6 col-span-6">
                <template #content>
                    <DataTable :value="rooms?.data" class="text-nowrap">
                        <template #header>
                            <div class="flex justify-between items-center">
                                <span class="font-bold text-lg">Rooms</span>
                                <Button
                                    size="small"
                                    @click="newRoomVisible = true"
                                    ><Plus></Plus
                                ></Button>
                            </div>
                        </template>
                        <template #empty>
                            <span>No rooms found.</span>
                        </template>
                        <Column field="id" header="ID"></Column>
                        <Column field="name" header="Name"></Column>
                        <Column header="Campus">
                            <template #body="slotProps">
                                {{
                                    campuses?.data.find(
                                        (c: Campus) =>
                                            c.id === slotProps.data.campus,
                                    )?.name
                                }}
                            </template>
                        </Column>
                        <Column header="Policy">
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
                        <Column header="Approver">
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
                        <Column header="Creation Time">
                            <template #body="slotProps">
                                {{
                                    formatTime(
                                        new Date(slotProps.data.createdAt),
                                    )
                                }}
                            </template>
                        </Column>
                        <Column header="Action">
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
            <Card class="md:col-span-3 col-span-6">
                <template #content>
                    <DataTable :value="campuses?.data" class="text-nowrap">
                        <template #header>
                            <div class="flex justify-between items-center">
                                <span class="font-bold text-lg">Campuses</span>
                                <Button
                                    size="small"
                                    @click="newCampusVisible = true"
                                >
                                    <Plus></Plus>
                                </Button>
                            </div>
                        </template>
                        <template #empty>
                            <span>No campuses found.</span>
                        </template>
                        <Column field="id" header="ID"></Column>
                        <Column field="name" header="Name"></Column>
                        <Column header="Creation Time">
                            <template #body="slotProps">
                                {{
                                    formatTime(
                                        new Date(slotProps.data.createdAt),
                                    )
                                }}
                            </template>
                        </Column>
                        <Column header="Action">
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
            <Card class="md:col-span-3 col-span-6">
                <template #content>
                    <DataTable :value="classes?.data" class="text-nowrap">
                        <template #header>
                            <div class="flex justify-between items-center">
                                <span class="font-bold text-lg">Classes</span>
                                <Button
                                    size="small"
                                    @click="newClassVisible = true"
                                    ><Plus></Plus
                                ></Button>
                            </div>
                        </template>
                        <template #empty>
                            <span>No classes found.</span>
                        </template>
                        <Column field="id" header="ID"></Column>
                        <Column field="name" header="Name"></Column>
                        <Column header="Campus">
                            <template #body="slotProps">
                                {{
                                    campuses?.data.find(
                                        (c: Campus) =>
                                            c.id === slotProps.data.campus,
                                    )?.name
                                }}
                            </template>
                        </Column>
                        <Column header="Creation Time">
                            <template #body="slotProps">
                                {{
                                    formatTime(
                                        new Date(slotProps.data.createdAt),
                                    )
                                }}
                            </template>
                        </Column>
                        <Column header="Action">
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
