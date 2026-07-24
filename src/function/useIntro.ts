import { ref } from 'vue'

export function useIntro(onComplete: () => void) {
  const step = ref(0)
  const progress = ref(0)
  const transitioning = ref(false)
  const showTransitionText = ref(false)
  let progressTimer: number | null = null

  function startProgress() {
    progress.value = 0
    const duration = 2700
    const startTime = Date.now()
    
    // Pause points: 3 in first half (random), 1 in second half
    const pausePoints = [
      15 + Math.random() * 10,   // 15-25%
      30 + Math.random() * 10,   // 30-40%
      45 + Math.random() * 5,    // 45-50%
      75 + Math.random() * 10    // 75-85%
    ].sort((a, b) => a - b)
    
    let currentPauseIndex = 0
    let pausedUntil = 0
    
    progressTimer = window.setInterval(() => {
      const now = Date.now()
      
      // Check if paused
      if (pausedUntil > now) {
        return
      }
      
      // Check for next pause
      const nextPause = pausePoints[currentPauseIndex]
      if (nextPause !== undefined && progress.value >= nextPause && progress.value < nextPause + 1) {
        pausedUntil = now + 200 + Math.random() * 200 // 200-400ms pause
        currentPauseIndex++
        return
      }
      
      const elapsed = now - startTime
      progress.value = Math.min((elapsed / duration) * 100, 100)
      
      if (progress.value >= 100) {
        if (progressTimer) {
          clearInterval(progressTimer)
          progressTimer = null
        }
      }
    }, 16)
  }

  function enterRegister() {
    if (transitioning.value || step.value < 4) return
    
    transitioning.value = true
    
    // Step 1: Shrink the intro screen, hide circles, show REGISTER ACCESS
    const introScreen = document.querySelector('.intro-screen') as HTMLElement
    const registerPage = document.querySelector('.register-page') as HTMLElement
    const rings = document.querySelectorAll('.ring-outline, .ring-progress') as NodeListOf<HTMLElement>
    
    if (introScreen) {
      introScreen.style.transform = 'scale(0.80)'
    }
    
    if (registerPage) {
      registerPage.style.background = '#fff'
    }
    
    // Hide all rings
    rings.forEach(ring => {
      ring.style.opacity = '0'
    })
    
    // Show transition text
    showTransitionText.value = true
    
    // Step 2: After shrink + 1s pause, start wipe animation (beam + mask)
    setTimeout(() => {
      const wipeLine = document.querySelector('.wipe-line') as HTMLElement
      const wipeMask = document.querySelector('.wipe-mask') as HTMLElement
      if (wipeLine) {
        wipeLine.classList.add('active')
      }
      if (wipeMask) {
        wipeMask.classList.add('active')
      }
    }, 1600)  // 600ms shrink + 1000ms pause
    
    // Step 3: After wipe, navigate to register form
    setTimeout(() => {
      // Reset intro screen for potential future use
      if (introScreen) {
        introScreen.style.transform = ''
      }
      
      // Reset page background
      if (registerPage) {
        registerPage.style.background = ''
      }
      
      // Reset rings
      rings.forEach(ring => {
        ring.style.opacity = ''
      })
      
      // Reset wipe line and mask
      const wipeLine = document.querySelector('.wipe-line') as HTMLElement
      const wipeMask = document.querySelector('.wipe-mask') as HTMLElement
      if (wipeLine) {
        wipeLine.classList.remove('active')
      }
      if (wipeMask) {
        wipeMask.classList.remove('active')
      }
      
      // Hide transition text
      showTransitionText.value = false
      transitioning.value = false
      
      // Navigate to register form
      onComplete()
    }, 2400)  // 1600ms + 800ms wipe
  }

  function cleanup() {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }

  return {
    step,
    progress,
    transitioning,
    showTransitionText,
    startProgress,
    enterRegister,
    cleanup
  }
}
