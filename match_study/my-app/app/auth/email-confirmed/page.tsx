"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function EmailConfirmedPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente después de 5 segundos
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />

      <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center">
            {/* Icono de éxito */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-500" />
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle className="w-20 h-20 text-green-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-green-500 mb-4">
              ¡Email Confirmado!
            </h1>

            {/* Mensaje principal */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              Tu correo electrónico ha sido verificado exitosamente. Ahora ya
              puedes acceder a tu cuenta y comenzar a usar MatchStudy.
            </p>

            {/* Características desbloqueadas */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                Ya puedes:
              </h3>
              <ul className="text-left text-gray-300 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Iniciar sesión en tu cuenta
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Acceder al dashboard de estudiante
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Programar y unirte a sesiones de estudio
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Conectar con otros estudiantes
                </li>
              </ul>
            </div>

            {/* Botones de acción */}
            <div className="space-y-4">
              <button
                onClick={() => router.push("/auth/login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center group"
              >
                Iniciar Sesión
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full text-gray-400 hover:text-gray-300 font-medium py-2 transition-colors"
              >
                Volver al inicio
              </button>
            </div>

            {/* Contador automático */}
            <div className="mt-6 text-sm text-gray-500">
              Serás redirigido automáticamente al login en unos segundos...
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
