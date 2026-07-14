import { amplitudeService } from "../services/amplitude.service";
import React, { useState, useEffect } from "react";
import { trackEvent } from "../analytics";
import { useRouter } from "../RouterContext";
import { useAuth } from "../hooks/useAuth";
import { Landmark, ArrowLeft, CheckCircle2, ShieldCheck, DollarSign, Wallet, Percent, AlertCircle } from "lucide-react";

interface AhorroEInversionesProps {
  onOpenLogin: () => void;
}

export default function AhorroEInversiones({ onOpenLogin }: AhorroEInversionesProps) {
  const { navigate } = useRouter();
  const { user } = useAuth();

  // Route: "dap" or "ahorro"
  const [subView, setSubView] = useState<"dap" | "ahorro">("dap");

  // --- DAP CALCULATOR STATES ---
  const [montoDAP, setMontoDAP] = useState<number>(1000000);
  const [plazoDias, setPlazoDias] = useState<number>(90);
  const [renovacionAutomatica, setRenovacionAutomatica] = useState(false);
  
  // DAP Computations
  const [tasaDAP, setTasaDAP] = useState(0.48); // % monthly rate
  const [interesGanado, setInteresGanado] = useState(0);
  const [montoFinalDAP, setMontoFinalDAP] = useState(0);
  const [dapSuccess, setDapSuccess] = useState(false);

  // --- SAVINGS ACCOUNT STATES ---
  const [tipoAhorro, setTipoAhorro] = useState<"adulto" | "nino" | "vivienda">("adulto");
  const [ahorroStep, setAhorroStep] = useState<"landing" | "form" | "success">("landing");
  const [nombreTitular, setNombreTitular] = useState("");
  const [rutTitular, setRutTitular] = useState("");

  useEffect(() => {
    if (user) {
      setNombreTitular(`${user.first_name} ${user.last_name}`);
      setRutTitular(user.rut);
    } else {
      setNombreTitular("");
      setRutTitular("");
    }
  }, [user]);
  const [depositoMensual, setDepositoMensual] = useState<number>(15000);
  const [errorAhorro, setErrorAhorro] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("tipo");

    if (path.includes("cuentas-ahorro") || hash.includes("cuentas-ahorro")) {
      setSubView("ahorro");
      setAhorroStep("landing");
      if (cat === "nino" || cat === "vivienda" || cat === "adulto") {
        setTipoAhorro(cat);
      }
      trackEvent("cuentas_ahorro_vista");
    } else {
      setSubView("dap");
      trackEvent("dap_vista");
    }
  }, [window.location.pathname, window.location.hash, window.location.search]);

  // Recalculate DAP Interest
  useEffect(() => {
    // Dynamic rate based on terms (longer plazo = slightly higher rate)
    let rateMonthly = 0.45;
    if (plazoDias >= 180) rateMonthly = 0.52;
    if (plazoDias >= 360) rateMonthly = 0.60;
    setTasaDAP(rateMonthly);

    const periodFactor = plazoDias / 30;
    const ratePeriod = (rateMonthly / 100) * periodFactor;
    const interest = Math.round(montoDAP * ratePeriod);
    setInteresGanado(interest);
    setMontoFinalDAP(montoDAP + interest);

    if (subView === "dap" && !dapSuccess) {
      trackEvent("dap_simulado", {
        monto: montoDAP,
        plazo: plazoDias,
        interes_ganado: interest,
        renovacion: renovacionAutomatica,
      });
    }
  }, [montoDAP, plazoDias, renovacionAutomatica, subView]);

  const handleInvertirDAP = () => {
    if (!user) {
      trackEvent("dap_intento_login_requerido");
      alert("Para realizar inversiones en Depósito a Plazo, debes iniciar sesión.");
      onOpenLogin();
      return;
    }

    amplitudeService.trackRevenue("dap_invertido", {
      monto: montoDAP,
      plazo: plazoDias,
      interes_estimado: interesGanado,
    }, "deposito_plazo", montoDAP, 1);
    amplitudeService.incrementJourneysCompleted();
    amplitudeService.appendProduct("deposito_plazo");
    setDapSuccess(true);
  };

  const handleAhorroStart = (type: "adulto" | "nino" | "vivienda") => {
    setTipoAhorro(type);
    setAhorroStep("form");
    setNombreTitular(user ? `${user.first_name} ${user.last_name}` : "");
    setRutTitular(user?.rut || "");
    trackEvent("ahorro_onboarding_iniciado", { tipo: type });
  };

  const handleAhorroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAhorro("");

    if (!nombreTitular || !rutTitular) {
      setErrorAhorro("El nombre y RUT del titular son obligatorios.");
      return;
    }
    if (depositoMensual < 5000) {
      setErrorAhorro("El depósito mínimo para abrir la cuenta es $5.000 CLP.");
      return;
    }

    trackEvent("ahorro_abierto", {
      tipo: tipoAhorro,
      rut: rutTitular,
      monto_apertura: depositoMensual,
    });
    setAhorroStep("success");
  };

  const clpFormat = (num: number) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
      
      {/* SECTION SELECTOR TABS */}
      <div className="flex justify-center mb-8 border-b border-brand-dark/10">
        <button
          onClick={() => {
            setSubView("dap");
            navigate("/deposito-a-plazo");
          }}
          className={`py-3 px-6 font-display text-base border-b-2 transition-all ${subView === "dap" ? "border-brand-dark text-brand-dark" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Depósito a Plazo (DAP)
        </button>
        <button
          onClick={() => {
            setSubView("ahorro");
            navigate("/cuentas-ahorro");
          }}
          className={`py-3 px-6 font-display text-base border-b-2 transition-all ${subView === "ahorro" ? "border-brand-dark text-brand-dark" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Cuentas de Ahorro MC.
        </button>
      </div>

      {/* VIEW A: DEPOSITO A PLAZO INVESTMENT */}
      {subView === "dap" && (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/50">
              05 — Multiplica tus excedentes
            </span>
            <h2 className="font-display text-3xl tracking-tight text-brand-dark mt-1">
              Simulador de Depósito a Plazo
            </h2>
            <p className="text-xs text-brand-dark/70 mt-1">
              Invierte en pesos chilenos bajo la solidez y garantía cooperativa de MindersCredit.
            </p>
          </div>

          {!dapSuccess ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-brand-dark/10 p-6 md:p-8 rounded-3xl">
              {/* Sliders and inputs */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Monto de Inversion */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-mono uppercase text-brand-dark/80">Monto a Invertir</label>
                    <span className="font-mono text-sm font-bold text-brand-dark">
                      {clpFormat(montoDAP)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={50000000}
                    step={50000}
                    value={montoDAP}
                    onChange={(e) => setMontoDAP(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-brand-dark/10 rounded-lg appearance-none cursor-pointer accent-brand-dark"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-brand-dark/40 mt-1">
                    <span>$50.000</span>
                    <span>$25.000.000</span>
                    <span>$50.000.000</span>
                  </div>
                </div>

                {/* Plazo en dias */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-mono uppercase text-brand-dark/80">Plazo de la Inversión (Días)</label>
                    <span className="font-mono text-sm font-bold text-brand-dark">
                      {plazoDias} Días
                    </span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={365}
                    step={15}
                    value={plazoDias}
                    onChange={(e) => setPlazoDias(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-brand-dark/10 rounded-lg appearance-none cursor-pointer accent-brand-dark"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-brand-dark/40 mt-1">
                    <span>30 días</span>
                    <span>90 d</span>
                    <span>180 d</span>
                    <span>365 días</span>
                  </div>
                </div>

                {/* Renovacion automatica checkbox */}
                <div className="p-4 bg-brand-dark/5 rounded-2xl border border-brand-dark/5 flex justify-between items-center">
                  <div>
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-dark">Renovación Automática</h4>
                    <p className="text-[10px] text-brand-dark/60 mt-0.5">Al expirar el plazo, se reinvierte el total acumulado de inmediato.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={renovacionAutomatica}
                      onChange={(e) => setRenovacionAutomatica(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-brand-dark/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
                  </label>
                </div>
              </div>

              {/* Yield summary sidebar */}
              <div className="lg:col-span-5 bg-[#F9F9F9] border border-brand-dark/10 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#0F766E] font-bold block mb-1">
                    Rentabilidad Proyectada
                  </span>
                  
                  <div className="my-4">
                    <span className="text-[10px] font-mono text-brand-dark/60 block">INTERÉS TOTAL GANADO</span>
                    <span className="font-display text-2xl text-[#0F766E] block tracking-tight">
                      + {clpFormat(interesGanado)}
                    </span>
                    <span className="text-xs font-mono text-brand-dark/50 block mt-1">
                      Tasa mensual equivalente: {tasaDAP}%
                    </span>
                  </div>

                  <div className="space-y-1.5 border-t border-brand-dark/10 pt-4 text-xs font-mono text-brand-dark/80">
                    <div className="flex justify-between">
                      <span>Monto Solicitado:</span>
                      <span>{clpFormat(montoDAP)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plazo:</span>
                      <span>{plazoDias} días</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vencimiento:</span>
                      <span>{new Date(Date.now() + plazoDias * 24 * 60 * 60 * 1000).toLocaleDateString("es-CL")}</span>
                    </div>
                    <div className="flex justify-between border-t border-brand-dark/5 pt-1.5 font-bold text-brand-dark">
                      <span>Monto a Recibir:</span>
                      <span>{clpFormat(montoFinalDAP)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleInvertirDAP}
                  className="w-full mt-6 py-3.5 bg-brand-dark text-white font-mono text-xs uppercase tracking-wider rounded-full hover:bg-brand-dark/95 transition-all text-center font-bold"
                  data-amp-event="btn_dap_invertir"
                  data-amp-props={JSON.stringify({ monto: montoDAP, plazo: plazoDias })}
                >
                  Confirmar e Invertir Capital 📈
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-display text-2xl tracking-tight text-[#0F766E]">
                ¡Inversión Procesada con Éxito!
              </h3>
              <p className="text-sm text-brand-dark/80 leading-relaxed">
                Hemos constituido tu Depósito a Plazo bajo el Folio <strong className="font-mono">DAP-{Math.floor(100000 + Math.random()*900000)}</strong>. Se ha descontado el capital de tu Cuenta Vista.
              </p>
              
              <div className="p-5 bg-brand-bg rounded-xl font-mono text-xs text-left border border-brand-dark/5 space-y-2">
                <div className="flex justify-between">
                  <span>MONTO DEPOSITADO:</span>
                  <span className="font-bold">{clpFormat(montoDAP)}</span>
                </div>
                <div className="flex justify-between">
                  <span>RETORNO ESTIMADO:</span>
                  <span className="font-bold text-[#0F766E]">{clpFormat(montoFinalDAP)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-brand-dark/60 border-t border-brand-dark/5 pt-2 mt-2">
                  <span>FECHA DE VENCIMIENTO:</span>
                  <span>{new Date(Date.now() + plazoDias * 24 * 60 * 60 * 1000).toLocaleDateString("es-CL")}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2 flex flex-col">
                <button
                  onClick={() => {
                    setDapSuccess(false);
                    setMontoDAP(1000000);
                  }}
                  className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase hover:bg-brand-dark/95 transition-all font-bold"
                >
                  Volver a simular DAP
                </button>
                <button
                  onClick={() => navigate("/mi-minderscredit")}
                  className="text-xs font-mono text-brand-dark/60 hover:text-brand-dark hover:underline"
                >
                  Ver mis Inversiones Privadas
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW B: CUENTAS DE AHORRO MULTIPRODUCTO */}
      {subView === "ahorro" && (
        <div className="space-y-8 animate-fade-in">
          
          {ahorroStep === "landing" && (
            <>
              <div className="text-center max-w-xl mx-auto">
                <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/50">
                  06 — Ahorro sistemático cooperativo
                </span>
                <h2 className="font-display text-3xl tracking-tight text-brand-dark mt-1">
                  Nuestras Cuentas de Ahorro
                </h2>
                <p className="text-xs text-brand-dark/70 mt-1">
                  Diseñadas para cumplir metas reales con reajustabilidad garantizada UF y capital seguro de por vida.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Adulto */}
                <div className="p-6 bg-white border border-brand-dark/10 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-accent-lavender block mb-1">PROGRAMA ADULTO</span>
                    <h3 className="font-display text-base text-brand-dark mb-2">Cuenta Ahorro Adulto</h3>
                    <p className="text-xs text-brand-dark/70 leading-relaxed font-sans">
                      Rentabilidad de reajuste anual más un interés garantizado del **1.5% anual**. Ideal para resguardar tu patrimonio contra la inflación de forma segura.
                    </p>
                  </div>
                  <button
                    onClick={() => handleAhorroStart("adulto")}
                    className="w-full mt-6 py-2.5 bg-brand-dark text-white font-mono text-[10px] uppercase tracking-wider rounded-lg text-center hover:bg-brand-dark/95 transition-all font-bold"
                  >
                    Abrir Cuenta Ahorro →
                  </button>
                </div>

                {/* 2. Niño */}
                <div className="p-6 bg-white border border-brand-dark/10 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-accent-cyan block mb-1">PROGRAMA INFANTIL</span>
                    <h3 className="font-display text-base text-brand-dark mb-2">Cuenta Ahorro Niños</h3>
                    <p className="text-xs text-brand-dark/70 leading-relaxed font-sans">
                      Abre el futuro financiero de tus hijos de $0 de mantención de por vida. Fomenta el hábito del ahorro mediante recompensas de participación cooperativa infantil.
                    </p>
                  </div>
                  <button
                    onClick={() => handleAhorroStart("nino")}
                    className="w-full mt-6 py-2.5 bg-brand-dark text-white font-mono text-[10px] uppercase tracking-wider rounded-lg text-center hover:bg-brand-dark/95 transition-all font-bold"
                  >
                    Abrir Cuenta Niños →
                  </button>
                </div>

                {/* 3. Vivienda */}
                <div className="p-6 bg-white border border-brand-dark/10 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-accent-coral block mb-1">PROGRAMA SUBSIDIOS</span>
                    <h3 className="font-display text-base text-brand-dark mb-2">Cuenta Ahorro Vivienda</h3>
                    <p className="text-xs text-brand-dark/70 leading-relaxed font-sans">
                      Cuenta reajustable autorizada por el Ministerio de Vivienda y Urbanismo (MINVU). Indispensable para postular y adjudicarte subsidios habitacionales chilenos.
                    </p>
                  </div>
                  <button
                    onClick={() => handleAhorroStart("vivienda")}
                    className="w-full mt-6 py-2.5 bg-brand-dark text-white font-mono text-[10px] uppercase tracking-wider rounded-lg text-center hover:bg-brand-dark/95 transition-all font-bold"
                  >
                    Abrir Cuenta Vivienda →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* AHORRO STEP 2: OPEN FORM */}
          {ahorroStep === "form" && (
            <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl">
              <div className="mb-6">
                <button
                  onClick={() => setAhorroStep("landing")}
                  className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark flex items-center gap-1 mb-2"
                >
                  ← Volver
                </button>
                <h3 className="font-display text-lg tracking-tight uppercase">
                  Apertura Ahorro: {tipoAhorro}
                </h3>
                <p className="text-xs text-brand-dark/70">Define el monto de ahorro mensual para tu meta.</p>
              </div>

              {errorAhorro && (
                <div className="mb-4 p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 text-accent-coral shrink-0" />
                  <span>{errorAhorro}</span>
                </div>
              )}

              <form onSubmit={handleAhorroSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                    Titular de la Cuenta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Sebastián Allende"
                    value={nombreTitular}
                    onChange={(e) => setNombreTitular(e.target.value)}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-[#FDFDFD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                    RUT del Titular
                  </label>
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={rutTitular}
                    onChange={(e) => setRutTitular(e.target.value)}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                    Monto de Apertura / Depósito Inicial (CLP)
                  </label>
                  <input
                    type="number"
                    min={5000}
                    value={depositoMensual}
                    onChange={(e) => setDepositoMensual(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                  />
                  <span className="text-[10px] text-brand-dark/50 font-mono mt-1 block">
                    Mínimo requerido: $5.000 CLP.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold"
                >
                  Confirmar y Crear Cuenta Ahorro 🚀
                </button>
              </form>
            </div>
          )}

          {/* AHORRO STEP 3: SUCCESS */}
          {ahorroStep === "success" && (
            <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <span className="font-mono text-xs text-[#0F766E] font-bold">¡CUENTA CREADA CON ÉXITO!</span>
                <h3 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
                  Tu Libreta de Ahorro está Lista
                </h3>
                <p className="text-xs text-brand-dark/70 mt-1">
                  Ya puedes sistemizar tus abonos mensuales en tu cuenta de ahorro.
                </p>
              </div>

              <div className="p-5 bg-brand-bg rounded-xl font-mono text-xs text-left border border-brand-dark/5 space-y-2">
                <div className="flex justify-between">
                  <span>PROGRAMA ASOCIADO:</span>
                  <span className="font-bold uppercase">AHORRO {tipoAhorro}</span>
                </div>
                <div className="flex justify-between">
                  <span>N° DE LIBRETA:</span>
                  <span className="font-bold">AHO-{Math.floor(10000 + Math.random()*90000)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#0F766E] font-bold border-t border-brand-dark/5 pt-2 mt-2">
                  <span>DEPÓSITO INICIAL:</span>
                  <span>{clpFormat(depositoMensual)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2 flex flex-col">
                <button
                  onClick={() => navigate("/mi-minderscredit")}
                  className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase hover:bg-brand-dark/95 transition-all font-bold"
                >
                  Ir a mi Dashboard Privado 🔐
                </button>
                <button
                  onClick={() => setAhorroStep("landing")}
                  className="text-xs font-mono text-brand-dark/60 hover:text-brand-dark hover:underline"
                >
                  Volver a Cuentas de Ahorro
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
