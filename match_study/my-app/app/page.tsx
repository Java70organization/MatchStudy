"use client";

import type React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import Image from "next/image";
import {
  Video,
  BookOpen,
  Calendar,
  Search,
  UserCog,
  Bell,
  Target,
  Zap,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "purple" | "green" | "blue" | "orange";
};

const toneStyles: Record<
  NonNullable<FeatureCardProps["tone"]>,
  { ring: string; bg: string; iconBg: string; iconText: string }
> = {
  purple: {
    ring: "hover:border-purple-500/50",
    bg: "bg-purple-600/15",
    iconBg: "bg-purple-600/20",
    iconText: "text-purple-300",
  },
  green: {
    ring: "hover:border-green-500/50",
    bg: "bg-green-600/15",
    iconBg: "bg-green-600/20",
    iconText: "text-green-300",
  },
  blue: {
    ring: "hover:border-blue-500/50",
    bg: "bg-blue-600/15",
    iconBg: "bg-blue-600/20",
    iconText: "text-blue-300",
  },
  orange: {
    ring: "hover:border-orange-500/50",
    bg: "bg-orange-600/15",
    iconBg: "bg-orange-600/20",
    iconText: "text-orange-300",
  },
};

const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
);

const SectionTitle = ({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="text-center space-y-3">
    {eyebrow && (
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/40 px-3 py-1 text-xs text-slate-300">
        <Sparkles className="h-3.5 w-3.5 text-purple-300" />
        {eyebrow}
      </div>
    )}
    <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
      {title}
    </h2>
    {subtitle && <p className="mx-auto max-w-2xl text-sm md:text-base text-slate-300">{subtitle}</p>}
  </div>
);

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, tone = "purple" }) => {
  const t = toneStyles[tone];
  return (
    <div
      className={[
        "group rounded-2xl border border-slate-800 bg-slate-950/30 p-6 shadow-lg shadow-black/30",
        "transition-all duration-300 hover:-translate-y-1",
        t.ring,
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className={["rounded-xl border border-slate-800 p-3", t.iconBg].join(" ")}>
          <Icon className={["h-6 w-6", t.iconText].join(" ")} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/40 px-3 py-1">
          {tone === "purple" ? "IA + Comunidad" : tone === "green" ? "Recursos" : tone === "blue" ? "Conexión" : "Productividad"}
        </span>
        <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 inline-flex items-center gap-1">
          Ver más <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 shadow-lg shadow-black/30">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-lg font-semibold text-white">{value}</div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-purple-600/10 p-2">
        <Icon className="h-5 w-5 text-purple-300" />
      </div>
    </div>
  </div>
);

const HeroSection = () => (
  <section className="relative overflow-hidden">
    {/* Background glow */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute -bottom-40 right-0 h-[520px] w-[520px] rounded-full bg-pink-600/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_55%)]" />
    </div>

    <Container>
      <div className="relative py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/40 px-4 py-2 text-xs text-slate-300">
              <ShieldCheck className="h-4 w-4 text-purple-300" />
              Plataforma segura + recomendación personalizada
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                MatchStudy
              </span>{" "}
              para estudiar mejor, juntos
            </h1>

            <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Conecta con compañeros, comparte materiales y organiza sesiones 1 a 1 o en grupo. Todo con un feed que se
              adapta a tus intereses.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:bg-purple-700 transition-colors">
                  Empezar ahora <ArrowRight className="h-4 w-4" />
                </button>
              </Link>

              <a href="#features" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/30 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-purple-500/50 transition-colors">
                  Ver características
                </button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <StatCard label="Feed" value="Personalizado" icon={Sparkles} />
              <StatCard label="Sesiones" value="1 a 1 / Grupos" icon={Video} />
              <StatCard label="Recursos" value="Biblioteca" icon={BookOpen} />
            </div>
          </div>

          {/* Visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/20 to-pink-600/10 blur-2xl" />
              <div className="relative rounded-3xl border border-slate-800 bg-slate-950/40 p-6 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">MatchStudy</div>
                  <div className="text-xs text-slate-400">v1</div>
                </div>

                <div className="mt-5 flex justify-center">
                  <Image
                    src="https://lksruyrnhqwvkwaacwjq.supabase.co/storage/v1/object/public/Imagenes/logo.png"
                    alt="Logo MatchStudy"
                    width={320}
                    height={320}
                    className="rounded-2xl border border-purple-500/20 shadow-xl shadow-black/40"
                    priority
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="text-xs text-slate-400">Recomendaciones</div>
                    <div className="mt-1 text-sm font-semibold text-white">“Para ti”</div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="text-xs text-slate-400">Búsqueda</div>
                    <div className="mt-1 text-sm font-semibold text-white">Por tema</div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="text-xs text-slate-400">Colaboración</div>
                    <div className="mt-1 text-sm font-semibold text-white">Salas</div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="text-xs text-slate-400">Material</div>
                    <div className="mt-1 text-sm font-semibold text-white">Biblioteca</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Visual */}
        </div>
      </div>
    </Container>
  </section>
);

const FeaturesSection = () => (
  <section id="features" className="py-16 md:py-20">
    <Container>
      <SectionTitle
        eyebrow="Todo en una sola plataforma"
        title="Características"
        subtitle="Herramientas pensadas para organizar, conectar y mejorar tu rendimiento académico sin fricción."
      />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={Video}
          title="Videollamadas Integradas"
          description="Sesiones en tiempo real para asesorías y estudio colaborativo, sin salir de MatchStudy."
          tone="blue"
        />
        <FeatureCard
          icon={BookOpen}
          title="Biblioteca de Materiales"
          description="Comparte apuntes, ejercicios y recursos. Construye una biblioteca colectiva por materias."
          tone="green"
        />
        <FeatureCard
          icon={Calendar}
          title="Planificación Inteligente"
          description="Organiza sesiones y tareas con foco en objetivos: prepara exámenes, prácticas y entregas."
          tone="orange"
        />
        <FeatureCard
          icon={Search}
          title="Búsqueda por Intereses"
          description="Encuentra personas y contenido por tema, categoría o palabras clave de forma rápida."
          tone="purple"
        />
        <FeatureCard
          icon={UserCog}
          title="Perfiles y Roles"
          description="Perfiles con intereses, habilidades y roles para que cada grupo fluya mejor."
          tone="blue"
        />
        <FeatureCard
          icon={Bell}
          title="Notificaciones + Feed"
          description="Un feed personalizado con actividad relevante: tendencias, recuentes y “para ti”."
          tone="purple"
        />
      </div>
    </Container>
  </section>
);

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-16 md:py-20">
    <Container>
      <SectionTitle
        eyebrow="Onboarding simple"
        title="¿Cómo funciona?"
        subtitle="En pocos pasos estás dentro: crea tu perfil, elige temas y empieza a conectar."
      />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            n: 1,
            title: "Crea tu cuenta",
            desc: "Regístrate y completa tu perfil con intereses y metas académicas.",
          },
          {
            n: 2,
            title: "Elige un tema",
            desc: "Selecciona materias o temas y encuentra contenido y personas afines.",
          },
          {
            n: 3,
            title: "Conéctate",
            desc: "Únete a grupos, crea salas y programa sesiones con videollamada.",
          },
          {
            n: 4,
            title: "Comparte y mejora",
            desc: "Publica recursos, comenta y aprende colaborativamente para mejorar resultados.",
          },
        ].map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-slate-800 bg-slate-950/30 p-6 shadow-lg shadow-black/30"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-purple-600/20 border border-purple-500/20 flex items-center justify-center font-bold text-purple-200">
                {s.n}
              </div>
              <h3 className="text-lg font-semibold text-white">{s.title}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </Container>
  </section>
);

const BenefitsSection = () => (
  <section id="benefits" className="py-16 md:py-20">
    <Container>
      <SectionTitle
        eyebrow="Impacto real"
        title="Beneficios clave"
        subtitle="Menos caos, más foco. MatchStudy integra lo que normalmente está disperso en muchas apps."
      />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Zap}
          title="Menos fricción"
          description="Deja de saltar entre herramientas: comunicación, agenda y recursos en un solo lugar."
          tone="orange"
        />
        <FeatureCard
          icon={Target}
          title="Enfoque en resultados"
          description="Organiza tu estudio por objetivos y recibe recomendaciones alineadas a tus necesidades."
          tone="purple"
        />
        <FeatureCard
          icon={TrendingUp}
          title="Escalable"
          description="Desde estudiar solo hasta equipos de proyecto: crece con tus necesidades académicas."
          tone="green"
        />
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-pink-900/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Listo para empezar</h3>
            <p className="text-sm text-slate-300">
              Inicia sesión y comienza a usar el feed, la biblioteca y las salas desde hoy.
            </p>
          </div>
          <Link href="/auth/login" className="w-full md:w-auto">
            <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition-colors">
              Entrar <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </Container>
  </section>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <Footer />
    </div>
  );
}

