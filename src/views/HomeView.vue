<script setup lang="ts">
import { PenSquare, Search, Sparkles } from "lucide-vue-next";
import AdCarousel from "@/components/AdCarousel.vue";
</script>
<template>
    <div class="flex flex-col min-h-screen">
        <div class="flex items-center justify-center h-[60svh] flex-col">
            <h1
                class="font-extrabold text-4xl sm:text-5xl bg-linear-to-r from-cyan-500 to-sky-500 bg-clip-text text-transparent text-center inline-block p-4"
            >
                {{ $t("home.title") }}
            </h1>
            <span
                class="text-sky-300 -mt-16.5 sm:-mt-20.5 z-[-1] text-[2.5em] sm:text-[3.5em] blur-[3rem] font-extrabold select-none"
                data-nosnippet
                aria-hidden="true"
                >{{ $t("home.title") }}</span
            >
            <h2 class="font-bold">{{ $t("home.subtitle") }}</h2>
            <div class="mt-8 flex gap-2 flex-wrap items-center justify-center mx-8">
                <Button as="RouterLink" to="/reservation/create" size="small"
                    ><PenSquare></PenSquare>{{ $t("home.button.bookRoom") }}</Button
                >
                <div
                    class="rounded-md p-px bg-linear-to-r from-blue-500 to-sky-500 inline-block"
                >
                    <Button
                        class="bg-transparent! border-none!"
                        as="RouterLink"
                        to="/utiverse"
                        size="small"
                        ><Sparkles></Sparkles>UtiVerse</Button
                    >
                </div>
                <Button
                    as="RouterLink"
                    to="/reservation/search"
                    size="small"
                    severity="secondary"
                    ><Search></Search
                    >{{ $t("home.button.viewReservation") }}</Button
                >
            </div>
            
        </div>
        <h3 class="font-semibold text-lg mt-10 mb-6 text-center">Featured Advertisements</h3>
        <AdCarousel :count="3" class="flex justify-center" containerClass="w-[80vw]" />
    </div>
</template>
