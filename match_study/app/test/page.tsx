import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-8">
        <h1>Página de prueba</h1>
        <p>Contenido entre header y footer</p>
      </main>
      <Footer />
    </div>
  );
}
