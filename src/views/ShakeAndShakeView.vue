<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";

const lastShakeTime = ref(0);
const threshold = 15; // 加速度阈值
const shakeCooldown = 1500; // 冷却时间（毫秒）

const handleMotion = (event: any) => {
    const acc = event.accelerationIncludingGravity;
    const x = acc?.x || 0;
    const y = acc?.y || 0;
    const z = acc?.z || 0;

    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    if (magnitude > threshold && now - lastShakeTime.value > shakeCooldown) {
        lastShakeTime.value = now;
        console.log("检测到摇一摇");
        onShake();
    }
};

const onShake = () => {
    // 可加入震动或提示反馈
    // navigator.vibrate?.(200);
    window.location.href = "https://www.taobao.com";
};

onMounted(() => {
    if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", handleMotion, false);
    } else {
        console.warn("设备不支持陀螺仪");
    }
});

onBeforeUnmount(() => {
    window.removeEventListener("devicemotion", handleMotion);
});
</script>

<template>
    <div>
        <p>摇一摇试试看！</p>
    </div>
</template>

