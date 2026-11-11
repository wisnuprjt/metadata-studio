
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  Camera,
  FileImage,
  LockKeyhole,
  RotateCcw,
  UploadCloud,
} from "lucide-react";

import { formatBytes } from "@/lib/utils";
import { MetadataInspector } from "@/components/metadata-inspector";
import { CameraBrandDisplay } from "@/components/camera-brand/camera-brand-display";
import {
  LocationInformation,
  type LocationResult,
  type LocationStatus,
} from "@/components/location-information";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
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

function isHeicFile(file: File): boolean {
  const extension = file.name.toLowerCase();

  const isHeicExtension =
    extension.endsWith(".heic") ||
    extension.endsWith(".heif");

  const isHeicMime = [
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
  ].includes(file.type.toLowerCase());

  return isHeicExtension || isHeicMime;
}

function isSupportedImage(file: File): boolean {
  const extension = file.name.toLowerCase();

  const supportedExtension =
    /\.(jpe?g|png|webp|heic|heif)$/i.test(extension);

  const supportedMime = ACCEPTED_TYPES.includes(
    file.type.toLowerCase()
  );

  return supportedExtension || supportedMime;
}

function getFileFormat(file: File): string {
  if (file.type) {
    return file.type.split("/")[1]?.toUpperCase() ?? "Unknown";
  }

  const extension = file.name.split(".").pop();

  return extension?.toUpperCase() ?? "Unknown";
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

function getCoordinate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function getGpsCoordinate(
  metadata: RawMetadata,
  coordinateKey: "latitude" | "longitude",
  rawKey: "GPSLatitude" | "GPSLongitude",
  refKey: "GPSLatitudeRef" | "GPSLongitudeRef"
): number | null {
  const direct = getCoordinate(metadata[coordinateKey]);

  if (direct !== null) {
    return direct;
  }

  const raw = metadata[rawKey];

  if (typeof raw !== "number" && !Array.isArray(raw)) {
    return null;
  }

  let decimal: number;

  if (typeof raw === "number") {
    decimal = raw;
  } else {
    const parts = raw.map(Number);

    if (
      parts.length < 3 ||
      parts.some((part) => !Number.isFinite(part))
    ) {
      return null;
    }

    decimal =
      Math.abs(parts[0]) +
      Math.abs(parts[1]) / 60 +
      Math.abs(parts[2]) / 3600;
  }

  const reference = String(metadata[refKey] ?? "").toUpperCase();

  if (reference === "S" || reference === "W") {
    decimal = -Math.abs(decimal);
  }

  return Number.isFinite(decimal) ? decimal : null;
}

export function ImageUploadWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  // Prevent older asynchronous file conversions from replacing newer files
  const fileLoadIdRef = useRef(0);

  const [image, setImage] = useState<SelectedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [cameraMetadata, setCameraMetadata] =
    useState<CameraMetadata | null>(null);

  const [metadataLoading, setMetadataLoading] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [location, setLocation] =
    useState<LocationResult | null>(null);

  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("unavailable");

  const [locationError, setLocationError] = useState("");

  const resetLocation = useCallback(() => {
    requestIdRef.current += 1;

    setLatitude(null);
    setLongitude(null);
    setLocation(null);
    setLocationStatus("unavailable");
    setLocationError("");
  }, []);

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

      const lat = getGpsCoordinate(
        metadata,
        "latitude",
        "GPSLatitude",
        "GPSLatitudeRef"
      );

      const lon = getGpsCoordinate(
        metadata,
        "longitude",
        "GPSLongitude",
        "GPSLongitudeRef"
      );

      if (
        lat !== null &&
        lon !== null &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
      ) {
        setLatitude(lat);
        setLongitude(lon);
        setLocation(null);
        setLocationError("");
        setLocationStatus("consent");
      } else {
        setLatitude(null);
        setLongitude(null);
        setLocation(null);
        setLocationStatus("unavailable");
      }

      setMetadataLoading(false);
    },
    []
  );

  const reset = useCallback(() => {
    // Cancel any pending conversion
    fileLoadIdRef.current += 1;

    requestIdRef.current += 1;

    setImage((current) => {
      if (current) {
        URL.revokeObjectURL(current.url);
      }

      return null;
    });

    setCameraMetadata(null);
    setMetadataLoading(false);
    setError(null);

    resetLocation();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [resetLocation]);

  useEffect(() => {
    return () => {
      if (image?.url) {
        URL.revokeObjectURL(image.url);
      }
    };
  }, [image?.url]);

  const loadFile = useCallback(
    async (file?: File) => {
      if (!file) return;

      const currentLoadId = ++fileLoadIdRef.current;

      setError(null);

      if (!isSupportedImage(file)) {
        setError(
          "Unsupported file type. Please choose a JPG, PNG, WebP, HEIC, or HEIF image."
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

      resetLocation();

      setCameraMetadata(null);
      setMetadataLoading(true);

      try {
        let previewBlob: Blob = file;

        // Convert HEIC/HEIF to JPEG locally for browser preview
        if (isHeicFile(file)) {
          const { heicTo } = await import("heic-to");

          const converted = await heicTo({
            blob: file,
            type: "image/jpeg",
            quality: 0.92,
          });

          if (currentLoadId !== fileLoadIdRef.current) {
            return;
          }

          previewBlob = converted;
        }

        if (currentLoadId !== fileLoadIdRef.current) {
          return;
        }

        const url = URL.createObjectURL(previewBlob);
        const probe = new Image();

        probe.onload = () => {
          if (currentLoadId !== fileLoadIdRef.current) {
            URL.revokeObjectURL(url);
            return;
          }

          setImage((current) => {
            if (current) {
              URL.revokeObjectURL(current.url);
            }

            return {
              // Keep the original file for EXIF metadata parsing
              file,

              // Use the browser-compatible preview URL
              url,

              width: probe.naturalWidth,
              height: probe.naturalHeight,
            };
          });
        };

        probe.onerror = () => {
          URL.revokeObjectURL(url);

          if (currentLoadId !== fileLoadIdRef.current) {
            return;
          }

          setMetadataLoading(false);

          setError(
            "The selected file could not be decoded as an image."
          );
        };

        probe.src = url;
      } catch (cause) {
        if (currentLoadId !== fileLoadIdRef.current) {
          return;
        }

        setMetadataLoading(false);

        setError(
          cause instanceof Error
            ? `Unable to process this image: ${cause.message}`
            : "Unable to process this image. Please try another file."
        );
      }
    },
    [resetLocation]
  );

  const resolveLocation = useCallback(async () => {
    if (latitude === null || longitude === null) return;

    const currentRequestId = ++requestIdRef.current;

    setLocationStatus("loading");
    setLocationError("");

    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        addressdetails: "1",
        zoom: "18",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "The location service is busy. Please try again later."
          );
        }

        throw new Error(
          "The location service could not process this request."
        );
      }

      const result = await response.json();

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (!result || !result.address) {
        throw new Error(
          "No address information was found for these coordinates."
        );
      }

      const address = result.address;

      setLocation({
        displayName: result.display_name ?? "",
        road: address.road,
        houseNumber: address.house_number,
        neighbourhood:
          address.neighbourhood ?? address.quarter,
        suburb:
          address.suburb ?? address.city_district,
        city:
          address.city ??
          address.town ??
          address.village ??
          address.municipality,
        district:
          address.county ?? address.district,
        state:
          address.state ?? address.region,
        country: address.country,
      });

      setLocationStatus("success");
    } catch (cause) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setLocationError(
        cause instanceof Error
          ? cause.message
          : "Unable to resolve this location."
      );

      setLocationStatus("error");
    }
  }, [latitude, longitude]);

  const dismissLocation = useCallback(() => {
    requestIdRef.current += 1;
    setLocation(null);
    setLocationError("");
    setLocationStatus("denied");
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
            JPG · PNG · WebP · HEIC · HEIF · Up to 50 MB
          </span>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/heic-sequence,image/heif-sequence,.jpg,.jpeg,.png,.webp,.heic,.heif"
            className="hidden"
            onChange={(event) =>
              loadFile(event.target.files?.[0])
            }
          />
        </button>
      ) : (
        /* Image Workspace */
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
          {/* Left Column: Preview + Camera Information */}
          <div className="min-w-0 space-y-4">
            {/* Image Preview */}
            <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4">
              {/* Local blob preview: intentionally bypasses Next.js image optimization */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt="Selected image preview"
                className="max-h-[520px] max-w-full rounded-lg object-contain"
              />
            </div>

            {/* Mobile: Capture Information + Compact Location */}
            <div className="lg:hidden">
              <CameraBrandDisplay
                make={cameraMetadata?.Make}
                model={cameraMetadata?.Model}
                loading={metadataLoading}
                latitude={latitude}
                longitude={longitude}
                location={location}
                locationStatus={locationStatus}
                locationError={locationError}
                onResolveLocation={resolveLocation}
                onDismissLocation={dismissLocation}
              />
            </div>

            {/* Desktop: Camera Brand Attribution */}
            <div className="hidden lg:block">
              <CameraBrandDisplay
                make={cameraMetadata?.Make}
                model={cameraMetadata?.Model}
                loading={metadataLoading}
              />
            </div>
          </div>

          {/* Right Column: Image Details */}
          <div className="min-w-0 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <span className="text-[12px] font-semibold">
                Image details
              </span>

              <button
                type="button"
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
                  {image.file.type || getFileFormat(image.file)}
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
                    {getFileFormat(image.file)}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Information - Desktop */}
            {latitude !== null && longitude !== null && (
              <div className="mt-5 hidden border-t border-[var(--border)] pt-4 lg:block">
                <LocationInformation
                  latitude={latitude}
                  longitude={longitude}
                  location={location}
                  status={locationStatus}
                  error={locationError}
                  variant="detailed"
                  onResolve={resolveLocation}
                  onDismiss={dismissLocation}
                />
              </div>
            )}

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
