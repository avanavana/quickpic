import Link from "next/link";

import { ArrowLeftIcon, GitHubIcon } from "@/components/shared/icons";

function BackButton() {
  return (
    <div className="fixed left-4 top-4 z-50">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-200"
      >
        <ArrowLeftIcon strokeWidth={2.5} />
        Back
      </Link>
    </div>
  );
}

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-between px-8 pb-4 font-[family-name:var(--font-geist-sans)]">
      <BackButton />
      <main className="flex flex-col grow items-center justify-center">
        {children}
      </main>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <a
          href="https://github.com/t3dotgg/quickpic"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium hover:text-gray-200 focus:text-gray-200 transition-colors duration-200"
        >
          <GitHubIcon />
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
