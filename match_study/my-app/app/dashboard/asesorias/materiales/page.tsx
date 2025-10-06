import { FileText, Upload, Search, Filter, Download, Eye } from "lucide-react";

export default function MaterialesPage() {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Materiales
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
              placeholder="Buscar materiales..."
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
          Subir Material
        </button>
      </div>

      {/* Grid de materiales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Material 1 */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Apuntes de Cálculo I
                </h3>
                <p className="text-sm text-slate-400">PDF • 2.4 MB</p>
              </div>
            </div>
            <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full">
              Matemáticas
            </span>
          </div>

          <p className="text-slate-300 text-sm mb-4">
            Resumen completo de derivadas, integrales y aplicaciones. Incluye
            ejemplos resueltos paso a paso.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
            <span>👤 María González</span>
            <span>⭐ 4.9 (127)</span>
            <span>📅 Hace 2 días</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <Download className="h-3 w-3" />
              Descargar
            </button>
            <button className="flex items-center justify-center gap-2 border border-slate-600 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm">
              <Eye className="h-3 w-3" />
              Ver
            </button>
          </div>
        </div>

        {/* Material 2 */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Ejercicios de Programación
                </h3>
                <p className="text-sm text-slate-400">ZIP • 5.1 MB</p>
              </div>
            </div>
            <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full">
              Programación
            </span>
          </div>

          <p className="text-slate-300 text-sm mb-4">
            Colección de 50 ejercicios de Python con soluciones. Ideal para
            practicar estructuras de datos.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
            <span>👤 Carlos Ramírez</span>
            <span>⭐ 4.7 (89)</span>
            <span>📅 Hace 1 semana</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <Download className="h-3 w-3" />
              Descargar
            </button>
            <button className="flex items-center justify-center gap-2 border border-slate-600 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm">
              <Eye className="h-3 w-3" />
              Ver
            </button>
          </div>
        </div>

        {/* Material 3 */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Formulario de Física
                </h3>
                <p className="text-sm text-slate-400">PDF • 1.2 MB</p>
              </div>
            </div>
            <span className="bg-red-600/20 text-red-400 text-xs px-2 py-1 rounded-full">
              Física
            </span>
          </div>

          <p className="text-slate-300 text-sm mb-4">
            Todas las fórmulas esenciales de mecánica, termodinámica y
            electromagnetismo en un solo documento.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
            <span>👤 Ana López</span>
            <span>⭐ 4.8 (156)</span>
            <span>📅 Hace 3 días</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <Download className="h-3 w-3" />
              Descargar
            </button>
            <button className="flex items-center justify-center gap-2 border border-slate-600 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm">
              <Eye className="h-3 w-3" />
              Ver
            </button>
          </div>
        </div>

        {/* Material 4 */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Química Orgánica</h3>
                <p className="text-sm text-slate-400">PPTX • 8.7 MB</p>
              </div>
            </div>
            <span className="bg-yellow-600/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
              Química
            </span>
          </div>

          <p className="text-slate-300 text-sm mb-4">
            Presentación interactiva sobre reacciones orgánicas, mecanismos y
            síntesis. Con animaciones.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
            <span>👤 Dr. Pérez</span>
            <span>⭐ 5.0 (234)</span>
            <span>📅 Hace 5 días</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <Download className="h-3 w-3" />
              Descargar
            </button>
            <button className="flex items-center justify-center gap-2 border border-slate-600 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm">
              <Eye className="h-3 w-3" />
              Ver
            </button>
          </div>
        </div>

        {/* Material 5 */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  English Grammar Guide
                </h3>
                <p className="text-sm text-slate-400">PDF • 3.5 MB</p>
              </div>
            </div>
            <span className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full">
              Inglés
            </span>
          </div>

          <p className="text-slate-300 text-sm mb-4">
            Guía completa de gramática inglesa con ejemplos, ejercicios y reglas
            explicadas de forma sencilla.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
            <span>👤 Sarah Johnson</span>
            <span>⭐ 4.6 (78)</span>
            <span>📅 Hace 1 día</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <Download className="h-3 w-3" />
              Descargar
            </button>
            <button className="flex items-center justify-center gap-2 border border-slate-600 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm">
              <Eye className="h-3 w-3" />
              Ver
            </button>
          </div>
        </div>

        {/* Material 6 */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Historia Universal</h3>
                <p className="text-sm text-slate-400">DOCX • 4.2 MB</p>
              </div>
            </div>
            <span className="bg-cyan-600/20 text-cyan-400 text-xs px-2 py-1 rounded-full">
              Historia
            </span>
          </div>

          <p className="text-slate-300 text-sm mb-4">
            Línea de tiempo interactiva de los eventos más importantes de la
            historia mundial hasta el siglo XXI.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
            <span>👤 Prof. Martínez</span>
            <span>⭐ 4.9 (201)</span>
            <span>📅 Hace 2 semanas</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <Download className="h-3 w-3" />
              Descargar
            </button>
            <button className="flex items-center justify-center gap-2 border border-slate-600 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm">
              <Eye className="h-3 w-3" />
              Ver
            </button>
          </div>
        </div>
      </div>

      {/* Botón cargar más */}
      <div className="text-center">
        <button className="bg-slate-800 border border-slate-700 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors">
          Cargar más materiales
        </button>
      </div>
    </section>
  );
}
