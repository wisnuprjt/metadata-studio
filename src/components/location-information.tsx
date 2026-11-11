
"use client";

import {
  ExternalLink,
  LoaderCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export type LocationResult = {
  displayName: string;
  road?: string;
  houseNumber?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
};

export type LocationStatus =
  | "unavailable"
  | "consent"
  | "loading"
  | "success"
  | "error"
  | "denied";

type LocationInformationProps = {
  latitude: number | null;
  longitude: number | null;
  location: LocationResult | null;
  status: LocationStatus;
  error?: string;
  variant: "compact" | "detailed";
  onResolve: () => void;
  onDismiss: () => void;
};

export function LocationInformation({
  latitude,
  longitude,
  location,
  status,
  error,
  variant,
  onResolve,
  onDismiss,
}: LocationInformationProps) {
  if (latitude === null || longitude === null) return null;

  const mapUrl =
    `https://www.openstreetmap.org/?mlat=${latitude}` +
    `&mlon=${longitude}#map=17/${latitude}/${longitude}`;

  const primaryLocation =
    location?.city ??
    location?.suburb ??
    location?.district ??
    location?.state ??
    location?.country;

  const secondaryLocation = [
    location?.state,
    location?.country,
  ]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .join(", ");

  const streetAddress = [
    location?.road,
    location?.houseNumber,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-emerald-600" />
        <span className="text-[11px] font-semibold">
          {variant === "compact"
            ? "Captured Location"
            : "Location Information"}
        </span>
      </div>

      {status === "consent" && (
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] p-3">
          <div className="flex items-start gap-2">
            <ShieldCheck
              size={15}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
            <p className="text-[10px] leading-5 text-[var(--muted)]">
              This image contains GPS coordinates. Allow Metadata
              Studio to share these coordinates with OpenStreetMap
              Nominatim to find the approximate location. Your image
              will not be uploaded.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onResolve}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-medium text-white transition hover:bg-emerald-700"
            >
              Allow &amp; Resolve Location
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
          <LoaderCircle size={13} className="animate-spin" />
          Resolving location…
        </div>
      )}

      {status === "success" && location && (
        <div className="space-y-1">
          <p className="break-words text-[12px] font-semibold">
            {primaryLocation || location.displayName}
          </p>

          {variant === "detailed" && (
            <>
              {streetAddress && (
                <p className="break-words text-[10px] text-[var(--muted)]">
                  {streetAddress}
                </p>
              )}

              {location.neighbourhood && (
                <p className="text-[10px] text-[var(--muted)]">
                  {location.neighbourhood}
                </p>
              )}

              <p className="text-[10px] text-[var(--muted)]">
                {secondaryLocation || location.displayName}
              </p>
            </>
          )}
        </div>
      )}

      {status === "error" && (
        <p className="text-[10px] leading-5 text-amber-600">
          {error || "Unable to resolve this location."}
        </p>
      )}

      {status === "denied" && (
        <p className="text-[10px] text-[var(--muted)]">
          Location lookup skipped. GPS coordinates remain in the
          image metadata.
        </p>
      )}

      {variant === "detailed" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-[10px]">
            <span className="text-[var(--muted)]">Latitude</span>
            <span className="font-medium tabular-nums">
              {latitude.toFixed(6)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-[10px]">
            <span className="text-[var(--muted)]">Longitude</span>
            <span className="font-medium tabular-nums">
              {longitude.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {(status === "success" ||
        status === "error" ||
        status === "denied") && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 hover:text-emerald-700"
        >
          View on Map
          <ExternalLink size={11} />
        </a>
      )}

      {variant === "compact" && status === "success" && (
        <p className="text-[9px] text-[var(--muted)]">
          Location detected from GPS metadata
        </p>
      )}

      <p className="text-[9px] text-[var(--muted)]">
        © OpenStreetMap contributors
      </p>
    </section>
  );
}
