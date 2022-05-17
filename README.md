# Fastest CSR App

This project aims to build an incredibly fast client-side rendered app.

## Motivation

In the recent years, Server-side rendering frameworks such as Next.js started to gain popularity in an increasing pace.
While SSR has it's own set of perks, those frameworks are braging about how fast they are ("Performance as a default"), implying Client-side rendering is slow.

This project implements CSR best practices with some tricks that can make it infinitely scalable.
The idea is to simulate a production grade app in terms of number of packages used and see how fast it can load.

It is important to note that acheiving load speed should not come on behalf of developer experience, so the way this project is architected should vary only slightly compared to "normal" react apps.
