
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  Aperture,
  ChevronDown,
  FileImage,
  Info,
  LayoutDashboard,
  Menu,
  Moon,
  ScanSearch,
  Settings2,
  ShieldCheck,
  Sun,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Metadata Inspector", href: "/inspector", icon: ScanSearch },
  { label: "Metadata Cleaner", href: "/cleaner", icon: Settings2 },
  { label: "Metadata Editor", href: "/editor", icon: FileImage },
  { label: "About", href: "/about", icon: Info },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  // Persistent sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Temporary hover state
  const [isHovered, setIsHovered] = useState(false);

  // Mobile navigation state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Theme hydration protection
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const isDark = mounted && resolvedTheme === "dark";

  // Effective desktop sidebar visibility
  const isExpanded = !isCollapsed || isHovered;

  // Sidebar toggle
  const toggleSidebar = () => {
    setIsCollapsed((current) => !current);
    setIsHovered(false);
  };

  // Sidebar content renderer
  const renderSidebar = (expanded: boolean, mobile = false) => (
    <>
      {/* Brand Header */}
      <div
        className={cn(
          "relative flex h-[76px] shrink-0 items-center border-b border-[var(--border)] transition-all duration-300 ease-in-out",
          expanded ? "gap-3 px-5" : "justify-center px-2"
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--foreground)] text-[var(--background)]">
          <Aperture size={21} strokeWidth={2.2} />
        </div>

        <div
          className={cn(
            "min-w-0 overflow-hidden whitespace-nowrap transition-all duration-200",
            expanded
              ? "w-auto translate-x-0 opacity-100"
              : "pointer-events-none absolute left-[62px] w-0 -translate-x-2 opacity-0"
          )}
        >
          <p className="text-[15px] font-semibold tracking-[-0.03em]">
            Metadata Studio
          </p>
          <p className="text-[11px] text-[var(--muted)]">
            Image workspace
          </p>
        </div>

        {mobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div
        className={cn(
          "pt-7 transition-all duration-300",
          expanded ? "px-3" : "px-2"
        )}
      >
        <p
          className={cn(
            "overflow-hidden whitespace-nowrap px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition-all duration-200",
            expanded ? "opacity-100" : "h-0 pb-0 opacity-0"
          )}
        >
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={!expanded ? item.label : undefined}
                className={cn(
                  "group relative flex h-[42px] items-center rounded-xl text-[13px] transition-all duration-200",
                  expanded
                    ? "gap-3 px-3"
                    : "justify-center px-0",
                  active
                    ? "bg-[var(--surface-active)] font-semibold text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon
                  size={17}
                  strokeWidth={1.8}
                  className="shrink-0"
                />

                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-all duration-200",
                    expanded
                      ? "w-auto translate-x-0 opacity-100"
                      : "pointer-events-none absolute left-[52px] w-0 -translate-x-2 opacity-0"
                  )}
                >
                  {item.label}
                </span>

                {item.label === "Metadata Inspector" && (
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full bg-emerald-500",
                      expanded ? "ml-auto" : "absolute right-1 top-2"
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div
        className={cn(
          "mt-auto pb-3 transition-all duration-300",
          expanded ? "px-3" : "px-2"
        )}
      >
        {/* Privacy Card */}
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-200",
            expanded
              ? "max-h-40 p-3.5 opacity-100"
              : "pointer-events-none max-h-0 border-transparent p-0 opacity-0"
          )}
        >
          <div className="mb-2 flex items-center gap-2 whitespace-nowrap text-[12px] font-semibold">
            <ShieldCheck
              size={15}
              className="shrink-0 text-emerald-600"
            />
            Private by design
          </div>

          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            Your images stay on this device. Processing happens locally
            in your browser.
          </p>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={!expanded ? "Change appearance" : undefined}
          className={cn(
            "mt-3 flex h-[42px] w-full items-center rounded-xl text-[12px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]",
            expanded ? "gap-3 px-3" : "justify-center px-0"
          )}
        >
          {mounted ? (
            isDark ? (
              <Sun size={16} className="shrink-0" />
            ) : (
              <Moon size={16} className="shrink-0" />
            )
          ) : (
            <Moon size={16} className="shrink-0" />
          )}

          {expanded && (
            <>
              <span className="whitespace-nowrap">
                {mounted
                  ? isDark
                    ? "Light appearance"
                    : "Dark appearance"
                  : "Appearance"}
              </span>

              <ChevronDown
                size={14}
                className="ml-auto rotate-[-90deg]"
              />
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={() => {
          if (isCollapsed) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[var(--border)] bg-[var(--sidebar)] transition-[width] duration-300 ease-in-out lg:flex",
          isExpanded ? "w-[248px]" : "w-[72px]"
        )}
      >
        {renderSidebar(isExpanded)}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)] transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderSidebar(true, true)}
      </aside>

      {/* Main Workspace */}
      <div
        className={cn(
          "transition-[padding] duration-300 ease-in-out",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-[248px]"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-5 backdrop-blur-xl sm:px-8">

          <div className="flex min-w-0 items-center gap-3">

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden size-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] lg:flex"
              aria-label={
                isCollapsed
                  ? "Expand sidebar permanently"
                  : "Collapse sidebar"
              }
              title={
                isCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              {isCollapsed ? (
                <PanelLeftOpen size={19} strokeWidth={1.8} />
              ) : (
                <PanelLeftClose size={19} strokeWidth={1.8} />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-[var(--surface-hover)] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>

            {/* Breadcrumb */}
            <div className="truncate text-[12px] text-[var(--muted)]">
              Workspace
              <span className="px-1.5">/</span>
              <span className="font-medium text-[var(--foreground)]">
                {navigation.find((item) => item.href === pathname)?.label ??
                  "Overview"}
              </span>
            </div>
          </div>

          {/* Developer Attribution */}
          <div className="ml-3 flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-[11px] text-[var(--muted)]">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Code by @wisnuprjt</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
