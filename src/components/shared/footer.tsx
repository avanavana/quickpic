import { GitHubIcon } from "@/components/shared/icons";

export function Footer() {
  return (
    <footer className="mt-8 text-center text-sm text-gray-500">
      <a
        href="https://github.com/t3dotgg/quickpic"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium hover:text-gray-200 focus:text-gray-200 transition-colors duration-200"
      >
        <GitHubIcon />
        View on GitHub
      </a>
    </footer>
  )
}