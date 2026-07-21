<script setup lang="ts">
import { useRequest } from "vue-request";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { computed, ref } from "vue";
import z from "zod";
import { Form, type FormSubmitEvent } from "@primevue/forms";
import { useToast, useConfirm } from "primevue";
import { useI18n } from "vue-i18n";
import { Trash2, Plus, Check, X, PenSquare } from "lucide-vue-next";
import { useAuthGuard } from "@/utils/authGuard";
import {
    getAdsPricingConfig,
    postUpdateAdsPricingConfig,
    getAdsPricingDiscounts,
    postCreateAdsPricingDiscount,
    postUpdateAdsPricingDiscount,
    postDeleteAdsPricingDiscount,
    type AdsPricingDiscount,
} from "@/api";

useAuthGuard({
    requireLogin: true,
    requiredRole: ["admin", "system"],
});
const toast = useToast();
const confirm = useConfirm();
const { t } = useI18n();

const { data: pricingConfig, run: runGetPricingConfig } = useRequest(getAdsPricingConfig);
const { data: discounts, run: runGetDiscounts } = useRequest(getAdsPricingDiscounts);

const activeTab = ref("0");

// Pricing Config Form
const pricingResolver = computed(() =>
    zodResolver(
        z.object({
            pricePerDay: z.number({ message: "Price per day is required." }).min(0.01, {
                message: "Price must be greater than 0.",
            }),
            minDuration: z.number({ message: "Min duration is required." }).min(1, {
                message: "Min duration must be at least 1 day.",
            }),
            maxDuration: z.number({ message: "Max duration is required." }).min(1, {
                message: "Max duration must be at least 1 day.",
            }),
        })
    )
);

const pricingInitialValues = computed(() => ({
    pricePerDay: pricingConfig.value?.data?.pricePerDay ?? 10,
    minDuration: pricingConfig.value?.data?.minDuration ?? 1,
    maxDuration: pricingConfig.value?.data?.maxDuration ?? 90,
}));

const pricingSubmitLoading = ref(false);
const onPricingSubmit = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: "Please fill in all required fields correctly.",
            life: 2000,
        });
        return;
    }

    if (form.values.minDuration > form.values.maxDuration) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: "Min duration cannot be greater than max duration.",
            life: 2000,
        });
        return;
    }

    pricingSubmitLoading.value = true;
    const response = await postUpdateAdsPricingConfig(
        form.values.pricePerDay,
        form.values.minDuration,
        form.values.maxDuration
    );
    pricingSubmitLoading.value = false;

    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: "Pricing configuration updated successfully.",
            life: 2000,
        });
        refetchPricingConfig();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 2000,
        });
    }
};

// Discount Form
const discountResolver = computed(() =>
    zodResolver(
        z.object({
            discountPercentage: z.number({ message: "Discount percentage is required." })
                .min(0, { message: "Discount must be 0% or higher." })
                .max(100, { message: "Discount cannot exceed 100%." }),
            startDate: z.date({ message: "Start date is required." }),
            endDate: z.date({ message: "End date is required." }),
            description: z.string({ message: "Description is required." })
                .min(1, { message: "Description is required." }),
        })
    )
);

const discountInitialValues = ref({
    discountPercentage: 0,
    startDate: new Date(),
    endDate: new Date(),
    description: "",
});

const discountSubmitLoading = ref(false);
const discountDialogVisible = ref(false);
const editingDiscount = ref<AdsPricingDiscount | null>(null);

const openDiscountDialog = (discount?: AdsPricingDiscount) => {
    if (discount) {
        editingDiscount.value = discount;
        discountInitialValues.value = {
            discountPercentage: discount.discountPercentage,
            startDate: new Date(discount.startDate) as any,
            endDate: new Date(discount.endDate) as any,
            description: discount.description,
        };
    } else {
        editingDiscount.value = null;
        discountInitialValues.value = {
            discountPercentage: 0,
            startDate: new Date() as any,
            endDate: new Date() as any,
            description: "",
        };
    }
    discountDialogVisible.value = true;
};

const closeDiscountDialog = () => {
    discountDialogVisible.value = false;
    editingDiscount.value = null;
};

const refetchPricingConfig = async () => {
    await runGetPricingConfig();
};

const refetchDiscounts = async () => {
    await runGetDiscounts();
};

