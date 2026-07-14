import React, { useState, useEffect } from "react";
import { trackEvent } from "../analytics";
import { useRouter } from "../RouterContext";
import { BANK_LIST } from "../data";
import { Landmark, ArrowLeft, ArrowRight, CheckCircle2, Info, Percent, RefreshCw } from "lucide-react";

export default function HipotecarioYPortabilidad() {
  const { navigate } = useRouter();

  // Route selector: "hipotecario" or "portabilidad"
  const [viewType, setViewType] = useState<"hipotecario" | "portabilidad">("hipotecario");

  // --- HIPOTECARIO STATES ---
  const [tipoHipotecario, setTipoHipotecario] = useState<"normal" | "verde" | "joven" | "subsidio">("normal");
  const [valorPropiedadUF, setValorPropiedadUF] = useState<number>(2500);
  const [porcentajePie, setPorcentajePie] = useState<number>(20);
  const [plazoAnos, setPlazoAnos] = useState<15 | 20 | 25 | 30>(25);

  // Computed Hipotecario values
  const [valorPieUF, setValorPieUF] = useState(0);
  const [montoCreditoUF, setMontoCreditoUF] = useState(0);
  const [tasaAnual, setTasaAnual] = useState(4.2);
  const [dividendoUF, setDividendoUF] = useState(0);
  const [dividendoCLP, setDividendoCLP] = useState(0);

  // CLP conversions
  const VALOR_UF_SIMULADO = 37850; // Dynamic simulated UF rate

  // --- PORTABILIDAD STATES ---
  const [bancoOrigen, setBancoOrigen] = useState("");
  const [creditoConsumo, setCreditoConsumo] = useState(false);
  const [tarjetaCredito, setTarjetaCredito] = useState(false);
  const [creditoHipotecario, setCreditoHipotecario] = useState(false);
  const [montoDeudaEstimada, setMontoDeudaEstimada] = useState<number>(5000000);
  const [rutSocio, setRutSocio] = useState("");
  const [nombreSocio, setNombreSocio] = useState("");
  const [celularSocio, setCelularSocio] = useState("");
  const [errorPorta, setErrorPorta] = useState("");
  const [portaSuccess, setPortaSuccess] = useState(false);

  useEffect(() => {
    // Detect sub-path or hash
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.includes("portabilidad") || hash.includes("portabilidad")) {
      setViewType("portabilidad");
      trackEvent("portabilidad_vista");
    } else {
      setViewType("hipotecario");
      trackEvent("hipotecario_vista");
    }
  }, [window.location.pathname, window.location.hash]);

  // Recalculate Hipotecario
  useEffect(() => {
    // Determine dynamic rate based on type
    let rate = 4.5;
    if (tipoHipotecario === "verde") rate = 3.9; // Eco discount
    if (tipoHipotecario === "joven") rate = 4.2;
    if (tipoHipotecario === "subsidio") rate = 4.0;
    setTasaAnual(rate);

    const pieVal = Math.round(valorPropiedadUF * (porcentajePie / 100));
    const creditVal = valorPropiedadUF - pieVal;
    setValorPieUF(pieVal);
    setMontoCreditoUF(creditVal);

    // Monthly interest calculation
    const rMonthly = rate / 12 / 100;
    const totalPayments = plazoAnos * 12;

    // French Amortization
    const factor = (rMonthly * Math.pow(1 + rMonthly, totalPayments)) / (Math.pow(1 + rMonthly, totalPayments) - 1);
    const divUF = creditVal * factor;
    const divCLP = Math.round(divUF * VALOR_UF_SIMULADO);

    setDividendoUF(parseFloat(divUF.toFixed(2)));
    setDividendoCLP(divCLP);

    if (viewType === "hipotecario") {
      trackEvent("hipotecario_calculado", {
        tipo: tipoHipotecario,
        valor_propiedad: valorPropiedadUF,
        pie: percentagePieText,
        dividendo_uf: divUF,
        dividendo_clp: divCLP,
      });
    }
  }, [tipoHipotecario, valorPropiedadUF, porcentajePie, plazoAnos, viewType]);

  const percentagePieText = `${porcentajePie}%`;

  const handlePortabilidadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPorta("");

    if (!bancoOrigen) {
      setErrorPorta("Debes seleccionar la institución financiera de origen.");
      return;
    }
    if (!creditoConsumo && !tarjetaCredito && !creditoHipotecario) {
      setErrorPorta("Debes marcar al menos un producto a portar.");
      return;
    }
    if (montoDeudaEstimada <= 0) {
      setErrorPorta("La deuda estimada debe ser mayor a $0.");
      return;
    }
    if (!rutSocio || !nombreSocio) {
      setErrorPorta("El nombre y RUT son obligatorios.");
      return;
    }

    trackEvent("portabilidad_completada", {
      banco_origen: bancoOrigen,
      monto_deuda: montoDeudaEstimada,
      productos: { consumo: creditoConsumo, tarjeta: tarjetaCredito, hipotecario: creditoHipotecario },
    });
    setPortaSuccess(true);
  };

  const clpFormat = (num: number) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
      
      {/* SECTION TABS */}
      <div className="flex justify-center mb-8 border-b border-brand-dark/10">
        <button
          onClick={() => {
            setViewType("hipotecario");
            navigate("/simulador/hipotecario");
          }}
          className={`py-3 px-6 font-display text-base border-b-2 transition-all ${viewType === "hipotecario" ? "border-brand-dark text-brand-dark" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Crédito Hipotecario MC.
        </button>
        <button
          onClick={() => {
            setViewType("portabilidad");
            navigate("/portabilidad");
          }}
          className={`py-3 px-6 font-display text-base border-b-2 transition-all ${viewType === "portabilidad" ? "border-brand-dark text-brand-dark" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Portabilidad Financiera
        </button>
      </div>

      {/* VIEW A: HIPOTECARIO SIMULATOR */}
      {viewType === "hipotecario" && (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/50">
              04 — El sueño de tu casa propia
            </span>
            <h2 className="font-display text-3xl tracking-tight text-brand-dark mt-1">
              Calcula tu Dividendo Hipotecario
            </h2>
            <p className="text-xs text-brand-dark/70 mt-1">
              Simula bajo tasa fija en UF. Ofrecemos financiamiento preferencial de hasta el 80% del valor comercial.
            </p>
          </div>

          {/* Sub-type products */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: "normal", label: "Hipotecario Normal", desc: "Tasa fija estándar" },
              { id: "verde", label: "Hipotecario Verde 🍃", desc: "Tasa preferente eco-vivienda" },
              { id: "joven", label: "Hipotecario Joven 🎓", desc: "Financiamiento hasta 30 años" },
              { id: "subsidio", label: "Hipotecario con Subsidio 🏠", desc: "Complementa subsidio MINVU" },
            ].map((prod) => (
              <button
                key={prod.id}
                onClick={() => setTipoHipotecario(prod.id as any)}
                className={`p-4 border text-left transition-all ${tipoHipotecario === prod.id ? "border-brand-dark bg-brand-dark/5 ring-1 ring-brand-dark" : "border-brand-dark/10 bg-white hover:border-brand-dark/20"}`}
                style={{ borderRadius: "14px" }}
              >
                <span className="font-display text-xs block text-brand-dark">{prod.label}</span>
                <span className="text-[10px] font-mono text-brand-dark/60 block mt-1">{prod.desc}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-brand-dark/10 p-6 md:p-8 rounded-3xl">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Propiedad value */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-mono uppercase text-brand-dark/80">Valor de la Propiedad</label>
                  <span className="font-mono text-xs font-bold text-brand-dark">
                    {valorPropiedadUF.toLocaleString("es-CL")} UF (~{clpFormat(valorPropiedadUF * VALOR_UF_SIMULADO)})
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={12000}
                  step={100}
                  value={valorPropiedadUF}
                  onChange={(e) => setValorPropiedadUF(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-brand-dark/10 rounded-lg appearance-none cursor-pointer accent-brand-dark"
                />
                <div className="flex justify-between text-[10px] font-mono text-brand-dark/40 mt-1">
                  <span>1.000 UF</span>
                  <span>6.000 UF</span>
                  <span>12.000 UF</span>
                </div>
              </div>

              {/* Pie % */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-mono uppercase text-brand-dark/80">Monto del Pie (Mín 10%)</label>
                  <span className="font-mono text-xs font-bold text-brand-dark">
                    {porcentajePie}% (~{valorPieUF.toLocaleString("es-CL")} UF)
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={40}
                  step={5}
                  value={porcentajePie}
                  onChange={(e) => setPorcentajePie(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-brand-dark/10 rounded-lg appearance-none cursor-pointer accent-brand-dark"
                />
                <div className="flex justify-between text-[10px] font-mono text-brand-dark/40 mt-1">
                  <span>10% Pie</span>
                  <span>20% Pie</span>
                  <span>40% Pie</span>
                </div>
              </div>

              {/* Plazo años */}
              <div>
                <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-2">Plazo en Años</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 25, 30].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setPlazoAnos(yr as any)}
                      className={`py-2 px-3 border font-mono text-xs rounded-xl transition-all ${plazoAnos === yr ? "bg-brand-dark text-white border-brand-dark" : "border-brand-dark/20 text-brand-dark/70 hover:bg-brand-dark/5"}`}
                    >
                      {yr} años
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-brand-dark/5 rounded-2xl border border-brand-dark/5 flex gap-2 items-start text-xs text-brand-dark/70">
                <Info className="w-5 h-5 text-accent-lavender shrink-0 mt-0.5" />
                <p>
                  Calculado bajo valor UF referencial de <strong>${VALOR_UF_SIMULADO.toLocaleString("es-CL")}</strong>. El dividendo definitivo incluye seguros obligatorios de desgravamen e incendio.
                </p>
              </div>
            </div>

            {/* Simulated Live Offer */}
            <div className="lg:col-span-5 bg-[#F9F9F9] border border-brand-dark/10 p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#0F766E] font-bold block mb-1">
                    Dividendo Estimado Mensual
                  </span>
                  <span className="font-display text-2xl text-brand-dark block tracking-tight">
                    {dividendoUF} UF
                  </span>
                  <span className="font-mono text-sm font-bold text-brand-dark/80 block">
                    ~ {clpFormat(dividendoCLP)} / mes
                  </span>
                </div>

                <div className="space-y-1.5 border-t border-brand-dark/10 pt-4 text-xs font-mono text-brand-dark/80">
                  <div className="flex justify-between">
                    <span>Monto Financiado:</span>
                    <span>{montoCreditoUF.toLocaleString("es-CL")} UF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aporte del Pie:</span>
                    <span>{valorPieUF.toLocaleString("es-CL")} UF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasa Anual Fija:</span>
                    <span className="font-bold text-[#0F766E]">{tasaAnual}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plazo total:</span>
                    <span>{plazoAnos} años</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  trackEvent("hipotecario_agenda_asesoria", { propiedad_uf: valorPropiedadUF });
                  navigate("/agenda-tu-hora?motivo=hipotecario");
                }}
                className="w-full mt-6 py-3.5 bg-brand-dark text-white font-mono text-xs uppercase tracking-wider rounded-full hover:bg-brand-dark/95 transition-all text-center font-bold"
              >
                Agendar Asesoría Hipotecaria 🗓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: PORTABILIDAD FINANCIERA */}
      {viewType === "portabilidad" && (
        <div className="max-w-2xl mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-3xl">
          <div className="text-center mb-6">
            <span className="font-mono text-xs uppercase tracking-widest text-accent-lavender font-bold">
              PORTABILIDAD SIN PAPELEOS
            </span>
            <h2 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
              Tráete tus Deudas y Paga Menos
            </h2>
            <p className="text-xs text-brand-dark/70">
              Disminuye tu carga financiera consolidando tus créditos a tasas preferentes de cooperativa.
            </p>
          </div>

          {!portaSuccess ? (
            <form onSubmit={handlePortabilidadSubmit} className="space-y-6">
              {errorPorta && (
                <div className="p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg text-xs flex gap-2">
                  <Info className="w-4 h-4 text-accent-coral shrink-0 mt-0.5" />
                  <span>{errorPorta}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Banco Origen */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                    Institución Financiera Actual
                  </label>
                  <select
                    value={bancoOrigen}
                    onChange={(e) => setBancoOrigen(e.target.value)}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm bg-white focus:outline-none font-sans"
                  >
                    <option value="">Selecciona tu banco o cooperativa...</option>
                    {BANK_LIST.map((bk) => (
                      <option key={bk} value={bk}>
                        {bk}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Products Checkbox */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-2">
                    Productos a Portar (Consolidar)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-3 border border-brand-dark/10 rounded-xl bg-brand-bg/50 cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={creditoConsumo}
                        onChange={(e) => setCreditoConsumo(e.target.checked)}
                        className="w-4 h-4 accent-brand-dark rounded"
                      />
                      Crédito Consumo
                    </label>

                    <label className="flex items-center gap-2 p-3 border border-brand-dark/10 rounded-xl bg-brand-bg/50 cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={tarjetaCredito}
                        onChange={(e) => setTarjetaCredito(e.target.checked)}
                        className="w-4 h-4 accent-brand-dark rounded"
                      />
                      Tarjeta Crédito
                    </label>

                    <label className="flex items-center gap-2 p-3 border border-brand-dark/10 rounded-xl bg-brand-bg/50 cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={creditoHipotecario}
                        onChange={(e) => setCreditoHipotecario(e.target.checked)}
                        className="w-4 h-4 accent-brand-dark rounded"
                      />
                      Hipotecario
                    </label>
                  </div>
                </div>

                {/* Estimated debt */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                    Monto Deuda Estimada (Pesos)
                  </label>
                  <input
                    type="number"
                    value={montoDeudaEstimada}
                    onChange={(e) => setMontoDeudaEstimada(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-brand-dark/5 pt-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Ej. Sebastián"
                      value={nombreSocio}
                      onChange={(e) => setNombreSocio(e.target.value)}
                      className="w-full p-2.5 border border-brand-dark/20 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">RUT</label>
                    <input
                      type="text"
                      placeholder="12.345.678-9"
                      value={rutSocio}
                      onChange={(e) => setRutSocio(e.target.value)}
                      className="w-full p-2.5 border border-brand-dark/20 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">Celular</label>
                    <input
                      type="tel"
                      placeholder="912345678"
                      value={celularSocio}
                      onChange={(e) => setCelularSocio(e.target.value)}
                      className="w-full p-2.5 border border-brand-dark/20 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold"
              >
                Solicitar Portabilidad Financiera ⚡
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-display text-2xl tracking-tight text-[#0F766E]">
                ¡Solicitud de Portabilidad Ingresada!
              </h3>
              <p className="text-sm text-brand-dark/80 leading-relaxed">
                Hemos recibido tu solicitud de portabilidad para tus compromisos financieros en <strong>{bancoOrigen}</strong>. Un ejecutivo de portabilidad cooperativa te contactará en un plazo máximo de 24 horas hábiles.
              </p>
              <div className="p-3 bg-brand-dark/5 rounded-xl font-mono text-xs max-w-xs mx-auto">
                Código de Gestión: PORTA-{Math.floor(10000 + Math.random()*90000)}
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setPortaSuccess(false);
                    setBancoOrigen("");
                    setCreditoConsumo(false);
                    setTarjetaCredito(false);
                    setCreditoHipotecario(false);
                  }}
                  className="px-6 py-2.5 border border-brand-dark/20 rounded-full font-mono text-xs"
                >
                  Volver a Simular
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
