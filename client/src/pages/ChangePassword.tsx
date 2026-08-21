import { useAuth } from "@/_core/hooks/useAuth";
import { BrandLockup } from "@/components/BrandLockup";
import { trpc } from "@/lib/trpc";
import { describeError } from "@/lib/errors";
import { useState } from "react";
import { useLocation } from "wouter";

const MIN_LENGTH = 10;

export default function ChangePassword() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeated, setRepeated] = useState("");
  const [error, setError] = useState("");

  const change = trpc.auth.changePassword.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/");
    },
    onError: caught => {
      setError(describeError(caught, "No se pudo cambiar la contraseña."));
    },
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (newPassword.length < MIN_LENGTH) {
      setError(`La contraseña nueva necesita al menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== repeated) {
      setError("La repetición no coincide con la contraseña nueva.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("La contraseña nueva debe ser distinta de la actual.");
      return;
    }
    change.mutate({ currentPassword, newPassword });
  };

  if (loading) return null;

  const forced = Boolean(user?.mustChangePassword);

  return (
    <main className="flex min-h-screen flex-col justify-center bg-[#321327] px-5 py-12 text-[#051a2a]">
      <div className="mx-auto w-full max-w-[26rem]">
        <div className="mb-8 flex justify-center">
          <BrandLockup />
        </div>

        <form
          onSubmit={submit}
          className="rounded-[1.4rem] bg-white p-7 shadow-[0_24px_60px_rgba(5,26,42,0.35)]"
          noValidate
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#602249] uppercase">
            {forced ? "Primer acceso" : "Seguridad"}
          </p>
          <h1 className="mt-2 mb-1 text-2xl leading-tight font-extrabold">
            {forced ? "Elige tu contraseña." : "Cambia tu contraseña."}
          </h1>
          <p className="mb-6 text-sm text-[#637481]">
            {forced
              ? "La que te dieron es temporal. Sustitúyela antes de empezar a trabajar."
              : `Mínimo ${MIN_LENGTH} caracteres. Usa una que no reutilices en otros sitios.`}
          </p>

          {/* Password managers need a username field to associate the entry. */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={user?.email ?? ""}
            readOnly
            hidden
            aria-hidden="true"
            tabIndex={-1}
          />

          <label className="mb-4 block">
            <span className="mb-2 block text-xs font-semibold">
              {forced ? "Contraseña temporal" : "Contraseña actual"}
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={event => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
              autoFocus
              className="w-full rounded-xl border border-[#dfd7dc] bg-[#faf8f9] px-3 py-2.5 text-sm outline-none focus:border-[#602249] focus:ring-2 focus:ring-[#602249]/25"
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-2 block text-xs font-semibold">Contraseña nueva</span>
            <input
              type="password"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={MIN_LENGTH}
              className="w-full rounded-xl border border-[#dfd7dc] bg-[#faf8f9] px-3 py-2.5 text-sm outline-none focus:border-[#602249] focus:ring-2 focus:ring-[#602249]/25"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-xs font-semibold">Repite la nueva</span>
            <input
              type="password"
              value={repeated}
              onChange={event => setRepeated(event.target.value)}
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-[#dfd7dc] bg-[#faf8f9] px-3 py-2.5 text-sm outline-none focus:border-[#602249] focus:ring-2 focus:ring-[#602249]/25"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-[#e2b6b6] bg-[#fbeeee] px-3 py-2.5 text-sm text-[#8d2f30]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={change.isPending}
            className="w-full rounded-full bg-[#602249] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4d1b3b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {change.isPending ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}
