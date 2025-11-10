<script setup lang="ts">
import { PenSquare, Search } from "lucide-vue-next";
import LoadingMask from "./components/LoadingMask.vue";
import Navbar from "./components/Navbar.vue";
</script>
<template>
    <Toast></Toast>
    <LoadingMask />
    <Navbar></Navbar>
    <div class="flex items-center justify-center h-[100svh] flex-col">
        <h1
            class="font-extrabold text-4xl sm:text-5xl bg-linear-to-r from-cyan-500 to-sky-500 bg-clip-text text-transparent text-center inline-block p-4"
        >
            {{ $t("home.title") }}
        </h1>
        <span
            class="text-sky-300 mt-[-66px] sm:mt-[-82px] z-[-1] text-[2.5em] sm:text-[3.5em] blur-[3rem] font-extrabold select-none"
            data-nosnippet
            aria-hidden="true"
            >{{ $t("home.title") }}</span
        >
        <h2 class="font-bold">{{ $t("home.subtitle") }}</h2>
        <div class="mt-8 flex gap-2 flex-wrap items-center justify-center">
            <Button as="a" href="/reservation/create/" size="small"
                ><PenSquare></PenSquare>{{ $t("home.buttons.bookRoom") }}</Button
            >
            <Button
                as="a"
                href="/reservation/search/"
                size="small"
                severity="secondary"
                ><Search></Search>{{ $t("home.buttons.viewReservations") }}</Button
            >
        </div>
    </div>
</template>
