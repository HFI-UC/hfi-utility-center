<script setup lang="ts">
import { getAllAdvertisements, postAdsApprovalUpdate, type Advertisement } from '@/api';
import AdsDetailsCard from '@/components/AdsDetailsCard.vue';
import { useAuthGuard } from '@/utils/authGuard';
import router from '@/router';
import { Check, X, Pen } from 'lucide-vue-next';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRequest } from 'vue-request';


const { data: cardsData } = useRequest(getAllAdvertisements);

useAuthGuard({
    requireLogin: true,
    requiredRole: ["admin", "system"],
});

const toast = useToast();
const { t } = useI18n(); 
const onApprovalUpdate = async (approved: boolean, id: number, rejectionReason?: string) => {
    loading.value = true;
    const response = await postAdsApprovalUpdate(id, approved, rejectionReason);
    loading.value = false;
    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: response.message,
            life: 2000,
        });
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 2000,
        });
    }
};

const getButtons = (ad: Advertisement) => {
    const items = [];
    items.push({
        label: 'Edit',
        iconComponent: Pen,
        action: () => {
            router.push(`/ads/edit/${ad.id}`);
        },
    });
    if (ad.status != 'active') {
        items.push({
            label: 'Approve',
            iconComponent: Check,
            severity: 'success',
            action: () => {
                onApprovalUpdate(true, ad.id);
            },
        });
    }
    if (ad.status != 'rejected') {
        items.push({
            label: 'Reject',
            iconComponent: X,
            severity: 'danger',
            action: () => {
                
            },
        });
    }
    return items;
};

const loading = ref(false)
</script>

<template>
    <BlockUI :blocked="loading" fullScreen></BlockUI>
    <div class="mt-24 mb-4 md:mx-12 2xl:mx-32 mx-4 flex flex-col">
        <h1 class="font-bold sm:text-3xl text-2xl my-4">
            Ads Management
        </h1>
        <div class="grid grid-cols-3 gap-8 my-4">
            <div v-for="cardData in cardsData?.data" class="col-span-3 md:col-span-1">
                <AdsDetailsCard :data="cardData" :buttons="getButtons(cardData)"></AdsDetailsCard>
            </div>
        </div>
    </div>
</template>