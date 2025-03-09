"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlausible } from "next-plausible";

import { BorderRadiusSelector } from "@/components/border-radius-selector";
import { ErrorMessage } from "@/components/shared/error-message";
import { FetchFromUrlForm } from "@/components/shared/fetch-from-url-form";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { OptionSelector } from "@/components/shared/option-selector";
import { PreviewScale } from "@/components/shared/preview-scale";
import { UploadBox } from "@/components/shared/upload-box";

import { useFileFetcher } from "@/hooks/use-file-fetcher";
import { useFileUploader } from "@/hooks/use-file-uploader";
import { useKeyDown } from "@/hooks/use-keydown";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { isInteractiveElementFocused } from "@/lib/dom-utils";

import { type ImageMetadata } from "@/lib/file-utils";
import { type FileFetcherResult } from "@/hooks/use-file-fetcher";
import { type FileUploaderResult } from "@/hooks/use-file-uploader";

type Radius = number;

type BackgroundOption = "white" | "black" | "transparent";

function useImageConverter(props: {
  canvas: HTMLCanvasElement | null;
  imageContent: string;
  radius: Radius;
  background: BackgroundOption;
  fileName?: string;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const { width, height } = useMemo(() => {
    return {
      width: props.imageMetadata.width,
      height: props.imageMetadata.height,
    };
  }, [props.imageMetadata]);

  const convertToPng = async () => {
    const ctx = props.canvas?.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const saveImage = () => {
      if (props.canvas) {
        const dataURL = props.canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        const imageFileName = props.imageMetadata.name ?? "image_converted";
        link.download = `${imageFileName.replace(/\..+$/, "")}.png`;
        link.click();
      }
    };

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = props.background;
      ctx.fillRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(props.radius, 0);
      ctx.lineTo(width - props.radius, 0);
      ctx.quadraticCurveTo(width, 0, width, props.radius);
      ctx.lineTo(width, height - props.radius);
      ctx.quadraticCurveTo(width, height, width - props.radius, height);
      ctx.lineTo(props.radius, height);
      ctx.quadraticCurveTo(0, height, 0, height - props.radius);
      ctx.lineTo(0, props.radius);
      ctx.quadraticCurveTo(0, 0, props.radius, 0);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, width, height);
      saveImage();
    };

    img.src = props.imageContent;
  };

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
  };
}

interface ImageRendererProps {
  imageContent: string;
  imageMetadata: { width: number; height: number; name: string };
  radius: Radius | null;
  background: BackgroundOption;
  setPreviewScale: (scale: number | null) => void;
  imageContainer: React.RefObject<HTMLDivElement> | null;
}

const ImageRenderer = ({
  imageContent,
  imageMetadata,
  radius,
  background,
  setPreviewScale,
  imageContainer,
}: ImageRendererProps) => {
  const [effectiveBorderRadius, setEffectiveBorderRadius] = useState<number | null>(radius);
  const [internalScale, setInternalScale] = useState<number>(1);

  useEffect(() => {
    if (!imageContainer?.current || !imageContent) return;
    const container = imageContainer.current;

    const updatePreviewScaleFactor = () => {
      const imageContainerWidth = container.clientWidth;
      
      const previewScaleFactor = Math.min(
        imageContainerWidth / imageMetadata.width,
        imageContainerWidth / imageMetadata.height,
        1 // Prevent upscaling
      )

      setEffectiveBorderRadius((radius ?? 1) * previewScaleFactor);
      setPreviewScale(previewScaleFactor < 1 ? previewScaleFactor : null);
      setInternalScale(previewScaleFactor);
    }

    updatePreviewScaleFactor();
    const resizeObserver = new ResizeObserver(updatePreviewScaleFactor);
    resizeObserver.observe(container);
    
    return () => resizeObserver.disconnect();
  }, [imageContent, imageMetadata, radius, imageContainer, setPreviewScale]);

  return (
    <div style={{ backgroundColor: background }}>
      <img
        src={imageContent}
        width={imageMetadata.width * internalScale}
        height={imageMetadata.height * internalScale}
        alt="Preview"
        style={{
          borderRadius: `${effectiveBorderRadius}px`,
          objectFit: "contain",
        }}
      />
    </div>
  );
};

