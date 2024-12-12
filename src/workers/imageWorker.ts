self.onmessage = (event) => {
  const imageData = event.data
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const gray = 0.299 * r + 0.587 * g + 0.144 * b
    data[i] = data[i + 1] = data[i + 2] = gray
  }

  self.postMessage(imageData)
}
