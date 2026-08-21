import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { describeError } from "@/lib/errors";
import { ArrowLeft, KeyRound, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type Handover = { email: string; password: string; reason: "alta" | "reset" };

const formatDate = (value: Date | string | null) =>
  value
    ? new Date(value).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Nunca";

const ROLE_LABEL = { admin: "Administración", user: "Redacción" } as const;

export default function Users() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [draft, setDraft] = useState({
    email: "",
    name: "",
    role: "user" as "user" | "admin",
  });
  const [handover, setHandover] = useState<Handover | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const usersQuery = trpc.users.list.useQuery(undefined, { retry: false });

  const showError = (caught: unknown) =>
    toast.error(describeError(caught, "No se pudo completar la acción."));

  const refresh = () => utils.users.list.invalidate();

  const createUser = trpc.users.create.useMutation({
    onSuccess: async result => {
      setHandover({
        email: result.user?.email ?? draft.email,
        password: result.temporaryPassword,
        reason: "alta",
      });
      setDraft({ email: "", name: "", role: "user" });
      setShowForm(false);
      await refresh();
    },
    onError: showError,
  });

  const setActive = trpc.users.setActive.useMutation({
    onSuccess: async updated => {
      toast.success(
        updated?.isActive ? "Cuenta reactivada" : "Cuenta desactivada"
      );
      await refresh();
    },
    onError: showError,
  });

  const setRole = trpc.users.setRole.useMutation({
    onSuccess: async updated => {
      toast.success(
        updated
          ? `${updated.name} pasa a ${ROLE_LABEL[updated.role].toLowerCase()}`
          : "Rol cambiado"
      );
      await refresh();
    },
    onError: showError,
  });

  const resetPassword = trpc.users.resetPassword.useMutation({
    onSuccess: async (result, variables) => {
      const target = usersQuery.data?.find(item => item.id === variables.id);
      setHandover({
        email: target?.email ?? "",
        password: result.temporaryPassword,
        reason: "reset",
      });
      await refresh();
    },
    onError: showError,
  });

  const all = usersQuery.data ?? [];

  const stats = useMemo(
    () => ({
      total: all.length,
      activas: all.filter(item => item.isActive).length,
      admins: all.filter(item => item.role === "admin" && item.isActive).length,
      pendientes: all.filter(item => item.mustChangePassword).length,
    }),
    [all]
  );

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(item =>
      `${item.name} ${item.email}`.toLowerCase().includes(needle)
    );
  }, [all, search]);

  if (loading) return null;

  if (user && user.role !== "admin") {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="mb-2 text-2xl font-extrabold">
          Esta zona es de administración.
        </h1>
        <p className="mb-6 text-sm text-[#637481]">
          Tu cuenta no gestiona usuarios. Si necesitas dar de alta a alguien,
          pídeselo a un administrador.
        </p>
        <Link
          href="/"
          className="text-sm font-semibold text-[#602249] underline"
        >
          Volver a la mesa
        </Link>
      </main>
    );
  }

  const busy =
    setActive.isPending || setRole.isPending || resetPassword.isPending;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#637481] transition hover:text-[#602249]"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a la mesa
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#602249] uppercase">
            Administración
          </p>
          <h1 className="mt-2 mb-1 text-3xl leading-tight font-extrabold">
            Cuentas del equipo.
          </h1>
          <p className="max-w-[52ch] text-sm text-[#637481]">
            No hay registro abierto: cada cuenta se crea aquí. La contraseña
            temporal se muestra una sola vez.
          </p>
        </div>
        <button
          onClick={() => setShowForm(current => !current)}
          className="inline-flex items-center gap-2 rounded-full bg-[#602249] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4d1b3b]"
        >
          <UserPlus className="h-4 w-4" />
          {showForm ? "Cerrar" : "Nueva cuenta"}
        </button>
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#e6dfe3] bg-[#e6dfe3] sm:grid-cols-4">
        {[
          ["Cuentas", stats.total, ""],
          ["Activas", stats.activas, ""],
          ["Administración", stats.admins, ""],
          ["Sin estrenar", stats.pendientes, "con contraseña temporal"],
        ].map(([label, value, hint]) => (
          <div key={label as string} className="bg-white px-4 py-3">
            <dt className="text-[10px] font-semibold tracking-[0.13em] text-[#637481] uppercase">
              {label as string}
            </dt>
            <dd className="text-2xl font-extrabold tabular-nums">
              {value as number}
            </dd>
            {hint && (
              <dd className="text-[11px] text-[#637481]">{hint as string}</dd>
            )}
          </div>
        ))}
      </dl>

      {handover && (
        <div className="mb-8 rounded-2xl border border-[#c9b7a0] bg-[#fdf6e6] p-5">
          <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-[#8a6d1f] uppercase">
            {handover.reason === "alta"
              ? "Cuenta creada"
              : "Contraseña restablecida"}
          </p>
          <p className="mb-3 text-sm text-[#5c4a1c]">
            Entrega esta contraseña a <strong>{handover.email}</strong> por un
            canal seguro. No volverá a mostrarse, y se pedirá cambiarla en el
            primer acceso.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <code className="rounded-lg bg-white px-3 py-2 font-mono text-sm break-all">
              {handover.password}
            </code>
            <button
              onClick={() => {
                navigator.clipboard
                  ?.writeText(handover.password)
                  .then(() => toast.success("Contraseña copiada"))
                  .catch(() =>
                    toast.error(
                      "Cópiala a mano: el navegador bloqueó el portapapeles"
                    )
                  );
              }}
              className="rounded-full bg-[#602249] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#4d1b3b]"
            >
              Copiar
            </button>
            <button
              onClick={() => setHandover(null)}
              className="rounded-full border border-[#c9b7a0] px-4 py-2 text-xs font-semibold text-[#5c4a1c]"
            >
              Ya la guardé
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={event => {
            event.preventDefault();
            const email = draft.email.trim();
            const name = draft.name.trim();
            // Answered here so an incomplete form does not need a round trip.
            if (!email || !name) {
              toast.error("Rellena el email y el nombre.");
              return;
            }
            if (name.length < 2) {
              toast.error("El nombre necesita al menos 2 caracteres.");
              return;
            }
            createUser.mutate({ email, name, role: draft.role });
          }}
          className="mb-8 rounded-2xl border border-[#e6dfe3] bg-white p-5"
        >
          <h2 className="mb-4 text-sm font-bold">Nueva cuenta</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">Email</span>
              <input
                type="email"
                required
                autoFocus
                value={draft.email}
                onChange={event =>
                  setDraft({ ...draft, email: event.target.value })
                }
                className="w-full rounded-xl border border-[#dfd7dc] bg-[#faf8f9] px-3 py-2.5 text-sm outline-none focus:border-[#602249]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">Nombre</span>
              <input
                required
                minLength={2}
                value={draft.name}
                onChange={event =>
                  setDraft({ ...draft, name: event.target.value })
                }
                className="w-full rounded-xl border border-[#dfd7dc] bg-[#faf8f9] px-3 py-2.5 text-sm outline-none focus:border-[#602249]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">Rol</span>
              <select
                value={draft.role}
                onChange={event =>
                  setDraft({
                    ...draft,
                    role: event.target.value as "user" | "admin",
                  })
                }
                className="w-full rounded-xl border border-[#dfd7dc] bg-[#faf8f9] px-3 py-2.5 text-sm outline-none focus:border-[#602249]"
              >
                <option value="user">Redacción</option>
                <option value="admin">Administración</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={createUser.isPending}
            className="mt-4 rounded-full bg-[#602249] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4d1b3b] disabled:opacity-60"
          >
            {createUser.isPending ? "Creando…" : "Crear cuenta"}
          </button>
        </form>
      )}

      <label className="mb-4 flex items-center gap-2 rounded-xl border border-[#e6dfe3] bg-white px-3 py-2 focus-within:border-[#602249]">
        <Search className="h-4 w-4 shrink-0 text-[#637481]" />
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Buscar por nombre o email"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-sm">
          <thead>
            <tr className="border-b border-[#d8ccd3] text-left text-[11px] tracking-[0.11em] text-[#637481] uppercase">
              <th className="py-2 pr-4 font-medium">Cuenta</th>
              <th className="py-2 pr-4 font-medium">Rol</th>
              <th className="py-2 pr-4 font-medium">Estado</th>
              <th className="py-2 pr-4 font-medium">Alta</th>
              <th className="py-2 pr-4 font-medium">Último acceso</th>
              <th className="py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(item => {
              const isSelf = item.id === user?.id;
              return (
                <tr
                  key={item.id}
                  className={`border-b border-[#ece5e9] ${item.isActive ? "" : "opacity-60"}`}
                >
                  <td className="py-3 pr-4">
                    <div className="font-semibold">
                      {item.name}
                      {isSelf && (
                        <span className="ml-2 text-[11px] font-medium text-[#637481]">
                          (tú)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#637481]">{item.email}</div>
                  </td>
                  <td className="py-3 pr-4">
                    {isSelf ? (
                      <span className="text-[#637481]">
                        {ROLE_LABEL[item.role]}
                      </span>
                    ) : (
                      <select
                        value={item.role}
                        disabled={busy}
                        onChange={event =>
                          setRole.mutate({
                            id: item.id,
                            role: event.target.value as "user" | "admin",
                          })
                        }
                        className="rounded-lg border border-[#dfd7dc] bg-white px-2 py-1 text-xs outline-none focus:border-[#602249] disabled:opacity-50"
                      >
                        <option value="user">Redacción</option>
                        <option value="admin">Administración</option>
                      </select>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.isActive
                          ? "bg-[#e4f1ea] text-[#2c6b4c]"
                          : "bg-[#f2e7e7] text-[#8d2f30]"
                      }`}
                    >
                      {item.isActive ? "Activa" : "Desactivada"}
                    </span>
                    {item.mustChangePassword && (
                      <div className="mt-1 text-[11px] text-[#8a6d1f]">
                        Contraseña temporal
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs tabular-nums text-[#637481]">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="py-3 pr-4 text-xs tabular-nums text-[#637481]">
                    {formatDate(item.lastSignedIn)}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={busy}
                        onClick={() => resetPassword.mutate({ id: item.id })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7dc] px-3 py-1.5 text-xs font-semibold transition hover:border-[#602249] hover:text-[#602249] disabled:opacity-50"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Nueva contraseña
                      </button>
                      {!isSelf && (
                        <button
                          disabled={busy}
                          onClick={() => {
                            if (
                              item.isActive &&
                              !window.confirm(
                                `¿Desactivar a ${item.name}? Perderá el acceso de inmediato, pero su trabajo se conserva.`
                              )
                            ) {
                              return;
                            }
                            setActive.mutate({
                              id: item.id,
                              isActive: !item.isActive,
                            });
                          }}
                          className="rounded-full border border-[#dfd7dc] px-3 py-1.5 text-xs font-semibold transition hover:border-[#602249] hover:text-[#602249] disabled:opacity-50"
                        >
                          {item.isActive ? "Desactivar" : "Reactivar"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {usersQuery.isLoading && (
          <p className="py-6 text-sm text-[#637481]">Cargando cuentas…</p>
        )}
        {!usersQuery.isLoading && visible.length === 0 && (
          <p className="py-6 text-sm text-[#637481]">
            {search
              ? `Ninguna cuenta coincide con «${search}».`
              : "Todavía no hay cuentas."}
          </p>
        )}
      </div>

      <p className="mt-8 max-w-[62ch] text-xs leading-5 text-[#637481]">
        Desactivar conserva los clientes, fichas y resultados de esa persona;
        borrar la cuenta los arrastraría en cascada, por eso no existe esa
        opción aquí. Siempre debe quedar al menos una cuenta de administración
        activa.
      </p>
    </main>
  );
}
