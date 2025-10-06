import { Calendar, Clock, Users, MapPin } from "lucide-react";

export default function CalendarioPage() {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Calendario
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Vista de calendario (miniatura) */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Octubre 2025</h2>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  ‹
                </button>
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  ›
                </button>
              </div>
            </div>

            {/* Mini calendario */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-slate-400 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Días del mes */}
              {Array.from({ length: 35 }, (_, i) => {
                const dayNumber = i - 5; // Ajuste para que empiece el mes correctamente
                const isCurrentMonth = dayNumber > 0 && dayNumber <= 31;
                const isToday = dayNumber === 4; // Ejemplo: día 4
                const hasEvent = [7, 12, 18, 25].includes(dayNumber); // Días con eventos

                return (
                  <div
                    key={i}
                    className={`
                      aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors
                      ${
                        !isCurrentMonth
                          ? "text-slate-600"
                          : "text-slate-300 hover:bg-slate-700"
                      }
                      ${isToday ? "bg-purple-600 text-white" : ""}
                      ${
                        hasEvent && !isToday
                          ? "bg-blue-600/20 text-blue-400"
                          : ""
                      }
                    `}
                  >
                    {isCurrentMonth ? dayNumber : ""}
                    {hasEvent && (
                      <div className="absolute w-1 h-1 bg-purple-400 rounded-full mt-6"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel lateral - Próximas asesorías */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Asesorías
            </h2>

            <div className="space-y-4">
              {/* Asesoría 1 */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white">
                    Matemáticas - Cálculo
                  </h3>
                  <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full">
                    Confirmada
                  </span>
                </div>
                <div className="space-y-1 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Hoy 3:00 PM - 4:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>Juan Pérez (Tutor)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>Videollamada</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors">
                    Unirse
                  </button>
                  <button className="px-3 py-1 border border-slate-600 text-slate-400 rounded text-xs hover:bg-slate-700 transition-colors">
                    Detalles
                  </button>
                </div>
              </div>

              {/* Asesoría 2 */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white">
                    Programación - Python
                  </h3>
                  <span className="bg-yellow-600/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                    Pendiente
                  </span>
                </div>
                <div className="space-y-1 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Mañana 10:00 AM - 11:30 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>María González (Tutora)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>Sala 205</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-slate-600 text-slate-300 px-3 py-1 rounded text-xs">
                    Confirmar
                  </button>
                  <button className="px-3 py-1 border border-slate-600 text-slate-400 rounded text-xs hover:bg-slate-700 transition-colors">
                    Reagendar
                  </button>
                </div>
              </div>

              {/* Asesoría 3 */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white">Física - Mecánica</h3>
                  <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                    Programada
                  </span>
                </div>
                <div className="space-y-1 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Viernes 2:00 PM - 3:30 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>Carlos Ramírez (Tutor)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>Videollamada</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-slate-600 text-slate-300 px-3 py-1 rounded text-xs">
                    Ver detalles
                  </button>
                  <button className="px-3 py-1 border border-slate-600 text-slate-400 rounded text-xs hover:bg-slate-700 transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
