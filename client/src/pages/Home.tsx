import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { LOGIN_PATH } from "@/const";
import { describeError } from "@/lib/errors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldSelect } from "@/components/FieldSelect";
import { MobileNavDrawer, SidebarBody } from "@/components/AppSidebar";
import { BrandSymbol } from "@/components/BrandLockup";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Copy,
  Eye,
  FileSpreadsheet,
  FileText,
  Gauge,
  History,
  LayoutTemplate,
  LogOut,
  Maximize2,
  Menu,
  MessageCircleMore,
  PenLine,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Target,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  auditHook,
  library,
  mechanismLabels,
  objectiveDetail,
  PASS_SCORE,
  platformGuidance,
  territoryLabels,
  type AuditResult,
  type Mechanism,
} from "@/lib/hookManual";

type CopyForm = {
  objective: string;
  platform: string;
  audience: string;
  tension: string;
  truth: string;
  proof: string;
  spoken: string;
  overlay: string;
  frame: string;
  payoff: string;
  cta: string;
  risk: string;
};
type ResultForm = {
  impressions: string;
  threeSecondViews: string;
  saves: string;
  shares: string;
  clicks: string;
  conversions: string;
  learning: string;
};
type TrendReferenceDraft = {
  spoken: string;
  insertTitle: string;
  platform: string;
  territory: string;
  sourceUrl: string;
  insight: string;
  tags: string;
};
type TrendReferenceRecord = Omit<
  TrendReferenceDraft,
  "insertTitle" | "sourceUrl"
> & {
  id: number;
  insertTitle: string | null;
  sourceUrl: string | null;
};

const blankForm: CopyForm = {
  objective: "",
  platform: "Instagram Reels",
  audience: "",
  tension: "",
  truth: "",
  proof: "",
  spoken: "",
  overlay: "",
  frame: "",
  payoff: "",
  cta: "",
  risk: "",
};
const blankResult: ResultForm = {
  impressions: "",
  threeSecondViews: "",
  saves: "",
  shares: "",
  clicks: "",
  conversions: "",
  learning: "",
};
const blankTrendReference: TrendReferenceDraft = {
  spoken: "",
  insertTitle: "",
  platform: "Instagram Reels",
  territory: "C",
  sourceUrl: "",
  insight: "",
  tags: "",
};
export function filterTrendReferences(
  references: TrendReferenceRecord[],
  filters: { search: string; platform: string; territory: string }
) {
  const query = filters.search.toLowerCase().trim();
  return references.filter(item => {
    const searchable =
      `${item.spoken} ${item.insertTitle ?? ""} ${item.insight} ${item.tags} ${item.platform} ${item.territory}`.toLowerCase();
    return (
      (filters.platform === "all" || item.platform === filters.platform) &&
      (filters.territory === "all" || item.territory === filters.territory) &&
      (!query || searchable.includes(query))
    );
  });
}
export function applyTrendReference(
  form: CopyForm,
  reference: Pick<TrendReferenceRecord, "spoken" | "insertTitle">
): CopyForm {
  return {
    ...form,
    spoken: reference.spoken,
    overlay: reference.insertTitle ?? "",
  };
}
const objectives = [
  "Alcance",
  "Guardados",
  "Compartidos",
  "Comunidad",
  "Consideración",
  "Acción",
];
export const foundationCards = [
  {
    code: "01 / CAPTAR ATENCIÓN",
    title: "La retención es el primer filtro.",
    text: "Un hook no garantiza el éxito por sí mismo, pero consigue que la audiencia se quede el tiempo suficiente para recibir el valor del contenido.",
  },
  {
    code: "02 / GENERAR COMPARTIDOS",
    title: "Compartir confirma que la pieza importa.",
    text: "Retener no basta: cuando alguien piensa «esto le puede servir a otra persona», el contenido gana alcance y relevancia.",
  },
  {
    code: "03 / DAR CONTEXTO",
    title: "La decisión empieza antes de escuchar.",
    text: "El primer plano, el Insert-Titulo y la primera línea deben dejar claro de inmediato qué está ocurriendo y por qué vale la pena seguir viendo.",
  },
];
const EXPLANATORY_IDS = [
  "ventana",
  "fundamento",
  "territorios",
  "biblioteca",
  "visual",
  "cementerio",
  "numeros",
  "protocolo",
  "fuentes",
];
const toNumber = (value: string) =>
  Math.max(0, Number.parseInt(value || "0", 10) || 0);
