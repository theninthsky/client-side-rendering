This project is a case study of CSR, it aims to explore the potential of client-side rendered apps in comparison to server-side rendering.

## Table of Contents

- [Motivation](#motivation)
- [Performance](#performance)
  - [Bundle Size](#bundle-size)
  - [Caching](#caching)
  - [Code Splitting](#code-splitting)
  - [Preloading Async Chunks](#preloading-async-chunks)
  - [Generating Static Data](#generating-static-data)
  - [Preloading Data](#preloading-data)
  * [Tweaking Further](#tweaking-further)
    - [Splitting Vendors From Async Chunks](#splitting-vendors-from-async-chunks)
    - [Preloading Other Pages Data](#preloading-other-pages-data)
    - [Preventing Sequenced Rendering](#preventing-sequenced-rendering)
    - [Transitioning Async Pages](#transitioning-async-pages)
  - [Deploying](#deploying)
  - [Benchmark](#benchmark)
- [SEO](#seo)
  - [Indexing](#indexing)
    - [Google](#google)
    - [Other Search Engines](#other-search-engines)
  * [Social Media Share Previews](#social-media-share-previews)

# Motivation

In the recent years, server-side rendering frameworks such as Next.js and Remix started to gain popularity in an increasing pace.
<br>
While SSR has it's own set of perks, those frameworks are bragging about how fast they are ("Performance as a default"), implying client-side rendering is slow.
<br>
In addition, it is a common perception that great SEO can only be achieved by using SSR, and that CSR apps will give worse results.

This project implements CSR best practices with some tricks that can make it infinitely scalable.
The idea is to simulate a production grade app in terms of number of packages used and see how fast it can load.

It is important to note that improving performance should not come at the expense of developer experience, so the way this project is architected should vary only slightly compared to "normal" react projects.

This case study will cover two major aspects: performance and SEO. It will try to inspect how we can achieve great scores in either of them, both compared to SSR and on their own.

_Note: while this project is implemented using React, the majority of it's tweaks are not tied to any framework and are purely browser-based._

# Performance

### Bundle Size

The first rule of thumb is to use as fewer dependencies as possible, and among those, to select the ones with smaller filesize.

For example:
<br>
We can use _[date-fns](https://www.npmjs.com/package/date-fns)_ instead of _[moment](https://www.npmjs.com/package/moment)_, _[zustand](https://www.npmjs.com/package/zustand)_ instead of _[redux toolkit](https://www.npmjs.com/package/@reduxjs/toolkit)_ etc.

This is crucial not only for CSR apps, but also for SSR and SSG ones, since the bigger your bundle is - the longer it will take the page to be interactive (either through hydration or regular rendering).

### Caching

Ideally, every hashed file should be cached, and `index.html` should **NEVER** be cached.
<br>
It means that the browser would initially cache `main.[hash].js` and would have to redownload it only if its hash (content) changes.

However, since `main.js` includes the entire bundle, the slightest change in code would cause its cache to expire, meaning the browser would have to download it again.
<br>
Now, what part of our bundle comprises most of its weight? The answer is the **dependencies**, also called **vendors**.

So if we could split the vendors to their own hashed chunk, that would allow a separation between our code and the vendors code, leading to less cache invalidations:

```
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

For Example, we wouldn't want users to download the _[react-big-calendar](https://www.npmjs.com/package/react-big-calendar)_ package if they just tried to get to the home page. We would only want that to happen when they visit the calendar page.

The way we achieve this is (preferably) by route-based code splitting:

```
const Home = lazy(() => import(/* webpackChunkName: "index" */ 'pages/Home'))
const LoremIpsum = lazy(() => import(/* webpackChunkName: "lorem-ipsum" */ 'pages/LoremIpsum'))
const Pokemon = lazy(() => import(/* webpackChunkName: "pokemon" */ 'pages/Pokemon'))
```

So when the user visits the Lorem Ipsum page, they only download the main chunk script (which includes all shared dependencies such as the framework) and the `lorem-ipsum.[hash].js` chunk.

_Note: I believe that it is completely fine (and even encouraged) to have the user download your entire site (so they can have a smooth **app-like** navigation experience). But it is **VERY** wrong to have all the assets being downloaded **initially**, delaying the first render of the page.
<br>
These assets should be downloaded **after** the user-requested page has finished rendering and is visible to the user._

### Preloading Async Chunks

Code splitting has one major flaw - the runtime doesn't know these async chunks are needed until the main script executes, leading to them being fetched in a significant delay:

![Without Async Preload](images/without-async-preload.png)

The way we can solve this issue is by generating multiple HTML files (one for each page) and preloading the relevant assets:

```
plugins: [
  ...pagesManifest.map(
    ({ name }) =>
      new HtmlPlugin({
        filename: `${name}.html`,
        scriptLoading: 'module',
        templateContent: ({ compilation }) => {
          const assets = compilation.getAssets().map(({ name }) => name)
          const script = assets.find(assetName => assetName.includes(`/${name}.`) && assetName.endsWith('.js'))

          return htmlTemplate(script)
        }
      })
  ),
]
```

```
module.exports = script => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>CSR</title>
    </head>
    <body>
      <link rel="preload" href="${script}" as="script">

      <div id="root"></div>
    </body>
  </html>
`
```

`pages-manifest.json` can be found [here](src/pages-manifest.json).

_Please note that other types of assets can be preloaded the same way (like stylesheets)._

This way, the browser is able to fetch the page-related script **in parallel** with render-critical assets:

![With Async Preload](images/with-async-preload.png)

### Generating Static Data

I like the idea of SSG: we create a cacheable HTML file and inject static data into it.
<br>
This can be useful for data that is not highly dynamic, such as content from CMS.

So why not make ourselves some static data?
<br>
We will execute the following script during build time:

```
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

`fetch('json/lorem-ipsum.json')`

There are numerous advantages to this approach:

- We generate static data so we won't bother our server or CMS for every user request.
- The data will be fetched a lot faster from a nearby CDN edge rather than a remote server.
- Since this script runs on our server during build time, we can authenticate with services however we want, there is no limit to what can be sent (secret tokens for example).

Whenever we need to update the static data we simply rebuild the app or, better yet, rerun the script.

### Preloading Data

One of the disadvantages of CSR over SSR is that data will be fetched only after JS has been downloaded, parsed and executed in the browser:

![Without Data Preload](images/without-data-preload.png)

So we will use preloading once again, this time for the data itself:

```diff
module.exports = ({ script, data }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>CSR</title>
    </head>
    <body>
      <link rel="preload" href="${script}" as="script">
+     <link rel="preload" href="${data.url}" as="fetch">

      <div id="root"></div>
    </body>

  </html>
`
```

Now we can see that the data is being fetched right away:

![With Data Preload](images/with-data-preload.png)

There are, however, two limitations to this approach:

1. We can only preload GET resources (should not be a problem with a well-architected backend).
2. We can not preload dynamic route resources (such as `posts/[:id]`).

## Tweaking Further

### Splitting Vendors From Async Chunks

Code splitting introduced us to a new problem: vendor duplication.

Say we have two async chunks: `lorem-ipsum.[hash].js` and `pokemon.[hash].js`.
If they both include the same dependency that is not part of the main chunk, that means the user will download that dependency **twice**.

So if that said dependency is `moment` and it weighs 72kb minzipped, then both async chunk's size will be **at least** 72kb.

We need to split this dependency from these async chunks so that it could be shared between them:

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

Unfortunately, I did not find a way to automatically match an async chunk to its dependencies (through Webpack's compilation object), so we'll have to manually specify these dependencies until an automatic solution will be found.

We can easily find these async dependencies by looking at the waterfall:

![Without Async Vendor Preload](images/without-async-vendor-preload.png)

Then we will have them being added to the page's HTML:

```diff
plugins: [
  ...pagesManifest.map(
    ({ name, vendors, data }) =>
      new HtmlPlugin({
        filename: `${name}.html`,
        scriptLoading: 'module',
        templateContent: ({ compilation }) => {
          const assets = compilation.getAssets().map(({ name }) => name)
          const script = assets.find(assetName => assetName.includes(`/${name}.`) && assetName.endsWith('.js'))
+         const vendorScripts = vendors
+               ? assets.filter(name => vendors.find(vendor => name.includes(`/${vendor}.`) && name.endsWith('.js')))
+               : []

-         return htmlTemplate(script)
+         return htmlTemplate({ scripts: [script, ...vendorScripts], data })
        }
      })
  ),
]
```

```diff
module.exports = ({ scripts, data }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>CSR</title>
    </head>
    <body>
-     <link rel="preload" href="${script}" as="script">
+     ${scripts.map(script => `<link rel="preload" href="${script}" as="script">`).join('')}
      <link rel="preload" href="${data.url}" as="fetch">

      <div id="root"></div>
    </body>
  </html>
`
```

Now all async vendor chunks will be fetched in parallel with their parent async chunk:

![With Async Vendor Preload](images/with-async-vendor-preload.png)

### Preloading Other Pages Data

We can preload data when hovering over links (desktop) or when links enter the viewport (mobile):

```
const createPreload = url => {
  if (document.body.querySelector(`body > link[href="${url}"]`)) return

  document.body.appendChild(
    Object.assign(document.createElement('link'), {
      rel: 'preload',
      href: url,
      as: 'fetch'
    })
  )
}
```

This time, we **can** preload dynamic route resources (such as `posts/[:id]`), since JS has already been loaded and the sky is the limit.

### Preventing Sequenced Rendering

When we split a page from the main app, we separate its render phase, meaning the app will render before the page renders:

![Before Page Render](images/before-page-render.png)
![After Page Render](images/after-page-render.png)

This happens due to the common approach of wrapping routes with Suspense:

```
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
We would like the app to be visually complete in a single render, but we wouldn't want to stall the page render until the async chunk finishes downloading.

However, since we preload all async chunks (and their vendors), this won't be a problem for us. So we should suspense the entire app until the async chunk finishes downloading (which, in our case, happens really fast):

```
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Suspense>
        <App />
    </Suspense>
  </BrowserRouter>
)
```

This would make our app and the async page visually render at the same time.

### Transitioning Async Pages

_Note: this technique requires React 18_

We will see a similar effect when we move to another async page: a blank space that remains until the page's script finishes downloading.

React 18 introduced us to the useTransition hook, which allows us to delay a render until some criteria are met.
<br>
We will use this hook in to delay the page navigation until it is ready:

```
import { useTransition } from 'react'
import { useNavigate } from 'react-router-dom'

const useDelayedNavigate = () => {
  const [, startTransition] = useTransition()
  const navigate = useNavigate()

  return to => startTransition(() => navigate(to))
}

export default useDelayedNavigate
```

```
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

## Deploying

The biggest advantage of a static app is that it can be served entirely from a CDN.
<br>
A CDN has many PoPs (Points of Presence), also called 'Edge Networks'. These PoPs are distributed around the globe and thus are able to serve files to every region _much_ faster than a remote server.

The fastest CDN to date is Cloudflare, which has more than 250 PoPs (and counting):

![Cloudflare PoPs](images/cloudflare-pops.png)

https://speed.cloudflare.com

https://blog.cloudflare.com/benchmarking-edge-network-performance

We can easily deploy our app using Cloudflare Pages:
<br>
https://pages.cloudflare.com

## Benchmark

To conclude this section, here's a benchmark of our app compared to [Next.js](https://nextjs.org/docs/getting-started)'s documentation site (which is **entirely SSG**).
<br>
I chose the most minimalistic page I could find in it (Fast Refresh) and compared it to my Lorem Ipsum page.

The benchmark is performed through [PageSpeed Insights](https://pagespeed.web.dev/) simulating a slow 4G network.

![Next.js Benchmark](images/next-js-benchmark.png)
![Client-side Rendering Benchmark](images/client-side-rendering-benchmark.png)

It turns out that performance is not a default in Next.js.

# SEO

## Indexing

### Google

It is often said that Google is having trouble correctly indexing a CSR app.
<br>
That might have been the case in 2018, but as of 2022, Google prefectly indexes every JS app.
<br>
The indexed pages will have a title, description and even content, as long as we remember to dynamically set them (either manually or using something like _[react-helmet](https://www.npmjs.com/package/react-helmet)_).

In other words, it won't matter if we used SSR or not in terms of Google indexing.

![Google Search Results](images/google-search-results.png)

### Other Search Engines

Other inferior search engines such as Bing cannot render JS (despite claiming they can). So in order to have them index our app correctly, we will serve them a **prerendered** version of our pages.
<br>
The best tool for this job is _[prerender.io](https://prerender.io/)_, which is able to crawl our app in production, generate a simple, styleless, HTML file for each page and serve it to web crawlers on demand.

We can easily integrate it with Cloudflare Workers:
<br>
https://docs.prerender.io/docs/24-cloudflare

Using prerendering produces the **exact same** SEO results as using SSR.

_Note that if you only care about Google indexing, there's little sense to prerendering your website, since **googlebot** crawls JS apps flawlessly._

### Social Media Share Previews

When we share a CSR app link in social media, we can see that no matter what page we link, the preview will remain the same.
<br>
This happens because most CSR apps have only one HTML file, and social share previews do not render JS.
<br>
In our setup, we generate multiple HTML files (one for each page), so we have control of what `og` meta tags will be present in the document:

```
module.exports = ({ path, title, description }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta name="description" content="${description}">
      <meta property="og:title" content="${title}">
      <meta property="og:type" content="website">
      <meta property="og:url" content="https://client-side-rendering.pages.dev${path}">
      <meta property="og:image" content="https://client-side-rendering.pages.dev/icons/og-icon.png">

      <title>${title}</title>
    </head>
    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>

      <div id="root"></div>
    </body>
  </html>
`
```

This gives us the correct preview for every page:

![Facebook Share Preview](images/facebook-share-preview.png)

_Note that we cannot create a preview for dynamic route pages (such as `posts/[:id]`)._
