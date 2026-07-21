<script setup lang="ts">
import { getUserAdvertisements, type Advertisement } from '@/api';
import AdsDetailsCard from '@/components/AdsDetailsCard.vue';
import router from '@/router';
import { useAuthGuard } from '@/utils/authGuard';
import { Pen } from 'lucide-vue-next';
import { useRequest } from 'vue-request';


const { data: cardsData } = useRequest(getUserAdvertisements);

useAuthGuard({
    requireLogin: true,
    requiredRole: ["student", "admin", "approver", "system"],
});

const getButtonsForAd = (ad: Advertisement) => {
    const buttons = [];
    if (ad.status === 'pending' || ad.status === 'rejected') {
        buttons.push({
            label: 'Edit',
            action: () => {
                router.push(`/ads/edit/${ad.id}`);
            },
            iconComponent: Pen,
        });
    }
    return buttons;
};
</script>

<template>
    <div class="mt-24 mb-4 md:mx-12 2xl:mx-32 mx-4 flex flex-col">
        <h1 class="font-bold sm:text-3xl text-2xl my-4">
            My Ads
        </h1>
        <div class="grid grid-cols-3 gap-8 my-4">
            <div v-for="cardData in cardsData?.data" class="col-span-3 md:col-span-1">
                <AdsDetailsCard :data="cardData" :buttons="getButtonsForAd(cardData)"></AdsDetailsCard>
            </div>
        </div>
    </div>
</template>