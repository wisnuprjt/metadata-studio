import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileImage, Fingerprint, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const features = [
  { icon: ScanSearch, title: "Inspect metadata", description: "Explore camera details, timestamps, software tags, and available provenance information.", href: "/inspector", label: "Open inspector" },
  { icon: ShieldCheck, title: "Clean image metadata", description: "Remove supported metadata using format-aware processing and verify the exported result.", href: "/cleaner", label: "Open cleaner" },
  { icon: FileImage, title: "Edit image metadata", description: "Manage supported descriptive fields with clear labels for user-supplied information.", href: "/editor", label: "Open editor" },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1050px]">
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] text-[var(--muted)]"><Sparkles size={13} /> Your private image workspace</div>
            <h1 className="text-[34px] font-semibold tracking-[-0.055em] sm:text-[42px]">Good images deserve<br className="hidden sm:block" /> <span className="text-[var(--muted)]">transparent metadata.</span></h1>
            <p className="mt-3 max-w-[560px] text-[13px] leading-6 text-[var(--muted)]">Inspect, understand, and manage image metadata in one focused workspace. Your files stay on your device.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[11px] text-[var(--muted)]"><Fingerprint size={15} className="text-emerald-600" /> No uploads. No accounts. No tracking.</div>
        </div>

        <section className="relative overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-9">
          <div className="absolute -right-16 -top-24 size-72 rounded-full border border-[var(--border)] opacity-60" />
          <div className="absolute -right-4 -top-12 size-52 rounded-full border border-[var(--border)] opacity-60" />
          <div className="relative max-w-[560px]">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--foreground)] text-[var(--background)]"><FileImage size={23} /></div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Start with an image</p>
            <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] sm:text-[30px]">Know what your image carries.</h2>
            <p className="mt-2 max-w-[440px] text-[12px] leading-6 text-[var(--muted)]">Review embedded information, identify supported AI-related metadata, and understand what can be safely removed.</p>
            <Link href="/inspector" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-3 text-[12px] font-medium text-[var(--background)] transition-opacity hover:opacity-80">Open metadata inspector <ArrowRight size={15} /></Link>
          </div>
        </section>

        <div className="mb-4 mt-10 flex items-center justify-between">
          <div><h2 className="text-[16px] font-semibold tracking-[-0.025em]">Your toolkit</h2><p className="mt-1 text-[11px] text-[var(--muted)]">Everything you need to understand and manage image metadata.</p></div>
          <span className="hidden text-[10px] text-[var(--muted)] sm:block">01 — 03</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return <Link key={feature.title} href={feature.href} className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.03]">
              <div className="mb-8 flex items-center justify-between"><div className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-active)]"><Icon size={19} /></div><span className="text-[10px] text-[var(--muted)]">0{index + 1}</span></div>
              <h3 className="text-[14px] font-semibold">{feature.title}</h3>
              <p className="mt-2 min-h-[54px] text-[11px] leading-5 text-[var(--muted)]">{feature.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4 text-[11px] font-medium">{feature.label}<ArrowUpRight size={15} className="text-[var(--muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
            </Link>;
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-500/[0.045] p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"><ShieldCheck size={18} /></div>
          <div><p className="text-[12px] font-semibold">Privacy is built into the workflow.</p><p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">Your images are processed locally in your browser. They are never uploaded to our servers.</p></div>
        </div>
        <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-[var(--border)] pt-5 text-[10px] text-[var(--muted)] sm:flex-row"><span>Metadata Studio · Browser-based image metadata toolkit</span><span>Built for privacy and transparency</span></footer>
      </div>
    </AppShell>
  );
}
