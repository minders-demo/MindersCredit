import React, { useState, useEffect } from "react";
import { trackEvent } from "../analytics";
import { useRouter } from "../RouterContext";
import { BENEFICIOS } from "../data";
import { Gift, Heart } from "lucide-react";

export default function SegmentosYBeneficios() {
  const { navigate } = useRouter();

  // Tab: "beneficios" or "pensionados"
  const [tab, setTab] = useState<"beneficios" | "pensionados">("beneficios");

  // Beneficios Filter: "all" | "Salud" | "Momentos Ñami" | "Transporte" | "Entretención"
  const [filter, setFilter] = useState<"all" | "Salud" | "Momentos Ñami" | "Transporte" | "Entretención">("all");

  // Activated coupon
  const [activeCoupon, setActiveCoupon] = useState<{ id: string; code: string } | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (path.includes("pensionados") || hash.includes("pensionados")) {
      setTab("pensionados");
      trackEvent("pensionados_segmento_vista");
    } else {
      setTab("beneficios");
      trackEvent("beneficios_vista");
    }
  }, [window.location.pathname, window.location.hash]);

  const handleActivateCoupon = (id: string, title: string) => {
    const codeStr = `CUPON-MC-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveCoupon({ id, code: codeStr });
    trackEvent("beneficio_activado", { beneficio_id: id, beneficio_nombre: title, codigo: codeStr });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
      
      {/* SECTOR SELECTOR TABS */}
      <div className="flex justify-center mb-8 border-b border-brand-dark/10 font-mono text-xs uppercase tracking-wider">
        <button
          onClick={() => {
            setTab("beneficios");
            navigate("/beneficios");
          }}
          className={`py-3 px-6 border-b-2 transition-all ${tab === "beneficios" ? "border-brand-dark text-brand-dark font-bold" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Club de Beneficios MC.
        </button>
        <button
          onClick={() => {
            setTab("pensionados");
            navigate("/pensionados");
          }}
          className={`py-3 px-6 border-b-2 transition-all ${tab === "pensionados" ? "border-brand-dark text-brand-dark font-bold" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Segmento Pensionados 👵👴
        </button>
      </div>

      {/* VIEW A: CLUB DE BENEFICIOS MULTI-CATEGORIA */}
      {tab === "beneficios" && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-[#0F766E] font-bold">CLUB SOCIOS ACTIVE</span>
            <h2 className="font-display text-3xl tracking-tight text-brand-dark mt-1">Exclusivos de Cooperativa</h2>
            <p className="text-xs text-brand-dark/70 mt-1">
              Como socio activo de MindersCredit, accede a descuentos, reembolsos e incentivos especiales en comercios asociados de todo Chile.
            </p>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap justify-center gap-1.5 border-b border-brand-dark/5 pb-4 font-mono text-[10px] uppercase">
            {(["all", "Salud", "Momentos Ñami", "Transporte", "Entretención"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`py-1.5 px-3.5 rounded-full transition-all ${filter === cat ? "bg-brand-dark text-white font-bold" : "text-brand-dark/60 hover:bg-brand-dark/5"}`}
              >
                {cat === "all" ? "Todos los convenios" : cat}
              </button>
            ))}
          </div>

          {/* Benefits grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BENEFICIOS.filter((b) => filter === "all" || b.category === filter).map((benefit) => {
              const isCouponActive = activeCoupon?.id === benefit.id;

              return (
                <div
                  key={benefit.id}
                  className="bg-white border border-brand-dark/10 p-5 rounded-2xl flex flex-col justify-between hover:border-brand-dark/20 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-[#0F766E]/10 text-[#0F766E] rounded font-bold">
                        {benefit.category}
                      </span>
                      <span className="font-display text-base font-bold text-brand-dark">
                        {benefit.discount}
                      </span>
                    </div>

                    <h4 className="font-display text-base text-brand-dark mb-1">{benefit.partner}</h4>
                    <p className="text-xs font-bold text-brand-dark/80 mb-2">{benefit.title}</p>
                    <p className="text-xs text-brand-dark/70 font-sans leading-normal">
                      {benefit.terms}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-brand-dark/5 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-brand-dark/50 uppercase">CONVENIO ACTIVO ✔</span>
                    
                    {isCouponActive ? (
                      <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded font-mono text-xs text-emerald-700 font-bold flex items-center gap-1 animate-fade-in">
                        CÓDIGO: {activeCoupon.code}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleActivateCoupon(benefit.id, benefit.title)}
                        className="py-2 px-4 bg-brand-dark text-white rounded-lg font-mono text-[10px] uppercase tracking-wider hover:bg-brand-dark/95 transition-all font-bold flex items-center gap-1"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Obtener Beneficio
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW B: PORTAL PENSIONADOS */}
      {tab === "pensionados" && (
        <div className="space-y-12 animate-fade-in">
          {/* Pensionados Hero */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#1C1F24] text-white p-6 md:p-10 rounded-3xl border border-white/10">
            <div className="md:col-span-8 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#B3F5E1] font-bold">
                BIENESTAR DE ADULTO MAYOR
              </span>
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-none text-white">
                Pensionados en MindersCredit
              </h2>
              <p className="text-sm text-white/80 leading-relaxed max-w-lg">
                Creamos un entorno financiero comprensivo, amigable y preferencial para nuestros pensionados y montepiados chilenos. Recibe tu pensión del IPS de forma directa y simplificada.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-[#B3F5E1]">
                <div>• Tasa Preferencial de Consumo Mayor</div>
                <div>• Abono Social Directo en Cuenta Vista $0</div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    alert("¡Gracias! Un asesor preferencial se pondrá en contacto para asistirte en el traspaso de pago de pensiones.");
                  }}
                  className="px-8 py-3.5 bg-accent-lavender text-brand-dark font-mono text-xs uppercase tracking-wider rounded-full hover:bg-accent-lavender/90 transition-all font-bold"
                >
                  Traspasar Mi Pensión Aquí →
                </button>
              </div>
            </div>

            {/* Visual Callout */}
            <div className="md:col-span-4 flex justify-center">
              <div className="w-56 h-56 rounded-full border border-white/10 bg-white/5 flex flex-col justify-center items-center text-center p-6 space-y-2">
                <Heart className="w-10 h-10 text-accent-coral" />
                <h4 className="font-display text-sm">Asistencia de Por Vida</h4>
                <p className="text-[10px] text-white/60 leading-normal">
                  Prioridad en atención al cliente, tótems preferenciales y seguros de salud integrados de forma automática.
                </p>
              </div>
            </div>
          </div>

          {/* Tailored Benefits List */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase text-brand-dark/50 block">01 — VENTAJAS DISEÑADAS PARA TI</span>
            <h3 className="font-display text-xl text-brand-dark">¿Por qué pensionarse en MindersCredit?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 border border-brand-dark/10 bg-white rounded-2xl">
                <span className="font-mono text-xs text-accent-coral font-bold block mb-1">01 — TASA ESPECIAL</span>
                <h4 className="font-display text-sm text-brand-dark">Créditos de Consumo Social</h4>
                <p className="text-xs text-brand-dark/70 mt-2 leading-relaxed">
                  Tasas de interés rebajadas hasta en un **25%** en comparación con el mercado bancario tradicional. Descuento por planilla automático sin trámites.
                </p>
              </div>

              <div className="p-5 border border-brand-dark/10 bg-white rounded-2xl">
                <span className="font-mono text-xs text-accent-cyan font-bold block mb-1">02 — CONVENIOS</span>
                <h4 className="font-display text-sm text-brand-dark">Descuento Farmacias</h4>
                <p className="text-xs text-brand-dark/70 mt-2 leading-relaxed">
                  Obtén hasta un **40% de descuento** en farmacias nacionales adheridas utilizando tu tarjeta de Débito Socio MindersCredit.
                </p>
              </div>

              <div className="p-5 border border-brand-dark/10 bg-white rounded-2xl">
                <span className="font-mono text-xs text-accent-lavender font-bold block mb-1">03 — ATENCIÓN</span>
                <h4 className="font-display text-sm text-brand-dark">Ejecutivo de Cabecera</h4>
                <p className="text-xs text-brand-dark/70 mt-2 leading-relaxed">
                  ¿Te cuesta usar la tecnología? Te asignamos un ejecutivo telefónico permanente para ayudarte a realizar transferencias u ordenar tus cuentas sin salir de casa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