function SaveAsPngButton({
  imageContent,
  radius,
  background,
  imageMetadata,
}: {
  imageContent: string;
  radius: Radius;
  background: BackgroundOption;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const { convertToPng, canvasProps } = useImageConverter({
    canvas: canvasRef,
    imageContent,
    radius,
    background,
    imageMetadata,
  });

  const plausible = usePlausible();

  return (
    <div>
      <canvas ref={setCanvasRef} {...canvasProps} hidden />
      <button
        onClick={() => {
          plausible("convert-image-to-png");
          void convertToPng();
        }}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
      >
        Save as PNG
      </button>
    </div>
  );
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

type RoundedToolCoreProps = {
  fileUploaderProps: FileUploaderResult;
  fileFetcherProps: FileFetcherResult;
  error: string | null;
  onError: (error: string | null) => void;
};

function RoundedToolCore({
  fileUploaderProps,
  fileFetcherProps,
  error,
  onError,
 }: RoundedToolCoreProps) {
  const router = useRouter();
  const [radius, setRadius] = useLocalStorage<Radius | null>("roundedTool_radius", 2);
  const [isCustomRadius, setIsCustomRadius] = useState(false);
  const [background, setBackground] = useLocalStorage<BackgroundOption>(
    "roundedTool_background",
    "transparent",
  );

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata>(fileUploaderProps.imageMetadata);
  const [imageContent, setImageContent] = useState<string>(fileUploaderProps.imageContent);
  const [previewScale, setPreviewScale] = useState<number | null>(null);
  
  const cancel = () => {
    fileUploaderProps.cancel();
    fileFetcherProps.cancel();
    setImageMetadata(null);
    setImageContent('');
    setPreviewScale(null);
  }

  const handleRadiusChange = (value: number | "custom") => {
    if (value === "custom") {
      setIsCustomRadius(true);
    } else {
      setRadius(value);
      setIsCustomRadius(false);
    }
  };

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

  // Run the cancel function when the user presses the Escape key on the preview screen,
  // and navigate back to the home screen when the user presses Escape on the initial tool screen
  useKeyDown("Escape", () => {
    if (imageMetadata && imageContent) {
      // Preview screen
      if (isInteractiveElementFocused("ALL", ["option", "select"])) {
        // if any option selector buttons are focused, blur them instead of going back to initial tool screen
        (document.activeElement as HTMLButtonElement).blur();
      } else {
        // otherwise, cancel/go back to initial tool screen
        cancel();
      }
    } else {
      // Initial tool screen
      if (isInteractiveElementFocused("INPUT")) return; // ignore if input is focused
      router.push("/"); // otherwise, return to home screen
    }
  });

  if (!imageMetadata) {
    return (
      <div className='flex flex-col items-center gap-4'>
        <UploadBox
          title="Add rounded borders to your images. Quick and easy."
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
    <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-6 p-8">
      {/* Preview Section */}
      <div ref={imageContainerRef} className="flex w-full flex-col items-center gap-4 rounded-xl">
        <PreviewScale previewScale={previewScale} />
        <ImageRenderer
          imageContent={imageContent}
          imageMetadata={imageMetadata}
          radius={radius}
          background={background}
          setPreviewScale={setPreviewScale}
          imageContainer={imageContainerRef as React.RefObject<HTMLDivElement>}
        />
        <p className="text-lg font-medium text-white/80 break-all">
          {imageMetadata.name}
        </p>
      </div>

      {/* Size Information */}
      <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
        <span className="text-sm text-white/60 text-center">Actual Size</span>
        <span className="font-medium text-white text-center">
          {imageMetadata.width} × {imageMetadata.height}
        </span>
      </div>

      {/* Radius & Background Controls */}
      <BorderRadiusSelector
        title="Border Radius"
        options={[2, 4, 8, 16, 32, 64]}
        selected={isCustomRadius ? "custom" : (radius ?? 1)}
        onChange={handleRadiusChange}
        customValue={radius}
        onCustomValueChange={setRadius}
      />

      <OptionSelector
        title="Background"
        options={["white", "black", "transparent"]}
        selected={background}
        onChange={setBackground}
        formatOption={(option) =>
          option.charAt(0).toUpperCase() + option.slice(1)
        }
      />

      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/10 focus:bg-white/10"
        >
          Cancel
        </button>
        <SaveAsPngButton
          imageContent={imageContent}
          radius={radius ?? 1}
          background={background}
          imageMetadata={imageMetadata}
        />
      </div>
    </div>
  );
}

export function RoundedTool() {
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
      <RoundedToolCore
        fileUploaderProps={fileUploaderProps}
        fileFetcherProps={fileFetcherProps}
        error={error}
        onError={setError}
      />
    </FileDropzone>
  );
}
