<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const syncLoadings = ref<boolean[]>([])
const fibSync = ref<number[]>([])
const timeSync = ref<number[]>([])

const aSyncLoadings = ref<boolean[]>([])
const workerCount = ref(navigator.hardwareConcurrency || 4);
const workers = ref<any>([]);
const asyncResults = ref<any>([]);
const asyncTimes = ref<number[]>([]);

const NUMBER = 40
let currentWorkerIndex: number = 0;

const calculateSync = async () => {
  const start = performance.now()
  syncLoadings.value = [...syncLoadings.value, true]
  setTimeout(() => {
    const result = fibonacci(NUMBER);
    fibSync.value = [...fibSync.value, result]
    syncLoadings.value.shift();
    const end = performance.now()
    timeSync.value = [...timeSync.value, end - start]

  })
}
const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  const result = fibonacci(n - 1) + fibonacci(n - 2)
  return result
}

const createWorker = (): any => {
  for (let i = 0; i < workerCount.value; i++) {
    const worker = new Worker(new URL('./worker.ts', import.meta.url));
    worker.onmessage = handleWorkerMessage;
    workers.value.push(worker);
  }
}

const handleWorkerMessage = (event: any) => {
  const { result, time, workerId } = event.data;
  asyncResults.value.push(`Worker ${workerId}: ${result}`);
  asyncTimes.value.push(time);
  aSyncLoadings.value.shift();
}

const terminateWorkers = () => {
  workers.value.forEach((worker: any) => worker.terminate());
  workers.value = [];
};

const calculateAsync = () => {
  if (!workers.value.length) return;
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
      <p v-for="(loading, index) in syncLoadings" :key="index + `${loading}`">
        Calculating synchronously {{ index }} ...
      </p>
      <div v-if="fibSync.length > 0">
        <p v-for="(item, index) in fibSync" :key="index">
          Result: {{ item }} - Time: {{ timeSync[index].toFixed(2) }} ms
        </p>

      </div>

    </div>

    <div>
      <button @click="calculateAsync">Calculate Fibonacci Async</button>
      <p v-for="(loading, index) in aSyncLoadings" :key="index">
        Calculating asynchronously ...
      </p>
      <p v-for="(result, index) in asyncResults" :key="index">
        {{ result }} Time: {{ asyncTimes[index].toFixed(2) }}ms
      </p>

    </div>

  </div>
</template>
