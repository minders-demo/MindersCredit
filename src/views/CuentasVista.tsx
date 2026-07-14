import React, { useState, useEffect } from "react";
import { trackEvent } from "../analytics";
import { useRouter } from "../RouterContext";
import { useAuth } from "../hooks/useAuth";
import { Check, Landmark, ShieldCheck, AlertCircle, Sparkles, CreditCard } from "lucide-react";

export default function CuentasVista() {
  const { navigate } = useRouter();
  const [step, setStep] = useState<"landing" | "form" | "success">("landing");
  const { user } = useAuth();

  // Onboarding parameters
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");

  useEffect(() => {
    if (user) {
      setNombre(`${user.first_name} ${user.last_name}`);
      setRut(user.rut);
    }
  }, [user]);
  const [montoInicial, setMontoInicial] = useState<number>(0);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isJoven = window.location.pathname.includes("joven") || window.location.hash.includes("joven");

  useEffect(() => {
    trackEvent("cuenta_vista_vista", { tipo: isJoven ? "vista_joven" : "vista_adulto" });
  }, [isJoven]);

  const handleStart = () => {
    trackEvent("apertura_vista_iniciada", { tipo: isJoven ? "vista_joven" : "vista_adulto" });
    setStep("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nombre) {
      setErrorMsg("El nombre completo es obligatorio.");
      return;
    }
    if (!rut) {
      setErrorMsg("El RUT es obligatorio.");
      return;
    }
    if (!aceptaTerminos) {
      setErrorMsg("Debes aceptar el contrato de apertura de cuenta corriente/vista.");
      return;
    }

    // Process success
    trackEvent("apertura_vista_completada", {
      rut: rut,
      tipo: isJoven ? "vista_joven" : "vista_adulto",
      saldo_inicial: montoInicial,
    });
    setStep("success");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
      
      {/* LANDING & COMPARISON */}
      {step === "landing" && (
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="bg-[#1C1F24] text-white p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-8 border border-white/10">
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-accent-cyan">
                {isJoven ? "MENORES DE 26 AÑOS" : "COMISIÓN MENSUAL $0"}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-none">
                {isJoven ? "Cuenta Vista Jóvenes MC." : "Cuenta Vista Costo $0 MindersCredit"}
              </h2>
              <p className="text-sm text-white/80 max-w-md">
                Úsala para recibir tu sueldo, transferir, comprar online con débito y acumular reembolsos sin comisiones ocultas ni cobros por transferencia.
              </p>
              
              <ul className="space-y-2 text-xs font-mono text-accent-mint">
                <li className="flex items-center gap-2">✔ Costo mensual fijo: $0 CLP de por vida</li>
                <li className="flex items-center gap-2">✔ Transferencias interbancarias ilimitadas: $0</li>
                <li className="flex items-center gap-2">✔ Giros en cajeros automáticos: costo $0</li>
              </ul>

              <div className="pt-4">
                <button
                  onClick={handleStart}
                  className="px-8 py-3.5 bg-accent-cyan text-[#1C1F24] font-mono text-xs uppercase tracking-wider rounded-full hover:bg-accent-cyan/90 transition-all font-bold"
                >
                  Abrir Cuenta Vista Ahora →
                </button>
              </div>
            </div>

            {/* Visual Debit Card mock */}
            <div className="flex justify-center shrink-0">
              <div className="w-64 h-96 bg-gradient-to-tr from-accent-cyan via-accent-lavender to-accent-mint p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden" style={{ borderRadius: "18px" }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="flex justify-between items-start text-[#1C1F24]">
                  <span className="font-display text-lg tracking-tight">MindersCredit.</span>
                  <span className="font-mono text-[9px] font-bold uppercase">{isJoven ? "VISTA JÓVENES" : "DÉBITO SOCIO"}</span>
                </div>
                <div className="w-10 h-8 bg-[#1C1F24]/10 rounded border border-[#1C1F24]/20" />
                <div className="text-[#1C1F24] font-mono">
                  <div className="text-sm tracking-widest font-bold">•••• •••• •••• 1284</div>
                  <div className="text-[10px] mt-2">DÉBITO MASTERCARD</div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Comparison */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase text-brand-dark/50 block">01 — TRANSPARENCIA MÁXIMA</span>
            <h3 className="font-display text-xl text-brand-dark">Comparativa: MindersCredit v/s Banca Tradicional</h3>
            <div className="overflow-x-auto border border-brand-dark/10 rounded-2xl bg-white">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-brand-dark text-white font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-4">Concepto / Cobro</th>
                    <th className="p-4 bg-brand-dark/95 text-accent-cyan">MindersCredit Vista</th>
                    <th className="p-4">Banco Tradicional A</th>
                    <th className="p-4">Cuenta Rut Tradicional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark/5">
                  <tr>
                    <td className="p-4 font-bold">Costo de Mantención Fijo</td>
                    <td className="p-4 bg-brand-dark/5 text-[#0F766E] font-bold">$0</td>
                    <td className="p-4 text-gray-600">$4.500 / mes</td>
                    <td className="p-4 text-gray-600">$0 (Varía por saldo)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Costo por Transferencia Otorgada</td>
                    <td className="p-4 bg-brand-dark/5 text-[#0F766E] font-bold">$0 (Ilimitadas)</td>
                    <td className="p-4 text-gray-600">$300 c/u</td>
                    <td className="p-4 text-[#C2410C] font-bold">$300 por transacción</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Costo por Giro en Cajero</td>
                    <td className="p-4 bg-brand-dark/5 text-[#0F766E] font-bold">$0</td>
                    <td className="p-4 text-gray-600">$600 c/u</td>
                    <td className="p-4 text-[#C2410C] font-bold">$200 - $300 c/u</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Compras Nacionales Electrónicas</td>
                    <td className="p-4 bg-brand-dark/5 text-[#0F766E] font-bold">$0 (Sin recargo)</td>
                    <td className="p-4 text-gray-600">$0</td>
                    <td className="p-4 text-gray-600">$0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: OPEN FORM */}
      {step === "form" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl">
          <div className="mb-6">
            <button
              onClick={() => setStep("landing")}
              className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark flex items-center gap-1 mb-2"
            >
              ← Volver
            </button>
            <h3 className="font-display text-lg tracking-tight">Apertura Digital en 1 Paso</h3>
            <p className="text-xs text-brand-dark/70">Confirma tus datos y activa tu cuenta de forma instantánea.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 text-accent-coral shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                Nombre del Titular
              </label>
              <input
                type="text"
                placeholder="Ej. Sebastián Allende"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                RUT del Titular
              </label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-dark/80 mb-1">
                Depósito Inicial de Activación (Opcional)
              </label>
              <input
                type="number"
                placeholder="Ej: 5000"
                value={montoInicial || ""}
                onChange={(e) => setMontoInicial(parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
              />
              <span className="text-[10px] text-brand-dark/50 font-mono mt-1 block">
                Puedes abrirla con $0.
              </span>
            </div>

            <div>
              <label className="flex items-start gap-2.5 text-xs text-brand-dark/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="w-4 h-4 border-brand-dark/20 rounded accent-brand-dark mt-0.5"
                />
                <span>
                  Acepto el contrato de apertura de Cuenta Vista y Tarifario $0, sujeto a las leyes financieras del Banco Central de Chile.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold"
            >
              Activar Mi Cuenta Vista 🚀
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: SUCCESS */}
      {step === "success" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>

          <div>
            <span className="font-mono text-xs text-accent-lavender font-bold">¡CUENTA VISTA ACTIVA!</span>
            <h3 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
              ¡Tu Cuenta Vista está Abierta!
            </h3>
            <p className="text-xs text-brand-dark/70 mt-1">
              Hemos configurado tus accesos de inmediato. Tu número de cuenta ya se encuentra disponible.
            </p>
          </div>

          <div className="p-5 bg-brand-bg rounded-xl font-mono text-xs text-left border border-brand-dark/5 space-y-2">
            <div className="flex justify-between">
              <span>NÚMERO DE CUENTA:</span>
              <span className="font-bold">VISTA-{rut.replace(/\./g, "").split("-")[0]}</span>
            </div>
            <div className="flex justify-between">
              <span>SALDO ACTUAL:</span>
              <span className="font-bold text-[#0F766E]">${montoInicial.toLocaleString("es-CL")} CLP</span>
            </div>
            <div className="flex justify-between text-[11px] text-brand-dark/60 border-t border-brand-dark/5 pt-2 mt-2">
              <span>ESTADO DE TARJETA:</span>
              <span>Emitida digitalmente / Despacho pendiente</span>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <button
              onClick={() => navigate("/mi-minderscredit")}
              className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold"
            >
              Ir a mi Sitio Privado 🔐
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark hover:underline block w-full text-center"
            >
              Volver a la Home
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
