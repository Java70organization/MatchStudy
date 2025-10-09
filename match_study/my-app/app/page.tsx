/*import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Next.js Supabase Starter</Link>
              <div className="flex items-center gap-2">
                <DeployButton />
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Hero />
          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Next steps</h2>
            {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
*/

"use client";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link"; // <-- Importar Link de Next.js
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
} from "lucide-react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const HeroSection = () => (
  <main className="flex flex-col items-center justify-center text-center px-4 py-32 md:py-48 bg-gradient-to-br from-slate-950 to-gray-900">
    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-8 leading-tight animate-fade-in-up">
      Bienvenido a MatchStudy
    </h1>

    {/* Logo centrado */}
    <div className="mb-8 animate-fade-in-up delay-100">
      <Image
        src="https://lksruyrnhqwvkwaacwjq.supabase.co/storage/v1/object/public/Imagenes/logo.png"
        alt="Logo MatchStudy"
        width={400}
        height={400}
        className="rounded-2xl shadow-2xl border-4 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
        priority
      />
    </div>

    <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl animate-fade-in-up delay-200">
      Tu plataforma para conectar con compañeros, compartir materiales y
      organizar sesiones de estudio en línea de manera sencilla.
    </p>
    {/* Aquí usamos Link para navegar a la página de login */}
    <Link href="./auth/login">
      <button className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105 animate-fade-in-up delay-300">
        Empezar Ahora
      </button>
    </Link>
  </main>
);

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
}) => (
  <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 hover:border-purple-500 transition-transform hover:scale-105 transform">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-purple-600 rounded-lg">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
    </div>
    <p className="text-gray-400">{description}</p>
  </div>
);
const FeaturesSection = () => (
  <section id="features" className="py-20 px-4 bg-gray-900">
    <div className="container mx-auto">
      <h2 className="text-4xl font-bold text-center text-purple-400 mb-12">
        Características
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          icon={Video}
          title="Videollamadas Integradas"
          description="Conéctate con tus compañeros en tiempo real para sesiones de estudio colaborativas sin salir de la plataforma."
        />
        <FeatureCard
          icon={BookOpen}
          title="Biblioteca de Materiales"
          description="Comparte y consulta apuntes, ejercicios y recursos educativos, creando una biblioteca de conocimiento colectivo."
        />
        <FeatureCard
          icon={Calendar}
          title="Planificación Inteligente"
          description="Organiza y planifica tus sesiones de estudio con herramientas inteligentes que se adaptan a tu horario y objetivos."
        />
        <FeatureCard
          icon={Search}
          title="Búsqueda por Intereses"
          description="Encuentra compañeros de estudio y grupos con intereses similares usando nuestro sistema de búsqueda avanzado."
        />
        <FeatureCard
          icon={UserCog}
          title="Perfiles y Roles"
          description="Crea perfiles detallados con tus habilidades, intereses y define roles específicos en grupos de estudio."
        />
        <FeatureCard
          icon={Bell}
          title="Notificaciones y Feed"
          description="Mantente al día con notificaciones inteligentes y un feed personalizado de actividades relevantes."
        />
      </div>
    </div>
  </section>
);

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-20 px-4 bg-slate-900">
    <div className="container mx-auto">
      <h2 className="text-4xl font-bold text-center text-purple-400 mb-16">
        ¿Cómo funciona?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center group">
          <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 group-hover:bg-purple-500 transition-colors">
            1
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Crea tu cuenta
          </h3>
          <p className="text-gray-400">
            Regístrate fácilmente y completa tu perfil con tus intereses
            académicos y metas de estudio.
          </p>
        </div>
        <div className="text-center group">
          <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 group-hover:bg-purple-500 transition-colors">
            2
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Elige un tema
          </h3>
          <p className="text-gray-400">
            Selecciona las materias o temas que te interesan para encontrar
            compañeros de estudio compatibles.
          </p>
        </div>
        <div className="text-center group">
          <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 group-hover:bg-purple-500 transition-colors">
            3
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">Conéctate</h3>
          <p className="text-gray-400">
            Únete a grupos de estudio, programa sesiones y conéctate con otros
            estudiantes mediante videollamadas.
          </p>
        </div>
        <div className="text-center group">
          <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 group-hover:bg-purple-500 transition-colors">
            4
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Comparte y mejora
          </h3>
          <p className="text-gray-400">
            Comparte recursos, aprende colaborativamente y mejora tus resultados
            académicos en equipo.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const BenefitsSection = () => (
  <section id="benefits" className="py-20 px-4 bg-gray-900">
    <div className="container mx-auto">
      <h2 className="text-4xl font-bold text-center text-purple-400 mb-12">
        Beneficios Clave
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={Zap}
          title="Menos Fricción"
          description="Elimina las barreras que dificultan el estudio colaborativo con una plataforma integrada y fácil de usar."
        />
        <FeatureCard
          icon={Target}
          title="Enfoque en Resultados"
          description="Herramientas diseñadas para maximizar tu aprendizaje y mejorar tu rendimiento académico de manera efectiva."
        />
        <FeatureCard
          icon={TrendingUp}
          title="Escalable"
          description="Crece con tus necesidades académicas, desde estudios individuales hasta proyectos grupales complejos."
        />
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <div className="w-[1280px] mx-auto flex flex-col flex-1">
        <Header />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <Footer />
      </div>
    </div>
  );
}
