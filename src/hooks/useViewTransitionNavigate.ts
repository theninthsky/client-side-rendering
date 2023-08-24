import { useTransition } from 'react'
import { useNavigate, To, NavigateOptions } from 'react-router-dom'

const useViewTransitionNavigate = () => {
  const [, startTransition] = useTransition()
  const navigate = useNavigate()

  return (to: To, options?: NavigateOptions) =>
    startTransition(() => {
      // @ts-ignore
      if (document.startViewTransition) document.startViewTransition(navigate(to, options))
      else navigate(to, options)
    })
}

export default useViewTransitionNavigate
