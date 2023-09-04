import { useTransition, useRef, useEffect } from 'react'
import { useNavigate, To, NavigateOptions } from 'react-router-dom'

// Exposes a navigation function for Renderprime: https://github.com/theninthsky/renderprime
const useExposeNavigationFunction = () => {
  const [pending, startTransition] = useTransition()

  const navigate = useNavigate()

  const navigating = useRef(false)

  useEffect(() => {
    if (pending) navigating.current = true
    else if (navigating.current) {
      navigating.current = false

      window.dispatchEvent(new Event('navigationend'))
    }
  }, [pending])

  const transitionNavigate = (to: To, options?: NavigateOptions) => startTransition(() => navigate(to, options))

  window['navigateTo'] = (url: string) => transitionNavigate(url.replace(window.location.origin, ''), { replace: true })
}

export default useExposeNavigationFunction
