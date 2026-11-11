
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileImage,
  LockKeyhole,
  RotateCcw,
  UploadCloud,
  Camera,
  CalendarClock,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { MetadataInspector } from "@/components/metadata-inspector";
import { CameraBrandDisplay } from "@/components/camera-brand/camera-brand-display";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type SelectedImage = {
  file: File;
  url: string;
  width: number;
  height: number;
};

type CameraMetadata = {
  Make?: string;
  Model?: string;
  DateTimeOriginal?: Date | string | null;
};

type RawMetadata = Record<string, unknown>;

function getMetadataValue(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "Not available";
  }

  return String(value);
}

function formatCaptureDate(value?: Date | string | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return {
    date: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  };
}

export function ImageUploadWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<SelectedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [cameraMetadata, setCameraMetadata] =
    useState<CameraMetadata | null>(null);

  const [metadataLoading, setMetadataLoading] = useState(false);

  // Receive metadata from the single EXIF parser
  const handleMetadataLoaded = useCallback(
    (metadata: RawMetadata) => {
      setCameraMetadata({
        Make:
          typeof metadata.Make === "string"
            ? metadata.Make
            : undefined,

        Model:
          typeof metadata.Model === "string"
            ? metadata.Model
            : undefined,

        DateTimeOriginal:
          metadata.DateTimeOriginal instanceof Date ||
          typeof metadata.DateTimeOriginal === "string"
            ? metadata.DateTimeOriginal
            : null,
      });

      setMetadataLoading(false);
    },
    []
  );

  // Reset image
  const reset = useCallback(() => {
    setImage((current) => {
      if (current) {
        URL.revokeObjectURL(current.url);
      }

      return null;
    });

    setCameraMetadata(null);
    setMetadataLoading(false);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  // Revoke object URL on replacement or unmount
  useEffect(() => {
    return () => {
      if (image?.url) {
        URL.revokeObjectURL(image.url);
      }
    };
  }, [image?.url]);

  // Image upload handler
  const loadFile = useCallback((file?: File) => {
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(
        "Unsupported file type. Please choose a JPG, PNG, or WebP image."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("This image exceeds the 50 MB upload limit.");
      return;
    }

    if (file.size === 0) {
      setError("This file is empty or invalid.");
      return;
    }

    setCameraMetadata(null);
    setMetadataLoading(true);

    const url = URL.createObjectURL(file);
    const probe = new Image();

    probe.onload = () => {
      setImage((current) => {
        if (current) {
          URL.revokeObjectURL(current.url);
        }

        return {
          file,
          url,
          width: probe.naturalWidth,
          height: probe.naturalHeight,
        };
      });
    };

    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setMetadataLoading(false);
      setError(
        "The selected file could not be decoded as an image."
      );
    };

    probe.src = url;
  }, []);

  const captureDate = formatCaptureDate(
    cameraMetadata?.DateTimeOriginal
  );

  return (
    <div className="space-y-5">
      {/* Upload Area */}
      {!image ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            loadFile(event.dataTransfer.files[0]);
          }}
          className={`flex min-h-[310px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed px-6 py-12 text-center transition-colors ${
            dragging
              ? "border-emerald-600 bg-emerald-500/[0.06]"
              : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-[var(--surface-active)]">
            <UploadCloud size={25} strokeWidth={1.6} />
          </span>

          <span className="text-[15px] font-semibold tracking-[-0.02em]">
            Drop your image here
          </span>

          <span className="mt-2 text-[11px] text-[var(--muted)]">
            or click to browse files
          </span>

          <span className="mt-5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-[10px] text-[var(--muted)]">
            JPG · PNG · WebP · Up to 50 MB
          </span>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(event) =>
              loadFile(event.target.files?.[0])
            }
          />
        </button>
      ) : (
        /* Image Workspace */
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">

          {/* Left Column: Preview + Brand Attribution */}
          <div className="min-w-0 space-y-4">

            {/* Image Preview */}
            <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <img
                src={image.url}
                alt="Selected image preview"
                className="max-h-[520px] max-w-full rounded-lg object-contain"
              />
            </div>

            {/* Camera Brand Recognition */}
            <CameraBrandDisplay
              make={cameraMetadata?.Make}
              model={cameraMetadata?.Model}
              loading={metadataLoading}
            />
          </div>

          {/* Right Column: Image Details */}
          <div className="min-w-0 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5">

            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <span className="text-[12px] font-semibold">
                Image details
              </span>

              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            {/* File Identity */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-active)]">
                <FileImage size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium">
                  {image.file.name}
                </p>

                <p className="mt-1 text-[10px] text-[var(--muted)]">
                  {image.file.type || "Unknown format"}
                </p>
              </div>
            </div>

            {/* Camera Information */}
            <div className="border-t border-[var(--border)] pt-4">
              <div className="mb-4 flex items-center gap-2">
                <Camera
                  size={14}
                  className="text-emerald-600"
                />

                <span className="text-[11px] font-semibold">
                  Camera Information
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-[var(--muted)]">
                    Camera Make
                  </span>

                  <span className="text-right font-medium">
                    {metadataLoading
                      ? "Reading..."
                      : getMetadataValue(cameraMetadata?.Make)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-[var(--muted)]">
                    Camera Model
                  </span>

                  <span className="text-right font-medium">
                    {metadataLoading
                      ? "Reading..."
                      : getMetadataValue(cameraMetadata?.Model)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-[var(--muted)]">
                    Date Taken
                  </span>

                  <span className="text-right font-medium">
                    {metadataLoading
                      ? "Reading..."
                      : captureDate?.date ?? "Not available"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-[var(--muted)]">
                    <CalendarClock size={12} />
                    Time Taken
                  </span>

                  <span className="text-right font-medium">
                    {metadataLoading
                      ? "Reading..."
                      : captureDate?.time ?? "Not available"}
                  </span>
                </div>
              </div>
            </div>

            {/* File Information */}
            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <div className="mb-4 flex items-center gap-2">
                <FileImage
                  size={14}
                  className="text-emerald-600"
                />

                <span className="text-[11px] font-semibold">
                  File Information
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-[var(--muted)]">
                    Dimensions
                  </span>

                  <span className="font-medium">
                    {image.width.toLocaleString()} ×{" "}
                    {image.height.toLocaleString()} px
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-[var(--muted)]">
                    File size
                  </span>

                  <span className="font-medium">
                    {formatBytes(image.file.size)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-[var(--muted)]">
                    Format
                  </span>

                  <span className="font-medium">
                    {image.file.type.split("/")[1]?.toUpperCase() ??
                      "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-emerald-500/[0.06] p-3 text-[10px] leading-5 text-[var(--muted)]">
              <LockKeyhole
                size={14}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              The image is currently held in browser memory. It has not
              been uploaded.
            </div>
          </div>
        </div>
      )}

      {/* Full Metadata Inspector */}
      {image && (
        <MetadataInspector
          file={image.file}
          onMetadataLoaded={handleMetadataLoaded}
        />
      )}

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[11px] text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {/* Privacy Footer */}
      <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
        <LockKeyhole
          size={13}
          className="text-emerald-600"
        />

        Your images are processed locally in your browser. They are
        never uploaded to our servers.
      </div>
    </div>
  );
}
