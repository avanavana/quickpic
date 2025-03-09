import React, { useCallback, useState, useRef } from "react";

import { type FileTypeString, generateFileTypesString } from "@/lib/file-utils";

interface FileDropzoneProps {
  children: React.ReactNode;
  acceptedFileTypes: string[];
  dropText: string;
  setCurrentFile: (file: File) => void;
  onError?: (error: string | null) => void;
}

export function FileDropzone({
  children,
  acceptedFileTypes,
  dropText,
  setCurrentFile,
  onError,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const handleDragIn = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;

    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }

  const handleDragOut = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const droppedFile = files[0];

        if (!droppedFile) {
          if (onError) onError("How did you do a drop with no files???");
          else alert("How did you do a drop with no files???");
          return;
        }

        if (
          !acceptedFileTypes.includes(droppedFile.type) &&
          !acceptedFileTypes.some((type) =>
            droppedFile.name.toLowerCase().endsWith(type.replace("*", ""))
          )
        ) {
          const acceptedFileTypesString = generateFileTypesString(acceptedFileTypes as FileTypeString[]);
          if (onError) onError(`Uploaded file has invalid type. Valid types are: ${acceptedFileTypesString}.`); 
          else alert(`Uploaded file has invalid type. Valid types are: ${acceptedFileTypesString}.`);
          return;
        }

        // Happy path
        setCurrentFile(droppedFile);
      }
    },
    [acceptedFileTypes, setCurrentFile, onError],
  );

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="h-full w-full"
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 p-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="animate-in fade-in zoom-in relative flex flex-col size-full transform items-center justify-center rounded-xl border-2 border-dashed border-white/30 transition-all duration-200 ease-out">
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
              className="size-12 text-gray-500"
              role="img"
              aria-hidden="true"
            >
              <path d="M12 13v8"/>
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
              <path d="m8 17 4-4 4 4"/>
            </svg>
            <p className="text-2xl font-semibold text-gray-500">{dropText}</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
