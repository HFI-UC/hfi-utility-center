<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { ref } from "vue";
import ScrollPanel from "primevue/scrollpanel";

const userInput = ref("");
const messages = ref<{ text: string; type: string }[]>([]);
const isWaiting = ref(false);
const lastUserMessages = ref<string[]>([]);

const responses: Record<string, string[]> = {
    典: ["赢", "孝", "不用", "觉", "认"],
    孝: ["典", "支", "不错", "同", "对", "你好", "妈", "谢"],
    急: ["孝", "??", "？？", "不是", "病", "疯", "sb", "傻", "逼", "蚌", "妈"],
    乐: ["孝", "典", "急", "赢", "蚌", "麻", "妈", "是吧", "没完"],
    蚌: ["急", "赢", "妈", "停", "别"],
    赢: ["蚌"],
    麻: ["典"],
    确实: ["图灵", "离谱"],
};

const simulateNetworkRequest = (ms: number) => {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, Math.random() * 1000 + 500 + ms);
    });
};

const getBotResponse = (userMessage: string): string => {
    let keywords: string[] = [];

    for (const key in responses) {
        const values = responses[key];
        for (const value of values) {
            if (userMessage.includes(value)) {
                keywords.push(key);
                break;
            }
        }
    }

    if (!keywords.length) {
        keywords = ["乐", "蚌", "典"];
    }

    if (lastUserMessages.value.length) {
        const lastUserMessage =
            lastUserMessages.value[lastUserMessages.value.length - 1];
        const lastUserMessageIndex = keywords.indexOf(lastUserMessage);
        if (lastUserMessageIndex !== -1) {
            keywords.splice(lastUserMessageIndex, 1);
        }
    }

    if (keywords.length > 1 && lastUserMessages.value.length > 1) {
        const lastUserMessage =
            lastUserMessages.value[lastUserMessages.value.length - 2];
        const lastUserMessageIndex = keywords.indexOf(lastUserMessage);
        if (lastUserMessageIndex !== -1) {
            keywords.splice(lastUserMessageIndex, 1);
        }
    }

    if (!keywords.length) {
        keywords = ["乐", "蚌", "典"];
    }

    return keywords[Math.floor(Math.random() * keywords.length)];
};

const handleSubmit = async () => {
    if (isWaiting.value) return;

    const userInputTrimmed = userInput.value.trim();
    if (userInputTrimmed === "") return;

    messages.value.push({
        text: userInputTrimmed,
        type: "user",
    });

    userInput.value = "";
    isWaiting.value = true;

    await simulateNetworkRequest(userInputTrimmed.length * 20);

    const botMessage = getBotResponse(userInputTrimmed);
    lastUserMessages.value.push(botMessage);

    messages.value.push({ text: botMessage, type: "bot" });

    isWaiting.value = false;
};
</script>

<template>
    <div class="relative min-h-[95vh] w-full flex items-center justify-center">
        <div class="w-full flex flex-col justify-center items-center">
            <div class="m-0 py-2 text-lg font-semibold">NoobGPT</div>
            <span class="text-gray-500"
                >原作者：<a href="https://github.com/itorr/noobgpt"
                    >itorr</a
                ></span
            >
            <ScrollPanel class="sm:w-[58vh] w-full h-[70vh]">
                <div class="chat-container">
                    <div
                        class="messages-list layout flex flex-col justify-center"
                    >
                        <div
                            v-for="(message, index) in messages"
                            :key="index"
                            :class="`${
                                message.type == 'user'
                                    ? 'text-right self-end m-1.5 p-2.5 px-5 rounded-[99px]'
                                    : 'text-left'
                            } mt-12 ${message.type}`"
                        >
                            {{ message.text }}
                        </div>
                        <div class="text-gray-500 mt-12" v-if="isWaiting">
                            Waiting...
                        </div>
                    </div>
                </div>
            </ScrollPanel>
            <div class="input-box flex justify-center">
                <div class="input-area flex items-center">
                    <form autocomplete="off" @submit.prevent="handleSubmit()" class="flex items-center">
                        <InputText
                            v-model="userInput"
                            placeholder="给“NoobGPT”发送消息"
                            :style="{
                                borderRadius: '99px',
                                padding: '15px',
                                border: 'none',
                                boxShadow: 'none',
                            }"
                        ></InputText>
                        <Button
                            class="m-[10px]"
                            id="button"
                            label="发送"
                            @click="handleSubmit()"
                            rounded
                            severity="contrast"
                            style="width: 4rem; height: 2.5rem"
                            :disabled="userInput == '' || isWaiting"
                        ></Button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.input-area {
    position: relative;
    bottom: 0;
}

.user {
    background: #f4f4f4;
}

html.p-dark .user {
    background: #2f2f2f;
}

:deep(.p-inputtext) {
    background-color: #f4f4f4;
    width: 62vh;
}

html.p-dark input {
    background-color: #2f2f2f !important;
}

.input-box {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
}

#button {
    position: absolute;
    right: 0;
    z-index: 0;
}

a {
    color: var(--p-primary-500);
    text-decoration: none;
    transition:
        0.4s color,
        0.2s background-color ease;
}

a:hover {
    color: var(--p-highlight-text-color);
    background-color: var(--p-highlight-bg);
}

@media screen and (max-width: 720px) {
    :deep(.p-inputtext) {
        width: 40vh;
    }
}
</style>
