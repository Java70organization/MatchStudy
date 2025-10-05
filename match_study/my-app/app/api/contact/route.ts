import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validar que todos los campos estén presentes
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si las variables de entorno están configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(
        "Variables de entorno no configuradas. Simulando envío de email..."
      );
      console.log("Formulario recibido:", { name, email, subject, message });

      // Para desarrollo: simular envío exitoso sin email real
      return NextResponse.json(
        {
          message: "Formulario recibido correctamente (modo desarrollo)",
          data: { name, email, subject, message },
        },
        { status: 200 }
      );
    }

    // Configurar el transportador de nodemailer solo si las variables están configuradas
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configurar el contenido del email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "soportematchstudy@gmail.com",
      subject: `[MatchStudy] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #8b5cf6;">Nuevo mensaje de contacto - MatchStudy</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #334155;">Información del contacto:</h3>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #334155;">Mensaje:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Este mensaje fue enviado desde el formulario de contacto de MatchStudy.</p>
            <p>Fecha: ${new Date().toLocaleString("es-ES", {
              timeZone: "America/Mexico_City",
            })}</p>
          </div>
        </div>
      `,
      // Email de respuesta automática al usuario
      replyTo: email,
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    // Enviar confirmación al usuario
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirmación de mensaje recibido - MatchStudy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6;">MatchStudy</h1>
          </div>
          
          <h2 style="color: #334155;">¡Hola ${name}!</h2>
          
          <p style="line-height: 1.6; color: #475569;">
            Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.
          </p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #334155;">Resumen de tu mensaje:</h3>
            <p><strong>Asunto:</strong> ${subject}</p>
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #64748b;">${message}</p>
          </div>
          
          <p style="line-height: 1.6; color: #475569;">
            Nuestro equipo de soporte revisará tu mensaje y te responderá dentro de las próximas 24-48 horas.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; text-align: center;">
            <p>Este es un mensaje automático, por favor no respondas a este email.</p>
            <p>© ${new Date().getFullYear()} MatchStudy. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(confirmationMailOptions);

    return NextResponse.json(
      { message: "Email enviado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error enviando email:", error);

    // Proporcionar más información del error para debugging
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Detalles del error:", errorMessage);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
