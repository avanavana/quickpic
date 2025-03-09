"use client";

import { useEffect, useState } from "react";
import { usePlausible } from "next-plausible";

import { ErrorMessage } from "@/components/shared/error-message";
import { FetchFromUrlForm } from "@/components/shared/fetch-from-url-form";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { OptionSelector } from "@/components/shared/option-selector";
import { UploadBox } from "@/components/shared/upload-box";

import { useFileFetcher } from "@/hooks/use-file-fetcher";
import { useFileUploader } from "@/hooks/use-file-uploader";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { type FileFetcherResult } from "@/hooks/use-file-fetcher";
import { type FileUploaderResult } from "@/hooks/use-file-uploader";
import { type ImageMetadata } from "@/lib/file-utils";

function SaveSquareImageButton({
  imageContent,
  imageMetadata,
}: {
  imageContent: string | null;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const handleSaveImage = () => {
    if (imageContent && imageMetadata) {
      const link = document.createElement("a");
      link.href = imageContent;
      const originalFileName = imageMetadata.name;
      const fileNameWithoutExtension =
        originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
        originalFileName;
      link.download = `${fileNameWithoutExtension}-squared.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const plausible = usePlausible();

  return (
    <button
      onClick={() => {
        plausible("create-square-image");
        handleSaveImage();
      }}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
    >
      Save Image
    </button>
  )
}

function ClipboardPasteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 -ml-1 shrink-0">
      <path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z"/>
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2M11 14h10"/>
      <path d="m17 10 4 4-4 4"/>
    </svg>
  )
}

type SquareToolCoreProps = {
  fileUploaderProps: FileUploaderResult;
  fileFetcherProps: FileFetcherResult;
  error: string | null;
  onError: (error: string | null) => void;
};

function SquareToolCore({
  fileUploaderProps,
  fileFetcherProps,
  error,
  onError,
}: SquareToolCoreProps) {
  const [backgroundColor, setBackgroundColor] = useLocalStorage<
    "black" | "white"
  >("squareTool_backgroundColor", "white");

  const [squareImageContent, setSquareImageContent] = useState<string | null>(
    null,
  );

  const [imageMetadata, setImageMetadata] = useState<ImageMetadata>(fileUploaderProps.imageMetadata);
  const [imageContent, setImageContent] = useState<string>(fileUploaderProps.imageContent);
  
  const cancel = () => {
    fileUploaderProps.cancel();
    fileFetcherProps.cancel();
    setImageMetadata(null);
    setImageContent('');
  }

  useEffect(() => {
    // Grab metadata and content from method of file upload
    let metadata: ImageMetadata | null = null;
    let content: string | null = null;

    if (fileUploaderProps.imageMetadata) {
      metadata = fileUploaderProps.imageMetadata;
      content = fileUploaderProps.imageContent;
    } else {
      metadata = fileFetcherProps.imageMetadata;
      content = fileFetcherProps.imageContent;
    }

    if (metadata) {
      setImageMetadata(metadata);
      setImageContent(content);
      onError(null);
    } else {
      setImageMetadata(null);
      setImageContent('');
    }
  }, [
    fileUploaderProps.imageMetadata,
    fileUploaderProps.imageContent,
    fileFetcherProps.imageMetadata,
    fileFetcherProps.imageContent,
    onError,
  ]);

  useEffect(() => {
    if (imageContent && imageMetadata) {
      const canvas = document.createElement("canvas");
      const size = Math.max(imageMetadata.width, imageMetadata.height);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size, size);

      // Load and center the image
      const img = new Image();
      img.onload = () => {
        const x = (size - imageMetadata.width) / 2;
        const y = (size - imageMetadata.height) / 2;
        ctx.drawImage(img, x, y);
        setSquareImageContent(canvas.toDataURL("image/png"));
      };
      img.src = imageContent;
    }
  }, [imageContent, imageMetadata, backgroundColor]);

  if (!imageMetadata) {
    return (
      <div className='flex flex-col items-center gap-4'>
        <UploadBox
          title="Create square images with custom backgrounds. Fast and free."
          subtitle="Allows pasting images from clipboard"
          subtitleIcon={ClipboardPasteIcon}
          description="Upload Image"
          accept="image/*"
          onChange={fileUploaderProps.handleFileUploadEvent}
        />

        <FetchFromUrlForm
          accept="image/*"
          error={fileFetcherProps.error}
          pending={fileFetcherProps.pending}
          handleSubmit={fileFetcherProps.handleFetchFile}
        />

        {error && <ErrorMessage error={error} />}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      {/* Preview Section */}
      <div className="flex w-full flex-col items-center gap-4 rounded-xl">
        {squareImageContent && (
          <img src={squareImageContent} alt="Preview" className="mb-4" />
        )}
        <p className="text-lg font-medium text-white/80 break-all">
          {imageMetadata.name}
        </p>
      </div>

      {/* Size Information */}
      <div className="flex gap-6 text-base">
        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60 text-center">Original Size</span>
          <span className="font-medium text-white text-center">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60 text-center">Square Size</span>
          <span className="font-medium text-white text-center">
            {Math.max(imageMetadata.width, imageMetadata.height)}
            {" × "}
            {Math.max(imageMetadata.width, imageMetadata.height)}
          </span>
        </div>
      </div>

      {/* Background Controls */}
      <OptionSelector
        title="Background Color"
        options={["white", "black"]}
        selected={backgroundColor}
        onChange={setBackgroundColor}
        formatOption={(option) =>
          option.charAt(0).toUpperCase() + option.slice(1)
        }
      />

      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/10 focus:bg-white/10"
        >
          Cancel
        </button>
        <SaveSquareImageButton
          imageContent={squareImageContent}
          imageMetadata={imageMetadata}
        />
      </div>
    </div>
  );
}

export function SquareTool() {
  const [error, setError] = useState<string | null>(null);
  const fileUploaderProps = useFileUploader({ onError: setError });
  const fileFetcherProps = useFileFetcher({ onError: setError });

  return (
    <FileDropzone
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image file"
      setCurrentFile={fileUploaderProps.handleFileUpload}
      onError={setError}
    >
      <SquareToolCore  
        fileUploaderProps={fileUploaderProps}
        fileFetcherProps={fileFetcherProps}
        error={error}
        onError={setError}
      />
    </FileDropzone>
  );
}
