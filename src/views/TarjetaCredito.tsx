import React, { useState, useEffect, useRef } from "react";
import { trackEvent } from "../analytics";
import { useRouter } from "../RouterContext";
import { CreditCard, ShieldCheck, HelpCircle, CheckCircle2, ChevronRight, Landmark, AlertTriangle, ArrowLeft } from "lucide-react";
import { generateFakeData } from "../utils/demoHelper";

export default function TarjetaCredito() {
  const { navigate } = useRouter();
  const [step, setStep] = useState<"landing" | "form_rut" | "form_laboral" | "result" | "dispatch">("landing");

  // Inputs
  const [rut, setRut] = useState("");
  const [renta, setRenta] = useState<number>(850000);
  const [laboral, setLaboral] = useState("dependiente_indefinido");
  const [antiguedad, setAntiguedad] = useState("mas_1_ano");
  const [errorMsg, setErrorMsg] = useState("");

  // Dispatch details
  const [nombreDespacho, setNombreDespacho] = useState("");
  const [direccionDespacho, setDireccionDespacho] = useState("");
  const [regionDespacho, setRegionDespacho] = useState("");
  const [comunaDespacho, setComunaDespacho] = useState("");
  const [telefonoDespacho, setTelefonoDespacho] = useState("");
  const [indicativoPaisDespacho, setIndicativoPaisDespacho] = useState("+56");
  const [indicacionesEntrega, setIndicacionesEntrega] = useState("");
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  // Result
  const [approved, setApproved] = useState<boolean>(true);
  const [cupoSimulado, setCupoSimulado] = useState<number>(0);
  const [folio, setFolio] = useState("");

  const stepRef = useRef(step);
  const completedRef = useRef(false);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    return () => {
      if (!completedRef.current && stepRef.current !== "landing" && !dispatchSuccess) {
        let ultimoPaso = 0;
        if (stepRef.current === "form_laboral") ultimoPaso = 1;
        else if (stepRef.current === "result" || stepRef.current === "dispatch") ultimoPaso = 2;
        trackEvent("solicitud_tarjeta_abandonada", { ultimo_paso_completado: ultimoPaso });
      }
    };
  }, [dispatchSuccess]);

  const handleAutofill = () => {
    const data = generateFakeData();
    if (step === "form_rut") {
      setRut(formatRut(data.rut));
    } else if (step === "form_laboral") {
      setRenta(Math.floor(600000 + Math.random() * 1800000));
      setLaboral("dependiente_indefinido");
      setAntiguedad("mas_1_ano");
    } else if (step === "dispatch") {
      setNombreDespacho(data.fullName);
      setDireccionDespacho(`Av. Providencia ${Math.floor(100 + Math.random() * 2500)}`);
      setRegionDespacho(data.regionName);
      setComunaDespacho(data.comunaName);
      setTelefonoDespacho(data.phone.slice(1));
      setIndicacionesEntrega("Dejar en conserjería, timbre por favor.");
    }
    trackEvent("autofill_demo_clicked", { form: "tarjeta_credito", paso_actual: step });
  };

  useEffect(() => {
    trackEvent("tarjeta_credito_vista");
  }, []);

  const formatRut = (value: string) => {
    let raw = value.replace(/[^0-9kK]/g, "");
    if (raw.length === 0) return "";
    if (raw.length > 9) raw = raw.slice(0, 9);
    if (raw.length === 1) return raw;
    const dv = raw.slice(-1);
    const body = raw.slice(0, -1);
    let formatted = "";
    let count = 0;
    for (let i = body.length - 1; i >= 0; i--) {
      formatted = body.charAt(i) + formatted;
      count++;
      if (count === 3 && i > 0) {
        formatted = "." + formatted;
        count = 0;
      }
    }
    return `${formatted}-${dv}`;
  };

  const validateRut = (rutStr: string): boolean => {
    const clean = rutStr.replace(/\./g, "").replace("-", "").trim();
    if (clean.length < 1) return false;
    // Permite cualquier RUT de tipo ficticio de longitud >= 5
    return true;
  };

  const handleStartRequest = () => {
    const params = new URLSearchParams(window.location.search);
    const origen = params.get("origen") || "directo";
    trackEvent("solicitud_tarjeta_iniciada", { origen });
    setStep("form_rut");
  };

  const handleRutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!rut) {
      setErrorMsg("El RUT es obligatorio.");
      return;
    }

    if (!validateRut(rut)) {
      setErrorMsg("Ingresa un RUT válido.");
      return;
    }

    trackEvent("solicitud_tarjeta_paso_completado", { numero_paso: 1, nombre_paso: "ingreso_rut" });
    setStep("form_laboral");
  };

  const handleLaboralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (renta < 400000) {
      setErrorMsg("La renta líquida mínima para postular es $400.000 CLP.");
      return;
    }

    // Determine result (par approved, impar rejected, except demo personas)
    let isApproved = true;
    const cleanRut = rut.replace(/\./g, "").trim();
    if (cleanRut.startsWith("12345678")) {
      isApproved = true; // Camila Rojas
    } else if (cleanRut.startsWith("15654321")) {
      isApproved = false; // Jorge Fuentes
    } else if (cleanRut.startsWith("11222334")) {
      isApproved = true; // Rosa Sepúlveda
    } else {
      const parts = cleanRut.split("-");
      const body = parts[0];
      if (body.length > 0) {
        const lastDigitChar = body.charAt(body.length - 1);
        const lastDigit = parseInt(lastDigitChar, 10);
        if (!isNaN(lastDigit)) {
          isApproved = (lastDigit % 2 === 0);
        }
      }
    }
    
    setApproved(isApproved);
    
    // Fictional limit: 1.5 times the income
    setCupoSimulado(Math.round(renta * 1.5));
    setFolio("TC-" + Math.floor(100000 + Math.random() * 900000));
    
    trackEvent("solicitud_tarjeta_paso_completado", { numero_paso: 2, nombre_paso: "datos_laborales" });
    
    let rango = "";
    if (renta < 500000) rango = "<500K";
    else if (renta <= 1000000) rango = "500K-1M";
    else if (renta <= 2000000) rango = "1M-2M";
    else rango = ">2M";

    trackEvent("solicitud_tarjeta_completada", { 
      resultado: isApproved ? "preaprobado" : "en_evaluacion", 
      ingreso_declarado_rango: rango 
    });
    setStep("result");
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nombreDespacho) {
      setErrorMsg("El nombre del destinatario es obligatorio.");
      return;
    }
    if (!direccionDespacho) {
      setErrorMsg("La dirección de despacho es obligatoria.");
      return;
    }
    if (!regionDespacho) {
      setErrorMsg("La región es obligatoria.");
      return;
    }
    if (!comunaDespacho) {
      setErrorMsg("La comuna es obligatoria.");
      return;
    }
    if (!telefonoDespacho || telefonoDespacho.length < 7 || telefonoDespacho.length > 12) {
      setErrorMsg("Ingresa un número telefónico de contacto válido (entre 7 y 12 dígitos).");
      return;
    }

    trackEvent("solicitud_tarjeta_despacho_confirmado", {
      comuna: comunaDespacho
    });
    completedRef.current = true;
    setDispatchSuccess(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
      
      {/* LANDING PAGE (PRODUCT DETAIL) */}
      {step === "landing" && (
        <div className="space-y-12 animate-fade-in">
          {/* Card Presentation Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-brand-dark text-white p-6 md:p-10" style={{ borderRadius: "18px" }}>
            <div className="lg:col-span-7 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-accent-lavender">
                TARJETA DE CRÉDITO COOPERATIVA
              </span>
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-none text-white">
                Tarjeta MindersCredit Black
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
                La primera tarjeta de crédito diseñada para maximizar el valor de tu participación. Obtén financiamiento transparente, acumula Puntos MindersCredit y obtén descuentos reales en tus compras diarias.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-accent-cyan">
                <div>• $30.000 de descuento en tu primera compra</div>
                <div>• Costo de mantención $0 por uso mensual</div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleStartRequest}
                  className="px-8 py-3.5 bg-accent-lavender text-brand-dark font-mono text-xs uppercase tracking-wider rounded-full hover:bg-accent-lavender/90 transition-all font-bold"
                  data-amp-event="btn_tc_solicitar"
                >
                  Solicitar Tarjeta Online →
                </button>
              </div>
            </div>

            {/* Visual Credit Card Represent */}
            <div className="lg:col-span-5 flex justify-center">
              <div 
                className="w-80 h-48 bg-gradient-to-br from-[#1C1F24] via-[#2A3038] to-[#1C1F24] border border-white/20 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden"
                style={{ borderRadius: "18px" }}
              >
                {/* Abstract texture design */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-lavender/5 rounded-full blur-2xl" />
                
                <div className="flex justify-between items-start">
                  <span className="font-display text-lg tracking-tight">MindersCredit<span className="text-accent-lavender">.</span></span>
                  <span className="font-mono text-[10px] text-white/50">BLACK</span>
                </div>

                {/* Chip representation */}
                <div className="w-10 h-8 bg-amber-400/25 rounded-md border border-amber-400/40" />

                <div className="space-y-1">
                  <div className="font-mono text-sm tracking-widest text-white/90">••••  ••••  ••••  8824</div>
                  <div className="flex justify-between font-mono text-[9px] text-white/40">
                    <span>SEBASTIÁN ALLENDE</span>
                    <span>12/30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 border border-brand-dark/10 bg-white rounded-2xl">
              <span className="font-mono text-xs text-accent-lavender font-bold block mb-1">01 — PRIMER COMPRA</span>
              <h4 className="font-display text-base text-brand-dark">Ahorro de $30.000</h4>
              <p className="text-xs text-brand-dark/70 mt-2 leading-relaxed">
                Recibe una devolución automática de **$30.000 CLP** en tu estado de cuenta por tu primera compra nacional sobre $90.000.
              </p>
            </div>

            <div className="p-5 border border-brand-dark/10 bg-white rounded-2xl">
              <span className="font-mono text-xs text-accent-cyan font-bold block mb-1">02 — BENEFICIOS</span>
              <h4 className="font-display text-base text-brand-dark">Puntos MindersCredit</h4>
              <p className="text-xs text-brand-dark/70 mt-2 leading-relaxed">
                Acumula 1 punto por cada $100 gastados en cualquier comercio. Canjea tus puntos por abonos directos de dinero o cuotas de participación.
              </p>
            </div>

            <div className="p-5 border border-brand-dark/10 bg-white rounded-2xl">
              <span className="font-mono text-xs text-accent-coral font-bold block mb-1">03 — TASA JUSTA</span>
              <h4 className="font-display text-base text-brand-dark">Costo de Mantención $0</h4>
              <p className="text-xs text-brand-dark/70 mt-2 leading-relaxed">
                Excluye comisiones y costos de administración si realizas al menos una compra nacional de cualquier monto al mes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: FORM RUT */}
      {step === "form_rut" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl animate-fade-in">
          <div className="mb-6">
            <button
              onClick={() => setStep("landing")}
              className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver atrás
            </button>
            <span className="font-mono text-[10px] text-brand-dark/50 uppercase block">Onboarding Tarjeta</span>
            <h3 className="font-display text-lg tracking-tight">Ingresa tu RUT</h3>
            <p className="text-xs text-brand-dark/70">Comprobaremos si posees una oferta de tarjeta preaprobada.</p>
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2 bg-accent-lavender/10 hover:bg-accent-lavender/20 border border-accent-lavender/30 text-brand-dark font-mono text-[11px] uppercase tracking-wider rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              ⚡ Rellenar datos de prueba
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 text-accent-coral shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRutSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                RUT de Solicitante
              </label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={rut}
                onChange={(e) => setRut(formatRut(e.target.value))}
                className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold"
            >
              Comprobar Preaprobación
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: FORM LABORAL */}
      {step === "form_laboral" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl animate-fade-in">
          <div className="mb-6">
            <button
              onClick={() => setStep("form_rut")}
              className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </button>
            <span className="font-mono text-[10px] text-brand-dark/50 uppercase block">Onboarding Tarjeta</span>
            <h3 className="font-display text-lg tracking-tight">Datos Laborales</h3>
            <p className="text-xs text-brand-dark/70">Necesitamos conocer tu situación laboral para calcular tu cupo.</p>
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2 bg-accent-lavender/10 hover:bg-accent-lavender/20 border border-accent-lavender/30 text-brand-dark font-mono text-[11px] uppercase tracking-wider rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              ⚡ Rellenar datos de prueba
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 text-accent-coral shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLaboralSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                Renta Líquida Mensual (CLP)
              </label>
              <input
                type="number"
                min={100000}
                value={renta}
                onChange={(e) => setRenta(parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                Situación Laboral
              </label>
              <select
                value={laboral}
                onChange={(e) => setLaboral(e.target.value)}
                className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm bg-white focus:outline-none font-sans"
              >
                <option value="dependiente_indefinido">Trabajador Dependiente (Contrato Indefinido)</option>
                <option value="dependiente_plazo">Trabajador Dependiente (Contrato Plazo Fijo)</option>
                <option value="independiente">Profesional Independiente (Boletas Honorarios)</option>
                <option value="jubilado">Jubilado / Pensionado</option>
                <option value="mype">Empresario / MYPE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                Antigüedad Laboral
              </label>
              <select
                value={antiguedad}
                onChange={(e) => setAntiguedad(e.target.value)}
                className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm bg-white focus:outline-none font-sans"
              >
                <option value="menos_6_meses">Menos de 6 meses</option>
                <option value="entre_6_12">Entre 6 y 12 meses</option>
                <option value="mas_1_ano">Más de 1 año</option>
                <option value="mas_3_anos">Más de 3 años</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold"
            >
              Evaluar Solicitud
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: RESULTADOS (70% PREAPROBADO, 30% EVALUACIÓN MANUAL) */}
      {step === "result" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl text-center space-y-6 animate-fade-in">
          {approved ? (
            <>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <span className="font-mono text-xs text-accent-lavender font-bold">¡ENHORABUENA!</span>
                <h3 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
                  Tarjeta Preaprobada con Éxito
                </h3>
                <p className="text-xs text-brand-dark/70 mt-1">
                  Hemos evaluado tu RUT e ingresos comerciales y posees una oferta excelente.
                </p>
              </div>

              {/* Offer Details */}
              <div className="p-5 bg-brand-bg rounded-xl font-mono text-xs text-left border border-brand-dark/5 space-y-2">
                <div className="flex justify-between">
                  <span>FOLIO DE OFERTA:</span>
                  <span className="font-bold">{folio}</span>
                </div>
                <div className="flex justify-between text-sm text-[#0F766E] font-bold border-t border-brand-dark/5 pt-2 mt-2">
                  <span>CUPO PREAPROBADO:</span>
                  <span>${cupoSimulado.toLocaleString("es-CL")} CLP</span>
                </div>
                <div className="flex justify-between text-[11px] text-brand-dark/60">
                  <span>TASA ADQUIRIDA:</span>
                  <span>1.85% mensual</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setStep("dispatch");
                  }}
                  className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold"
                >
                  Confirmar y Solicitar Despacho 🚚
                </button>
                <button
                  onClick={() => setStep("landing")}
                  className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark hover:underline block w-full text-center"
                >
                  Volver al inicio de Tarjetas
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-accent-coral/10 text-accent-coral rounded-full flex items-center justify-center mx-auto border border-accent-coral/20">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <span className="font-mono text-xs text-accent-coral font-bold">SOLICITUD EN EVALUACIÓN</span>
                <h3 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
                  Evaluación de Riesgo Adicional
                </h3>
                <p className="text-xs text-brand-dark/70 mt-1 leading-relaxed">
                  Para otorgar tu cupo, un ejecutivo debe revisar manualmente tus cotizaciones de AFP o carpeta tributaria de independiente.
                </p>
              </div>

              <div className="p-4 bg-brand-dark/5 rounded-xl text-left text-xs text-brand-dark/80 space-y-2 font-mono">
                <p>• Folio de Seguimiento: <strong className="text-brand-dark">{folio}</strong></p>
                <p>• Estado: Documentación pendiente</p>
                <p>• Plazo de respuesta: 24 hrs hábiles</p>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    alert("¡Gracias! Adjuntaremos tu evaluación al sistema de ejecutivos.");
                    navigate("/");
                  }}
                  className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold"
                >
                  Subir Liquidación de Sueldo (Opcional) 📁
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark hover:underline block w-full text-center"
                >
                  Volver a la Home
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {step === "dispatch" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl animate-fade-in shadow-sm">
          {!dispatchSuccess ? (
            <>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setStep("result")}
                  className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Volver
                </button>
                <span className="font-mono text-[10px] text-accent-lavender font-bold uppercase block">Envío a Domicilio</span>
                <h3 className="font-display text-lg tracking-tight">Datos de Despacho</h3>
                <p className="text-xs text-brand-dark/70">Confirma la información para el envío certificado de tu nueva tarjeta.</p>
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleAutofill}
                  className="w-full py-2 bg-accent-lavender/10 hover:bg-accent-lavender/20 border border-accent-lavender/30 text-brand-dark font-mono text-[11px] uppercase tracking-wider rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  ⚡ Rellenar datos de prueba
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg text-xs flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent-coral shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleDispatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                    Nombre Completo del Destinatario
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Sebastián Allende"
                    value={nombreDespacho}
                    onChange={(e) => setNombreDespacho(e.target.value)}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-[#FDFDFD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                    Dirección de Despacho (Calle, Número, Depto/Casa)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Av. Providencia 1234, Depto 402"
                    value={direccionDespacho}
                    onChange={(e) => setDireccionDespacho(e.target.value)}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-[#FDFDFD]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                      Región
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Metropolitana"
                      value={regionDespacho}
                      onChange={(e) => setRegionDespacho(e.target.value)}
                      className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-[#FDFDFD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                      Comuna
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Providencia"
                      value={comunaDespacho}
                      onChange={(e) => setComunaDespacho(e.target.value)}
                      className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-[#FDFDFD]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                    Teléfono de Contacto
                  </label>
                  <div className="flex">
                    <select
                      value={indicativoPaisDespacho}
                      onChange={(e) => setIndicativoPaisDespacho(e.target.value)}
                      className="bg-brand-dark/5 border border-r-0 border-brand-dark/20 p-3 text-xs font-mono text-brand-dark rounded-l-xl focus:outline-none focus:border-brand-dark cursor-pointer select-none max-w-[120px]"
                    >
                      {[
                        { code: "+56", country: "Chile" },
                        { code: "+54", country: "Argentina" },
                        { code: "+51", country: "Perú" },
                        { code: "+57", country: "Colombia" },
                        { code: "+52", country: "México" },
                        { code: "+55", country: "Brasil" },
                        { code: "+593", country: "Ecuador" },
                        { code: "+598", country: "Uruguay" },
                        { code: "+591", country: "Bolivia" },
                        { code: "+595", country: "Paraguay" },
                        { code: "+58", country: "Venezuela" },
                        { code: "+506", country: "Costa Rica" },
                        { code: "+507", country: "Panamá" },
                        { code: "+502", country: "Guatemala" },
                        { code: "+504", country: "Honduras" },
                        { code: "+503", country: "El Salvador" },
                        { code: "+505", country: "Nicaragua" },
                        { code: "+1", country: "Rep. Dominicana" },
                      ].map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} ({item.country})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="912345678"
                      maxLength={11}
                      value={telefonoDespacho}
                      onChange={(e) => setTelefonoDespacho(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full p-3 border border-brand-dark/20 rounded-r-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                    Indicaciones de Entrega (Opcional)
                  </label>
                  <textarea
                    placeholder="Ej. Dejar en conserjería, llamar antes de llegar..."
                    value={indicacionesEntrega}
                    onChange={(e) => setIndicacionesEntrega(e.target.value)}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-sans bg-[#FDFDFD] h-20 resize-none animate-fade-in"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  Confirmar Envío Seguro 🚚
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 animate-fade-in py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <span className="font-mono text-xs text-accent-lavender font-bold">ENVÍO COORDINADO</span>
                <h3 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
                  ¡Despacho en Camino!
                </h3>
                <p className="text-xs text-brand-dark/70 mt-1">
                  Tu tarjeta MindersCredit Black ha sido emitida y empaquetada con éxito.
                </p>
              </div>

              <div className="p-5 bg-brand-bg rounded-xl font-mono text-xs text-left border border-brand-dark/5 space-y-2">
                <div className="flex justify-between">
                  <span>NÚMERO DE SEGUIMIENTO:</span>
                  <span className="font-bold text-accent-lavender">TRK-{folio}</span>
                </div>
                <div className="flex justify-between border-t border-brand-dark/5 pt-2 mt-2">
                  <span>DESTINATARIO:</span>
                  <span className="font-bold">{nombreDespacho}</span>
                </div>
                <div className="flex justify-between">
                  <span>DIRECCIÓN:</span>
                  <span className="font-bold truncate max-w-[200px]">{direccionDespacho}</span>
                </div>
                <div className="flex justify-between">
                  <span>COMUNA:</span>
                  <span className="font-bold">{comunaDespacho}</span>
                </div>
                <div className="flex justify-between">
                  <span>TELÉFONO:</span>
                  <span className="font-bold">{indicativoPaisDespacho} {telefonoDespacho}</span>
                </div>
              </div>

              <p className="text-xs text-brand-dark/60 leading-relaxed font-sans">
                El plazo estimado de entrega para tu domicilio en <strong>{comunaDespacho}</strong> es de 2 a 3 días hábiles. Te enviaremos un SMS con actualizaciones en tiempo real.
              </p>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold cursor-pointer"
              >
                Volver a la Página Principal
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
