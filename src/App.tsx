import DemoLab from "./views/DemoLab";
import React, { useState, useEffect } from "react";
import { RouterProvider, useRouter } from "./RouterContext";
import { AccessibilityProvider } from "./components/AccessibilityContext";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import WhatsAppWidget from "./components/WhatsAppWidget";
import { trackEvent } from "./analytics";
import { driverService, amplitudeService } from "./services/amplitude.service";
import { useAuth } from "./hooks/useAuth";
import InfoPage from "./views/InfoPage";
import DevPanel from "./components/DevPanel";

// Views imports
import SimuladorConsumo from "./views/SimuladorConsumo";
import OnboardingSocio from "./views/OnboardingSocio";
import TarjetaCredito from "./views/TarjetaCredito";
import CuentasVista from "./views/CuentasVista";
import SegurosCotizador from "./views/SegurosCotizador";
import HipotecarioYPortabilidad from "./views/HipotecarioYPortabilidad";
import AhorroEInversiones from "./views/AhorroEInversiones";
import AyudaYSucursales from "./views/AyudaYSucursales";
import ServiciosFinancieros from "./views/ServiciosFinancieros";
import SegmentosYBeneficios from "./views/SegmentosYBeneficios";
import MiMindersCredit from "./views/MiMindersCredit";
import EducaHub from "./views/EducaHub";
import EducaDetalle from "./views/EducaDetalle";

// Icons for Home Grid
import { 
  Calculator, UserPlus, CreditCard, Landmark, Shield, 
  HelpCircle, Home as HomeIcon, RefreshCw, Scale, BookOpen, 
  Wallet, Sparkles, FileText, Gift, Heart, HelpCircle as HelpIcon,
  MapPin, ShieldAlert
} from "lucide-react";

