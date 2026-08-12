import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// ======================================================
// 【必须在 createApp/mount 之前同步执行】主题初始化
// 原因：CuteContextMenu 的 loadSavedBg 在组件 onMounted 才跑，
//       此时页面 DOM 已经用默认主题（白/黑字）渲染过了，
//       硬刷新 Resume 等页面时会出现短暂的黑字黑底（看不见）。
// ======================================================
(function initTheme() {
  try {
    const BG_COLOR_KEY = 'clockout-bg-color'
    const BG_KEY_KEY = 'clockout-bg-key'

    const savedColor = localStorage.getItem(BG_COLOR_KEY)
    const savedKey = localStorage.getItem(BG_KEY_KEY) as 'pink' | 'white' | 'black' | null

    const themes: Record<string, { value: string }> = {
      pink:  { value: '#fff0f5' },
      white: { value: '#ffffff' },
      black: { value: '#1a1a2e' },
    }

    let key: 'pink' | 'white' | 'black' = savedKey ?? 'white'
    let color = savedColor ?? themes[key].value

    // 如果 key 非法，回退
    if (!themes[key]) { key = 'white'; color = '#ffffff' }

    // 设置 data-theme：给 style.css 里的 html[data-theme="xxx"] CSS 变量块匹配用
    document.documentElement.dataset.theme = key

    // 同步设置 --page-bg 和 body/#app 背景色（与 CuteContextMenu.applyTheme 行为保持一致）
    document.documentElement.style.setProperty('--page-bg', color)
    document.documentElement.style.background = color
    document.body.style.background = color
  } catch (e) {
    // localStorage 不可用时默认为白
    document.documentElement.dataset.theme = 'white'
  }
})()

createApp(App).use(router).mount('#app')