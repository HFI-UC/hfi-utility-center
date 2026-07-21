<script setup lang="ts">
import LoadingMask from "@/components/LoadingMask.vue";
import Navbar from "@/components/Navbar.vue";
import { useRoute } from "vue-router";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { Analytics } from "@vercel/analytics/vue";
const route = useRoute();
</script>
<template>
    <ConfirmPopup></ConfirmPopup>
    <Toast></Toast>
    <LoadingMask />
    <SpeedInsights></SpeedInsights>
    <Analytics></Analytics>
    <Navbar v-if="!route.meta.hideNavbar"></Navbar>
    <RouterView></RouterView>
</template>
