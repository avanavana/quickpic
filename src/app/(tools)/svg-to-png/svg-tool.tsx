"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePlausible } from "next-plausible";

import { ErrorMessage } from "@/components/shared/error-message";
import { FetchFromUrlForm } from "@/components/shared/fetch-from-url-form";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { UploadBox } from "@/components/shared/upload-box";
import { SVGScaleSelector } from "@/components/svg-scale-selector";

import { useFileFetcher } from "@/hooks/use-file-fetcher";
import { useFileUploader } from "@/hooks/use-file-uploader";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { type FileFetcherResult } from "@/hooks/use-file-fetcher";
import { type FileUploaderResult } from "@/hooks/use-file-uploader";
import { type ImageMetadata } from "@/lib/file-utils";

export type Scale = "custom" | number;

function scaleSvg(svgContent: string, scale: number) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const width = parseInt(svgElement.getAttribute("width") ?? "300");
  const height = parseInt(svgElement.getAttribute("height") ?? "150");

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  svgElement.setAttribute("width", scaledWidth.toString());
  svgElement.setAttribute("height", scaledHeight.toString());

  return new XMLSerializer().serializeToString(svgDoc);
}

function useSvgConverter(props: {
  canvas: HTMLCanvasElement | null;
  svgContent: string;
  scale: number;
  fileName?: string;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const { width, height, scaledSvg } = useMemo(() => {
    const scaledSvg = scaleSvg(props.svgContent, props.scale);

    return {
      width: props.imageMetadata.width * props.scale,
      height: props.imageMetadata.height * props.scale,
      scaledSvg,
    };
  }, [props.svgContent, props.scale, props.imageMetadata]);

  const convertToPng = async () => {
    const ctx = props.canvas?.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    // Trigger a "save image" of the resulting canvas content
    const saveImage = () => {
      if (props.canvas) {
        const dataURL = props.canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        const svgFileName = props.imageMetadata.name ?? "svg_converted";

        // Remove the .svg extension
        link.download = `${svgFileName.replace(".svg", "")}-${props.scale}x.png`;
        link.click();
      }
    };

    const img = new Image();
    // Call saveImage after the image has been drawn
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      saveImage();
    };

    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scaledSvg)}`;
  };

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
  };
}

interface SVGRendererProps {
  svgContent: string;
}

function SVGRenderer({ svgContent }: SVGRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svgContent;
      const svgElement = containerRef.current.querySelector("svg");
      if (svgElement) {
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");
      }
    }
  }, [svgContent]);

  return <div ref={containerRef} />;
}

function SaveAsPngButton({
  svgContent,
  scale,
  imageMetadata,
}: {
  svgContent: string;
  scale: number;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const { convertToPng, canvasProps } = useSvgConverter({
    canvas: canvasRef,
    svgContent,
    scale,
    imageMetadata,
  });

  const plausible = usePlausible();

  return (
    <div>
      <canvas ref={setCanvasRef} {...canvasProps} hidden />
      <button
        onClick={() => {
          plausible("convert-svg-to-png");
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

type SVGToolCoreProps = {
  fileUploaderProps: FileUploaderResult;
  fileFetcherProps: FileFetcherResult;
  error: string | null;
  onError: (error: string | null) => void;
};

function SVGToolCore({
  fileUploaderProps,
  fileFetcherProps,
  error,
  onError,
}: SVGToolCoreProps) {
  const [scale, setScale] = useLocalStorage<Scale>("svgTool_scale", 1);
  const [customScale, setCustomScale] = useLocalStorage<number>(
    "svgTool_customScale",
    1,
  );

  const [imageMetadata, setImageMetadata] = useState<ImageMetadata>(fileUploaderProps.imageMetadata);
  const [imageContent, setImageContent] = useState<string>(fileUploaderProps.imageContent);
  const [rawContent, setRawContent] = useState<string>(fileUploaderProps.rawContent);

  // Get the actual numeric scale value
  const effectiveScale = scale === "custom" ? customScale : scale;

  const cancel = () => {
    fileUploaderProps.cancel();
    fileFetcherProps.cancel();
    setImageMetadata(null);
    setImageContent('');
    setRawContent('');
  }

  useEffect(() => {
    // Grab metadata and content from method of file upload
    // Make sure SVG metadata is normalized in case width/height are not explicitly defined
    let metadata: ImageMetadata | null = null;
    let content: string | null = null;
    let raw: string | null = null;

    if (fileUploaderProps.imageMetadata) {
      metadata = fileUploaderProps.imageMetadata;
      content = fileUploaderProps.imageContent;
      raw = fileUploaderProps.rawContent;
    } else {
      metadata = fileFetcherProps.imageMetadata;
      content = fileFetcherProps.imageContent;
      raw = fileFetcherProps.rawContent;
    }

    if (metadata) {
      setImageMetadata(metadata);
      setImageContent(content);
      setRawContent(raw);
      onError(null);
    } else {
      setImageMetadata(null);
      setImageContent('');
      setRawContent('');
    }
  }, [
    fileUploaderProps.imageMetadata,
    fileUploaderProps.imageContent,
    fileUploaderProps.rawContent,
    fileFetcherProps.imageMetadata,
    fileFetcherProps.imageContent,
    fileFetcherProps.rawContent,
    onError,
  ]);

  if (!imageMetadata || !imageContent)
    return (
      <div className='flex flex-col items-center gap-4'>
        <UploadBox
          title="Make SVGs into PNGs. Also makes them bigger. (100% free btw.)"
          subtitle="Allows pasting images from clipboard"
          subtitleIcon={ClipboardPasteIcon}
          description="Upload SVG"
          accept=".svg"
          onChange={fileUploaderProps.handleFileUploadEvent}
        />

        <FetchFromUrlForm
          accept=".svg"
          error={fileFetcherProps.error}
          pending={fileFetcherProps.pending}
          handleSubmit={fileFetcherProps.handleFetchFile}
        />

        {error && <ErrorMessage error={error} />}
      </div>
    );

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      {/* Preview Section */}
      <div className="w-full flex flex-col items-center gap-4 rounded-xl">
        <SVGRenderer svgContent={rawContent} />
        <p className="text-lg font-medium text-white/80 break-all">
          {imageMetadata.name}
        </p>
      </div>

      {/* Size Information */}
      <div className="flex gap-6 text-base">
        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60 text-center">Original</span>
          <span className="font-medium text-white text-center">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60 text-center">Scaled</span>
          <span className="font-medium text-white text-center">
            {imageMetadata.width * effectiveScale}
            {" × "}
            {imageMetadata.height * effectiveScale}
          </span>
        </div>
      </div>

      {/* Scale Controls */}
      <SVGScaleSelector
        title="Scale Factor"
        options={[1, 2, 4, 8, 16, 32, 64]}
        selected={scale}
        onChange={setScale}
        customValue={customScale}
        onCustomValueChange={setCustomScale}
      />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/10 focus:bg-white/10"
        >
          Cancel
        </button>
        <SaveAsPngButton
          svgContent={rawContent}
          scale={effectiveScale}
          imageMetadata={imageMetadata}
        />
      </div>
    </div>
  );
}

export function SVGTool() {
  const [error, setError] = useState<string | null>(null);
  const fileUploaderProps = useFileUploader({ accept: [".svg", "image/svg+xml"], onError: setError });
  const fileFetcherProps = useFileFetcher({ onError: setError });

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/svg+xml", ".svg"]}
      dropText="Drop SVG file"
      onError={setError}
    >
      <SVGToolCore
        fileUploaderProps={fileUploaderProps}
        fileFetcherProps={fileFetcherProps}
        error={error}
        onError={setError}
      />
    </FileDropzone>
  );
}
