/*"use client";

import Header from "@/app/components/Header"; // ajusta rutas
import Footer from "@/app/components/Footer";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ensureUserRow } from "@/lib/supabase/user";

export default function RegistroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [userType, setUserType] = useState("student"); // o "tutor"
  const [university, setUniversity] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      // 1) Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback` // opcional si usas magic link/confirmación
              : undefined,
          data: { displayName, userType, university }, // metadatos del user
        },
      });
      if (error) throw error;

      const authUser = data.user;
      if (!authUser) throw new Error("No se recibió el usuario de Auth");

      // 2) Crear fila en public.User (si no existe)
      await ensureUserRow({
        authId: authUser.id,
        email: email,
        displayName,
        userType,
        university: university || null,
        photoUrl: null,
      });

      // 3) (Opcional) Redirigir a login si requieres verificación de correo
      // Si tu proyecto no exige confirmación, podrías loguear automáticamente
      window.location.href = "./login";
    } catch (err: any) {
      setErrorMsg(err.message ?? "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Header />
      <main className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-36 bg-gradient-to-br from-slate-950 to-gray-900">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
          Crea tu cuenta ✨
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
          Regístrate para empezar a usar MatchStudy.
        </p>

        <form
          onSubmit={handleRegister}
          className="bg-slate-800 p-10 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6"
        >
          <input
            type="text"
            placeholder="Nombre para mostrar"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
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
            minLength={6}
          />

          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="student">Estudiante</option>
            <option value="tutor">Tutor</option>
          </select>

          <input
            type="text"
            placeholder="Universidad (opcional)"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-transform transform hover:scale-105"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>

          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

          <p className="text-gray-400 text-sm">
            ¿Ya tienes cuenta? {" "}
            <a href="./login" className="text-purple-400 hover:underline">
              Inicia sesión
            </a>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}*/


"use client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ensureUserRow } from "@/lib/supabase/user";
function isValidEmail(s: string) {
  const email = s.trim().toLowerCase();
  // formato básico y sin espacios
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegistroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [userType, setUserType] = useState("student");
  const [university, setUniversity] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Normaliza/valida correo
    const emailClean = email.trim().toLowerCase();
    if (!isValidEmail(emailClean)) {
      setErrorMsg(`Correo inválido: "${email}"`);
      return;
    }
    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailClean,
        password,
        options: {
          // quítalo si no usas deep-link de confirmación:
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
          data: { displayName, userType, university },
        },
      });
      if (error) throw error;

      const authUser = data.user;
      if (!authUser) throw new Error("No se recibió el usuario de Auth");

      await ensureUserRow({
        //authId: authUser.id,
        email: emailClean,
        displayName,
        userType,
        university: university || null,
        photoUrl: null,
      });

      // si requieres verificación de correo, redirige a login:
      window.location.href = "/login";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);    
      //const msg = String(err?.message || "");
      // mensajes más amigables
      if (/already registered/i.test(msg)) {
        setErrorMsg("Ese correo ya está registrado. Intenta iniciar sesión.");
      } else if (/rate limit/i.test(msg)) {
        setErrorMsg("Demasiados intentos. Intenta de nuevo en unos minutos.");
      } else if (/invalid/i.test(msg) && /email|address/i.test(msg)) {
        setErrorMsg("Correo inválido. Verifica que no tenga espacios.");
      } else {
        setErrorMsg(msg || "Error al registrar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Header />
      <main className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-36 bg-gradient-to-br from-slate-950 to-gray-900">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
          Crea tu cuenta ✨
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
          Regístrate para empezar a usar MatchStudy.
        </p>

        <form
          onSubmit={handleRegister}
          className="bg-slate-800 p-10 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6"
        >
          <input
            type="text"
            placeholder="Nombre para mostrar"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
            autoComplete="name"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))} // ← sin espacios
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
            autoComplete="email"
            inputMode="email"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
            minLength={6}
            autoComplete="new-password"
          />

          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="student">Estudiante</option>
            <option value="tutor">Tutor</option>
          </select>

          <input
            type="text"
            placeholder="Universidad (opcional)"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            autoComplete="organization"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-transform transform hover:scale-105"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>

          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

          <p className="text-gray-400 text-sm">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-purple-400 hover:underline">
              Inicia sesión
            </a>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
