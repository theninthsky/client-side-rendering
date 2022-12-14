<h1 align="center">Client-side Rendering</h1>

This project is a case study of CSR, it aims to explore the potential of client-side rendered apps compared to server-side rendering.

### Legend

**CSR**: Client-side Rendering
<br>
**SSR**: Server-side Rendering
<br>
**SSG**: Static Site Generation

## Table of Contents

- [Intro](#intro)
- [Motivation](#motivation)
- [Performance](#performance)
  - [Bundle Size](#bundle-size)
  - [Caching](#caching)
  - [Code Splitting](#code-splitting)
  - [Preloading Async Pages](#preloading-async-pages)
  - [Generating Static Data](#generating-static-data)
  - [Preloading Data](#preloading-data)
  - [Tweaking Further](#tweaking-further)
    - [Splitting Vendors From Async Chunks](#splitting-vendors-from-async-chunks)
    - [Preloading Other Pages Data](#preloading-other-pages-data)
    - [Preventing Sequenced Rendering](#preventing-sequenced-rendering)
    - [Transitioning Async Pages](#transitioning-async-pages)
    - [Prefetching Async Pages](#prefetching-async-pages)
    - [Minimizing Idle Time](#minimizing-idle-time)
    - [Leveraging the 304 Status Code](#leveraging-the-304-status-code)
  - [Interim Summary](#interim-summary)
  - [The Biggest Drawback of SSR](#the-biggest-drawback-of-ssr)
  - [The SWR Approach](#the-swr-approach)
    - [Implementing SWR](#implementing-swr)
    - [Reloading On Update](#reloading-on-update)
    - [Revalidating Active Apps](#revalidating-active-apps)
    - [Revalidating Installed Apps](#revalidating-installed-apps)
  - [Summary](#summary)
  - [Deploying](#deploying)
  - [Benchmark](#benchmark)
  - [Areas for Improvement](#areas-for-improvement)
- [SEO](#seo)
  - [Indexing](#indexing)
    - [Google](#google)
    - [Prerendering](#prerendering)
  - [Social Media Share Previews](#social-media-share-previews)
  - [Sitemaps](#sitemaps)
- [CSR vs. SSR](#csr-vs-ssr)
  - [SSR Disadvantages](#ssr-disadvantages)
  - [Why Not SSG?](#why-not-ssg)
  - [The Cost of Hydration](#the-cost-of-hydration)
- [Conclusion](#conclusion)
  - [What Might Change in the Future](#what-might-change-in-the-future)

# Intro

Client-side rendering is the practice of sending the web browser static assets and leaving it to perform the entire rendering process of the app.
Server-side rendering is the practice of rendering the entire app (or page) on the server, sending to the browser a pre-rendered HTML document ready to be displayed.
Static Site Generation is the practice of pre-generating HTML pages as static assets to be sent and displayed by the browser.

Contrary to popular belief, the SSR process of modern frameworks such as React, Angular, Vue and Svelte, makes the app render twice: one time on the server and another time on the browser (this is called "hydration"). Without the latter, the app cannot become interactive and would just be a static, "lifeless", web page.
<br>
The "hydration" process takes about the same time as a full render.
<br>
Needless to say that SSG apps have to be "hydrated" aswell.

The HTML document is fully constucted in both SSR and SSG, which gives them the following advantages:

1. Web crawlers will be able to crawl their pages out-of-the-box, which is critical for SEO.
2. When inlining critical CSS, the _[FCP](https://web.dev/fcp)_ of the page will usually be very good (in SSR it heavily depends on the API server response times).

On the other hand, CSR has the following advantages:

1. The app itself is completely decoupled from the server, which means it loads without being affected by the API server's response times.
2. The developer experience is seemless, all libraries and packages just work without any special customizations.
3. Newly introduced framework updates can be used right away, without having to wait for the wrapping SSR framework to implement them.
4. The learning curve is better, since developers only have to learn the framework instead of both the framework and its SSR wrapper.

In this case-study, we will focus on CSR and how to overcome its built-in shortages while leaveraging its strong points.

Our deployed app can be found here: https://client-side-rendering.pages.dev

# Motivation

_"Recently, SSR (Server Side Rendering) has taken the JavaScript front-end world by storm. The fact that you can now render your sites and apps on the server before sending them to your clients is an absolutely **revolutionary** idea (and totally not what everyone was doing before JS client-side apps got popular in the first place...)._

_However, the same criticisms that were valid for PHP, ASP, JSP, (and such) sites are valid for server-side rendering today. It's slow, breaks fairly easily, and is difficult to implement properly._

_Thing is, despite what everyone might be telling you, you probably don't need SSR. You can get almost all the advantages of it (without the disadvantages) by using prerendering."_

_~[Prerender SPA Plugin](https://github.com/chrisvfritz/prerender-spa-plugin#what-is-prerendering)_

Over the last few years, server-side rendering has started to (re)gain popularity in the form of frameworks such as _[Next.js](https://nextjs.org)_ and _[Remix](https://remix.run)_ to the point that developers just start working with them as a default, without understanding their limitations and even in apps which do not require SEO at all.
<br>
While SSR has some advantages, these frameworks keep emphasizing how fast they are ("Performance as a default"), implying client-side rendering is slow.
<br>
In addition, it is a common misconception that perfect SEO can only be achieved by using SSR, and that there's nothing we can do to improve the way search engines crawl CSR apps.

This project implements a basic CSR app with some tweaks such as code-splitting and preloading, with the ambition that as the app scales, the loading time of a single page would mostly remain unaffected.
The objective is to simulate the number of packages used in a production grade app and try to decrease its loading time as much as possible, mostly by parallelizing requests.

It is important to note that improving performance should not come at the expense of the developer experience, so the way this project is architected should vary only slightly compared to "normal" react projects, and it won't be as extremely opinionated as Next.js (or as limiting as SSR is in general).

This case study will cover two major aspects: performance and SEO. We will see how we can achieve great scores in both of them.

_Note: while this project is implemented with React, the majority of its tweaks are not tied to any framework and are purely browser-based._

# Performance

We will assume a standard Webpack 5 setup and add the required customizations as we progress.
<br>
The vast majority of code changes that we'll go throught will be inside the _[webpack.config.js](webpack.config.js)_ configuration file and the _[index.js](public/index.js)_ HTML template.

### Bundle Size

The first rule of thumb is to use as fewer dependencies as possible, and among those, to select the ones with smaller filesize.

For example:
<br>
We can use _[day.js](https://www.npmjs.com/package/dayjs)_ instead of _[moment](https://www.npmjs.com/package/moment)_, _[zustand](https://www.npmjs.com/package/zustand)_ instead of _[redux toolkit](https://www.npmjs.com/package/@reduxjs/toolkit)_ etc.

This is crucial not only for CSR apps, but also for SSR (and SSG) apps, since the bigger our bundle is - the longer it will take the page to be visible or interactive.

### Caching

Ideally, every hashed file should be cached, and `index.html` should **never** be cached.
<br>
It means that the browser would initially cache `main.[hash].js` and would have to redownload it only if its hash (content) changes.

However, since `main.js` includes the entire bundle, the slightest change in code would cause its cache to expire, meaning the browser would have to download it again.
<br>
Now, what part of our bundle comprises most of its weight? The answer is the **dependencies**, also called **vendors**.

So if we could split the vendors to their own hashed chunk, that would allow a separation between our code and the vendors code, leading to less cache invalidations.

Let's add the following part to our _[webpack.config.js](webpack.config.js)_ file:

```js
optimization: {
  runtimeChunk: 'single',
  splitChunks: {
    chunks: 'initial',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors'
      }
    }
  }
}
```

This will create a `vendors.[hash].js` file.

Although this is a substantial improvement, what would happen if we updated a very small dependency?
<br>
In such case, the entire vendors chunk's cache will invalidate.

So, in order to make this even better, we will split **each dependency** to its own hashed chunk:

_[webpack.config.js](webpack.config.js)_

```diff
- name: 'vendors'
+ name: ({ context }) => (context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]
```

This will create files like `react-dom.[hash].js`, `react-router-dom.[hash].js` etc.

More info about the default configurations (such as the split threshold size) can be found here:
<br>
https://webpack.js.org/plugins/split-chunks-plugin/#defaults

### Code Splitting

A lot of the features we write end up being used only in a few of our pages, so we would like them to be downloaded only when the user visits the page they are being used in.

For Example, we wouldn't want users to download the _[react-big-calendar](https://www.npmjs.com/package/react-big-calendar)_ package if they just loaded the home page. We would only want that to happen when they visit the calendar page.

The way we achieve this is (preferably) by route-based code splitting:

_[App.jsx](src/App.jsx)_

```js
const Home = lazy(() => import(/* webpackChunkName: "home" */ 'pages/Home'))
const LoremIpsum = lazy(() => import(/* webpackChunkName: "lorem-ipsum" */ 'pages/LoremIpsum'))
const Pokemon = lazy(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))
```

So when the user visits the Lorem Ipsum page, they only download the main chunk script (which includes all shared dependencies such as the framework) and the `lorem-ipsum.[hash].js` chunk.

_Note: I believe that it is completely fine (and even encouraged) to have the user download our entire site, so they can have a smooth **app-like** navigation experience. But it is **very wrong** to have all the assets being downloaded **initially**, delaying the first render of the page.
<br>
These assets should be downloaded after the user-requested page has finished rendering and is entirely visible._

### Preloading Async Pages

Code splitting has one major flaw - the runtime doesn't know which async chunks are needed until the main script executes, leading to them being fetched in a significant delay:

![Without Async Preload](images/without-async-preload.png)

The way we can solve this issue is by implementing a script in the document that will be responsible for preloading relevant assets:

_[webpack.config.js](webpack.config.js)_

```js
plugins: [
  new HtmlPlugin({
    scriptLoading: 'module',
    templateContent: ({ compilation }) => {
      const assets = compilation.getAssets().map(({ name }) => name)

      const pages = pagesManifest.map(({ chunk, path }) => {
        const script = assets.find(name => name.includes(`/${chunk}.`) && name.endsWith('.js'))

        return { path, script }
      })

      return htmlTemplate(pages)
    }
  })
]
```

_[index.js](public/index.js)_

```js
module.exports = pages => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>CSR</title>

      <script>
        let { pathname } = window.location

        if (pathname !== '/') pathname = pathname.replace(/\\/$/, '')

        const pages = ${JSON.stringify(pages)}

        for (const { path, script } of pages) {
          if (pathname !== path) continue

          document.head.appendChild(
            Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
          )

          break
        }
      </script>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
`
```

The imported `pages-manifest.json` file can be found [here](src/pages-manifest.json).

_Please note that other types of assets can be preloaded the same way (like stylesheets)._

This way, the browser is able to fetch the page-related script chunk **in parallel** with render-critical assets:

![With Async Preload](images/with-async-preload.png)

### Generating Static Data

I like the idea of SSG: we create a cacheable HTML file and inject static data into it.
<br>
This can be useful for data that is not highly dynamic, such as content from CMS.

But how can we create static data?
<br>
We will execute the following script during build time:

_[fetch-static.mjs](scripts/fetch-static.mjs)_

```js
import { mkdir, writeFile } from 'fs/promises'
import axios from 'axios'

const path = 'public/json'
const axiosOptions = { transformResponse: res => res }

mkdir(path, { recursive: true })

const fetchLoremIpsum = async () => {
  const { data } = await axios.get('https://loripsum.net/api/200/long/plaintext', axiosOptions)

  writeFile(`${path}/lorem-ipsum.json`, JSON.stringify(data))
}

fetchLoremIpsum()
```

That would create a `json/lorem-ipsum.json` file to be stored in the CDN.

And now we simply fetch our static data:

```js
fetch('json/lorem-ipsum.json')
```

There are numerous advantages to this approach:

- We generate static data so we won't bother our server or CMS for every user request.
- The data will be fetched a lot faster from a nearby CDN edge than from a remote server.
- Since this script runs on our server during build time, we can authenticate with services however we want, there is no limit to what can be sent (secret tokens for example).

Whenever we need to update the static data we simply rebuild the app or, better yet, just rerun the script.

### Preloading Data

One of the disadvantages of CSR over SSR is that data will be fetched only after JS has been downloaded, parsed and executed in the browser:

![Without Data Preload](images/without-data-preload.png)

To overcome this, we will use preloading once again, this time for the data itself:

_[webpack.config.js](webpack.config.js)_

```diff
plugins: [
  new HtmlPlugin({
    scriptLoading: 'module',
    templateContent: ({ compilation }) => {
      const assets = compilation.getAssets().map(({ name }) => name)

-     const pages = pagesManifest.map(({ chunk, path }) => {
+     const pages = pagesManifest.map(({ chunk, path, data }) => {
        const script = assets.find(name => name.includes(`/${chunk}.`) && name.endsWith('.js'))

+       if (data && !Array.isArray(data)) data = [data]

-       return { path, script }
+       return { path, script, data }
      })

      return htmlTemplate(pages)
    }
  })
]
```

_[index.js](public/index.js)_

```diff
module.exports = pages => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>CSR</title>

      <script>
+       const isStructureEqual = (pathname, path) => {
+         pathname = pathname.split('/')
+         path = path.split('/')
+
+         if (pathname.length !== path.length) return false
+
+         return pathname.every((segment, ind) => segment === path[ind] || path[ind].includes(':'))
+       }

        let { pathname } = window.location

        if (pathname !== '/') pathname = pathname.replace(/\\/$/, '')

        const pages = ${JSON.stringify(pages)}

-       for (const { path, script } of pages) {
+       for (const { path, script, data } of pages) {
-         if (pathname !== path) continue
+         const match = pathname === path || (path.includes(':') && isStructureEqual(pathname, path))
+
+         if (!match) continue

          document.head.appendChild(
            Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
          )

+         if (!data) break
+
+          data.forEach(({ url, dynamicPathIndexes, crossorigin }) => {
+           let fullURL = url
+
+           if (dynamicPathIndexes) {
+             const pathnameArr = pathname.split('/')
+             const dynamics = dynamicPathIndexes.map(index => pathnameArr[index])
+
+             let counter = 0
+
+             fullURL = url.replace(/\\$/g, match => dynamics[counter++])
+           }
+
+           document.head.appendChild(
+             Object.assign(document.createElement('link'), { rel: 'preload', href: fullURL, as: 'fetch', crossOrigin: crossorigin })
+           )
          })

          break
        }
      </script>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
`
```

Now we can see that the data is being fetched right away:

![With Data Preload](images/with-data-preload.png)

With the above script, we can even preload dynamic routes data (such as _[pokemon/:name](https://client-side-rendering.pages.dev/pokemon/pikachu)_).

The only limitation is that we can only preload GET resources, but this would not be a problem when the backend is well-architected.

## Tweaking Further

### Splitting Vendors From Async Chunks

Code splitting introduced us to a new problem: vendor duplication.

Say we have two async chunks: `lorem-ipsum.[hash].js` and `pokemon.[hash].js`.
If they both include the same dependency that is not part of the main chunk, that means the user will download that dependency **twice**.

So if that said dependency is `moment` and it weighs 72kb minzipped, then both async chunk's size will be **at least** 72kb.

We need to split this dependency from these async chunks so that it could be shared between them:

_[webpack.config.js](webpack.config.js)_

```diff
optimization: {
  runtimeChunk: 'single',
  splitChunks: {
    chunks: 'initial',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
+       chunks: 'all',
        name: ({ context }) => (context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]
      }
    }
  }
}
```

Now both `lorem-ipsum.[hash].js` and `pokemon.[hash].js` will use the extracted `moment.[hash].js` chunk, sparing the user a lot of network traffic (and giving these assets better cache persistence).

However, we have no way of telling which async vendor chunks will be split before we build the application, so we wouldn't know which async vendor chunks we need to preload (refer to the "Preloading Async Chunks" section).

![Without Async Vendor Preload](images/without-async-vendor-preload.png)

That's why we will append the chunks names to the async vendor's name:

_[webpack.config.js](webpack.config.js)_

```diff
optimization: {
  runtimeChunk: 'single',
  splitChunks: {
    chunks: 'initial',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        chunks: 'all',
-       name: ({ context }) => (context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]
+       name: (module, chunks) => {
+         const allChunksNames = chunks.map(({ name }) => name).join('.')
+         const moduleName = (module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]

+         return `${moduleName}.${allChunksNames}`
        }
      }
    }
  }
},
.
.
.
plugins: [
  new HtmlPlugin({
    scriptLoading: 'module',
    templateContent: ({ compilation }) => {
      const assets = compilation.getAssets().map(({ name }) => name)

      const pages = pagesManifest.map(({ chunk, path, data }) => {
-       const script = assets.find(name => name.includes(`/${chunk}.`) && name.endsWith('.js'))
+       const scripts = assets.filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

        if (data && !Array.isArray(data)) data = [data]

-       return { path, script, data }
+       return { path, scripts, data }
      })

      return htmlTemplate(pages)
    }
  })
]
```

_[index.js](public/index.js)_

```diff
module.exports = pages => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>CSR</title>

      <script>
        const isStructureEqual = (pathname, path) => {
          pathname = pathname.split('/')
          path = path.split('/')

          if (pathname.length !== path.length) return false

          return pathname.every((segment, ind) => segment === path[ind] || path[ind].includes(':'))
        }

        let { pathname } = window.location

        if (pathname !== '/') pathname = pathname.replace(/\\/$/, '')

        const pages = ${JSON.stringify(pages)}

-       for (const { path, script, data } of pages) {
+       for (const { path, scripts, data } of pages) {
          const match = pathname === path || (path.includes(':') && isStructureEqual(pathname, path))

          if (!match) continue

+         scripts.forEach(script => {
            document.head.appendChild(
              Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
            )
+         })

          if (!data) break

           data.forEach(({ url, dynamicPathIndexes, crossorigin }) => {
            let fullURL = url

            if (dynamicPathIndexes) {
              const pathnameArr = pathname.split('/')
              const dynamics = dynamicPathIndexes.map(index => pathnameArr[index])

              let counter = 0

              fullURL = url.replace(/\\$/g, match => dynamics[counter++])
            }

            document.head.appendChild(
              Object.assign(document.createElement('link'), { rel: 'preload', href: fullURL, as: 'fetch', crossOrigin: crossorigin })
            )
          })

          break
        }
      </script>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
`
```

Now all async vendor chunks will be fetched in parallel with their parent async chunk:

![With Async Vendor Preload](images/with-async-vendor-preload.png)

### Preloading Other Pages Data

We can preload data when hovering over links (desktop) or when links enter the viewport (mobile):

_[NavigationLink.jsx](src/components/NavigationLink.tsx)_

```js
const createPreload = url => {
  if (document.head.querySelector(`link[href="${url}"]`)) return

  document.head.appendChild(
    Object.assign(document.createElement('link'), {
      rel: 'preload',
      href: url,
      as: 'fetch'
    })
  )
}
```

### Preventing Sequenced Rendering

When we split a page from the main app, we separate its render phase, meaning the app will render before the page renders:

![Before Page Render](images/before-page-render.png)
![After Page Render](images/after-page-render.png)

This happens due to the common approach of wrapping routes with Suspense:

```js
const App = () => {
  return (
    <>
      <Navigation />

      <Suspense>
        <Routes>{routes}</Routes>
      </Suspense>
    </>
  )
}
```

This method has a lot of sense to it:
<br>
We would prefer the app to be visually complete in a single render, but we would never want to stall the page render until the async chunk finishes downloading.

However, since we preload all async chunks (and their vendors), this won't be a problem for us. So we **should** suspend the entire app until the async chunk finishes downloading (which, in our case, happens in parallel with all the render-critical assets):

_[index.jsx](src/index.jsx)_

```js
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Suspense>
      <App />
    </Suspense>
  </BrowserRouter>
)
```

This would make our app and the async page visually render at the same time.

_Note that this method should be used in conjunction with the method followed in the next section to prevent a blank page during suspensions._

### Transitioning Async Pages

_Note: this technique requires React 18_

We will see a similar effect when we move to another async page: a blank space that remains until the page's script finishes downloading.

React 18 introduced us to the useTransition hook, which allows us to delay a render until some criteria are met.
<br>
We will use this hook to delay the page's navigation until it is ready:

_[useDelayedNavigate.ts](https://github.com/theninthsky/frontend-essentials/blob/main/src/hooks/useDelayedNavigate.ts)_

```js
import { useTransition } from 'react'
import { useNavigate } from 'react-router-dom'

const useDelayedNavigate = () => {
  const [, startTransition] = useTransition()
  const navigate = useNavigate()

  return to => startTransition(() => navigate(to))
}

export default useDelayedNavigate
```

_[NavigationLink.jsx](src/components/NavigationLink.tsx)_

```js
const NavigationLink = ({ to, onClick, children }) => {
  const navigate = useDelayedNavigate()

  const onLinkClick = event => {
    event.preventDefault()
    navigate(to)
    onClick?.()
  }

  return (
    <NavLink to={to} onClick={onLinkClick}>
      {children}
    </NavLink>
  )
}

export default NavigationLink
```

Now async pages will feel like they were never split from the main app.

### Prefetching Async Pages

Users should have a smooth navigation experience in our app.
<br>
However, splitting every page causes a noticeable delay in navigation, since every page has to be downloaded before it can be rendered on screen.

That's why I think all pages should be prefetched ahead of time.

We can do this by writing a wrapper function around React's _lazy_ function:

_[lazy-prefetch.ts](https://github.com/theninthsky/frontend-essentials/blob/main/src/utils/lazy-prefetch.ts)_

```js
import { lazy } from 'react'

const lazyPrefetch = chunk => {
  if (window.requestIdleCallback) window.requestIdleCallback(chunk)
  else window.addEventListener('load', () => setTimeout(chunk, 500), { once: true })

  return lazy(chunk)
}

export default lazyPrefetch
```

_[App.jsx](src/App.jsx)_

```diff
- const Home = lazy(() => import(/* webpackChunkName: "home" */ 'pages/Home'))
- const LoremIpsum = lazy(() => import(/* webpackChunkName: "lorem-ipsum" */ 'pages/LoremIpsum'))
- const Pokemon = lazy(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))

+ const Home = lazyPrefetch(() => import(/* webpackChunkName: "home" */ 'pages/Home'))
+ const LoremIpsum = lazyPrefetch(() => import(/* webpackChunkName: "lorem-ipsum" */ 'pages/LoremIpsum'))
+ const Pokemon = lazyPrefetch(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))
```

Now all pages will be prefetched and parsed (but not executed) before the user even tries to navigate to them.

### Minimizing Idle Time

When inspecting our 43kb `react-dom.js` file, we can see that the time it took for the request to return was 128ms while the time it took to download the file was 9ms:

![RTT vs Download](images/rtt-vs-download.png)

This proves to us the well-known fact that RTT (and not download speed) has the most impact on web pages load times, even when served from a nearby CDN edge.

Additionally, we can see that after the HTML file is downloaded, we have a large timespan where the browser does nothing and just waits for the scripts to be download:

![Browser Idle Period](images/browser-idle-period.png)

This is a lot of precious time (marked in green) that the browser could use to execute scripts and speed up the page's visibility (and interactivity).

The way we can eliminate both of these problems is by inlining the render-critical scripts right into the HTML file:

_[webpack.config.js](webpack.config.js)_

```diff
optimization: {
  runtimeChunk: 'single',
  splitChunks: {
-   chunks: 'initial',
+   chunks: 'async',
    minSize: 40000,
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: (module, chunks) => {
          const allChunksNames = chunks.map(({ name }) => name).join('.')
          const moduleName = (module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]

          return `${moduleName}.${allChunksNames}`
        }
      }
    }
  }
},
.
.
.
new HtmlPlugin({
- scriptLoading: 'module',
+ inject: false,
- templateContent: ({ compilation }) => {
+ templateContent: ({ htmlWebpackPlugin, compilation }) => {
-   const assets = compilation.getAssets().map(({ name }) => name)
+   const assets = compilation.getAssets()
+   const initialScripts = htmlWebpackPlugin.files.js
+           .map(script => assets.find(({ name }) => decodeURIComponent(script).slice(1) === name))
+           .map(({ name, source }) => ({ name, source: source._children[0]._value }))

    const pages = pagesManifest.map(({ chunk, path, data }) => {
      const scripts = assets.filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

      if (data && !Array.isArray(data)) data = [data]

      return { path, scripts, data }
    })

-   return htmlTemplate(pages)
+   return htmlTemplate(initialScripts, pages)
  }
})
```

_[index.js](public/index.js)_

```diff
- module.exports = pages => `
+ module.exports = (initialScripts, pages) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        .
        .
        .

+       ${initialScripts.map(({ name, source }) => `<script id="${name}" type="module">${source}</script>`).join('\n')}
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
`
```

Now the browser will get its initial scripts without having to send another request to the CDN. And since the HTML file is streamed, the browser will execute the scripts as soon as it gets them, without having to wait for the entire file to download.
<br>
So the browser will first send requests for the async chunks and the preloaded data, and while they are pending, it will start downloading and executing the main scripts.

While might make a noticeable difference on fast networks, this is especially critical for slower networks, where the delay is much larger and so the RTT is much more impactful:

![Inlined Scripts Fast 3G](images/inlined-scripts-fast-3g.png)

We can see that the async chunks start to download (marked in blue) almost immidiately after the HTML file finishes downloading (and even parsing, which saves a lot of time).

This inlining method has only one disadvantage: the HTML file grows from about 2kb to about 100kb (depends on the implementation). However, in the next section, we will be taking advantage of the `304 Not Modified` status code to make the HTML size mostly irrelevant.

_Note that we do not inline the async chunks since that would force us to generate multiple HTML documents, one for each page (and so losing the `304 Not Modified` status returned by a single HTML). In addition, this would negatively impact the Total Blocking Time of the page._

### Leveraging the 304 Status Code

When a static asset is returned from a CDN, it includes an `ETag` header. An ETag is the content hash of the resource.

The next time the browser wants to fetch this asset, it first checks if it has stored an ETag for that asset. If it does, it sends that ETag inside an `If-None-Match` header along with the request.
<br>
The CDN then compares the received `If-None-Match` header with the asset's current ETag.
<br>
If they are different, the CDN will return a `200 Success` status code along with the new asset.
<br>
However, if they match, the CDN will return a `304 Not Modified` status code, notifying the browser that it can safely use its stored asset (without having to redownload it).

So in a traditional CSR app, when loading a page and then reloading it, we can see that the HTML request gets a `304 Not Modified` status code (and all other assets are served from cache).

The ETag is stored per route, so `/lorem-ipsum`'s and `/pokemon`'s HTML ETags will be stored under different cache entries in the browser (even if their ETags are equal).

In a CSR SPA we have a single HTML file, and so the ETag that is returned from the CDN is the same for every page request.

However, since the ETag is stored per route (page), the browser won't send the `If-None-Match` if no ETag exists in that route's cache entry.
This means that for every unvisited page, the browser will get a 200 status code and will have to redownload the HTML, despite that fact that every page is the exact same HTML document.

The way we can overcome this disadvantage is by redirecting every HTML request to the root route using a Service Worker:

_[service-worker.js](public/service-worker.js)_

```js
self.addEventListener('install', self.skipWaiting)

self.addEventListener('fetch', event => {
  if (event.request.destination === 'document') {
    event.respondWith(fetch(new Request(self.registration.scope)))
  }
})
```

Now every page we land on will request the root `/` HTML document from the CDN, making the browser send the `If-None-Match` header and get a 304 status code for every single route.

## Interim Summary

Up until now we've managed the make our app well-splitted, extremely cachable, with fluid navigations between async pages and with page and data preloads.
<br>
From this point forward we are going to level it up one last time using a method that is a little more extreme but with unmatched benefits in terms of performance.

The code so far can be found in the _[before-swr](https://github.com/theninthsky/client-side-rendering/tree/before-swr)_ branch.

## The Biggest Drawback of SSR

When using server-side rendering, it is most common to fetch the (dynamic) data on the server and then "bake" it into the HTML before sending the page to the browser.
<br>
This practice has a lot of sense to it, and fetching data on the browser will make the choice of using SSR completely unreasonable (it even falls behind CSR's performance since the fetch will occur only after the entire hydration process is finished).

However, inlining the data in the HTML has one major flaw: it eliminates the natural seperation between the app and the dynamic data.
<br>
The implications of this can be seen when trying to serve users cached pages.

It's obvious that we want our app to load fast for every user and especially for returning users. But since every user has a different connection speed, some users will see their requested pages only after several seconds.
<br>
In addition, even those with fast interent connection will have to pay the price of the initial connection before even starting to download their desired page:

![Connection Establishment](images/connection-establishment.png)

In the sample above (caught by a 500Mbps interent connection speed), it tooks 600ms just to get the first byte of the HTML document.
<br>
These times vary greatly from tens of milliseconds to hundreds of milliseconds. And to make things even worse, browsers keep the DNS cache only for about a minute, and so this process repeats very frequently.

The only reasonable way to rise above these issues is by caching HTML pages in the browser (for example, by setting a `Max-Age` value higher than `0`).

But here is the problem with SSR: by doing so, users will potentailly see outdated content, since the data is inlined in the document.
<br>
The lack of seperation between the app (also called the "app shell") and its data prevents us from using the browser's cache without risking the freshness of the data.

However, in CSR apps we have complete seperation of the two, making it more than possible to cache only the app shell while still getting fresh data on every visit (just like in native apps).

## The SWR Approach

We can easily implement app shell cache by setting the `Cache-Control: Max-Age=x` header of the HTML document to any value greater than 0. This way the app will load almost instantly (usually under 200ms) regardless of the user's connectivity or connection speed for the duration we set.

However, the `Max-Age` attribute has one major flaw: during the set time period, the browser won't even attempt to reach the CDN, requests will be fulfilled immidiately by the cached responses. This means that no matter how many times the user reloads the page - they will always get a "stale" (potentially outdated) response.

That's why the "Stale While Revalidate" (SWR) approach was invented.

When using SWR, the browser is allowed to use a cached asset or response (usually for a limited time) but in the same time it sends a request for the server and asks for the newest asset. After the fresh asset is downloaded, the browser **replaces** the stale cached asset with the fresh asset, ready to be used the next time the page is loaded.

This method completely surpasses any network conditions, it even allows our app to be available while offline (within the SWR allowed time period), and all of this without even compromising on the freshness of the app shell.

Many popular websites such as Twitter, CodeSandbox and Photopea implement SWR in their app shell.

There are two ways to achieve SWR in web applications:

- The _[stale-while-revalidate](https://web.dev/stale-while-revalidate/#what-shipped)_ attribute.
- A custom service worker.

Although the first approach is completely usable (and can be set up within seconds), the second approach will give us a more granular control of how and when assets are cached and updated, so this is the approach we choose to implement.

### Implementing SWR

Our SWR service worker needs to cache the HTML document and all of the scripts (and stylesheets) of all pages.
<br>
In addition, it needs to serve these cached assets right when the page loads and then send a request to the CDN, fetch all new assets (if exist) and finally replace the stale cached assets with the new ones.

_[webpack.config.js](webpack.config.js)_

```js
plugins: [
  ...(production
    ? [
        new InjectManifest({
          include: [/fonts\//, /scripts\/.+\.js$/],
          swSrc: path.join(__dirname, 'public', 'service-worker.js')
        })
      ]
    : []),
.
.
.
]
```

_[service-worker-registration.js](src/service-worker-registration.js)_

```js
const register = () => {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/service-worker.js')

      console.log('Service worker registered!')
    } catch (err) {
      console.error(err)
    }
  })
}

const unregister = async () => {
  try {
    const registration = await navigator.serviceWorker.ready

    await registration.unregister()

    console.log('Service worker unregistered!')
  } catch (err) {
    console.error(err)
  }
}

if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'development') unregister()
  else register()
}
```

_[service-worker.js](public/service-worker.js)_

```js
const CACHE_NAME = 'my-csr-app'
const CACHED_URLS = [
  '/',
  ...self.__WB_MANIFEST.map(({ url }) => url).filter(script => !/scripts\/(main|runtime)\./.test(script))
]
const MAX_STALE_DURATION = 7 * 24 * 60 * 60

const preCache = async () => {
  const cache = await caches.open(CACHE_NAME)

  await cache.addAll(CACHED_URLS)
}

const staleWhileRevalidate = async request => {
  const documentRequest = request.destination === 'document'

  if (documentRequest) request = new Request(self.registration.scope)

  const cache = await caches.open(CACHE_NAME)
  const cachedResponsePromise = await cache.match(request)
  const networkResponsePromise = fetch(request)

  if (documentRequest) {
    networkResponsePromise.then(response => cache.put(request, response.clone()))

    if ((new Date() - new Date(cachedResponsePromise?.headers.get('date'))) / 1000 > MAX_STALE_DURATION) {
      return networkResponsePromise
    }

    return cachedResponsePromise
  }

  return cachedResponsePromise || networkResponsePromise
}

self.addEventListener('install', event => {
  event.waitUntil(preCache())
  self.skipWaiting()
})

self.addEventListener('fetch', event => {
  if (['document', 'font', 'script'].includes(event.request.destination)) {
    event.respondWith(staleWhileRevalidate(event.request))
  }
})
```

_[App.jsx](src/App.jsx)_

```diff
- const Home = lazyPrefetch(() => import(/* webpackChunkName: "home" */ 'pages/Home'))
- const LoremIpsum = lazyPrefetch(() => import(/* webpackChunkName: "lorem-ipsum" */ 'pages/LoremIpsum'))
- const Pokemon = lazyPrefetch(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))

+ const Home = lazy(() => import(/* webpackChunkName: "home" */ 'pages/Home'))
+ const LoremIpsum = lazy(() => import(/* webpackChunkName: "lorem-ipsum" */ 'pages/LoremIpsum'))
+ const Pokemon = lazy(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))
```

We exclude the `main.js` and `runtime.js` scripts since we already inline them in the HTML document.

Additionally, we define a `MAX_STALE_DURATION` constant to set the maximum duration we are willing for our users to see the (potentially) stale app shell.
<br>
This duration can be derived from how often we update (deploy) our app in production. And it's important to remember that native apps, in comparison, can sometimes be "stale" for months without being updated by the app stores.

The results exceed all expectations:

![SWR Disk Cache](images/swr-disk-cache.png)

These metrics are coming from a 5-year-old `Intel i3-8130U` laptop when the browser is using the disk cache (not the memory cache which is a lot faster), and are completely independent of network speed or status.

Now that we've seen that nothing can match SWR in terms of performance, our new goal is to try to keep users' apps as much up-to-date as possible, without compromising on the SWR allowed time period.

### Reloading On Update

When a user opens our app and there's and update, the browser will replace the old cached files with the new ones. The user then will see the update only when they reload the page.
<br>
If we wanted the update to be visible right away, we could manually reload the app.
<br>
However, reloading the app while the user is viewing it is a very bad idea. Instead, we can reload the app while it is _hidden_:

_[service-worker.js](public/service-worker.js)_

```diff
const preCache = async () => {
  const cache = await caches.open(CACHE_NAME)
+ const [windowClient] = await clients.matchAll({ includeUncontrolled: true, type: 'window' })

  await cache.addAll(CACHED_URLS)
+ windowClient.postMessage({ type: 'update-available' })
}
```

_[index.jsx](src/index.jsx)_

```js
import pagesManifest from 'pages-manifest.json'

const events = ['mousedown', 'keydown']
let userInteracted = false

events.forEach(event => addEventListener(event, () => (userInteracted = true), { once: true }))

const reloadIfPossible = () => {
  if (userInteracted || document.visibilityState === 'visible') return

  let { pathname } = window.location

  if (pathname !== '/') pathname = pathname.replace(/\/$/, '')

  const reloadAllowed = !!pagesManifest.find(
    ({ path, preventReload }) => !preventReload && isStructureEqual(pathname, path)
  )

  if (reloadAllowed) window.location.reload()
}

navigator.serviceWorker.addEventListener('message', ({ data }) => {
  if (data.type === 'update-available') {
    reloadIfPossible()

    window.addEventListener('visibilitychange', reloadIfPossible)
  }
})
```

We reload the app only when it is hidden **and** the user did not interact with it. This way the app will self-update even without the user's notice.

_Note that we do not consider the `scroll` event as an interaction, since this action is stateless and in most cases the browser will restore the scroll position upon reload._
<br>
_In addition, we can define a `preventReload` property in pages that we wouldn't want to be automatically reloaded (such as a user's feed which potentially changes on every reload)._

### Revalidating Active Apps

Some users leave the app open for extended periods of time, so another thing we can do is to revalidate the app while it is running:

_[service-worker-registration.js](src/service-worker-registration.js)_

```diff
+ const ACTIVE_REVALIDATION_INTERVAL = 1 * 60 * 60

const register = () => {
  window.addEventListener('load', async () => {
    try {
-     await navigator.serviceWorker.register('/service-worker.js')
+     const registration = await navigator.serviceWorker.register('/service-worker.js')

      console.log('Service worker registered!')

+     setInterval(() => registration.update(), ACTIVE_REVALIDATION_INTERVAL * 1000)
    } catch (err) {
      console.error(err)
    }
  })
}
```

_[index.jsx](src/index.jsx)_

```diff
navigator.serviceWorker.addEventListener('message', ({ data }) => {
  if (data.type === 'update-available') {
+   reloadIfPossible()
+
    window.addEventListener('visibilitychange', reloadIfPossible)
  }
})

```

The code above arbitrarily revalidates the app every hour. However, we could implement a more sophisticated revalidation process which will run every time we deploy our app and notify all online users either through _[SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)_ or _[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications)_.

### Revalidating Installed Apps

The final method we can use in order to promise our users always have the latest version of our app is called _[Periodic Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)_.

This method only works for installed PWAs and allows the OS to periodically "wake-up" the service worker when the app is closed.

During its wake-up time, the service worker can perform any task, including revalidating assets:

_[service-worker-registration.js](src/service-worker-registration.js)_

```diff
const ACTIVE_REVALIDATION_INTERVAL = 1 * 60 * 60
+ const PERIODIC_REVALIDATION_INTERVAL = 12 * 60 * 60

const register = () => {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')

      console.log('Service worker registered!')

      setInterval(() => registration.update(), ACTIVE_REVALIDATION_INTERVAL * 1000)

+     const { state } = await navigator.permissions.query({ name: 'periodic-background-sync' })
+
+     if (state === 'granted') {
+       await registration.periodicSync.register('revalidate-assets', {
+         minInterval: PERIODIC_REVALIDATION_INTERVAL * 1000
+       })
+     }
    } catch (err) {
      console.error(err)
    }
  })
}
.
.
.
```

_[service-worker.js](public/service-worker.js)_

```js
.
.
.
self.addEventListener('periodicsync', event => {
  if (event.tag === 'revalidate-assets') event.waitUntil(preCache())
})

```

This way we ensure that users who installed our app will always see the most recent version when they open it.

_Note that this is currently only working in Chromium-based browsers and in a non-iOS environment._

Further reading: https://developer.chrome.com/articles/periodic-background-sync

## Summary

We've managed to make the initial load of our app extremely fast, only what is needed for the page is being loaded.
<br>
In addition, we preload other pages (and even their data), which makes it seem as if they were never seperated to begin with.
<br>
And finally, we wrapped everything inside SWR, so the repeated loads of our app are unbelievably fast, it's literaly impossible to get anything better than that.

All of these were achieved without compromising on the DX and without dictating which JS framework we choose and where we deploy our app, it can be on any CDN we choose (more on that in the next section).

## Deploying

The biggest advantage of a static app is that it can be served entirely from a CDN.
<br>
A CDN has many PoPs (Points of Presence), also called "Edge Networks". These PoPs are distributed around the globe and thus are able to serve files to every region **much** faster than a remote server.

The fastest CDN to date is Cloudflare, which has more than 250 PoPs (and counting):

![Cloudflare PoPs](images/cloudflare-pops.png)

https://speed.cloudflare.com

https://blog.cloudflare.com/benchmarking-edge-network-performance

We can easily deploy our app using Cloudflare Pages:
<br>
https://pages.cloudflare.com

## Benchmark

To conclude this section, we will perform a benchmark of our app compared to _[Next.js](https://nextjs.org/docs/getting-started)_'s documentation site (which is **entirely SSG**).
<br>
We will compare the minimalistic _Accessibility_ page to our _Lorem Ipsum_ page. Both pages include ~246kb of JS in their render-critical chunks (preloads and prefetches that come after are irrelevant).
<br>
You can click on each link to perform a live benchmark.

_[Accessibility | Next.js](https://pagespeed.web.dev/report?url=https%3A%2F%2Fnextjs.org%2Fdocs%2Faccessibility)_
<br>
_[Lorem Ipsum | Client-side Rendering](https://pagespeed.web.dev/report?url=https%3A%2F%2Fclient-side-rendering.pages.dev%2Florem-ipsum)_

I performed Google's _PageSpeed Insights_ benchmark (simulating a slow 4G network) about 20 times for each page and picked the highest score.
<br>
These are the results:

![Next.js Benchmark](images/nextjs-benchmark.png)
![Client-side Rendering Benchmark](images/client-side-rendering-benchmark.png)

As it turns out, performance is **not** a default in Next.js.

_Note that this benchmark only tests the first load of the page, without even considering how the app performs when it is fully cached (where our SWR implementation really shines)._

## Areas for Improvement

- Compress assets using _[Brotli level 11](https://d33wubrfki0l68.cloudfront.net/3434fd222424236d1f0f5b4596de1480b5378156/1a5ec/assets/wp-content/uploads/2018/07/compression_estimator_jquery.jpg)_ (Cloudflare only uses level 4 to save on computing resources).
- Use the paid _[Cloudflare Argo](https://blog.cloudflare.com/argo)_ service for even better response times.

# SEO

## Indexing

### Google

It is often said that Google is having trouble properly crawling CSR (JS) apps.
<br>
That might have been the case in 2018, but as of 2022, Google crawls CSR apps almost flawlessly.
<br>
The indexed pages will have a title, description and content, as long as we remember to dynamically set them (either manually or using something like _[react-helmet](https://www.npmjs.com/package/react-helmet)_).

The following video explains how the new Googlebot renders JS apps:
<br>
https://www.youtube.com/watch?v=Ey0N1Ry0BPM

However, since Googlebot tries to save on computing power, there might be cases where it would take a snapshot of the page before its dynamic data finishes loading.
<br>
So in order to achieve perfect SEO results, we better not entirely rely on its ability to crawl JS apps.

### Prerendering

Other search engines such as Bing cannot render JS (despite claiming they can). So in order to have them crawl our app properly, we will serve them **prerendered** versions of our pages.
<br>
Prerendering is the act of crawling web apps in production (using headless Chromium) and generating a complete HTML file (with data) for each page.

We have two options when it comes to prerendering:

1. We can use a dedicated service such as _[prerender.io](https://prerender.io)_.

![Prerender.io Table](images/prerender-io-table.png)

2. We can deploy our own prerender server using free open-source tools such as _[Prerender](https://github.com/prerender/prerender)_ (a fully working example can be found _[here](https://github.com/theninthsky/prerender-server)_).

Then we redirect web crawlers (identified by their `User-Agent` header string) to our prerendered pages using a Cloudflare worker (in the following example we redirect to _prerender.io_):

_[public/\_worker.js](public/_worker.js)_

```js
const BOT_AGENTS = ['googlebot', 'bingbot', 'yandex', 'twitterbot', 'whatsapp', ...]

const fetchPrerendered = async request => {
  const { url, headers } = request
  const prerenderUrl = `https://service.prerender.io/${url}`
  const headersToSend = new Headers(headers)

  headersToSend.set('X-Prerender-Token', YOUR_PRERENDER_TOKEN)

  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
    redirect: 'manual'
  })

  const { status, body } = await fetch(prerenderRequest)

  return new Response(body, { status })
}

export default {
  fetch(request, env) {
    const pathname = new URL(request.url).pathname.toLowerCase()
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase()

    if (BOT_AGENTS.some(agent => userAgent.includes(agent)) && !pathname.includes('.')) return fetchPrerendered(request)

    return env.ASSETS.fetch(request)
  }
}

```

_Prerendering_, also called _Dynamic Rendering_, is encouraged by _[Google](https://developers.google.com/search/docs/advanced/javascript/dynamic-rendering)_ and _[Microsoft](https://blogs.bing.com/webmaster/october-2018/bingbot-Series-JavaScript,-Dynamic-Rendering,-and-Cloaking-Oh-My)_.

Using prerendering produces the **exact same** SEO results as using SSR in all search engines.

https://www.google.com/search?q=site:https://client-side-rendering.pages.dev

![Google Search Results](images/google-search-results.png)
![Google Lorem Ipsum Search Results](images/google-lorem-ipsum-search-results.png)

https://www.bing.com/search?q=site%3Ahttps%3A%2F%2Fclient-side-rendering.pages.dev

![Bing Search Results](images/bing-search-results.png)

In addition, cached pages will have unbelievably low response times, which might positively affect their SEO score.

_Note that if you are using CSS-in-JS, you should [disable the speedy optimization](src/utils/disable-speedy.ts) during prerendering in order to have your styles omitted to the DOM._

### Social Media Share Previews

When we share a CSR app link in social media, we can see that no matter what page we link to, the preview will remain the same.
<br>
This happens because most CSR apps have only one HTML file, and social share previews do not render JS.
<br>
This is where prerendering comes to our aid once again, we only need to make sure to set the correct meta tags dynamically:

_[Home.jsx](src/pages/Home.jsx)_

```js
const Home = props => {
  return (
    <Meta
      title="Client-side Rendering"
      description="This page demonstrates a large amount of components that are rendered on the screen."
      image={`${window.location.origin}/icons/og-icon.png`}
    />
    .
    .
    .
  )
}
```

The `Meta` component can be found [here](https://github.com/theninthsky/frontend-essentials/blob/main/src/components/Meta.tsx).

This, after going through prerendering, gives us the correct preview for every page:

![Facebook Preview Home](images/facebook-preview-home.png)
<br>
![Facebook Preview Pokemon](images/facebook-preview-pokemon.png)
<br>
![Facebook Preview Pokemon Info](images/facebook-preview-pokemon-info.png)

## Sitemaps

In order to make all of our app pages discoverable to search engines, we should create a `sitemap.xml` file which specifies all of our website routes.

Since we already have a centralized _[pages-manifest.json](src/pages-manifest.json)_ file, we can easily generate a sitemap during build time:

_[create-sitemap.mjs](scripts/create-sitemap.mjs)_

```js
import { Readable } from 'stream'
import { writeFile } from 'fs/promises'
import { SitemapStream, streamToPromise } from 'sitemap'

import pagesManifest from '../src/pages-manifest.json' assert { type: 'json' }

const stream = new SitemapStream({ hostname: 'https://client-side-rendering.pages.dev' })
const links = pagesManifest.map(({ path }) => ({ url: path, changefreq: 'daily' }))

streamToPromise(Readable.from(links).pipe(stream))
  .then(data => data.toString())
  .then(res => writeFile('public/sitemap.xml', res))
  .catch(console.log)
```

This will emit the following sitemap:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
   <url>
      <loc>https://client-side-rendering.pages.dev/</loc>
      <changefreq>daily</changefreq>
   </url>
   <url>
      <loc>https://client-side-rendering.pages.dev/lorem-ipsum</loc>
      <changefreq>daily</changefreq>
   </url>
   <url>
      <loc>https://client-side-rendering.pages.dev/pokemon</loc>
      <changefreq>daily</changefreq>
   </url>
</urlset>
```

We can manually submit our sitemap to _[Google Search Console](https://search.google.com/search-console)_ and _[Bing Webmaster Tools](https://www.bing.com/webmasters)_.

# CSR vs. SSR

## SSR Disadvantages

Here's a list of some SSR drawbacks to consider:

- Server-side data fetching might be a bad idea in many cases, since some queries may take several hundreds of milliseconds to return (many will exceed that), and while pending, the user sees **absolutely nothing** in their browser.
- When using client-side data fetching, SSR will **always** be slower than CSR, since its document is always bigger and takes longer to download. In addition, all web crawlers (except for Googlebot) will index the page without its data.
- Streaming SSR also has _[some major drawbacks](https://remix.run/blog/react-server-components#zero-bundle-or-infinite-bundle)_.
- SSR apps are always heavier than CSR apps, since every page is composed of both a fully-constructed HTML document and its scripts (used for hydration).
- Since all images are initially included in the document, scripts and images will compete for bandwidth, causing delayed interactivity on slow networks.
- Since accessing browser-related objects during the server render phase throws an error, some very helpful tools become unusable, while others (such as _[react-media](https://www.npmjs.com/package/react-media#server-side-rendering-ssr)_) require SSR-specific customizations.
- SSR pages cannot respond with a _[304 Not Modified](https://blog.hubspot.com/marketing/http-304-not-modified#:~:text=An%20HTTP%20304%20not%20modified%20status%20code%20means%20that%20the,to%20speed%20up%20page%20delivery)_ status.

## Why Not SSG?

We have seen the advantages of static files: they are cacheable; a _304 Not Modified_ status can be returned for them; they can be served from a nearby CDN and serving them doesn't require a Node.js server.

This may lead us to believe that SSG combines both CSR and SSR advantages: we can make our app visually appear very fast (_[FCP](https://web.dev/fcp)_) and it will even be interactive very quickly.

However, in reality, SSG has one major limitation:
<br>
Since JS isn't active during the first moments, everything that relies on JS to be presented simply won't be visible, or it will be visible in its incorrect state (like components which rely on the `window.matchMedia` function to be displayed).

A classic example of this problems is demonstrated by the following website:
<br>
https://death-to-ie11.com

Notice how the timer isn't available right away? that's because its generated by JS, which takes time to download and execute.

We can also see that refreshing Next.js's [Accessibility page](https://nextjs.org/docs/accessibility) introduces a layout shift in the menu. This is caused by the fact that the static HTML doesn't know which section is selected (or some similar reason) until JS is loaded.

Another example for this is JS animations - they would first appear static and start animating only when JS is loaded.

There are various examples of how this delayed functionality negatively impacts the user experience, like the way some websites only show the navigation bar after JS has been loaded (since they cannot access the Local Storage to check if it has a user info entry).

Another issue which can be especially critical for E-commere websites is that SSG pages might reflect outdated data (a product's price or availability for example).

## The Cost of Hydration

It is a fact that under fast internet connection, both CSR and SSR perform great (as long as they are both optimized). And the higher the connection speed - the closer they get in terms of loading times.

However, when dealing with slow connections (such as mobile networks), it seems that SSR has an edge over CSR regarding loading times.
<br>
Since SSR apps are rendered on the server, the browser receives the fully-constructed HTML file, and so it can show the page to the user without waiting for JS to download. When JS is eventually download and parsed, the framework is able to "hydrate" the DOM with functionality (without having to reconstruct it).

Although it seems like a big advantage, this behaviour has one major flaw on slow connections - until JS is loaded, users can click wherever they desire but the app won't react to their interactions.
<br>
It is a bad user experience when buttons don't respond to user interaction, but it becomes a much larger problem when default events are not being prevented.

This is a comparison between Next.js's website and Client-side Rendering app on a fast 3G connection:

![SSR Load 3G](images/ssr-load-3g.gif)
![CSR Load 3G](images/csr-load-3g.gif)

What happened here?
<br>
Since JS hasn't been loaded yet, Next.js's website could not prevent the default behaviour of anchor tags to navigate to another page, resulting in every click on them triggering a full page reload.
<br>
And the slower the connection is - the more severe this issue becomes.
<br>
In other words, where SSR should have had a performance edge over CSR, we see a very "dangerous" behavior that might degrade the user experience.

It is impossible for this issue to occur in CSR apps, since the moment they render - JS has already been fully loaded.

# Conclusion

We saw that client-side rendering performance is on par and sometimes even better than SSR in terms of loading times.
<br>
We also learned that prerendering produces perfect SEO results, and that we don't even need to think about it once it is set up.
<br>
And above all - we have achieved all this mainly by modifiying 2 files (Webpack config and HTML template) and using a prerender service, so every existing CSR app should be able to quickly and easily implement these modifications and benefit from them.

These facts lead to the conclusion that there is no particular reason to use SSR, it would only add a lot of complexity and limitations to our project and degrade the developer experience.

## What Might Change in the Future

As time passes, [connection speed is getting faster](https://worldpopulationreview.com/country-rankings/internet-speeds-by-country) and end-user devices get stronger. So the performance differences between all possible website rendering methods are guarenteed to be mitigated even further.

There are some new SSR methods (such as Streaming SSR with Server Components) and frameworks (such as Marko and Qwik) which pretend to reduce the inital JS that has to be downloaded.

Nevertheless, it's important to note that nothing makes pages load faster than the SWR approach, which is only possible through client-side rendering.
