<script setup lang="ts">
import { ref } from "vue";
import router from "../router/router";

const time = ref(5);
setTimeout(() => router.go(-1), 5000);
setInterval(() => time.value--, 1000);
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <img
            src="https://d.kstore.dev/download/7507/thinking_face_color.svg"
            class="m-6"
        />
        <h2 class="text-center">404</h2>
        <br />
        <p class="text-center text-md mb-2">
            Sorry, something went wrong, but we are making it right.
        </p>
        <p class="text-center text-md mb-2">
            You seem lost. Don't worry, heads up, sit back and relax. We are
            getting back on track.
        </p>
        <p class="text-center text-md mb-2">
            Cool! You will roll back to the previous page in {{ time }} seconds.
        </p>
        <br />
        <p class="text-center text-md mb-2">抱歉，出错了，但我们做对了。</p>
        <p class="text-center text-md mb-2">
            您看起来丢失了，别担心，头抬起，坐和放宽。我们正在返回轨道。
        </p>
        <p class="text-center text-md mb-2">
            凉！你将在 {{ time }} 秒钟后被滚回。
        </p>
    </div>
</template>

<style scoped>
h1 {
    display: block;
    font-size: 6em;
    font-weight: bold;
}

img {
    width: 170px !important;
}

h2 {
    display: block;
    font-size: 4em;
    font-weight: bold;
}

img {
    width: 30%;
}
</style>
