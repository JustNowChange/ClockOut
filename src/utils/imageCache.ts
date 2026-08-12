/**
 * 图片浏览器缓存工具
 * 使用 Cache API 将图片缓存在浏览器中，下次加载直接从缓存读取
 */

const CACHE_NAME = 'clockout-images-v1'

/** 判断 Cache API 是否可用 */
function isCacheSupported(): boolean {
  return 'caches' in window
}

/**
 * 获取缓存的图片 URL（如果已缓存则返回 blob URL，否则返回原 URL 并后台缓存）
 * @param url 原始图片 URL
 * @returns 缓存的 blob URL 或原 URL
 */
export async function getCachedImage(url: string): Promise<string> {
  if (!isCacheSupported()) return url

  try {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(url)

    if (cached) {
      const blob = await cached.blob()
      return URL.createObjectURL(blob)
    }

    // 未缓存：后台 fetch 并缓存
    fetchAndCache(url)

    return url
  } catch {
    return url
  }
}

/**
 * 预加载并缓存图片（不等结果，后台执行）
 */
export function fetchAndCache(url: string): void {
  if (!isCacheSupported()) return

  caches.open(CACHE_NAME).then(cache => {
    fetch(url)
      .then(res => {
        if (res.ok) {
          cache.put(url, res.clone())
        }
      })
      .catch(() => {})
  })
}

/**
 * 批量预加载图片
 * @param urls 图片 URL 数组
 */
export function preloadImages(urls: string[]): void {
  urls.forEach(url => fetchAndCache(url))
}

/**
 * 清除图片缓存
 */
export async function clearImageCache(): Promise<void> {
  if (!isCacheSupported()) return
  await caches.delete(CACHE_NAME)
}
