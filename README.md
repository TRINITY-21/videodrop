<p align="center">
  <img src="https://videodrop.app/icon.svg" width="80" height="80" alt="VideoDrop Logo" />
</p>

<h1 align="center">VideoDrop</h1>

<p align="center">
  <strong>34 free, browser-based video tools. No uploads. No servers. 100% private.</strong>
</p>

<p align="center">
  <a href="https://videodrop.app">Live App</a> &nbsp;&middot;&nbsp;
  <a href="https://buymeacoffee.com/trinity_21">Buy Me a Coffee</a> &nbsp;&middot;&nbsp;
  <a href="#tools">All Tools</a> &nbsp;&middot;&nbsp;
  <a href="#getting-started">Get Started</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-34-blue" alt="34 Tools" />
  <img src="https://img.shields.io/badge/uploads-zero-green" alt="Zero Uploads" />
  <img src="https://img.shields.io/badge/cost-free-brightgreen" alt="Free" />
  <img src="https://img.shields.io/badge/privacy-100%25-purple" alt="100% Private" />
</p>

---

## What is VideoDrop?

VideoDrop is the **iLovePDF for video** — a free, open-source video processing toolkit that runs entirely in your browser using [FFmpeg.wasm](https://ffmpegwasm.netlify.app/). No file ever leaves your device.

Built with **Next.js 14**, **Tailwind CSS**, and **Framer Motion**.

### Why VideoDrop?

- **Private by design** — All processing happens locally via WebAssembly. Your files never touch a server.
- **Near-native speed** — FFmpeg compiled to WASM runs at near-native performance on your hardware.
- **No accounts, no watermarks, no limits** — Just drop your video and go.
- **Chain tools together** — Pipe the output of one tool directly into another.

---

## Tools

### Optimize (3)
| Tool | Description |
|------|-------------|
| **Compress** | Reduce file size while maintaining visual quality |
| **Convert** | Switch between MP4, WebM, MOV, AVI, and MKV |
| **Resize** | Scale to 1080p, 720p, 480p, or any custom resolution |

### Edit (10)
| Tool | Description |
|------|-------------|
| **Trim & Cut** | Set precise start and end points |
| **Merge** | Concatenate multiple clips into one file |
| **Rotate** | Rotate 90, 180, 270 degrees |
| **Speed** | Slow-motion, timelapse, fast-forward |
| **Crop** | Crop to any region or aspect ratio |
| **Flip / Mirror** | Horizontal, vertical, or both |
| **Split** | Divide video into equal segments |
| **Aspect Ratio** | Letterbox to 16:9, 9:16, 4:3, 1:1, 21:9 |
| **Picture-in-Picture** | Overlay a small video on top of another |
| **Split Screen** | Place two videos side by side or stacked |

### Effects (8)
| Tool | Description |
|------|-------------|
| **Reverse** | Play video backwards with reversed audio |
| **Loop** | Repeat 2x, 3x, 4x, or 5x into one file |
| **Boomerang** | Instagram-style forward-then-reverse loop |
| **Fade In / Out** | Smooth fade-to-black transitions |
| **Watermark** | Overlay text for branding and copyright |
| **Subtitles** | Hardcode SRT subtitles permanently |
| **Chroma Key** | Remove green screen or any solid color |
| **Filters** | Brightness, contrast, saturation, grayscale |

### Enhance (2)
| Tool | Description |
|------|-------------|
| **Sharpen** | Enhance clarity and sharpness |
| **Denoise** | Remove visual noise and grain |

### Audio & Export (11)
| Tool | Description |
|------|-------------|
| **Remove Audio** | Strip audio track instantly |
| **Extract Audio** | Pull audio as high-quality MP3 |
| **Adjust Volume** | Boost or reduce audio volume (0–300%) |
| **Replace Audio** | Swap audio with a different file |
| **Background Music** | Mix music while keeping original audio |
| **Video to GIF** | Custom FPS, dimensions, and duration |
| **Video to WebP** | Animated WebP export |
| **Extract Frames** | Capture stills as PNG images |
| **Thumbnail** | Auto-detect or pick a timestamp for the perfect thumbnail |
| **Timelapse** | Turn a series of images into a video |
| **Batch Process** | Compress, convert, or strip audio in bulk |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Video Processing | [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) (WebAssembly) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Language | TypeScript |
| Fonts | Inter + Space Grotesk |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/TRINITY-21/videodrop.git
cd videodrop

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
videodrop/
├── app/                    # Next.js App Router pages
│   ├── compress/           # Each tool has page.tsx + client.tsx
│   ├── convert/
│   ├── trim/
│   ├── ...                 # 34 tool routes
│   ├── tools/              # All tools directory page
│   ├── layout.tsx          # Root layout with SEO & JSON-LD
│   ├── page.tsx            # Landing page
│   ├── sitemap.ts          # Dynamic sitemap (34 routes)
│   └── robots.ts           # Crawler rules
├── components/
│   ├── tools/              # 34 tool components
│   ├── DropZone.tsx        # File drop area
│   ├── FileInfo.tsx        # File metadata display
│   ├── DownloadButton.tsx  # Result download with before/after
│   ├── ContinueWith.tsx    # Tool chaining system
│   ├── ToolPageLayout.tsx  # Shared tool page wrapper
│   └── ProcessingScreen.tsx# Progress UI
├── lib/
│   ├── ffmpeg.ts           # All 34 FFmpeg processing functions
│   ├── seo.ts              # SEO metadata helper
│   ├── chain-context.tsx   # Tool chaining state
│   ├── processing-context.tsx # Global processing state
│   └── utils.ts            # Formatting utilities
└── public/                 # Static assets
```

---

## Architecture

### How Processing Works

1. **FFmpeg.wasm** loads once (~30MB WASM binary, cached by the browser)
2. Files are written to an in-memory virtual filesystem
3. FFmpeg commands run entirely in the browser via WebAssembly
4. Results are read back as blobs for download
5. All temp files are cleaned up after each operation

### Key Patterns

- **`useToolProcessing` hook** — Global processing state that persists across page navigation
- **`ContinueWith` chain** — Pipe the output of any tool into another tool
- **`displayFile = file ?? jobFile`** — Seamless navigation back to in-progress jobs
- **Dynamic imports with `ssr: false`** — FFmpeg components only load client-side
- **`-movflags +faststart`** — All MP4 outputs play instantly in the browser

---

## Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TRINITY-21/videodrop)

### Important Headers

FFmpeg.wasm requires these headers for `SharedArrayBuffer` support:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

These are configured in `next.config.ts` and apply automatically.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/new-tool`)
3. Commit your changes
4. Push and open a PR

---

## Support

If VideoDrop saves you time, consider supporting the project:

<a href="https://buymeacoffee.com/trinity_21" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200" />
</a>

---

## License

MIT

---

<p align="center">
  Built by <a href="https://github.com/TRINITY-21">TRINITY</a>
</p>
