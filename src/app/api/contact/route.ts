import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = process.env.CONTACT_EMAIL ?? "femmesetdroit.udem@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "Contact Site <onboarding@resend.dev>";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(req: Request) {
  if (!resend) {
    return NextResponse.json(
      { error: "Envoi d'email non configuré (RESEND_API_KEY manquant)." },
      { status: 503 }
    );
  }

  let body: { firstName?: string; lastName?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { firstName = "", lastName = "", email = "", message = "" } = body;
  const name = [firstName, lastName].filter(Boolean).join(" ").trim() || "Visiteur";

  if (!email || !message.trim()) {
    return NextResponse.json(
      { error: "Courriel et message sont requis." },
      { status: 400 }
    );
  }

  const subject = `Contact depuis le site – ${name}`;
  const text = `${message.trim()}\n\n--\n${name}\n${email}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: error.message ?? "Échec de l'envoi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e) {
    console.error("Contact send error:", e);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi." },
      { status: 500 }
    );
  }
}
