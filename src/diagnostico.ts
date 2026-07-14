// Diagnóstico de conexión con Amplitude.
// Se activa SOLO si la URL incluye ?diag=1 (ej: https://minders-demo.github.io/MindersCredit/?diag=1)
// Envía un evento de prueba directo a la HTTP API y muestra el veredicto en pantalla.

const API_KEY = "cce51808526c9ce95082ce3d4ac97106";

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
    `<h1 style="font-size:22px;margin-bottom:20px;color:${color}">DIAGNÓSTICO AMPLITUDE — MindersCredit</h1>` +
    html +
    `<p style="margin-top:30px;opacity:.6">Cierra esta pantalla quitando ?diag=1 de la URL.</p>`;
}

export async function runAmplitudeDiag() {
  if (!window.location.search.includes("diag=1")) return;

  panel("Enviando evento de prueba a api2.amplitude.com…", "#A4F1FB");

  // 1) Revisar service workers registrados en este dominio
  let swInfo = "Ninguno registrado ✅";
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length > 0) {
      swInfo =
        regs.map((r) => `⚠️ Service worker activo con scope: <b>${r.scope}</b>`).join("<br>") +
        `<br><button id="amp-diag-sw" style="margin-top:8px;padding:8px 16px;border-radius:99px;border:0;cursor:pointer;background:#FC7E7F;color:#1C1F24;font-weight:bold">Eliminar service workers y recargar</button>`;
    }
  } catch { /* sin soporte SW */ }

  // 2) Enviar evento de prueba directo a la HTTP API de Amplitude
  const body = {
    api_key: API_KEY,
    events: [{
      user_id: "diagnostico_minderscredit",
      device_id: "diag_device_001",
      event_type: "diagnostico_conexion",
      time: Date.now(),
      insert_id: "diag_" + Date.now(),
      event_properties: { origen: "herramienta_diagnostico" },
    }],
  };

  let veredicto = "";
  let color = "#A4F1FB";
  try {
    const res = await fetch("https://api2.amplitude.com/2/httpapi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const texto = await res.text();

    if (res.status === 200) {
      color = "#8AE68A";
      veredicto =
        `<b style="color:#8AE68A">✅ HTTP 200 — El evento SÍ llegó a Amplitude.</b><br><br>` +
        `Tu navegador y tu red NO están bloqueando nada, y la API key es válida.<br>` +
        `👉 Ve a Amplitude → <b>Live Events</b> y busca el evento <b>diagnostico_conexion</b>.<br>` +
        `Si no lo ves, estás mirando el <b>proyecto equivocado</b>: cambia el selector de proyecto ` +
        `(arriba a la izquierda) hasta encontrar el proyecto dueño de la key que termina en <b>…97106</b> ` +
        `(Settings → Projects → compara la API Key de cada proyecto).`;
    } else if (res.status === 400) {
      color = "#FC7E7F";
      veredicto =
        `<b style="color:#FC7E7F">❌ HTTP 400 — Amplitude rechazó el evento.</b><br><br>` +
        `Respuesta del servidor: <code>${texto}</code><br>` +
        `Si dice "invalid_api_key", la key no corresponde a ningún proyecto activo: ` +
        `ve a Amplitude → Settings → Projects → tu proyecto → copia la API Key correcta.`;
    } else {
      color = "#FC7E7F";
      veredicto = `<b>⚠️ HTTP ${res.status}</b> — Respuesta inesperada: <code>${texto}</code>`;
    }
  } catch (err: any) {
    color = "#FC7E7F";
    veredicto =
      `<b style="color:#FC7E7F">❌ La petición NUNCA salió del navegador.</b><br><br>` +
      `Error: <code>${String(err)}</code><br><br>` +
      `Esto es un <b>bloqueo local</b>: un bloqueador de anuncios/privacidad, o un service worker ` +
      `interceptando las peticiones de este dominio (revisa la sección de abajo).<br>` +
      `👉 Prueba: ventana de incógnito con extensiones desactivadas, o elimina los service workers con el botón de abajo.`;
  }

  panel(
    `<p>${veredicto}</p>` +
    `<h2 style="margin-top:26px;font-size:16px;color:#8799FB">Service workers en ${location.hostname}:</h2>` +
    `<p>${swInfo}</p>`,
    color
  );

  const btn = document.getElementById("amp-diag-sw");
  if (btn) {
    btn.addEventListener("click", async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      alert("Service workers eliminados. La página se recargará.");
      window.location.reload();
    });
  }
}
