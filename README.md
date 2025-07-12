
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

## Setup Tailwind

> tailwind.config.js
``` javascript
const config = {
  content: [
    // ...
    "./node_modules/@marthvon/gibbing-headless-ui/dist/**/*.{js,ts,jsx,tsx,mdx,css}"
  ] // ...
```

> global.css
``` css
@import '../../node_modules/@marthvon/frontail/components/index.css';
```
Optionally, import only what you need from components
> global.css
``` css
/* for example */
@import '../../node_modules/@marthvon/frontail/components/image_carousel.css';
@import '../../node_modules/@marthvon/frontail/components/slider.css';
```

## Optimizations: Style Inlining and Purge Unused TailwindCss

> tsconfig.json
``` json
{
  "compilerOptions": {
    // ...
    "preserveConstEnums": false,
    "isolatedModules": false,
    // ...
```

Alternatively, adhere to installation guide to setup the following
``` bash
npm install @fullhumam/postcss-purgecss --save-dev
```

### Presets Utilization for Customization

In use cases of Server-Side Rendering or Static Site Generation
``` typescript
import { /*...*/ } from "@marthvon/gibbing-headless-ui/presets.server";
```

When component is expected to be Client Side Rendered, instead use:
``` typescript
import { /*...*/ } from "@marthvon/gibbing-headless-ui/presets.client";
```
The above focuses on inlining the class name styles and avoids talwind compilation of unused component styles. In summary, **Avoids false positives when tailwind scans for css styles to compile (ideally, *experimental*)**.

# Components

- ImageCarousel
- GridView
- Card Modals
- Panels
- Textbox
- Slider
- DualSlider
- Digitbox
- Toggle
- Dropdown
- Searchbox *(later)*
- DatePicker *(later)*
