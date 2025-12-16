<script setup lang="ts">
import { Cloud, Scroll, Sparkles, SquareArrowOutUpRight, Store } from "lucide-vue-next";
</script>
<template>
    <div class="pointer-events-none absolute inset-0">
        <div class="absolute -left-32 top-24 h-72 w-72 rounded-full bg-purple-500/40 blur-3xl"></div>
        <div class="absolute right-16 top-0 h-80 w-80 rounded-full bg-cyan-400/30 blur-[160px]"></div>
    </div>
    <div class="mt-[6rem] mb-4 md:mx-[3rem] 2xl:mx-[8rem] mx-4">
        <h1 class="font-extrabold text-xl text-center my-4 items-center flex justify-center gap-2"><Sparkles class="inline"></Sparkles>{{ $t('utiverse.title') }}</h1>
        <p class="my-4 text-center font-black text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl mx-auto leading-relaxed">
            {{ $t('utiverse.subtitle') }}
        </p>
        <div class="grid grid-cols-12 gap-4 my-3">
            <Card class="xl:col-span-4 md:col-span-6 col-span-12">
                <template #content>
                    <div class="h-50 bg-zinc-200/50 dark:bg-zinc-600/50 rounded-lg flex items-center justify-center">
                        <h2 class="font-extrabold text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl text-center my-4 items-center flex justify-center gap-3"><Store class="inline !h-13 !w-13"></Store>{{ $t('utiverse.bazaar.title') }}</h2>
                    </div>
                    <div class="space-y-2">
                        <p class="my-4">
                            {{ $t('utiverse.bazaar.description') }}
                        </p>
                        <p class="my-2 text-sm text-zinc-500">
                            {{ $t('utiverse.bazaar.subDescription') }}
                        </p>
                    </div>
                </template>
                <template #footer>
                    <Button size="small" fluid severity="secondary" as="a" href="https://eco.hfiuc.org/"><SquareArrowOutUpRight></SquareArrowOutUpRight> {{ $t('utiverse.go') }}</Button>
                </template>
            </Card>
            <Card class="xl:col-span-4 md:col-span-6 col-span-12">
                <template #content>
                    <div class="h-50 bg-zinc-200/50 dark:bg-zinc-600/50 rounded-lg flex items-center justify-center">
                        <h2 class="font-extrabold text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl text-center my-4 items-center flex justify-center gap-3"><Scroll class="inline !h-13 !w-13"></Scroll>{{ $t('utiverse.opia.title') }}</h2>
                    </div>
                    <div class="space-y-2">
                        <p class="my-4">
                            {{ $t('utiverse.opia.description') }}
                        </p>
                        <p class="my-2 text-sm text-zinc-500">
                            {{ $t('utiverse.opia.subDescription') }}
                        </p>
                    </div>
                </template>
                <template #footer>
                    <Button size="small" fluid severity="secondary" as="a" href="https://wow.hfiuc.org/"><SquareArrowOutUpRight></SquareArrowOutUpRight> {{ $t('utiverse.go') }}</Button>
                </template>
            </Card>
            <Card class="xl:col-span-4 md:col-span-6 col-span-12">
                <template #content>
                    <div class="h-50 bg-zinc-200/50 dark:bg-zinc-600/50 rounded-lg flex items-center justify-center">
                        <h2 class="font-extrabold text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl text-center my-4 items-center flex justify-center gap-3"><Cloud class="inline !h-13 !w-13"></Cloud>{{ $t('utiverse.cloud.title') }}</h2>
                    </div>
                    <div class="space-y-2">
                        <p class="my-4">
                            {{ $t('utiverse.cloud.description') }}
                        </p>
                        <p class="my-2 text-sm text-zinc-500">
                            {{ $t('utiverse.cloud.subDescription') }}
                        </p>
                    </div>
                </template>
                <template #footer>
                    <Button size="small" fluid severity="secondary" as="a" href="https://pan.hfiuc.org/"><SquareArrowOutUpRight></SquareArrowOutUpRight> {{ $t('utiverse.go') }}</Button>
                </template>
            </Card>
        </div>
    </div>
</template>
