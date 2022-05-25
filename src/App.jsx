import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazyPrefetch } from 'frontend-essentials'

import routeManifest from 'route-chunk-manifest.json'
import Navigation from 'components/Navigation'
import Layout from 'components/Layout'

const Home = lazyPrefetch(() => import(/* webpackChunkName: "index" */ 'pages/Home'))
const Info = lazyPrefetch(() => import(/* webpackChunkName: "info" */ 'pages/Info'))
const Pokemon = lazyPrefetch(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))

const pages = [Home, Info, Pokemon]
const routes = routeManifest.map(({ path }, ind) => {
  const Element = pages[ind]

  return <Route key={path} path={path} element={<Element />} />
})

const App = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = routeManifest.find(({ path }) => path === pathname)?.title
  }, [pathname])

  return (
    <>
      <Navigation />

      <Layout>
        <Routes>
          {routes}

          <Route path="/*" element={<Navigate replace to="/" />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App
