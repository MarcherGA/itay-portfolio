import { useEffect, useState, useRef } from 'react'

export type TypingAnimation =
  | 'character'
  | 'block-cursor'
  | 'blinking-cursor'
  | 'blinking-line' // new blinking line cursor
  | 'word-by-word'
  | 'immediate'
  | 'line-by-line'

export function useTypingAnimation({
  text,
  shouldStart,
  animationType = 'blinking-cursor',
  typingSpeed = 55,
}: {
  text: string
  shouldStart: boolean
  animationType?: TypingAnimation
  typingSpeed?: number
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!shouldStart) {
      setDisplayedText('')
      setIsTyping(false)
      setShowCursor(true)
      return
    }

    cancelledRef.current = false
    setIsTyping(true)
    setDisplayedText('')

    let timer: number | undefined

    const finishTyping = () => {
      setDisplayedText(text)
      setIsTyping(false)
      setShowCursor(false)
    }

    const safeSetText = (newText: string) => {
      if (!cancelledRef.current) {
        setDisplayedText(newText)
      }
    }

    switch (animationType) {
      case 'character':
      case 'block-cursor':
      case 'blinking-cursor':
      case 'blinking-line': {
        let i = 0
        timer = setInterval(() => {
          if (cancelledRef.current) return
          if (i < text.length) {
            safeSetText(text.slice(0, i + 1))
            i++
          } else {
            finishTyping()
            clearInterval(timer)
          }
        }, typingSpeed)
        break
      }

      case 'word-by-word': {
        const words = text.split(' ')
        let i = 0
        timer = setInterval(() => {
          if (cancelledRef.current) return
          if (i < words.length) {
            safeSetText(words.slice(0, i + 1).join(' '))
            i++
          } else {
            finishTyping()
            clearInterval(timer)
          }
        }, Math.max(typingSpeed * 3, 150))
        break
      }

      case 'line-by-line': {
        const lines = text.split('\n')
        let i = 0
        timer = setInterval(() => {
          if (cancelledRef.current) return
          if (i < lines.length) {
            safeSetText(lines.slice(0, i + 1).join('\n'))
            i++
          } else {
            finishTyping()
            clearInterval(timer)
          }
        }, Math.max(typingSpeed * 8, 400))
        break
      }

      case 'immediate':
        finishTyping()
        break
    }

    return () => {
      cancelledRef.current = true
      if (timer) clearInterval(timer)
    }
  }, [shouldStart, text, animationType, typingSpeed])

  // Cursor blinking effect for blinking cursor and regular blinking line
  useEffect(() => {
    if (
      (animationType === 'blinking-cursor' || animationType === 'blinking-line') &&
      isTyping
    ) {
      const cursorTimer = setInterval(() => {
        setShowCursor(prev => !prev)
      }, 500)
      return () => clearInterval(cursorTimer)
    } else if (animationType === 'blinking-cursor' || animationType === 'blinking-line') {
      setShowCursor(false)
    }
  }, [isTyping, animationType])

  const skipTyping = () => {
    cancelledRef.current = true
    setDisplayedText(text)
    setIsTyping(false)
    setShowCursor(false)
  }

  const getCursorChar = () => {
    switch (animationType) {
      case 'block-cursor':
        return '█'
      case 'blinking-cursor':
        return '_'
      case 'blinking-line':
        return '|'
      default:
        return ''
    }
  }

  return {
    displayedText,
    isTyping,
    showCursor,
    cursorChar: getCursorChar(),
    skipTyping,
  }
}
