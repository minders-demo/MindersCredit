import { amplitudeService } from "../services/amplitude.service";
import React, { useState, useEffect, useRef } from "react";
import { trackEvent, saveSimulatedUser } from "../analytics";
import { useRouter } from "../RouterContext";
import { CHILEAN_REGIONS } from "../data";
import { AlertCircle, ChevronRight, CheckCircle2, User, Landmark, ShieldAlert, ArrowLeft } from "lucide-react";
import { generateFakeData } from "../utils/demoHelper";

export default function OnboardingSocio() {
  const { navigate } = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: RUT & Serial Number
  const [rut, setRut] = useState("");
  const [serial, setSerial] = useState("");

  // Step 2: Personal Details
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [indicativoPais, setIndicativoPais] = useState("+56");
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedComunaId, setSelectedComunaId] = useState("");

  // Step 3: Subscription (Cuota de Participación)
  const [montoCuotas, setMontoCuotas] = useState(1000); // Fictional $1.000 / month
  const [aceptarTerminos, setAceptarTerminos] = useState(false);

  // Global Error state
  const [errorMsg, setErrorMsg] = useState("");

  const stepRef = useRef(step);
  const completedRef = useRef(false);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const origen = params.get("origen") || "directo";
    trackEvent("hazte_socio_iniciado", { origen });
    return () => {
      if (!completedRef.current && stepRef.current < 4) {
        trackEvent("hazte_socio_abandonado", { 
          ultimo_paso_completado: stepRef.current === 1 ? 0 : stepRef.current - 1 
        });
      }
    };
  }, []);

  const handleAutofill = () => {
    const data = generateFakeData();
    // Step 1
    setRut(formatRut(data.rut));
    setSerial(data.serial);
    // Step 2
    setNombre(data.name);
    setApellido(`${data.lastName1} ${data.lastName2}`);
    setEmail(data.email);
    setTelefono(data.phone);
    setIndicativoPais("+56");
    setSelectedRegionId(data.regionId);
    setSelectedComunaId(data.comunaId);
    // Step 3
    setMontoCuotas(25000);
    setAceptarTerminos(true);

    trackEvent("autofill_demo_clicked", { form: "onboarding_socio", paso_actual: step });
  };

  // Format RUT
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

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!rut) {
      setErrorMsg("El RUT es obligatorio.");
      trackEvent("error_validacion", { campo: "onboarding_rut", mensaje: "RUT vacío" });
      return;
    }

    if (!validateRut(rut)) {
      setErrorMsg("El RUT ingresado no es válido.");
      trackEvent("error_validacion", { campo: "onboarding_rut", mensaje: "RUT inválido" });
      return;
    }

    if (!serial || serial.length < 9) {
      setErrorMsg("Ingresa un número de serie de cédula válido (generalmente 9 o más caracteres).");
      trackEvent("error_validacion", { campo: "onboarding_serial", mensaje: "Serial inválido" });
      return;
    }

    trackEvent("hazte_socio_paso_completado", { numero_paso: 1, nombre_paso: "autenticacion_cedula" });
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nombre || !apellido) {
      setErrorMsg("Ingresa tu nombre y apellidos completos.");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMsg("Ingresa un correo electrónico válido.");
      return;
    }

    if (!telefono || telefono.length < 7 || telefono.length > 12) {
      setErrorMsg("Ingresa un número telefónico válido (entre 7 y 12 dígitos).");
      return;
    }

    if (!selectedRegionId || !selectedComunaId) {
      setErrorMsg("Debes seleccionar tu región y comuna de residencia.");
      return;
    }

    trackEvent("hazte_socio_paso_completado", { numero_paso: 2, nombre_paso: "datos_personales" });
    setStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!aceptarTerminos) {
      setErrorMsg("Debes leer y aceptar los términos cooperativos y estatutos de socio.");
      return;
    }

    // Process Complete Socio Onboarding
    const regionObj = CHILEAN_REGIONS.find((r) => r.id === selectedRegionId);
    const comunaObj = regionObj?.comunas.find((c) => c.id === selectedComunaId);

    const userObj = {
      rut: rut,
      nombre: `${nombre} ${apellido}`,
      es_socio: true,
      region: regionObj?.name || "",
      comuna: comunaObj?.name || "",
    };

    completedRef.current = true;
    saveSimulatedUser(userObj);
    trackEvent("hazte_socio_completado", {
      monto_suscrito_mensual: montoCuotas,
      comuna: userObj.comuna,
      region: userObj.region,
    });
    amplitudeService.incrementJourneysCompleted();
    setStep(4);
  };

  const selectedRegion = CHILEAN_REGIONS.find((r) => r.id === selectedRegionId);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
      {/* Onboarding Header */}
      <div className="mb-10 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/50">
          02 — Únete a la cooperativa
        </span>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-brand-dark mt-2 mb-6">
          Hazte Socio de MindersCredit
        </h1>

        {/* Step bars */}
        <div className="flex justify-center items-center gap-2 max-w-sm mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-brand-dark" : "bg-brand-dark/10"}`}
            />
          ))}
        </div>
        <div className="flex justify-between max-w-sm mx-auto mt-2 font-mono text-[9px] uppercase text-brand-dark/60">
          <span>1. Validar</span>
          <span>2. Datos</span>
          <span>3. Cuota</span>
          <span>4. Listo!</span>
        </div>
      </div>

      <div className="bg-white border border-brand-dark/10 p-6 md:p-8" style={{ borderRadius: "18px" }}>
        
        {step < 4 && (
          <div className="mb-6 pb-6 border-b border-brand-dark/10">
            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2.5 bg-accent-lavender/10 hover:bg-accent-lavender/20 border border-accent-lavender/30 text-brand-dark font-mono text-xs uppercase tracking-wider rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              ⚡ Rellenar datos de prueba
            </button>
          </div>
        )}

        {/* STEP 1: VALIDATE IDENTITY */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="border-b border-brand-dark/5 pb-3">
              <h3 className="font-display text-lg tracking-tight">Paso 1: Validación de Identidad</h3>
              <p className="text-xs text-brand-dark/70 mt-1">
                Ingresa tu RUT y el número de serie de tu cédula para validar que eres tú.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg flex items-center gap-2 text-xs text-brand-dark">
                <AlertCircle className="w-4 h-4 text-accent-coral shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                  RUT del Solicitante
                </label>
                <input data-amp-mask
                  type="text"
                  placeholder="12.345.678-9"
                  value={rut}
                  onChange={(e) => setRut(formatRut(e.target.value))}
                  className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                  
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                  Número de Serie / Documento
                </label>
                <input data-amp-mask
                  type="text"
                  placeholder="A112233445"
                  maxLength={11}
                  value={serial}
                  onChange={(e) => setSerial(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                  className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                  
                />
                <span className="text-[10px] text-brand-dark/50 font-mono mt-1 block">
                  Se encuentra al frente o reverso de tu cédula.
                </span>
              </div>
            </div>

            <div className="p-4 bg-brand-dark/5 rounded-2xl border border-brand-dark/5 flex gap-3 text-xs text-brand-dark/70">
              <ShieldAlert className="w-5 h-5 text-accent-lavender shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-brand-dark">Protección de Datos Garantizada</p>
                <p className="mt-0.5">
                  Cumplimos con la Ley N° 19.628 de protección de la vida privada. Tu información de cédula solo se utiliza para validación de identidad ante registros oficiales.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-dark/5 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 bg-brand-dark text-white font-mono text-xs uppercase tracking-widest rounded-full hover:bg-brand-dark/90 transition-all flex items-center gap-1"
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PERSONAL DETAILS */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-3">
              <div>
                <h3 className="font-display text-lg tracking-tight">Paso 2: Datos Personales</h3>
                <p className="text-xs text-brand-dark/70 mt-1">Ingresa tu dirección y datos de contacto.</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-mono text-brand-dark/60 hover:text-brand-dark flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Volver
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg flex items-center gap-2 text-xs text-brand-dark">
                <AlertCircle className="w-4 h-4 text-accent-coral shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                  Nombres
                </label>
                <input data-amp-mask
                  type="text"
                  placeholder="Ej. Sebastián Alejandro"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-[#FDFDFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                  Apellidos
                </label>
                <input data-amp-mask
                  type="text"
                  placeholder="Ej. Allende Torres"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-[#FDFDFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                  Email de Contacto
                </label>
                <input data-amp-mask
                  type="email"
                  placeholder="Ej. s.allende@correo.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-[#FDFDFD]"
                />
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
                  <input data-amp-mask
                    type="tel"
                    placeholder="912345678"
                    maxLength={11}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full p-3 border border-brand-dark/20 rounded-r-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                  Región de Residencia
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => {
                    setSelectedRegionId(e.target.value);
                    setSelectedComunaId("");
                  }}
                  className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-white font-sans"
                >
                  <option value="">Selecciona una región...</option>
                  {CHILEAN_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                  Comuna de Residencia
                </label>
                <select
                  value={selectedComunaId}
                  onChange={(e) => setSelectedComunaId(e.target.value)}
                  disabled={!selectedRegionId}
                  className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-white font-sans disabled:opacity-55"
                >
                  <option value="">Selecciona una comuna...</option>
                  {selectedRegion?.comunas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-dark/5 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 bg-brand-dark text-white font-mono text-xs uppercase tracking-widest rounded-full hover:bg-brand-dark/90 transition-all flex items-center gap-1"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CUOTA DE PARTICIPACION */}
        {step === 3 && (
          <form onSubmit={handleStep3Submit} className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-dark/5 pb-3">
              <div>
                <h3 className="font-display text-lg tracking-tight">Paso 3: Aporte de Capital Cooperativo</h3>
                <p className="text-xs text-brand-dark/70 mt-1">
                  Para ser socio, suscribes una Cuota de Participación mensual que capitaliza tu propiedad.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-mono text-brand-dark/60 hover:text-brand-dark flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Volver
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg flex items-center gap-2 text-xs text-brand-dark">
                <AlertCircle className="w-4 h-4 text-accent-coral shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-6 bg-brand-dark/5 rounded-2xl border border-brand-dark/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs uppercase tracking-wider text-brand-dark/70">
                  Cuota de Participación Mensual
                </span>
                <span className="font-display text-xl text-brand-dark font-bold">
                  $1.000 CLP / mes
                </span>
              </div>
              <p className="text-[11px] text-brand-dark/70 leading-relaxed">
                Este valor es tu aporte social. Es acumulable y forma parte de tu capital cooperativo colectivo. Si en el futuro decides renunciar a ser socio, este dinero acumulado te será devuelto íntegramente según los estatutos vigentes.
              </p>
              
              <div className="bg-brand-dark text-white p-4 rounded-xl flex items-start gap-3 mt-2">
                <Landmark className="w-5 h-5 text-accent-cyan shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono text-[10px] uppercase text-accent-cyan font-bold">Beneficio de Socio Activo</p>
                  <p className="text-[11px] text-white/80 mt-1">
                    Como socio adquieres copropiedad de la cooperativa. Al cierre del año fiscal, tienes derecho a recibir el **Remanente** de utilidades proporcional a tus cuotas.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-start gap-2.5 text-xs text-brand-dark/80 cursor-pointer select-none">
                <input data-amp-mask
                  type="checkbox"
                  checked={aceptarTerminos}
                  onChange={(e) => setAceptarTerminos(e.target.checked)}
                  className="w-4 h-4 border-brand-dark/20 rounded accent-brand-dark mt-0.5"
                />
                <span>
                  Declaro que he leído y acepto los Estatutos Sociales, el Reglamento de Derechos de Socios de MindersCredit, y autorizo el cobro de la cuota social de $1.000 mensual mediante descuento en Cuenta Vista o cobro equivalente.
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-brand-dark/5 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 bg-brand-dark text-white font-mono text-xs uppercase tracking-widest rounded-full hover:bg-[#0F766E] transition-all flex items-center gap-1 font-bold"
              >
                Firmar y Asociarse 📝
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="py-8 text-center space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            
            <div>
              <span className="font-mono text-xs uppercase text-accent-lavender font-bold">¡PROCESO COMPLETADO!</span>
              <h3 className="font-display text-3xl tracking-tight text-brand-dark mt-1">
                ¡Bienvenido a MindersCredit, Socio!
              </h3>
              <p className="text-sm text-brand-dark/70 mt-2">
                Hola <strong>{nombre}</strong>, ya eres socio oficial de nuestra cooperativa digital de ahorro y crédito. Tu número de registro social es <strong className="font-mono">SOC-{Math.floor(100000 + Math.random()*900000)}</strong>.
              </p>
            </div>

            {/* Cross-Sell Card Account */}
            <div className="p-5 border border-[#0F766E]/20 bg-emerald-50 rounded-2xl text-left space-y-3">
              <h4 className="font-display text-sm text-[#0F766E] flex items-center gap-1">
                <Landmark className="w-4 h-4" />
                Incentivo de Bienvenida: Cuenta Vista $0
              </h4>
              <p className="text-xs text-brand-dark/80">
                Abre de inmediato tu Cuenta Vista MindersCredit con costo de mantención $0 de por vida para abonar tus futuros beneficios y administrar tus ahorros sin cobros.
              </p>
              <button
                onClick={() => navigate("/cuenta-vista")}
                className="w-full mt-2 py-2 px-4 bg-brand-dark text-white font-mono text-[10px] uppercase tracking-wider rounded-lg text-center hover:bg-brand-dark/90 transition-all font-bold"
              >
                Abrir Cuenta Vista Costo $0 →
              </button>
            </div>

            <div className="pt-4 flex flex-col gap-2.5">
              <button
                onClick={() => navigate("/mi-minderscredit")}
                className="w-full py-3 bg-accent-lavender text-brand-dark font-mono text-xs uppercase tracking-wider rounded-full hover:bg-accent-lavender/90 transition-all font-bold"
              >
                Ir a mi Sitio Privado 🔐
              </button>
              <button
                onClick={() => navigate("/")}
                className="text-xs font-mono text-brand-dark/60 hover:text-brand-dark hover:underline"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
