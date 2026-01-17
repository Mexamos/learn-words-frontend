import { useState, useEffect } from 'react'

// Chakra UI breakpoints in pixels
// Синхронизировано с Chakra UI default breakpoints
export const BREAKPOINTS = {
  base: 0,      // Mobile first
  sm: 480,      // 30em
  md: 768,      // 48em
  lg: 992,      // 62em (custom for better desktop/mobile split)
  xl: 1280,     // 80em
  '2xl': 1536   // 96em
}

// Breakpoints для использования в CSS media queries
export const BREAKPOINTS_CSS = {
  sm: `${BREAKPOINTS.sm}px`,
  md: `${BREAKPOINTS.md}px`,
  lg: `${BREAKPOINTS.lg}px`,
  xl: `${BREAKPOINTS.xl}px`,
  '2xl': `${BREAKPOINTS['2xl']}px`
}

/**
 * Custom hook для определения текущего типа устройства
 * @returns {Object} - объект с флагами устройств и текущей шириной
 */
export const useResponsive = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.lg
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Debounce для оптимизации производительности
    let timeoutId = null
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 150)
    }

    window.addEventListener('resize', debouncedHandleResize)
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', debouncedHandleResize)
    }
  }, [])

  return {
    // Флаги устройств
    isMobile: windowWidth < BREAKPOINTS.md,
    isTablet: windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg,
    isDesktop: windowWidth >= BREAKPOINTS.lg,
    isSmallMobile: windowWidth < BREAKPOINTS.sm,
    isLargeDesktop: windowWidth >= BREAKPOINTS.xl,
    
    // Специфичные проверки для UI решений
    isMobileMenu: windowWidth < BREAKPOINTS.lg, // Когда показывать mobile menu
    isTouchDevice: windowWidth < BREAKPOINTS.md, // Когда применять touch-friendly стили
    
    // Текущая ширина для кастомной логики
    width: windowWidth,
    
    // Текущий breakpoint
    currentBreakpoint: getCurrentBreakpoint(windowWidth)
  }
}

/**
 * Определяет текущий breakpoint
 * @param {number} width - ширина окна
 * @returns {string} - название breakpoint
 */
const getCurrentBreakpoint = (width) => {
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'base'
}

/**
 * Utility функция для conditional rendering на основе breakpoint
 * @param {string} breakpoint - название breakpoint
 * @param {number} currentWidth - текущая ширина
 * @returns {boolean}
 */
export const isBreakpointOrLarger = (breakpoint, currentWidth) => {
  return currentWidth >= BREAKPOINTS[breakpoint]
}

/**
 * Utility функция для получения значения в зависимости от breakpoint
 * @param {Object} values - объект со значениями для каждого breakpoint
 * @param {number} currentWidth - текущая ширина
 * @returns {*} - значение для текущего breakpoint
 */
export const getResponsiveValue = (values, currentWidth) => {
  const breakpoint = getCurrentBreakpoint(currentWidth)
  
  // Ищем ближайшее подходящее значение
  const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'base']
  const currentIndex = breakpointOrder.indexOf(breakpoint)
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }
  
  return values.base
}

/**
 * Hook для медиа-запросов
 * @param {string} query - медиа-запрос
 * @returns {boolean}
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    
    // Устанавливаем начальное значение
    setMatches(media.matches)

    // Создаем listener
    const listener = (e) => setMatches(e.matches)
    
    // Современный API
    if (media.addEventListener) {
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    } else {
      // Fallback для старых браузеров
      media.addListener(listener)
      return () => media.removeListener(listener)
    }
  }, [query])

  return matches
}

/**
 * Проверка на touch устройство
 * @returns {boolean}
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  )
}
