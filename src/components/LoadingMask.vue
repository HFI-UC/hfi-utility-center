<script setup lang="ts">
import { Rive, RuntimeLoader } from "@rive-app/canvas";
// @ts-ignore
import riveWASMResource from "@rive-app/canvas/rive.wasm";
import { onMounted, ref } from "vue";
// @ts-ignore
import logoUrl from "@/assets/logo.riv?inline";

RuntimeLoader.setWasmUrl(riveWASMResource);

const isLoading = ref(true);
const isExiting = ref(false);
const isFading = ref(false);
const logoExiting = ref(false);
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
                // 背景开始缩放
                isExiting.value = true;
                setTimeout(() => {
                    // 背景开始淡出
                    isFading.value = true;
                    setTimeout(() => {
                        // logo层开始退出
                        logoExiting.value = true;
                        setTimeout(() => {
                            isLoading.value = false;
                            sessionStorage.setItem("skipLoadingMask", "true");
                        }, 700);
                    }, 200);
                }, 500);
            }, 2500);
        },
    });
});
</script>

<template>
    <div
        v-if="isLoading"
        class="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
    >
        <div
            :class="{
                'scale-0': isExiting,
                'scale-500': !isExiting,
                'opacity-0': isFading,
                'opacity-100': !isFading,
            }"
            class="z-[9998] absolute inset-0 bg-gradient-to-br from-red-800 from-10% via-indigo-500 via-50% to-violet-400 to-70% animate-gradient bg-[length:400%_400%] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-[50%] aspect-square left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2"
        ></div>
        <div
            :class="{
                'scale-0 -translate-y-full opacity-0': logoExiting,
                'scale-100 translate-y-0 opacity-100': !logoExiting,
            }"
            class="absolute z-[9999] w-40 h-40 border-zinc-200 bg-white border-1 shadow-lg rounded-[35px] pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center"
        >
            <canvas
                id="logo-canvas"
                class="pointer-events-none h-17 aria-hidden touch-none"
            ></canvas>
        </div>
    </div>
</template>
