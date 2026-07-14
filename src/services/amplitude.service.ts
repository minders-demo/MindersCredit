import * as amplitude from "@amplitude/analytics-browser";
import { Revenue } from "@amplitude/analytics-browser";
import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser";
import { Experiment } from "@amplitude/experiment-js-client";
import { getInstallationId } from "../utils/installation";

const AMPLITUDE_API_KEY = String(
  (import.meta as any).env.VITE_AMPLITUDE_API_KEY ||
    "714214e5842a299f3fa47e23db5fe728"
).trim();

const EXPERIMENT_DEPLOYMENT_KEY = String(
  (import.meta as any).env.VITE_AMPLITUDE_DEPLOYMENT_KEY ||
    "client-wWrHjwtplLVZw6xY8DpVp7K3KdInyICP"
).trim();

const AMPLITUDE_SERVER_ZONE =
  String(
    (import.meta as any).env.VITE_AMPLITUDE_SERVER_ZONE || "US"
  ).toUpperCase() === "EU"
    ? "EU"
    : "US";

// 1. SESSION REPLAY
const replayPlugin = sessionReplayPlugin({
  sampleRate: 1,
  forceSessionTracking: true,
  privacyConfig: {
    blockSelector: [
      "[data-amp-mask]",
      ".amp-block-replay",
    ],
  },
});

amplitude.add(replayPlugin);

// 2. ANALYTICS
const analyticsInitialization = amplitude.init(
  AMPLITUDE_API_KEY,
  {
    serverZone: AMPLITUDE_SERVER_ZONE,
    flushIntervalMillis: 1000,
    flushQueueSize: 10,
    logLevel: amplitude.Types.LogLevel.Warn,
    autocapture: {
      pageViews: true,
      sessions: true,
      formInteractions: true,
      fileDownloads: true,
      elementInteractions: true,
      attribution: true,
    },
  }
);

analyticsInitialization.promise
  .then(() => {
    console.info(
      `✅ [Amplitude Analytics] Inicializado con API Key ${AMPLITUDE_API_KEY.slice(
        0,
        6
      )}…${AMPLITUDE_API_KEY.slice(
        -6
      )} (${AMPLITUDE_SERVER_ZONE})`
    );
  })
  .catch((error) => {
    console.error(
      "❌ [Amplitude Analytics] Falló la inicialización",
      error
    );
  });

// 3. EXPERIMENT
const experiment =
  Experiment.initializeWithAmplitudeAnalytics(
    EXPERIMENT_DEPLOYMENT_KEY
  );

const startExperiment = async () => {
  try {
    await analyticsInitialization.promise;
    await experiment.start();

    console.info(
      "🧪 [Amplitude Experiment] Inició correctamente"
    );
  } catch (error) {
    console.warn(
      "⚠️ [Amplitude Experiment] Error al iniciar",
      error
    );
  }
};

void startExperiment();

function hashCode(str: string) {
  let hash = 0;

  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }

  return hash;
}

export const driverService = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;

    return sessionStorage.getItem(
      "amp_driver_" + key
    );
  },

  set(key: string, value: any): void {
    if (typeof window === "undefined") return;

    sessionStorage.setItem(
      "amp_driver_" + key,
      String(value)
    );
  },

  getAll(): Record<string, any> {
    if (typeof window === "undefined") return {};

    const result: Record<string, any> = {};

    for (
      let index = 0;
      index < sessionStorage.length;
      index++
    ) {
      const key = sessionStorage.key(index);

      if (key && key.startsWith("amp_driver_")) {
        const value = sessionStorage.getItem(key);
        let parsedValue: any = value;

        if (value === "true") parsedValue = true;
        if (value === "false") parsedValue = false;

        if (value && !isNaN(Number(value))) {
          parsedValue = Number(value);
        }

        result[
          key.replace("amp_driver_", "")
        ] = parsedValue;
      }
    }

    return result;
  },
};

