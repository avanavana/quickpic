import React from "react";

import { UploadIcon } from "@/components/shared/icons";

interface UploadBoxProps {
  title: string;
  subtitle?: string;
  subtitleIcon?: React.ReactElement;
  description: string;
  accept: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadBox({
  title,
  subtitle,
  subtitleIcon,
  description,
  accept,
  onChange,
}: UploadBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="flex flex-col items-center gap-2">
        <p id="upload-box-title" className="text-center text-white">{title}</p>
        {subtitle && (
          <p id="upload-box-subtitle" className="flex gap-1 items-center rounded-full border border-white/30 bg-white/5 px-3 py-0.5 text-center text-sm text-white/60">
            {subtitleIcon}
            {subtitle}
          </p>
        )}
      </div>
      <div
        role="group"
        aria-labelledby="upload-box-title"
        aria-describedby="upload-box-instructions"
        className="flex flex-col items-center justify-center gap-4 w-full sm:w-container max-w-container rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-6 backdrop-blur-sm"
      >
        <UploadIcon className="size-8 text-gray-500" />
        <p className="font-medium text-sm text-gray-500">Drag and Drop</p>
        <p className="font-medium text-sm text-gray-500">or</p>
        <label
          role="button"
          tabIndex={0}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          <span>{description}</span>
          <input
            type="file"
            onChange={onChange}
            accept={accept}
            className="hidden"
            aria-labelledby="upload-box-title"
            aria-describedby="upload-box-instructions"
            aria-hidden="true"
          />
        </label>
      </div>
    </div>
  );
}
