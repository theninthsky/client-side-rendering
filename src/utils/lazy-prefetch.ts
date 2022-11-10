import { lazy, LazyExoticComponent, ComponentType } from 'react'
import { lazyPrefetch } from 'frontend-essentials'

type DynamicImport = () => Promise<{ default: ComponentType<any> }>
type LazyComponent = LazyExoticComponent<ComponentType<any>>

export default (chunk: DynamicImport): LazyComponent => {
  return navigator.userAgent.includes('Prerender') ? lazy(chunk) : lazyPrefetch(chunk)
}
