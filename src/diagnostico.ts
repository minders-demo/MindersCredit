// Diagnóstico de conexión con Amplitude.
// Solo se activa con ?diag=1, por ejemplo:
// https://minders-demo.github.io/MindersCredit/?diag=1

const API_KEY = (
  (import.meta as any).env.VITE_AMPLITUDE_API_KEY ||
  "714214e5842a299f3fa47e23db5fe728"
).trim();

const SERVER_ZONE = String(
  (import.meta as any).env.VITE_AMPLITUDE_SERVER_ZONE || "US"
).toUpperCase();

const INGESTION_URL =
  SERVER_ZONE === "EU"
    ? "https://api.eu.amplitude.com/2/httpapi"
    : "https://api2.amplitude.com/2/httpapi";

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function maskedKey(key: string): string {
  if (key.length < 12) return key;
  return `${key.slice(0, 6)}…${key.slice(-6)}`;
}

function panel(html: string, color: string) {
  let box = document.getElementById("amp-diag");

  if (!box) {
    box = document.createElement("div");
    box.id = "amp-diag";
    box.style.cssText =
      "position:fixed;inset:0;z-index:99999;background:#1C1F24;color:#F2F2F2;" +
      "font-family:monospace;padding:40px;overflow:auto;font-size:15px;line-height:1.7;";
    document.body.appendChild(box);
  }

  box.innerHTML =
    `<h1 style="font-size:22px;margin-bottom:20px;color:${color}">` +
    `DIAGNÓSTICO AMPLITUDE — MindersCredit</h1>` +
    html +
    `<p style="margin-top:30px;opacity:.6">Quita <b>?diag=1</b> de la URL para cerrar esta pantalla.</p>`;
}

export async function runAmplitudeDiag() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("diag") !== "1") return;

  panel(
    `<p>Probando la API Key <b>${maskedKey(API_KEY)}</b></p>` +
      `<p>Región configurada: <b>${escapeHtml(SERVER_ZONE)}</b></p>` +
      `<p>Endpoint: <code>${escapeHtml(INGESTION_URL)}</code></p>` +
      `<p>Enviando evento de prueba…</p>`,
    "#A4F1FB"
  );

  let swInfo = "Ninguno registrado ✅";

  try {
    const registrations =
      await navigator.serviceWorker.getRegistrations();

    if (registrations.length > 0) {
      swInfo =
        registrations
          .map(
            (registration) =>
              `⚠️ Service worker activo con scope: <b>${escapeHtml(
                registration.scope
              )}</b>`
          )
          .join("<br>") +
        `<br><button id="amp-diag-sw" style="margin-top:8px;padding:8px 16px;border-radius:99px;border:0;cursor:pointer;background:#FC7E7F;color:#1C1F24;font-weight:bold">Eliminar service workers y recargar</button>`;
    }
  } catch {
    swInfo =
      "El navegador no permitió consultar los service workers.";
  }

  const timestamp = Date.now();
  const eventType = `diagnostico_conexion_${timestamp}`;

  const body = {
    api_key: API_KEY,
    events: [
      {
        user_id: "diagnostico_minderscredit",
        device_id: "diag_device_minderscredit",
        event_type: eventType,
        time: timestamp,
        insert_id: `diag_${timestamp}`,
        event_properties: {
          origen: "herramienta_diagnostico",
          app: "MindersCredit",
          server_zone: SERVER_ZONE,
        },
      },
    ],
  };

  let verdict = "";
  let color = "#A4F1FB";

  try {
    const response = await fetch(INGESTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    const safeResponse = escapeHtml(
      responseText || "Sin cuerpo de respuesta"
    );

    if (response.ok) {
      color = "#8AE68A";
      verdict =
        `<b style="color:#8AE68A">✅ Amplitude aceptó el evento.</b><br><br>` +
        `Estado HTTP: <b>${response.status}</b><br>` +
        `Evento: <b>${escapeHtml(eventType)}</b><br>` +
        `API Key usada: <b>${maskedKey(API_KEY)}</b><br>` +
        `Respuesta: <code>${safeResponse}</code><br><br>` +
        `Busca ese nombre exacto en Amplitude → Live Events del proyecto cuya API Key es ` +
        `<b>${maskedKey(API_KEY)}</b>.`;
    } else {
      color = "#FC7E7F";
      verdict =
        `<b style="color:#FC7E7F">❌ Amplitude rechazó el evento.</b><br><br>` +
        `Estado HTTP: <b>${response.status}</b><br>` +
        `API Key usada: <b>${maskedKey(API_KEY)}</b><br>` +
        `Respuesta: <code>${safeResponse}</code><br><br>` +
        `Revisa que sea la API Key pública del proyecto, no una Secret Key, y que la región ` +
        `US/EU coincida con tu organización.`;
    }
  } catch (error) {
    color = "#FC7E7F";
    verdict =
      `<b style="color:#FC7E7F">❌ La petición no pudo completarse.</b><br><br>` +
      `Error: <code>${escapeHtml(error)}</code><br><br>` +
      `Prueba en incógnito sin extensiones y revisa la pestaña Network filtrando por ` +
      `<b>amplitude</b>.`;
  }

  panel(
    `<p>${verdict}</p>` +
      `<h2 style="margin-top:26px;font-size:16px;color:#8799FB">Service workers en ${escapeHtml(
        location.hostname
      )}:</h2>` +
      `<p>${swInfo}</p>`,
    color
  );

  const button = document.getElementById("amp-diag-sw");

  if (button) {
    button.addEventListener("click", async () => {
      const registrations =
        await navigator.serviceWorker.getRegistrations();

      await Promise.all(
        registrations.map((registration) =>
          registration.unregister()
        )
      );

      window.location.reload();
    });
  }
}
