# Client-side Rendering

This project is a case study of CSR, it aims to explore the potential of client-side rendered apps in comparison to server-side rendering.

## Motivation

In the recent years, Server-side rendering frameworks such as Next.jsand Remix started to gain popularity in an increasing pace.
While SSR has it's own set of perks, those frameworks are braging about how fast they are ("Performance as a default"), implying Client-side rendering is slow.
In addition, it is a common perception that great SEO can only be achieved by using those SSR frameworks, and that CSR apps will give worse results.

This project implements CSR best practices with some tricks that can make it infinitely scalable.
The idea is to simulate a production grade app in terms of number of packages used and see how fast it can load.

It is important to note that acheiving load speed should not come on behalf of developer experience, so the way this project is architected should vary only slightly compared to "normal" react apps.

This case study will cover two major aspects: SEO and performance. It will try to inspect how we can achieve great scores in either of them, both compared to SSR and on their own.

Note: while this project is implemented using React, the majority of it's tweaks are not tied to any framework and are purely browser-based.

## Performance

### Bundle Size

The first rule of thumb is to use as fewer dependencies as possible, and among those, to select the ones with smaller size.

For example:

Use [date-fns](https://www.npmjs.com/package/date-fns) instead of [moment](https://www.npmjs.com/package/moment)
<br>
Use [zustand](https://www.npmjs.com/package/zustand) instead of [redux](https://www.npmjs.com/package/redux)
<br>
Etc...

This is crucial not only for CSR apps, but also for SSR and SSG ones, since the bigger your bundle is - the longer it will take the page to be interactive (either through hydration or regular rendering).

### Code Splitting

A lot of the features we write end up being used only in a few of our pages, so we would like them to be downloaded only when the user visits the page they are being used in.

For Example, we wouldn't want users to download the [react-big-calendar](https://www.npmjs.com/package/react-big-calendar) package if they just tried to get to the home page. We would only want that to happen when they visit the calendar page.

The way we achieve this is (preferably) by route-based code splitting:

const Home = lazy(() => import(/_ webpackChunkName: "index" _/ 'pages/Home'))
<br>
const LoremIpsum = lazy(() => import(/_ webpackChunkName: "lorem-ipsum" _/ 'pages/LoremIpsum'))
<br>
const Pokemon = lazy(() => import(/_ webpackChunkName: "pokemon" _/ 'pages/Pokemon'))

So when the user visits the LoremIpsum page, they only download the main chunk script (which includes all shared dependencies such as the framework) and the lorem-ipsum chunk.

Note: I believe that it is completely fine (and even encouraged) to have the user download your entire site (so they can have a smooth navigation experience). But it is _VERY_ wrong to have all the assets being downloaded _initially_, delaying the forst render of the page. These async chunks can be gladly downloaded _after_ the user-requested page has finished rendering and is visible to the user.
