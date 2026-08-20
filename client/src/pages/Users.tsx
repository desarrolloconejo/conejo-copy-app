import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { ArrowLeft, KeyRound, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type Handover = { email: string; password: string };

const formatDate = (value: Date | string | null) =>
  value ? new Date(value).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function Users() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [draft, setDraft] = useState({ email: "", name: "", role: "user" as "user" | "admin" });
  const [handover, setHandover] = useState<Handover | null>(null);

  const usersQuery = trpc.users.list.useQuery(undefined, { retry: false });

  const showError = (caught: unknown) =>
    toast.error(caught instanceof TRPCClientError ? caught.message : "No se pudo completar la acción.");

  const createUser = trpc.users.create.useMutation({
    onSuccess: async result => {
      setHandover({ email: result.user?.email ?? draft.email, password: result.temporaryPassword });
      setDraft({ email: "", name: "", role: "user" });
      await utils.users.list.invalidate();
    },
    onError: showError,
  });

  const setActive = trpc.users.setActive.useMutation({
    onSuccess: async () => {
      await utils.users.list.invalidate();
    },
    onError: showError,
  });

  const resetPassword = trpc.users.resetPassword.useMutation({
    onSuccess: async (result, variables) => {
      const target = usersQuery.data?.find(item => item.id === variables.id);
      setHandover({ email: target?.email ?? "", password: result.temporaryPassword });
      await utils.users.list.invalidate();
    },
    onError: showError,
  });

  if (loading) return null;

  if (user && user.role !== "admin") {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="mb-2 text-2xl font-extrabold">Esta zona es de administración.</h1>
        <p className="mb-6 text-sm text-[#637481]">
          Tu cuenta no gestiona usuarios. Si necesitas dar de alta a alguien, pídeselo a un administrador.
        </p>
        <Link href="/" className="text-sm font-semibold text-[#602249] underline">
          Volver a la mesa
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#637481] hover:text-[#602249]"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a la mesa
      </Link>

      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#602249] uppercase">
        Administración
      </p>
      <h1 className="mt-2 mb-1 text-3xl leading-tight font-extrabold">Cuentas del equipo.</h1>
      <p className="mb-8 max-w-[52ch] text-sm text-[#637481]">
        No hay registro abierto: cada cuenta se crea aquí. La contraseña temporal se muestra una sola
        vez, así que cópiala antes de cerrar el aviso.
      </p>

      {handover && (
        <div className="mb-8 rounded-2xl border border-[#c9b7a0] bg-[#fdf6e6] p-5">
          <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-[#8a6d1f] uppercase">
            Entrega esta contraseña en persona
          </p>
          <p className="mb-3 text-sm text-[#5c4a1c]">
            Cuenta <strong>{handover.email}</strong>. Se pedirá cambiarla en el primer acceso.
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
                  .catch(() => toast.error("Copia manualmente: el navegador bloqueó el portapapeles"));
              }}
              className="rounded-full bg-[#602249] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4d1b3b]"
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

      <form
        onSubmit={event => {
          event.preventDefault();
          createUser.mutate({ email: draft.email.trim(), name: draft.name.trim(), role: draft.role });
        }}
        className="mb-10 rounded-2xl border border-[#e6dfe3] bg-white p-5"
      >
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <UserPlus className="h-4 w-4 text-[#602249]" /> Nueva cuenta
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold">Email</span>
            <input
              type="email"
              required
              value={draft.email}
              onChange={event => setDraft({ ...draft, email: event.target.value })}
              className="w-full rounded-xl border border-[#dfd7dc] bg-[#faf8f9] px-3 py-2.5 text-sm outline-none focus:border-[#602249]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold">Nombre</span>
            <input
              required
              minLength={2}
              value={draft.name}
              onChange={event => setDraft({ ...draft, name: event.target.value })}
              className="w-full rounded-xl border border-[#dfd7dc] bg-[#faf8f9] px-3 py-2.5 text-sm outline-none focus:border-[#602249]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold">Rol</span>
            <select
              value={draft.role}
              onChange={event => setDraft({ ...draft, role: event.target.value as "user" | "admin" })}
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
          className="mt-4 rounded-full bg-[#602249] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4d1b3b] disabled:opacity-60"
        >
          {createUser.isPending ? "Creando…" : "Crear cuenta"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] text-sm">
          <thead>
            <tr className="border-b border-[#d8ccd3] text-left text-[11px] tracking-[0.11em] text-[#637481] uppercase">
              <th className="py-2 pr-4 font-medium">Cuenta</th>
              <th className="py-2 pr-4 font-medium">Rol</th>
              <th className="py-2 pr-4 font-medium">Estado</th>
              <th className="py-2 pr-4 font-medium">Último acceso</th>
              <th className="py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(usersQuery.data ?? []).map(item => (
              <tr key={item.id} className="border-b border-[#ece5e9]">
                <td className="py-3 pr-4">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-[#637481]">{item.email}</div>
                </td>
                <td className="py-3 pr-4">{item.role === "admin" ? "Administración" : "Redacción"}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.isActive ? "bg-[#e4f1ea] text-[#2c6b4c]" : "bg-[#f2e7e7] text-[#8d2f30]"
                    }`}
                  >
                    {item.isActive ? "Activa" : "Desactivada"}
                  </span>
                  {item.mustChangePassword && (
                    <span className="ml-2 text-xs text-[#8a6d1f]">contraseña temporal</span>
                  )}
                </td>
                <td className="py-3 pr-4 tabular-nums">{formatDate(item.lastSignedIn)}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => resetPassword.mutate({ id: item.id })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7dc] px-3 py-1.5 text-xs font-semibold hover:border-[#602249] hover:text-[#602249]"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Nueva contraseña
                    </button>
                    {item.id !== user?.id && (
                      <button
                        onClick={() => setActive.mutate({ id: item.id, isActive: !item.isActive })}
                        className="rounded-full border border-[#dfd7dc] px-3 py-1.5 text-xs font-semibold hover:border-[#602249] hover:text-[#602249]"
                      >
                        {item.isActive ? "Desactivar" : "Reactivar"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usersQuery.data?.length === 0 && (
          <p className="py-6 text-sm text-[#637481]">Todavía no hay cuentas.</p>
        )}
      </div>
    </main>
  );
}
