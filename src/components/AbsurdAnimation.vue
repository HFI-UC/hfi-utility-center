<template>
    <div
        class="container flex flex-col justify-center items-center p-[2rem]"
        ref="containerRef"
    >
        <div v-if="!isPlaying" id="warning" class="text-center text-white mb-4 text-lg">
            <span class="font-bold">警告：</span
            >此动画包含闪烁效果，可能会对光敏性癫痫患者造成不适，请谨慎观看。
        </div>
        <Button v-if="!isPlaying" @click="playAnimation">播放动画</Button>
        <p v-if="isPlaying" class="text-white text-center text-xl">
            <a href="https://pan.hfiuc.org">云上石牌™</a> | 保留所有权利。
        </p>
        <canvas ref="canvasRef"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount } from "vue";
import { Button } from "primevue";

interface Lightning {
    active: boolean;
    time: number;
}

interface Raindrop {
    x: number;
    y: number;
    speed: number;
    length: number;
    fall(ctx: CanvasRenderingContext2D): void;
}

interface Cloud {
    x: number;
    y: number;
    size: number;
    speed: number;
    direction: number;
    draw(ctx: CanvasRenderingContext2D): void;
    update(ctx: CanvasRenderingContext2D, canvasWidth: number): void;
}

const isPlaying = ref<boolean>(false);
const canvasWidth = ref<number>(0);
const canvasHeight = ref<number>(0);
const raindrops = ref<Raindrop[]>([]);
const clouds = ref<Cloud[]>([]);
const lightning = ref<Lightning>({ active: false, time: 0 });
const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const playAnimation = () => {
    isPlaying.value = true;
    nextTick(() => {
        updateCanvas();
    });
};

const updateCanvas = () => {
    if (!isPlaying.value || !canvasRef.value) return;

    const ctx = canvasRef.value.getContext("2d");
    if (ctx) {
        ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

        randomLightning();
        drawLightning(ctx);

        clouds.value.forEach((cloud) => cloud.update(ctx, canvasWidth.value));
        raindrops.value.forEach((raindrop) => raindrop.fall(ctx));

        if (lightning.value.active) {
            lightning.value.time--;
            if (lightning.value.time <= 0) {
                lightning.value.active = false;
            }
        }

        requestAnimationFrame(updateCanvas);
    }
};

const randomLightning = () => {
    if (!lightning.value.active && Math.random() < 0.02) {
        lightning.value.active = true;
        lightning.value.time = 10;
    }
};

const drawLightning = (ctx: CanvasRenderingContext2D) => {
    if (lightning.value.active) {
        const alpha = 1 - lightning.value.time / 10;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);
        ctx.globalAlpha = 1;
    }
};

onMounted(() => {
    nextTick(() => {
        updateCanvasSize();
        for (let i = 0; i < 5; i++) {
            const size = Math.random() * 30 + 50;
            const x = Math.random() * canvasWidth.value;
            const y = Math.random() * 50 + 50;
            const speed = Math.random() * 0.5 + 0.2;
            clouds.value.push(new Cloud(x, y, size, speed));
        }
        for (let i = 0; i < 100; i++) {
            raindrops.value.push(new Raindrop(canvasWidth.value));
        }
    });

    window.addEventListener("resize", updateCanvasSize);
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", updateCanvasSize);
});

const updateCanvasSize = () => {
    if (containerRef.value && canvasRef.value) {
        canvasWidth.value = containerRef.value.offsetWidth;
        canvasHeight.value = containerRef.value.offsetHeight;
        canvasRef.value.width = canvasWidth.value;
        canvasRef.value.height = canvasHeight.value;
    }
};

class Cloud implements Cloud {
    x: number;
    y: number;
    size: number;
    speed: number;
    direction: number;

    constructor(x: number, y: number, size: number, speed: number) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.direction = 1;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.6, Math.PI * 0.5, Math.PI * 1.5);
        ctx.arc(
            this.x + this.size * 0.5,
            this.y - this.size * 0.6,
            this.size * 0.6,
            Math.PI * 1,
            Math.PI * 1.85,
        );
        ctx.arc(
            this.x + this.size,
            this.y - this.size * 0.6,
            this.size * 0.4,
            Math.PI * 1.15,
            Math.PI * 1.85,
        );
        ctx.arc(
            this.x + this.size * 1.5,
            this.y,
            this.size * 0.6,
            Math.PI * 1.5,
            Math.PI * 0.5,
        );
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();
    }

    update(ctx: CanvasRenderingContext2D, canvasWidth: number) {
        this.x += this.speed * this.direction;
        if (this.x + this.size * 1.5 > canvasWidth || this.x - this.size < 0) {
            this.direction *= -1;
        }
        this.draw(ctx);
    }
}

class Raindrop implements Raindrop {
    x: number;
    y: number;
    speed: number;
    length: number;

    constructor(canvasWidth: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * -100;
        this.speed = Math.random() * 2 + 2;
        this.length = Math.random() * 20 + 10;
    }

    fall(ctx: CanvasRenderingContext2D) {
        this.y += this.speed;
        if (this.y > canvasHeight.value) {
            this.y = Math.random() * -100;
            this.x = Math.random() * canvasWidth.value;
        }
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.strokeStyle = "rgba(174, 194, 224, 0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
</script>

<style scoped>
.container {
    width: 100%;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
}

canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    background-color: black;
    border-radius: 0.75rem;
}

button {
    border-radius: 0.5rem;
}

p {
    z-index: 1;
}

#warning {
    font-size: 18px;
    color: white;
    margin-bottom: 20px;
}

a {
    color: var(--p-primary-300);
    text-decoration: none;
    transition:
        0.4s color,
        0.2s background-color ease;
}

a:hover {
    color: var(--p-highlight-text-color);
    background-color: var(--p-highlight-bg);
}
</style>
