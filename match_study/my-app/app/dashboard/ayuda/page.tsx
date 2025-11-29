"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  HelpCircle,
  Send,
  MessageSquare,
  Mail,
  PhoneCall,
  Clock,
} from "lucide-react";

export default function AyudaPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const maxChars = 800;

  // Prefill email from active session and lock field
  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const email = user?.email ?? "";
        if (email) {
          setFormData((prev) => ({ ...prev, email }));
          setIsEmailLocked(true);
        } else {
          setIsEmailLocked(false);
        }
      } catch {
        setIsEmailLocked(false);
      }
    };
    loadUserEmail();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "message" ? value.slice(0, maxChars) : value, // límite para el mensaje
    }));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ name: "", email: isEmailLocked ? formData.email : "", subject: "", message: "" });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <header className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/70 to-pink-500/80 shadow-lg shadow-purple-900/40">
            <HelpCircle className="h-7 w-7 text-white" />
          </div>
          <div className="text-left">
            <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
              Soporte y Ayuda
            </h1>
            <p className="text-sm text-slate-400">
              Cuéntanos qué sucede y te ayudamos a resolverlo.
            </p>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        {/* Columna izquierda: formulario */}
        <div className="space-y-4">
          {isSuccess && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/25 px-4 py-3 text-sm shadow-lg shadow-emerald-900/30">
              <div className="flex items-center gap-2 text-emerald-300">
                <MessageSquare className="h-4 w-4" />
                <span className="font-semibold">
                  ¡Mensaje enviado exitosamente!
                </span>
              </div>
              <p className="mt-1 text-xs text-emerald-200/90">
                Nuestro equipo de soporte te responderá lo antes posible.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl border border-red-500/40 bg-red-900/25 px-4 py-3 text-sm text-red-200 shadow-lg shadow-red-900/30">
              <p className="font-semibold">No se pudo enviar el mensaje</p>
              <p className="mt-1 text-xs opacity-90">{errorMsg}</p>
            </div>
          )}

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950/90 via-slate-900/95 to-slate-900/90 p-6 shadow-xl shadow-black/40 md:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Enviar mensaje a soporte
                </h2>
                <p className="text-xs text-slate-400">
                  Completa los campos y describe tu problema con detalle.
                </p>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300">
                Tiempo estimado de respuesta: 24-48h
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-300"
                  >
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium uppercase tracking-wide text-slate-300"
                  >
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    readOnly={isEmailLocked}
                    className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 disabled:opacity-70"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="subject"
                  className="block text-xs font-medium uppercase tracking-wide text-slate-300"
                >
                  Asunto
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                  placeholder="Ej. Problema para entrar a una sala"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="message"
                    className="font-medium uppercase tracking-wide text-slate-300"
                  >
                    Mensaje
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.message.length}/{maxChars} caracteres
                  </span>
                </div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/60 px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                  placeholder="Describe tu problema o pregunta con el mayor detalle posible…"
                />
              </div>

              <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
                <p className="text-[11px] text-slate-400">
                  Consejo: incluye capturas de pantalla o códigos de error en tu
                  mensaje para que podamos ayudarte más rápido.
                </p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 outline-none transition hover:from-purple-500 hover:to-pink-400 focus:ring-2 focus:ring-purple-500/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar mensaje
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna derecha: info rápida */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/40">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Clock className="h-4 w-4 text-purple-300" />
              Tiempo de respuesta
            </h3>
            <p className="text-sm text-slate-300">
              Nuestro equipo responde normalmente dentro de{" "}
              <span className="font-semibold text-purple-300">24–48 horas</span>
              . Si tu consulta es urgente, agrega{" "}
              <span className="font-mono text-xs text-pink-300">[URGENTE]</span>{" "}
              al inicio del asunto.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/40">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <MessageSquare className="h-4 w-4 text-purple-300" />
              Consejos para un mejor soporte
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400" />
                Indica el navegador o dispositivo que estás usando.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400" />
                Menciona los pasos que seguiste antes de que apareciera el
                problema.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400" />
                Si ves algún mensaje de error, cópialo y pégalo en el mensaje.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/40">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Mail className="h-4 w-4 text-purple-300" />
              Otros canales de contacto
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="font-medium text-slate-100">
                  Correo directo:
                </span>{" "}
                soporte@matchstudy.app
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-400">
                  Línea de soporte disponible en horario escolar.
                </span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