function HomeView() {
  const { navigate } = useRouter();
  const { user } = useAuth();

  const [monto, setMonto] = useState<number>(3000000);
  const [inputText, setInputText] = useState<string>("$ 3.000.000");
  const [rut, setRut] = useState<string>("");
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const slides = [
    {
      id: 1,
      label: "01 — CRÉDITO DE CONSUMO DIGITAL",
      title: "RECUERDOS QUE DUREN PARA SIEMPRE",
      description: "Hasta 60 cuotas, primera cuota hasta en 90 días. Solicita tu crédito 100% digital y recíbelo en minutos en tu cuenta.",
      btnText: "SIMULAR MI CRÉDITO →",
      btnAction: "/simulador/consumo",
    },
    {
      id: 2,
      label: "02 — COOPERATIVISMO DIGITAL",
      title: "TU PARTICIPACIÓN CREA IMPACTO",
      description: "Forma parte de la cooperativa financiera líder. Obtén dividendos anuales, tasas preferenciales y voz en nuestras decisiones.",
      btnText: "ASOCIARME AHORA →",
      btnAction: "/hazte-socio",
    },
    {
      id: 3,
      label: "03 — TARJETA DE CRÉDITO",
      title: "LIBERTAD SIN COSTO OCULTO",
      description: "La primera tarjeta de crédito cooperativa con costo de mantención $0 por compras mensuales y acumulación de puntos.",
      btnText: "SOLICITAR TARJETA →",
      btnAction: "/tarjeta-credito",
    },
    {
      id: 4,
      label: "04 — BENEFICIOS EXCLUSIVOS",
      title: "EL PODER DE COMPARTIR EL ÉXITO",
      description: "Consulta tu remanente anual acumulado de forma 100% digital y transparente. Tu capital social crece con nosotros.",
      btnText: "VER REMANENTE →",
      btnAction: "/info/remanente",
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    trackEvent("home_vista");
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const slide = slides[currentSlide];
    trackEvent("banner_visto", {
      banner_id: slide.id,
      banner_label: slide.label,
      banner_titulo: slide.title
    });
  }, [currentSlide]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleBannerClick = (slide: typeof slides[0]) => {
    trackEvent("banner_clic", {
      banner_id: slide.id,
      banner_label: slide.label,
      banner_titulo: slide.title,
      banner_accion: slide.btnAction
    });
    navigate(slide.btnAction);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, "");
    if (rawDigits === "") {
      setInputText("$ ");
      return;
    }
    const val = parseInt(rawDigits, 10);
    setInputText("$ " + val.toLocaleString("es-CL"));
    setMonto(val);
  };

  const handleInputBlur = () => {
    let clampedVal = monto;
    if (monto < 500000) {
      clampedVal = 500000;
    } else if (monto > 40000000) {
      clampedVal = 40000000;
    }
    setMonto(clampedVal);
    setInputText("$ " + clampedVal.toLocaleString("es-CL"));
    trackEvent("monto_ajustado_home", { metodo: "input", monto: clampedVal });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setMonto(val);
    setInputText("$ " + val.toLocaleString("es-CL"));
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      trackEvent("monto_ajustado_home", { metodo: "slider", monto: val });
    }, 500);
  };

  return (
    <div className="space-y-16 py-6 animate-fade-in">
      
      {/* 12-Column Grid Hero Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Hero Card (8/12 Columns) with Carousel */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="lg:col-span-8 bg-[#1C1F24] text-[#F2F2F2] rounded-[24px] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[440px] transition-all"
        >
          {/* Subtle design gradient background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-lavender/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="animate-fade-in" key={currentSlide}>
            <span className="font-mono text-[10px] opacity-60 uppercase tracking-widest block mb-4">
              {slides[currentSlide].label}
            </span>
            <h1 className="font-display text-4xl sm:text-6xl tracking-tighter leading-[0.95] mb-6 uppercase max-w-2xl font-black">
              {slides[currentSlide].title}
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-lg font-sans leading-relaxed min-h-[60px]">
              {slides[currentSlide].description}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-8">
            <button
              onClick={() => handleBannerClick(slides[currentSlide])}
              className="px-8 py-3.5 bg-[#F2F2F2] text-[#1C1F24] font-display text-xs uppercase tracking-wider rounded-full hover:bg-accent-lavender hover:text-[#1C1F24] transition-all font-bold cursor-pointer"
            >
              {slides[currentSlide].btnText}
            </button>
            <button
              onClick={() => {
                trackEvent("banner_clic", {
                  banner_id: slides[currentSlide].id,
                  banner_label: slides[currentSlide].label,
                  banner_titulo: slides[currentSlide].title,
                  banner_accion: "/hazte-socio"
                });
                navigate("/hazte-socio");
              }}
              className="px-8 py-3.5 border border-white/20 text-[#F2F2F2] font-mono text-[10px] uppercase tracking-widest rounded-full hover:bg-white/10 transition-all font-semibold cursor-pointer"
            >
              ¡HAZTE SOCIO ONLINE!
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 right-8 flex items-center gap-1.5 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Ir al slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Calculator Card & Benefit (4/12 Columns) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          
          {/* Quick Calculator Card */}
          <div className="bg-white border border-brand-dark/10 rounded-[24px] p-6 shadow-sm flex flex-col justify-between flex-grow">
            <div>
              <span className="font-mono text-[10px] text-accent-lavender uppercase tracking-widest font-bold block mb-1">
                CALCULADORA RÁPIDA
              </span>
              <h3 className="font-display text-xl text-brand-dark tracking-tight mb-4 uppercase">
                Simula en 10 segundos
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                navigate(`/simulador/consumo?monto=${monto}&rut=${encodeURIComponent(rut)}`);
              }} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-mono text-brand-dark/60 uppercase mb-1">Monto a solicitar ($)</label>
                  <div className="space-y-2">
                    <input 
                      type="range"
                      min="500000"
                      max="40000000"
                      step="100000"
                      value={monto}
                      onChange={handleSliderChange}
                      className="w-full h-1.5 bg-brand-dark/10 rounded-lg appearance-none cursor-pointer accent-[#8799FB]"
                    />
                    <input 
                      type="text"
                      value={inputText}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="w-full bg-[#F8F9FA] border border-brand-dark/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent-lavender font-bold text-brand-dark"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-brand-dark/60 uppercase mb-1">Tu RUT</label>
                  <input 
                    name="quick_rut"
                    type="text" 
                    placeholder="12.345.678-9" 
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-brand-dark/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent-lavender"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#1C1F24] text-white py-3 rounded-xl font-display text-[11px] hover:bg-accent-lavender hover:text-brand-dark transition-all font-bold uppercase mt-2 tracking-wide cursor-pointer"
                >
                  SIMULAR AHORA
                </button>
              </form>
            </div>
          </div>

          {/* Micro Benefit Card / Banner */}
          <div 
            onClick={() => navigate("/beneficios")}
            className="bg-[#A4F1FB] hover:bg-[#8799FB] text-brand-dark rounded-[24px] p-5 flex justify-between items-center transition-all cursor-pointer shadow-sm select-none group"
          >
            <div>
              <span className="font-mono text-[9px] text-brand-dark/60 uppercase tracking-widest font-bold block">
                BENEFICIO EXCLUSIVO
              </span>
              <h4 className="font-display text-sm tracking-tight uppercase text-brand-dark font-black mt-1">
                MOMENTOS ÑAMI — 45% DCTO
              </h4>
            </div>
            <span className="font-mono text-[10px] font-bold border-b border-brand-dark tracking-tighter group-hover:border-b-2 transition-all">
              VER MÁS
            </span>
          </div>

        </div>

      </div>

      {/* Featured Promotions Grid (Socio utilidades, Cuenta Vista) */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Banner 1 */}
        <div className="bg-[#1C1F24] text-white p-8 rounded-3xl flex flex-col justify-between space-y-6 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-lavender/5 rounded-full blur-3xl" />
          <div className="space-y-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-accent-lavender font-bold">REMANENTE COOPERATIVO</span>
            <h3 className="font-display text-2xl tracking-tight max-w-sm">Aquí tus utilidades se reparten contigo</h3>
            <p className="text-xs text-white/75 leading-relaxed font-sans max-w-md">
              A diferencia de la banca tradicional, en MindersCredit eres copropietario. Cada año repartimos el remanente de utilidades de forma proporcional a tus cuotas de participación.
            </p>
          </div>
          <button
            onClick={() => navigate("/hazte-socio")}
            className="self-start px-6 py-2.5 bg-accent-lavender text-brand-dark font-mono text-[10px] uppercase tracking-wider rounded-full font-bold hover:bg-opacity-90"
          >
            Saber cómo funciona →
          </button>
        </div>

        {/* Banner 2 */}
        <div className="bg-white border border-brand-dark/10 p-8 rounded-3xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 rounded-full blur-3xl" />
          <div className="space-y-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#0F766E] font-bold">CUENTA VISTA COSTO $0</span>
            <h3 className="font-display text-2xl tracking-tight max-w-sm text-brand-dark">Transfiere y gira sin cobros por uso</h3>
            <p className="text-xs text-brand-dark/70 leading-relaxed font-sans max-w-md">
              Abre tu cuenta vista socio 100% digital. No pagues costos fijos de mantención, comisiones por transferencia electrónica o giros en cajeros.
            </p>
          </div>
          <button
            onClick={() => navigate("/cuenta-vista")}
            className="self-start px-6 py-2.5 bg-brand-dark text-white font-mono text-[10px] uppercase tracking-wider rounded-full font-bold hover:bg-brand-dark/95"
          >
            Apertura digital costo $0 →
          </button>
        </div>

      </div>

      {/* 20 navigable Journeys Bento Matrix */}
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div>
          <span className="font-mono text-xs uppercase text-brand-dark/50 block">PORTAFOLIO DE SERVICIOS</span>
          <h2 className="font-display text-2xl text-brand-dark mt-1">nuestros servicios</h2>
          <p className="text-xs text-brand-dark/70 mt-1">Explora de forma interactiva y simula de manera segura y transparente todos tus flujos financieros.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Journey 1 */}
          <div onClick={() => navigate("/simulador/consumo")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <Calculator className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J1. Simulador Consumo</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Simula tu crédito en CLP con cuotas fijas y amortización francesa.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Simular crédito →</span>
          </div>

          {/* Journey 2 */}
          <div onClick={() => navigate("/hazte-socio")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <UserPlus className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J2. Hazte Socio Digital</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Únete en 4 pasos con validación de RUT y cuota de incorporación.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Hazte socio →</span>
          </div>

          {/* Journey 3 */}
          <div onClick={() => navigate("/tarjeta-credito")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <CreditCard className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J3. Tarjeta de Crédito</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Solicita tu tarjeta MC Black con acumulación de Puntos.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Postular tarjeta →</span>
          </div>

          {/* Journey 4 */}
          <div onClick={() => navigate("/cuenta-vista")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <Landmark className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J4. Apertura Cuenta Vista</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Cuenta debito costo $0 de mantención con comparativa bancaria.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Apertura online →</span>
          </div>

          {/* Journey 5 */}
          <div onClick={() => navigate("/seguros")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J5. Cotizador Seguros</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Seguros de Hogar, Auto, Mascotas y SOAP con cotización digital.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Cotizar seguro →</span>
          </div>

          {/* Journey 6 */}
          <div onClick={() => navigate("/simulador/hipotecario")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <HomeIcon className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J6. Simulador Hipotecario</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Calculador de dividendo UF/CLP para vivienda Verde y Joven.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Simular vivienda →</span>
          </div>

          {/* Journey 7 */}
          <div onClick={() => navigate("/portabilidad")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J7. Portabilidad Financiera</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Traslada tus productos bancarios externos a MindersCredit.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Traer deudas →</span>
          </div>

          {/* Journey 8 */}
          <div onClick={() => navigate("/regulariza-deuda")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <Scale className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J8. Regulariza tu Deuda</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Convenios confidenciales con descuentos de hasta el 30%.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Convenios de deuda →</span>
          </div>

          {/* Journey 9 */}
          <div onClick={() => navigate("/deposito-a-plazo")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J9. Depósito a Plazo DAP</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Multiplica tus excedentes con rentabilidad fija garantizada.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Simular depósito →</span>
          </div>

          {/* Journey 10 */}
          <div onClick={() => navigate("/agenda-tu-hora")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <Calculator className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J10. Agenda tu Hora</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Reserva cita de atención prioritaria presencial en sucursales.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Agendar turno →</span>
          </div>

          {/* Journey 11 */}
          <div onClick={() => navigate("/mi-minderscredit")} className="p-4 border border-brand-dark/10 bg-[#0F766E]/5 rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-[#0F766E]/10 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <Wallet className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J11. Mi MindersCredit Dashboard</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Sitio privado para ver cartola, transferir, bloquear tarjetas.</p>
            </div>
            <span className="text-[9px] font-mono text-[#0F766E] uppercase mt-4 block">Portal privado 🔐 →</span>
          </div>

          {/* Journey 13 */}
          <div onClick={() => navigate("/pago-online")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J13. Pago Express Online</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Consulta tus cuotas con RUT y paga mediante Transbank Webpay.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Pagar en línea →</span>
          </div>

          {/* Journey 14 */}
          <div onClick={() => navigate("/sucursales")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J14. Sucursales de Chile</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Filtra la red de oficinas de MindersCredit por región/comuna.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Ver oficinas →</span>
          </div>

          {/* Journey 15 */}
          <div onClick={() => navigate("/centro-ayuda")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <HelpIcon className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J15. Centro de Ayuda FAQ</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Base de conocimientos searchable sobre la cooperativa.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Buscar FAQs →</span>
          </div>

          {/* Journey 16 */}
          <div onClick={() => navigate("/emergencias")} className="p-4 border border-[#FC7E7F]/20 bg-red-50 rounded-2xl cursor-pointer hover:border-[#FC7E7F] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-[#FC7E7F]/10 rounded-full flex items-center justify-center text-[#FC7E7F] mb-3">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-brand-dark">J16. Emergencias 24/7</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Bloqueo de tarjetas inmediato por robo, hurto o fraude.</p>
            </div>
            <span className="text-[9px] font-mono text-[#FC7E7F] uppercase mt-4 block font-bold">Bloquear tarjeta 🚨 →</span>
          </div>

          {/* Journey 17 */}
          <div onClick={() => navigate("/acreencias")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <Wallet className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J17. Buscador de Acreencias</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Ingresa tu RUT para buscar fondos inactivos devueltos.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Buscar fondos →</span>
          </div>

          {/* Journey 18 */}
          <div onClick={() => navigate("/cuentas-ahorro")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J18. Cuentas de Ahorro</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Libretas de Ahorro Adulto, Infantil y Vivienda reajustables.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Ver libretas →</span>
          </div>

          {/* Journey 19 */}
          <div onClick={() => navigate("/educa")} className="p-4 border border-brand-dark/10 bg-[#A4F1FB]/10 rounded-2xl cursor-pointer hover:border-accent-cyan hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-accent-cyan/10 rounded-full flex items-center justify-center text-accent-cyan mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-accent-cyan">J19. MindersCredit Educa</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Aprende hoy e invierte mañana con nuestros contenidos.</p>
            </div>
            <span className="text-[9px] font-mono text-accent-cyan uppercase mt-4 block font-bold">Ver Hub Educa →</span>
          </div>

          {/* Journey 19 (original) */}
          <div onClick={() => navigate("/beneficios")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-[#0F766E] mb-3">
                <Gift className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J19. Club de Beneficios</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Reclama cupones de descuentos preferenciales en comercios.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Ver convenios →</span>
          </div>

          {/* Journey 20 */}
          <div onClick={() => navigate("/pensionados")} className="p-4 border border-brand-dark/10 bg-white rounded-2xl cursor-pointer hover:border-[#0F766E] hover:shadow-sm transition-all group flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-brand-dark mb-3">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="font-display text-xs text-brand-dark group-hover:text-[#0F766E]">J20. Canal Pensionados</h4>
              <p className="text-[10px] text-brand-dark/60 mt-1">Tasas de interés rebajadas y convenios de salud IPS.</p>
            </div>
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase mt-4 block">Ver portal →</span>
          </div>

        </div>
      </div>

    </div>
  );
}

function MainApp() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    if (utmSource && ["organico", "cpc", "social", "email", "whatsapp"].includes(utmSource)) {
      driverService.set("canal_origen", utmSource);
    } else if (!driverService.get("canal_origen")) {
      driverService.set("canal_origen", "organico");
    }

    const origin = driverService.get("canal_origen");
    if (origin && origin !== "organico") {
      amplitudeService.setUserProperty("canal_adquisicion", origin, true);
    }
  }, []);

  const [loginOpen, setLoginOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const { user } = useAuth();

  const handleLoginSuccess = () => {
    setLoginOpen(false);
  };

  const handleLogout = () => {
    // any extra session cleanup if needed
  };

  // Simple router view switch mapped to paths
  const renderView = (path: string) => {
    // Normalizing sub routes
    if (path.startsWith("/demo-lab")) {
      return <DemoLab />;
    }
    if (path === "/" || path === "/home") {
      return <HomeView />;
    }
    if (path.startsWith("/simulador/consumo")) {
      return <SimuladorConsumo />;
    }
    if (path.startsWith("/hazte-socio")) {
      return <OnboardingSocio />;
    }
    if (path.startsWith("/tarjeta-credito")) {
      return <TarjetaCredito />;
    }
    if (path.startsWith("/cuenta-vista") || path.startsWith("/cuenta-vista-joven")) {
      return <CuentasVista />;
    }
    if (path.startsWith("/seguro") || path.startsWith("/seguros")) {
      return <SegurosCotizador />;
    }
    if (path.startsWith("/simulador/hipotecario") || path.startsWith("/portabilidad")) {
      return <HipotecarioYPortabilidad />;
    }
    if (path.startsWith("/deposito-a-plazo") || path.startsWith("/cuentas-ahorro")) {
      return <AhorroEInversiones onOpenLogin={() => setLoginOpen(true)} />;
    }
    if (path.startsWith("/centro-ayuda") || path.startsWith("/sucursales") || path.startsWith("/emergencias")) {
      return <AyudaYSucursales />;
    }
    if (path.startsWith("/pago-online") || path.startsWith("/agenda-tu-hora") || path.startsWith("/regulariza-deuda") || path.startsWith("/acreencias")) {
      return <ServiciosFinancieros />;
    }
    if (path.startsWith("/beneficios") || path.startsWith("/pensionados")) {
      return <SegmentosYBeneficios />;
    }
    if (path.startsWith("/educa/")) {
      const id = path.split("/")[2];
      return <EducaDetalle id={id} />;
    }
    if (path === "/educa") {
      return <EducaHub />;
    }
    if (path.startsWith("/mi-minderscredit")) {
      return <MiMindersCredit onOpenLogin={() => setLoginOpen(true)} />;
    }

    if (
      path.startsWith("/que-es-minderscredit") ||
      path.startsWith("/ventajas-socio") ||
      path.startsWith("/ventajas-de-ser-socio") ||
      path.startsWith("/remanente") ||
      path.startsWith("/cuotas-participacion") ||
      path.startsWith("/cuotas-de-participacion") ||
      path.startsWith("/credito-mype") ||
      path.startsWith("/credito-universal")
    ) {
      return <InfoPage pathKey={path} />;
    }

    // Default Fallback to home
    return <HomeView />;
  };

  return (
    <div id="minderscredit-app-root" className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <Header 
        onOpenLogin={() => setLoginOpen(true)} 
        onOpenWhatsApp={() => setWhatsAppOpen(true)} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1">
        <AppRouteContainer renderView={renderView} />
      </main>
      
      <Footer />

      {/* Global Widgets */}
      <WhatsAppWidget isOpen={whatsAppOpen} onClose={() => setWhatsAppOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
      <DevPanel />
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <RouterProvider>
          <MainApp />
        </RouterProvider>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

// Inner container that listens to routing state changes and handles rendering
function AppRouteContainer({ renderView }: { renderView: (path: string) => React.ReactNode }) {
  const { currentPath } = useRouter();
  
  // Keep scroll at top on path changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  return <>{renderView(currentPath)}</>;
}