const onDiscountSubmit = async (form: FormSubmitEvent) => {
    if (!form.valid) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: "Please fill in all required fields correctly.",
            life: 2000,
        });
        return;
    }

    if (form.values.startDate > form.values.endDate) {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: "Start date cannot be after end date.",
            life: 2000,
        });
        return;
    }

    discountSubmitLoading.value = true;

    let response;
    if (editingDiscount.value) {
        response = await postUpdateAdsPricingDiscount(
            editingDiscount.value.id,
            form.values.discountPercentage,
            form.values.startDate,
            form.values.endDate,
            form.values.description,
            true
        );
    } else {
        response = await postCreateAdsPricingDiscount(
            form.values.discountPercentage,
            form.values.startDate,
            form.values.endDate,
            form.values.description
        );
    }

    discountSubmitLoading.value = false;

    if (response.success) {
        toast.add({
            severity: "success",
            summary: t("common.success"),
            detail: editingDiscount.value ? "Discount updated successfully." : "Discount created successfully.",
            life: 2000,
        });
        closeDiscountDialog();
        refetchDiscounts();
    } else {
        toast.add({
            severity: "error",
            summary: t("common.error"),
            detail: response.message,
            life: 2000,
        });
    }
};

const deleteDiscount = async (id: number) => {
    confirm.require({
        message: "Are you sure you want to delete this discount?",
        accept: async () => {
            const response = await postDeleteAdsPricingDiscount(id);
            if (response.success) {
                toast.add({
                    severity: "success",
                    summary: t("common.success"),
                    detail: "Discount deleted successfully.",
                    life: 2000,
                });
                refetchDiscounts();
            } else {
                toast.add({
                    severity: "error",
                    summary: t("common.error"),
                    detail: response.message,
                    life: 2000,
                });
            }
        },
    });
};

const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString();
};

const formatPrice = (price: number): string => {
    return `RMB ${price.toFixed(2)}`;
};

const discountsList = computed(() => discounts.value?.data || []);
</script>

