import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedLayout from "@/components/AnimatedLayout";
import Providers from "@/components/Providers";
import ScrollToTop from "@/components/ScrollToTop";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://videodrop.app"),
  title: {
    default: "VideoDrop — Free Browser-Based Video Tools",
    template: "%s | VideoDrop",
  },
  description:
    "Compress, convert, trim, resize, and edit videos — all in your browser. No uploads, no servers, blazing fast. 34 free tools, 100% private.",
  keywords: [
    "video compressor",
    "video converter",
    "trim video online",
    "compress video",
    "convert mp4",
    "remove audio from video",
    "extract audio",
    "free video tools",
    "browser video editor",
    "ffmpeg online",
    "video to gif",
    "resize video",
    "crop video online",
    "merge videos",
    "reverse video",
    "loop video",
    "boomerang video",
    "add watermark to video",
    "video fade in out",
    "adjust video volume",
    "replace audio in video",
    "split video",
    "burn subtitles",
    "picture in picture video",
    "background music video",
    "video to webp",
    "change aspect ratio",
    "sharpen video",
    "denoise video",
    "green screen removal",
    "chroma key online",
    "video thumbnail generator",
    "timelapse maker",
    "split screen video",
    "video editor no upload",
    "private video editor",
    "webassembly video tools",
  ],
  openGraph: {
    title: "VideoDrop — Free Browser-Based Video Tools",
    description:
      "34 free video tools running entirely in your browser. Compress, convert, trim, and more — no uploads, no servers.",
    type: "website",
    siteName: "VideoDrop",
    url: "https://videodrop.app",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VideoDrop — Free Browser-Based Video Tools",
    description:
      "34 free video tools running entirely in your browser. Compress, convert, trim, and more — no uploads, no servers.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://videodrop.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "VideoDrop",
    "description": "Free browser-based video tools. Compress, convert, trim, resize, and more. No uploads, no servers.",
    "url": "https://videodrop.app",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Video Compression",
      "Video Conversion",
      "Video Trimming",
      "Video Resizing",
      "GIF Creation",
      "Audio Extraction",
      "Audio Removal",
      "Video Rotation",
      "Speed Adjustment",
      "Video Merging",
      "Video Cropping",
      "Frame Extraction",
      "Video Filters",
      "Batch Processing",
      "Video Reverse",
      "Video Looping",
      "Video Flipping",
      "Boomerang Effect",
      "Text Watermark",
      "Fade Transitions",
      "Volume Adjustment",
      "Audio Replacement",
      "Video Splitting",
      "Subtitle Burn-in",
      "Picture-in-Picture",
      "Background Music Mixing",
      "Video to WebP",
      "Aspect Ratio Change",
      "Video Sharpening",
      "Video Denoising",
      "Chroma Key / Green Screen",
      "Thumbnail Generation",
      "Timelapse from Images",
      "Split Screen Video",
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-zinc-900 focus:text-sm focus:font-medium"
          >
            Skip to content
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            <AnimatedLayout>{children}</AnimatedLayout>
          </main>
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
