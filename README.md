
# Gibbing-HeadLess-UI Component Library

**Author:** marthvon \<mamertvonn@gmail.com>

*"Gib [meaning: fasten (parts) together with a gib] React Components together into your webapp. Giving you HeadLessUI that you need."*

Package of Frontend Components using React <u>></u> 18.

> Note: Only works for TailwindCss versions <u>></u> 4.0

# Installation Guide

``` bash
npm install tailwindcss postcss postcss-import autoprefixer @marthvon/frontail --save-dev
npm install @marthvon/gibbing-headless-ui
```

# Configuration Setup 

## Frontail Styling Library Setup guide

Follow setup guide within this link <a href="https://www.npmjs.com/package/@marthvon/frontail">https://www.npmjs.com/package/@marthvon/frontail</a>

## Update Tailwind Configuration

> tailwind.config.js
``` javascript
const config = {
  content: [
    // ...
    "./node_modules/@marthvon/gibbing-headless-ui/**/*.{js,ts,jsx,tsx,mdx,css}"
  ] // ...
```

## Optionally, optimize Typescript Setup

> tsconfig.json
``` json
{
  // ...
  "include": [
    // ...
    "./node_modules/@marthvon/gibbing-headless-ui/**/*.{js,ts,jsx,tsx,mdx,css}"
  ]
  // ...
}
```

# Components

- ImageCarousel
- GridView
- Card Modals
- Panels
- Textbox *(later)*
- Sliders *(later)*
- DatePicker *(later)*
