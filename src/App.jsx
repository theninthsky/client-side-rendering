import { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazyPrefetch } from 'frontend-essentials'

import Navigation from 'components/Navigation'
import Layout from 'components/Layout'

const Home = lazyPrefetch(() => import(/* webpackChunkName: "index" */ 'pages/Home'))
const Info = lazyPrefetch(() => import(/* webpackChunkName: "info" */ 'pages/Info'))
const Quotes = lazyPrefetch(() => import(/* webpackChunkName: "quotes" */ 'pages/Quotes'))
const Pokemon = lazyPrefetch(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))

const routeManifest = {
  '/': Home,
  '/info': Info,
  '/quotes': Quotes,
  '/pokemon': Pokemon
}

const App = () => {
  const routes = useMemo(
    () =>
      Object.entries(routeManifest).map(([path, Element]) => <Route key={path} path={path} element={<Element />} />),
    [routeManifest]
  )

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
