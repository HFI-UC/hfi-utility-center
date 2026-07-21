<script setup lang="ts">
import { computed } from "vue";
import { useRequest } from "vue-request";
import { getRandomAdvertisements, type Advertisement } from "@/api";
import { useRouter } from "vue-router";
import { Delta, Op } from "quill";

interface Props {
    count?: number;
    showIndicators?: boolean;
    showThumbnails?: boolean;
    containerClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
    count: 1,
    showIndicators: true,
    showThumbnails: false,
    containerClass: "",
});

const countRef = computed(() => props.count);

const { data: adsData } = useRequest(() => getRandomAdvertisements(props.count), {
    refreshDeps: [countRef],
});

const advertisements = computed(() => adsData.value?.data || []);

const router = useRouter();

const handleAdClick = (ad: Advertisement) => {
    if (ad.link) {
        if (ad.link.startsWith("http")) {
            window.open(ad.link, "_blank");
        } else {
            router.push(ad.link);
        }
    }
};

const getPlainText = (op: Op[]): string => {
    if (!op.length) return "";
    const delta = new Delta(op);
    const textParts: string[] = [];
    delta.ops.forEach((op) => {
        if (typeof op.insert === "string") {
            textParts.push(op.insert);
        }
    });
    
    return textParts.join("").substring(0, 100) + "...";
};
</script>

<template>
    <div v-if="advertisements.length > 0" class="w-full">
        <Carousel
            :value="advertisements"
            :numVisible="3"
            :numScroll="1"
            :showIndicators="showIndicators"
            :showThumbnails="showThumbnails"
            :autoplayInterval="5000"
            :circular="true"
            :responsiveOptions="[
                {
                    breakpoint: '1400px',
                    numVisible: 3,
                    numScroll: 1
                },
                {
                    breakpoint: '1024px',
                    numVisible: 2,
                    numScroll: 1
                },
                {
                    breakpoint: '768px',
                    numVisible: 1,
                    numScroll: 1
                }
            ]"
            :containerClass="props.containerClass"
        >
            <template #item="slotProps">
                <div class="w-full cursor-pointer" @click="handleAdClick(slotProps.data)">
                    <Card class="m-2">
                        <template #content>
                            <div class="w-full flex flex-col gap-4">
                                <div class="w-full h-full">
                                    <img
                                        :src="slotProps.data.images[0]"
                                        :alt="slotProps.data.title"
                                        class="w-full h-64 md:h-80 object-contain rounded-border"
                                    />
                                </div>
                                <div class="w-full flex flex-col justify-between">
                                    <div>
                                        <h3 class="font-bold text-lg md:text-xl mb-2">{{ slotProps.data.title }}</h3>
                                        <div class="ql-editor text-sm md:text-md dark:text-surface-300 text-surface-600 line-clamp-3 md:line-clamp-none p-0">
                                            <div v-html="getPlainText(slotProps.data.content)" />
                                        </div>
                                    </div>
                                    <Button
                                        v-if="slotProps.data.link"
                                        severity="primary"
                                        size="small"
                                        class="w-full mt-2 md:mt-0"
                                    >
                                        Learn More
                                    </Button>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </template>
        </Carousel>
    </div>
</template>
