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
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState("student");
  const [university, setUniversity] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

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

    if (!displayName.trim()) {
      setErrorMsg("El nombre a mostrar es requerido.");
      return;
    }

    if (!university.trim()) {
      setErrorMsg("La universidad es requerida.");
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
          data: {
            full_name: displayName,
            phone: phone,
            user_type: userType,
            university: university,
          },
        },
      });
      if (error) throw error;

      const authUser = data.user;

      // Si Supabase requiere confirmación por email
      if (authUser && !authUser.email_confirmed_at) {
        setSuccessMsg(
          `¡Registro exitoso! Se ha enviado un correo de verificación a ${emailClean}. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación antes de iniciar sesión.`
        );

        // Intentar crear el perfil de usuario, pero no bloquear si falla
        try {
          await ensureUserRow({
            email: emailClean,
            displayName,
            phone: phone,
            userType,
            university: university,
            photoUrl: null,
          });
        } catch (profileError) {
          console.log(
            "Error al crear perfil, se intentará nuevamente al confirmar email:",
            profileError
          );
        }

        // Redirigir después de 5 segundos para que el usuario lea el mensaje
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 5000);
      } else if (authUser) {
        // Usuario confirmado inmediatamente (email confirmation deshabilitado)
        await ensureUserRow({
          email: emailClean,
          displayName,
          phone: phone,
          userType,
          university: university,
          photoUrl: null,
        });

        setSuccessMsg("¡Registro exitoso! Redirigiendo al login...");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      } else {
        throw new Error("No se recibió el usuario de Auth");
      }
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

          <input
            type="tel"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            autoComplete="tel"
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
            placeholder="Universidad"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
            autoComplete="organization"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-transform transform hover:scale-105"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>

          {errorMsg && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
              <p className="text-green-400 text-sm">{successMsg}</p>
            </div>
          )}

          <p className="text-gray-400 text-sm">
            ¿Ya tienes cuenta?{" "}
            <a href="/auth/login" className="text-purple-400 hover:underline">
              Inicia sesión
            </a>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
