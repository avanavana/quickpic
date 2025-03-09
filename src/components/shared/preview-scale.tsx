import { EyeIcon } from "@/components/shared/icons";

import { formatNumber } from "@/lib/math-utils";

interface PreviewScaleProps {
  previewScale: number | null;
}

export function PreviewScale({ previewScale }: PreviewScaleProps) {
  // If the image preview is scaled down to fit, display the scaled percentage
  return previewScale && previewScale < 1 && (
      <div className="flex items-center gap-1 rounded-full border border-white/30 bg-white/5 px-3 py-0.5 text-center text-sm text-white/60 whitespace-nowrap">
        <EyeIcon className="-ml-1" />
        {`Viewing at ${formatNumber((previewScale * 100))}%`}
      </div>
    )
}