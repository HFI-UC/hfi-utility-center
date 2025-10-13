<script setup lang="ts">
import { Rive, RuntimeLoader } from "@rive-app/canvas";
// @ts-ignore
import riveWASMResource from "@rive-app/canvas/rive.wasm";
import { onMounted, ref } from "vue";
// @ts-ignore
import logoUrl from "@/assets/logo.riv?inline";

RuntimeLoader.setWasmUrl(riveWASMResource);

const isLoading = ref(true);
const isBackgroundVisible = ref(true);
const dataUrlToArrayBuffer = (dataUrl: string): ArrayBuffer => {
    const b64 = dataUrl.split(",")[1];
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
};
onMounted(() => {
    if (sessionStorage.getItem("skipLoadingMask") === "true") {
        isLoading.value = false;
        return;
    }
    const r = new Rive({
        buffer: dataUrlToArrayBuffer(logoUrl),
        // @ts-ignore
        canvas: document.getElementById("logo-canvas"),
        autoplay: true,
        pixelRatio: 5,
        stateMachines: "State Machine 1",
        onLoad: () => {
            r.resizeDrawingSurfaceToCanvas();
            setTimeout(() => {
                isBackgroundVisible.value = false;
                setTimeout(() => {
                    isLoading.value = false;
                    sessionStorage.setItem("skipLoadingMask", "true");
                }, 600);
            }, 3000);
        },
    });
});
</script>

<template>
    <div
        v-if="isLoading"
        :class="{
            'opacity-0': !isBackgroundVisible,
            'opacity-100': isBackgroundVisible,
        }"
        class="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto transition-opacity duration-500 ease-out"
    >
        <div
            class="z-[9998] absolute inset-0 bg-gradient-to-br from-red-800 from-10% via-indigo-500 via-50% to-violet-400 to-70% animate-gradient bg-[length:400%_400%]"
        ></div>
        <div
            class="absolute z-[9999] w-40 h-40 border-zinc-200 bg-white border-1 shadow-lg rounded-[35px] pointer-events-none transition-transform duration-500 ease-out flex items-center justify-center"
        >
            <canvas
                id="logo-canvas"
                class="pointer-events-none h-17 aria-hidden touch-none"
            ></canvas>
        </div>
    </div>
</template>
