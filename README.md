This project is a case study of CSR, it aims to explore the potential of client-side rendered apps in comparison to server-side rendering.

## Motivation

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
Use _[date-fns](https://www.npmjs.com/package/date-fns)_ instead of _[moment](https://www.npmjs.com/package/moment)_, _[zustand](https://www.npmjs.com/package/zustand)_ instead of _[redux](https://www.npmjs.com/package/redux)_ etc.

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

```
name: ({ context }) => (context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]
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

The way we can solve this issue is by generating multiple HTML files (one for each pages) and preloading the relevant assets:

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

_Please note that other types of assets can be preloaded the same way (like stylesheets)._
<br>
<br>
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

```
module.exports = ({ script, data }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>CSR</title>
    </head>
    <body>
      <link rel="preload" href="${script}" as="script">
      <link rel="preload" href="${data.url}" as="fetch">

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

```
optimization: {
  runtimeChunk: 'single',
  splitChunks: {
    chunks: 'initial',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        chunks: 'all',
        name: ({ context }) => (context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) || [])[1]
      }
    }
  }
}
```

Now both `lorem-ipsum.[hash].js` and `pokemon.[hash].js` will use the extracted `moment.[hash].js` chunk, sparing the user a lot of network traffic (and give these assets better cache persistence).

However, we have no way of telling which async vendor chunks will be split before we build the application, so we wouldn't know which async vendor chunks we need to preload (refer to the "Preloading Async Chunks" section).

Unfortunately, I did not find a way to automatically match an async chunk to its dependencies (through Webpack's compilation object), so we'll have to manually specify these dependencies until and automatic solution will be found.

We can easily find these async dependencies by looking at the waterfall:

![Without Async Vendor Preload](images/without-async-vendor-preload.png)

Then we will have them being added to the page's HTML:

```
plugins: [
  ...pagesManifest.map(
    ({ name, vendors, data }) =>
      new HtmlPlugin({
        filename: `${name}.html`,
        scriptLoading: 'module',
        templateContent: ({ compilation }) => {
          const assets = compilation.getAssets().map(({ name }) => name)
          const script = assets.find(assetName => assetName.includes(`/${name}.`) && assetName.endsWith('.js'))
          const vendorScripts = vendors
                ? assets.filter(name => vendors.find(vendor => name.includes(`/${vendor}.`) && name.endsWith('.js')))
                : []

          return htmlTemplate({ scripts: [script, ...vendorScripts], data })
        }
      })
  ),
]
```

```
module.exports = ({ scripts, data }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>CSR</title>
    </head>
    <body>
      ${scripts.map(script => `<link rel="preload" href="${script}" as="script">`).join('')}
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
