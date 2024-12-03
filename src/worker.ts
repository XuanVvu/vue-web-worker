const fibonacci = (n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

self.onmessage = (e) => {
  console.log(e)

  const { number, workerId } = e.data
  const start = performance.now()
  const result = fibonacci(number)
  const end = performance.now()
  self.postMessage({ result, time: end - start, workerId })
}