const formatField = (label: string, value: string) =>
  `${label.padEnd(23, " ")}${value || "—"}`;

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const goToLogin = () => {
    window.location.href = LOGIN_PATH;
  };
  const closeMobileNav = () => setMobileNav(false);
  const handleLogout = () => {
    void logout().finally(goToLogin);
  };
  const sidebarUser = user
    ? { name: user.name, email: user.email, role: user.role }
    : null;
  const utils = trpc.useUtils();
  const [mobileNav, setMobileNav] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<CopyForm>(blankForm);
  const [checked, setChecked] = useState(Array(9).fill(false));
  const [hasAudited, setHasAudited] = useState(false);
  const [territory, setTerritory] = useState("all");
  const [mechanism, setMechanism] = useState<"all" | Mechanism>("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [trendSearch, setTrendSearch] = useState("");
  const [trendPlatform, setTrendPlatform] = useState("all");
  const [trendTerritory, setTrendTerritory] = useState("all");
  const [trendDraft, setTrendDraft] =
    useState<TrendReferenceDraft>(blankTrendReference);
  const [clientId, setClientId] = useState("");
  const [showClientCreator, setShowClientCreator] = useState(false);
  const [clientDraft, setClientDraft] = useState({ name: "", sector: "" });
  const [historySearch, setHistorySearch] = useState("");
  const [historyClient, setHistoryClient] = useState("all");
  const [historyStatus, setHistoryStatus] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [resultForm, setResultForm] = useState<ResultForm>(blankResult);
  const [ruleDraft, setRuleDraft] = useState({
    label: "",
    clientId: "",
    sector: "",
    maxSpokenWords: "12",
    maxOverlayWords: "6",
    requireProof: true,
    preambles:
      "hola, buenas, chicos, chicas, bienvenid, gente, qué tal, os traigo, hoy vamos",
    tiredPhrases:
      "espera al final, no vas a creer, esto lo cambia todo, secreto",
    tensionTerms: "error, deja de, no es, falla, frena, hundi, cuesta, pero",
  });
  const [calculator, setCalculator] = useState({
    impressions: "",
    views: "",
    shown: false,
  });

  const clientsQuery = trpc.clients.list.useQuery(undefined, {
    enabled: Boolean(isAuthenticated),
  });
  const rulesQuery = trpc.auditRules.list.useQuery(undefined, {
    enabled: Boolean(isAuthenticated),
  });
  const historyQuery = trpc.copyHistory.list.useQuery(undefined, {
    enabled: Boolean(isAuthenticated),
  });
  const trendReferencesQuery = trpc.trendReferences.list.useQuery(undefined, {
    enabled: Boolean(isAuthenticated),
  });
  const createClient = trpc.clients.create.useMutation({
    onSuccess: id => {
      utils.clients.list.invalidate();
      setClientId(String(id));
      setShowClientCreator(false);
      setClientDraft({ name: "", sector: "" });
      toast.success("Cliente añadido y seleccionado.");
    },
    onError: error =>
      toast.error(describeError(error, "No se pudo crear el cliente.")),
  });
  const saveCopy = trpc.copyHistory.create.useMutation({
    onSuccess: () => {
      utils.copyHistory.list.invalidate();
      toast.success("Ficha guardada en el historial.");
    },
    onError: error =>
      toast.error(describeError(error, "No se pudo guardar la ficha.")),
  });
  const saveResult = trpc.copyHistory.saveResult.useMutation({
    onSuccess: () => {
      utils.copyHistory.list.invalidate();
      setSelectedRecord(null);
      setResultForm(blankResult);
      toast.success("Resultados registrados.");
    },
    onError: error =>
      toast.error(
        describeError(error, "No se pudieron registrar los resultados.")
      ),
  });
  const createRule = trpc.auditRules.create.useMutation({
    onSuccess: () => {
      utils.auditRules.list.invalidate();
      setRuleDraft(current => ({ ...current, label: "" }));
      toast.success("Regla personalizada guardada.");
    },
    onError: error =>
      toast.error(describeError(error, "No se pudo guardar la regla.")),
  });
  const createTrendReference = trpc.trendReferences.create.useMutation({
    onSuccess: () => {
      utils.trendReferences.list.invalidate();
      setTrendDraft(blankTrendReference);
      toast.success("Referencia de tendencia guardada.");
    },
    onError: error =>
      toast.error(describeError(error, "No se pudo guardar la referencia.")),
  });

  useEffect(() => {
    if (!clientId && clientsQuery.data?.[0])
      setClientId(String(clientsQuery.data[0].id));
  }, [clientId, clientsQuery.data]);
  const activeRule = useMemo(() => {
    const selected = clientsQuery.data?.find(
      client => String(client.id) === clientId
    );
    const rules = rulesQuery.data ?? [];
    return (
      rules.find(rule => rule.clientId === Number(clientId)) ??
      rules.find(rule => selected && rule.sector === selected.sector) ??
      undefined
    );
  }, [clientId, clientsQuery.data, rulesQuery.data]);
  const audit = useMemo(
    () => auditHook(form.spoken, form.overlay, form.proof, activeRule),
    [form.spoken, form.overlay, form.proof, activeRule]
  );
  const detail = objectiveDetail(form.objective || "Guardados");
  const wordCount = form.spoken.trim()
    ? form.spoken.trim().split(/\s+/).length
    : 0;
  const insertTitleCount = form.overlay.trim()
    ? form.overlay.trim().split(/\s+/).length
    : 0;
  const filteredLibrary = useMemo(
    () =>
      library.filter(
        item =>
          (territory === "all" || item.territory === territory) &&
          (mechanism === "all" || item.mechanism.includes(mechanism)) &&
          (!librarySearch ||
            `${item.template} ${item.example} ${item.overlay} ${item.edit} ${item.useWhen}`
              .toLowerCase()
              .includes(librarySearch.toLowerCase()))
      ),
    [territory, mechanism, librarySearch]
  );
  const filteredTrendReferences = useMemo(
    () =>
      filterTrendReferences(
        (trendReferencesQuery.data ?? []) as TrendReferenceRecord[],
        {
          search: trendSearch,
          platform: trendPlatform,
          territory: trendTerritory,
        }
      ),
    [trendReferencesQuery.data, trendPlatform, trendTerritory, trendSearch]
  );
  const filteredHistory = useMemo(
    () =>
      (historyQuery.data ?? []).filter(item => {
        const text =
          `${item.record.spoken} ${item.record.overlay} ${item.client.name} ${item.client.sector}`.toLowerCase();
        return (
          (!historySearch || text.includes(historySearch.toLowerCase())) &&
          (historyClient === "all" ||
            String(item.client.id) === historyClient) &&
          (historyStatus === "all" || item.record.status === historyStatus)
        );
      }),
    [historyQuery.data, historySearch, historyClient, historyStatus]
  );
  const progress = checked.filter(Boolean).length;
  const update = (key: keyof CopyForm, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
    if (key === "spoken" || key === "overlay" || key === "proof")
      setHasAudited(false);
  };
  const toggleSection = (id: string) =>
    setOpenSections(current => ({ ...current, [id]: !current[id] }));
  const openExplanation = (hash: string) => {
    const id = hash.replace("#", "");
    if (EXPLANATORY_IDS.includes(id)) {
      setOpenSections(current => ({ ...current, [id]: true }));
    }
  };
  const ensureAuth = () => {
    if (!isAuthenticated) {
      toast.info("Inicia sesión para guardar información del equipo.");
      goToLogin();
      return false;
    }
    return true;
  };
  const openClientCreator = () => {
    if (!ensureAuth()) return;
    setShowClientCreator(true);
  };
  const createContextClient = () => {
    if (!ensureAuth()) return;
    const name = clientDraft.name.trim();
    if (!name) return toast.error("Escribe el nombre del cliente.");
    const duplicate = clientsQuery.data?.find(
      client => client.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      setClientId(String(duplicate.id));
      setShowClientCreator(false);
      setClientDraft({ name: "", sector: "" });
      return toast.info("Ese cliente ya existía y quedó seleccionado.");
    }
    createClient.mutate({
      name,
      sector: clientDraft.sector.trim() || "Por definir",
    });
  };
  const saveTrendReference = () => {
    if (!ensureAuth()) return;
    if (!trendDraft.spoken.trim())
      return toast.error("Escribe el hook observado.");
    if (!trendDraft.insight.trim())
      return toast.error("Explica por qué funciona esta referencia.");
    createTrendReference.mutate({
      ...trendDraft,
      insertTitle: trendDraft.insertTitle.trim() || undefined,
      sourceUrl: trendDraft.sourceUrl.trim() || undefined,
      tags: trendDraft.tags.trim(),
      spoken: trendDraft.spoken.trim(),
      insight: trendDraft.insight.trim(),
    });
  };
  const productionText = () =>
    [
      "FICHA DE PRODUCCIÓN — HOOK",
      "───────────────────────────────────────",
      "",
      formatField("OBJETIVO:", form.objective),
      formatField("MÉTRICA PRINCIPAL:", detail.metric),
      formatField("PLATAFORMA:", form.platform),
      formatField("AUDIENCIA Y MOMENTO:", form.audience),
      "",
      formatField("TENSIÓN O DESEO:", form.tension),
      formatField("VERDAD DE MARCA:", form.truth),
      formatField("PRUEBA DISPONIBLE:", form.proof),
      "",
      "── APERTURA ──────────────────────────",
      "",
      formatField("HOOK HABLADO:", `${form.spoken} [${wordCount} palabras]`),
      formatField(
        "INSERT-TITULO:",
        `${form.overlay} [${insertTitleCount} palabras]`
      ),
      formatField("PRIMER FOTOGRAMA:", form.frame),
      formatField("PAGO DE PROMESA:", form.payoff),
      formatField("CTA:", form.cta),
      "",
      "── CONTROL ───────────────────────────",
      "",
      formatField("RIESGO / CLAIM:", form.risk),
      formatField(
        "AUDITOR:",
        hasAudited
          ? `${audit.score}/100 · ${audit.passed ? "APROBADO" : "REESCRIBIR"}`
          : "Pendiente de auditar"
      ),
    ].join("\n");
  const saveProduction = () => {
    if (!ensureAuth()) return;
    if (!clientId) {
      toast.error("Selecciona o añade un cliente antes de guardar.");
      return openClientCreator();
    }
    saveCopy.mutate({
      clientId: Number(clientId),
      objective: form.objective || "Guardados",
      platform: form.platform,
      audience: form.audience,
      tension: form.tension,
      spoken: form.spoken,
      overlay: form.overlay,
      proof: form.proof,
      firstFrame: form.frame,
      cta: form.cta,
      auditScore: hasAudited ? audit.score : 0,
      primaryMetric: detail.metric,
      status: "draft",
    });
  };
  const exportCsv = () => {
    const rows = productionText()
      .split("\n")
      .map(line => [line]);
    const csv = rows
      .map(row => row.map(cell => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    link.download = `ficha-copy-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const exportPdf = () => {
    const popup = window.open("", "_blank", "width=820,height=900");
    if (!popup)
      return toast.error("Permite ventanas emergentes para exportar PDF.");
    popup.document.write(
      `<!doctype html><html lang="es"><head><title>Ficha de producción</title><style>body{font:15px/1.5 Arial,sans-serif;color:#051a2a;padding:42px}pre{white-space:pre-wrap;font:14px/1.6 ui-monospace,monospace;border-top:2px solid #315166;padding-top:18px}h1{font-size:26px;color:#315166}</style></head><body><h1>Conejo Copy Check</h1><pre>${escapeHtml(productionText())}</pre><script>window.onload=()=>window.print()<\/script></body></html>`
    );
    popup.document.close();
  };
  const copyProduction = async () => {
    try {
      await navigator.clipboard.writeText(productionText());
      toast.success("Ficha copiada al portapapeles.");
    } catch {
      toast.error("No se pudo copiar la ficha.");
    }
  };
  const rate =
    calculator.impressions && calculator.views
      ? (toNumber(calculator.views) /
          Math.max(1, toNumber(calculator.impressions))) *
        100
      : 0;
  const rateVerdict =
    rate < 15
      ? [
          "Matar",
          "La apertura no está parando el scroll. Cambia fotograma y primer segundo.",
        ]
      : rate < 20
        ? [
            "Arreglar apertura",
            "Prueba tres aperturas nuevas sobre el mismo cuerpo.",
          ]
        : rate < 30
          ? ["Sano", "Mira el hold rate: si cae, el problema ya no es el hook."]
          : rate < 35
            ? [
                "Bueno",
                "Anota territorio y mecanismo: puede ser un estándar del cliente.",
              ]
            : [
                "Élite",
                "Genera variantes del mismo territorio antes de que fatigue.",
              ];

  return (
    <div className="min-h-screen bg-[#f7f4f2] text-[#051a2a] lg:flex">
      <aside className="sticky top-0 z-40 hidden h-screen w-[258px] shrink-0 flex-col overflow-hidden bg-[#321327] px-5 py-6 text-white lg:flex">
        <div className="window-arcs pointer-events-none absolute inset-0 opacity-80" />
        <SidebarBody
          progress={progress}
          user={sidebarUser}
          onNavigate={openExplanation}
          onLogout={handleLogout}
        />
      </aside>
      <MobileNavDrawer
        open={mobileNav}
        onClose={closeMobileNav}
        progress={progress}
        user={sidebarUser}
        onNavigate={href => {
          closeMobileNav();
          openExplanation(href);
        }}
        onLogout={handleLogout}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#eadfe4] bg-[#f7f4f2]/95 px-5 py-4 backdrop-blur lg:px-9">
          <div className="mx-auto flex max-w-[1500px] items-center gap-4">
            <div className="flex items-center gap-2 lg:hidden">
              <BrandSymbol className="h-9 w-9" />
              <span className="hidden text-sm font-bold min-[430px]:inline">
                Copy Check
              </span>
            </div>
            <span className="hidden eyebrow text-[#617381] lg:block">
              Redacción · edición · cuentas
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden rounded-full bg-[#e9f0f3] px-3 py-1.5 text-xs text-[#315166] sm:block">
                Umbral de paso: {PASS_SCORE}
              </span>
              <Button
                onClick={() =>
                  document
                    .getElementById("canvas")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full bg-[#602249] px-3 text-xs text-white hover:bg-[#4c1b3a] sm:px-4"
              >
                <span className="hidden min-[430px]:inline">Abrir canvas</span>
                <ArrowRight className="min-[430px]:ml-1 h-3.5 w-3.5" />
              </Button>
              <button
                className="grid h-9 w-9 place-items-center rounded-full border border-[#e7dde1] transition hover:border-[#602249] hover:text-[#602249] lg:hidden"
                onClick={() => setMobileNav(true)}
                aria-label="Abrir menú"
                aria-expanded={mobileNav}
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-9 lg:py-9">
          <DailyDesk
            clients={clientsQuery.data ?? []}
            history={historyQuery.data ?? []}
            currentClientId={clientId}
            objective={form.objective}
            activeRule={activeRule}
            isAuthenticated={isAuthenticated}
            onClientSelect={setClientId}
            onObjectiveSelect={(objective: string) =>
              update("objective", objective)
            }
            onNewClient={openClientCreator}
            onStart={() =>
              document
                .getElementById("canvas")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            onHistory={() =>
              document
                .getElementById("historial")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            onRules={() =>
              document
                .getElementById("reglas")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            onNew={() => {
              setForm({ ...blankForm, platform: form.platform });
              setChecked(Array(9).fill(false));
              setHasAudited(false);
              document
                .getElementById("canvas")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <ObjectiveGuide
            active={form.objective}
            onSelect={objective => update("objective", objective)}
          />
          <section
            id="ventana"
            className="window-arcs relative overflow-hidden rounded-[2rem] bg-[#602249] px-6 py-6 text-white surface-shadow sm:px-10"
          >
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow text-[#8fa8ba]">
                  La Ventana / manual de hooks
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-[-.045em] sm:text-3xl">
                  Un hook es una decisión completa.
                </h1>
              </div>
              <button
                type="button"
                onClick={() => toggleSection("ventana")}
                aria-expanded={Boolean(openSections.ventana)}
                aria-controls="ventana-content"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                {openSections.ventana
                  ? "Ocultar introducción"
                  : "Ver introducción"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${openSections.ventana ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            <div
              id="ventana-content"
              hidden={!openSections.ventana}
              className="relative mt-6 grid items-center gap-7 xl:grid-cols-[1.2fr_.8fr]"
            >
              <p className="max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                Guion, primer fotograma, Insert-Titulo, prueba y montaje
                trabajan en la misma ventana de atención. Este manual reúne el
                proceso para producirlos y el criterio para revisarlos.
              </p>
              <RetentionCurve />
            </div>
          </section>
          <CollapsibleSection
            id="fundamento"
            code="01 / Fundamento"
            title="El estándar de la agencia"
            body="Un hook abre atención cuando nombra una tensión real y gana confianza cuando entrega una respuesta concreta. Esta es la secuencia para revisar la apertura antes de producir."
            open={Boolean(openSections.fundamento)}
            onToggle={() => toggleSection("fundamento")}
          >
            <div className="grid gap-4 md:grid-cols-3">
              {foundationCards.map(card => (
                <FoundationCard key={card.code} {...card} />
              ))}
            </div>
            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
              <article className="min-w-0 rounded-[1.5rem] bg-white p-5 surface-shadow sm:p-7">
                <div className="flex flex-col gap-2 border-b border-[#eadfe4] pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow text-[#315166]">Cinco principios</p>
                    <h3 className="mt-1 text-2xl font-bold">
                      De la intención a la señal.
                    </h3>
                  </div>
                  <p className="text-sm text-[#637481]">
                    Úsalos como control, no como fórmula.
                  </p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Principle
                    title="Relevancia"
                    question="¿Para quién es y qué vive ahora?"
                    signal="Esto me pasa"
                  />
                  <Principle
                    title="Claridad"
                    question="¿Qué verá o resolverá esta pieza?"
                    signal="Se entiende en una lectura"
                  />
                  <Principle
                    title="Evidencia"
                    question="¿Qué prueba real aparecerá en pantalla?"
                    signal="Hay demostración o resultado"
                  />
                  <Principle
                    title="Voz propia"
                    question="¿Podría decirlo cualquier otra marca?"
                    signal="La escena es de este cliente"
                  />
                  <Principle
                    title="Recompensa"
                    question="¿Cuándo llega la primera señal de valor?"
                    signal="Ocurre antes del segundo cuatro"
                    wide
                  />
                </div>
              </article>
              <aside className="rounded-[1.5rem] bg-[#051a2a] p-5 text-white surface-shadow sm:p-7">
                <p className="eyebrow text-[#8fa8ba]">Las tres capas</p>
                <h3 className="mt-2 text-2xl font-bold">
                  Cada una debe sostener la promesa.
                </h3>
                <div className="mt-6 space-y-3">
                  <Layer
                    title="01 · Visual"
                    text="La imagen orienta incluso cuando el sonido está apagado."
                  />
                  <Layer
                    title="02 · Insert-Titulo"
                    text="Condensa el núcleo en seis palabras o menos, sin transcribir la voz."
                  />
                  <Layer
                    title="03 · Voz"
                    text="Declara la promesa sin saludo, contexto sobrante ni presentación."
                  />
                </div>
                <div className="mt-5 rounded-xl bg-[#315166] p-4 text-sm leading-6 text-white">
                  <b>Test de las dos privaciones.</b> Mira la pieza sin sonido y
                  escúchala sin mirar pantalla. Cada capa debe explicar de qué
                  va y dar motivo para seguir.
                </div>
              </aside>
            </div>
          </CollapsibleSection>
          <section id="canvas" className="scroll-mt-24 pt-14">
            <SectionHeading
              code="02 / Preproducción"
              title="Hook Canvas"
              body="Completa la decisión antes de redactar. Al final genera una ficha que edición puede ejecutar sin interpretar la idea."
            />
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
              <div className="rounded-[1.5rem] bg-white p-5 surface-shadow sm:p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Cliente" hint="Necesario para guardar.">
                    <div className="flex">
                      <FieldSelect
                        value={clientId}
                        onChange={value =>
                          value === "__new__"
                            ? openClientCreator()
                            : setClientId(value)
                        }
                        className="min-w-0 flex-1 rounded-r-none border-r-0"
                        options={[
                          { value: "", label: "Selecciona un cliente" },
                          ...(clientsQuery.data ?? []).map(client => ({
                            value: String(client.id),
                            label: `${client.name} · ${client.sector}`,
                          })),
                          {
                            value: "__new__",
                            label: "＋ Añadir cliente nuevo",
                          },
                        ]}
                      />
                      <button
                        type="button"
                        onClick={openClientCreator}
                        aria-label="Añadir cliente nuevo"
                        title="Añadir cliente nuevo"
                        className="flex h-12 w-11 shrink-0 items-center justify-center rounded-r-[0.9rem] border border-[#e7dde1] bg-white text-[#315166] transition hover:bg-[#eef4f7]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </Field>
                  <Field label="Objetivo" hint={`Métrica: ${detail.metric}`}>
                    <FieldSelect
                      value={form.objective}
                      onChange={value => update("objective", value)}
                      options={[
                        { value: "", label: "Elegir…" },
                        ...objectives.map(item => ({
                          value: item,
                          label: item,
                        })),
                      ]}
                    />
                  </Field>
                  <Field
                    label="Audiencia y momento"
                    hint="Persona concreta y contexto."
                  >
                    <textarea
                      value={form.audience}
                      onChange={e => update("audience", e.target.value)}
                      className="field min-h-24"
                      placeholder="Piel sensible, comparando rutinas"
                    />
                  </Field>
                  <Field label="Tensión o deseo" hint="La decisión o fricción.">
                    <textarea
                      value={form.tension}
                      onChange={e => update("tension", e.target.value)}
                      className="field min-h-24"
                      placeholder="Quiero una rutina simple sin probar diez productos."
                    />
                  </Field>
                  <Field
                    label="Verdad de marca"
                    hint="Una convicción demostrable."
                  >
                    <textarea
                      value={form.truth}
                      onChange={e => update("truth", e.target.value)}
                      className="field min-h-24"
                      placeholder="Fórmula sin fragancia con ingredientes mínimos."
                    />
                  </Field>
                  <Field
                    label="Prueba disponible"
                    hint="Sin prueba hay eslogan."
                  >
                    <textarea
                      value={form.proof}
                      onChange={e => update("proof", e.target.value)}
                      className="field min-h-24"
                      placeholder="Textura, aplicación, resultado, proceso…"
                    />
                  </Field>
                </div>
                <div className="my-7 border-t border-[#eee6e8]" />
                <div className="mb-5 flex gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e9f0f3] text-[#315166]">
                    <MessageCircleMore className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Apertura y pago</h3>
                    <p className="text-xs text-[#637481]">
                      Las capas se revisan como una decisión, no como campos
                      aislados.
                    </p>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Hook hablado" hint={`${wordCount}/12 palabras`}>
                    <textarea
                      value={form.spoken}
                      onChange={e => update("spoken", e.target.value)}
                      className="field min-h-28 text-base font-medium"
                      placeholder="Tres pasos en vez de diez, para piel que se irrita con todo."
                    />
                  </Field>
                  <Field
                    label="Insert-Titulo"
                    hint={`${insertTitleCount}/6 palabras`}
                    className="flex h-full flex-col"
                  >
                    <input
                      value={form.overlay}
                      onChange={e => update("overlay", e.target.value)}
                      className="field"
                      placeholder="Tres pasos, no diez"
                    />
                    <div className="mt-3 flex flex-1 flex-col justify-center rounded-xl bg-[#051a2a] p-4 text-white">
                      <p className="eyebrow text-[#8fa8ba]">Vista en mudo</p>
                      <p className="mt-1 text-lg font-semibold">
                        {form.overlay || "El núcleo aparece aquí."}
                      </p>
                    </div>
                  </Field>
                  <Field
                    label="Primer fotograma"
                    hint="Debe comunicar en silencio."
                  >
                    <input
                      value={form.frame}
                      onChange={e => update("frame", e.target.value)}
                      className="field"
                      placeholder="Tocador lleno que se reduce a tres productos"
                    />
                  </Field>
                  <Field
                    label="Pago de la promesa"
                    hint="Primera señal de valor."
                  >
                    <input
                      value={form.payoff}
                      onChange={e => update("payoff", e.target.value)}
                      className="field"
                      placeholder="Segundo 4: los tres pasos y para qué sirve cada uno"
                    />
                  </Field>
                  <Field label="CTA congruente" hint="Proporcional al valor.">
                    <input
                      value={form.cta}
                      onChange={e => update("cta", e.target.value)}
                      className="field"
                      placeholder="Guárdalo para revisar tu rutina esta noche"
                    />
                  </Field>
                  <Field
                    label="Riesgo o claim a validar"
                    hint="No sale sin visto bueno."
                  >
                    <input
                      value={form.risk}
                      onChange={e => update("risk", e.target.value)}
                      className="field"
                      placeholder="Validar una comparación o claim de salud"
                    />
                  </Field>
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      document
                        .getElementById("auditor")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="rounded-full bg-[#602249] text-white hover:bg-[#4c1b3a]"
                  >
                    <Gauge className="mr-2 h-4 w-4" />
                    Ir al auditor
                  </Button>
                  <Button
                    onClick={() => {
                      setForm(blankForm);
                      setHasAudited(false);
                    }}
                    variant="outline"
                    className="rounded-full"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Vaciar canvas
                  </Button>
                  <Button
                    onClick={copyProduction}
                    variant="outline"
                    className="rounded-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar ficha
                  </Button>
                  <Button
                    onClick={exportCsv}
                    variant="outline"
                    className="rounded-full"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    onClick={exportPdf}
                    variant="outline"
                    className="rounded-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
              {/* Follows the scroll: the form column is far taller, and a fixed
                  card would leave a large dead area beside it. */}
              <div className="rounded-[1.5rem] border-t-4 border-[#315166] bg-[#051a2a] p-6 text-white surface-shadow xl:sticky xl:top-24">
                <p className="eyebrow text-[#8fa8ba]">Ficha para edición</p>
                {/* One element per line, each cut with an ellipsis. Wrapping
                    would make the card grow with whatever was typed; here the
                    height depends only on how many rows the sheet has, and the
                    full text stays one click away. */}
                <div className="sheet-scroll mt-4 max-h-[calc(100vh-21rem)] overflow-x-hidden overflow-y-auto pr-1 font-mono text-xs leading-5 text-white/80">
                  {productionText()
                    .split("\n")
                    .map((line, index) => (
                      <p
                        key={index}
                        className="truncate"
                        title={line || undefined}
                      >
                        {line || "\u00A0"}
                      </p>
                    ))}
                </div>
                <Button
                  onClick={saveProduction}
                  disabled={saveCopy.isPending}
                  className="mt-5 w-full rounded-xl bg-[#315166] text-white hover:bg-[#244357]"
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Guardar en historial
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/80 transition hover:border-white/35 hover:text-white">
                      <Maximize2 className="h-3.5 w-3.5 text-[#8fa8ba]" />
                      Ver ficha completa
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl border-[#1d3547] bg-[#051a2a] text-white">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Ficha de producción
                      </DialogTitle>
                      <DialogDescription className="text-white/60">
                        El texto completo, sin recortes. Cópialo tal cual para
                        edición.
                      </DialogDescription>
                    </DialogHeader>
                    <pre className="sheet-scroll max-h-[62vh] overflow-x-hidden overflow-y-auto [overflow-wrap:anywhere] rounded-xl bg-white/5 p-4 text-xs leading-5 whitespace-pre-wrap text-white/85">
                      {productionText()}
                    </pre>
                    <DialogFooter>
                      <Button
                        onClick={copyProduction}
                        className="rounded-xl bg-[#315166] text-white hover:bg-[#244357]"
                      >
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Copiar ficha
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </section>
          <CollapsibleSection
            id="territorios"
            code="03 / Decisión"
            title="Elegir territorio antes que fórmula"
            body="El objetivo selecciona una intención y una evidencia. La frase llega después."
            open={Boolean(openSections.territorios)}
            onToggle={() => toggleSection("territorios")}
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-[1.5rem] bg-[#321327] p-6 text-white surface-shadow">
                <p className="eyebrow text-[#8fa8ba]">Objetivo seleccionado</p>
                <h3 className="mt-2 text-2xl font-bold">
                  {form.objective || "Elige un objetivo en el Canvas"}
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/75">
                  {detail.note}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <MiniMetric label="Territorio" value={detail.territory} />
                <MiniMetric label="Mejor evidencia" value={detail.evidence} />
                <MiniMetric label="Métrica de test" value={detail.metric} />
              </div>
            </div>
          </CollapsibleSection>
          <CollapsibleSection
            id="biblioteca"
            code="04 / Biblioteca"
            title="42 aperturas para adaptar, no copiar"
            body="El territorio define la intención; el mecanismo define cómo se demuestra. Filtra ambos y utiliza los corchetes para adaptar la fórmula a la verdad del cliente."
            open={Boolean(openSections.biblioteca)}
            onToggle={() => toggleSection("biblioteca")}
          >
            <div className="rounded-[1.5rem] bg-white p-5 surface-shadow sm:p-7">
              <TrendReferencesPanel
                references={filteredTrendReferences as TrendReferenceRecord[]}
                loading={trendReferencesQuery.isLoading}
                isAuthenticated={isAuthenticated}
                search={trendSearch}
                setSearch={setTrendSearch}
                platform={trendPlatform}
                setPlatform={setTrendPlatform}
                territory={trendTerritory}
                setTerritory={setTrendTerritory}
                draft={trendDraft}
                setDraft={setTrendDraft}
                saving={createTrendReference.isPending}
                onSave={saveTrendReference}
                onUse={item => {
                  setForm(current => applyTrendReference(current, item));
                  setHasAudited(false);
                  document
                    .getElementById("canvas")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                onLogin={goToLogin}
              />
              <div className="my-8 border-t border-[#e7eef1]" />
              <p className="eyebrow text-[#617381]">Territorio · elige uno</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip
                  active={territory === "all"}
                  onClick={() => setTerritory("all")}
                >
                  Todos
                </Chip>
                {Object.entries(territoryLabels).map(([id, label]) => (
                  <Chip
                    key={id}
                    active={territory === id}
                    onClick={() => setTerritory(id)}
                  >
                    {id} · {label}
                  </Chip>
                ))}
              </div>
              <p className="eyebrow mt-6 text-[#617381]">
                Mecanismo · puede haber varios
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip
                  active={mechanism === "all"}
                  onClick={() => setMechanism("all")}
                >
                  Cualquiera
                </Chip>
                {(Object.entries(mechanismLabels) as [Mechanism, string][]).map(
                  ([id, label]) => (
                    <Chip
                      key={id}
                      active={mechanism === id}
                      onClick={() => setMechanism(id)}
                    >
                      {label}
                    </Chip>
                  )
                )}
              </div>
              <div className="relative mt-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71818c]" />
                <input
                  value={librarySearch}
                  onChange={e => setLibrarySearch(e.target.value)}
                  className="field pl-10"
                  placeholder="Buscar proceso, precio, silla…"
                />
              </div>
              <div className="mt-3 text-xs font-medium text-[#637481]">
                {filteredLibrary.length}{" "}
                {filteredLibrary.length === 1 ? "apertura" : "aperturas"}
              </div>
              <div className="mt-6 grid gap-4">
                {filteredLibrary.map(item => (
                  <article
                    key={item.id}
                    className="grid gap-4 border-l-4 border-[#315166] bg-[#f7fbfc] p-5 lg:grid-cols-[1.3fr_.7fr]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#315166]">
                        <span>
                          {item.territory} · {territoryLabels[item.territory]}
                        </span>
                        {item.mechanism.map(id => (
                          <span
                            key={id}
                            className="rounded-full bg-[#e9f0f3] px-2 py-1 text-[#315166]"
                          >
                            {mechanismLabels[id]}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-lg font-semibold leading-7">
                        {highlightVariables(item.template)}
                      </p>
                      <p className="mt-4 text-xs font-semibold text-[#617381]">
                        EJEMPLO HABLADO
                      </p>
                      <p className="mt-1 text-sm leading-6">“{item.example}”</p>
                      <span className="mt-3 inline-block rounded-full bg-[#051a2a] px-3 py-1.5 text-xs font-semibold text-white">
                        {item.overlay}
                      </span>
                    </div>
                    <div className="rounded-xl bg-[#e9f0f3] p-4">
                      <p className="eyebrow text-[#315166]">
                        Dirección para edición
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6">
                        {item.edit}
                      </p>
                      <p className="eyebrow mt-5 text-[#315166]">
                        Úsalo cuando
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#315166]">
                        {item.useWhen}
                      </p>
                      <button
                        onClick={() => {
                          update("spoken", item.example);
                          update("overlay", item.overlay);
                          document
                            .getElementById("canvas")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="mt-5 text-xs font-semibold text-[#315166]"
                      >
                        Usar como punto de partida{" "}
                        <ChevronRight className="inline h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </CollapsibleSection>
          <CollapsibleSection
            id="visual"
            code="05 / Edición"
            title="Los primeros segundos en pantalla"
            body="La edición hace legible la idea; no compite con ella. El primer fotograma debe comunicar incluso con el sonido apagado."
            open={Boolean(openSections.visual)}
            onToggle={() => toggleSection("visual")}
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <TableBlock
                title="Diez patrones visuales"
                headers={["Patrón", "Aplicación"]}
                rows={[
                  [
                    "Antes / después",
                    "Mismo ángulo de cámara en ambos estados.",
                  ],
                  [
                    "Pantalla dividida",
                    "Dos métodos o productos en paralelo desde el fotograma uno.",
                  ],
                  [
                    "Macro o detalle",
                    "Textura, costura, ingrediente, cifra o gesto.",
                  ],
                  [
                    "Mano en acción",
                    "Preparar, ajustar, mezclar, reparar o probar.",
                  ],
                  [
                    "Objeto fuera de contexto",
                    "Situación inesperada pero relevante.",
                  ],
                  [
                    "Pregunta física",
                    "Tarjeta, pizarra, comentario o búsqueda visible.",
                  ],
                  [
                    "Dato visual",
                    "Cifra señalada sobre documento o pantalla real.",
                  ],
                  [
                    "Reacción primero",
                    "Persona ve el resultado antes de la explicación.",
                  ],
                  ["Tres pasos", "Texto breve por etapa y demostración."],
                  [
                    "Sonido táctil",
                    "Corte, hervor, papel o herramienta como apoyo.",
                  ],
                ]}
              />
              <TableBlock
                title="Reloj de la apertura"
                headers={["Momento", "Función"]}
                rows={[
                  ["0–1 s", "Orientar con imagen e Insert-Titulo."],
                  ["1–4 s", "Confirmar prueba o escena relevante."],
                  ["4–12 s", "Explicar, comparar o demostrar."],
                  ["Cierre", "Conclusión y CTA proporcional."],
                ]}
              />
            </div>
            <div className="mt-5 rounded-2xl bg-[#051a2a] p-6 text-white">
              <p className="eyebrow text-[#8fa8ba]">
                Ajuste por plataforma · {form.platform}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {platformGuidance[form.platform]}
              </p>
            </div>
          </CollapsibleSection>
          <section id="auditor" className="scroll-mt-24 pt-14">
            <SectionHeading
              code="06 / Control previo"
              title="Auditor de hooks"
              body={`Aplica nueve controles conocidos antes de grabar. Umbral de paso visible: ${PASS_SCORE}/100.`}
            />
            <div className="rounded-xl border border-[#d77474] bg-[#fff2f1] p-4 text-sm leading-6 text-[#7f2b2b]">
              <b>Esta puntuación todavía no está validada.</b> Los controles
              salen de investigación disponible y criterio de la casa, no de un
              modelo contrastado contra resultados. Úsala como lista de
              comprobación, no como oráculo.
            </div>
            <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_.9fr]">
              <div className="rounded-[1.5rem] bg-white p-6 surface-shadow">
                <Field
                  label="Hook hablado"
                  hint={`${wordCount} palabras · mínimo 4, recomendado 7–12`}
                >
                  <textarea
                    value={form.spoken}
                    onChange={e => update("spoken", e.target.value)}
                    className="field min-h-28 text-base"
                    placeholder="Pega o escribe el hook que quieres revisar."
                  />
                </Field>
                <div className="mt-5">
                  <Field
                    label="Insert-Titulo (opcional)"
                    hint={`${insertTitleCount} palabras · máximo 6`}
                  >
                    <input
                      value={form.overlay}
                      onChange={e => update("overlay", e.target.value)}
                      className="field"
                      placeholder="El núcleo de la promesa"
                    />
                  </Field>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => setHasAudited(true)}
                    className="rounded-full bg-[#602249] text-white hover:bg-[#4c1b3a]"
                  >
                    Auditar hook
                  </Button>
                  <Button
                    onClick={() => {
                      update("spoken", "");
                      update("overlay", "");
                      setHasAudited(false);
                    }}
                    variant="outline"
                    className="rounded-full"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
              <AuditResultPanel
                result={audit}
                visible={hasAudited}
                rule={activeRule}
              />
            </div>
            <div className="mt-7 rounded-[1.5rem] bg-white p-6 surface-shadow">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="eyebrow text-[#617381]">
                    Filtro de calidad antes de producir
                  </p>
                  <h3 className="mt-1 text-xl font-bold">
                    {progress} de 9 comprobaciones
                  </h3>
                </div>
                <p
                  className={`text-sm font-semibold ${progress === 9 ? "text-[#35603c]" : "text-[#9a3e3e]"}`}
                >
                  {progress === 9
                    ? "Las nueve marcadas. Puede pasar a producción."
                    : `Faltan ${9 - progress}. La pieza no sale a producción.`}
                </p>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {qualityItems.map((item, index) => (
                  <label
                    key={item}
                    className="flex cursor-pointer gap-3 rounded-xl bg-[#f7f4f2] p-3 text-sm leading-5"
                  >
                    <input
                      type="checkbox"
                      checked={checked[index]}
                      onChange={() =>
                        setChecked(current =>
                          current.map((value, position) =>
                            position === index ? !value : value
                          )
                        )
                      }
                      className="mt-0.5 h-4 w-4 accent-[#602249]"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
          <CollapsibleSection
            id="cementerio"
            code="07 / Prohibido"
            title="Cementerio"
            body="La primera lista no admite excepción. La segunda exige una justificación escrita en la ficha de producción."
            open={Boolean(openSections.cementerio)}
            onToggle={() => toggleSection("cementerio")}
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <Cemetery
                title="Prohibido sin excepción"
                items={[
                  [
                    "Hola chicos, bienvenidos",
                    "Retrasa el valor. Primera palabra = primera idea.",
                  ],
                  [
                    "Insert-Titulo letra a letra",
                    "Consume la ventana antes de comunicar nada.",
                  ],
                  [
                    "Insert-Titulo = transcripción",
                    "El Insert-Titulo lleva el núcleo; la voz, la frase.",
                  ],
                  [
                    "Prometer más de lo que das",
                    "Promete exactamente lo que entregarás.",
                  ],
                ]}
                dark
              />
              <Cemetery
                title="Permitido solo con justificación"
                items={[
                  [
                    "Espera al final",
                    "Solo si el final está insinuado y la espera es corta.",
                  ],
                  ["No vas a creer", "Nombra qué pasó y oculta el porqué."],
                  [
                    "Corte rápido genérico",
                    "Cada corte debe revelar contraste o prueba.",
                  ],
                  ["Repetir hook ganador", "Repite mecanismo, no palabras."],
                  ["Producto en caja", "Abre con uso, manos o problema."],
                  ["Marca de agua ajena", "Reexporta limpio y readapta."],
                ]}
              />
            </div>
          </CollapsibleSection>
          <CollapsibleSection
            id="numeros"
            code="08 / Medición"
            title="Números de referencia"
            body="Un hook no se discute en reunión, se lee en una métrica. Estas bandas son un punto de partida, no una verdad de plataforma."
            open={Boolean(openSections.numeros)}
            onToggle={() => toggleSection("numeros")}
          >
            <TableBlock
              title="Bandas orientativas"
              headers={["Métrica", "Banda sana", "Lectura"]}
              rows={[
                [
                  "Hook rate · Meta",
                  "25–30% base · 35–45% élite · <15% matar",
                  "Por debajo de 20%, cambia la apertura.",
                ],
                [
                  "Hook rate · TikTok",
                  "30–40%",
                  "La ventana de conteo es distinta: no compares plataformas.",
                ],
                [
                  "Hold rate",
                  "≈25% o más",
                  "Buen hook y hold bajo: problema de cuerpo.",
                ],
                [
                  "Retención 3s orgánica",
                  "35–40% o más",
                  "Léela junto a la curva.",
                ],
                [
                  "Volumen mínimo",
                  "2.000 imp. / estable 5–10k",
                  "Antes es ruido, no veredicto.",
                ],
              ]}
            />
            <div className="mt-5 rounded-xl border border-[#d77474] bg-[#fff2f1] p-4 text-sm leading-6 text-[#7f2b2b]">
              <b>Aviso sobre estas cifras.</b> Ninguna plataforma publica
              umbrales oficiales de hook rate. Las bandas provienen de
              proveedores de analítica con sesgo de cartera; después del primer
              mes, la referencia útil es el histórico de tu cuenta.
            </div>
            <div className="mt-6 rounded-[1.5rem] bg-[#051a2a] p-6 text-white">
              <p className="eyebrow text-[#8fa8ba]">
                Diagnóstico de hook rate · Meta / tráfico frío
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  type="number"
                  min="0"
                  value={calculator.impressions}
                  onChange={e =>
                    setCalculator({
                      ...calculator,
                      impressions: e.target.value,
                    })
                  }
                  className="field"
                  placeholder="Impresiones"
                />
                <input
                  type="number"
                  min="0"
                  value={calculator.views}
                  onChange={e =>
                    setCalculator({ ...calculator, views: e.target.value })
                  }
                  className="field"
                  placeholder="Reproducciones 3 s"
                />
                <Button
                  onClick={() => setCalculator({ ...calculator, shown: true })}
                  className="rounded-xl bg-[#315166] text-white hover:bg-[#244357]"
                >
                  Calcular
                </Button>
              </div>
              {calculator.shown && (
                <div className="mt-5 rounded-xl bg-white/8 p-4">
                  <p className="text-3xl font-bold text-white">
                    {calculator.impressions ? `${rate.toFixed(1)} %` : "—"}
                  </p>
                  <p className="mt-1 font-semibold">
                    {calculator.impressions ? rateVerdict[0] : "Faltan datos"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    {calculator.impressions
                      ? `${toNumber(calculator.impressions) < 2000 ? "Con menos de 2.000 impresiones, la cifra puede ser ruido. " : ""}${rateVerdict[1]}`
                      : "Introduce impresiones y vistas a 3 segundos."}
                  </p>
                </div>
              )}
            </div>
          </CollapsibleSection>
          <HistorySection
            clients={clientsQuery.data ?? []}
            data={filteredHistory}
            loading={historyQuery.isLoading}
            search={historySearch}
            setSearch={setHistorySearch}
            clientFilter={historyClient}
            setClientFilter={setHistoryClient}
            statusFilter={historyStatus}
            setStatusFilter={setHistoryStatus}
            showCreator={showClientCreator}
            setShowCreator={setShowClientCreator}
            clientDraft={clientDraft}
            setClientDraft={setClientDraft}
            createClient={createContextClient}
            creating={createClient.isPending}
            selectedRecord={selectedRecord}
            setSelectedRecord={setSelectedRecord}
            resultForm={resultForm}
            setResultForm={setResultForm}
            saveResult={() => {
              if (selectedRecord)
                saveResult.mutate({
                  copyRecordId: selectedRecord,
                  impressions: toNumber(resultForm.impressions),
                  threeSecondViews: toNumber(resultForm.threeSecondViews),
                  saves: toNumber(resultForm.saves),
                  shares: toNumber(resultForm.shares),
                  clicks: toNumber(resultForm.clicks),
                  conversions: toNumber(resultForm.conversions),
                  learning: resultForm.learning || undefined,
                });
            }}
            saving={saveResult.isPending}
            isAuthenticated={isAuthenticated}
            onLogin={goToLogin}
          />
          <RulesSection
            clients={clientsQuery.data ?? []}
            rules={rulesQuery.data ?? []}
            draft={ruleDraft}
            setDraft={setRuleDraft}
            saving={createRule.isPending}
            isAuthenticated={isAuthenticated}
            onLogin={goToLogin}
            createRule={() => {
              if (!ensureAuth()) return;
              if (!ruleDraft.label) return toast.error("Nombra la regla.");
              createRule.mutate({
                label: ruleDraft.label,
                clientId: ruleDraft.clientId
                  ? Number(ruleDraft.clientId)
                  : undefined,
                sector: ruleDraft.sector || undefined,
                maxSpokenWords: toNumber(ruleDraft.maxSpokenWords),
                maxOverlayWords: toNumber(ruleDraft.maxOverlayWords),
                requireProof: ruleDraft.requireProof,
                preambles: ruleDraft.preambles,
                tiredPhrases: ruleDraft.tiredPhrases,
                tensionTerms: ruleDraft.tensionTerms,
              });
            }}
          />
          <CollapsibleSection
            id="protocolo"
            code="11 / Operación"
            title="Protocolo de prueba"
            body="Para una idea se producen tres aperturas que cambian un factor y se comparan con una métrica decidida antes de publicar."
            open={Boolean(openSections.protocolo)}
            onToggle={() => toggleSection("protocolo")}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <ManualCard
                title="1. Fijar una métrica"
                text="La misma métrica primaria para todas las variantes, definida antes de rodar."
              />
              <ManualCard
                title="2. Cambiar un factor"
                text="Enfoque, fotograma o evidencia; conserva comparable el cuerpo."
              />
              <ManualCard
                title="3. Guardar el aprendizaje"
                text="Ganadora, prometedora, inconclusa o descartada. El porqué importa más que el número."
              />
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <TableBlock
                title="Cuatro veredictos"
                headers={["Veredicto", "Condición"]}
                rows={[
                  ["Ganadora", "Supera base con volumen y alcance comparable."],
                  [
                    "Prometedora",
                    "Va arriba, pero aún falta margen o volumen.",
                  ],
                  [
                    "Inconclusa",
                    "Alcance desigual o diferencias dentro del ruido.",
                  ],
                  [
                    "Descartada",
                    "Por debajo de la línea base con volumen suficiente.",
                  ],
                ]}
              />
              <TableBlock
                title="Ciclo semanal"
                headers={["Paso", "Acción"]}
                rows={[
                  ["1", "Un concepto, cinco aperturas."],
                  ["2", "Pasar por auditor y filtro de calidad."],
                  ["3", "Fijar métrica y margen."],
                  ["4", "Grabar cuerpo una vez, aperturas tres."],
                  ["5", "Publicar en paralelo."],
                  ["6", "Leer a 72 h y con volumen mínimo."],
                  ["7", "Registrar en el banco."],
                  ["8", "Rotar antes de que fatigue."],
                ]}
              />
            </div>
          </CollapsibleSection>
          <CollapsibleSection
            id="fuentes"
            code="12 / Fuentes"
            title="De dónde sale esto"
            body="Etiquetado por fiabilidad. Verifica cada cifra antes de usarla ante un cliente; los formatos, límites y métricas cambian con frecuencia."
            open={Boolean(openSections.fuentes)}
            onToggle={() => toggleSection("fuentes")}
          >
            <div className="grid gap-3">
              <Source
                reliability="Directa"
                title="TikTok for Business — Creative best practices"
                text="Documentación oficial sobre propuesta de valor, hook inicial y márgenes de seguridad."
              />
              <Source
                reliability="Directa"
                title="Declaraciones públicas de Instagram"
                text="Señales de ranking y prioridad a contenido humano y sin pulir."
              />
              <Source
                reliability="Académica"
                title="Teoría del vacío informativo — Loewenstein"
                text="Base del mecanismo de curiosidad: el hueco de información se busca cerrar."
              />
              <Source
                reliability="Vendor"
                title="Informes de analítica creativa"
                text="Origen de bandas de hook y hold rate; contienen sesgo de cartera."
              />
            </div>
          </CollapsibleSection>
        </main>
      </div>
      <ClientQuickAdd
        visible={showClientCreator}
        draft={clientDraft}
        setDraft={setClientDraft}
        saving={createClient.isPending}
        onClose={() => setShowClientCreator(false)}
        onCreate={createContextClient}
      />
    </div>
  );
}

const qualityItems = [
  "La audiencia está definida con un momento o necesidad concreta.",
  "La promesa se comprende de inmediato.",
  "El contenido puede demostrar lo que el hook promete.",
  "El primer fotograma aporta algo por sí mismo, en silencio.",
  "La primera señal de valor aparece antes del segundo cuatro.",
  "El Insert-Titulo tiene seis palabras o menos y no es transcripción.",
  "El tono refleja a este cliente y no una plantilla general.",
  "El CTA corresponde al nivel de confianza de la audiencia.",
  "Los claims tienen validación de cliente, legal o especialista cuando aplica.",
];

function SectionHeading({
  code,
  title,
  body,
}: {
  code: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-6 grid max-w-4xl grid-cols-[42px_1fr] gap-3 sm:grid-cols-[56px_1fr] sm:gap-5">
      <div className="attention-marker" aria-hidden="true">
        <i />
        <b />
      </div>
      <div>
        <p className="eyebrow text-[#617381]">{code}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-[-.045em] sm:text-4xl">
          {title}
        </h2>
        {body && (
          <p className="mt-3 text-sm leading-6 text-[#526a79]">{body}</p>
        )}
      </div>
    </div>
  );
}
export function CollapsibleSection({
  id,
  code,
  title,
  body,
  open,
  onToggle,
  children,
}: {
  id: string;
  code: string;
  title: string;
  body?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pt-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeading
          code={code}
          title={title}
          body={open ? body : undefined}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-content`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#d4e0e5] bg-white px-4 py-2 text-xs font-semibold text-[#315166] transition hover:bg-[#e9f0f3]"
        >
          {open ? "Ocultar explicación" : "Ver explicación"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      <div id={`${id}-content`} hidden={!open} className="mt-1">
        {children}
      </div>
    </section>
  );
}
function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      {/* Baseline alignment plus tabular figures keep the row steady while a
          live word counter changes width as the user types. */}
      <span className="mb-2 flex items-baseline justify-between gap-3">
        <span className="shrink-0 text-xs font-semibold">{label}</span>
        <span className="min-w-0 text-right text-[11px] text-[#71818c] tabular-nums">
          {hint}
        </span>
      </span>
      {children}
    </label>
  );
}
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${active ? "bg-[#315166] text-white" : "bg-[#e9f0f3] text-[#315166] hover:bg-[#dce9ef]"}`}
    >
      {children}
    </button>
  );
}
export function TrendReferencesPanel({
  references,
  loading,
  isAuthenticated,
  search,
  setSearch,
  platform,
  setPlatform,
  territory,
  setTerritory,
  draft,
  setDraft,
  saving,
  onSave,
  onUse,
  onLogin,
}: {
  references: TrendReferenceRecord[];
  loading: boolean;
  isAuthenticated: boolean;
  search: string;
  setSearch: (value: string) => void;
  platform: string;
  setPlatform: (value: string) => void;
  territory: string;
  setTerritory: (value: string) => void;
  draft: TrendReferenceDraft;
  setDraft: (draft: TrendReferenceDraft) => void;
  saving: boolean;
  onSave: () => void;
  onUse: (reference: TrendReferenceRecord) => void;
  onLogin: () => void;
}) {
  const platforms = [
    "all",
    "TikTok",
    "Instagram Reels",
    "YouTube Shorts",
    "Otra",
  ];
  return (
    <section
      aria-label="Referencias de tendencia"
      className="rounded-[1.35rem] border border-[#d4e0e5] bg-[#f7fbfc] p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-[#315166]">Referencias de tendencia</p>
          <h3 className="mt-1 text-xl font-bold">
            Guarda lo que vale la pena adaptar.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#526a79]">
            Registra un hook observado y el motivo por el que funciona. Se
            conserva como referencia del equipo, no como texto para copiar.
          </p>
        </div>
        {!isAuthenticated && (
          <Button
            onClick={onLogin}
            variant="outline"
            className="rounded-full text-xs"
          >
            Iniciar sesión para guardar
          </Button>
        )}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Field label="Hook observado" hint="La apertura que quieres conservar">
          <textarea
            value={draft.spoken}
            onChange={event =>
              setDraft({ ...draft, spoken: event.target.value })
            }
            className="field min-h-24"
            placeholder="La frase, pregunta o escena de apertura…"
          />
        </Field>
        <Field label="Por qué funciona" hint="Tensión, prueba o montaje">
          <textarea
            value={draft.insight}
            onChange={event =>
              setDraft({ ...draft, insight: event.target.value })
            }
            className="field min-h-24"
            placeholder="Ej.: abre con contraste y muestra la prueba antes del segundo tres."
          />
        </Field>
        <Field label="Insert-Titulo" hint="Opcional">
          <input
            value={draft.insertTitle}
            onChange={event =>
              setDraft({ ...draft, insertTitle: event.target.value })
            }
            className="field"
            placeholder="El núcleo breve que aparece en pantalla"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Plataforma" hint="Origen">
            <FieldSelect
              value={draft.platform}
              onChange={value => setDraft({ ...draft, platform: value })}
              options={[
                { value: "TikTok", label: "TikTok" },
                { value: "Instagram Reels", label: "Instagram Reels" },
                { value: "YouTube Shorts", label: "YouTube Shorts" },
                { value: "Otra", label: "Otra" },
              ]}
            />
          </Field>
          <Field label="Territorio" hint="Intención">
            <FieldSelect
              value={draft.territory}
              onChange={value => setDraft({ ...draft, territory: value })}
              options={Object.entries(territoryLabels).map(([id, label]) => ({
                value: id,
                label: `${id} · ${label}`,
              }))}
            />
          </Field>
        </div>
        <Field label="Fuente" hint="Enlace opcional">
          <input
            value={draft.sourceUrl}
            onChange={event =>
              setDraft({ ...draft, sourceUrl: event.target.value })
            }
            className="field"
            type="url"
            placeholder="https://…"
          />
        </Field>
        <Field label="Etiquetas" hint="Separadas por comas">
          <input
            value={draft.tags}
            onChange={event => setDraft({ ...draft, tags: event.target.value })}
            className="field"
            placeholder="antes/después, precio, tutorial"
          />
        </Field>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-[#315166] text-white hover:bg-[#244357]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Guardar referencia
        </Button>
        <p className="text-xs leading-5 text-[#617381]">
          Conserva el mecanismo, pero reescribe las palabras para cada cliente.
        </p>
      </div>
      <div className="mt-8 border-t border-[#d4e0e5] pt-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="eyebrow text-[#315166]">
            Banco del equipo · {references.length}{" "}
            {references.length === 1 ? "referencia" : "referencias"}
          </p>
          <div className="flex flex-wrap gap-2">
            <FieldSelect
              aria-label="Filtrar referencias por plataforma"
              value={platform}
              onChange={setPlatform}
              size="sm"
              className="w-auto min-w-36"
              options={platforms.map((item: string) => ({
                value: item,
                label: item === "all" ? "Todas las plataformas" : item,
              }))}
            />
            <FieldSelect
              aria-label="Filtrar referencias por territorio"
              value={territory}
              onChange={setTerritory}
              size="sm"
              className="w-auto min-w-36"
              options={[
                { value: "all", label: "Todos los territorios" },
                ...Object.entries(territoryLabels).map(([id, label]) => ({
                  value: id,
                  label: `${id} · ${label}`,
                })),
              ]}
            />
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71818c]" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="field pl-10"
            placeholder="Buscar por hook, etiqueta, plataforma o aprendizaje…"
          />
        </div>
        <div className="mt-4 grid gap-3">
          {loading ? (
            <p className="text-sm text-[#617381]">Cargando referencias…</p>
          ) : references.length ? (
            references.map(reference => (
              <article
                key={reference.id}
                className="grid gap-4 rounded-xl border-l-4 border-[#315166] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[#315166]">
                    <span>{reference.platform}</span>
                    <span>·</span>
                    <span>
                      {reference.territory} ·{" "}
                      {territoryLabels[
                        reference.territory as keyof typeof territoryLabels
                      ] ?? "Referencia"}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold leading-6">
                    “{reference.spoken}”
                  </p>
                  {reference.insertTitle && (
                    <span className="mt-3 inline-block rounded-full bg-[#051a2a] px-3 py-1.5 text-xs font-semibold text-white">
                      {reference.insertTitle}
                    </span>
                  )}
                  <p className="mt-3 text-sm leading-6 text-[#526a79]">
                    <b className="text-[#315166]">Lectura:</b>{" "}
                    {reference.insight}
                  </p>
                  {reference.tags && (
                    <p className="mt-2 text-xs text-[#71818c]">
                      #
                      {reference.tags
                        .split(",")
                        .map(tag => tag.trim())
                        .filter(Boolean)
                        .join("  #")}
                    </p>
                  )}
                  {reference.sourceUrl && (
                    <a
                      className="mt-3 inline-block text-xs font-semibold text-[#315166] underline underline-offset-4"
                      href={reference.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir fuente
                    </a>
                  )}
                </div>
                <Button
                  onClick={() => onUse(reference)}
                  variant="outline"
                  className="rounded-full text-xs"
                >
                  Usar como punto de partida{" "}
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-[#c5d7df] bg-white px-4 py-5 text-sm leading-6 text-[#637481]">
              Aún no hay referencias guardadas. Añade un hook que esté
              funcionando y registra qué mecanismo vale la pena adaptar.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
function ManualCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="border-t-2 border-[#315166] bg-white p-5 surface-shadow">
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#617381]">{text}</p>
    </article>
  );
}
function FoundationCard({
  code,
  title,
  text,
}: {
  code: string;
  title: string;
  text: string;
}) {
  return (
    <article className="border-t-4 border-[#315166] bg-white p-5 surface-shadow">
      <p className="eyebrow text-[#315166]">{code}</p>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#526a79]">{text}</p>
    </article>
  );
}
function Principle({
  title,
  question,
  signal,
  wide = false,
}: {
  title: string;
  question: string;
  signal: string;
  wide?: boolean;
}) {
  return (
    <article
      className={`rounded-xl bg-[#f1f5f6] p-4 ${wide ? "sm:col-span-2" : ""}`}
    >
      <p className="text-sm font-bold text-[#315166]">{title}</p>
      <p className="mt-2 text-sm leading-5 text-[#526a79]">{question}</p>
      <p className="mt-3 text-xs font-semibold text-[#315166]">
        Señal: {signal}.
      </p>
    </article>
  );
}
function Layer({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mt-1 text-sm leading-5 text-[#c8d8e1]">{text}</p>
    </div>
  );
}
function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl bg-[#e9f0f3] p-4">
      <p className="eyebrow text-[#315166]">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6">{value}</p>
    </article>
  );
}

function RetentionCurve() {
  return (
    <div className="rounded-2xl border border-white/15 bg-[#051a2a]/80 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-[#8fa8ba]">Mapa de retención · 0–3 s</p>
          <p className="mt-2 text-xs leading-5 text-white/70">
            Lectura de estructura; no representa datos reales.
          </p>
        </div>
        <span className="rounded-full bg-[#315166] px-2 py-1 text-[10px] font-semibold text-white">
          FOCO: 1.er segundo
        </span>
      </div>
      <svg
        viewBox="0 0 360 166"
        className="mt-4 w-full"
        role="img"
        aria-label="Curva conceptual de retención con hitos de apertura"
      >
        <defs>
          <linearGradient id="retentionFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8fa8ba" stopOpacity=".55" />
            <stop offset="1" stopColor="#8fa8ba" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M22 28 C54 30 73 38 102 64 S158 91 193 101 S260 116 338 129 L338 142 L22 142 Z"
          fill="url(#retentionFill)"
        />
        <path
          d="M22 28 C54 30 73 38 102 64 S158 91 193 101 S260 116 338 129"
          fill="none"
          stroke="#d7e8ef"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="22"
          y1="142"
          x2="338"
          y2="142"
          stroke="#ffffff"
          strokeOpacity=".25"
        />
        <line
          x1="102"
          y1="48"
          x2="102"
          y2="142"
          stroke="#8fa8ba"
          strokeDasharray="4 5"
        />
        <line
          x1="193"
          y1="78"
          x2="193"
          y2="142"
          stroke="#8fa8ba"
          strokeDasharray="4 5"
        />
        <circle cx="22" cy="28" r="5" fill="#ffffff" />
        <circle cx="102" cy="64" r="5" fill="#8fa8ba" />
        <circle cx="193" cy="101" r="5" fill="#8fa8ba" />
        <text x="22" y="160" fill="#c8d8e1" fontSize="11">
          0,0 s · escena
        </text>
        <text x="77" y="45" fill="#d7e8ef" fontSize="11">
          0,7 s · Insert-Titulo
        </text>
        <text x="175" y="76" fill="#d7e8ef" fontSize="11">
          1,7 s · prueba
        </text>
        <text x="280" y="160" fill="#c8d8e1" fontSize="11">
          3,0 s · valor
        </text>
      </svg>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
        <div className="rounded-lg bg-white/8 p-2 text-white/80">
          <b className="block text-white">Escena</b>Orientar sin explicación.
        </div>
        <div className="rounded-lg bg-white/8 p-2 text-white/80">
          <b className="block text-white">Insert-Titulo</b>Nombrar el núcleo.
        </div>
        <div className="rounded-lg bg-white/8 p-2 text-white/80">
          <b className="block text-white">Prueba</b>Confirmar la promesa.
        </div>
      </div>
    </div>
  );
}

function DailyDesk(props: any) {
  const {
    clients,
    history,
    currentClientId,
    objective,
    activeRule,
    isAuthenticated,
    onClientSelect,
    onObjectiveSelect,
    onNewClient,
    onStart,
    onHistory,
    onRules,
    onNew,
  } = props;
  const draftCount = history.filter(
    (item: any) => item.record.status === "draft"
  ).length;
  const pendingResults = history.filter((item: any) => !item.result).length;
  const selectedClient = clients.find(
    (client: any) => String(client.id) === currentClientId
  );
  return (
    <section id="hoy" className="scroll-mt-24 pb-9">
      <div className="overflow-hidden rounded-[1.75rem] border-t-4 border-[#8fa8ba] bg-[#051a2a] p-6 text-white surface-shadow sm:p-8">
        <div className="grid gap-7 xl:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="eyebrow text-[#8fa8ba]">00 / Mesa de producción</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-.045em] sm:text-4xl">
              Empieza por la pieza, no por el manual.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
              Elige la cuenta y el objetivo de esta entrega. El Canvas abre el
              flujo de escritura; el manual queda disponible para resolver
              dudas, no para retrasar la primera decisión.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/85">
                  <Building2 className="h-3.5 w-3.5 text-[#8fa8ba]" />
                  Cliente de esta entrega
                </span>
                {/* The button sits inside the field silhouette instead of the
                    column gutter, so the pair occupies the cell like any
                    other field and reads as one control. */}
                <div className="flex">
                  <FieldSelect
                    value={currentClientId}
                    onChange={value =>
                      value === "__new__"
                        ? onNewClient()
                        : onClientSelect(value)
                    }
                    className="min-w-0 flex-1 rounded-r-none border-r-0 bg-white text-[#051a2a]"
                    options={[
                      { value: "", label: "Selecciona una cuenta" },
                      ...clients.map((client: any) => ({
                        value: String(client.id),
                        label: `${client.name} · ${client.sector}`,
                      })),
                      { value: "__new__", label: "＋ Añadir cliente nuevo" },
                    ]}
                  />
                  <button
                    type="button"
                    onClick={onNewClient}
                    aria-label="Añadir cliente"
                    title="Añadir cliente"
                    className="flex h-12 w-11 shrink-0 items-center justify-center rounded-r-[0.9rem] border border-[#e7dde1] bg-white text-[#315166] transition hover:bg-[#eef4f7]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </label>
              <label>
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/85">
                  <Target className="h-3.5 w-3.5 text-[#8fa8ba]" />
                  Objetivo de la pieza
                </span>
                <FieldSelect
                  value={objective}
                  onChange={onObjectiveSelect}
                  className="bg-white text-[#051a2a]"
                  options={[
                    { value: "", label: "Selecciona un objetivo" },
                    ...objectives.map(item => ({ value: item, label: item })),
                  ]}
                />
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={onStart}
                className="rounded-full bg-[#8fa8ba] text-[#051a2a] hover:bg-[#b5cbd5]"
              >
                <PenLine className="mr-2 h-4 w-4" />
                Abrir ficha de producción
              </Button>
              <Button
                onClick={onNew}
                variant="outline"
                className="rounded-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva pieza
              </Button>
            </div>
          </div>
          <div className="grid content-start gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <button
              onClick={onHistory}
              className="rounded-xl border border-white/12 bg-white/7 p-4 text-left transition hover:bg-white/12"
            >
              <p className="eyebrow text-[#8fa8ba]">Pendientes</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {isAuthenticated ? pendingResults : "—"}
              </p>
              <p className="mt-1 text-xs leading-5 text-white/75">
                fichas sin resultado real
              </p>
            </button>
            <button
              onClick={onHistory}
              className="rounded-xl border border-white/12 bg-white/7 p-4 text-left transition hover:bg-white/12"
            >
              <p className="eyebrow text-[#8fa8ba]">Borradores</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {isAuthenticated ? draftCount : "—"}
              </p>
              <p className="mt-1 text-xs leading-5 text-white/75">
                para retomar o revisar
              </p>
            </button>
            <button
              onClick={onRules}
              className="rounded-xl border border-white/12 bg-white/7 p-4 text-left transition hover:bg-white/12"
            >
              <p className="eyebrow text-[#8fa8ba]">Regla activa</p>
              <p className="mt-2 text-sm font-bold leading-5 text-white">
                {selectedClient && activeRule
                  ? activeRule.label
                  : selectedClient
                    ? "Estándar de agencia"
                    : "Elige un cliente"}
              </p>
              <p className="mt-1 text-xs leading-5 text-white/75">
                {selectedClient
                  ? `${selectedClient.name} · ${selectedClient.sector}`
                  : "La regla aparece al seleccionar cuenta."}
              </p>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
export function ObjectiveGuide({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (objective: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const guides = [
    {
      id: "Comunidad",
      plain: "Quiero que la gente se sienta parte de esta marca.",
      result: "Identificación, conversación y cercanía.",
      example:
        "Si también hueles el café antes de abrir la bolsa, esto es para ti.",
    },
    {
      id: "Consideración",
      plain: "Quiero ayudar a alguien a decidir si esto le conviene.",
      result: "Dudas resueltas, opciones comparadas y menos incertidumbre.",
      example:
        "La comparación que hacemos antes de recomendar una silla ergonómica.",
    },
    {
      id: "Acción",
      plain: "Quiero que la persona dé el siguiente paso ahora.",
      result: "Una visita, consulta, compra, descarga o formulario.",
      example: "Así empieza una cocina a medida: primero resolvemos esto.",
    },
  ];
  return (
    <section
      aria-labelledby="guia-objetivos"
      className="mb-9 rounded-[1.5rem] border border-[#dce7eb] bg-white p-5 surface-shadow sm:p-7"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-[#315166]">Guía rápida de objetivo</p>
          <h2
            id="guia-objetivos"
            className="mt-2 text-2xl font-bold tracking-[-.035em] sm:text-3xl"
          >
            Elige por el resultado, no por el formato.
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="max-w-md text-sm leading-6 text-[#526a79]">
            <b>Regla práctica:</b> Comunidad construye relación; Consideración
            facilita una decisión; Acción pide un paso concreto.
          </p>
          <button
            type="button"
            onClick={() => setOpen(current => !current)}
            aria-expanded={open}
            aria-controls="guia-objetivos-contenido"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#d4e0e5] bg-[#f7fbfc] px-4 py-2 text-xs font-semibold text-[#315166] transition hover:bg-[#e9f0f3]"
          >
            {open ? "Ocultar guía" : "Ver guía"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
      <div
        id="guia-objetivos-contenido"
        hidden={!open}
        className="mt-5 grid gap-4 lg:grid-cols-3"
      >
        {guides.map((guide, index) => (
          <button
            key={guide.id}
            onClick={() => onSelect(guide.id)}
            className={`group rounded-xl border p-5 text-left transition ${active === guide.id ? "border-[#315166] bg-[#e9f0f3] ring-2 ring-[#8fa8ba]/40" : "border-[#e3ebee] bg-[#fbfcfc] hover:border-[#8fa8ba] hover:bg-[#f1f7f9]"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#315166] text-xs font-bold text-white">
                0{index + 1}
              </span>
              {active === guide.id && (
                <span className="text-xs font-semibold text-[#315166]">
                  Seleccionado <Check className="inline h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <h3 className="mt-4 text-xl font-bold">{guide.id}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#315166]">
              “{guide.plain}”
            </p>
            <p className="mt-4 text-sm leading-6 text-[#526a79]">
              {guide.result}
            </p>
            <div className="mt-4 border-t border-[#dce7eb] pt-4">
              <p className="eyebrow text-[#617381]">Ejemplo de hook</p>
              <p className="mt-2 text-sm leading-6 text-[#315166]">
                “{guide.example}”
              </p>
            </div>
            <p className="mt-4 text-xs font-semibold text-[#315166]">
              Seleccionar este objetivo{" "}
              <ArrowRight className="inline h-3.5 w-3.5" />
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ClientQuickAdd({
  visible,
  draft,
  setDraft,
  saving,
  onClose,
  onCreate,
}: any) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#051a2a]/55 p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Añadir cliente nuevo"
    >
      <div className="w-full max-w-lg rounded-[1.5rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-[#315166]">Cliente nuevo</p>
            <h2 className="mt-1 text-2xl font-bold">
              Añádelo sin salir de la ficha.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#526a79]">
              Al guardarlo se incorpora a la cartera y queda seleccionado para
              esta producción.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#e9f0f3] text-[#315166]"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" hint="Obligatorio">
            <input
              autoFocus
              value={draft.name}
              onChange={event =>
                setDraft({ ...draft, name: event.target.value })
              }
              className="field"
              placeholder="Nombre del cliente"
            />
          </Field>
          <Field label="Sector" hint="Opcional">
            <input
              value={draft.sector}
              onChange={event =>
                setDraft({ ...draft, sector: event.target.value })
              }
              className="field"
              placeholder="Por definir"
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" className="rounded-full">
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            disabled={saving}
            className="rounded-full bg-[#315166] text-white hover:bg-[#244357]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Añadir y seleccionar
          </Button>
        </div>
      </div>
    </div>
  );
}
function TableBlock({
  title,
  headers,
  rows,
  className = "",
}: {
  title: string;
  headers: string[];
  rows: string[][];
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white surface-shadow ${className}`}
    >
      <div className="border-b border-[#eadfe4] px-5 py-4">
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] text-left text-sm">
          <thead className="bg-[#f7f4f2] text-[11px] uppercase tracking-wider text-[#617381]">
            <tr>
              {headers.map(header => (
                <th key={header} className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row[0]}-${index}`}
                className="border-t border-[#eee6e8] align-top"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-4 py-3 leading-5 ${cellIndex === 0 ? "font-semibold" : "text-[#526a79]"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export function AuditResultPanel({
  result,
  visible,
  rule,
}: {
  result: AuditResult;
  visible: boolean;
  rule?: { maxSpokenWords: number; maxOverlayWords: number; label: string };
}) {
  const expandedLimits = Boolean(
    rule && (rule.maxSpokenWords > 12 || rule.maxOverlayWords > 6)
  );
  if (!visible)
    return (
      <aside className="window-arcs rounded-[1.5rem] border-t-4 border-[#8fa8ba] bg-[#051a2a] p-6 text-white surface-shadow">
        <p className="eyebrow text-[#8fa8ba]">Resultado neutral</p>
        <h3 className="mt-2 text-2xl font-bold">
          Audita cuando tengas una promesa.
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/75">
          El score y el veredicto aparecen solo después de pulsar «Auditar
          hook». Umbral de paso: {PASS_SCORE}.
        </p>
      </aside>
    );
  return (
    <aside className="window-arcs rounded-[1.5rem] border-t-4 border-[#8fa8ba] bg-[#051a2a] p-6 text-white surface-shadow">
      <div className="flex justify-between gap-4">
        <div>
          <p className="eyebrow text-[#8fa8ba]">
            Resultado · umbral {PASS_SCORE}
          </p>
          <h3 className="mt-2 text-2xl font-bold">
            {result.score >= 85
              ? "Listo para grabar"
              : result.score >= PASS_SCORE
                ? "Aprobado · pule avisos"
                : result.score >= 50
                  ? "Reescribir antes de grabar"
                  : "Descartar y empezar de cero"}
          </h3>
        </div>
        <div
          className={`grid h-14 w-14 place-items-center rounded-full border-4 text-xl font-bold ${result.passed ? "border-[#8fa8ba]" : "border-[#e67570]"}`}
        >
          {result.score}
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
        <div
          className={`h-full ${result.passed ? "bg-[#8fa8ba]" : "bg-[#e67570]"}`}
          style={{ width: `${result.score}%` }}
        />
      </div>
      {expandedLimits && (
        <div className="mt-4 rounded-xl border border-[#8fa8ba]/50 bg-[#8fa8ba]/15 p-3 text-xs leading-5 text-[#d7e8ef]">
          <b>Esta cuenta usa un límite ampliado.</b> «{rule?.label}» permite voz
          ≤ {rule?.maxSpokenWords} e Insert-Titulo ≤ {rule?.maxOverlayWords}; el
          estándar de agencia es 12/6.
        </div>
      )}
      <div className="mt-5 space-y-3">
        {result.checks.map((check, index) => (
          <div
            key={`${check.title}-${index}`}
            className={`rounded-xl p-3 ${check.status === "pass" ? "bg-white/8" : check.status === "warn" ? "bg-[#8fa8ba]/20" : "bg-[#602249]/65"}`}
          >
            <div className="flex gap-2">
              <span className="mt-0.5">
                {check.status === "pass"
                  ? "✓"
                  : check.status === "warn"
                    ? "!"
                    : "×"}
              </span>
              <div>
                <p className="text-xs font-semibold">
                  {check.title}
                  {check.hard ? " · fallo duro" : ""}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/75">
                  {check.detail}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
function Cemetery({
  title,
  items,
  dark = false,
}: {
  title: string;
  items: [string, string][];
  dark?: boolean;
}) {
  return (
    <article
      className={`rounded-[1.5rem] p-6 surface-shadow ${dark ? "bg-[#321327] text-white" : "bg-white"}`}
    >
      <p className={`eyebrow ${dark ? "text-[#8fa8ba]" : "text-[#617381]"}`}>
        {dark ? "No admite excepción" : "Justificación escrita"}
      </p>
      <h3 className="mt-2 text-xl font-bold">{title}</h3>
      <div className="mt-5 space-y-4">
        {items.map(([bad, fix]) => (
          <div
            key={bad}
            className={`border-t pt-4 ${dark ? "border-white/15" : "border-[#eadfe4]"}`}
          >
            <p className="font-semibold">«{bad}»</p>
            <p
              className={`mt-1 text-sm leading-6 ${dark ? "text-white/75" : "text-[#617381]"}`}
            >
              {fix}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
function Source({
  reliability,
  title,
  text,
}: {
  reliability: string;
  title: string;
  text: string;
}) {
  return (
    <article className="grid gap-3 rounded-xl bg-white p-4 surface-shadow sm:grid-cols-[110px_1fr]">
      <span
        className={`h-fit rounded-full px-3 py-1 text-center text-[11px] font-semibold ${reliability === "Directa" ? "bg-[#eaf3e8] text-[#35603c]" : reliability === "Académica" ? "bg-[#e9f0f3] text-[#315166]" : "bg-[#f1f5f6] text-[#315166]"}`}
      >
        {reliability}
      </span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#617381]">{text}</p>
      </div>
    </article>
  );
}
function HistorySection(props: any) {
  const {
    clients,
    data,
    loading,
    search,
    setSearch,
    clientFilter,
    setClientFilter,
    statusFilter,
    setStatusFilter,
    showCreator,
    setShowCreator,
    clientDraft,
    setClientDraft,
    createClient,
    creating,
    selectedRecord,
    setSelectedRecord,
    resultForm,
    setResultForm,
    saveResult,
    saving,
    isAuthenticated,
    onLogin,
  } = props;
  return (
    <section id="historial" className="scroll-mt-24 pt-14">
      <SectionHeading
        code="09 / Historial"
        title="La evidencia también se guarda"
        body="Busca, filtra y registra resultados reales para convertir una ficha en criterio de cuenta."
      />
      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="overflow-hidden rounded-[1.5rem] bg-white surface-shadow">
          <div className="border-b border-[#eadfe4] p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71818c]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="field pl-10"
                  placeholder="Buscar hook, Insert-Titulo, cliente o sector…"
                />
              </div>
              <Button
                onClick={() => setShowCreator(!showCreator)}
                className="h-12 shrink-0 rounded-full bg-[#315166] px-5 text-white hover:bg-[#244357]"
              >
                <Plus className="mr-1 h-4 w-4" />
                Cliente
              </Button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <FieldSelect
                value={clientFilter}
                onChange={setClientFilter}
                options={[
                  { value: "all", label: "Todos los clientes" },
                  ...clients.map((client: any) => ({
                    value: String(client.id),
                    label: client.name,
                  })),
                ]}
              />
              <FieldSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "Todos los estados" },
                  { value: "draft", label: "Borrador" },
                  { value: "published", label: "Publicado" },
                  { value: "analyzed", label: "Analizado" },
                ]}
              />
            </div>
            {showCreator && (
              <div className="mt-3 grid gap-3 rounded-xl bg-[#f1f5f6] p-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  className="field"
                  value={clientDraft.name}
                  onChange={e =>
                    setClientDraft({ ...clientDraft, name: e.target.value })
                  }
                  placeholder="Nombre del cliente"
                />
                <input
                  className="field"
                  value={clientDraft.sector}
                  onChange={e =>
                    setClientDraft({ ...clientDraft, sector: e.target.value })
                  }
                  placeholder="Sector (opcional)"
                />
                <Button
                  disabled={creating}
                  onClick={createClient}
                  className="rounded-xl bg-[#051a2a] text-white"
                >
                  Guardar
                </Button>
              </div>
            )}
          </div>
          <div className="divide-y divide-[#eee6e8]">
            {!isAuthenticated ? (
              <EmptyState
                title="Inicia sesión para construir el historial."
                body="Tus fichas, clientes y resultados quedarán asociados a tu usuario."
                action="Iniciar sesión"
                onAction={onLogin}
              />
            ) : loading ? (
              <div className="p-7 text-sm text-[#637481]">
                Cargando historial…
              </div>
            ) : data.length === 0 ? (
              <EmptyState
                title="Aún no hay fichas guardadas."
                body="Guarda una ficha desde el Canvas para verla aquí y registrar el resultado real."
              />
            ) : (
              data.map((item: any) => (
                <article
                  key={item.record.id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row"
                >
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#e9f0f3] px-2 py-1 text-[11px] font-semibold text-[#315166]">
                        {item.client.name}
                      </span>
                      <span className="text-[11px] text-[#71818c]">
                        {item.record.platform}
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">
                      {item.record.spoken}
                    </h3>
                    <p className="mt-1 text-xs text-[#637481]">
                      Score {item.record.auditScore} ·{" "}
                      {item.record.primaryMetric}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#e9f0f3] p-3 text-[#315166]">
                    <p className="text-xs font-semibold">
                      {item.result
                        ? `${item.result.impressions.toLocaleString("es-ES")} impresiones`
                        : "Sin resultado"}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedRecord(item.record.id);
                        setResultForm({
                          impressions: String(item.result?.impressions ?? ""),
                          threeSecondViews: String(
                            item.result?.threeSecondViews ?? ""
                          ),
                          saves: String(item.result?.saves ?? ""),
                          shares: String(item.result?.shares ?? ""),
                          clicks: String(item.result?.clicks ?? ""),
                          conversions: String(item.result?.conversions ?? ""),
                          learning: item.result?.learning ?? "",
                        });
                      }}
                      className="mt-2 text-xs font-semibold text-[#315166]"
                    >
                      {item.result ? "Actualizar" : "Registrar"}{" "}
                      <ChevronRight className="inline h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
        <aside className="rounded-[1.5rem] border-t-4 border-[#8fa8ba] bg-[#051a2a] p-6 text-white surface-shadow">
          <p className="eyebrow text-[#8fa8ba]">Resultados reales</p>
          <h3 className="mt-2 text-xl font-bold">
            {selectedRecord ? "Registra lo que pasó" : "Selecciona una ficha"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/75">
            La lectura orgánica es direccional; no conviertas pequeñas
            diferencias en certezas.
          </p>
          {selectedRecord && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <NumberField
                label="Impresiones"
                value={resultForm.impressions}
                onChange={(value: string) =>
                  setResultForm({ ...resultForm, impressions: value })
                }
              />
              <NumberField
                label="Vistas 3 s"
                value={resultForm.threeSecondViews}
                onChange={(value: string) =>
                  setResultForm({ ...resultForm, threeSecondViews: value })
                }
              />
              <NumberField
                label="Guardados"
                value={resultForm.saves}
                onChange={(value: string) =>
                  setResultForm({ ...resultForm, saves: value })
                }
              />
              <NumberField
                label="Compartidos"
                value={resultForm.shares}
                onChange={(value: string) =>
                  setResultForm({ ...resultForm, shares: value })
                }
              />
              <NumberField
                label="Clics"
                value={resultForm.clicks}
                onChange={(value: string) =>
                  setResultForm({ ...resultForm, clicks: value })
                }
              />
              <NumberField
                label="Conversiones"
                value={resultForm.conversions}
                onChange={(value: string) =>
                  setResultForm({ ...resultForm, conversions: value })
                }
              />
              <textarea
                value={resultForm.learning}
                onChange={e =>
                  setResultForm({ ...resultForm, learning: e.target.value })
                }
                className="field col-span-2 min-h-24 bg-white/8 text-white"
                placeholder="Aprendizaje de la pieza"
              />
              <Button
                onClick={saveResult}
                disabled={saving}
                className="col-span-2 rounded-xl bg-[#315166] text-white"
              >
                Guardar resultados
              </Button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
export function RulesSection(props: any) {
  const {
    clients,
    rules,
    draft,
    setDraft,
    saving,
    isAuthenticated,
    onLogin,
    createRule,
  } = props;
  const hasExtendedLimits = (rule: {
    maxSpokenWords: number;
    maxOverlayWords: number;
  }) => rule.maxSpokenWords > 12 || rule.maxOverlayWords > 6;
  const draftExtended =
    Number(draft.maxSpokenWords) > 12 || Number(draft.maxOverlayWords) > 6;
  return (
    <section id="reglas" className="scroll-mt-24 pt-14">
      <SectionHeading
        code="10 / Reglas"
        title="El estándar puede hablar el idioma de cada marca"
        body="Configura límites, preámbulos, fórmulas gastadas y términos de tensión por cliente o sector. El estándar de agencia es voz ≤ 12 e Insert-Titulo ≤ 6."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[.75fr_1.25fr]">
        <div className="rounded-[1.5rem] bg-[#321327] p-6 text-white surface-shadow">
          <p className="eyebrow text-[#8fa8ba]">Reglas activas</p>
          <div className="mt-4 space-y-3">
            {rules.length ? (
              rules.map((rule: any) => (
                <div key={rule.id} className="rounded-xl bg-white/8 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold">{rule.label}</p>
                    {hasExtendedLimits(rule) && (
                      <span className="rounded-full bg-[#8fa8ba] px-2 py-1 text-[10px] font-bold text-[#051a2a]">
                        Límite ampliado
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-white/75">
                    Voz ≤ {rule.maxSpokenWords} · Insert-Titulo ≤{" "}
                    {rule.maxOverlayWords} ·{" "}
                    {rule.requireProof ? "Prueba requerida" : "Prueba opcional"}
                  </p>
                  {hasExtendedLimits(rule) && (
                    <p className="mt-2 text-[11px] leading-5 text-[#d7e8ef]">
                      Supera el estándar 12/6. El auditor respeta la regla, pero
                      la desviación queda visible.
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-white/75">
                Aún no hay reglas. La auditoría usa el estándar general de la
                agencia.
              </p>
            )}
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-white p-6 surface-shadow">
          {!isAuthenticated ? (
            <EmptyState
              title="Inicia sesión para configurar reglas."
              body="Cada regla se guarda por usuario y puede aplicarse a una marca o sector."
              action="Iniciar sesión"
              onAction={onLogin}
            />
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Nombre de la regla"
                  hint="Ej.: Estándar hospitality"
                >
                  <input
                    value={draft.label}
                    onChange={e =>
                      setDraft({ ...draft, label: e.target.value })
                    }
                    className="field"
                  />
                </Field>
                <Field
                  label="Cliente (opcional)"
                  hint="Tiene prioridad sobre sector."
                >
                  <FieldSelect
                    value={draft.clientId}
                    onChange={value => setDraft({ ...draft, clientId: value })}
                    options={[
                      { value: "", label: "Aplicar por sector" },
                      ...clients.map((client: any) => ({
                        value: String(client.id),
                        label: client.name,
                      })),
                    ]}
                  />
                </Field>
                <Field
                  label="Sector (opcional)"
                  hint="Si no hay regla de cliente."
                >
                  <input
                    value={draft.sector}
                    onChange={e =>
                      setDraft({ ...draft, sector: e.target.value })
                    }
                    className="field"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Voz" hint="Máximo">
                    <input
                      type="number"
                      min="3"
                      max="30"
                      value={draft.maxSpokenWords}
                      onChange={e =>
                        setDraft({ ...draft, maxSpokenWords: e.target.value })
                      }
                      className="field"
                    />
                  </Field>
                  <Field label="Insert-Titulo" hint="Máximo">
                    <input
                      type="number"
                      min="2"
                      max="16"
                      value={draft.maxOverlayWords}
                      onChange={e =>
                        setDraft({ ...draft, maxOverlayWords: e.target.value })
                      }
                      className="field"
                    />
                  </Field>
                </div>
              </div>
              {draftExtended && (
                <div className="mt-4 rounded-xl border border-[#8fa8ba] bg-[#eef7fa] p-4 text-sm leading-6 text-[#315166]">
                  <b>Esta cuenta usa un límite ampliado.</b> La agencia trabaja
                  por defecto con voz ≤ 12 e Insert-Titulo ≤ 6. La regla se
                  respetará, pero quedará identificada en la revisión.
                </div>
              )}
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label="Preámbulos a detectar" hint="Separados por coma">
                  <textarea
                    value={draft.preambles}
                    onChange={e =>
                      setDraft({ ...draft, preambles: e.target.value })
                    }
                    className="field min-h-24"
                  />
                </Field>
                <Field label="Fórmulas gastadas" hint="Separadas por coma">
                  <textarea
                    value={draft.tiredPhrases}
                    onChange={e =>
                      setDraft({ ...draft, tiredPhrases: e.target.value })
                    }
                    className="field min-h-24"
                  />
                </Field>
                <Field label="Términos de tensión" hint="Separados por coma">
                  <textarea
                    value={draft.tensionTerms}
                    onChange={e =>
                      setDraft({ ...draft, tensionTerms: e.target.value })
                    }
                    className="field min-h-24"
                  />
                </Field>
                <label className="flex h-fit cursor-pointer items-start gap-3 self-start rounded-xl border border-[#d5e3e9] bg-[#e9f0f3] px-4 py-3.5 text-[#315166] transition hover:border-[#8fa8ba]">
                  <input
                    type="checkbox"
                    checked={draft.requireProof}
                    onChange={e =>
                      setDraft({ ...draft, requireProof: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#315166]"
                  />
                  <span>
                    <span className="block text-xs font-semibold">
                      Exigir prueba visible
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-[#5d7686]">
                      La auditoría marcará la pieza si el hook promete algo que
                      no se demuestra en pantalla.
                    </span>
                  </span>
                </label>
              </div>
              <Button
                onClick={createRule}
                disabled={saving}
                className="mt-6 rounded-full bg-[#315166] text-white"
              >
                Guardar regla
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-[11px] text-white/70">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="field bg-white/8 text-white"
      />
    </label>
  );
}
function EmptyState({
  title,
  body,
  action,
  onAction,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <h3 className="font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#637481]">
        {body}
      </p>
      {action && (
        <Button
          onClick={onAction}
          className="mt-4 rounded-full bg-[#315166] text-white"
        >
          {action}
        </Button>
      )}
    </div>
  );
}
function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character
  );
}
function highlightVariables(value: string) {
  const parts = value.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("[") ? (
          <span
            key={index}
            className="rounded bg-[#e9f0f3] px-1 text-[#315166]"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
