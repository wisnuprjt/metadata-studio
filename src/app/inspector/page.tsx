import { AppShell } from "@/components/layout/app-shell";
import { ImageUploadWorkspace } from "@/components/upload-workspace";

export default function InspectorPage() {
  return <AppShell><div className="mx-auto max-w-[1050px]"><div className="mb-8"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Workspace / Inspect</p><h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em]">Metadata Inspector</h1><p className="mt-2 text-[12px] text-[var(--muted)]">Upload an image to inspect its properties and embedded metadata.</p></div><ImageUploadWorkspace /></div></AppShell>;
}
