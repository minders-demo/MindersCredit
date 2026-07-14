import * as amplitude from "@amplitude/analytics-browser";
import { Revenue } from "@amplitude/analytics-browser";
import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser";
import { Experiment } from "@amplitude/experiment-js-client";
import { getInstallationId } from "../utils/installation";


const AMPLITUDE_API_KEY = (import.meta as any).env.VITE_AMPLITUDE_API_KEY || "cce51808526c9ce95082ce3d4ac97106";
const EXPERIMENT_DEPLOYMENT_KEY = (import.meta as any).env.VITE_AMPLITUDE_DEPLOYMENT_KEY || "client-wWrHjwtplLVZw6xY8DpVp7K3KdInyICP";

// 1. ANALYTICS
amplitude.init(AMPLITUDE_API_KEY, {
  autocapture: {
    pageViews: true,
    sessions: true,
    formInteractions: true,
    fileDownloads: true,
    elementInteractions: true,
    attribution: true,
  }
});

// 2. SESSION REPLAY
amplitude.add(sessionReplayPlugin({
  sampleRate: 1,
  forceSessionTracking: true,
  privacyConfig: { blockSelector: ["[data-amp-mask]", ".amp-block-replay"] },
}));

// 3. EXPERIMENT
const experiment = Experiment.initializeWithAmplitudeAnalytics(EXPERIMENT_DEPLOYMENT_KEY);
const startExperiment = async () => {
  try {
    await experiment.start();
    console.log("🧪 [Amplitude Experiment] Inició correctamente");
  } catch (e) {
    console.warn("⚠️ [Amplitude Experiment] Error al iniciar", e);
  }
};
startExperiment();

// Hash fallback for deterministic values
function hashCode(str: string) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}


export const driverService = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("amp_driver_" + key);
  },
  set(key: string, value: any): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("amp_driver_" + key, String(value));
  },
  getAll(): Record<string, any> {
    if (typeof window === "undefined") return {};
    const res: Record<string, any> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith("amp_driver_")) {
        const val = sessionStorage.getItem(k);
        let parsedVal: any = val;
        if (val === "true") parsedVal = true;
        if (val === "false") parsedVal = false;
        if (val && !isNaN(Number(val))) parsedVal = Number(val);
        res[k.replace("amp_driver_", "")] = parsedVal;
      }
    }
    return res;
  }
};

