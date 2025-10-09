"use client";

import { HelpCircle, Send, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

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
        // keep editable on error
        setIsEmailLocked(false);
      }
    };
    loadUserEmail();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        // Intentar obtener el mensaje de error del servidor
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Error ${response.status}: ${response.statusText}`;
        console.error("Error del servidor:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      alert(
        `Hubo un error al enviar el mensaje: ${errorMessage}\n\nPor favor, intenta de nuevo.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="h-10 w-10 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Soporte y Ayuda
          </h1>
        </div>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          ¿Tienes preguntas o necesitas ayuda? Envíanos un mensaje y nos
          pondremos en contacto contigo lo antes posible.
        </p>
      </div>

      {/* Contact Form */}
      <div className="max-w-4xl mx-auto">
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">
                ¡Mensaje enviado exitosamente!
              </span>
            </div>
            <p className="text-green-300 text-sm mt-1">
              Nos pondremos en contacto contigo pronto.
            </p>
          </div>
        )}

        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:opacity-70"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-300 mb-2"
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
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="¿En qué podemos ayudarte?"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-vertical"
                placeholder="Describe tu problema o pregunta con el mayor detalle posible..."
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar mensaje a soporte
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/60 to-slate-800/60 p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Tiempo de respuesta
            </h3>
            <p className="text-slate-300">
              Nuestro equipo de soporte responde típicamente dentro de las
              siguientes <strong>24-48 horas</strong>. Para consultas urgentes,
              por favor incluye &quot;URGENTE&quot; en el asunto de tu mensaje.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
