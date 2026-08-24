import { trpc } from "@/lib/trpc";
import { describeError } from "@/lib/errors";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BrandLockup } from "@/components/BrandLockup";

export default function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: async user => {
      await utils.auth.me.invalidate();
      navigate(user.mustChangePassword ? "/cambiar-contrasena" : "/");
    },
    onError: caught => {
      setError(describeError(caught, "No se pudo iniciar sesión. Inténtalo de nuevo."));
    },
  });

  // Someone who already has a session has no business on this screen.
  useEffect(() => {
    if (meQuery.data) navigate("/", { replace: true });
  }, [meQuery.data, navigate]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    // Caught here so an empty form answers instantly instead of making a round
    // trip only to come back with the same thing.
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Escribe tu email.");
      return;
    }
    if (!password) {
      setError("Escribe tu contraseña.");
      return;
    }

    login.mutate({ email: trimmed, password });
  };

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
            Acceso al estudio
          </p>
          <h1 className="mt-2 mb-1 text-2xl leading-tight font-extrabold">
            Entra a tu mesa de producción.
          </h1>
          <p className="mb-6 text-sm text-[#637481]">
            Las cuentas las crea un administrador. Si no tienes uno, pídelo al equipo.
          </p>

          <label className="mb-4 block">
            <span className="mb-2 block text-xs font-semibold">Email</span>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="username"
              required
              autoFocus
              className="w-full rounded-xl border border-[#dfd7dc] bg-[#faf8f9] px-3 py-2.5 text-sm outline-none focus:border-[#602249] focus:ring-2 focus:ring-[#602249]/25"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-xs font-semibold">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
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
            disabled={login.isPending}
            className="w-full rounded-full bg-[#602249] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4d1b3b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {login.isPending ? "Comprobando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
