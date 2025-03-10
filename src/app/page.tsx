import Link from "next/link";

import { Footer } from "@/components/shared/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-between px-8 pb-4 font-[family-name:var(--font-geist-sans)]">
      <main className="flex grow flex-col items-center justify-center text-center">
        <div>
          Hi. I&apos;m{" "}
          <a
            href="https://twitter.com/t3dotgg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Theo
          </a>
          . I built these tools because I was annoyed they did not exist.
        </div>
        <div className="mt-8 flex flex-col gap-2">
          <Link
            href="/svg-to-png"
            className="font-medium text-blue-500 transition-colors duration-200 hover:text-white focus:text-white focus:outline-0"
            tabIndex={0}
          >
            SVG to PNG Converter
          </Link>
          <Link
            href="/square-image"
            className="font-medium text-blue-500 transition-colors duration-200 hover:text-white focus:text-white focus:outline-0"
            tabIndex={0}
          >
            Square Image Generator
          </Link>
          <Link
            href="/rounded-border"
            className="font-medium text-blue-500 transition-colors duration-200 hover:text-white focus:text-white focus:outline-0"
            tabIndex={0}
          >
            Corner Rounder
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
