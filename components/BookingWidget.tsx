"use client";

import { useEffect } from "react";
import { BOOKING_ID, BOOKING_URL } from "@/lib/site";

const SCRIPT_ID = "leadconnector-embed";
const SCRIPT_SRC = "https://link.msgsndr.com/js/form_embed.js";

/**
 * Calendrier de réservation LeadConnector (GoHighLevel) intégré en iframe.
 * form_embed.js redimensionne l'iframe dont l'id correspond au slug du booking.
 */
export default function BookingWidget() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
      <iframe
        src={BOOKING_URL}
        id={BOOKING_ID}
        title="Réserver un appel gratuit"
        scrolling="no"
        className="block w-full"
        style={{ minHeight: 720, border: "none" }}
      />
    </div>
  );
}
