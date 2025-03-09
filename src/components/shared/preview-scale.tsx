import { formatNumber } from "@/lib/math-utils";

function PreviewScaleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 -ml-1 shrink-0"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

interface PreviewScaleProps {
  previewScale: number | null;
}

export function PreviewScale({ previewScale }: PreviewScaleProps) {
  // If the image preview is scaled down to fit, display the scaled percentage
  return previewScale && previewScale < 1 && (
      <div className="flex items-center gap-1 rounded-full border border-white/30 bg-white/5 px-3 py-0.5 text-center text-sm text-white/60 whitespace-nowrap">
        <PreviewScaleIcon />
        {`Viewing at ${formatNumber((previewScale * 100))}%`}
      </div>
    )
}