import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface DiagnosticPayload {
  reclaimWeeklyHours?: number;
  reclaimAnnualHours?: number;
  annualSavings?: number;
  fteEquivalent?: number;
  leadScore?: number;
  temperature?: string;
  priorities?: string[]; // noms des employés IA prioritaires
}

interface IncomingBody {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  sector?: string;
  teamSize?: string;
  timeSinks?: string;
  departments?: string;
  hoursPerWeek?: number;
  hourlyRate?: number;
  aiLevel?: string;
  aiTool?: string;
  consent?: boolean;
  diagnostic?: DiagnosticPayload;
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function POST(req: Request) {
  let body: IncomingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    name,
    company,
    email,
    phone,
    sector,
    teamSize,
    timeSinks,
    departments,
    hoursPerWeek,
    hourlyRate,
    aiLevel,
    aiTool,
    consent,
    diagnostic,
  } = body;

  if (!name || !email || !consent) {
    return NextResponse.json(
      { stored: false, error: "Nom, courriel et consentement requis." },
      { status: 400 }
    );
  }

  const { firstName, lastName } = splitName(name);

  // Payload aplati pour mapping CRM direct + données brutes en complément.
  const payload = {
    source: "diagnostic-lecloud",
    interest: "diagnostic-ia",
    receivedAt: new Date().toISOString(),

    // Contact
    firstName,
    lastName,
    fullName: name,
    company: company ?? sector ?? "",
    email,
    phone: phone ?? "",

    // Qualification
    sector: sector ?? "",
    teamSize: teamSize ?? "",
    timeSinks: timeSinks ?? "",
    departments: departments ?? "",
    hoursPerWeek: hoursPerWeek ?? null,
    hourlyRate: hourlyRate ?? null,
    aiLevel: aiLevel ?? "",
    aiTool: aiTool ?? "",

    // Résultat du diagnostic (aplati pour le CRM)
    reclaimWeeklyHours: diagnostic?.reclaimWeeklyHours ?? null,
    reclaimAnnualHours: diagnostic?.reclaimAnnualHours ?? null,
    annualSavings: diagnostic?.annualSavings ?? null,
    fteEquivalent: diagnostic?.fteEquivalent ?? null,
    leadScore: diagnostic?.leadScore ?? null,
    temperature: diagnostic?.temperature ?? "",
    priorities: diagnostic?.priorities?.join(", ") ?? "",

    // Données brutes
    raw: body,
  };

  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  const webhookSecret = process.env.CRM_WEBHOOK_SECRET;

  if (webhookUrl) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (webhookSecret) headers["X-Webhook-Secret"] = webhookSecret;
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) console.error("[lead] Webhook returned", res.status);
    } catch (err) {
      console.error("[lead] Webhook failed", err);
    }
  } else {
    console.log("[lead] Stored (no webhook configured):", JSON.stringify(payload));
  }

  return NextResponse.json({ stored: true });
}
