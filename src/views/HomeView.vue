<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import ImageProcessor from "@/components/ImageProcessor.vue"

const syncLoadings = ref<boolean[]>([])
const fibSync = ref<number[]>([])
const startTimeSync = ref<number>(0)
const endTimeSync = ref<number>(0)

const aSyncLoadings = ref<boolean[]>([])
const workerCount = ref(navigator.hardwareConcurrency || 4);
const workers = ref<any>([]);
const asyncResults = ref<any>([]);
// const asyncTimes = ref<number[]>([]);
const startTimeAsync = ref<number>(0)
const endTimeAsync = ref<number>(0)


const NUMBER = 40
let currentWorkerIndex: number = 0;

const calculateSync = async () => {
  if (!startTimeSync.value) {
    startTimeSync.value = performance.now()

  }
  syncLoadings.value = [...syncLoadings.value, true]
  setTimeout(() => {
    const result = fibonacci(NUMBER);
    fibSync.value = [...fibSync.value, result]
    syncLoadings.value.shift();
    endTimeSync.value = performance.now()

  })
}
const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  const result = fibonacci(n - 1) + fibonacci(n - 2)
  return result
}

const createWorker = (): any => {
  for (let i = 0; i < workerCount.value; i++) {
    const worker = new Worker(new URL('../workers/worker.ts', import.meta.url));
    worker.onmessage = handleWorkerMessage;
    workers.value.push(worker);
  }
}

const handleWorkerMessage = (event: any) => {
  const { result, endTime, workerId } = event.data;
  asyncResults.value.push(`Worker ${workerId}: ${result}`);
  endTimeAsync.value = endTime;
  aSyncLoadings.value.shift();
}

const terminateWorkers = () => {
  workers.value.forEach((worker: any) => worker.terminate());
  workers.value = [];
};

const calculateAsync = () => {
  if (!workers.value.length) return;
  if (!startTimeAsync.value) {
    startTimeAsync.value = performance.now()
  }
  console.log(startTimeAsync.value);

  aSyncLoadings.value = [...aSyncLoadings.value, true]
  const worker = workers.value[currentWorkerIndex];
  worker.postMessage({ number: NUMBER, workerId: currentWorkerIndex });
  currentWorkerIndex = (currentWorkerIndex + 1) % workerCount.value;
}



onMounted(createWorker);
onBeforeUnmount(terminateWorkers);
</script>

<template>

  <div style="display: flex; padding-top: 25px ; gap: 100px;">
    <div>
      <button @click="calculateSync">Calculate Fibonacci Sync</button>
      <h3>Time: {{ ((endTimeSync as number) - (startTimeSync as number)).toFixed(2) }} ms</h3>
      <p v-for="(loading, index) in syncLoadings" :key="index + `${loading}`">
        Calculating synchronously {{ index }} ...
      </p>
      <div v-if="fibSync.length > 0">
        <p v-for="(item, index) in fibSync" :key="index">
          Result: {{ item }}
        </p>

      </div>

    </div>

    <div>
      <button @click="calculateAsync">Calculate Fibonacci Async</button>
      <h3>Time: {{ ((endTimeAsync as number) - (startTimeAsync as number)).toFixed(2) }} ms</h3>

      <!-- <h3>Time: {{ (asyncTimes[asyncTimes.length - 1]).toFixed(2) }} ms</h3> -->
      <p v-for="(loading, index) in aSyncLoadings" :key="index">
        Calculating asynchronously ...
      </p>
      <p v-for="(result, index) in asyncResults" :key="index">
        {{ result }}
      </p>

    </div>

  </div>
  <ImageProcessor />
</template>
