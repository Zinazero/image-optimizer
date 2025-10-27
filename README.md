# Image Optimizer Service (TypeScript + Express + Sharp)

A lightweight dynamic image optimization server for local or multi-site use.  
Supports resizing, format conversion (WebP by default), and caching.

---

## Features

- Resize images dynamically (`w` query parameter) with max width limit
- Convert to optimized formats (`webp`, `avif`, `jpeg`) based on browser support
- Local disk caching for repeated requests
- Memory caching for hot images (LRU cache)
- Async processing for better performance
- Proper cache-control headers for browser/CDN caching
- Can serve images from local projects or remote URLs
- TypeScript-ready

---

## Installation

```bash
git clone <repo-url>
cd image-optimizer
npm install
```

---

## Scripts

### Development with auto-reload (using nodemon + ts-node)

```bash
npm run dev
```

### Compile TypeScript to JavaScript

```bash
npm run build
```

### Start production server

```bash
npm run start
```

---

## Usage

Start the server (default port 4000):

```bash
npm run dev
```

Request an optimized image:

```
http://localhost:4000/image?src=<image-url>&w=600&q=80&format=webp
```

---

## Query Parameters

| Param    | Description                                                                 | Default |
|----------|-----------------------------------------------------------------------------|---------|
| `src`    | URL or path to the original image                                           | —       |
| `w`      | Width in pixels (clamped to max allowed)                                    | original|
| `q`      | Quality (1–100, clamped to safe range)                                      | 80      |
| `format` | Image format (`webp`, `avif`, `jpeg`); auto-selected based on Accept header | webp    |

---

## Example in React

```jsx
<img
  src={`http://localhost:4000/image?src=${encodeURIComponent(imageUrl)}&w=800&q=80&format=webp`}
  alt="Optimized"
/>
```

---

## Cache

- Disk cache: Optimized images are stored in the `./cache` directory
- Memory cache: Frequently requested images are stored in memory for faster delivery
- Repeated requests for the same parameters are served from cache
- Clearing `./cache` will regenerate images on next request
- Responses include `Cache-Control` headers to leverage browser/CDN caching

---
