<script setup lang="ts">
import InputText from "primevue/inputtext";
import InputMask from "primevue/inputmask";
import FloatLabel from "primevue/floatlabel";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import { computed, ref, Ref } from "vue";
import { type ReservationInfo } from "../api";

const reservation: Ref<ReservationInfo> = ref({
    studentName: "",
    selectedRoom: "",
    studentId: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
});

const rooms = ref([
    "iStudy Meeting Room 1",
    "iStudy Meeting Room 2",
    "606",
    "605",
    "603",
    "602",
    "601",
    "206",
    "105",
    "104",
    "Writing Center 1",
    "Writing Center 2",
    "514",
    "524",
]);

const minDate = ref(new Date())

const minHour = computed(() => {
    let startTime = new Date(reservation.value.startTime)
    startTime.setMinutes(startTime.getMinutes() + 15)
    return startTime
})


const onClickEvent = () => {
    console.log(reservation.value)
}
</script>

<template>
    <div class="flex flex-col items-center">
        <h1>Application Form</h1>
        <p>Fill out the form to submit a booking request.</p>
        <div class="m-[25px]" id="form-container">
            <FloatLabel class="m-[30px]">
                <InputText id="name" v-model="reservation.studentName" />
                <label for="name">Name</label>
            </FloatLabel>
            <FloatLabel class="m-[30px]">
                <Select id="room" w-10rem v-model="reservation.selectedRoom" :options="rooms" />
                <label for="room">Room</label>
            </FloatLabel>
            <FloatLabel class="m-[30px]">
                <InputMask id="id" v-model="reservation.studentId" mask="aa99999999"/>
                <label for="id">Student ID</label>
            </FloatLabel>
            <FloatLabel class="m-[30px]">
                <InputText id="name" v-model="reservation.email" />
                <label for="name">E-mail</label>
            </FloatLabel>
            <FloatLabel class="m-[30px]">
                <DatePicker id="date" v-model="reservation.date" :minDate="minDate" date-format="yy-mm-dd"/>
                <label for="date">Date</label>
            </FloatLabel>
            <FloatLabel class="m-[30px]">
                <DatePicker id="startTime" v-model="reservation.startTime" timeOnly :min-date="minDate" />
                <label for="startTime">Start Time</label>
            </FloatLabel>
            <FloatLabel class="m-[30px]">
                <DatePicker id="endTime" v-model="reservation.endTime" timeOnly :min-date="minHour" />
                <label for="endTime">End Time</label>
            </FloatLabel>
            <FloatLabel class="m-[30px]">
                <Textarea id="reason" v-model="reservation.reason"/>
                <label for="reason">Reason</label>
            </FloatLabel>
            <Button label="Submit" @click="onClickEvent"/>
        </div>
    </div>
</template>

<style scoped>
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

.p-select, .p-datepicker, .p-textarea {
    min-width: 20rem;
}

input {
    min-width: 20rem;
}
</style>
