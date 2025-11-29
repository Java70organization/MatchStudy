"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Evitar enviar si ya se está procesando
    if (loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Mensaje más amigable
        if (
          error.message.toLowerCase().includes("invalid login") ||
          error.message.toLowerCase().includes("invalid email or password") ||
          error.message.toLowerCase().includes("invalid credentials")
        ) {
          throw new Error("Correo o contraseña incorrectos.");
        }
        throw error;
      }

      // Usuario autenticado exitosamente
      console.log("Usuario autenticado:", data.user?.email);

      // Redirección directa al dashboard
      window.location.href = "/dashboard/lobby";
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al iniciar sesión.";
      setErrorMsg(msg);

      // Opcional: limpiar solo la contraseña para que el usuario la reescriba
      setPassword("");
    } finally {
      // Muy importante: volver a habilitar el botón
      setLoading(false);
    }
  };

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-white">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-24 md:py-32">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold md:text-5xl">
              Inicia sesión
            </h1>
            <p className="mx-auto max-w-sm text-sm text-slate-400 md:text-base">
              Accede a tu cuenta de{" "}
              <span className="font-semibold text-purple-400">
                MatchStudy
              </span>{" "}
              para continuar aprendiendo.
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-red-500/60 bg-red-900/30 px-4 py-3 text-sm text-red-100 shadow-lg shadow-red-900/30">
              <p className="font-medium">No se pudo iniciar sesión</p>
              <p className="mt-1 text-xs text-red-200/90">{errorMsg}</p>
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="flex w-full flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur"
          >
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wide text-slate-300"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wide text-slate-300"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                required
              />
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-purple-300"
                  onClick={() =>
                    alert(
                      "Si olvidaste tu contraseña, contacta con soporte o implementa aquí tu flujo de reset de contraseña.",
                    )
                  }
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="mt-2 flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Entrando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>

            <p className="pt-1 text-center text-xs text-slate-400 md:text-sm">
              ¿No tienes cuenta?{" "}
              <a
                href="./registro"
                className="font-semibold text-purple-400 hover:text-purple-300 hover:underline"
              >
                Regístrate
              </a>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
