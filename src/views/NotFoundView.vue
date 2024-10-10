<script setup>
import router from '../router/router';

setTimeout(() => router.go(-1), 3000)
</script>
<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-center">404 Not Found</h1>
        <img src="https://http.cat/404">
    </div>
</template>

<style scoped>
h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

img {
    width: 30%
}
</style>