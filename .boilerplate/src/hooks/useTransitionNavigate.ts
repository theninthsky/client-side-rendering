import { useTransition } from 'react'
import { useNavigate, To, NavigateOptions } from 'react-router-dom'

const useTransitionNavigate = () => {
  const [, startTransition] = useTransition()
  const navigate = useNavigate()

  return (to: To, options?: NavigateOptions) => startTransition(() => navigate(to, options))
}

export default useTransitionNavigate
