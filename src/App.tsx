import { lazy, Suspense, FC } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'

import pagesManifest from 'pages-manifest.json'
import Navigation from 'components/Navigation'
import ScrollToTop from 'components/common/ScrollToTop'
import Layout from 'components/Layout'

const Home = lazy(() => import(/* webpackChunkName: 'home' */ 'pages/Home'))
const LoremIpsum = lazy(() => import(/* webpackChunkName: 'lorem-ipsum' */ 'pages/LoremIpsum'))
const Pokemon = lazy(() => import(/* webpackChunkName: 'pokemon' */ 'pages/Pokemon'))
const PokemonInfo = lazy(() => import(/* webpackChunkName: 'pokemon-info' */ 'pages/PokemonInfo'))
const Comparison = lazy(() => import(/* webpackChunkName: 'comparison' */ 'pages/Comparison'))
const WebVitals = lazy(() => import(/* webpackChunkName: 'core-web-vitals' */ 'pages/WebVitals'))

const pages = [Home, LoremIpsum, Pokemon, PokemonInfo, Comparison, WebVitals]
const routes = pagesManifest.map(({ path }, ind) => {
  const Element = pages[ind]

  return <Route key={path} path={path} element={<Element />} />
})

const App: FC<{}> = () => {
  const navigate = useNavigate()
  // @ts-ignore
  window.navigateTo = (url: string) => navigate(url.replace(window.location.origin, ''), { replace: true })

  const x = 5

  return (
    <>
      <Navigation />

      <ScrollToTop />

      <Layout>
        <Suspense>
          <Routes>
            {routes}

            <Route path="/*" element={<Navigate replace to="/" />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  )
}

export default App
