"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { checkUserProfile, DBUser } from "@/lib/supabase/user";
import ProfilePhotoUploader from "./ProfilePhotoUploader";

export default function PerfilPage() {
  const [userProfile, setUserProfile] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    universidad: "",
    displayName: "",
  });
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Verificar autenticación
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("No hay usuario autenticado");
          window.location.href = "/auth/login";
          return;
        }

        setUserEmail(user.email || "");

        // Buscar perfil del usuario en la tabla usuarios
        if (user.email) {
          const profile = await checkUserProfile(user.email);

          if (profile) {
            setUserProfile(profile);
            // Derivar displayName desde metadata de auth o desde nombres/apellidos
            const authDisplay =
              (user.user_metadata?.full_name as string | undefined) ||
              `${profile.nombres || ""} ${profile.apellidos || ""}`.trim();
            setForm({
              nombres: profile.nombres || "",
              apellidos: profile.apellidos || "",
              telefono: profile.telefono || "",
              universidad: profile.universidad || "",
              displayName: authDisplay || "",
            });
            if (profile.urlFoto) {
              try {
                const res = await fetch("/api/profile-photo/signed", {
                  cache: "no-store",
                  credentials: "include",
                });
                const data = await res.json();
                setSignedUrl(res.ok ? data.url ?? null : null);
              } catch {
                setSignedUrl(null);
              }
            } else {
              setSignedUrl(null);
            }
          } else {
            setError(
              "No se encontró el perfil del usuario. Completa tu perfil primero."
            );
          }
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  if (loading) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold">Perfil</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-slate-300">Cargando perfil...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold">Perfil</h1>
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
          <p className="text-red-400">{error}</p>
          {error.includes("Completa tu perfil") && (
            <button
              onClick={() => (window.location.href = "/auth/completar-perfil")}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Completar Perfil
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Mi Perfil</h1>
          <p className="text-slate-300 mt-2">
            Información personal y académica (Solo lectura)
          </p>
        </div>
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg px-4 py-2">
          <span className="text-green-400 text-sm">Completo</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Personal */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Información Personal</h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
              Solo lectura
            </span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nombres
                </label>
                <input
                  type="text"
                  value={form.nombres}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombres: e.target.value }))
                  }
                  readOnly={!editing}
                  className={`w-full px-3 py-2 border rounded-lg text-white ${
                    editing
                      ? "bg-slate-800/50 border-slate-600"
                      : "bg-slate-800/50 border-slate-700/50 cursor-not-allowed"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={form.apellidos}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, apellidos: e.target.value }))
                  }
                  readOnly={!editing}
                  className={`w-full px-3 py-2 border rounded-lg text-white ${
                    editing
                      ? "bg-slate-800/50 border-slate-600"
                      : "bg-slate-800/50 border-slate-700/50 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>
            {/* Nombre a mostrar en MatchStudy */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nombre a mostrar en MatchStudy
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                readOnly={!editing}
                placeholder="Nombre a mostrar en MatchStudy"
                className={`w-full px-3 py-2 border rounded-lg text-white ${
                  editing
                    ? "bg-slate-800/50 border-slate-600"
                    : "bg-slate-800/50 border-slate-700/50 cursor-not-allowed"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={userProfile?.email || userEmail}
                readOnly
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) =>
                  setForm((f) => ({ ...f, telefono: e.target.value }))
                }
                readOnly={!editing}
                placeholder="No especificado"
                className={`w-full px-3 py-2 border rounded-lg text-white ${
                  editing
                    ? "bg-slate-800/50 border-slate-600"
                    : "bg-slate-800/50 border-slate-700/50 cursor-not-allowed"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Universidad
              </label>
              <input
                type="text"
                value={form.universidad}
                onChange={(e) =>
                  setForm((f) => ({ ...f, universidad: e.target.value }))
                }
                readOnly={!editing}
                placeholder="No especificada"
                className={`w-full px-3 py-2 border rounded-lg text-white ${
                  editing
                    ? "bg-slate-800/50 border-slate-600"
                    : "bg-slate-800/50 border-slate-700/50 cursor-not-allowed"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Fecha de registro
              </label>
              <input
                type="text"
                value={
                  userProfile?.createdAt
                    ? new Date(userProfile.createdAt).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "No disponible"
                }
                readOnly
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white cursor-not-allowed"
              />
            </div>

            {/* Botones de edición/guardado */}
            <div className="pt-2 flex gap-3">
              {!editing ? (
                <button
                  onClick={() => {
                    setSaveMsg(null);
                    setEditing(true);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Editar información
                </button>
              ) : (
                <>
                  <button
                    disabled={saving}
                    onClick={async () => {
                      try {
                        setSaving(true);
                        setSaveMsg(null);
                        const res = await fetch("/api/update-user-profile", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({
                            nombres: form.nombres,
                            apellidos: form.apellidos,
                            telefono: form.telefono,
                            universidad: form.universidad,
                            displayName: form.displayName,
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok)
                          throw new Error(data?.error || "Error al guardar");
                        setUserProfile((prev) =>
                          prev
                            ? {
                                ...prev,
                                nombres: data.data?.nombres ?? form.nombres,
                                apellidos:
                                  data.data?.apellidos ?? form.apellidos,
                                telefono: data.data?.telefono ?? form.telefono,
                                universidad:
                                  data.data?.universidad ?? form.universidad,
                              }
                            : prev
                        );
                        setSaveMsg("Cambios guardados correctamente");
                        setEditing(false);
                        // Notificar a Sidebar/Topbar para refrescar el display name sin recargar
                        if (typeof window !== "undefined" && form.displayName.trim()) {
                          window.dispatchEvent(
                            new CustomEvent("display-name-updated", {
                              detail: { full_name: form.displayName.trim() },
                            }),
                          );
                        }
                      } catch (e) {
                        setSaveMsg(
                          e instanceof Error ? e.message : "Error al guardar"
                        );
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="bg-green-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => {
                      setEditing(false);
                      setSaveMsg(null);
                        if (userProfile) {
                          const fallbackDisplay = `${userProfile.nombres || ""} ${userProfile.apellidos || ""}`.trim();
                          setForm({
                            nombres: userProfile.nombres || "",
                            apellidos: userProfile.apellidos || "",
                            telefono: userProfile.telefono || "",
                            universidad: userProfile.universidad || "",
                            displayName: fallbackDisplay,
                          });
                        }
                    }}
                    className="bg-slate-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>

            {saveMsg && (
              <p
                className={`text-sm ${
                  saveMsg.includes("guardados")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {saveMsg}
              </p>
            )}
          </div>
        </div>

        {/* Información Adicional */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Información del Perfil</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">ID de Usuario</span>
              <span className="text-sm font-mono text-purple-400">
                #{userProfile?.id}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Estado del Perfil</span>
              <span className="text-sm font-semibold text-green-400">
                Completo
              </span>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300 block mb-2">Foto de Perfil</span>
              {signedUrl ? (
                <img
                  src={signedUrl}
                  alt="Foto de perfil"
                  className="w-20 h-20 rounded-full object-cover border border-slate-600"
                />
              ) : (
                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-slate-400">
                    {userProfile?.nombres?.charAt(0)}
                    {userProfile?.apellidos?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="mt-4">
                <ProfilePhotoUploader
                  onUploaded={(r) => {
                    setUserProfile((prev) =>
                      prev ? { ...prev, urlFoto: r.path } : prev
                    );
                    setSignedUrl(r.signedUrl ?? null);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Se eliminaron botones de edición de esta tarjeta */}
        </div>
      </div>
    </section>
  );
}
