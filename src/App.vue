<script setup lang="ts">
import { PenSquare, Search } from "lucide-vue-next";
import LoadingMask from "./components/LoadingMask.vue";
import Navbar from "./components/Navbar.vue";
</script>
<template>
    <LoadingMask />
    <Navbar></Navbar>
    <div class="flex items-center justify-center h-[100svh] flex-col">
        <h1
            class="font-extrabold text-4xl sm:text-5xl bg-linear-to-r from-cyan-500 to-sky-500 bg-clip-text text-transparent text-center inline-block p-4"
        >
            HFI Utility Center
        </h1>
        <span class="text-sky-300 mt-[-82px] z-[-1] text-[3.5em] font-extrabold blur-[3rem] select-none" data-nosnippet aria-hidden="true">HFI Utility Center</span>
        <h2 class="font-bold">by MAKERs'</h2>
        <div class="mt-8 flex gap-2 flex-wrap items-center justify-center">
            <Button as="a" href="/reservation/create/" size="small"
                ><PenSquare></PenSquare>Book a room</Button
            >
            <Button
                as="a"
                href="/reservation/search/"
                size="small"
                severity="secondary"
                ><Search></Search>Find your reservation</Button
            >
        </div>
    </div>
</template>
