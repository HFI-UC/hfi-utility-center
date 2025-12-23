import { ref } from "vue";

const loginEvent = ref(0);
export const triggerLoginUpdate = () => {
    loginEvent.value++;
};

export const useLoginEvent = () => {
    return loginEvent;
};

const isLoading = ref(false);

export const useIsLoading = () => {
    return isLoading;
};
