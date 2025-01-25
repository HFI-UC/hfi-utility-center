<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import VueTurnstile from "vue-turnstile";

const visible = ref(false);
const cnt = ref(1);
const cf_token = ref("");
const goRickRoll = () => {
    window.location.href = "https://wdf.ink/6oUP"
}
</script>

<template>
    <div class="flex flex-col gap-4 items-center justify-center">
        <h1 class="text-center">WhAt THe hEll iS ThAt?</h1>
        <img
            src="https://d.kstore.dev/download/7507/thinking_face_color.svg"
            class="hero-img m-6"
        />
        <span class="mt-[10rem] text-xl font-medium">向下滑动</span>
        <span
            class="slidedown-icon h-8 w-8 bg-primary text-primary-contrast rounded-full inline-flex items-center justify-center"
        >
            <i class="pi pi-arrow-down" />
        </span>
        <span class="h-[10rem]"></span>
        <h1
            v-animateonscroll="{
                enterClass: 'animate-flipup',
                leaveClass: 'animate-fadeout',
            }"
            class="animate-duration-1000 animate-ease-in-out text-center"
        >
            我是第 {{ cnt }} 个访问这个页面的人。
        </h1>
        <VueTurnstile
            v-if="visible"
            v-model="cf_token"
            site-key="0x4AAAAAAAiw3hAxhw1fzq4B"
        ></VueTurnstile>
        <Button
            @click="cnt++"
            class="animate-duration-1000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-fadeinleft',
                leaveClass: 'animate-fadeoutleft',
            }"
            >增加</Button
        >
        <span class="h-[20rem]"></span>
        <div
            class="flex flex-wrap text-center justify-center text-[1.8em] font-bold gap-1 animate-duration-1000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-fadeinright',
                leaveClass: 'animate-fadeoutright',
            }"
        >
            由
            <img class="ms-2 me-1" src="../assets/chatgpt.svg" width="160px" />
            o1 强势驱动。
        </div>
        <span class="h-[20rem]"></span>
        <div
            class="flex flex-wrap text-center justify-center text-[1.8em] font-bold gap-1 animate-duration-1000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-fadein',
                leaveClass: 'animate-fadeout',
            }"
        >
            隆重介绍……
        </div>
        <span class="h-[20rem]"></span>
        <div
            class="flex flex-wrap text-center justify-center text-[2.5em] sm:text-[5em] font-bold gap-1 animate-duration-1000 animate-ease-in-out"
            id="title"
            v-animateonscroll="{
                enterClass: 'animate-fadein',
                leaveClass: 'animate-fadeout',
            }"
        >
            HFI Utility Center
        </div>
        <div
            class="text-red-500 sm:text-[3em] text-[2em] font-bold animate-duration-2000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-zoomin',
                leaveClass: 'animate-fadeout',
            }"
        >
            2.0 版本
        </div>
        <Button
            @click="goRickRoll()"
            class="m-4 animate-duration-1000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-fadeinleft',
                leaveClass: 'animate-fadeoutleft',
            }"
            >了解详情</Button
        >
    </div>
</template>

<style scoped>
h1 {
    display: block;
    font-size: 1.8em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

#title {
    background: linear-gradient(to right, #ff7300, #ffec3f);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

@keyframes slidedown-icon {
    0% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(20px);
    }

    100% {
        transform: translateY(0);
    }
}

@keyframes jack-in-the-box {
    0% {
        opacity: 0;
        transform: scale(0.1) rotate(30deg);
        transform-origin: center bottom;
    }

    50% {
        transform: rotate(-10deg);
    }

    70% {
        transform: rotate(3deg);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.hero-img {
    animation-duration: 2s;
    animation-name: jack-in-the-box;
    width: 170px !important;
}

.slidedown-icon {
    animation: slidedown-icon;
    animation-duration: 3s;
    animation-iteration-count: infinite;
}
</style>
