import Image from "next/image";

// Componente Header
const Header = () => (
  <header className="fixed top-0 z-50 w-full backdrop-filter backdrop-blur-lg bg-slate-950/70 shadow-lg">
    <div className="container mx-auto flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-4">
        <Image
          src="/logoPNG-removebg-preview.png"
          alt="Logo MatchStudy"
          width={150}
          height={60}
          priority
        />
        <span className="font-bold text-2xl text-purple-400 font-display">
          MatchStudy
        </span>
      </div>
      <nav className="flex gap-6">
        <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors font-semibold">
          Características
        </a>
        <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors font-semibold">
          Contacto
        </a>
        <a href="#login" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-semibold">
          Login
        </a>
      </nav>
    </div>
  </header>
);

// Componente Hero Section
const HeroSection = () => (
  <main className="flex flex-col items-center justify-center text-center px-4 py-32 md:py-48 bg-gradient-to-br from-slate-950 to-gray-900">
    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up">
      Bienvenido a MatchStudy 🚀
    </h1>
    <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl animate-fade-in-up delay-150">
      Tu plataforma para conectar con compañeros, compartir materiales y organizar sesiones de estudio en línea de manera sencilla.
    </p>
    <a href="#login" className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105 animate-fade-in-up delay-300">
      Empezar Ahora
    </a>
  </main>
);

// Componente Features Section
const FeaturesSection = () => (
  <section id="features" className="py-20 px-4 bg-gray-900">
    <div className="container mx-auto">
      <h2 className="text-4xl font-bold text-center text-purple-400 mb-12">
        Características
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          title="Videollamadas Integradas"
          description="Conéctate con tus compañeros en tiempo real para sesiones de estudio colaborativas sin salir de la plataforma."
        />
        <FeatureCard
          title="Biblioteca de Materiales"
          description="Comparte y consulta apuntes, ejercicios y recursos educativos, creando una biblioteca de conocimiento colectivo."
        />
        <FeatureCard
          title="Organización y Planificación"
          description="Planifica tus sesiones de estudio y proyectos en grupo de forma sencilla con nuestro calendario y herramientas de organización."
        />
      </div>
    </div>
  </section>
);

// Componente Tarjeta de Característica
const FeatureCard = ({ title, description }) => (
  <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 hover:border-purple-500 transition-transform hover:scale-105 transform">
    <h3 className="text-2xl font-semibold text-white mb-4">
      {title}
    </h3>
    <p className="text-gray-400">
      {description}
    </p>
  </div>
);

// Componente Footer
const Footer = () => (
  <footer id="contact" className="bg-slate-950 text-gray-500 py-6">
    <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-4">
      <p className="text-sm">
        © 2025 MatchStudy. Todos los derechos reservados.
      </p>
      <div className="flex gap-4">
        {/* Usar íconos para redes sociales es más visual y profesional */}
        <a href="#" className="hover:text-white transition-colors">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Facebook">
            {/* SVG Path for Facebook */}
          </svg>
        </a>
        <a href="#" className="hover:text-white transition-colors">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Instagram">
            {/* SVG Path for Instagram */}
          </svg>
        </a>
        <a href="#" className="hover:text-white transition-colors">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Twitter">
            {/* SVG Path for Twitter */}
          </svg>
        </a>
      </div>
    </div>
  </footer>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}