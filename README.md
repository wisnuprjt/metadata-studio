# Metadata Studio

A privacy-first, browser-based image metadata workspace built with Next.js 16, TypeScript, Tailwind CSS, and exifr.

## Requirements

- Node.js 20.9 or newer
- npm

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Stage 1 status

- Next.js App Router foundation
- TypeScript and Tailwind CSS 4 setup
- Workspace shell with responsive sidebar
- Light/dark theme support
- Overview and navigation pages
- Client-side image upload and preview (JPG, PNG, WebP; 50 MB limit)
- Basic file type, size, empty-file, and image-decoding validation
- Temporary object URL lifecycle handling

## Planned stages

1. Foundation and UI setup (current)
2. Image upload hardening and metadata reading
3. EXIF, XMP, IPTC, AI identifier, and C2PA inspection
4. Format-aware JPEG, PNG, and WebP cleaning with post-export verification
5. Supported metadata editing and export
6. Testing and Vercel deployment

## Privacy architecture

No image upload endpoint, API route, database, authentication, or remote image-processing service is included. Uploaded files are held in browser memory and previewed through temporary object URLs.

## shadcn/ui

The current foundation uses Tailwind and Lucide directly for the initial shell. Initialize shadcn/ui and add primitives as needed:

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog dropdown-menu separator sheet tabs tooltip
```

Review generated configuration before replacing existing files.
