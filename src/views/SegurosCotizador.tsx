import { amplitudeService } from "../services/amplitude.service";
import React, { useState, useEffect } from "react";
import { trackEvent } from "../analytics";
import { useRouter } from "../RouterContext";
import { SEGUROS_CONFIG, SeguroConfig, SeguroPlan } from "../data";
import { Heart, Home, Car, ShieldAlert, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

export default function SegurosCotizador() {
  const { navigate } = useRouter();

  // Selected product config. If none, we display the grid list.
  const [selectedProduct, setSelectedProduct] = useState<SeguroConfig | null>(null);

  // Flow State inside active cotizador: "form" (step 1), "plans" (step 2), "success" (step 3)
  const [cotizadorStep, setCotizadorStep] = useState<"form" | "plans" | "success">("form");

  // Step 1: dynamic form values
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

  // Step 2: selected plan
  const [selectedPlan, setSelectedPlan] = useState<SeguroPlan | null>(null);
  const [simulatedPolicy, setSimulatedPolicy] = useState("");

  // Category filter for the catalog grid: "all" | "automotriz" | "bienes" | "salud"
  const [categoryFilter, setCategoryFilter] = useState<"all" | "automotriz" | "bienes" | "salud">("all");

  useEffect(() => {
    // Read route or query parameters to pre-select a product
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get("id");
    const path = window.location.pathname;

    let targetId = prodId;
    if (!targetId) {
      if (path.includes("hogar")) targetId = "seguro-hogar";
      else if (path.includes("mascotas")) targetId = "seguro-mascotas";
      else if (path.includes("auto-full")) targetId = "seguro-auto-full";
      else if (path.includes("soap")) targetId = "seguro-soap";
    }

    if (targetId) {
      const match = SEGUROS_CONFIG.find((s) => s.id === targetId);
      if (match) {
        setSelectedProduct(match);
        setCotizadorStep("form");
        setFormValues({});
        trackEvent("seguro_cotizacion_iniciada", { producto_id: match.id, producto_nombre: match.name });
      }
    } else {
      setSelectedProduct(null);
    }
  }, [window.location.search, window.location.pathname]);

  const handleSelectProduct = (prod: SeguroConfig) => {
    setSelectedProduct(prod);
    setCotizadorStep("form");
    setFormValues({});
    setErrorMsg("");
    trackEvent("seguro_cotizacion_iniciada", { producto_id: prod.id, producto_nombre: prod.name });
  };

  const handleFormInputChange = (fieldName: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate that all required fields are filled
    if (!selectedProduct) return;

    for (const field of selectedProduct.formFields) {
      if (field.required && !formValues[field.name]) {
        setErrorMsg(`El campo "${field.label}" es obligatorio.`);
        return;
      }
    }

    // Custom plate (patente) validation for vehicle/SOAP
    const plateField = selectedProduct.formFields.find((f) => f.name === "patente");
    if (plateField && formValues["patente"]) {
      const plate = formValues["patente"].toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (plate.length < 6) {
        setErrorMsg("La patente debe tener al menos 6 caracteres alfanuméricos.");
        return;
      }
    }

    // Success step 1 -> step 2
    trackEvent("seguro_cotizacion_paso_completado", { paso: 1, producto_id: selectedProduct.id });
    setSelectedPlan(selectedProduct.plans[1]); // Default to second plan
    setCotizadorStep("plans");
  };

  const handleStep2Submit = () => {
    if (!selectedProduct || !selectedPlan) return;

    // Generate simulated policy number
    const polNumber = `POL-${selectedProduct.id.slice(7, 10).toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setSimulatedPolicy(polNumber);

    trackEvent("seguro_plan_seleccionado", {
      producto_id: selectedProduct.id,
      plan_nombre: selectedPlan.name,
      plan_precio: selectedPlan.priceMonthly,
    });
    amplitudeService.trackRevenue("seguro_contratado", {
      producto_id: selectedProduct.id,
      plan_nombre: selectedPlan.name,
      precio: selectedPlan.priceMonthly,
      poliza: polNumber,
    }, "seguro_" + selectedProduct.id, selectedPlan.priceMonthly, 1);
    amplitudeService.incrementJourneysCompleted();
    amplitudeService.appendProduct("seguro_" + selectedProduct.id);

    setCotizadorStep("success");
  };

  // Helper to render lucide icons dynamically
  const renderIcon = (iconName: string) => {
    const props = { className: "w-6 h-6" };
    if (iconName === "Home") return <Home {...props} />;
    if (iconName === "Heart") return <Heart {...props} />;
    if (iconName === "Car") return <Car {...props} />;
    return <ShieldAlert {...props} />;
  };

  const clpFormat = (num: number) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
      
      {/* CATALOG GRID IF NO PRODUCT IS ACTIVE */}
      {!selectedProduct ? (
        <div className="space-y-8">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/50">
              03 — Seguros Cooperativos
            </span>
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-brand-dark mt-2 mb-4">
              Protección Integral MindersCredit
            </h1>
            <p className="text-sm text-brand-dark/70 max-w-xl mx-auto">
              Cotiza y contrata 100% online los mejores seguros con tarifas preferentes para socios de nuestra cooperativa.
            </p>
          </div>

          {/* Grid Filters */}
          <div className="flex justify-center gap-2 border-b border-brand-dark/10 pb-4 font-mono text-xs uppercase tracking-wider">
            {(["all", "automotriz", "bienes", "salud"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`py-2 px-4 rounded-full transition-all ${categoryFilter === cat ? "bg-brand-dark text-white font-bold" : "text-brand-dark/70 hover:bg-brand-dark/5"}`}
              >
                {cat === "all" ? "Todos" : cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SEGUROS_CONFIG.filter((s) => {
              if (categoryFilter === "all") return true;
              if (categoryFilter === "automotriz") return s.id === "seguro-auto-full" || s.id === "seguro-soap";
              if (categoryFilter === "bienes") return s.id === "seguro-hogar";
              if (categoryFilter === "salud") return s.id === "seguro-mascotas";
              return true;
            }).map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-brand-dark/10 p-6 flex flex-col justify-between hover:border-brand-dark/30 transition-all group"
                style={{ borderRadius: "18px" }}
              >
                <div>
                  <div className="w-12 h-12 bg-brand-dark/5 rounded-full flex items-center justify-center text-brand-dark mb-4">
                    {renderIcon(prod.icon)}
                  </div>
                  <h3 className="font-display text-lg tracking-tight text-brand-dark group-hover:text-accent-lavender transition-all">
                    {prod.name}
                  </h3>
                  <p className="font-mono text-[10px] text-brand-dark/50 uppercase tracking-widest mt-0.5">
                    Desde {clpFormat(prod.basePrice)}/mes
                  </p>
                  <p className="text-xs text-brand-dark/70 mt-3 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-dark/5 flex justify-between items-center">
                  <span className="font-mono text-[10px] text-brand-dark/60">CONTRATACIÓN ONLINE ⚡</span>
                  <button
                    onClick={() => handleSelectProduct(prod)}
                    className="py-2.5 px-5 bg-brand-dark text-white rounded-full font-mono text-[10px] uppercase tracking-wider hover:bg-brand-dark/95 transition-all flex items-center gap-1 font-bold"
                  >
                    Cotizar seguro
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ACTIVE COTIZADOR WIZARD */
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <button
              onClick={() => setSelectedProduct(null)}
              className="text-xs font-mono text-brand-dark/60 hover:text-brand-dark flex items-center gap-1 mx-auto mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al catálogo de seguros
            </button>
            <span className="font-mono text-xs uppercase tracking-widest text-[#0F766E] font-bold">
              COTIZADOR ONLINE
            </span>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-brand-dark mt-1">
              {selectedProduct.name}
            </h2>
            <p className="text-xs text-brand-dark/70 mt-1 max-w-md mx-auto">
              {selectedProduct.tagline}
            </p>

            {/* Stepper progress info */}
            <div className="flex justify-center items-center gap-2 max-w-xs mx-auto mt-6">
              <div className={`h-1 flex-1 rounded-full ${cotizadorStep === "form" || cotizadorStep === "plans" || cotizadorStep === "success" ? "bg-brand-dark" : "bg-brand-dark/10"}`} />
              <div className={`h-1 flex-1 rounded-full ${cotizadorStep === "plans" || cotizadorStep === "success" ? "bg-brand-dark" : "bg-brand-dark/10"}`} />
              <div className={`h-1 flex-1 rounded-full ${cotizadorStep === "success" ? "bg-brand-dark" : "bg-brand-dark/10"}`} />
            </div>
          </div>

          <div className="bg-white border border-brand-dark/10 p-6 md:p-8" style={{ borderRadius: "18px" }}>
            
            {/* STEP 1: ASSET FORM */}
            {cotizadorStep === "form" && (
              <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="border-b border-brand-dark/5 pb-2">
                  <h3 className="font-display text-base tracking-tight">Paso 1: Datos del Bien Asegurado</h3>
                  <p className="text-xs text-brand-dark/60">Ingresa la información requerida para calcular el nivel de riesgo.</p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg flex items-center gap-2 text-xs text-brand-dark">
                    <AlertCircle className="w-4 h-4 text-accent-coral shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedProduct.formFields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                        {field.label} {field.required && <span className="text-accent-coral">*</span>}
                      </label>
                      {field.type === "select" ? (
                        <select
                          value={formValues[field.name] || ""}
                          onChange={(e) => handleFormInputChange(field.name, e.target.value)}
                          className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-dark font-sans"
                        >
                          <option value="">Selecciona una opción...</option>
                          {field.placeholder.split("/").map((opt) => {
                            const trimmed = opt.trim();
                            return (
                              <option key={trimmed} value={trimmed.toLowerCase()}>
                                {trimmed}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formValues[field.name] || ""}
                          onChange={(e) => handleFormInputChange(field.name, e.target.value)}
                          className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-sans bg-[#FDFDFD]"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-brand-dark/5 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-brand-dark text-white font-mono text-xs uppercase tracking-widest rounded-full hover:bg-brand-dark/90 transition-all flex items-center gap-1.5"
                  >
                    Calcular Planes
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PLAN SELECTOR */}
            {cotizadorStep === "plans" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-brand-dark/5 pb-2">
                  <div>
                    <h3 className="font-display text-base tracking-tight">Paso 2: Elige tu Cobertura</h3>
                    <p className="text-xs text-brand-dark/60">Compara los planes estructurados para ti.</p>
                  </div>
                  <button
                    onClick={() => setCotizadorStep("form")}
                    className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Modificar Bien
                  </button>
                </div>

                {/* Plans Comparison Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedProduct.plans.map((plan) => (
                    <div
                      key={plan.name}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-5 border cursor-pointer flex flex-col justify-between transition-all ${selectedPlan?.name === plan.name ? "border-brand-dark bg-brand-dark/5 ring-1 ring-brand-dark" : "border-brand-dark/10 hover:border-brand-dark/20 bg-[#FDFDFD]"}`}
                      style={{ borderRadius: "14px" }}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-display text-sm text-brand-dark">{plan.name}</span>
                          {selectedPlan?.name === plan.name && <ShieldCheck className="w-4 h-4 text-[#0F766E]" />}
                        </div>
                        <p className="text-[11px] text-brand-dark/70 leading-relaxed font-sans">
                          {plan.coverage}
                        </p>
                      </div>

                      <div className="mt-6 pt-3 border-t border-brand-dark/5">
                        <span className="text-[9px] font-mono text-brand-dark/40 uppercase block">MENSUALIDAD</span>
                        <span className="font-display text-lg text-brand-dark block mt-0.5">
                          {clpFormat(plan.priceMonthly)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Table */}
                {selectedPlan && (
                  <div className="p-4 bg-brand-dark/5 rounded-xl border border-brand-dark/5 flex justify-between items-center text-xs font-mono text-brand-dark">
                    <div>
                      <span>Plan seleccionado: </span>
                      <strong className="text-brand-dark uppercase">{selectedPlan.name}</strong>
                    </div>
                    <div>
                      <span>Precio Final: </span>
                      <strong className="text-[#0F766E] text-sm">{clpFormat(selectedPlan.priceMonthly)} / mes</strong>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-brand-dark/5 flex justify-end">
                  <button
                    onClick={handleStep2Submit}
                    className="px-8 py-3.5 bg-[#0F766E] text-white font-mono text-xs uppercase tracking-widest rounded-full hover:bg-[#0C5F58] transition-all font-bold"
                  >
                    Confirmar Contratación 🔒
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS POLICY CONTRACT */}
            {cotizadorStep === "success" && (
              <div className="text-center space-y-6 py-6 max-w-md mx-auto">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>

                <div>
                  <span className="font-mono text-xs text-[#0F766E] font-bold">¡SEGURO CONTRATADO CON ÉXITO!</span>
                  <h3 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
                    Póliza Emitida y Certificada
                  </h3>
                  <p className="text-xs text-brand-dark/70 mt-1">
                    Tu póliza se encuentra registrada de inmediato en la Comisión para el Mercado Financiero (CMF).
                  </p>
                </div>

                {/* Policy details */}
                <div className="p-5 bg-brand-bg rounded-xl font-mono text-xs text-left border border-brand-dark/5 space-y-2">
                  <div className="flex justify-between">
                    <span>SEGURO CONTRATADO:</span>
                    <span className="font-bold uppercase text-brand-dark">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NÚMERO DE PÓLIZA:</span>
                    <span className="font-bold text-brand-dark">{simulatedPolicy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PLAN COBERTURA:</span>
                    <span className="font-bold uppercase text-brand-dark">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#0F766E] font-bold border-t border-brand-dark/5 pt-2 mt-2">
                    <span>PRIMA MENSUAL:</span>
                    <span>{clpFormat(selectedPlan?.priceMonthly || 0)}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#F2F2F2] rounded-xl text-left text-[11px] text-brand-dark/70 leading-relaxed font-sans">
                  Hemos enviado la póliza firmada digitalmente en formato PDF a tu correo electrónico registrado. Las coberturas inician a las **00:00 hrs de mañana**.
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setCotizadorStep("form");
                    }}
                    className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold"
                  >
                    Volver a Seguros
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark hover:underline block w-full text-center"
                  >
                    Volver al Inicio
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
