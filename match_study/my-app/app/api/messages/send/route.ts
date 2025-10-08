import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const {
      to,
      message,
      subject = "Mensaje de MatchStudy",
      fromName = "MatchStudy",
      fromEmail,
      fromFirstName,
      fromLastName,
    } = await req.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: "Campos requeridos: to, message" },
        { status: 400 },
      );
    }

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;

    if (!EMAIL_USER || !EMAIL_PASS) {
      // Modo desarrollo: simular envío
      console.log("[DEV] Simulando envío de correo", { to, subject, message });
      return NextResponse.json({ ok: true, dev: true }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color:#8b5cf6; margin-bottom: 12px;">${fromName}</h2>
          ${fromEmail || fromFirstName || fromLastName ? `
          <div style="background:#eef2ff; padding:10px; border-left:4px solid #8b5cf6; margin-bottom:12px;">
            <div style="color:#3730a3; font-size:13px;">Remitente</div>
            <div style="color:#1f2937; font-size:14px; font-weight:600;">
              ${(fromFirstName || "")} ${(fromLastName || "")} ${fromEmail ? `&lt;${fromEmail}&gt;` : ''}
            </div>
          </div>` : ''}
          <div style="background:#f8fafc; padding:16px; border-radius:8px;">
            <p style="white-space: pre-wrap; line-height:1.6; color:#334155;">${message}</p>
          </div>
          <p style="color:#64748b; font-size:12px; margin-top:16px;">Enviado desde MatchStudy – ${new Date().toLocaleString("es-ES")}</p>
        </div>
      `,
      replyTo: fromEmail || EMAIL_USER,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    console.error("Error enviando correo:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
