<script setup lang="ts">
import Card from "primevue/card";
import { useToast } from "primevue/usetoast";
import { computed, onMounted, ref } from "vue";
import router from "../router/router";
import { getAction } from "../api";
const props = defineProps<{
    token?: string;
    action?: string;
}>();

const toast = useToast();
const status = ref("pending");
const message = ref("");
const data = ref();
const color = computed(() =>
    action == "approve" ? "text-green-500" : "text-red-500",
);
const token = props.token;
const isValid = ref(false);
const roomMapping: { [key: number]: string } = {
    101: "iStudy Meeting Room 1",
    102: "iStudy Meeting Room 2",
    103: "Writing Center 1",
    106: "Writing Center 2",
};
const action = props.action;
onMounted(() => {
    if (!token || !action) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Invalid argument.",
            life: 2000,
        });
        setTimeout(() => {
            router.go(-1);
        }, 3000);
        return;
    }
    isValid.value = true;
    getAction(token, action).then(
        (res: {
            success: boolean;
            data?: {
                addTime: string;
                email: string;
                reason: string;
                room: number;
            };
            message?: string;
        }) => {
            message.value = res.message || "";
            data.value = res.data;
            status.value = res.success ? "success" : "error";
        },
    );
});
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1>Reservation Approval</h1>
        <Card id="card" v-if="isValid">
            <template #content>
                <div
                    v-if="status == 'pending'"
                    class="flex flex-col items-center justify-center"
                >
                    <h3>Pending...</h3>
                    <i
                        class="pi pi-spin pi-spinner m-[2rem]"
                        id="status-icon"
                        style="color: var(--p-gray-500)"
                    ></i>
                    <p class="w-[20rem] m-[1rem] text-center"></p>
                </div>
                <div
                    v-if="status == 'success'"
                    class="flex flex-col items-center justify-center"
                >
                    <h3>Success!</h3>
                    <i
                        class="pi pi-check m-[2rem]"
                        id="status-icon"
                        style="color: var(--p-green-500)"
                    ></i>
                    <span
                        v-if="data"
                        class="w-[20rem] m-[1rem] flex flex-col text-center"
                    >
                        <p class="m-[5px]">
                            The reservation has been
                            <b :class="`font-bold ${color}`">{{
                                action == "approve" ? "approved" : "rejected"
                            }}</b
                            >.
                        </p>
                        <br />
                        <p class="m-[5px]">
                            <b>Add Time: </b>{{ data.addTime }}
                        </p>
                        <p class="m-[5px]"><b>E-mail: </b>{{ data.email }}</p>
                        <p class="m-[5px]"><b>Reason: </b>{{ data.reason }}</p>
                        <p class="m-[5px]">
                            <b>Room: </b
                            >{{
                                roomMapping[data.room] || data.room.toString()
                            }}
                        </p>
                    </span>
                </div>
                <div
                    v-if="status == 'error'"
                    class="flex flex-col items-center justify-center"
                >
                    <h3>Something went wrong.</h3>
                    <i
                        class="pi pi-times m-[2rem]"
                        id="status-icon"
                        style="color: var(--p-red-500)"
                    ></i>
                    <p class="w-[20rem] m-[1rem] text-center">
                        We are trying to fix this problem.
                        {{ message }}
                    </p>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
#card {
    width: 28rem;
}

#status-icon {
    font-size: 8rem;
}
b {
    font-weight: bold;
}
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

h3 {
    display: block;
    font-size: 1.5em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

@media screen and (max-width: 720px) {
    #card {
        width: 25rem;
    }

    h1 {
        font-size: 1.75rem;
    }
}
</style>
