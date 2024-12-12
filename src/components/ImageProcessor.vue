<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { nextTick, onMounted, ref, type Ref } from 'vue';


const originalCanvas: Ref<HTMLCanvasElement | null> = ref(null);
const processedCanvas: Ref<HTMLCanvasElement | null> = ref(null);
const originalImage = ref<boolean>(false);
const processedImage = ref<boolean | null>(null);
const withCanvas = ref()
const heightCanvas = ref()
const startTime = ref()
const endTime = ref()

const image = ref<HTMLImageElement | null>(null)

const ctx = ref<any>(null);
let zoom = 1;
// const minZoom = 0.5;
// const maxZoom = 5;
const width = 800;
const height = 600;

const worker = ref();
const handleImageUpload = (event: any) => {
  const file = event.target.files[0];
  if (!file) return;

  image.value = new Image();
  image.value.src = URL.createObjectURL(file);

  image.value.onload = async () => {
    await nextTick();
    startTime.value = performance.now()
    const canvas = originalCanvas.value;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    if (!image.value) {
      return
    }
    canvas.width = image.value.width;
    canvas.height = image.value.height;
    withCanvas.value = image.value.width
    heightCanvas.value = image.value.height
    const imageData = ctx.getImageData(0, 0, image.value.width, image.value.height);
    worker.value.postMessage(imageData);
    originalImage.value = true;
    draw()
  };
};



onMounted(() => {
  worker.value = new Worker(new URL("../workers/imageWorker.ts", import.meta.url))
  worker.value.onmessage = (event: any) => {

    const processedData = event.data;
    const canvas = processedCanvas.value;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return;
    }

    canvas.width = withCanvas.value;
    canvas.height = heightCanvas.value;

    ctx.putImageData(processedData, 0, 0);
    endTime.value = performance.now()
    processedImage.value = true

  }
})

const draw = () => {
  if (ctx.value && image.value) {
    ctx.value.clearRect(0, 0, width, height);
    ctx.value.save();
    ctx.value.scale(zoom, zoom);
    const offsetX = (width - image.value.width * zoom) / 2 / zoom;
    const offsetY = (height - image.value.height * zoom) / 2 / zoom;
    ctx.value.drawImage(image.value, offsetX, offsetY, image.value.width, image.value.height);
    ctx.value.restore()
  }
}

const handleWheel = (event: any): any => {
  event.preventDefault();
  const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
  const newZoom = zoom * scaleFactor
  // if (newZoom < minZoom || newZoom > maxZoom) return;
  if (!originalCanvas.value) {
    return
  }
  const rect = originalCanvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  ctx.value.translate(mouseX, mouseY);
  ctx.value.scale(scaleFactor, scaleFactor);
  ctx.value.translate(-mouseX, -mouseY)
  zoom = newZoom;

  const imageData = ctx.value.getImageData(0, 0, width, height);
  ctx.value.clearRect(0, 0, width, height);
  ctx.value.putImageData(imageData, 0, 0);
  console.log(zoom);

  // draw()

}

onMounted(() => {
  const originalCanvasElement = originalCanvas.value;
  ctx.value = originalCanvasElement?.getContext('2d')
  // Initial drawing
  // draw();
  originalCanvasElement?.addEventListener("wheel", handleWheel)
})
</script>
<template>
  <div>
    <h1>Image Grayscale Processor</h1>
    <h3>Result: {{ endTime - startTime }}</h3>
    <input type="file" @change="handleImageUpload" accept="image/*" />
    <div v-show="originalImage">
      <h2>Original Image</h2>
      <div class="wrapper">
        <canvas ref="originalCanvas"></canvas>

      </div>
    </div>
    <div v-show="processedImage">
      <h2>Processed Image</h2>
      <div class="wrapper">
        <canvas ref="processedCanvas"></canvas>

      </div>
    </div>
  </div>
</template>

<style>
.wrapper {
  width: 500px;
  cursor: pointer;
}

canvas {
  width: 100%;
  height: auto;
  border: 1px solid #000;
}
</style>
