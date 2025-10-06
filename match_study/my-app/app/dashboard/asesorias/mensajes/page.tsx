import { MessageSquare, User, Clock } from "lucide-react";

export default function MensajesPage() {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mensajes
          </h1>
        </div>
      </div>

      {/* Lista de mensajes */}
      <div className="space-y-4">
        {/* Mensaje 1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg hover:bg-slate-900/80 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">María González</h3>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Clock className="h-3 w-3" />
                  <span>hace 2 horas</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-2">
                Hola! ¿Podrías ayudarme con los ejercicios de cálculo
                diferencial que vimos en la última sesión?
              </p>
              <div className="flex items-center gap-2">
                <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full">
                  Asesoría
                </span>
                <span className="text-slate-500 text-xs">Matemáticas</span>
              </div>
            </div>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* Mensaje 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg hover:bg-slate-900/80 transition-colors cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Carlos Ramírez</h3>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Clock className="h-3 w-3" />
                  <span>ayer</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-2">
                Perfecto, nos vemos mañana para la sesión de física. Ya tengo
                preparados los ejercicios de cinemática.
              </p>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                  Programada
                </span>
                <span className="text-slate-500 text-xs">Física</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estado vacío para otros mensajes */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg text-center">
          <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-300 mb-2">No tienes más mensajes</p>
          <p className="text-slate-400 text-sm">
            Los nuevos mensajes aparecerán aquí
          </p>
        </div>
      </div>
    </section>
  );
}