export const amplitudeService = {
  getPlatform(): "web" | "mobile_web" {
    const forced = localStorage.getItem(
      "minders_demo_platform"
    );

    if (
      forced === "web" ||
      forced === "mobile_web"
    ) {
      return forced;
    }

    return typeof window !== "undefined" &&
      window.innerWidth < 768
      ? "mobile_web"
      : "web";
  },

  track(
    eventName: string,
    properties: Record<string, any> = {}
  ) {
    const cleanedProps = { ...properties };

    const blacklistedKeys = [
      "rut",
      "user_rut",
      "document_number",
      "identification_number",
      "email",
      "phone",
      "full_name",
      "name",
      "nombre",
      "apellido",
      "lastName1",
      "lastName2",
      "first_name",
      "last_name",
      "nombres",
      "apellidos",
      "telefono",
      "celular",
      "serial",
      "numero_serie",
      "password",
      "clave",
      "direccion",
      "address",
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
      "simulador_",
      "hazte_socio_",
      "solicitud_tarjeta_",
      "seguro_",
      "dap_",
      "apertura_vista_",
      "pago_online_",
      "portabilidad_",
    ];

    if (
      journeyPrefixes.some((prefix) =>
        eventName.startsWith(prefix)
      )
    ) {
      const drivers = driverService.getAll();

      finalProps = {
        ...finalProps,
        ...drivers,
      };

      if (
        !eventName.startsWith("simulador_") &&
        !eventName.startsWith(
          "solicitud_tarjeta_"
        )
      ) {
        delete finalProps.experiment_variant;
      }

      if (!finalProps.monto_rango) {
        delete finalProps.monto_rango;
      }

      if (!finalProps.experiment_variant) {
        delete finalProps.experiment_variant;
      }

      if (
        !finalProps.ultimo_contenido_educa
      ) {
        delete finalProps.ultimo_contenido_educa;
      }

      if (
        !finalProps.contenidos_educa_vistos
      ) {
        delete finalProps.contenidos_educa_vistos;
      }
    }

    console.log(
      `📊 [Amplitude Event] %c${eventName}%c`,
      "color:#8799FB;font-weight:bold;font-family:monospace;font-size:11px;",
      "color:inherit;",
      finalProps
    );

    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent(
        "amplitude_log",
        {
          detail: {
            eventName,
            properties: finalProps,
          },
        }
      );

      window.dispatchEvent(customEvent);
    }

    try {
      const trackingResult = amplitude.track(
        eventName,
        finalProps
      );

      void trackingResult.promise
        .then((result) => {
          if (result.code === 200) {
            console.info(
              `✅ [Amplitude Delivered] ${eventName} — HTTP ${result.code}`
            );
          } else {
            console.error(
              `❌ [Amplitude Rejected] ${eventName} — HTTP ${result.code}: ${result.message}`,
              result.event
            );
          }
        })
        .catch((error) => {
          console.error(
            `❌ [Amplitude Delivery Error] ${eventName}`,
            error
          );
        });
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error al registrar evento:",
        error
      );
    }
  },

  trackRevenue(
    eventName: string,
    properties: Record<string, any>,
    productType: string,
    price: number,
    quantity: number = 1
  ) {
    this.track(eventName, properties);

    try {
      const revenue = new Revenue()
        .setProductId(productType)
        .setPrice(price)
        .setQuantity(quantity)
        .setEventProperties(properties);

      amplitude.revenue(revenue);

      console.log(
        `💰 [Amplitude Revenue] Generado productType: ${productType}, price: ${price}, quantity: ${quantity}`
      );
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error al registrar revenue:",
        error
      );
    }
  },

  setUserId(customerId: string | null) {
    console.log(
      `👤 [Amplitude User ID]: ${customerId}`
    );

    try {
      amplitude.setUserId(customerId);

      experiment.fetch().catch((error) =>
        console.warn(
          "Error re-fetching experiment",
          error
        )
      );
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error en setUserId:",
        error
      );
    }
  },

  identifyUser(profile: {
    customer_segment: string;
    es_socio?: boolean;
    platform?: string;
    region?: string;
  }) {
    console.log("🆔 [Amplitude Identify]:", {
      customer_segment:
        profile.customer_segment,
      es_socio: profile.es_socio ?? true,
      app_platform_ultimo_login:
        profile.platform || this.getPlatform(),
      region: profile.region,
    });

    try {
      const identifyObject =
        new amplitude.Identify();

      identifyObject.set(
        "customer_segment",
        profile.customer_segment
      );

      identifyObject.set(
        "es_socio",
        profile.es_socio ?? true
      );

      identifyObject.set(
        "app_platform_ultimo_login",
        profile.platform || this.getPlatform()
      );

      if (profile.region) {
        identifyObject.set(
          "region",
          profile.region
        );
      }

      amplitude.identify(identifyObject);
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error en identify:",
        error
      );
    }
  },

  setUserProperty(
    key: string,
    value: any,
    setOnce: boolean = false
  ) {
    try {
      const identifyObject =
        new amplitude.Identify();

      if (setOnce) {
        identifyObject.setOnce(key, value);
      } else {
        identifyObject.set(key, value);
      }

      amplitude.identify(identifyObject);

      console.log(
        `🆔 [Amplitude Identify] ${
          setOnce ? "setOnce" : "set"
        } ${key}: ${value}`
      );
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error en setUserProperty:",
        error
      );
    }
  },

  appendUserProperty(
    key: string,
    value: any
  ) {
    try {
      const identifyObject =
        new amplitude.Identify().append(
          key,
          value
        );

      amplitude.identify(identifyObject);

      console.log(
        `🆔 [Amplitude Identify] append ${key}: ${value}`
      );
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error en appendUserProperty:",
        error
      );
    }
  },

  addValueUserProperty(
    key: string,
    value: number
  ) {
    try {
      const identifyObject =
        new amplitude.Identify().add(
          key,
          value
        );

      amplitude.identify(identifyObject);

      console.log(
        `🆔 [Amplitude Identify] add ${key}: ${value}`
      );
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error en addValueUserProperty:",
        error
      );
    }
  },

  appendProduct(product: string) {
    try {
      const identifyObject =
        new amplitude.Identify().append(
          "productos_contratados",
          product
        );

      amplitude.identify(identifyObject);

      console.log(
        `🆔 [Amplitude Identify] appended product: ${product}`
      );
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error en appendProduct:",
        error
      );
    }
  },

  incrementJourneysCompleted() {
    try {
      const identifyObject =
        new amplitude.Identify().add(
          "journeys_completados",
          1
        );

      amplitude.identify(identifyObject);

      console.log(
        "🆔 [Amplitude Identify] incremented journeys_completados"
      );
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error en incrementJourneysCompleted:",
        error
      );
    }
  },

  clearUserId() {
    console.log(
      "👤 [Amplitude Reset] Sesión desvinculada del usuario."
    );

    try {
      amplitude.reset();

      experiment.fetch().catch((error) =>
        console.warn(
          "Error re-fetching experiment",
          error
        )
      );
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error en reset:",
        error
      );
    }
  },

  getVariant(flagKey: string) {
    try {
      const variant =
        experiment.variant(flagKey);

      if (variant && variant.value) {
        return variant;
      }
    } catch (error) {
      console.warn(
        "[Amplitude Service] Error en getVariant:",
        error
      );
    }

    let fallbackId = amplitude.getUserId();

    if (!fallbackId) {
      const sessionObject =
        localStorage.getItem(
          "minders_demo_auth_session"
        );

      if (sessionObject) {
        try {
          fallbackId =
            JSON.parse(
              sessionObject
            ).customer_id;
        } catch {
          // La sesión local no era JSON válido.
        }
      }
    }

    if (!fallbackId) {
      fallbackId = "anonymous";
    }

    const hash = Math.abs(
      hashCode(fallbackId)
    );

    if (flagKey === "hero-cta-variant") {
      return {
        value:
          hash % 2 === 0
            ? "default"
            : "bold",
      };
    }

    if (
      flagKey ===
      "simulador-progress-style"
    ) {
      return {
        value:
          hash % 2 === 0
            ? "steps"
            : "continuous",
      };
    }

    return {
      value: "control",
    };
  },
};
