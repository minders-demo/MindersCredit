import React, { useState, useEffect, useRef } from "react";
import { amplitudeService } from "../services/amplitude.service";
import { useRouter } from "../RouterContext";
import { useAuth } from "../hooks/useAuth";
import { useJourneyProgress } from "../hooks/useJourneyProgress";
import { normalizeRut, formatRut, validateRut } from "../utils/rut";
import { getInstallationId } from "../utils/installation";
import ContinuityModal from "../components/ContinuityModal";
import { 
  ShieldCheck, Info, CheckCircle2, ChevronRight, Download, 
  FileText, Calendar, ArrowLeft, Sparkles, RefreshCw, AlertCircle 
} from "lucide-react";
import { generateFakeData } from "../utils/demoHelper";

export default function SimuladorConsumo() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  
  // Utilizar nuestro hook de progreso de journey local
  const { 
    activeJourney, 
    loading: journeyLoading, 
    error: journeyError, 
    startNew, 
    save: saveJourney, 
    resume: resumeJourney, 
    abandon: abandonJourney 
  } = useJourneyProgress("credit_application");

  // Wizard Steps: 1 (Ingreso de Datos), 2 (Cálculo / Parámetros), 3 (Comprobante / Éxito)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hasResumed, setHasResumed] = useState(false);

  // Continuity Feature States
  const [isContinuityOpen, setIsContinuityOpen] = useState(false);
  const [continuityError, setContinuityError] = useState<string | null>(null);
  const [continuitySuccess, setContinuitySuccess] = useState<string | null>(null);

  useEffect(() => {
    const checkHashHandoff = async () => {
      const hash = window.location.hash;
      if (hash.includes("handoff=")) {
        const match = hash.match(/handoff=([^&/]+)/);
        if (match && match[1]) {
          const payloadBase64 = match[1];
          try {
            amplitudeService.track("journey_handoff_opened");
            const decodedJson = decodeURIComponent(escape(atob(payloadBase64.trim())));
            const payload = JSON.parse(decodedJson);

            if (payload.schema_version !== "1.0") {
              amplitudeService.track("journey_handoff_rejected", { error: "version_mismatch" });
              setContinuityError("El formato de este código de continuidad ya no es compatible.");
              return;
            }

            const expirationDate = Date.parse(payload.expires_at);
            if (isNaN(expirationDate) || Date.now() > expirationDate) {
              amplitudeService.track("journey_handoff_expired");
              setContinuityError("Este código de continuidad ha expirado (límite de 30 minutos).");
              return;
            }

            if (!user) {
              setContinuityError("Por favor inicia sesión con tu usuario demo para reanudar esta solicitud.");
              return;
            }

            if (payload.customer_id !== user.customer_id) {
              amplitudeService.track("journey_handoff_rejected", { error: "user_mismatch" });
              setContinuityError(`Este progreso pertenece a otro usuario demo (${payload.customer_id}). Inicia sesión con la cuenta correcta.`);
              return;
            }

            const now = new Date().toISOString();
            const instId = getInstallationId();
            const currentPlatform = amplitudeService.getPlatform();

            const importedJourney = {
              journey_id: payload.journey_id,
              customer_id: payload.customer_id,
              journey_type: payload.journey_type,
              current_step: payload.current_step,
              step_order: payload.step_order,
              status: "in_progress",
              form_data: payload.form_data,
              started_at: payload.created_at,
              updated_at: now,
              source_platform: payload.source_platform,
              last_platform: currentPlatform,
              last_device_key: instId,
              last_activity_at: now,
            };

            const stored = localStorage.getItem("minders_demo_journeys");
            let map = {};
            if (stored) {
              try {
                map = JSON.parse(stored);
              } catch (e) {
                map = {};
              }
            }
            (map as any)[user.customer_id] = importedJourney;
            localStorage.setItem("minders_demo_journeys", JSON.stringify(map));

            amplitudeService.track("journey_handoff_imported", {
              journey_type: payload.journey_type,
              journey_id: payload.journey_id,
            });

            const wasDifferentDevice = payload.source_installation_id !== instId;
            if (wasDifferentDevice) {
              amplitudeService.track("cross_device_journey_resumed", {
                journey_type: payload.journey_type,
                journey_id: payload.journey_id,
                previous_platform: payload.source_platform,
                current_platform: currentPlatform,
                step_name: payload.current_step,
                step_order: payload.step_order,
                days_since_last_activity: 0,
              });
            } else {
              amplitudeService.track("journey_resumed", {
                journey_type: payload.journey_type,
                journey_id: payload.journey_id,
                resume_source: "same_device",
                same_installation: true,
                days_since_last_activity: 0,
                step_name: payload.current_step,
                step_order: payload.step_order,
              });
            }

            setContinuitySuccess("¡Borrador importado con éxito! Se ha cargado tu progreso.");
            window.location.hash = "#/simulador/consumo";
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (e) {
            amplitudeService.track("journey_handoff_rejected", { error: "invalid_payload" });
            setContinuityError("Código de continuidad corrupto o inválido.");
          }
        }
      }
    };

    checkHashHandoff();
  }, [user]);

  // Form States (Paso 1)
  const [monto, setMonto] = useState<number>(3000000);
  const [rut, setRut] = useState("");
  const [celular, setCelular] = useState("");
  const [indicativoPais, setIndicativoPais] = useState("+56");
  const [consentimiento, setConsentimiento] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Calculation States (Paso 2)
  const [cuotas, setCuotas] = useState<number>(36);
  const [diasGracia, setDiasGracia] = useState<30 | 60 | 90>(30);
  const [incluirSeguros, setIncluirSeguros] = useState(true);

  // Live Calculated States
  const [valorCuota, setValorCuota] = useState(0);
  const [cae, setCae] = useState(26.88);
  const [ctc, setCtc] = useState(0); // Costo total del crédito
  const [folioSimulacion, setFolioSimulacion] = useState("");
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  const stepRef = useRef(step);
  const completedRef = useRef(false);
  // Ref del journey activo: evita que el guardado reactive el efecto de cálculo (bucle infinito)
  const activeJourneyRef = useRef(activeJourney);

  useEffect(() => {
    activeJourneyRef.current = activeJourney;
  }, [activeJourney]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Track de abandono de journey
  useEffect(() => {
    return () => {
      if (!completedRef.current) {
        amplitudeService.track("solicitud_credito_abandonada", { 
          ultimo_paso_completado: stepRef.current === 1 ? 0 : stepRef.current - 1,
          pasos_totales: 3
        });
      }
    };
  }, []);

  // Pre-llenar RUT si el usuario ya inició sesión
  useEffect(() => {
    if (user) {
      setRut(formatRut(user.rut));
    } else {
      setRut("");
    }
  }, [user]);

  // Autofill para pruebas rápidas
  const handleAutofill = () => {
    const data = generateFakeData();
    // Si no está logueado, autofill simula el RUT. Si está logueado, mantiene el RUT del usuario.
    if (!user) {
      setRut(formatRut(data.rut));
    }
    setCelular(data.phone.slice(1));
    setIndicativoPais("+56");
    setConsentimiento(true);
    setMonto(Math.floor(2000000 + Math.random() * 8000000));
    
    amplitudeService.track("autofill_demo_clicked", { 
      form: "simulador_consumo", 
      paso_actual: step 
    });
  };

  // Cargar parámetros de URL si existen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const origen = params.get("origen") || "directo";
    amplitudeService.track("simulador_consumo_iniciado", { origen });
    
    const m = params.get("monto");
    const r = params.get("rut");
    if (m) {
      const parsedM = parseInt(m, 10);
      if (parsedM >= 500000 && parsedM <= 40000000) {
        setMonto(parsedM);
      }
    }
    if (r && !user) {
      setRut(decodeURIComponent(r));
    }
  }, [user]);

  // Recalcular cuota en tiempo real cuando cambian parámetros
  useEffect(() => {
    const baseAmount = monto;
    const insurancePremium = incluirSeguros ? baseAmount * 0.025 : 0; // 2.5% del crédito
    const totalFinanced = baseAmount + insurancePremium;

    // Tasa mensual preferente (pensionado v/s normal)
    const isPensionado = user?.pensionada === true || localStorage.getItem("minders_pensionado") === "true";
    const rateMonthly = isPensionado ? 0.0149 : 0.0199;

    // Ajuste por período de gracia
    const graceFactor = diasGracia === 60 ? 1.015 : diasGracia === 90 ? 1.03 : 1.0;
    const finalFinanced = totalFinanced * graceFactor;

    // Amortización Francesa
    const factor = (rateMonthly * Math.pow(1 + rateMonthly, cuotas)) / (Math.pow(1 + rateMonthly, cuotas) - 1);
    const cuota = Math.round(finalFinanced * factor);

    setValorCuota(cuota);
    setCtc(cuota * cuotas);

    // Trackeo y guardado con debounce: se ejecuta UNA vez por cambio real de parámetros,
    // y usa activeJourneyRef (no la dependencia) para no re-disparar el efecto al guardar.
    if (step === 2) {
      const currentCae = isPensionado ? 20.12 : 26.88;
      const timer = setTimeout(() => {
        amplitudeService.track("simulacion_calculada", {
          monto: baseAmount,
          cuotas: cuotas,
          valor_cuota: cuota,
          incluye_seguros: incluirSeguros,
          dias_gracia: diasGracia,
          cae: currentCae
        });

        if (user && activeJourneyRef.current) {
          saveJourney(
            "parametros_calculados",
            2,
            {
              monto: baseAmount,
              celular,
              indicativoPais,
              cuotas,
              diasGracia,
              incluirSeguros,
              valorCuota: cuota,
              ctc: cuota * cuotas
            }
          ).catch(console.error);
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [monto, cuotas, diasGracia, incluirSeguros, step, user]);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRut(formatRut(e.target.value));
  };

  // Reanudar Journey desde Firestore / Mock DB
  const handleResume = async () => {
    if (!activeJourney) return;
    try {
      const resumed = await resumeJourney();
      if (resumed && resumed.form_data) {
        const data = resumed.form_data;
        if (data.monto) setMonto(data.monto);
        if (data.celular) setCelular(data.celular);
        if (data.indicativoPais) setIndicativoPais(data.indicativoPais);
        setConsentimiento(true);
        if (data.cuotas) setCuotas(data.cuotas);
        if (data.diasGracia) setDiasGracia(data.diasGracia);
        if (data.incluirSeguros !== undefined) setIncluirSeguros(data.incluirSeguros);
        
        // Mover al paso correspondiente guardado
        if (resumed.current_step === "parametros_calculados") {
          setStep(2);
        } else {
          setStep(1);
        }
        setHasResumed(true);
      }
    } catch (err) {
      console.error("Error al reanudar journey:", err);
    }
  };

  // Descartar Journey anterior para empezar limpio
  const handleAbandon = async () => {
    if (confirm("¿Estás seguro de descartar la solicitud pendiente? Se borrarán los datos guardados de esta simulación.")) {
      await abandonJourney();
    }
  };

  // Envío del Paso 1 (Datos Básicos)
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (monto < 500000 || monto > 40000000) {
      setErrorMsg("El monto debe estar entre $500.000 y $40.000.000 CLP.");
      amplitudeService.track("error_validacion", { campo: "simulacion_monto", mensaje: "Monto fuera de rango" });
      return;
    }

    if (!rut) {
      setErrorMsg("El RUT es obligatorio.");
      amplitudeService.track("error_validacion", { campo: "simulacion_rut", mensaje: "RUT vacío" });
      return;
    }

    if (!validateRut(rut)) {
      setErrorMsg("El RUT ingresado no es válido.");
      amplitudeService.track("error_validacion", { campo: "simulacion_rut", mensaje: "RUT inválido" });
      return;
    }

    if (!celular || celular.length < 7 || celular.length > 12) {
      setErrorMsg("Ingresa un número de celular válido (entre 7 y 12 dígitos).");
      amplitudeService.track("error_validacion", { campo: "simulacion_celular", mensaje: "Celular inválido" });
      return;
    }

    if (!consentimiento) {
      setErrorMsg("Debes aceptar el consentimiento de evaluación comercial.");
      amplitudeService.track("error_validacion", { campo: "simulacion_consentimiento", mensaje: "Falta consentimiento" });
      return;
    }

    // Persistencia en el disco local (localStorage) solo para usuarios autenticados
    if (user) {
      try {
        const initData = { monto, celular, indicativoPais, consentimiento: true };
        if (activeJourney) {
          await saveJourney("parametros_calculados", 2, initData);
        } else {
          await startNew("parametros_calculados", 2, initData);
        }
      } catch (err: any) {
        console.error("Error al persistir journey:", err);
      }
    }

    amplitudeService.track("journey_step_completed", {
      journey_type: "credit_application",
      step_name: "ingreso_datos",
      step_order: 1,
      next_step_name: "parametros_calculados",
      next_step_order: 2
    });

    setStep(2);
  };

  // Envío del Paso 2 (Parámetros)
  const handleStep2Submit = async () => {
    const randomFolio = "MC-" + Math.floor(100000 + Math.random() * 900000);
    setFolioSimulacion(randomFolio);

    if (user && activeJourney) {
      try {
        await saveJourney("resultado_propuesta", 3, {
          folio: randomFolio,
          cuotas,
          diasGracia,
          incluirSeguros,
          valorCuota,
          ctc
        });
      } catch (err) {
        console.error("Error al guardar folio en journey:", err);
      }
    }

    amplitudeService.track("journey_step_completed", {
      journey_type: "credit_application",
      step_name: "parametros_calculados",
      step_order: 2,
      next_step_name: "resultado_propuesta",
      next_step_order: 3
    });

    setStep(3);
  };

  // Descarga del comprobante de simulación
  const handleDownloadComprobante = () => {
    amplitudeService.track("comprobante_simulacion_descargado", { folio: folioSimulacion });
    
    const element = document.createElement("a");
    const content = `
    ==================================================
                 MINDERSCREDIT COOPERATIVA
    ==================================================
    COMPROBANTE DE SIMULACIÓN DIGITAL
    Folio: ${folioSimulacion}
    Fecha: ${new Date().toLocaleDateString("es-CL")}
    
    DETALLE DEL CRÉDITO DE CONSUMO:
    --------------------------------------------------
    Monto solicitado: $${monto.toLocaleString("es-CL")} CLP
    Cuotas simuladas: ${cuotas} meses
    Valor cuota mensual: $${valorCuota.toLocaleString("es-CL")} CLP
    Tasa mensual: ${user?.pensionada ? "1,49% (Pensionados IPS)" : "1,99% (Preferente)"}
    CAE: ${user?.pensionada ? "20,12%" : "26,88%"}
    Plazo de gracia: ${diasGracia} días (primer pago)
    Seguros incluidos: ${incluirSeguros ? "Sí (Desgravamen + Cesantía)" : "No"}
    Costo Total del Crédito (CTC): $${ctc.toLocaleString("es-CL")} CLP
    
    Simulado bajo RUT: ${rut}
    Código de Cliente pseudoanónimo: ${user?.customer_id || "No registrado"}
    ==================================================
    "Finanzas cooperativas para tu progreso"
    `;
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Simulacion_MindersCredit_${folioSimulacion}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Finalización del Crédito (Desembolso / Solicitud enviada)
  const handleSolicitarCredito = async () => {
    completedRef.current = true;
    
    if (user && activeJourney) {
      try {
        await saveJourney("solicitud_completada", 3, { status: "submitted" }, "submitted");
      } catch (err) {
        console.error("Error al finalizar journey en base de datos:", err);
      }
    }

    amplitudeService.track("simulador_consumo_completado", { 
      monto: monto, 
      cuotas: cuotas, 
      valor_cuota: valorCuota,
      folio: folioSimulacion
    });
    amplitudeService.incrementJourneysCompleted();

    setSolicitudEnviada(true);
  };

  const clpFormat = (num: number) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
      {/* Wizard Header Progress */}
      <div className="mb-10 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/50">
          01 — Simula tu financiamiento
        </span>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-brand-dark mt-2 mb-6">
          Crédito de Consumo Inteligente
        </h1>
        
        {/* Step bars */}
        <div className="flex justify-center items-center gap-2 max-w-md mx-auto">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-brand-dark" : "bg-brand-dark/10"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-brand-dark" : "bg-brand-dark/10"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-brand-dark" : "bg-brand-dark/10"}`} />
        </div>
        <div className="flex justify-between max-w-md mx-auto mt-2 font-mono text-[10px] uppercase text-brand-dark/60 px-1">
          <span>1. Tus Datos</span>
          <span>2. Parámetros</span>
          <span>3. Resultado</span>
        </div>
      </div>

      <div className="bg-white border border-brand-dark/10 p-6 md:p-10" style={{ borderRadius: "18px" }}>
        
        {/* BANNER DE REANUDACIÓN DE SOLICITUD (CROSS-DEVICE CONTINUITY) */}
        {continuityError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-2xl text-left text-xs text-red-800 flex items-start gap-2.5 animate-fade-in relative">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 pr-6">
              <strong>Error en continuidad:</strong> {continuityError}
            </div>
            <button type="button" onClick={() => setContinuityError(null)} className="absolute top-3 right-3 text-red-600/60 hover:text-red-800 text-[10px] font-bold">✕</button>
          </div>
        )}

        {continuitySuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-left text-xs text-emerald-800 flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{continuitySuccess}</span>
          </div>
        )}

        {user && activeJourney && step === 1 && !hasResumed && (
          <div className="mb-6 p-5 bg-accent-lavender/10 border-2 border-accent-lavender/30 rounded-2xl text-left relative flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-brand-dark">
                <Sparkles className="w-4.5 h-4.5 text-accent-lavender" />
                ¡SOLICITUD BORRADOR ENCONTRADA EN EL ALMACENAMIENTO LOCAL!
              </div>
              <p className="text-xs text-brand-dark/80">
                Hola <strong>{user.first_name}</strong>. Detectamos que tienes una simulación de crédito pendiente por <strong>${activeJourney.form_data?.monto?.toLocaleString("es-CL")} CLP</strong> iniciada desde <strong>{activeJourney.last_platform === "mobile_web" ? "un Dispositivo Móvil (Mobile Web)" : "un Navegador de Escritorio"}</strong>.
              </p>
              <span className="text-[10px] text-brand-dark/50 font-mono block">
                Última actividad: {new Date(activeJourney.last_activity_at || activeJourney.updated_at).toLocaleString("es-CL")}
              </span>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsContinuityOpen(true)}
                className="px-4 py-2 border border-accent-lavender/40 rounded-xl text-xs font-mono text-brand-dark/80 hover:bg-accent-lavender/10 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent-lavender" />
                Continuar en móvil / otro dispositivo
              </button>
              <button
                type="button"
                onClick={handleAbandon}
                className="px-4 py-2 border border-brand-dark/25 rounded-xl text-xs font-mono text-brand-dark/70 hover:bg-black/5 transition-colors"
                disabled={journeyLoading}
              >
                Empezar de cero
              </button>
              <button
                type="button"
                onClick={handleResume}
                className="px-4 py-2 bg-brand-dark text-white rounded-xl text-xs font-mono font-bold hover:bg-brand-dark/95 transition-all shadow-sm flex items-center gap-1"
                disabled={journeyLoading}
              >
                {journeyLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                Reanudar solicitud
              </button>
            </div>
          </div>
        )}

        {/* FEEDBACK DE REANUDACIÓN EXITOSA */}
        {hasResumed && step === 2 && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-left text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>¡Progreso recuperado con éxito!</strong> Estás continuando tu solicitud guardada en tu historial local.
            </span>
          </div>
        )}

        {!solicitudEnviada && step < 3 && (
          <div className="mb-6 pb-6 border-b border-brand-dark/10 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-col text-left">
              <span className="text-xs font-mono text-brand-dark/50">
                {user ? `Identificado como: ${user.first_name} ${user.last_name}` : "Operando como usuario no identificado (Borradores locales)"}
              </span>
              {user && (
                <button
                  type="button"
                  onClick={() => setIsContinuityOpen(true)}
                  className="text-left text-[11px] font-mono text-accent-lavender hover:underline flex items-center gap-1 mt-1 font-bold cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Continuidad de dispositivo (Importar / Exportar progreso)
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleAutofill}
              className="w-full sm:w-auto py-2 px-4 bg-accent-lavender/10 hover:bg-accent-lavender/20 border border-accent-lavender/30 text-brand-dark font-mono text-[11px] uppercase tracking-wider rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              ⚡ Rellenar datos de prueba
            </button>
          </div>
        )}

        {/* PASO 1: FORMULARIO INGRESO DE DATOS */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <h3 className="font-display text-lg tracking-tight mb-4 border-b border-brand-dark/5 pb-2">
              Paso 1: Información de Contacto y Solicitud
            </h3>

            {errorMsg && (
              <div className="p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg flex items-center gap-2 text-xs text-brand-dark">
                <AlertCircle className="w-4 h-4 text-accent-coral shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                  Monto que Necesitas (CLP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-brand-dark/50">$</span>
                  <input
                    type="number"
                    min={500000}
                    max={40000000}
                    value={monto}
                    onChange={(e) => setMonto(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-3 pl-8 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                  />
                </div>
                <span className="text-[10px] text-brand-dark/50 font-mono mt-1 block">
                  Rango: $500.000 a $40.000.000 CLP
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                  Tu RUT de Socio
                </label>
                <input
                  type="text"
                  placeholder="12.345.678-9"
                  value={rut}
                  onChange={handleRutChange}
                  disabled={!!user}
                  className={`w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono ${user ? "bg-brand-dark/5 text-brand-dark/60 cursor-not-allowed" : "bg-[#FDFDFD]"}`}
                  data-amp-mask="true"
                />
                <span className="text-[10px] text-brand-dark/50 font-mono mt-1 block">
                  {user ? "RUT bloqueado por sesión activa." : "Ingresa con guion y dígito verificador."}
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                  Teléfono Celular
                </label>
                <div className="flex">
                  <select
                    value={indicativoPais}
                    onChange={(e) => setIndicativoPais(e.target.value)}
                    className="bg-brand-dark/5 border border-r-0 border-brand-dark/20 p-3 text-xs font-mono text-brand-dark rounded-l-xl focus:outline-none focus:border-brand-dark cursor-pointer select-none max-w-[120px]"
                  >
                    <option value="+56">Chile (+56)</option>
                    <option value="+54">Argentina (+54)</option>
                    <option value="+51">Perú (+51)</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="912345678"
                    maxLength={11}
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full p-3 border border-brand-dark/20 rounded-r-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                  />
                </div>
                <span className="text-[10px] text-brand-dark/50 font-mono mt-1 block">
                  Ingresa tu celular de contacto.
                </span>
              </div>

              <div className="flex items-center">
                <label className="flex items-start gap-2.5 text-xs text-brand-dark/80 cursor-pointer select-none mt-4">
                  <input
                    type="checkbox"
                    checked={consentimiento}
                    onChange={(e) => setConsentimiento(e.target.checked)}
                    className="w-4 h-4 border-brand-dark/20 rounded accent-brand-dark mt-0.5"
                  />
                  <span>
                    Autorizo a MindersCredit a consultar mis antecedentes comerciales y financieros para pre-evaluar mi solicitud.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-dark/5 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 bg-brand-dark text-white font-mono text-xs uppercase tracking-widest rounded-full hover:bg-brand-dark/90 transition-all flex items-center gap-1.5"
              >
                Comenzar simulación
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* PASO 2: CONTROL DE PARÁMETROS Y CÁLCULO EN VIVO */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-3">
              <h3 className="font-display text-lg tracking-tight">
                Paso 2: Ajusta y Personaliza tu Cuota
              </h3>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-mono text-brand-dark/60 hover:text-brand-dark flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Modificar Datos
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Sliders Controls Column */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Cuotas */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-mono uppercase tracking-wider text-brand-dark/80">
                      Plazo de Cuotas
                    </label>
                    <span className="font-mono text-sm font-bold text-brand-dark">
                      {cuotas} Meses
                    </span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={84}
                    step={6}
                    value={cuotas}
                    onChange={(e) => setCuotas(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-brand-dark/10 rounded-lg appearance-none cursor-pointer accent-brand-dark"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-brand-dark/40 mt-1">
                    <span>6 Meses</span>
                    <span>36 m</span>
                    <span>60 m</span>
                    <span>84 Meses</span>
                  </div>
                </div>

                {/* Gracia */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-2">
                    Mes de Primer Pago
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 90].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setDiasGracia(days as any)}
                        className={`py-2 px-3 border font-mono text-xs rounded-xl transition-all ${diasGracia === days ? "bg-brand-dark text-white border-brand-dark animate-scale" : "border-brand-dark/20 text-brand-dark/70 hover:bg-brand-dark/5"}`}
                      >
                        En {days} días
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seguros de Desgravamen + Cesantía */}
                <div className="p-4 bg-brand-dark/5 rounded-2xl border border-brand-dark/5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-accent-lavender" />
                        Seguros de Desgravamen y Protegido
                      </h4>
                      <p className="text-[11px] text-brand-dark/70 mt-1 leading-relaxed">
                        Cubre el saldo deudor de tu crédito ante fallecimiento accidental o cesantía involuntaria. Te protege a ti y a tu familia.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={incluirSeguros}
                        onChange={(e) => setIncluirSeguros(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-brand-dark/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

              </div>

              {/* LIVE SIMULATED OFFER PANEL */}
              <div className="lg:col-span-2 bg-[#F9F9F9] border border-brand-dark/10 p-6 rounded-2xl flex flex-col justify-between shadow-2xs">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-accent-lavender block mb-1">
                    Cálculo Amortización Francesa
                  </span>
                  <span className="font-mono text-[10px] text-brand-dark/50 block">
                    Monto solicitado: {clpFormat(monto)}
                  </span>
                  
                  <div className="my-4">
                    <span className="text-[10px] font-mono text-brand-dark/60 block uppercase">
                      CUOTA MENSUAL ESTIMADA
                    </span>
                    <span className="font-display text-2xl sm:text-3xl text-brand-dark tracking-tight leading-none block mt-1">
                      {clpFormat(valorCuota)}
                    </span>
                    <span className="text-[11px] text-[#0F766E] font-mono font-bold block mt-1">
                      {user?.pensionada ? "Tasa preferencial Senior IPS: 1,49%" : "Tasa mensual preferente: 1,99%"}
                    </span>
                  </div>

                  <div className="space-y-1.5 border-t border-brand-dark/10 pt-4 text-xs font-mono text-brand-dark/80">
                    <div className="flex justify-between">
                      <span>CAE (Anual):</span>
                      <span className="font-bold">{user?.pensionada ? "20.12%" : "26.88%"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plazo:</span>
                      <span>{cuotas} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seguro de Desgravamen:</span>
                      <span>{incluirSeguros ? "Incluido" : "No incluido"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gracia primer pago:</span>
                      <span>{diasGracia} días</span>
                    </div>
                    <div className="flex justify-between text-brand-dark font-bold border-t border-brand-dark/5 pt-1.5 mt-1.5">
                      <span>Costo Total (CTC):</span>
                      <span>{clpFormat(ctc)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStep2Submit}
                  className="w-full mt-6 py-3.5 bg-brand-dark text-white font-mono text-xs uppercase tracking-wider rounded-full hover:bg-brand-dark/90 transition-all font-bold text-center"
                >
                  Obtener Comprobante
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: COMPROBANTE DE SIMULACIÓN / ÉXITO */}
        {step === 3 && (
          <div className="space-y-6 text-center max-w-xl mx-auto py-4">
            {!solicitudEnviada ? (
              <>
                <div className="w-16 h-16 bg-accent-lavender/10 text-brand-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-lavender/30">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl tracking-tight text-brand-dark">
                  Tu simulación está lista
                </h3>
                <p className="text-sm text-brand-dark/70">
                  Hemos generado tu propuesta comercial. Puedes descargar el comprobante o solicitar el desembolso de inmediato.
                </p>

                {/* Comprobante Receipt Box */}
                <div className="p-6 border border-brand-dark/15 rounded-2xl bg-brand-bg text-left font-mono text-xs text-brand-dark space-y-3 relative shadow-2xs">
                  <div className="absolute top-4 right-4 bg-brand-dark text-white text-[10px] px-2 py-0.5 rounded font-mono uppercase">
                    PROPUESTA
                  </div>
                  <div>
                    <span className="text-brand-dark/40 block">FOLIO DE PROPUESTA</span>
                    <span className="font-bold text-sm tracking-wider text-brand-dark">{folioSimulacion}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-brand-dark/10 pt-3">
                    <div>
                      <span className="text-brand-dark/40 block">MONTO SOLICITADO</span>
                      <span className="font-bold">{clpFormat(monto)}</span>
                    </div>
                    <div>
                      <span className="text-brand-dark/40 block">PLAZO</span>
                      <span className="font-bold">{cuotas} meses</span>
                    </div>
                    <div>
                      <span className="text-brand-dark/40 block">VALOR CUOTA</span>
                      <span className="font-bold text-sm text-[#0F766E]">{clpFormat(valorCuota)}</span>
                    </div>
                    <div>
                      <span className="text-brand-dark/40 block">COSTO TOTAL (CTC)</span>
                      <span className="font-bold">{clpFormat(ctc)}</span>
                    </div>
                  </div>
                  <div className="border-t border-brand-dark/10 pt-3 text-[11px] text-brand-dark/70 space-y-1">
                    <p>• RUT del Solicitante: {rut}</p>
                    <p>• Tasa mensual aplicada: {user?.pensionada ? "1,49% (CAE 20,12%)" : "1,99% (CAE 26,88%)"}</p>
                    <p>• Primer vencimiento: a {diasGracia} días</p>
                    {user?.customer_id && (
                      <p className="text-brand-dark/50">• Código de Analíticas: {user.customer_id}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleDownloadComprobante}
                    className="w-full py-3 border border-brand-dark/20 hover:bg-brand-dark/5 rounded-full font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-brand-dark font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Comprobante (.txt)
                  </button>
                  <button
                    type="button"
                    onClick={handleSolicitarCredito}
                    className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-brand-dark/90 transition-all font-bold"
                  >
                    Solicitar Crédito 🚀
                  </button>
                </div>
              </>
            ) : (
              <div className="py-6 space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300 animate-scale">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-display text-3xl tracking-tight text-[#0F766E]">
                  ¡Felicidades, Solicitud Recibida!
                </h3>
                <p className="text-sm text-brand-dark/80 max-w-md mx-auto leading-relaxed">
                  Tu solicitud ha sido ingresada exitosamente con el Folio <strong className="font-mono">{folioSimulacion}</strong>. Un ejecutivo cooperativo revisará tus antecedentes y te contactará en las próximas 2 horas hábiles.
                </p>

                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl max-w-sm mx-auto text-xs font-mono">
                  Se ha enviado una copia del comprobante a tu celular <strong className="text-brand-dark">{indicativoPais} {celular}</strong>.
                </div>

                {user?.pensionada && (
                  <div className="p-4 bg-accent-lavender/15 border border-accent-lavender/30 text-brand-dark rounded-xl max-w-sm mx-auto text-xs text-left">
                    <strong>⚠️ Requisito Jubilado / Pensionado:</strong>
                    <p className="mt-1">Para concretar tu tasa preferencial IPS de <strong>1,49%</strong>, deberás presentar tu <strong>Última Colilla de Liquidación de Pensión IPS</strong> al momento del contacto.</p>
                  </div>
                )}

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setSolicitudEnviada(false);
                      setMonto(3000000);
                      setConsentimiento(false);
                      setHasResumed(false);
                    }}
                    className="px-6 py-3 border border-brand-dark/20 hover:bg-brand-dark/5 rounded-full font-mono text-xs uppercase tracking-wider"
                  >
                    Volver a simular
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      <ContinuityModal
        isOpen={isContinuityOpen}
        onClose={() => setIsContinuityOpen(false)}
        onImportSuccess={() => {
          setIsContinuityOpen(false);
        }}
      />
    </div>
  );
}
