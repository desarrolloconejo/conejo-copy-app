import { BrandLockup } from "@/components/BrandLockup";
import {
  CircleAlert,
  ClipboardCheck,
  Eye,
  FileSpreadsheet,
  FileText,
  Gauge,
  History,
  LayoutTemplate,
  LogOut,
  PenLine,
  Play,
  Settings2,
  Sparkles,
  Target,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

/**
 * The sidebar splits by what the destination is for: the five surfaces used to
 * produce a piece, and the manual consulted while producing it. That is the
 * order the product itself argues for — decide first, consult second.
 */
type NavItem = [label: string, href: string, Icon: typeof PenLine];

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Trabajo",
    items: [
      ["Hoy", "#hoy", Play],
      ["Canvas", "#canvas", PenLine],
      ["Auditor", "#auditor", Gauge],
      ["Historial", "#historial", History],
      ["Reglas", "#reglas", Settings2],
    ],
  },
  {
    label: "Manual",
    items: [
      ["Fundamento", "#fundamento", Target],
      ["Territorios", "#territorios", Sparkles],
      ["Biblioteca", "#biblioteca", LayoutTemplate],
      ["Visual", "#visual", Eye],
      ["Cementerio", "#cementerio", CircleAlert],
      ["Números", "#numeros", FileSpreadsheet],
      ["Protocolo", "#protocolo", ClipboardCheck],
      ["Fuentes", "#fuentes", FileText],
    ],
  },
];

export const navItems = navGroups.flatMap(group => group.items);

type SidebarUser = { name: string; email: string; role: "user" | "admin" } | null;

type SidebarBodyProps = {
  progress: number;
  user: SidebarUser;
  /** Runs on every link tap: opens the target section and closes the drawer. */
  onNavigate: (href: string) => void;
  onLogout: () => void;
};

/** Shared by the fixed desktop column and the mobile drawer. */
export function SidebarBody({ progress, user, onNavigate, onLogout }: SidebarBodyProps) {
  return (
    <>
      <div className="relative shrink-0">
        <BrandLockup />
      </div>

      <nav className="nav-scroll nav-fade relative mt-7 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[.62rem] font-semibold tracking-[.18em] text-[#fae890]/70 uppercase">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(([label, href, Icon]) => {
                const NavIcon = Icon as typeof PenLine;
                return (
                  <a
                    key={label}
                    href={href}
                    onClick={() => onNavigate(href)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-white/80 transition hover:bg-white/10 hover:text-white lg:py-1.5"
                  >
                    <NavIcon className="h-3.5 w-3.5 shrink-0 text-[#fae890]" />
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative mt-4 shrink-0 space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/7 px-3.5 py-3">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-[.62rem] font-semibold tracking-[.18em] text-white/70 uppercase">
              Filtro de calidad
            </span>
            <span className="text-xs font-semibold text-[#fae890] tabular-nums">{progress}/9</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-[#fae890] transition-all"
              style={{ width: `${(progress / 9) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-[.7rem] leading-4 text-white/70">
            {progress === 9
              ? "Las nueve marcadas. Puede pasar a producción."
              : `Faltan ${9 - progress} para pasar a producción.`}
          </p>
        </div>

        <div className="border-t border-white/10 pt-3">
          <p className="truncate px-1 text-xs font-semibold" title={user?.email ?? undefined}>
            {user?.name ?? "—"}
          </p>
          <p className="mb-2 truncate px-1 text-[.68rem] text-white/55">
            {user?.role === "admin" ? "Administración" : "Redacción"}
          </p>
          <div className="flex gap-1.5">
            {user?.role === "admin" && (
              <Link
                href="/usuarios"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2 py-2 text-[.7rem] font-semibold text-white/85 transition hover:bg-white/18 hover:text-white lg:py-1.5"
              >
                <UsersRound className="h-3.5 w-3.5 text-[#fae890]" />
                Usuarios
              </Link>
            )}
            <button
              onClick={onLogout}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2 py-2 text-[.7rem] font-semibold text-white/85 transition hover:bg-white/18 hover:text-white lg:py-1.5"
            >
              <LogOut className="h-3.5 w-3.5 text-[#fae890]" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

type MobileNavDrawerProps = SidebarBodyProps & {
  open: boolean;
  onClose: () => void;
};

/**
 * Mobile navigation drawer.
 *
 * Both layers stay mounted and animate through class changes, so the exit
 * transition plays instead of the panel vanishing on unmount. While closed the
 * panel sits off-screen and `inert` keeps it out of reach of the keyboard and
 * screen readers.
 */
export function MobileNavDrawer({ open, onClose, ...body }: MobileNavDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    // Stop the page behind from scrolling under the drawer.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className="lg:hidden">
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[#051a2a]/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navegación"
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] max-w-[86vw] flex-col overflow-hidden bg-[#321327] px-5 py-6 text-white shadow-[0_0_60px_rgba(5,26,42,.45)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="window-arcs pointer-events-none absolute inset-0 opacity-80" />

        <button
          onClick={onClose}
          aria-label="Cerrar menú"
          className="absolute top-5 right-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>

        <SidebarBody {...body} />
      </div>
    </div>
  );
}
