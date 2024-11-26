import { lazy, Suspense, FC } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import pages from 'pages'
import Navigation from 'components/Navigation'
import Layout from 'components/Layout'

const Home = lazy(() => import(/* webpackChunkName: 'home' */ 'pages/Home'))
const LoremIpsum = lazy(() => import(/* webpackChunkName: 'lorem-ipsum' */ 'pages/LoremIpsum'))

const pageComponents = [Home, LoremIpsum]
const routes = Object.values(pages).map(({ path }, ind) => {
  const Element = pageComponents[ind]

  return <Route key={path} path={path} element={<Element />} />
})

const App: FC<{}> = () => {
  return (
    <>
      <Navigation />

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
