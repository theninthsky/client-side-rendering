import { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazyPrefetch } from 'frontend-essentials'

import Navigation from 'components/Navigation'
import Layout from 'components/Layout'

const Home = lazyPrefetch(() => import(/* webpackChunkName: "index" */ 'pages/Home'))
const Info = lazyPrefetch(() => import(/* webpackChunkName: "info" */ 'pages/Info'))

const routeManifest = {
  '/': Home,
  '/info': Info
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
