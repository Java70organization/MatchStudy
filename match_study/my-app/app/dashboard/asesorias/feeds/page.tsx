import {
  Rss,
  Users,
  TrendingUp,
  MessageCircle,
  Search,
  Filter,
  Upload,
} from "lucide-react";

export default function FeedsPage() {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Rss className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Feeds
          </h1>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar feeds..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            <Filter className="h-4 w-4" />
            Filtros
          </button>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <Upload className="h-4 w-4" />
          Publicar un Feed
        </button>
      </div>

      {/* Feed de asesorías */}
      <div className="grid gap-6">
        {/* Asesoría 1 */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  Matemáticas - Cálculo Diferencial
                </h3>
                <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full">
                  Disponible
                </span>
              </div>
              <p className="text-slate-300 mb-3">
                Tutoría grupal sobre derivadas e integrales. Resolveremos
                ejercicios prácticos y dudas específicas.
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>👤 Juan Pérez</span>
                <span>⭐ 4.8 (23 reviews)</span>
                <span>🕒 Hoy 3:00 PM</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Unirse
                </button>
                <button className="border border-slate-600 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Asesoría 2 */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  Programación - Python Básico
                </h3>
                <span className="bg-yellow-600/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                  2 espacios
                </span>
              </div>
              <p className="text-slate-300 mb-3">
                Aprende los fundamentos de Python: variables, funciones, bucles
                y estructuras de datos básicas.
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>👤 María González</span>
                <span>⭐ 4.9 (45 reviews)</span>
                <span>🕒 Mañana 10:00 AM</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Reservar
                </button>
                <button className="border border-slate-600 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Asesoría 3 */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  Física - Mecánica Clásica
                </h3>
                <span className="bg-red-600/20 text-red-400 text-xs px-2 py-1 rounded-full">
                  Lleno
                </span>
              </div>
              <p className="text-slate-300 mb-3">
                Repaso de cinemática y dinámica. Resolución de problemas de
                movimiento y fuerzas.
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>👤 Carlos Ramírez</span>
                <span>⭐ 4.7 (18 reviews)</span>
                <span>🕒 Hoy 7:00 PM</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  className="bg-slate-600 text-slate-400 px-4 py-2 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Sin espacios
                </button>
                <button className="border border-slate-600 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                  Lista de espera
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón cargar más */}
      <div className="text-center">
        <button className="bg-slate-800 border border-slate-700 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors">
          Cargar más asesorías
        </button>
      </div>
    </section>
  );
}
