
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Download,
  LoaderCircle,
  Search,
} from "lucide-react";
import * as exifr from "exifr";

type RawMetadata = Record<string, unknown>;

type FieldDefinition = {
  label: string;
  keys: string[];
};

type SectionDefinition = {
  id: string;
  title: string;
  fields: FieldDefinition[];
};

type MetadataInspectorProps = {
  file: File;
  onMetadataLoaded?: (metadata: RawMetadata) => void;
};

const SECTIONS: SectionDefinition[] = [
  {
    id: "camera",
    title: "Camera Information",
    fields: [
      { label: "Make", keys: ["Make"] },
      { label: "Model", keys: ["Model"] },
      { label: "Lens Model", keys: ["LensModel"] },
      { label: "Lens Make", keys: ["LensMake"] },
      { label: "Serial Number", keys: ["BodySerialNumber", "SerialNumber"] },
      { label: "Internal Serial Number", keys: ["InternalSerialNumber"] },
      { label: "Software", keys: ["Software"] },
      { label: "Firmware Version", keys: ["CameraFirmware"] },
    ],
  },
  {
    id: "settings",
    title: "Image Settings",
    fields: [
      { label: "Orientation", keys: ["Orientation"] },
      { label: "Exposure Time", keys: ["ExposureTime"] },
      { label: "F-Number", keys: ["FNumber"] },
      { label: "ISO", keys: ["ISO", "PhotographicSensitivity"] },
      { label: "Focal Length", keys: ["FocalLength"] },
      { label: "Focal Length (35mm)", keys: ["FocalLengthIn35mmFormat"] },
      { label: "Flash", keys: ["Flash"] },
      { label: "White Balance", keys: ["WhiteBalance"] },
      { label: "Exposure Program", keys: ["ExposureProgram"] },
      { label: "Exposure Mode", keys: ["ExposureMode"] },
      { label: "Exposure Bias", keys: ["ExposureBiasValue"] },
      { label: "Metering Mode", keys: ["MeteringMode"] },
      { label: "Shutter Speed", keys: ["ShutterSpeedValue"] },
      { label: "Aperture", keys: ["ApertureValue"] },
      { label: "Max Aperture", keys: ["MaxApertureValue"] },
      { label: "Brightness", keys: ["BrightnessValue"] },
      { label: "Subject Distance", keys: ["SubjectDistance"] },
      { label: "Scene Capture Type", keys: ["SceneCaptureType"] },
      { label: "Scene Type", keys: ["SceneType"] },
      { label: "Gain Control", keys: ["GainControl"] },
      { label: "Contrast", keys: ["Contrast"] },
      { label: "Saturation", keys: ["Saturation"] },
      { label: "Sharpness", keys: ["Sharpness"] },
      { label: "Light Source", keys: ["LightSource"] },
      { label: "Digital Zoom Ratio", keys: ["DigitalZoomRatio"] },
    ],
  },
  {
    id: "gps",
    title: "GPS Data",
    fields: [
      { label: "Latitude", keys: ["latitude", "GPSLatitude"] },
      { label: "Longitude", keys: ["longitude", "GPSLongitude"] },
      { label: "Altitude", keys: ["GPSAltitude"] },
      { label: "Latitude Ref", keys: ["GPSLatitudeRef"] },
      { label: "Longitude Ref", keys: ["GPSLongitudeRef"] },
      { label: "Altitude Ref", keys: ["GPSAltitudeRef"] },
      { label: "GPS Date Stamp", keys: ["GPSDateStamp"] },
      { label: "GPS Time Stamp", keys: ["GPSTimeStamp"] },
      { label: "GPS Speed", keys: ["GPSSpeed"] },
      { label: "GPS Speed Ref", keys: ["GPSSpeedRef"] },
      { label: "GPS Image Direction", keys: ["GPSImgDirection"] },
      { label: "GPS Image Direction Ref", keys: ["GPSImgDirectionRef"] },
      { label: "GPS Destination Bearing", keys: ["GPSDestBearing"] },
      { label: "GPS Destination Bearing Ref", keys: ["GPSDestBearingRef"] },
    ],
  },
  {
    id: "image",
    title: "Image Information",
    fields: [
      { label: "Image Width", keys: ["ImageWidth", "ExifImageWidth"] },
      { label: "Image Height", keys: ["ImageHeight", "ExifImageHeight"] },
      { label: "X Resolution", keys: ["XResolution"] },
      { label: "Y Resolution", keys: ["YResolution"] },
      { label: "Resolution Unit", keys: ["ResolutionUnit"] },
      { label: "Color Space", keys: ["ColorSpace"] },
      { label: "Compression", keys: ["Compression"] },
      { label: "Bits Per Sample", keys: ["BitsPerSample"] },
      { label: "Date Time", keys: ["ModifyDate", "DateTime"] },
      { label: "Date Time Original", keys: ["DateTimeOriginal"] },
      { label: "Date Time Digitized", keys: ["CreateDate", "DateTimeDigitized"] },
    ],
  },
  {
    id: "author",
    title: "Copyright & Author",
    fields: [
      { label: "Artist", keys: ["Artist"] },
      { label: "Copyright", keys: ["Copyright"] },
      { label: "Image Description", keys: ["ImageDescription"] },
      { label: "User Comment", keys: ["UserComment"] },
      { label: "XP Author", keys: ["XPAuthor"] },
      { label: "XP Title", keys: ["XPTitle"] },
      { label: "XP Comment", keys: ["XPComment"] },
    ],
  },
];

