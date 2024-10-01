<template>
    <div class="flex flex-col items-center justify-center" id="home-container">
        <h1 class="flex">HFI Utility Center</h1>
        <h3 class="flex">Cenozoic</h3>
    </div>
</template>

<style scoped>
h1 {
    font-size: 5em;
    margin-block-start: 0.1em;
    margin-block-end: 0.1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: 900;
    background: linear-gradient(to right, #8a9cff, #bc3fff);
    background-clip: border-box;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    unicode-bidi: isolate;
}
h3 {
    font-size: 2.5em;
    margin-block-start: 0.1em;
    margin-block-end: 0.1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}
#home-container {
    height: 80vh;
}

@media screen and (max-width: 720px) {
    h1 {
        font-size: 2.5rem;
    }
    h3 {
        font-size: 1.25rem;
    }
}
</style>
