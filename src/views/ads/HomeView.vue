<script setup lang="ts">
import { Cog, Play } from "lucide-vue-next";
import AdCarousel from "@/components/AdCarousel.vue";
</script>
<template>
    <div class="mt-32 mb-4 md:mx-32 2xl:mx-64 mx-4">
        <h1 class="font-extrabold text-6xl w-120 my-6">
            <span
                class="bg-linear-to-r from-violet-500 to-sky-500 bg-clip-text text-transparent"
                >UtiBoost</span
            >. Your ads, everything.
        </h1>
        <p class="dark:text-surface-300 text-surface-500 my-6 w-120">
            Create your ads in just a few seconds, with super low prices and
            extremely high exposure.
        </p>
        <div class="flex gap-2">
            <Button size="small" as="RouterLink" to="/ads/create"
                ><Play></Play>Getting started</Button
            >
            <Button
                size="small"
                as="RouterLink"
                to="/user/ads"
                severity="secondary"
                ><Cog></Cog>My ads</Button
            >
        </div>
        <div class="mt-12">
            <h2 class="font-bold text-3xl mb-6">Featured Ads</h2>
            <AdCarousel :count="3" containerClass="w-40 h-30" />
        </div>
    </div>
</template>
