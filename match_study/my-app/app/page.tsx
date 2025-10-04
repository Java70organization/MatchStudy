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

import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link"; // <-- Importar Link de Next.js
import Image from "next/image";
import { Video, BookOpen, Calendar, Mail, User } from "lucide-react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const HeroSection = () => (
  <main className="flex flex-col items-center justify-center text-center px-4 py-32 md:py-48 bg-gradient-to-br from-slate-950 to-gray-900">
    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-8 leading-tight animate-fade-in-up">
      Bienvenido a MatchStudy 🚀
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          title="Organización y Planificación"
          description="Planifica tus sesiones de estudio y proyectos en grupo de forma sencilla con nuestro calendario y herramientas de organización."
        />
      </div>
    </div>
  </section>
);

const ContactSection = () => (
  <section id="contact" className="py-20 px-4 bg-slate-950">
    <div className="container mx-auto">
      <h2 className="text-4xl font-bold text-center text-purple-400 mb-12">
        Nuestro Equipo
      </h2>
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-purple-600/20 border-b border-slate-700">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
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
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            ¿Tienes preguntas? No dudes en contactarnos. Estamos aquí para
            ayudarte.
          </p>
        </div>
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
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
