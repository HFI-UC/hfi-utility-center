<script setup lang="ts">
import { BookCheck, DoorClosed, UserRound } from 'lucide-vue-next';
import AdminLogin from '../../../components/AdminLogin.vue';
import Navbar from '../../../components/Navbar.vue';
import LoadingMask from '../../../components/LoadingMask.vue';

</script>

<template>
    <AdminLogin :requireLogin="true"></AdminLogin>
    <Navbar></Navbar>
    <LoadingMask></LoadingMask>
    <div class="mt-[6rem] mb-4 mx-[3rem]">
        <h1 class="font-bold text-3xl my-4">Admin Dashboard</h1>
        <h2 class="font-bold text-lg mt-8 mb-3">Application Entrance</h2>
        <div class="flex flex-wrap gap-3 items-center">
            <Button as="a" href="/admin/reservation" size="small"><BookCheck></BookCheck>Reservation Management</Button>
            <Button as="a" href="/admin/facility" size="small"><DoorClosed></DoorClosed>Facility Management</Button>
            <Button as="a" href="/admin/admin" size="small"><UserRound></UserRound>Admin Management</Button>
        </div>
    </div>
</template>