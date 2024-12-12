<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { ref, onMounted, type Ref } from 'vue'
import imgTest from "@/assets/img1.jpg"

const canvas: Ref<HTMLCanvasElement | null> = ref(null);
const ctx: Ref<CanvasRenderingContext2D | null> = ref(null);
const scale = ref(1);
const mouseX = ref(0);
const mouseY = ref(0);
const img = new Image();
img.src = imgTest

onMounted(() => {
  const canvasEl = canvas.value;
  if (!canvasEl) {
    return

  }
  ctx.value = canvasEl.getContext('2d');
  canvasEl.width = 800;
  canvasEl.height = 600

  img.onload = () => {
    drawImage();
  }

})

const drawImage = () => {
  const canvasEl = canvas.value;
  ctx.value?.setTransform(scale.value, 0, 0, scale.value, 0, 0);
  // ctx.value?.clearRect(0, 0, canvasEl?.width as number, canvasEl?.height as number);
  ctx.value?.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvasEl?.width as number, canvasEl?.height as number);
}
const updateMousePosition = (event: any) => {
  const rect = canvas.value?.getBoundingClientRect();
  if (!rect) {
    return
  }
  mouseX.value = event.clientX - rect.left;
  mouseY.value = event.clientY - rect.top
}

const handleZoom = (event: any) => {
  event.preventDefault()
  const zooFactor = 0.1;
  const direction = event.deltaY > 0 ? -1 : 1;
  const newScale = scale.value + direction * zooFactor;
  if (newScale < 0.5 || newScale > 5) {
    return;
  }
  const canvasEl = canvas.value;
  const rect = canvasEl?.getBoundingClientRect();
  if (!rect) return;
  const x = (mouseX.value - rect?.left) / scale.value;
  const y = (mouseY.value - rect?.top) / scale.value;
  scale.value = newScale;
  ctx.value?.setTransform(scale.value, 0, 0, scale.value, x * (1 - scale.value), y * (1 - scale.value))
  drawImage()
}

</script>

<template>
  <div class="canvas=-container">
    <canvas ref="canvas" @wheel="handleZoom" @mousemove="updateMousePosition"></canvas>
  </div>

  <!-- <img :src="img.src" alt=""> -->
</template>

<style>
.canvas-container {
  position: relative;
  width: 800px;
  height: 600px;
  overflow: hidden;
  border: 1px solid #ccc;
}

canvas {
  display: block;
}
</style>
