
"use client";

import { Camera, ShieldCheck } from "lucide-react";
import { identifyCameraBrand } from "@/lib/camera-brands";

type CameraBrandDisplayProps = {
  make?: string | null;
  model?: string | null;
  loading?: boolean;
};

export function CameraBrandDisplay({
  make,
  model,
  loading = false,
}: CameraBrandDisplayProps) {
  const brand = identifyCameraBrand(make);

  return (
    <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-emerald-600" />
          <span className="text-[11px] font-semibold">
            Camera Brand Attribution
          </span>
        </div>

        {brand && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/[0.08] px-2.5 py-1 text-[9px] font-medium text-emerald-600">
            <ShieldCheck size={11} />
            EXIF detected
          </span>
        )}
      </div>

      <div className="mt-5 flex min-h-[76px] items-center gap-5">
        {loading ? (
          <div className="h-10 w-36 animate-pulse rounded-lg bg-[var(--surface-active)]" />
        ) : brand ? (
          <>
            {brand.logo ? (
              <svg
                viewBox="0 0 24 24"
                role="img"
                aria-label={`${brand.name} brand mark`}
                className="h-11 w-11 shrink-0"
              >
                <path
                  d={brand.logo.path}
                  fill={`#${brand.logo.hex}`}
                />
              </svg>
            ) : (
              <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--surface-active)]">
                <Camera size={22} className="text-[var(--muted)]" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[16px] font-semibold tracking-[-0.03em]">
                Shot on {brand.name}
              </p>

              {model && (
                <p className="mt-1 truncate text-[11px] text-[var(--muted)]">
                  {model}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-active)]">
              <Camera size={20} className="text-[var(--muted)]" />
            </div>

            <div>
              <p className="text-[13px] font-medium">
                Camera brand not identified
              </p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                {make
                  ? `Unsupported manufacturer: ${make}`
                  : "No camera manufacturer metadata found"}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
