<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Button from "primevue/button";
import VueTurnstile from "vue-turnstile";
import AbsurdAnimation from "../components/AbsurdAnimation.vue";
// @ts-ignore
import VueLive2d from "vue-live2d";
import { useRequest } from "vue-request";
import { getAbsurdCount, postAbsurdAdd } from "../api";
import { useToast } from "primevue";

const { data, run } = useRequest(() => getAbsurdCount(), { manual: true });
onMounted(() => {
    run();
});
const toast = useToast();
const cnt = computed(() => data.value || 1);
const cf_token = ref("");
const title = ref("HFI Utility Center");
const version = ref("2");
const showVideo = ref(false);
const showMore = ref(false);
const slideDown = ref(true);
const showLive2d = ref(false);
const addLoading = ref(false);
const showSummonButton = ref(true);
const onPlay = () => {
    title.value = "你被骗了";
    version.value = "哈哈哈";
    showMore.value = true;
};
const changeDirection = () => {
    slideDown.value = !slideDown.value;
};
const summonLive2d = () => {
    summonText.value = "加载中";
    let dotCount = 0;

    const interval = setInterval(() => {
        dotCount++;
        summonText.value = "加载中" + ".".repeat(dotCount);

        if (dotCount === 40) {
            summonText.value = "骗你的😄，早就加载完了";
            showLive2d.value = true;
            setTimeout(() => {
                showSummonButton.value = false;
            }, 2000);
            clearInterval(interval);
        }
    }, 200);
};
const summonText = ref("一键召唤二次元老婆😋");
const onAddEvent = async () => {
    addLoading.value = true;
    const res = await postAbsurdAdd(cf_token.value);
    if (res.success) {
        toast.add({
            summary: "成功！",
            detail: "你成功成为了一个访问了该页面的人！",
            severity: "success",
            life: 3000,
        });
    } else {
        toast.add({
            summary: "失败！",
            detail: "似乎遇到了些问题呢……",
            severity: "error",
            life: 3000,
        });
    }
    addLoading.value = false;
};

