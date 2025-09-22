import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link"; // <-- Importar Link de Next.js

interface FeatureCardProps {
  title: string;
  description: string;
}

const HeroSection = () => (
  <main className="flex flex-col items-center justify-center text-center px-4 py-32 md:py-48 bg-gradient-to-br from-slate-950 to-gray-900">
    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up">
      Bienvenido a MatchStudy 🚀
    </h1>
    <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl animate-fade-in-up delay-150">
      Tu plataforma para conectar con compañeros, compartir materiales y organizar sesiones de estudio en línea de manera sencilla.
    </p>
    {/* Aquí usamos Link para navegar a la página de login */}
    <Link href="/login">
      <button className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105 animate-fade-in-up delay-300">
        Empezar Ahora
      </button>
    </Link>
  </main>
);

const FeatureCard = ({ title, description }) => (
  <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 hover:border-purple-500 transition-transform hover:scale-105 transform">
    <h3 className="text-2xl font-semibold text-white mb-4">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const FeaturesSection = () => (
  <section id="features" className="py-20 px-4 bg-gray-900">
    <div className="container mx-auto">
      <h2 className="text-4xl font-bold text-center text-purple-400 mb-12">Características</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard title="Videollamadas Integradas" description="Conéctate con tus compañeros en tiempo real para sesiones de estudio colaborativas sin salir de la plataforma." />
        <FeatureCard title="Biblioteca de Materiales" description="Comparte y consulta apuntes, ejercicios y recursos educativos, creando una biblioteca de conocimiento colectivo." />
        <FeatureCard title="Organización y Planificación" description="Planifica tus sesiones de estudio y proyectos en grupo de forma sencilla con nuestro calendario y herramientas de organización." />
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
        <Footer />
      </div>
    </div>
  );
}
