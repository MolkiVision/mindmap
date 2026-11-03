/** Downscale an image file to at most `max` px on the longer side and return a data URL. */
export function shrinkImage(file: File, max = 640): Promise<{ dataUrl: string; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.drawImage(img, 0, 0, w, h)
      const keepPng = file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/svg+xml'
      const dataUrl = keepPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.86)
      resolve({ dataUrl, w, h })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image'))
    }
    img.src = url
  })
}