<template>
    <div class="mt-24 mb-4 md:mx-12 2xl:mx-32 mx-4">
        <h1 class="font-bold md:text-3xl text-2xl my-4">Advertisement Pricing Management</h1>

        <Card class="mt-4">
            <template #content>
                <Tabs :value="activeTab">
                    <TabList>
                        <Tab value="0">Base Pricing</Tab>
                        <Tab value="1">Period Discounts</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel value="0">
                            <div class="mt-4">
                                <Form
                                    v-slot="$form"
                                    :resolver="pricingResolver"
                                    :initialValues="pricingInitialValues"
                                    @submit="onPricingSubmit"
                                >
                                    <div class="flex flex-col gap-4 md:w-140 w-full">
                                    <IftaLabel>
                                        <InputNumber
                                            id="pricePerDay"
                                            name="pricePerDay"
                                            fluid
                                            :min="0"
                                            :step="0.01"
                                            :maxFractionDigits="2"
                                        />
                                        <label for="pricePerDay">Price Per Day (RMB)</label>
                                    </IftaLabel>
                                    <Message
                                        v-if="$form.pricePerDay?.invalid"
                                        severity="error"
                                        size="small"
                                        >{{ $form.pricePerDay.error?.message }}</Message
                                    >

                                    <IftaLabel>
                                        <InputNumber
                                            id="minDuration"
                                            name="minDuration"
                                            fluid
                                            :min="1"
                                            :useGrouping="false"
                                        />
                                        <label for="minDuration">Minimum Duration (days)</label>
                                        <p class="text-xs dark:text-surface-300 text-surface-500 mt-2">
                                            Minimum number of days users can book ads.
                                        </p>
                                    </IftaLabel>
                                    <Message
                                        v-if="$form.minDuration?.invalid"
                                        severity="error"
                                        size="small"
                                        >{{ $form.minDuration.error?.message }}</Message
                                    >

                                    <IftaLabel>
                                        <InputNumber
                                            id="maxDuration"
                                            name="maxDuration"
                                            fluid
                                            :min="1"
                                            :useGrouping="false"
                                        />
                                        <label for="maxDuration">Maximum Duration (days)</label>
                                        <p class="text-xs dark:text-surface-300 text-surface-500 mt-2">
                                            Maximum number of days users can book ads.
                                        </p>
                                    </IftaLabel>
                                    <Message
                                        v-if="$form.maxDuration?.invalid"
                                        severity="error"
                                        size="small"
                                        >{{ $form.maxDuration.error?.message }}</Message
                                    >

                                    <Divider />

                                    <div class="bg-surface-50 dark:bg-surface-800 p-4 rounded-border">
                                        <p class="font-semibold mb-2">Price Summary</p>
                                        <div class="space-y-1 text-sm">
                                            <p>Daily Rate: <span class="font-bold">{{ formatPrice($form.pricePerDay?.value || 0) }}</span></p>
                                            <p>Min Total: <span class="font-bold">{{ formatPrice(($form.minDuration?.value || 1) * ($form.pricePerDay?.value || 0)) }}</span></p>
                                            <p>Max Total: <span class="font-bold">{{ formatPrice(($form.maxDuration?.value || 90) * ($form.pricePerDay?.value || 0)) }}</span></p>
                                        </div>
                                    </div>

                                    <Button type="submit" fluid :disabled="pricingSubmitLoading" size="small">
                                        <Check />
                                        Update Pricing Configuration
                                    </Button>
                                </div>
                                </Form>
                            </div>
                        </TabPanel>

                        <TabPanel value="1">
                <div class="mt-4">
                    <Button 
                        @click="openDiscountDialog()" 
                        class="mb-4"
                        size="small"
                    >
                        <Plus />
                        Add New Discount
                    </Button>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card v-for="discount in discountsList" :key="discount.id">
                            <template #content>
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 class="font-bold text-lg">{{ discount.discountPercentage }}% OFF</h3>
                                        <p class="text-sm dark:text-surface-300 text-surface-500">
                                            {{ formatDate(discount.startDate) }} - {{ formatDate(discount.endDate) }}
                                        </p>
                                    </div>
                                    <Tag 
                                        :value="discount.isActive ? 'Active' : 'Inactive'" 
                                        :severity="discount.isActive ? 'success' : 'warning'"
                                    />
                                </div>

                                <p class="text-sm mb-4">{{ discount.description }}</p>

                                <div class="flex gap-2">
                                    <Button 
                                        size="small" 
                                        severity="info"
                                        @click="openDiscountDialog(discount)"
                                        fluid
                                    >
                                        <PenSquare></PenSquare>Edit
                                    </Button>
                                    <Button 
                                        size="small" 
                                        severity="danger"
                                        @click="deleteDiscount(discount.id)"
                                        fluid
                                    >
                                        <Trash2 />Delete
                                    </Button>
                                </div>
                            </template>
                        </Card>
                    </div>

                    <div v-if="discountsList.length === 0" class="text-center py-8">
                        <p class="dark:text-surface-300 text-surface-500">No discounts configured yet.</p>
                    </div>
                </div>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </template>
        </Card>

        <!-- Discount Dialog -->
        <Dialog
            :header="editingDiscount ? 'Edit Discount' : 'Create New Discount'"
            v-model:visible="discountDialogVisible"
            modal
            class="md:w-140 w-92"
            @hide="closeDiscountDialog"
        >
            <Form
                v-slot="$form"
                :resolver="discountResolver"
                :initialValues="discountInitialValues"
                @submit="onDiscountSubmit"
            >
                <div class="flex flex-col gap-4">
                    <IftaLabel>
                        <InputNumber
                            id="discountPercentage"
                            name="discountPercentage"
                            fluid
                            :min="0"
                            :max="100"
                            suffix="%"
                        />
                        <label for="discountPercentage">Discount Percentage (%)</label>
                    </IftaLabel>
                    <Message
                        v-if="$form.discountPercentage?.invalid"
                        severity="error"
                        size="small"
                        >{{ $form.discountPercentage.error?.message }}</Message
                    >

                    <IftaLabel>
                        <Calendar
                            id="startDate"
                            name="startDate"
                            dateFormat="yy-mm-dd"
                            fluid
                        />
                        <label for="startDate">Start Date</label>
                    </IftaLabel>
                    <Message
                        v-if="$form.startDate?.invalid"
                        severity="error"
                        size="small"
                        >{{ $form.startDate.error?.message }}</Message
                    >

                    <IftaLabel>
                        <Calendar
                            id="endDate"
                            name="endDate"
                            dateFormat="yy-mm-dd"
                            fluid
                        />
                        <label for="endDate">End Date</label>
                    </IftaLabel>
                    <Message
                        v-if="$form.endDate?.invalid"
                        severity="error"
                        size="small"
                        >{{ $form.endDate.error?.message }}</Message
                    >

                    <IftaLabel>
                        <Textarea
                            id="description"
                            name="description"
                            rows="2"
                            fluid
                        />
                        <label for="description">Description</label>
                        <p class="text-xs dark:text-surface-300 text-surface-500 mt-2">
                            e.g., "Summer promotion" or "Holiday special offer"
                        </p>
                    </IftaLabel>
                    <Message
                        v-if="$form.description?.invalid"
                        severity="error"
                        size="small"
                        >{{ $form.description.error?.message }}</Message
                    >

                    <div class="flex gap-2 pt-2">
                        <Button 
                            type="button" 
                            severity="secondary" 
                            @click="closeDiscountDialog"
                            fluid
                        >
                            <X />
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            :disabled="discountSubmitLoading"
                            fluid
                        >
                            <Check />
                            {{ editingDiscount ? 'Update' : 'Create' }} Discount
                        </Button>
                    </div>
                </div>
            </Form>
        </Dialog>
    </div>
</template>