export const amplitudeService = {
  getPlatform(): "web" | "mobile_web" {
    const forced = localStorage.getItem("minders_demo_platform");
    if (forced === "web" || forced === "mobile_web") {
      return forced;
    }
    return typeof window !== "undefined" && window.innerWidth < 768 ? "mobile_web" : "web";
  },

  track(eventName: string, properties: Record<string, any> = {}) {
    const cleanedProps = { ...properties };
    const blacklistedKeys = [
      "rut", "user_rut", "document_number", "identification_number",
      "email", "phone", "full_name", "name", "nombre", "apellido",
      "lastName1", "lastName2", "first_name", "last_name", "nombres",
      "apellidos", "telefono", "celular", "serial", "numero_serie",
      "password", "clave", "direccion", "address"
    ];
    blacklistedKeys.forEach((key) => {
      delete cleanedProps[key];
    });

    let finalProps: Record<string, any> = {
      ...cleanedProps,
      app_platform: this.getPlatform(),
      installation_id: getInstallationId(),
    };

    const journeyPrefixes = [
      "simulador_", "hazte_socio_", "solicitud_tarjeta_", 
      "seguro_", "dap_", "apertura_vista_", "pago_online_", "portabilidad_"
    ];
    if (journeyPrefixes.some(prefix => eventName.startsWith(prefix))) {
      const drivers = driverService.getAll();
      finalProps = { ...finalProps, ...drivers };
            
      if (!eventName.startsWith("simulador_") && !eventName.startsWith("solicitud_tarjeta_")) {
          delete finalProps.experiment_variant;
      }
      
      if (!finalProps.monto_rango) delete finalProps.monto_rango;
      if (!finalProps.experiment_variant) delete finalProps.experiment_variant;
      if (!finalProps.ultimo_contenido_educa) delete finalProps.ultimo_contenido_educa;
      if (!finalProps.contenidos_educa_vistos) delete finalProps.contenidos_educa_vistos;
    }

    console.log(
      `📊 [Amplitude Event] %c${eventName}%c`,
      "color: #8799FB; font-weight: bold; font-family: monospace; font-size: 11px;",
      "color: inherit;",
      finalProps
    );

    if (typeof window !== "undefined") {
      const customEvt = new CustomEvent("amplitude_log", {
        detail: { eventName, properties: finalProps },
      });
      window.dispatchEvent(customEvt);
    }

    try {
      amplitude.track(eventName, finalProps);
    } catch (err) {
      console.warn("[Amplitude Service] Error al registrar evento:", err);
    }
  },

  trackRevenue(eventName: string, properties: Record<string, any>, productType: string, price: number, quantity: number = 1) {
    this.track(eventName, properties);
    try {
      const revenue = new Revenue()
        .setProductId(productType)
        .setPrice(price)
        .setQuantity(quantity)
        .setEventProperties(properties);
      amplitude.revenue(revenue);
      console.log(`💰 [Amplitude Revenue] Generado productType: ${productType}, price: ${price}, quantity: ${quantity}`);
    } catch (err) {
      console.warn("[Amplitude Service] Error al registrar revenue:", err);
    }
  },

  setUserId(customerId: string | null) {
    console.log(`👤 [Amplitude User ID]: ${customerId}`);
    try {
      amplitude.setUserId(customerId);
      // Tras login, re-fetch de variantes
      experiment.fetch().catch(e => console.warn("Error re-fetching experiment", e));
    } catch (err) {
      console.warn("[Amplitude Service] Error en setUserId:", err);
    }
  },

  identifyUser(profile: { customer_segment: string; es_socio?: boolean; platform?: string; region?: string }) {
    console.log(`🆔 [Amplitude Identify]:`, {
      customer_segment: profile.customer_segment,
      es_socio: profile.es_socio ?? true,
      app_platform_ultimo_login: profile.platform || this.getPlatform(),
      region: profile.region,
    });
    try {
      const identifyObj = new amplitude.Identify();
      identifyObj.set("customer_segment", profile.customer_segment);
      identifyObj.set("es_socio", profile.es_socio ?? true);
      identifyObj.set("app_platform_ultimo_login", profile.platform || this.getPlatform());
      if (profile.region) {
        identifyObj.set("region", profile.region);
      }
      amplitude.identify(identifyObj);
    } catch (err) {
      console.warn("[Amplitude Service] Error en identify:", err);
    }
  },

  setUserProperty(key: string, value: any, setOnce: boolean = false) {
    try {
      const identifyObj = new amplitude.Identify();
      if (setOnce) {
        identifyObj.setOnce(key, value);
      } else {
        identifyObj.set(key, value);
      }
      amplitude.identify(identifyObj);
      console.log(`🆔 [Amplitude Identify] ${setOnce ? 'setOnce' : 'set'} ${key}: ${value}`);
    } catch (err) {
      console.warn("[Amplitude Service] Error en setUserProperty:", err);
    }
  },

  appendUserProperty(key: string, value: any) {
    try {
      const identifyObj = new amplitude.Identify().append(key, value);
      amplitude.identify(identifyObj);
      console.log(`🆔 [Amplitude Identify] append ${key}: ${value}`);
    } catch (err) {
      console.warn("[Amplitude Service] Error en appendUserProperty:", err);
    }
  },

  addValueUserProperty(key: string, value: number) {
    try {
      const identifyObj = new amplitude.Identify().add(key, value);
      amplitude.identify(identifyObj);
      console.log(`🆔 [Amplitude Identify] add ${key}: ${value}`);
    } catch (err) {
      console.warn("[Amplitude Service] Error en addValueUserProperty:", err);
    }
  },

  appendProduct(product: string) {
    try {
      const identifyObj = new amplitude.Identify().append("productos_contratados", product);
      amplitude.identify(identifyObj);
      console.log(`🆔 [Amplitude Identify] appended product: ${product}`);
    } catch (err) {
      console.warn("[Amplitude Service] Error en appendProduct:", err);
    }
  },

  incrementJourneysCompleted() {
    try {
      const identifyObj = new amplitude.Identify().add("journeys_completados", 1);
      amplitude.identify(identifyObj);
      console.log(`🆔 [Amplitude Identify] incremented journeys_completados`);
    } catch (err) {
      console.warn("[Amplitude Service] Error en incrementJourneysCompleted:", err);
    }
  },

  clearUserId() {
    console.log("👤 [Amplitude Reset] Sesión desvinculada del usuario.");
    try {
      amplitude.reset();
      // Tras logout, re-fetch de variantes con la nueva identidad (anónima)
      experiment.fetch().catch(e => console.warn("Error re-fetching experiment", e));
    } catch (err) {
      console.warn("[Amplitude Service] Error en reset:", err);
    }
  },
  
  getVariant(flagKey: string) {
    try {
      const variant = experiment.variant(flagKey);
      if (variant && variant.value) {
        return variant;
      }
    } catch (e) {
      console.warn("[Amplitude Service] Error en getVariant:", e);
    }
    
    // Fallback determinista
    let fallbackId = amplitude.getUserId();
    if (!fallbackId) {
      const sessionObj = localStorage.getItem("minders_demo_auth_session");
      if (sessionObj) {
         try {
             fallbackId = JSON.parse(sessionObj).customer_id;
         } catch(e) {}
      }
    }
    if (!fallbackId) {
        fallbackId = "anonymous";
    }
    
    const hash = Math.abs(hashCode(fallbackId));
    if (flagKey === "hero-cta-variant") {
      return { value: hash % 2 === 0 ? "default" : "bold" };
    } else if (flagKey === "simulador-progress-style") {
      return { value: hash % 2 === 0 ? "steps" : "continuous" };
    }
    return { value: "control" };
  }
};
