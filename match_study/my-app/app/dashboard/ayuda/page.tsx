import {
  HelpCircle,
  UserPlus,
  Users2,
  CreditCard,
  Search,
  Calendar,
  RotateCcw,
  Shield,
  AlertTriangle,
  Lock,
  BookOpen,
  User,
  Mail,
} from "lucide-react";

export default function AyudaPage() {
  const faqs = [
    {
      id: 1,
      question: "¿Qué es esta aplicación?",
      answer:
        "Es una plataforma en línea donde puedes dar o recibir asesorías en diferentes temas, a través de chat o videollamada.",
      icon: BookOpen,
      color: "text-blue-400",
    },
    {
      id: 2,
      question: "¿Cómo me registro?",
      answer:
        "Solo necesitas crear una cuenta con tu correo electrónico o iniciar sesión con Google.",
      icon: UserPlus,
      color: "text-green-400",
    },
    {
      id: 3,
      question: "¿Puedo ser tutor y aprendiz al mismo tiempo?",
      answer:
        "Sí, puedes registrarte en ambos roles y elegir según lo necesites.",
      icon: Users2,
      color: "text-purple-400",
    },
    {
      id: 4,
      question: "¿Tiene costo usar la aplicación?",
      answer:
        "El registro es gratuito. Algunas asesorías pueden tener costo según el tutor.",
      icon: CreditCard,
      color: "text-yellow-400",
    },
    {
      id: 5,
      question: "¿Cómo busco un tutor?",
      answer:
        "En la sección de búsqueda, selecciona la categoría o tema que te interesa y verás la lista de tutores disponibles.",
      icon: Search,
      color: "text-cyan-400",
    },
    {
      id: 6,
      question: "¿Cómo agendo una asesoría?",
      answer:
        "Elige al tutor, selecciona fecha y hora disponibles, y confirma la cita.",
      icon: Calendar,
      color: "text-emerald-400",
    },
    {
      id: 7,
      question: "¿Puedo cancelar o reprogramar mi asesoría?",
      answer:
        "Sí, desde tu perfil puedes cancelar o mover la cita antes de la hora programada.",
      icon: RotateCcw,
      color: "text-orange-400",
    },
    {
      id: 9,
      question: "¿Cómo sé si un tutor es confiable?",
      answer:
        "Cada tutor tiene un perfil con valoraciones y comentarios de otros estudiantes.",
      icon: Shield,
      color: "text-indigo-400",
    },
    {
      id: 10,
      question: "¿Qué pasa si tengo un problema durante la asesoría?",
      answer:
        "Puedes reportarlo en la sección de soporte, y el equipo de la aplicación te ayudará.",
      icon: AlertTriangle,
      color: "text-red-400",
    },
    {
      id: 11,
      question: "¿La información que comparto es segura?",
      answer:
        "Sí, todos los datos se manejan con protocolos de seguridad y privacidad.",
      icon: Lock,
      color: "text-pink-400",
    },
  ];

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="h-10 w-10 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Preguntas Frecuentes
          </h1>
        </div>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Encuentra respuestas a las preguntas más comunes sobre MatchStudy
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {faqs.map((faq) => {
          const IconComponent = faq.icon;
          return (
            <div
              key={faq.id}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg hover:bg-slate-900/80 transition-all duration-300 hover:border-slate-700 hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 rounded-full bg-slate-800 p-3 group-hover:bg-slate-700 transition-colors`}
                >
                  <IconComponent className={`h-6 w-6 ${faq.color}`} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {faq.question}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Support */}
      <div className="mt-12 text-center">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/60 to-slate-800/60 p-8 shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">
              ¿No encontraste tu respuesta?
            </h2>
          </div>
          <p className="text-slate-300 mb-6 max-w-lg mx-auto">
            Nuestro equipo de soporte está aquí para ayudarte con cualquier
            pregunta adicional que puedas tener.
          </p>

          {/* Tabla de Contacto */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-purple-600/20 border-b border-slate-700">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2 justify-center">
                  <User className="h-5 w-5" />
                  Información de Contacto
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                        Correo Electrónico
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    <tr className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-white font-medium">
                            Ernesto David Casas Herrera
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <a
                            href="mailto:ernesto.cherrera@alumnos.udg.mx"
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            ernesto.cherrera@alumnos.udg.mx
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-white font-medium">
                            Juan Antonio Valenzuela Aguilera
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <a
                            href="mailto:juan.valenzuela7221@alumnos.udg.mx"
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            juan.valenzuela7221@alumnos.udg.mx
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-white font-medium">
                            Miguel Angel Hernandez de la Cruz
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <a
                            href="mailto:miguel.hernandez3986@alumnos.udg.mx"
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            miguel.hernandez3986@alumnos.udg.mx
                          </a>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
