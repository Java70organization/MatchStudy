import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usar las claves del servidor para bypasear RLS si es necesario
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombres, apellidos, email, telefono, universidad, urlFoto } = body;

    // Validar datos requeridos
    if (!nombres || !apellidos || !email) {
      return NextResponse.json(
        { error: "Nombres, apellidos y email son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el usuario esté autenticado
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const insertData = {
      nombres,
      apellidos,
      email,
      telefono: telefono || null,
      universidad: universidad || null,
      urlFoto: urlFoto || null,
    };

    console.log("Insertando en tabla usuarios:", insertData);

    const { data, error } = await supabase
      .from("usuarios")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error en API create-user-profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error general en API create-user-profile:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
