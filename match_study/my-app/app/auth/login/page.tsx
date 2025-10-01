/*"use client";  // <- Esto indica a Next.js que ese componente se ejecuta en el cliente, permitiendo useState, useEffect, etc.

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";

const LoginSection = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  return (
    <main className="flex flex-col items-center justify-center text-center px-4 py-32 md:py-48 bg-gradient-to-br from-slate-950 to-gray-900">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 animate-fade-in-up">
        Inicia Sesión 🚀
      </h1>
      <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl animate-fade-in-up delay-150">
        Accede a tu cuenta de MatchStudy y empieza a conectar con tus compañeros.
      </p>

      <form
        onSubmit={handleLogin}
        className="bg-slate-800 p-10 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6 animate-fade-in-up delay-300"
      >
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-transform transform hover:scale-105"
        >
          Iniciar Sesión
        </button>
        <p className="text-gray-400 text-sm">
          ¿No tienes cuenta? <a href="#" className="text-purple-400 hover:underline">Regístrate</a>
        </p>
      </form>
    </main>
  );
};

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Header />
      <LoginSection />
      <Footer />
    </div>
  );
}*/



"use client";

import Header from "@/app/components/Header"; // ajusta la ruta a tus componentes
import Footer from "@/app/components/Footer";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Opcional: traer tu fila de public.User (si usas esa tabla en tu app)
      // Tip: También podrías usar ensureUserRow si deseas crearla al primer login.
      const authId = data.user?.id;
      if (authId) {
        const { data: dbUser, error: dbErr } = await supabase
          .from("User")
          .select("*")
          .eq("authId", authId)
          .maybeSingle();
        if (dbErr) throw dbErr;
        // Aquí podrías redirigir según userType o guardar en estado global
        console.log("DB User:", dbUser);
      }

      // Redirección post-login (ajusta la ruta según tu app)
      window.location.href = "/"; // por ejemplo al dashboard
    } catch (err: unknown) {
       const msg = err instanceof Error ? err.message : String(err);
       setErrorMsg(msg || "Error al iniciar sesión"); // o "Error al registrar"
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Header />
      <main className="flex flex-col items-center justify-center text-center px-4 py-32 md:py-48 bg-gradient-to-br from-slate-950 to-gray-900">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
          Inicia Sesión 🚀
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
          Accede a tu cuenta de MatchStudy.
        </p>

        <form
          onSubmit={handleLogin}
          className="bg-slate-800 p-10 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6"
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-transform transform hover:scale-105"
          >
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
          {errorMsg && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}
          <p className="text-gray-400 text-sm">
            ¿No tienes cuenta? {" "}
            <a href="./registro" className="text-purple-400 hover:underline">
              Regístrate
            </a>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
