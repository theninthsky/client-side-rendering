<h1 align="center">Client-side Rendering</h1>

This project is a case study of CSR, it explores the potential of client-side rendered apps compared to server-side rendering.

To use this project as a production-ready boilerplate, refer to the _[BOILTERPLATE.md](BOILERPLATE.md)_ instruction file.

### Legend

**CSR**: Client-side Rendering
<br>
**SSR**: Server-side Rendering
<br>
**SSG**: Static Site Generation

An in-depth comparison of all rendering methods can be found on this project's _Comparison_ page: https://client-side-rendering.pages.dev/comparison

## Table of Contents

- [Intro](#intro)
- [Motivation](#motivation)
- [Performance](#performance)
  - [Bundle Size](#bundle-size)
  - [Caching](#caching)
  - [Code Splitting](#code-splitting)
  - [Preloading Async Pages](#preloading-async-pages)
  - [Splitting Async Vendors](#splitting-async-vendors)
  - [Preloading Data](#preloading-data)
  - [Precaching Async Pages](#precaching-async-pages)
  - [Dynamic Source Inlining](#dynamic-source-inlining)
  - [Tweaking Further](#tweaking-further)
    - [Transitioning Async Pages](#transitioning-async-pages)
    - [Preloading Other Pages Data](#preloading-other-pages-data)
    - [Revalidating Active Apps](#revalidating-active-apps)
    - [Generating Static Data](#generating-static-data)
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

**Client-side rendering** is the practice of sending the web browser static assets and leaving it to perform the entire rendering process of the app.
<br>
**Server-side rendering** is the practice of rendering the entire app (or page) on the server, sending to the browser a pre-rendered HTML document ready to be displayed.
<br>
**Static Site Generation** is the practice of pre-generating HTML pages as static assets to be sent and displayed by the browser.

Contrary to popular belief, the SSR process of modern frameworks such as React, Angular, Vue and Svelte, makes the app render twice: one time on the server and another time on the browser (this is called "hydration"). Without the latter, the app will not be interactive and would just act as a "lifeless" web page.
<br>
The hydration process doesn't seem to be any faster than a normal render (excluding the painting procedure of course).
<br>
Needless to say that SSG apps have to be "hydrated" aswell.

The HTML document is fully constucted in both SSR and SSG, which gives them the following advantages:

1. Web crawlers will be able to crawl their pages out-of-the-box, which is critical for SEO.
2. The _[FCP](https://web.dev/fcp)_ of the page is usually very good (in SSR it heavily depends on the API server response times).

On the other hand, CSR apps have the following advantages:

1. The app itself is completely decoupled from the server, which means it loads without being affected by the API server's response times, allowing for seemless page transitions.
2. The developer experience is seemless, there is no need to pay attention to which pieces of code will run on the server and which will run in the browser.

In this case-study, we will focus on CSR and how to overcome its (seemingly) inherent shortages while leaveraging its strong points.

Each optimization will be included in the deployed app that can be found here: https://client-side-rendering.pages.dev

# Motivation

_"Recently, SSR (Server Side Rendering) has taken the JavaScript front-end world by storm. The fact that you can now render your sites and apps on the server before sending them to your clients is an absolutely **revolutionary** idea (and totally not what everyone was doing before JS client-side apps got popular in the first place...)._

_However, the same criticisms that were valid for PHP, ASP, JSP, (and such) sites are valid for server-side rendering today. It's slow, breaks fairly easily, and is difficult to implement properly._

_Thing is, despite what everyone might be telling you, you probably don't need SSR. You can get almost all the advantages of it (without the disadvantages) by using prerendering."_

_~[Prerender SPA Plugin](https://github.com/chrisvfritz/prerender-spa-plugin#what-is-prerendering)_

Over the last few years, server-side rendering has started to (re)gain popularity in the form of frameworks such as _[Next.js](https://nextjs.org)_ and _[Remix](https://remix.run)_ to the point that developers just start working with them as a default, without understanding their limitations and even in apps which do not require SEO at all (like those who have a login requirement).
<br>
While SSR has some advantages, these frameworks keep emphasizing how fast they are (_"Performance as a default"_), implying client-side rendering is slow.
<br>
In addition, it is a common misconception that perfect SEO can only be achieved by using SSR, and that there's nothing we can do to improve the way search engines crawl CSR apps.

Another claim that is often raised regarding the advantages of SSR is that web apps are getting bigger, and so their loading times will only keep increasing (which means bad _[FCP](https://web.dev/fcp)_ for CSR apps).

While it’s true that apps are naturally expanding, the size of a single page should only **get smaller** as time passes.
<br>
This is due to a popular trend of making smaller and more efficient versions of packages, as seen with _zustand_, _day.js_, _headless-ui_ and _react-router v6_.
<br>
It can also be observed in the decreasing sizes of frameworks in correlation with their release dates: Angular (74.1kb), React (44.5kb), Vue (34kb), Solid (7.6kb) and Svelte (1.7kb).
<br>
These packages consist the most of a web page’s scripts weight.
<br>
And so, when properly utilizing code-splitting, the initial loading time of a single page might even **decrease** over time.

This project implements a basic CSR app with some tweaks such as code-splitting and preloading, with the ambition that as the app scales, the loading time of a single page would mostly remain unaffected.
The objective is to simulate the number of packages used in a production grade app and try to decrease its loading time as much as possible, mostly by parallelizing requests.

It is important to note that improving performance should not come at the expense of the developer experience, so the way this project is architected should vary only slightly compared to "normal" react projects, and it won't be as extremely opinionated as Next.js (or as limiting as SSR is in general).

This case study will cover two major aspects: performance and SEO. We will see how we can achieve top scores in both of them.

_Note that while this project is implemented with React, the vast majority of its tweaks are not tied to any framework and are purely based on the bundler and the web browser._

# Performance

We will assume a standard Webpack 5 setup and add the required customizations as we progress.
<br>
Most of the code changes that we'll go throught will be in the _[webpack.config.js](webpack.config.js)_ configuration file and the _[index.js](public/index.js)_ HTML template.

### Bundle Size

The first rule of thumb is to use as fewer dependencies as possible, and among those, to select the ones with smaller filesize.

For example:
<br>
We can use _[day.js](https://www.npmjs.com/package/dayjs)_ instead of _[moment](https://www.npmjs.com/package/moment)_, _[zustand](https://www.npmjs.com/package/zustand)_ instead of _[redux toolkit](https://www.npmjs.com/package/@reduxjs/toolkit)_ etc.

This is crucial not only for CSR apps, but also for SSR (and SSG) apps, since the bigger our bundle is - the longer it will take the page to be visible or interactive.

### Caching

Ideally, every hashed file should be cached, and `index.html` should **never** be cached.
<br>
It means that the browser would initially cache `main.[hash].js` and would have to redownload it only if its hash (content) changes:

![Network Bundled](images/network-bundled.png)

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
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors'
      }
    }
  }
}
```

This will create a `vendors.[hash].js` file:

![Network Vendors](images/network-vendors.png)

Although this is a substantial improvement, what would happen if we updated a very small dependency?
<br>
In such case, the entire vendors chunk's cache will invalidate.

So, in order to improve it even further, we will split **each dependency** to its own hashed chunk:

_[webpack.config.js](webpack.config.js)_

```diff
- name: 'vendors'
+ name: module => {
+  const moduleName = (module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]
+
+  return moduleName.replace('@', '')
+ }
```

This will create files like `react-dom.[hash].js` which contain a single big vendor and a `[id].[hash].js` file which contains all the remaining (small) vendors:

![Network Split Vendors](images/network-split-vendors.png)

More info about the default configurations (such as the split threshold size) can be found here:
<br>
https://webpack.js.org/plugins/split-chunks-plugin/#defaults

This approach will also ensure a much better _[code caching](https://v8.dev/blog/code-caching-for-devs)_ persistence.

### Code Splitting

A lot of the features we write end up being used only in a few of our pages, so we would like them to be loaded only when the user visits the page they are being used in.

For Example, we wouldn't want users to have to wait until the _[react-big-calendar](https://www.npmjs.com/package/react-big-calendar)_ package is downloaded, parsed and executed if they merely loaded the _Home_ page. We would only want that to happen when they visit the _Calendar_ page.

The way we can achieve this is (preferably) by route-based code splitting:

_[App.tsx](src/App.tsx)_

```js
const Home = lazy(() => import(/* webpackChunkName: 'home' */ 'pages/Home'))
const LoremIpsum = lazy(() => import(/* webpackChunkName: 'lorem-ipsum' */ 'pages/LoremIpsum'))
const Pokemon = lazy(() => import(/* webpackChunkName: 'pokemon' */ 'pages/Pokemon'))
```

So when users visit the _Pokemon_ page, they only download the main chunk scripts (which includes all shared dependencies such as the framework) and the `pokemon.[hash].js` chunk.

_Note: it is encouraged to download the entire app so that users will experience instant, app-like, navigations. But it is a bad idea to batch all assets into a single script, delaying the first render of the page.
<br>
These assets should be downloaded asynchronously and only after the user-requested page has finished rendering and is entirely visible._

### Preloading Async Pages

Code splitting has one major flaw - the runtime doesn't know which async chunks are needed until the main script executes, leading to them being fetched in a significant delay (since they make another round-trip to the CDN):

![Network Code Splitting](images/network-code-splitting.png)

The way we can solve this issue is by implementing a script in the document that will be responsible for preloading relevant assets:

_[webpack.config.js](webpack.config.js)_

```js
import pagesManifest from './src/pages-manifest.js'
import htmlTemplate from './public/index.js'
.
.
.
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

_[public/index.js](public/index.js)_

```js
import { join } from 'node:path'
import { readFileSync } from 'node:fs'

const __dirname = import.meta.dirname

export default pages => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="theme-color" content="#1e90ff">
      <meta name="google-site-verification" content="VizFjhwWDUBYMsq1bJtp6N2NPjz8sLdGH1513MlrytU" />

      <link rel="shortcut icon" href="/icons/favicon.ico">
      <link rel="manifest" href="/manifest.json">
      <link rel="preload" href="/fonts/montserrat.woff2" as="font" type="font/woff2" crossorigin>

      <title>Client-side Rendering</title>

      <script>
        const pages = ${JSON.stringify(pages)}

        ${readFileSync(join(__dirname, '..', 'scripts', 'preload-assets.js'))}
      </script>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
`
```

_[scripts/preload-assets.js](scripts/preload-assets.js)_

```js
const isMatch = (pathname, path) => {
  if (pathname === path) return { exact: true, match: true }
  if (!path.includes(':')) return { match: false }

  const pathnameParts = pathname.split('/')
  const pathParts = path.split('/')
  const match = pathnameParts.every((part, ind) => part === pathParts[ind] || pathParts[ind]?.startsWith(':'))

  return {
    exact: match && pathnameParts.length === pathParts.length,
    match
  }
}

const preloadAssets = () => {
  let { pathname } = window.location

  if (pathname !== '/') pathname = pathname.replace(/\/$/, '')

  const matchingPages = pages.map(page => ({ ...isMatch(pathname, page.path), ...page })).filter(({ match }) => match)

  if (!matchingPages.length) return

  const { path, script } = matchingPages.find(({ exact }) => exact) || matchingPages[0]

  document.head.appendChild(
    Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
  )
}

preloadAssets()
```

The imported `pages-manifest` file can be found [here](src/pages-manifest.js).

_Please note that other types of assets can be preloaded the same way (like stylesheets)._

This way, the browser is able to fetch the page-related script chunk **in parallel** with render-critical assets:

![Network Async Chunks Preload](images/network-async-chunks-preload.png)

### Splitting Async Vendors

Code splitting introduces another problem: async vendor duplication.

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
      vendors: {
        test: /[\\/]node_modules[\\/]/,
+       chunks: 'all',
        name: ({ context }) => (context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1].replace('@', '')
      }
    }
  }
}
```

Now both `lorem-ipsum.[hash].js` and `pokemon.[hash].js` will use the extracted `moment.[hash].js` chunk, sparing the user a lot of network traffic (and giving these assets better cache persistence).

However, we have no way of telling which async vendor chunks will be split before we build the application, so we wouldn't know which async vendor chunks we need to preload (refer to the "Preloading Async Chunks" section):

![Network Split Async Vendors](images/network-split-async-vendors.png)

That's why we will append the chunks names to the async vendor's name:

_[webpack.config.js](webpack.config.js)_

```diff
optimization: {
  runtimeChunk: 'single',
  splitChunks: {
    chunks: 'initial',
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        chunks: 'all',
-       name: ({ context }) => (context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1].replace('@', '')
+       name: (module, chunks) => {
+         const allChunksNames = chunks.map(({ name }) => name).join('.')
+         const moduleName = (module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]

+         return `${moduleName}.${allChunksNames}`.replace('@', '')
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
      const pages = pagesManifest.map(({ chunk, path }) => {
-       const script = assets.find(name => name.includes(`/${chunk}.`) && name.endsWith('.js'))
+       const scripts = assets.filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

-       return { path, script }
+       return { path, scripts }
      })

      return htmlTemplate(pages)
    }
  })
]
```

_[scripts/preload-assets.js](scripts/preload-assets.js)_

```diff
- const { path, script } = matchingPages.find(({ exact }) => exact) || matchingPages[0]
+ const { path, scripts } = matchingPages.find(({ exact }) => exact) || matchingPages[0]

+ scripts.forEach(script => {
    document.head.appendChild(
      Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
    )
+ })
```

Now all async vendor chunks will be fetched in parallel with their parent async chunk:

![Network Split Async Vendors Preload](images/network-split-async-vendors-preload.png)

### Preloading Data

One of the presumed disadvantages of CSR over SSR is that the page's data (fetch requests) will be fired only after JS has been downloaded, parsed and executed in the browser:

![Network Data](images/network-data.png)

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

-       return { path, script }
+       return { path, script, data }
      })

      return htmlTemplate(pages)
    }
  })
]
```

_[public/index.js](public/index.js)_

```diff
<script>
- const pages = ${JSON.stringify(pages)}
+ const pages = ${JSON.stringify(pages, (_, value) => {
+   return typeof value === 'function' ? `func:${value.toString()}` : value
+ })}

  ${readFileSync(join(__dirname, '..', 'scripts', 'preload-assets.js'))}
</script>
```

_[scripts/preload-assets.js](scripts/preload-assets.js)_

```diff
.
.
.
+ const getDynamicProperties = (pathname, path) => {
+   const pathParts = path.split('/')
+   const pathnameParts = pathname.split('/')
+   const dynamicProperties = {}
+
+   for (let i = 0; i < pathParts.length; i++) {
+     if (pathParts[i].startsWith(':')) dynamicProperties[pathParts[i].slice(1)] = pathnameParts[i]
+   }
+
+   return dynamicProperties
+ }

const preloadAssets = () => {
-   const { path, scripts } = matchingPages.find(({ exact }) => exact) || matchingPages[0]
+   const { path, scripts, data } = matchingPages.find(({ exact }) => exact) || matchingPages[0]
    .
    .
    .
+   data?.forEach(({ url, crossorigin, preconnectURL }) => {
+     if (url.startsWith('func:')) url = eval(url.replace('func:', ''))
+     const fullURL = typeof url === 'string' ? url : url(getDynamicProperties(pathname, path))
+
+     document.head.appendChild(
+       Object.assign(document.createElement('link'), {
+         rel: 'preload',
+         href: fullURL,
+         as: 'fetch',
+         crossOrigin: crossorigin
+       })
+     )
+
+     if (preconnectURL) {
+       document.head.appendChild(
+         Object.assign(document.createElement('link'), { rel: 'preconnect', href: preconnectURL })
+       )
+     }
+   })
}
```

Reminder: the `pages-manifest` file can be found [here](src/pages-manifest.js).

Now we can see that the data is being fetched right away:

![Network Data Preload](images/network-data-preload.png)

With the above script, we can even preload dynamic routes data (such as _[pokemon/:name](https://client-side-rendering.pages.dev/pokemon/pikachu)_).

The only limitation is that we can only preload GET resources. However, we can easily implement an endpoint that transforms GET requests with query params to POST requests with body.
<br>
Here's an example of such transform proxy as a Cloudflare Worker:

```js
export default {
  async fetch(request, env) {
    const { pathname, searchParams } = new URL(request.url)
    const headers = new Headers(request.headers)
    const body = Object.fromEntries(
      [...searchParams.entries()].map(([key, value]) => {
        try {
          value = JSON.parse(value)
        } catch (err) {}

        return [key, value]
      })
    )

    headers.set('Content-Type', 'application/json')

    return await fetch(new Request(pathname.slice(1), { method: 'post', headers, body: JSON.stringify(body) }))
  }
}
```

The worker above will transform the following request:

```
[GET] https://my-transform-proxy.com/https://my-server-url.com/posts?title=Test&description=A test request
```

to:

```
[POST] https://my-server-url.com/posts

{
  "title": "Test",
  "description": "A test request"
}
```

_Note that in order for the preload to work, the server has to send a `Cache-Control` header with a `max-age` of at least a few seconds._

### Precaching Async Pages

Users should have a smooth navigation experience in our app.
<br>
However, splitting every page causes a noticeable delay in navigation, since every page has to be downloaded (on-demand) before it can be rendered on screen.

We would want to prefetch and cache all pages ahead of time.

We can do this by writing a simple service worker:

_[webpack.config.js](webpack.config.js)_

```js
plugins: [
  ...(production
    ? [
        new InjectManifest({
          include: [/fonts\//, /scripts\/.+\.js$/],
          swSrc: path.join(__dirname, 'public', 'precache-service-worker.js')
        })
      ]
    : [])
]
```

_[service-worker-registration.ts](src/utils/service-worker-registration.ts)_

```js
const register = () => {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/precache-service-worker.js')

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

_[public/precache-service-worker.js](public/precache-service-worker.js)_

```js
const CACHE_NAME = 'my-csr-app'

const allAssets = self.__WB_MANIFEST.map(({ url }) => url)

const getCache = () => caches.open(CACHE_NAME)

const getCachedAssets = async cache => {
  const keys = await cache.keys()

  return keys.map(({ url }) => `/${url.replace(self.registration.scope, '')}`)
}

const precacheAssets = async ({ ignoreAssets }) => {
  const cache = await getCache()
  const cachedAssets = await getCachedAssets(cache)
  const assetsToPrecache = allAssets.filter(asset => !cachedAssets.includes(asset) && !ignoreAssets.includes(asset))

  await cache.addAll(assetsToPrecache)
}

const removeUnusedAssets = async () => {
  const cache = await getCache()
  const cachedAssets = await getCachedAssets(cache)

  cachedAssets.forEach(asset => {
    if (!allAssets.includes(asset)) cache.delete(asset)
  })
}

const handleFetch = async request => {
  const cache = await getCache()
  const cachedResponse = await cache.match(request)

  return cachedResponse || fetch(request)
}

self.addEventListener('install', () => {
  self.skipWaiting()

  precacheAssets()
  removeUnusedAssets()
})

self.addEventListener('fetch', async event => {
  if (['font', 'script'].includes(event.request.destination)) {
    event.respondWith(handleFetch(event.request))
  }
})
```

Now all pages will be prefetched and cached before the user even tries to navigate to them.

## Dynamic Source Inlining

When inspecting our 43kb `react-dom.js` file, we can see that the time it took for the request to return was 60ms while the time it took to download the file was 3ms:

![CDN Response Time](images/cdn-response-time.png)

This demonstrates the well-known fact that [RTT](https://en.wikipedia.org/wiki/Round-trip_delay) has a huge impact on web pages load times, sometimes even more than download speed, and even when assets are served from a nearby CDN edge like in our case.

Additionally and more importantly, we can see that after the HTML file is downloaded, we have a large timespan where the browser stays idle and just waits for the scripts to download:

![Browser Idle Period](images/browser-idle-period.png)

This is a lot of precious time (marked in red) that the browser could use to execute scripts and speed up the page's visibility and interactivity.
<br>
This inefficiency will reoccur frequently when some of the cache invalidates. It is not something that only happens in the very first page load.

So how can we eliminate this idle time?
<br>
We could inline all the initial (critical) scripts in the document, so that they will start to download, parse and execute until the async page assets arrive:

![Inlined Initial Scripts](images/inlined-initial-scripts.png)

We can see that the browser now gets its initial scripts without having to send another request to the CDN. And since the HTML file is streamed sequentially, the browser will execute the scripts as soon as it gets them, without having to wait for the entire file to download.
<br>
So the browser will first send requests for the async chunks and the preloaded data, and while these are pending, it will continue to download and execute the main scripts.
<br>
We can see that the async chunks start to download (marked in blue) right after the HTML file finishes downloading, parsing and executing, which saves a lot of time.

While this change is making a significant difference on fast networks, it is even more crucial for slower networks, where the delay is larger and the RTT is much more impactful.

However, this solution has 2 major issues:

1. We wouldn’t want users to download the 100kb+ HTML file every time they visit our app. We only want that to happen for the very first visit.
2. Since we do not inline the async page’s assets as well, we would probably still be waiting for them to fetch even after the entire HTML has finished downloading, parsing and executing.

To overcome thses issues, we can no longer stick to a static HTML file, and so we shall leaverage the power of a server. Or, more precisely, the power of a Cloudflare serverless worker.
<br>
This worker should intercept every HTML document request and tailor a response that fits it perfectly.

The entire flow should be described as follows:

1. The browser sends an HTML document request to the Clouflare worker.
2. The Clouflare worker checks for the existence of an `X-Cached` header in the request.
   If such header exists, it will iterate over its values and inline only the relevant* assets that are absent from it in the response.
   If such header doesn't exist, it will inline all the relevant* assets in the response.
3. The app will then extract all of the inlined assets, cache them in a service worker and then precache all of the other assets.
4. The next time the page is reloaded, the service worker will send the HTML document along with an `X-Cached` header specifying all of its cached assets.

\* Both initial and page-specefic assets.

This ensures that the browser receives exactly the assets it needs (no more, no less) to display the page **in a single roundtrip**!

_[webpack.config.js](webpack.config.js)_

```js
plugins: [
  new HtmlPlugin({
    scriptLoading: 'module',
    templateContent: ({ compilation }) => {
      const assets = compilation.getAssets()
      const pages = pagesManifest.map(({ chunk, path, data }) => {
        const scripts = assets
          .map(({ name }) => name)
          .filter(name => new RegExp(`[/.]${chunk}\\.(.+)\\.js$`).test(name))

        return { path, scripts, data }
      })

      if (production) {
        const assetsWithSource = assets
          .filter(({ name }) => /^scripts\/.+\.js$/.test(name))
          .map(({ name, source }) => ({
            url: `/${name}`,
            source: source.source(),
            parentPaths: pages.filter(({ scripts }) => scripts.includes(name)).map(({ path }) => path)
          }))

        writeFileSync(join(__dirname, 'public', 'assets.js'), JSON.stringify(assetsWithSource))
      }

      return htmlTemplate(pages)
    }
  })
]
```

_[scripts/inject-worker-html.js](scripts/inject-worker-html.js)_

```js
import { join } from 'node:path'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'

const __dirname = import.meta.dirname

const assets = readFileSync(join(__dirname, '..', 'public', 'assets.js'), 'utf-8')
let html = readFileSync(join(__dirname, '..', 'build', 'index.html'), 'utf-8')
let worker = readFileSync(join(__dirname, '..', 'build', '_worker.js'), 'utf-8')

html = html
  .replace(/,"scripts":\s*\[(.*?)\]/g, () => '')
  .replace(/scripts\.forEach[\s\S]*?data\?\.\s*forEach/, () => 'data?.forEach')
  .replace(/preloadAssets/g, () => 'preloadData')

worker = worker.replace('INJECT_ASSETS_HERE', () => assets).replace('INJECT_HTML_HERE', () => JSON.stringify(html))

rmSync(join(__dirname, '..', 'public', 'assets.js'))
writeFileSync(join(__dirname, '..', 'build', '_worker.js'), worker)
```

_[public/\_worker.js](public/_worker.js)_

```js
const allAssets = INJECT_ASSETS_HERE
const html = INJECT_HTML_HERE

const isMatch = (pathname, path) => {
  if (pathname === path) return { exact: true, match: true }
  if (!path.includes(':')) return { match: false }

  const pathnameParts = pathname.split('/')
  const pathParts = path.split('/')
  const match = pathnameParts.every((part, ind) => part === pathParts[ind] || pathParts[ind]?.startsWith(':'))

  return {
    exact: match && pathnameParts.length === pathParts.length,
    match
  }
}

export default {
  fetch(request, env) {
    const pathname = new URL(request.url).pathname.toLowerCase()
    const nonDocument = pathname.includes('.')

    if (nonDocument) return env.ASSETS.fetch(request)

    const headers = { 'Content-Type': 'text/html; charset=utf-8' }
    const cachedAssets = request.headers.get('X-Cached')?.split(', ').filter(Boolean) || []
    const uncachedAssets = allAssets.filter(({ url }) => !cachedAssets.includes(url))

    if (!uncachedAssets.length) return new Response(html, { headers })

    let body = html

    uncachedAssets.forEach(({ url, source }) => {
      body = body.replace(
        `<script type="module" src="${url}"></script>`,
        () => `<script id="${url}" type="module">${source}</script>`
      )
    })

    const matchingPageAssets = allAssets
      .map(asset => {
        const parentsPaths = asset.parentPaths.map(path => ({ path, ...isMatch(pathname, path) }))
        const parentPathsExactMatch = parentsPaths.some(({ exact }) => exact)
        const parentPathsMatch = parentsPaths.some(({ match }) => match)

        return { ...asset, exact: parentPathsExactMatch, match: parentPathsMatch }
      })
      .filter(({ match }) => match)
    const exactMatchingPageAssets = matchingPageAssets.filter(({ exact }) => exact)
    const pageAssets = exactMatchingPageAssets.length ? exactMatchingPageAssets : matchingPageAssets
    const uncachedPageAssets = pageAssets.filter(({ url }) => !cachedAssets.includes(url))

    uncachedPageAssets.forEach(({ url, source }) => {
      body = body.replace('</head>', () => `<script id="${url}" type="module">${source}</script></head>`)
    })

    return new Response(body, { headers })
  }
}
```

The results for an initial (uncached) load are exceptional:

![Inlined Scripts](images/inlined-scripts.png)
![Inlined Scripts CDN Response Time](images/inlined-scripts-cdn-response-time.png)

On the next load, the Cloudflate worker responds with a minimal (1.8kb) HTML document and all assets are immediately served from cache.

## Tweaking Further

### Transitioning Async Pages

_Note: requires React (v18), Svelte or Solid.js_

When we split a page from the main app, we separate its render phase, meaning the app will render before the page renders.
<br>
So when we move from one async page to another, we see a blank space that remains until the page is rendered:

![Before Page Render](images/before-page-render.png)
![After Page Render](images/after-page-render.png)

This happens due to the common approach of wrapping only the routes with Suspense:

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

React 18 introduced us to the `useTransition` hook, which allows us to delay a render until some criteria are met.
<br>
We will use this hook to delay the page's navigation until it is ready:

_[useTransitionNavigate.ts](https://github.com/theninthsky/frontend-essentials/blob/main/src/hooks/useTransitionNavigate.ts)_

```js
import { useTransition } from 'react'
import { useNavigate } from 'react-router-dom'

const useTransitionNavigate = () => {
  const [, startTransition] = useTransition()
  const navigate = useNavigate()

  return (to, options) => startTransition(() => navigate(to, options))
}

export default useTransitionNavigate
```

_[NavigationLink.tsx](src/components/NavigationLink.tsx)_

```js
const NavigationLink = ({ to, onClick, children }) => {
  const navigate = useTransitionNavigate()

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

### Preloading Other Pages Data

We can preload other pages data when hovering over links (desktop) or when links enter the viewport (mobile):

_[NavigationLink.tsx](src/components/NavigationLink.tsx)_

```js
const preload = ({ url, as = 'fetch', crossorigin }) => {
  const preloadElement = document.head.appendChild(
    Object.assign(document.createElement('link'), {
      rel: 'preload',
      href: url,
      as,
      crossOrigin: crossorigin
    })
  )

  preloadElement.addEventListener('load', () => document.head.removeChild(preloadElement))
}
```

_Note that this may unnecessarily load the API server._

### Revalidating Active Apps

Some users leave the app open for extended periods of time, so another thing we can do is revalidate (download new assets of) the app while it is running:

_[service-worker-registration.ts](src/utils/service-worker-registration.ts)_

```diff
+ const ACTIVE_REVALIDATION_INTERVAL = 10 * 60

const register = () => {
  window.addEventListener('load', async () => {
    try {
-     await navigator.serviceWorker.register('/prefetch-service-worker.js')
+     const registration = await navigator.serviceWorker.register('/prefetch-service-worker.js')

      console.log('Service worker registered!')

+     setInterval(() => registration.update(), ACTIVE_REVALIDATION_INTERVAL * 1000)
    } catch (err) {
      console.error(err)
    }
  })
}
```

The code above revalidates the app every 10 minutes.

The revalidation process is extremely cheap, since it only involves refetching the service worker (which will return a _304 Not Modified_ status code if not changed).
<br>
When the service worker **does** change, it means that new assets are available, and so they will be selectively downloaded and cached.

### Generating Static Data

If we take a closer look, here is what SSG essentially does: it creates a cacheable HTML file and injects static data into it.
<br>
This can be useful for data that is not highly dynamic, such as content from CMS.

So how can we also create static data?

The preferred method would be to have our API server create JSON files from static data and to serve those when requested.
<br>
However, if we wanted to do something similar ourselves, we could execute the following script during build time:

_[fetch-static.js](scripts/fetch-static.js)_

```js
import { mkdir, writeFile } from 'fs/promises'
import axios from 'axios'

const path = 'public/json'
const axiosOptions = { transformResponse: res => res }

mkdir(path, { recursive: true })

const fetchLoremIpsum = async () => {
  const { data } = await axios.get('https://loripsum.net/api/100/long/plaintext', axiosOptions)

  writeFile(`${path}/lorem-ipsum.json`, JSON.stringify(data))
}

fetchLoremIpsum()
```

_[package.json](package.json)_

```json
"scripts": {
  "postinstall": "npm run fetch-static",
  "prebuild": "npm run fetch-static",
  "fetch-static": "node scripts/fetch-static"
}
```

The above script would create a `json/lorem-ipsum.json` file that will be stored in our CDN.

Then we simply fetch the static data in our app:

```js
fetch('json/lorem-ipsum.json')
```

There are some advantages to this approach:

- We generate static data ourselves so we don't bother our server or CMS for every user request.
- The data will be fetched faster from a nearby CDN edge than from a remote server.

Whenever we need to update the static data we simply rebuild the app or, if we have control over our build files in production, just rerun the script.

## Summary

We've managed to make the initial (cacheless) load of our extremely fast, everything that a page requires to load is dynamically injected to it.
<br>
We even preload the page's data, eliminating the famous data fetching delay that CSR apps are known to have.
<br>
In addition, we precache other pages, which makes it seem as if they were never separated.
<br>

All of these were achieved without compromising on the developer experience and without dictating which JS framework to choose.

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

To conclude this section, we will perform a benchmark of our app compared to _[Next.js](https://nextjs.org/docs/getting-started)_'s documentation site, which is **entirely SSG**.
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

It is a common minconception that Google is having trouble properly indexing CSR (JS) apps.
<br>
That might have been the case in 2017, but as of today: Google indexes CSR apps mostly flawlessly.

Indexed pages will have a title, description, content and all other SEO-related attributes, as long as we remember to dynamically set them (either manually like [this](https://github.com/theninthsky/frontend-essentials/blob/main/src/components/Meta.tsx) or using a package such as _[react-helmet](https://www.npmjs.com/package/react-helmet)_).

https://www.google.com/search?q=site:https://client-side-rendering.pages.dev

![Google Search Results](images/google-search-results.png)
![Google Lorem Ipsum Search Results](images/google-lorem-ipsum-search-results.png)

Googlebot's ability the render JS can be easily demonstrated by performing a live URL test of our app in the _[Google Search Console](https://search.google.com/search-console)_:

![Google Search Console Rendering](images/google-search-console-rendering.png)

Googlebot uses the latest version of Chromium to crawl apps, so the only thing we should do is make sure our app loads fast and that it is quick to fetch data.

Even when data takes long time to fetch, Googlebot, in most cases, will wait for it before taking a snapshot of the page:
<br>
https://support.google.com/webmasters/thread/202552760/for-how-long-does-googlebot-wait-for-the-last-http-request
<br>
https://support.google.com/webmasters/thread/165370285?hl=en&msgid=165510733

A detailed explanation of Googlebot's JS crawling process can be found here:
<br>
https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

If Googlebot fails to render some pages, it is mostly due to Google's unwillingness to spend the required resources to crawl the website, which means it has a low _[Crawl Budget](https://developers.google.com/search/blog/2017/01/what-crawl-budget-means-for-googlebot)_.
<br>
This can be confirmed by inspecting the crawled page (by clicking _View Crawled Page_ in the search console) and making sure all failed requests have the _Other error_ alert (which means those requests were intentionally aborted by Googlebot):

![Google Search Console Insufficient Fetch Quota](images/google-search-console-insufficient-fetch-quota.png)

This should only happen to websites that Google deems to have no interesting content or have very low traffic (such as our demo app).

More information can be found here: https://support.google.com/webmasters/thread/4425254?hl=en&msgid=4426601

### Prerendering

Other search engines such as Bing cannot render JS, so in order to have them crawl our app properly, we need to serve them **prerendered** version of our pages.
<br>
Prerendering is the act of crawling web apps in production (using headless Chromium) and generating a complete HTML file (with data) for each page.

We have two options when it comes to prerendering:

1. We can deploy our own prerender server using _[Prerender](https://github.com/prerender/prerender)_ (or my own _[Renderprime](https://github.com/theninthsky/renderprime)_ serverless function).
2. We can use a dedicated service such as _[Prerender.io](https://prerender.io)_ which is very expensive but offers 1000 free prerenders a month.

**Serverless prerendering is the recommended approach**, since it can be very cheap (and sometimes even free on _[GCP](https://cloud.google.com)_).

Then we redirect web crawlers (identified by their `User-Agent` header string) to our prerenderer, using a Cloudflare Worker (for example):

_[public/\_worker.js](public/_worker.js)_

```js
const BOT_AGENTS = ['bingbot', 'yandex', 'twitterbot', 'whatsapp', ...]

const fetchPrerendered = async ({ url, headers }, userAgent) => {
  const headersToSend = new Headers(headers)

  /* Custom Prerenderer */
  const prerenderUrl = new URL(`${YOUR_PRERENDERER_URL}?url=${url}`)
  /*************/

  /* OR */

  /* Prerender.io */
  const prerenderUrl = `https://service.prerender.io/${url}`

  headersToSend.set('X-Prerender-Token', YOUR_PRERENDER_IO_TOKEN)
  /****************/

  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
    redirect: 'manual'
  })

  const { body, ...rest } = await fetch(prerenderRequest)

  return new Response(body, rest)
}

export default {
  fetch(request, env) {
    const pathname = new URL(request.url).pathname.toLowerCase()
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase()

    // a crawler that requests the document
    if (BOT_AGENTS.some(agent => userAgent.includes(agent)) && !pathname.includes('.')) {
      return fetchPrerendered(request, userAgent)
    }

    return env.ASSETS.fetch(request)
  }
}

```

Here is an up-to-date list of all bot agnets (web crawlers): https://docs.prerender.io/docs/how-to-add-additional-bots#cloudflare. Remember to exclude `googlebot` from the list.

_Prerendering_, also called _Dynamic Rendering_, is encouraged by _[Microsoft](https://blogs.bing.com/webmaster/october-2018/bingbot-Series-JavaScript,-Dynamic-Rendering,-and-Cloaking-Oh-My)_ and is heavily used by many popular websites including Twitter.

The results are as expected:

https://www.bing.com/search?q=site%3Ahttps%3A%2F%2Fclient-side-rendering.pages.dev

![Bing Search Results](images/bing-search-results.png)

_Note that when using CSS-in-JS, we can [disable the speedy optimization](src/utils/disable-speedy.ts) during prerendering if we want to have our styles omitted to the DOM._

### Social Media Share Previews

When we share a CSR app link in social media, we can see that no matter what page we link to, the preview will remain the same.
<br>
This happens because most CSR apps have only one contentless HTML file, and social media crawlers do not render JS.
<br>
This is where prerendering comes to our aid once again, it will generate the proper share preview for each page:

_**Whatsapp:**_

![Whatsapp Share Preview](images/whatsapp-share-preview.png)

_**Facebook**:_

![Facebook Share Preview](images/facebook-share-preview.png)

## Sitemaps

In order to make all of our app pages discoverable to search engines, it is recommended to create a `sitemap.xml` file which specifies all of our website routes.

Since we already have a centralized _[pages-manifest](src/pages-manifest.js)_ file, we can easily generate a sitemap during build time:

_[create-sitemap.js](scripts/create-sitemap.js)_

```js
import { Readable } from 'stream'
import { writeFile } from 'fs/promises'
import { SitemapStream, streamToPromise } from 'sitemap'

import pagesManifest from '../src/pages-manifest.js'

const stream = new SitemapStream({ hostname: 'https://client-side-rendering.pages.dev' })
const links = pagesManifest.map(({ path }) => ({ url: path, changefreq: 'weekly' }))

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
      <changefreq>weekly</changefreq>
   </url>
   <url>
      <loc>https://client-side-rendering.pages.dev/lorem-ipsum</loc>
      <changefreq>weekly</changefreq>
   </url>
   <url>
      <loc>https://client-side-rendering.pages.dev/pokemon</loc>
      <changefreq>weekly</changefreq>
   </url>
</urlset>
```

We can manually submit our sitemap to _[Google Search Console](https://search.google.com/search-console)_ and _[Bing Webmaster Tools](https://www.bing.com/webmasters)_.

# CSR vs. SSR

As mentioned above, an in-depth comparison of all rendering methods can be found here: https://client-side-rendering.pages.dev/comparison

## Why Not SSG?

We have seen the advantages of static files: they are cacheable and they can be served from a nearby CDN without requiring a server.

This may lead us to believe that SSG combines both CSR and SSR advantages: it makes our app visually appear very fast (_[FCP](https://web.dev/fcp)_) and independently from our API server's response times.

However, in reality, SSG has a major limitation:
<br>
Since JS isn't active during the first moments, everything that relies on JS to be presented simply won't be visible, or it will be visible in its incorrect state (like components which rely on the `window.matchMedia` function to be displayed).

A classic example of this problems is demonstrated by the following website:
<br>
https://death-to-ie11.com

Notice how the timer isn't available right away? that's because its generated by JS, which takes time to download and execute.

We can also see that while refreshing Vercel's 'Guides' page when some filters are applied:
<br>
https://vercel.com/guides?topics=analytics

This is caused by the fact that there are `65536 (2^16)` possible filter combinations, and storing every combination as a full HTML file takes a lot of storage on the server.
<br>
So they only generate a single `guides.html` file which contains all of the data of all pages, but this static file doesn't know which filters are applied until JS is loaded, so we see this layout shift.

It is important to note that even when using _[Incremental Static Regeneration](https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration)_, users will have to wait for server response when visiting pages that are yet to be cached on the server (just like in SSR).

Another example for this is JS animations - they would first appear static and start animating only when JS is loaded.

There are various examples of how this delayed functionality negatively impacts the user experience, like the way some websites only show the navigation bar after JS has been loaded (since they cannot access the Local Storage to check if it has a user info entry).

Another issue, which can be especially critical for E-commere websites, is that SSG pages might reflect outdated data (a product's price or availability for example).
<br>
That is the reason why no popular E-commerce website uses SSG.

## The Cost of Hydration

It is a fact that under fast internet connection, both CSR and SSR perform great (as long as they are both optimized), and the higher the connection speed - the closer they get in terms of loading times.

However, when dealing with slow connections (such as mobile networks), it seems that SSR has an edge over CSR regarding loading times.
<br>
Since SSR apps are rendered on the server, the browser receives the fully-constructed HTML file, and so it can show the page to the user without waiting for JS to download. When JS is eventually download and parsed, the framework is able to "hydrate" the DOM with functionality (without having to reconstruct it).

Although it seems like a big advantage, this behaviour introduces an undesired side-effect, especially on slower connections:
<br>
Until JS is loaded, users can click wherever they desire but the app won't react to any of their JS-based events.
<br>
It is a bad user experience when buttons don't respond to user interactions, but it becomes a much larger problem when default events are not being prevented.

This is a comparison between Next.js's website and our Client-side Rendering app on a fast 3G connection:

![SSR Load 3G](images/ssr-load-3g.gif)
![CSR Load 3G](images/csr-load-3g.gif)

What happened here?
<br>
Since JS hasn't been loaded yet, Next.js's website could not prevent the default behaviour of anchor tag elements (`<a>`) to navigate to another page, resulting in every click on them triggering a full page reload.
<br>
And the slower the connection is - the more severe this issue becomes.
<br>
In other words, where SSR should have had a performance edge over CSR, we see a very "dangerous" behavior that might significantly degrade the user experience.

It is impossible for this issue to occur in CSR apps, since the moment they render - JS has already been fully loaded.

# Conclusion

We saw that client-side rendering performance is on par and sometimes even better than SSR in terms of initial loading times (and far surpasses it in navigation times).
<br>
We've also seen that Googlebot can perfectly index client-side rendered apps, and that we can easily set up a prerender server to serve all other bots and crawlers.
<br>
And above all - we have achieved all this mainly by modifiying 2 files (the Webpack config and HTML template) and using a prerender service, so every existing CSR app should be able to quickly and easily implement these modifications and benefit from them.

These facts lead to the conclusion that there is no particular reason to use SSR, it would only add a lot of complexity and limitations to our app and degrade the developer and user experience.

## What Might Change in the Future

As time passes, [connection speed is getting faster](https://www.speedtest.net/global-index) and end-user devices get stronger. So the performance differences between all possible website rendering methods are guarenteed to be mitigated even further (except for SSR which depends on the API server response times).

There is a new SSR method called _Streaming SSR_ (in React it is through "Server Components") and new frameworks (such as Qwik) which are able to stream responses to the browser without having to wait for the API server's response.
<br>
However, there are also newer and better CSR frameworks such as Svelte and Solid.js, which have a very small bundle size and are much faster than React (thus greatly improving the FCP on slow networks).

Nevertheless, it's important to note that nothing will ever outperform the instant page transitions that client-side rendering is able to provide, and when using the SWR approach, even repeated page loads are instant.