const ALL_KNOWN_KEYS = new Set(
  SECTIONS.flatMap((section) =>
    section.fields.flatMap((field) => field.keys)
  )
);

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "Not present";
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? "Invalid date"
      : value.toLocaleString();
  }

  if (ArrayBuffer.isView(value)) {
    return Array.from(
      value as unknown as ArrayLike<number>
    ).join(", ");
  }

  if (Array.isArray(value)) {
    return value.map(formatValue).join(", ");
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if ("numerator" in obj && "denominator" in obj) {
      return `${obj.numerator}/${obj.denominator}`;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "[Unserializable value]";
    }
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? String(Number(value.toFixed(6)))
      : String(value);
  }

  return String(value);
}

function getFieldValue(
  data: RawMetadata,
  keys: string[]
): unknown {
  for (const key of keys) {
    if (
      data[key] !== undefined &&
      data[key] !== null &&
      data[key] !== ""
    ) {
      return data[key];
    }
  }

  return undefined;
}

export function MetadataInspector({
  file,
  onMetadataLoaded,
}: MetadataInspectorProps) {
  const [metadata, setMetadata] = useState<RawMetadata | null>(null);

  // Track which file has completed parsing
  const [processedFile, setProcessedFile] = useState<File | null>(null);

  const [parseStatus, setParseStatus] = useState<
    "ready" | "empty" | "error"
  >("empty");

  // Derive loading state instead of setting it synchronously in an effect
  const status =
    processedFile === file ? parseStatus : "loading";

  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string[]>(
    SECTIONS.map((section) => section.id)
  );
  const [copied, setCopied] = useState(false);

  // Single EXIF parsing source for the entire workspace
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const result = await exifr.parse(file, {
          tiff: true,
          exif: true,
          gps: true,
          iptc: true,
          xmp: true,
          icc: true,
          jfif: true,
          ihdr: true,
          makerNote: true,
          userComment: true,
          reviveValues: true,
        });

        if (!active) return;

        const parsed = (result ?? {}) as RawMetadata;

        setMetadata(parsed);
        setParseStatus(
          Object.keys(parsed).length ? "ready" : "empty"
        );
        setError("");
        setProcessedFile(file);

        // Share parsed metadata with the parent workspace
        onMetadataLoaded?.(parsed);
      } catch (cause) {
        if (!active) return;

        setError(
          cause instanceof Error
            ? cause.message
            : "The metadata could not be read."
        );

        setParseStatus("error");
        setProcessedFile(file);
        onMetadataLoaded?.({});
      }
    })();

    return () => {
      active = false;
    };
  }, [file, onMetadataLoaded]);

  const sections = useMemo(() => {
    if (!metadata) return [];

    const normalizedQuery = query.trim().toLowerCase();

    const known = SECTIONS.map((section) => ({
      ...section,
      fields: section.fields
        .map((field) => ({
          ...field,
          value: getFieldValue(metadata, field.keys),
        }))
        .filter(
          (field) =>
            !normalizedQuery ||
            `${field.label} ${field.keys.join(" ")} ${formatValue(
              field.value
            )}`
              .toLowerCase()
              .includes(normalizedQuery)
        ),
    }));

    const otherFields = Object.entries(metadata)
      .filter(([key]) => !ALL_KNOWN_KEYS.has(key))
      .map(([key, value]) => ({
        label: key,
        keys: [key],
        value,
      }))
      .filter(
        (field) =>
          !normalizedQuery ||
          `${field.label} ${formatValue(field.value)}`
            .toLowerCase()
            .includes(normalizedQuery)
      );

    if (otherFields.length) {
      known.push({
        id: "other",
        title: "Other Detected Metadata",
        fields: otherFields,
      });
    }

    return known.filter((section) => section.fields.length > 0);
  }, [metadata, query]);

  const toggleAll = (open: boolean) => {
    setExpanded(
      open ? sections.map((section) => section.id) : []
    );
  };

  const exportJson = () => {
    if (!metadata) return;

    const blob = new Blob(
      [
        JSON.stringify(
          metadata,
          (_key, value) =>
            value instanceof Date ? value.toISOString() : value,
          2
        ),
      ],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${file.name.replace(/\.[^.]+$/, "")}-metadata.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    if (!metadata) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(metadata, null, 2)
      );

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Unable to copy metadata to clipboard.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.025em]">
            EXIF Data
          </h2>

          <p className="mt-1 text-[11px] text-[var(--muted)]">
            Embedded metadata read directly from the selected image.
          </p>
        </div>

        {status === "ready" && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] hover:bg-[var(--surface-hover)]"
            >
              {copied ? <Check size={13} /> : <Clipboard size={13} />}
              {copied ? "Copied" : "Copy JSON"}
            </button>

            <button
              onClick={exportJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] hover:bg-[var(--surface-hover)]"
            >
              <Download size={13} />
              Export JSON
            </button>
          </div>
        )}
      </div>

      {status === "loading" && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[11px] text-[var(--muted)]">
          <LoaderCircle size={15} className="animate-spin" />
          Reading image metadata locally…
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-[11px] text-red-600"
        >
          Unable to read metadata: {error}
        </div>
      )}

      {status === "empty" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[11px] text-[var(--muted)]">
          No supported embedded metadata was found. This does not
          indicate whether the image was or was not AI-generated.
        </div>
      )}

      {status === "ready" && metadata && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-[340px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search metadata fields…"
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-[11px] outline-none focus:border-emerald-600"
              />
            </label>

            <div className="flex gap-3 text-[10px]">
              <button
                onClick={() => toggleAll(true)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Expand All
              </button>

              <button
                onClick={() => toggleAll(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sections.map((section) => {
              const isOpen = expanded.includes(section.id);

              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)]"
                >
                  <button
                    onClick={() =>
                      setExpanded((current) =>
                        isOpen
                          ? current.filter((id) => id !== section.id)
                          : [...current, section.id]
                      )
                    }
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-[var(--surface-hover)]"
                  >
                    <span className="text-[12px] font-semibold">
                      {section.title}
                      <span className="ml-2 text-[10px] font-normal text-[var(--muted)]">
                        {section.fields.length} fields
                      </span>
                    </span>

                    {isOpen ? (
                      <ChevronDown size={15} className="text-[var(--muted)]" />
                    ) : (
                      <ChevronRight size={15} className="text-[var(--muted)]" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-[var(--border)] px-4 py-2">
                      {section.fields.map((field) => (
                        <div
                          key={`${section.id}-${field.label}`}
                          className="grid grid-cols-[minmax(125px,0.8fr)_minmax(0,1.2fr)] gap-3 border-b border-[var(--border)]/70 py-3 last:border-0"
                        >
                          <span className="text-[10px] text-[var(--muted)]">
                            {field.label}
                          </span>

                          <span
                            className={`break-words text-right text-[10px] ${
                              field.value === undefined
                                ? "text-[var(--muted)]"
                                : "font-medium"
                            }`}
                          >
                            {formatValue(field.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {sections.length === 0 && (
              <p className="rounded-xl border border-[var(--border)] p-4 text-[11px] text-[var(--muted)]">
                No fields match “{query}”.
              </p>
            )}
          </div>

          <p className="text-[10px] leading-5 text-[var(--muted)]">
            Only metadata returned by the installed parser is shown.
            “Not present” means the corresponding tag was not found in
            the parsed file; unsupported proprietary metadata may not
            be readable.
          </p>
        </>
      )}
    </section>
  );
}
