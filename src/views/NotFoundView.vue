<script setup lang="ts">
import router from "../router/router";

setTimeout(() => router.go(-1), 5000);
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <img
            src="https://7507.kstore.space/thinking_face_color.svg"
            class="m-6"
        />
        <h2 class="text-center">404</h2>
        <br />
        <p class="text-center text-md mb-2">
            Sorry, something went wrong, but we are making it right.
        </p>
        <p class="text-center text-md mb-2">
            You seem lost, don't worry, we are getting back on track.
        </p>
        <p class="text-center text-md mb-2">
            You will return to the previous page in 5 seconds.
        </p>
        <br />
        <p class="text-center text-md mb-2">抱歉，出错了，但我们做对了。</p>
        <p class="text-center text-md mb-2">
            您看起来丢失了，别担心，我们正在返回轨道。
        </p>
        <p class="text-center text-md mb-2">将在 5 秒钟后返回上一页。</p>
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
