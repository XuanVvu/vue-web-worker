const fibonacci = (n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

self.onmessage = (e) => {
  const { number, workerId } = e.data
  let end = 0
  const result = fibonacci(number)
  end = performance.now()
  self.postMessage({ result, endTime: end, workerId })
}
