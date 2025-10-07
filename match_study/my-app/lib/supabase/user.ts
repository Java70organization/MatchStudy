// Funciones para manejo de usuarios en tabla personalizada

export type DBUser = {
  id: number;
  createdAt: string; // Supabase maneja automáticamente con now()
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  universidad: string | null;
  urlFoto: string | null;
};

/**
 * Verifica si el usuario ya tiene un perfil en la tabla usuarios por email
 */
export async function checkUserProfile(email: string): Promise<DBUser | null> {
  const { supabase } = await import("@/lib/supabase/client");

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error verificando perfil de usuario:", error.message);
      return null;
    }

    return data as DBUser | null;
  } catch (error) {
    console.error("Error general en checkUserProfile:", error);
    return null;
  }
}

/**
 * Crea un nuevo perfil de usuario en la tabla usuarios
 */
export async function createUserProfile(params: {
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string | null;
  universidad?: string | null;
  urlFoto?: string | null;
}): Promise<DBUser | null> {
  const { supabase } = await import("@/lib/supabase/client");

  try {
    // Verificar que hay un usuario autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(
        "No hay usuario autenticado para crear perfil:",
        authError?.message
      );
      return null;
    }

    console.log("Creando perfil para usuario autenticado:", user.email);

    // Verificar que el email coincida con el usuario autenticado
    if (user.email !== params.email) {
      console.error("El email no coincide con el usuario autenticado");
      console.error(
        "Usuario auth:",
        user.email,
        "Email enviado:",
        params.email
      );
      return null;
    }

    const insertData = {
      nombres: params.nombres,
      apellidos: params.apellidos,
      email: params.email,
      telefono: params.telefono ?? null,
      universidad: params.universidad ?? null,
      urlFoto: params.urlFoto ?? null,
    };

    console.log("Datos a insertar:", insertData);
    console.log("Token de usuario:", await supabase.auth.getSession());

    const { data, error } = await supabase
      .from("usuarios")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creando perfil de usuario:", error.message);
      console.error("Código de error:", error.code);
      console.error("Detalles del error:", error.details);
      console.error("Hint:", error.hint);
      console.error("Datos enviados:", insertData);

      // Información adicional sobre RLS
      if (error.message.includes("row-level security")) {
        console.error(
          "PROBLEMA RLS: Verifica las políticas de la tabla usuarios en Supabase"
        );
        console.error("Usuario actual:", user.id, user.email);
      }

      return null;
    }

    console.log("Perfil creado exitosamente:", data);
    return data as DBUser;
  } catch (error) {
    console.error("Error general en createUserProfile:", error);
    return null;
  }
}

/**
 * Función alternativa para crear perfil usando el cliente del servidor
 * Útil si hay problemas con RLS en el cliente
 */
export async function createUserProfileServerSide(params: {
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string | null;
  universidad?: string | null;
  urlFoto?: string | null;
}): Promise<{ success: boolean; data?: DBUser; error?: string }> {
  try {
    const response = await fetch("/api/create-user-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || "Error desconocido" };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error en createUserProfileServerSide:", error);
    return { success: false, error: "Error de conexión" };
  }
}
