import { useTransitionNavigate } from 'frontend-essentials'

// Exposes a navigation function for Renderprime: https://github.com/theninthsky/renderprime
const useExposeNavigationFunction = () => {
  const navigate = useTransitionNavigate()

  window['navigateTo'] = (url: string) => navigate(url.replace(window.location.origin, ''), { replace: true })
}

export default useExposeNavigationFunction