setInterval(() => {
    changeDirection();
}, 2000);
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
        <p class="text-sm">告诉我们你是人类</p>
        <VueTurnstile
            v-model="cf_token"
            site-key="0x4AAAAAAAiw3hAxhw1fzq4B"
        ></VueTurnstile>
        <Button
            @click="onAddEvent()"
            :loading="addLoading"
            icon="pi pi-plus"
            :disabled="cf_token == ''"
            class="animate-duration-1000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-fadeinleft',
                leaveClass: 'animate-fadeoutleft',
            }"
            >增加</Button
        >
        <span class="h-[20rem]"></span>
        <div
            class="flex flex-wrap text-center justify-center text-[1.8em] font-bold gap-2 animate-duration-1000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-fadeinright',
                leaveClass: 'animate-fadeoutright',
            }"
        >
            由
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 475.02 92"
                width="160px"
            >
                <g>
                    <g>
                        <path
                            class="cls-1"
                            d="M84.79,37.65c1.03-3.1,1.39-6.38,1.05-9.63-.34-3.25-1.37-6.38-3.02-9.2-2.45-4.26-6.18-7.63-10.67-9.63-4.49-2-9.49-2.52-14.3-1.49-2.17-2.44-4.83-4.39-7.81-5.72C47.06.66,43.83-.02,40.57,0c-4.91-.01-9.7,1.54-13.67,4.42-3.97,2.88-6.93,6.96-8.44,11.63-3.2.65-6.22,1.99-8.86,3.9-2.64,1.92-4.85,4.38-6.46,7.21C.67,31.42-.39,36.34.13,41.22c.51,4.88,2.56,9.48,5.86,13.12-1.03,3.1-1.39,6.38-1.05,9.63.34,3.25,1.37,6.38,3.02,9.2,2.45,4.26,6.18,7.63,10.67,9.63,4.49,2,9.49,2.52,14.3,1.49,2.17,2.44,4.83,4.39,7.81,5.72,2.98,1.33,6.21,2.01,9.48,1.99,4.91.01,9.7-1.54,13.68-4.42,3.98-2.89,6.93-6.96,8.44-11.64,3.2-.65,6.22-1.99,8.86-3.9,2.64-1.92,4.85-4.38,6.46-7.22,2.46-4.25,3.51-9.17,3-14.05-.51-4.88-2.56-9.48-5.86-13.12ZM50.21,85.99c-4.03,0-7.94-1.41-11.04-3.99.14-.08.38-.21.54-.31l18.32-10.58c.46-.26.84-.64,1.11-1.1.26-.46.4-.98.4-1.51v-25.83l7.74,4.47s.08.05.1.09c.03.04.04.08.05.12v21.39c0,4.57-1.82,8.95-5.05,12.18-3.23,3.23-7.61,5.05-12.17,5.06ZM13.17,70.16c-2.02-3.49-2.75-7.58-2.06-11.55.14.08.37.23.54.32l18.32,10.58c.46.27.98.41,1.5.41s1.05-.14,1.5-.41l22.36-12.91v8.94s0,.09-.03.13c-.02.04-.05.08-.09.1l-18.52,10.69c-3.96,2.28-8.67,2.9-13.08,1.72-4.42-1.18-8.18-4.07-10.47-8.02ZM8.35,30.17c2.01-3.5,5.19-6.17,8.97-7.56,0,.16,0,.44,0,.63v21.16c0,.53.13,1.05.4,1.51.26.46.65.84,1.1,1.1l22.36,12.91-7.74,4.47s-.08.04-.13.04c-.05,0-.09,0-.13-.02l-18.52-10.7c-3.95-2.29-6.84-6.05-8.02-10.47-1.18-4.41-.57-9.12,1.71-13.08ZM71.96,44.98l-22.36-12.91,7.74-4.47s.08-.04.13-.04c.05,0,.09,0,.13.02l18.52,10.69c2.84,1.64,5.15,4.05,6.66,6.96,1.52,2.91,2.17,6.18,1.89,9.45-.28,3.26-1.48,6.38-3.47,8.99-1.99,2.61-4.68,4.59-7.75,5.72v-21.8c0-.53-.13-1.05-.39-1.5s-.64-.84-1.1-1.1ZM79.67,33.38c-.14-.08-.37-.23-.54-.32l-18.32-10.58c-.46-.27-.98-.41-1.5-.41s-1.05.14-1.5.41l-22.36,12.91v-8.94s0-.09.03-.13c.02-.04.05-.08.09-.1l18.52-10.68c2.84-1.64,6.08-2.43,9.35-2.29,3.27.14,6.44,1.21,9.12,3.08,2.69,1.87,4.78,4.47,6.05,7.49,1.26,3.02,1.64,6.34,1.09,9.57ZM31.22,49.32l-7.74-4.47s-.08-.05-.1-.09-.04-.08-.05-.13v-21.39c0-3.28.94-6.48,2.7-9.25,1.76-2.76,4.27-4.97,7.23-6.36s6.27-1.9,9.52-1.49c3.25.42,6.31,1.75,8.83,3.85-.14.08-.38.21-.54.31l-18.32,10.58c-.46.26-.84.64-1.11,1.1-.26.46-.4.98-.4,1.51v25.82ZM35.43,40.25l9.96-5.75,9.96,5.75v11.5l-9.96,5.75-9.96-5.75v-11.5Z"
                        />
                        <g>
                            <path
                                class="cls-1"
                                d="M162.54,73.93c-4.63,2.27-10.66,3.41-18.11,3.41-9.58,0-17.19-2.87-22.81-8.6-5.63-5.74-8.44-13.38-8.44-22.94,0-10.05,3.14-18.27,9.42-24.66,6.28-6.39,14.39-9.59,24.33-9.59,6.22,0,11.42.81,15.61,2.42v13.1c-4.3-2.52-9.17-3.78-14.62-3.78-6.22,0-11.18,1.98-14.91,5.95-3.72,3.97-5.59,9.16-5.59,15.56s1.77,11.27,5.3,15.07c3.53,3.81,8.31,5.71,14.33,5.71,5.67,0,10.83-1.37,15.48-4.11v12.44Z"
                            />
                            <path
                                class="cls-1"
                                d="M215.39,76.23h-13.22v-25.87c0-6.98-2.55-10.47-7.64-10.47-2.55,0-4.65.97-6.3,2.92-1.66,1.94-2.48,4.46-2.48,7.56v25.87h-13.27V9h13.27v28.62h.16c3.48-5.28,8.16-7.93,14.04-7.93,10.29,0,15.44,6.22,15.44,18.65v27.88Z"
                            />
                            <path
                                class="cls-1"
                                d="M227.88,33.56c2.05-1.15,4.8-2.08,8.23-2.79,3.44-.71,6.37-1.07,8.81-1.07,12.7,0,19.06,6.37,19.06,19.1v27.43h-12.61v-6.61h-.16c-3.09,5.15-7.62,7.72-13.59,7.72-4.3,0-7.74-1.22-10.33-3.67-2.59-2.45-3.88-5.78-3.88-10,0-8.71,5.19-13.77,15.56-15.2l12.48-1.68c0-5.28-2.75-7.93-8.25-7.93s-10.53,1.64-15.32,4.93v-10.23ZM242.87,55.65c-4.79.63-7.19,2.79-7.19,6.49,0,1.7.58,3.07,1.75,4.11,1.16,1.04,2.73,1.56,4.7,1.56,2.71,0,4.94-.96,6.69-2.88,1.75-1.92,2.63-4.3,2.63-7.15v-3.24l-8.58,1.11Z"
                            />
                            <path
                                class="cls-1"
                                d="M302.09,75.69c-2,1.1-5.02,1.64-9.08,1.64-9.64,0-14.46-5.06-14.46-15.19v-21.44h-7.47v-9.9h7.47v-9.98l13.18-3.78v13.76h10.35v9.9h-10.35v19.14c0,4.85,1.92,7.27,5.75,7.27,1.48,0,3.01-.44,4.6-1.31v9.9Z"
                            />
                            <path
                                class="cls-1"
                                d="M363.2,71.96c-6.22,3.59-13.85,5.38-22.92,5.38-10.13,0-18.13-2.85-23.98-8.54s-8.79-13.48-8.79-23.37,3.22-18.17,9.67-24.46c6.45-6.28,14.94-9.42,25.48-9.42,6.79,0,12.72.96,17.78,2.87v12.85c-4.93-2.87-10.95-4.31-18.07-4.31-6.13,0-11.1,2-14.91,6-3.81,4-5.71,9.27-5.71,15.81s1.72,11.84,5.15,15.56c3.44,3.72,8.12,5.59,14.06,5.59,3.53,0,6.42-.55,8.66-1.64v-13.06h-12.85v-10.88h26.41v31.62Z"
                            />
                            <path
                                class="cls-1"
                                d="M389.4,54.05v22.18h-13.55V12.61h21.89c15.82,0,23.74,6.71,23.74,20.12,0,6.52-2.39,11.74-7.17,15.67-4.78,3.93-10.75,5.81-17.93,5.65h-6.98ZM389.4,23.13v20.53h5.87c7.97,0,11.95-3.46,11.95-10.39s-3.94-10.14-11.83-10.14h-6Z"
                            />
                            <path
                                class="cls-1"
                                d="M475.02,23.7h-18.15v52.53h-13.59V23.7h-18.11v-11.09h49.86v11.09Z"
                            />
                        </g>
                    </g>
                </g>
            </svg>
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
            {{ title }}
        </div>
        <div
            class="text-red-500 sm:text-[3em] text-[1.5em] font-bold animate-duration-2000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-zoomin',
                leaveClass: 'animate-fadeout',
            }"
        >
            {{ version }}
        </div>
        <Button
            @click="showVideo = true"
            class="m-4 animate-duration-1000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-fadeinleft',
                leaveClass: 'animate-fadeoutleft',
            }"
            >了解详情</Button
        >
        <video
            v-if="showVideo"
            @play="onPlay()"
            class="sm:w-[50%] w-full"
            controls
        >
            <source
                src="https://d.kstore.dev/download/7507/192d9a98d782d9c74c96f09db9378d93.mp4"
                type="video/mp4"
            />
        </video>
    </div>
    <div
        v-if="showMore"
        class="mt-[5rem] flex flex-col gap-4 items-center justify-center"
    >
        <AbsurdAnimation></AbsurdAnimation>
        <span class="h-[2rem]"></span>
        <div
            v-if="slideDown"
            class="flex flex-col gap-4 items-center justify-center"
        >
            <span class="text-xl font-medium">向下滑动</span>
            <span
                class="slidedown-icon h-8 w-8 bg-primary text-primary-contrast rounded-full inline-flex items-center justify-center"
            >
                <i class="pi pi-arrow-down" />
            </span>
        </div>
        <div v-else class="flex flex-col gap-4 items-center justify-center">
            <span
                class="slideup-icon h-8 w-8 bg-primary text-primary-contrast rounded-full inline-flex items-center justify-center"
            >
                <i class="pi pi-arrow-up" />
            </span>
            <span class="text-xl font-medium">向上滑动</span>
        </div>
        <span class="h-[30rem]"></span>
        <div
            class="flex flex-wrap text-center justify-center text-[1.8em] font-bold gap-1 animate-duration-1000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-fadein',
                leaveClass: 'animate-fadeout',
            }"
        >
            新功能速览
        </div>
        <span class="h-[10rem]"></span>
        <div
            class="flex flex-col text-center justify-center text-[1.8em] font-bold gap-4 animate-duration-1000 animate-ease-in-out"
            v-animateonscroll="{
                enterClass: 'animate-fadeinright',
                leaveClass: 'animate-fadeoutright',
            }"
        >
            <img
                src="https://s21.ax1x.com/2025/01/27/pEVemVg.png"
                width="400px"
            />
            功能一：二次元老婆😋😋😋
        </div>
        <span class="h-[rem]"></span>
        <Button
            class="animate-duration-1000 animate-ease-in-out"
            v-if="showSummonButton"
            @click="summonLive2d()"
            v-animateonscroll="{
                enterClass: 'animate-fadein',
                leaveClass: 'animate-fadeout',
            }"
            >{{ summonText }}</Button
        >
        <VueLive2d v-if="showLive2d" :size="400" id="live2d"></VueLive2d>
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

:deep(#live2d) svg {
    display: inline-block !important;
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

button {
    border-radius: 0.5rem;
}

video {
    border-radius: 0.75rem;
}

.slidedown-icon {
    animation: slidedown-icon;
    animation-duration: 3s;
    animation-iteration-count: infinite;
}

@keyframes slideup-icon {
    0% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-20px);
    }

    100% {
        transform: translateY(0);
    }
}

.cls-1 {
    fill: black;
}

html.p-dark .cls-1 {
    fill: white;
}

.slideup-icon {
    animation: slideup-icon;
    animation-duration: 3s;
    animation-iteration-count: infinite;
}
</style>
