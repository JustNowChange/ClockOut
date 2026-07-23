import { onMounted, onUnmounted, ref } from 'vue'

export function useCharacters(options: {
  isError?: boolean
  isPasswordFocused?: boolean
  showPassword?: boolean
  passwordLength?: number
} = {}) {
  const mouseX = ref(0)
  const mouseY = ref(0)
  const isPurpleBlinking = ref(false)
  const isBlackBlinking = ref(false)
  const isPurplePeeking = ref(false)
  
  const isError = ref(options.isError || false)
  const isPasswordFocused = ref(options.isPasswordFocused || false)
  const showPassword = ref(options.showPassword || false)
  const passwordLength = ref(options.passwordLength || 0)
  
  let blinkPurpleTimer: ReturnType<typeof setTimeout> | null = null
  let blinkBlackTimer: ReturnType<typeof setTimeout> | null = null
  let peekTimer: ReturnType<typeof setTimeout> | null = null
  let errorRecoverTimer: ReturnType<typeof setTimeout> | null = null
  let typingTimer: ReturnType<typeof setTimeout> | null = null
  
  const isTyping = ref(false)
  const isLookingAtEachOther = ref(false)

  function handleMouseMove(e: MouseEvent) {
    mouseX.value = e.clientX
    mouseY.value = e.clientY
    if (!isTyping.value && !isError.value) updateCharacters()
  }

  function calcPosition(el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 3
    const dx = mouseX.value - cx
    const dy = mouseY.value - cy
    const faceX = Math.max(-15, Math.min(15, dx / 20))
    const faceY = Math.max(-10, Math.min(10, dy / 30))
    const bodySkew = Math.max(-6, Math.min(6, -dx / 120))
    return { faceX, faceY, bodySkew }
  }

  function calcPupilOffset(el: HTMLElement, maxDist: number) {
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = mouseX.value - cx
    const dy = mouseY.value - cy
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
    const angle = Math.atan2(dy, dx)
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
  }

  function scheduleBlinkPurple() {
    blinkPurpleTimer = setTimeout(() => {
      isPurpleBlinking.value = true
      updateCharacters()
      setTimeout(() => {
        isPurpleBlinking.value = false
        updateCharacters()
        scheduleBlinkPurple()
      }, 150)
    }, Math.random() * 4000 + 3000)
  }

  function scheduleBlinkBlack() {
    blinkBlackTimer = setTimeout(() => {
      isBlackBlinking.value = true
      updateCharacters()
      setTimeout(() => {
        isBlackBlinking.value = false
        updateCharacters()
        scheduleBlinkBlack()
      }, 150)
    }, Math.random() * 4000 + 3000)
  }

  function schedulePeek() {
    if (peekTimer) clearTimeout(peekTimer)
    
    if (passwordLength.value > 0 && showPassword.value) {
      peekTimer = setTimeout(() => {
        if (passwordLength.value > 0 && showPassword.value) {
          isPurplePeeking.value = true
          updateCharacters()
          setTimeout(() => {
            isPurplePeeking.value = false
            updateCharacters()
            schedulePeek()
          }, 800)
        }
      }, Math.random() * 3000 + 2000)
    }
  }

  function setTyping(typing: boolean) {
    isTyping.value = typing
    if (typing) {
      isLookingAtEachOther.value = true
      if (typingTimer) clearTimeout(typingTimer)
      typingTimer = setTimeout(() => {
        isLookingAtEachOther.value = false
        updateCharacters()
      }, 800)
    } else {
      isLookingAtEachOther.value = false
    }
    updateCharacters()
  }

  function triggerError() {
    if (errorRecoverTimer) clearTimeout(errorRecoverTimer)
    
    const shakeIds = [
      "purple-eyes",
      "black-eyes",
      "orange-eyes",
      "yellow-eyes",
      "yellow-mouth",
      "orange-mouth",
    ]
    
    const shakeEls = shakeIds.map((id) => document.getElementById(id))
    shakeEls.forEach((el) => {
      if (el) el.classList.remove("shake-head")
    })
    
    void document.body.offsetHeight
    
    isError.value = true
    isPasswordFocused.value = false
    updateCharacters()
    
    const orangeMouth = document.getElementById("orange-mouth")
    if (orangeMouth) orangeMouth.classList.add("visible")
    
    setTimeout(() => {
      shakeEls.forEach((el) => {
        if (el) el.classList.add("shake-head")
      })
    }, 350)
    
    errorRecoverTimer = setTimeout(() => {
      isError.value = false
      errorRecoverTimer = null
      if (orangeMouth) orangeMouth.classList.remove("visible")
      shakeEls.forEach((el) => {
        if (el) el.classList.remove("shake-head")
      })
      updateCharacters()
    }, 2500)
  }

  function updateCharacters() {
    const purple = document.getElementById('char-purple') as HTMLElement
    const black = document.getElementById('char-black') as HTMLElement
    const orange = document.getElementById('char-orange') as HTMLElement
    const yellow = document.getElementById('char-yellow') as HTMLElement

    if (!purple || !black || !orange || !yellow) return

    const purplePos = calcPosition(purple)
    const blackPos = calcPosition(black)
    const orangePos = calcPosition(orange)
    const yellowPos = calcPosition(yellow)

    const isShowingPwd = passwordLength.value > 0 && showPassword.value
    const isLookingAway = isPasswordFocused.value && !showPassword.value

    // ---- Purple body ----
    if (isShowingPwd) {
      purple.style.transform = "skewX(0deg)"
      purple.style.height = "370px"
    } else if (isLookingAway) {
      purple.style.transform = "skewX(-14deg) translateX(-20px)"
      purple.style.height = "410px"
    } else if (isTyping.value) {
      purple.style.transform = `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
      purple.style.height = "410px"
    } else {
      purple.style.transform = `skewX(${purplePos.bodySkew}deg)`
      purple.style.height = "370px"
    }

    // Purple eyes
    const purpleEyes = document.getElementById('purple-eyes') as HTMLElement
    const purpleEyeL = document.getElementById('purple-eye-l') as HTMLElement
    const purpleEyeR = document.getElementById('purple-eye-r') as HTMLElement
    const purplePupilL = document.getElementById('purple-pupil-l') as HTMLElement
    const purplePupilR = document.getElementById('purple-pupil-r') as HTMLElement

    purpleEyeL.style.height = isPurpleBlinking.value ? "2px" : "18px"
    purpleEyeR.style.height = isPurpleBlinking.value ? "2px" : "18px"

    if (isError.value) {
      purpleEyes.style.left = "30px"
      purpleEyes.style.top = "55px"
      purplePupilL.style.transform = "translate(-3px, 4px)"
      purplePupilR.style.transform = "translate(-3px, 4px)"
    } else if (isLookingAway) {
      purpleEyes.style.left = "20px"
      purpleEyes.style.top = "25px"
      purplePupilL.style.transform = "translate(-5px, -5px)"
      purplePupilR.style.transform = "translate(-5px, -5px)"
    } else if (isShowingPwd) {
      purpleEyes.style.left = "20px"
      purpleEyes.style.top = "35px"
      const px = isPurplePeeking.value ? 4 : -4
      const py = isPurplePeeking.value ? 5 : -4
      purplePupilL.style.transform = `translate(${px}px, ${py}px)`
      purplePupilR.style.transform = `translate(${px}px, ${py}px)`
    } else if (isLookingAtEachOther.value) {
      purpleEyes.style.left = "55px"
      purpleEyes.style.top = "65px"
      purplePupilL.style.transform = "translate(3px, 4px)"
      purplePupilR.style.transform = "translate(3px, 4px)"
    } else {
      purpleEyes.style.left = 45 + purplePos.faceX + "px"
      purpleEyes.style.top = 40 + purplePos.faceY + "px"
      const po = calcPupilOffset(purpleEyeL, 5)
      purplePupilL.style.transform = `translate(${po.x}px, ${po.y}px)`
      purplePupilR.style.transform = `translate(${po.x}px, ${po.y}px)`
    }

    // ---- Black body ----
    if (isShowingPwd) {
      black.style.transform = "skewX(0deg)"
    } else if (isLookingAway) {
      black.style.transform = "skewX(12deg) translateX(-10px)"
    } else if (isLookingAtEachOther.value) {
      black.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
    } else if (isTyping.value) {
      black.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
    } else {
      black.style.transform = `skewX(${blackPos.bodySkew}deg)`
    }

    // Black eyes
    const blackEyes = document.getElementById('black-eyes') as HTMLElement
    const blackEyeL = document.getElementById('black-eye-l') as HTMLElement
    const blackEyeR = document.getElementById('black-eye-r') as HTMLElement
    const blackPupilL = document.getElementById('black-pupil-l') as HTMLElement
    const blackPupilR = document.getElementById('black-pupil-r') as HTMLElement

    blackEyeL.style.height = isBlackBlinking.value ? "2px" : "16px"
    blackEyeR.style.height = isBlackBlinking.value ? "2px" : "16px"

    if (isError.value) {
      blackEyes.style.left = "15px"
      blackEyes.style.top = "40px"
      blackPupilL.style.transform = "translate(-3px, 4px)"
      blackPupilR.style.transform = "translate(-3px, 4px)"
    } else if (isLookingAway) {
      blackEyes.style.left = "10px"
      blackEyes.style.top = "20px"
      blackPupilL.style.transform = "translate(-4px, -5px)"
      blackPupilR.style.transform = "translate(-4px, -5px)"
    } else if (isShowingPwd) {
      blackEyes.style.left = "10px"
      blackEyes.style.top = "28px"
      blackPupilL.style.transform = "translate(-4px, -4px)"
      blackPupilR.style.transform = "translate(-4px, -4px)"
    } else if (isLookingAtEachOther.value) {
      blackEyes.style.left = "32px"
      blackEyes.style.top = "12px"
      blackPupilL.style.transform = "translate(0px, -4px)"
      blackPupilR.style.transform = "translate(0px, -4px)"
    } else {
      blackEyes.style.left = 26 + blackPos.faceX + "px"
      blackEyes.style.top = 32 + blackPos.faceY + "px"
      const bo = calcPupilOffset(blackEyeL, 4)
      blackPupilL.style.transform = `translate(${bo.x}px, ${bo.y}px)`
      blackPupilR.style.transform = `translate(${bo.x}px, ${bo.y}px)`
    }

    // ---- Orange body ----
    const orangeMouth = document.getElementById("orange-mouth") as HTMLElement
    if (isError.value) {
      orangeMouth.style.left = 80 + orangePos.faceX + "px"
      orangeMouth.style.top = "130px"
    }
    if (isShowingPwd) {
      orange.style.transform = "skewX(0deg)"
    } else {
      orange.style.transform = `skewX(${orangePos.bodySkew}deg)`
    }

    // Orange eyes
    const orangeEyes = document.getElementById('orange-eyes') as HTMLElement
    const orangePupilL = document.getElementById('orange-pupil-l') as HTMLElement
    const orangePupilR = document.getElementById('orange-pupil-r') as HTMLElement

    if (isError.value) {
      orangeEyes.style.left = "60px"
      orangeEyes.style.top = "95px"
      orangePupilL.style.transform = "translate(-3px, 4px)"
      orangePupilR.style.transform = "translate(-3px, 4px)"
    } else if (isLookingAway) {
      orangeEyes.style.left = "50px"
      orangeEyes.style.top = "75px"
      orangePupilL.style.transform = "translate(-5px, -5px)"
      orangePupilR.style.transform = "translate(-5px, -5px)"
    } else if (isShowingPwd) {
      orangeEyes.style.left = "50px"
      orangeEyes.style.top = "85px"
      orangePupilL.style.transform = "translate(-5px, -4px)"
      orangePupilR.style.transform = "translate(-5px, -4px)"
    } else {
      orangeEyes.style.left = 82 + orangePos.faceX + "px"
      orangeEyes.style.top = 90 + orangePos.faceY + "px"
      const oo = calcPupilOffset(orangePupilL, 5)
      orangePupilL.style.transform = `translate(${oo.x}px, ${oo.y}px)`
      orangePupilR.style.transform = `translate(${oo.x}px, ${oo.y}px)`
    }

    // ---- Yellow body ----
    if (isShowingPwd) {
      yellow.style.transform = "skewX(0deg)"
    } else {
      yellow.style.transform = `skewX(${yellowPos.bodySkew}deg)`
    }

    // Yellow eyes & mouth
    const yellowEyes = document.getElementById('yellow-eyes') as HTMLElement
    const yellowPupilL = document.getElementById('yellow-pupil-l') as HTMLElement
    const yellowPupilR = document.getElementById('yellow-pupil-r') as HTMLElement
    const yellowMouth = document.getElementById('yellow-mouth') as HTMLElement

    if (isError.value) {
      yellowEyes.style.left = "35px"
      yellowEyes.style.top = "45px"
      yellowPupilL.style.transform = "translate(-3px, 4px)"
      yellowPupilR.style.transform = "translate(-3px, 4px)"
      yellowMouth.style.left = "30px"
      yellowMouth.style.top = "92px"
      yellowMouth.style.transform = "rotate(-8deg)"
    } else if (isLookingAway) {
      yellowEyes.style.left = "20px"
      yellowEyes.style.top = "30px"
      yellowPupilL.style.transform = "translate(-5px, -5px)"
      yellowPupilR.style.transform = "translate(-5px, -5px)"
      yellowMouth.style.left = "15px"
      yellowMouth.style.top = "78px"
      yellowMouth.style.transform = "rotate(0deg)"
    } else if (isShowingPwd) {
      yellowEyes.style.left = "20px"
      yellowEyes.style.top = "35px"
      yellowPupilL.style.transform = "translate(-5px, -4px)"
      yellowPupilR.style.transform = "translate(-5px, -4px)"
      yellowMouth.style.left = "10px"
      yellowMouth.style.top = "88px"
      yellowMouth.style.transform = "rotate(0deg)"
    } else {
      yellowEyes.style.left = 52 + yellowPos.faceX + "px"
      yellowEyes.style.top = 40 + yellowPos.faceY + "px"
      const yo = calcPupilOffset(yellowPupilL, 5)
      yellowPupilL.style.transform = `translate(${yo.x}px, ${yo.y}px)`
      yellowPupilR.style.transform = `translate(${yo.x}px, ${yo.y}px)`
      yellowMouth.style.left = 40 + yellowPos.faceX + "px"
      yellowMouth.style.top = 88 + yellowPos.faceY + "px"
      yellowMouth.style.transform = "rotate(0deg)"
    }
  }

  onMounted(() => {
    document.addEventListener('mousemove', handleMouseMove)
    scheduleBlinkPurple()
    scheduleBlinkBlack()
    updateCharacters()
  })

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    if (blinkPurpleTimer) clearTimeout(blinkPurpleTimer)
    if (blinkBlackTimer) clearTimeout(blinkBlackTimer)
    if (peekTimer) clearTimeout(peekTimer)
    if (errorRecoverTimer) clearTimeout(errorRecoverTimer)
    if (typingTimer) clearTimeout(typingTimer)
  })

  return {
    mouseX,
    mouseY,
    isPurpleBlinking,
    isBlackBlinking,
    isError,
    isPasswordFocused,
    showPassword,
    passwordLength,
    setTyping,
    triggerError,
    schedulePeek,
    updateCharacters
  }
}

export default useCharacters
