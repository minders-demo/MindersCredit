import React, { useState, useEffect } from "react";
import { trackEvent } from "../analytics";
import { useRouter } from "../RouterContext";
import { SUCURSALES, FAQS } from "../data";
import { Search, ChevronDown, ChevronUp, MapPin, AlertTriangle, PhoneCall, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

const getRegionName = (regId: string) => {
  if (regId === "rm") return "Región Metropolitana";
  if (regId === "valparaiso") return "Región de Valparaíso";
  if (regId === "biobio") return "Región del Biobío";
  if (regId === "araucania") return "Región de la Araucanía";
  if (regId === "antofagasta") return "Región de Antofagasta";
  return "Región de Chile";
};

const getComunaName = (comId: string) => {
  return comId.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

export default function AyudaYSucursales() {
  const { navigate } = useRouter();

  // Tab routing inside: "ayuda" | "sucursales" | "emergencias"
  const [tab, setTab] = useState<"ayuda" | "sucursales" | "emergencias">("ayuda");

  // --- FAQS SEARCH & ACCORDION STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // --- SUCURSALES STATES ---
  const [selectedRegion, setSelectedRegion] = useState("all");

  // --- EMERGENCIAS BLOCK CARD STATES ---
  const [blockStep, setBlockStep] = useState<1 | 2>(1);
  const [blockRut, setBlockRut] = useState("");
  const [blockCardType, setBlockCardType] = useState("debito");
  const [blockMotive, setBlockMotive] = useState("robo");
  const [blockSuccessCode, setBlockSuccessCode] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (path.includes("sucursales") || hash.includes("sucursales")) {
      setTab("sucursales");
      trackEvent("sucursales_vista");
    } else if (path.includes("emergencias") || hash.includes("emergencias")) {
      setTab("emergencias");
      trackEvent("emergencias_vista");
    } else {
      setTab("ayuda");
      trackEvent("centro_ayuda_vista");
    }
  }, [window.location.pathname, window.location.hash]);

  // Handle FAQ click
  const handleFaqToggle = (index: number, question: string, category: string) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
      trackEvent("centro_ayuda_faq_vista", { pregunta: question, categoria: category, query: searchQuery || "none" });
    }
  };

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.length > 2) {
      trackEvent("centro_ayuda_busqueda", { query: val });
    }
  };

  const handleRegionChange = (reg: string) => {
    setSelectedRegion(reg);
    trackEvent("sucursales_buscadas", { region: reg });
  };

  const handleBlockCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockRut || blockRut.length < 8) {
      alert("Por favor ingresa un RUT válido.");
      return;
    }

    const blockCode = `BLK-${Math.floor(100000 + Math.random()*900000)}`;
    setBlockSuccessCode(blockCode);
    trackEvent("bloqueo_tarjeta_completado", {
      rut: blockRut,
      tipo_tarjeta: blockCardType,
      motivo: blockMotive,
      codigo: blockCode,
    });
    setBlockStep(2);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
      
      {/* HEADER SECTION TABS */}
      <div className="flex justify-center mb-8 border-b border-brand-dark/10 font-mono text-xs uppercase tracking-wider">
        <button
          onClick={() => {
            setTab("ayuda");
            navigate("/centro-ayuda");
          }}
          className={`py-3 px-6 border-b-2 transition-all ${tab === "ayuda" ? "border-brand-dark text-brand-dark font-bold" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Centro de Ayuda FAQ
        </button>
        <button
          onClick={() => {
            setTab("sucursales");
            navigate("/sucursales");
          }}
          className={`py-3 px-6 border-b-2 transition-all ${tab === "sucursales" ? "border-brand-dark text-brand-dark font-bold" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Sucursales y Oficinas
        </button>
        <button
          onClick={() => {
            setTab("emergencias");
            navigate("/emergencias");
          }}
          className={`py-3 px-6 border-b-2 transition-all ${tab === "emergencias" ? "border-[#FC7E7F] text-[#FC7E7F] font-bold" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          🚨 Emergencias Bancarias
        </button>
      </div>

      {/* VIEW A: CENTRO DE AYUDA (FAQS) */}
      {tab === "ayuda" && (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/50">
              07 — Soporte al socio
            </span>
            <h1 className="font-display text-3xl tracking-tight text-brand-dark mt-1">
              ¿Cómo podemos ayudarte hoy?
            </h1>
            <p className="text-xs text-brand-dark/70 mt-1">
              Encuentra respuestas rápidas sobre cuentas, créditos, cooperativismo y beneficios sociales.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 text-brand-dark/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Busca por palabras claves (ej: remanente, cuenta vista, RUT)..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full p-3.5 pl-12 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark bg-white shadow-sm font-sans"
            />
          </div>

          {/* FAQS Accordions */}
          <div className="space-y-3 bg-white border border-brand-dark/10 p-4 md:p-6 rounded-2xl">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border-b border-brand-dark/5 last:border-0 pb-3 last:pb-0">
                    <button
                      onClick={() => handleFaqToggle(idx, faq.question, faq.category)}
                      className="w-full flex justify-between items-center py-3 text-left font-display text-sm text-brand-dark hover:text-[#0F766E] transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-brand-dark/5 text-brand-dark/60 rounded">
                          {faq.category}
                        </span>
                        {faq.question}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="p-3 bg-brand-dark/5 rounded-xl text-xs text-brand-dark/80 leading-relaxed font-sans mt-1 animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-brand-dark/50 text-xs">
                No encontramos preguntas que coincidan con tu búsqueda. Escríbenos por WhatsApp para soporte personalizado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW B: SUCURSALES (OFFICES LIST) */}
      {tab === "sucursales" && (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/50">
              08 — Presencia territorial
            </span>
            <h2 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
              Nuestras Sucursales
            </h2>
            <p className="text-xs text-brand-dark/70 mt-1">
              Poseemos atención preferencial en múltiples regiones de Chile. Filtra para ubicar tu oficina más cercana.
            </p>
          </div>

          {/* Region selector filter */}
          <div className="max-w-xs mx-auto">
            <label className="block text-center text-xs font-mono uppercase text-brand-dark/60 mb-1.5">Filtro de Región</label>
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full p-2.5 border border-brand-dark/20 rounded-xl text-xs bg-white text-brand-dark focus:outline-none"
            >
              <option value="all">Todas las Regiones</option>
              <option value="rm">Región Metropolitana</option>
              <option value="valparaiso">Región de Valparaíso</option>
              <option value="biobio">Región del Biobío</option>
              <option value="araucania">Región de la Araucanía</option>
              <option value="antofagasta">Región de Antofagasta</option>
            </select>
          </div>

          {/* Branch card grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUCURSALES.filter((b) => selectedRegion === "all" || b.regionId === selectedRegion).map((branch) => (
              <div key={branch.name} className="p-5 border border-brand-dark/10 bg-white rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#0F766E] font-bold text-xs font-mono mb-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    {getRegionName(branch.regionId)}
                  </div>
                  <h4 className="font-display text-base text-brand-dark mb-1">{branch.name}</h4>
                  <p className="text-xs text-brand-dark/70 font-sans leading-tight mb-3">
                    {branch.address}, {getComunaName(branch.comunaId)}
                  </p>
                  
                  <div className="p-3 bg-brand-dark/5 rounded-xl text-[11px] text-brand-dark/70 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>HORARIO:</span>
                      <span className="text-right">{branch.hours}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/agenda-tu-hora?sucursal=${encodeURIComponent(branch.name)}`)}
                  className="w-full mt-4 py-2 bg-brand-dark text-white rounded-lg font-mono text-[10px] uppercase hover:bg-brand-dark/95 transition-all text-center font-bold"
                >
                  Agendar hora aquí →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW C: EMERGENCIAS BANCARIAS (CARD BLOCKING) */}
      {tab === "emergencias" && (
        <div className="max-w-md mx-auto bg-white border border-[#FC7E7F]/30 p-6 md:p-8 rounded-2xl">
          <div className="text-center mb-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#FC7E7F] font-bold">
              ATENCIÓN INMEDIATA 24/7
            </span>
            <h2 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
              Bloqueo de Tarjeta por Pérdida o Robo
            </h2>
            <p className="text-xs text-brand-dark/70">
              Protege tus saldos bloqueando tu tarjeta de forma definitiva e irreversible.
            </p>
          </div>

          {blockStep === 1 ? (
            <form onSubmit={handleBlockCard} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">
                  RUT del Titular de la Tarjeta
                </label>
                <input
                  type="text"
                  placeholder="12.345.678-9"
                  value={blockRut}
                  onChange={(e) => setBlockRut(e.target.value)}
                  className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">
                  Tarjeta a Bloquear
                </label>
                <select
                  value={blockCardType}
                  onChange={(e) => setBlockCardType(e.target.value)}
                  className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm bg-white focus:outline-none font-sans"
                >
                  <option value="debito">Tarjeta de Débito Socio MC.</option>
                  <option value="credito">Tarjeta de Crédito Black MC.</option>
                  <option value="ambas">Ambas Tarjetas asociadas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">
                  Motivo de la Solicitud
                </label>
                <select
                  value={blockMotive}
                  onChange={(e) => setBlockMotive(e.target.value)}
                  className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm bg-white focus:outline-none font-sans"
                >
                  <option value="robo">Robo o Hurto</option>
                  <option value="extravio">Extravío</option>
                  <option value="fraude">Transacciones no reconocidas (Fraude)</option>
                </select>
              </div>

              <div className="p-4 bg-accent-coral/10 border border-accent-coral/20 rounded-xl flex items-start gap-2.5 text-xs text-brand-dark/80">
                <AlertTriangle className="w-5 h-5 text-accent-coral shrink-0 mt-0.5" />
                <p>
                  <strong>Atención:</strong> Esta operación es irrevocable. Una vez bloqueada, la tarjeta física quedará inutilizable y deberás solicitar una reposición en sucursal.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-accent-coral text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-opacity-90 transition-all font-bold"
              >
                Bloquear Tarjeta Ahora 🔒
              </button>

              <div className="pt-4 border-t border-brand-dark/5 text-center">
                <span className="text-[10px] font-mono text-brand-dark/40 uppercase block">¿Prefieres llamar por teléfono?</span>
                <p className="text-sm font-display text-brand-dark font-bold mt-1 flex justify-center items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-accent-coral" />
                  600 2400 800 (Nacional 24 hrs)
                </p>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-red-100 text-red-800 rounded-full flex items-center justify-center mx-auto border border-red-300">
                <CheckCircle2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-display text-xl tracking-tight text-[#C2410C]">
                ¡Tarjeta Bloqueada Definitivamente!
              </h3>
              <p className="text-xs text-brand-dark/80 leading-relaxed">
                Hemos emitido el bloqueo permanente para tus tarjetas correspondientes al RUT <strong>{blockRut}</strong>.
              </p>
              <div className="p-4 bg-brand-dark/5 rounded-xl font-mono text-xs text-left max-w-xs mx-auto space-y-1">
                <p>• Código Bloqueo: <strong className="text-brand-dark font-bold">{blockSuccessCode}</strong></p>
                <p>• Fecha: {new Date().toLocaleString("es-CL")}</p>
                <p>• Estado: Inhabilitada permanentemente</p>
              </div>
              <p className="text-[10px] text-brand-dark/50 italic">
                Acércate a cualquier sucursal con tu cédula de identidad para reimprimir tu plástico de inmediato por un costo de $0 CLP.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setBlockStep(1);
                    setBlockRut("");
                  }}
                  className="px-6 py-2.5 border border-brand-dark/20 rounded-full font-mono text-xs"
                >
                  Volver
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
