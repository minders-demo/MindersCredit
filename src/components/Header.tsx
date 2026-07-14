import { useState } from "react";
import { useRouter } from "../RouterContext";
import { useAccessibility } from "./AccessibilityContext";
import { useAuth } from "../hooks/useAuth";
import { amplitudeService } from "../services/amplitude.service";
import { ChevronDown, Menu, X, User, LogOut, Check, Phone, Eye, Calendar, DollarSign, Users, Lock } from "lucide-react";

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenWhatsApp: () => void;
  onLogout: () => void;
}

export default function Header({ onOpenLogin, onOpenWhatsApp, onLogout }: HeaderProps) {
  const { currentPath, navigate } = useRouter();
  const { textSize, highContrast, increaseTextSize, decreaseTextSize, toggleHighContrast } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const handleNavClick = (path: string, seccionName?: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setActiveMegaMenu(null);
    if (seccionName) {
      amplitudeService.track("menu_item_clic", { destino: path, categoria: seccionName });
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    onLogout();
    navigate("/");
  };

  const toggleMegaMenu = (menu: string) => {
    if (activeMegaMenu === menu) {
      setActiveMegaMenu(null);
    } else {
      setActiveMegaMenu(menu);
      amplitudeService.track("megamenu_abierto", { menu_name: menu });
    }
  };

  const toggleContrastAndLog = () => {
    toggleHighContrast();
  };

  return (
    <header className="w-full relative z-40 bg-brand-bg text-brand-dark border-b border-brand-dark/10">
      {/* Top Accessibility/Segments Bar */}
      <div className="w-full bg-[#E8E8E8] text-brand-dark px-4 md:px-8 py-2 md:h-8 border-b border-gray-300 text-[10px] font-mono flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-6 items-center flex-wrap">
          <button 
            onClick={() => handleNavClick("/", "personas")}
            className={`cursor-pointer transition-colors font-bold ${currentPath === "/" || currentPath === "/home" ? "border-b-2 border-brand-dark text-brand-dark" : "opacity-60 hover:opacity-100"}`}
          >
            Personas
          </button>
          <button 
            onClick={() => handleNavClick("/pensionados", "pensionados")}
            className={`cursor-pointer transition-colors font-bold ${currentPath === "/pensionados" ? "border-b-2 border-brand-dark text-brand-dark" : "opacity-60 hover:opacity-100"}`}
          >
            Pensionados
          </button>
          <button 
            onClick={() => handleNavClick("/que-es-minderscredit", "cooperativa")}
            className={`cursor-pointer transition-colors font-bold ${currentPath === "/que-es-minderscredit" ? "border-b-2 border-brand-dark text-brand-dark" : "opacity-60 hover:opacity-100"}`}
          >
            Cooperativa
          </button>
          <button 
            onClick={() => handleNavClick("/ventajas-socio", "convenios")}
            className={`cursor-pointer transition-colors font-bold ${currentPath === "/ventajas-socio" ? "border-b-2 border-brand-dark text-brand-dark" : "opacity-60 hover:opacity-100"}`}
          >
            Convenios
          </button>
          <button 
            onClick={() => handleNavClick("/remanente", "ir")}
            className={`cursor-pointer transition-colors font-bold ${currentPath === "/remanente" ? "border-b-2 border-brand-dark text-brand-dark" : "opacity-60 hover:opacity-100"}`}
          >
            Investor Relations
          </button>
        </div>

        {/* Accessibility Panel */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="font-bold underline">Accesibilidad</span>
            <button 
              onClick={decreaseTextSize} 
              className="hover:underline font-bold px-1" 
              title="Reducir letra"
            >
              A-
            </button>
            <span className="opacity-40">/</span>
            <button 
              onClick={increaseTextSize} 
              className="hover:underline font-bold px-1" 
              title="Aumentar letra"
            >
              A+
            </button>
          </div>

          <button 
            onClick={toggleContrastAndLog} 
            className={`flex items-center gap-1 font-bold transition-all ${highContrast ? "text-accent-lavender" : "opacity-75 hover:opacity-100"}`}
          >
            <Eye className="w-3 h-3" />
            {highContrast ? "Contraste Normal" : "Alto Contraste"}
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center h-20">
        <div className="flex items-center gap-10">
          {/* Logo Wordmark */}
          <button 
            onClick={() => handleNavClick("/", "logo")}
            className="font-display text-2xl tracking-tighter text-brand-dark flex items-center gap-0.5 select-none font-black"
          >
            MindersCredit<span className="text-accent-lavender">.</span>
          </button>

          {/* Desktop Mega-menu Titles */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold uppercase tracking-tight">
            {/* Mega 1 */}
            <div className="relative">
              <button 
                onClick={() => toggleMegaMenu("creditos")}
                className={`flex items-center gap-1 py-2 hover:text-[#8799FB] transition-all cursor-pointer ${activeMegaMenu === "creditos" ? "text-accent-lavender" : ""}`}
              >
                Créditos <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === "creditos" ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Mega 2 */}
            <div className="relative">
              <button 
                onClick={() => toggleMegaMenu("ahorro")}
                className={`flex items-center gap-1 py-2 hover:text-[#8799FB] transition-all cursor-pointer ${activeMegaMenu === "ahorro" ? "text-accent-lavender" : ""}`}
              >
                Ahorro <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === "ahorro" ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Mega 3 */}
            <div className="relative">
              <button 
                onClick={() => toggleMegaMenu("seguros")}
                className={`flex items-center gap-1 py-2 hover:text-[#8799FB] transition-all cursor-pointer ${activeMegaMenu === "seguros" ? "text-accent-lavender" : ""}`}
              >
                Seguros <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === "seguros" ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Mega 4 */}
            <div className="relative">
              <button 
                onClick={() => toggleMegaMenu("socio")}
                className={`flex items-center gap-1 py-2 hover:text-[#8799FB] transition-all cursor-pointer ${activeMegaMenu === "socio" ? "text-accent-lavender" : ""}`}
              >
                Socio <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === "socio" ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Mega 5 */}
            <div className="relative">
              <button 
                onClick={() => toggleMegaMenu("beneficios")}
                className={`flex items-center gap-1 py-2 hover:text-[#8799FB] transition-all cursor-pointer ${activeMegaMenu === "beneficios" ? "text-accent-lavender" : ""}`}
              >
                Beneficios <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === "beneficios" ? "rotate-180" : ""}`} />
              </button>
            </div>

            <button 
              onClick={() => handleNavClick("/regulariza-deuda", "deudas")}
              className="hover:text-[#8799FB] py-2 border-b-2 border-transparent hover:border-accent-lavender transition-all cursor-pointer"
            >
              Regulariza Deuda
            </button>
          </nav>
        </div>

        {/* Action CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <button 
            onClick={() => handleNavClick("/agenda-tu-hora", "agenda_hora")}
            className="px-4 py-2 border border-brand-dark rounded-full text-[10px] font-mono hover:bg-brand-dark hover:text-white transition-colors"
          >
            Agenda tu hora
          </button>

          <button 
            onClick={() => handleNavClick("/hazte-socio", "hazte_socio")}
            className="px-4 py-2 bg-brand-dark text-brand-bg rounded-full text-[10px] font-mono hover:bg-brand-dark/95 transition-all"
          >
            ¡Hazte Socio!
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleNavClick("/mi-minderscredit", "sitio_privado")}
                className="px-5 py-2 bg-brand-dark text-white rounded-full text-[10px] font-bold tracking-tight hover:bg-brand-dark/95 transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-accent-cyan" />
                Mi Cuenta
              </button>
              <button 
                onClick={handleLogoutClick}
                className="p-2 border border-brand-dark/15 rounded-full hover:bg-accent-coral/10 hover:border-accent-coral/25 transition-all"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5 text-accent-coral" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenLogin}
              className="px-5 py-2 bg-accent-lavender text-black rounded-full text-[10px] font-bold tracking-tight hover:bg-accent-lavender/90 transition-all flex items-center gap-1.5"
              data-amp-event="btn_header_login"
            >
              <Lock className="w-3.5 h-3.5" />
              MINDERSCREDIT EN LÍNEA
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          {user && (
            <button
              onClick={() => handleNavClick("/mi-minderscredit", "sitio_privado")}
              className="p-2.5 bg-brand-dark text-white rounded-full font-mono text-xs"
            >
              Mi Cuenta
            </button>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-brand-dark/20 rounded-lg bg-white/40 hover:bg-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MEGA-MENU DROPDOWN PANELS (Desktop only) */}
      {activeMegaMenu && (
        <div className="hidden lg:block absolute left-0 right-0 top-full bg-[#E8E8E8] border-b border-brand-dark/15 shadow-xl py-8 z-50 animate-fade-in">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-5 gap-6">
            
            {/* PANEL 1: CREDITOS Y TARJETAS */}
            {activeMegaMenu === "creditos" && (
              <>
                <div className="col-span-2 border-r border-brand-dark/10 pr-6">
                  <span className="font-mono text-[10px] text-brand-dark/50 uppercase tracking-widest block mb-4">
                    01 — Créditos Cooperativos
                  </span>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleNavClick("/simulador/consumo", "megamenu_creditos")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Crédito de Consumo</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Simulador rápido, cuotas fijas y tasa cooperativa</span>
                    </button>

                    <button 
                      onClick={() => handleNavClick("/pensionados", "megamenu_creditos")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Crédito Pensionados</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Hasta 60 cuotas, descuento directo por colilla de pensión</span>
                    </button>

                    <button 
                      onClick={() => handleNavClick("/credito-mype", "megamenu_creditos")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Crédito MYPE</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Financiamiento para micro y pequeñas empresas chilenas</span>
                    </button>

                    <button 
                      onClick={() => handleNavClick("/credito-universal", "megamenu_creditos")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Crédito Universal</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Parámetros estandarizados regulados por la CMF</span>
                    </button>

                    <button 
                      onClick={() => handleNavClick("/portabilidad", "megamenu_creditos")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Portabilidad Financiera</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Tráete tus deudas a MindersCredit con mejores condiciones</span>
                    </button>
                  </div>
                </div>

                <div className="col-span-2 border-r border-brand-dark/10 pr-6">
                  <span className="font-mono text-[10px] text-brand-dark/50 uppercase tracking-widest block mb-4">
                    02 — Créditos Hipotecarios
                  </span>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleNavClick("/simulador/hipotecario", "megamenu_hipotecarios")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Crédito Hipotecario</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Calcula tu tasa en UF a plazos de 15, 20 o 30 años</span>
                    </button>

                    <button 
                      onClick={() => handleNavClick("/simulador/hipotecario?tipo=verde", "megamenu_hipotecarios")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Hipotecario Verde</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Tasa preferencial para proyectos sostenibles y eco-eficientes</span>
                    </button>

                    <button 
                      onClick={() => handleNavClick("/simulador/hipotecario?tipo=joven", "megamenu_hipotecarios")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Hipotecario Joven</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Financiamiento flexible para tu primera vivienda</span>
                    </button>

                    <button 
                      onClick={() => handleNavClick("/simulador/hipotecario?tipo=subsidio", "megamenu_hipotecarios")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Hipotecario con Subsidio</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Complementa tu beneficio habitacional del MINVU</span>
                    </button>
                  </div>
                </div>

                <div className="col-span-1">
                  <span className="font-mono text-[10px] text-brand-dark/50 uppercase tracking-widest block mb-4">
                    03 — Cuentas y Tarjetas
                  </span>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleNavClick("/cuenta-vista", "megamenu_tarjetas")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Cuenta Vista costo $0</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Comisión mensual costo cero</span>
                    </button>

                    <button 
                      onClick={() => handleNavClick("/cuenta-vista-joven", "megamenu_tarjetas")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Cuenta Vista Joven</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Para menores de 26 años</span>
                    </button>

                    <button 
                      onClick={() => handleNavClick("/tarjeta-credito", "megamenu_tarjetas")} 
                      className="group flex flex-col text-left"
                    >
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Tarjeta de Crédito</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Acumula Puntos MindersCredit</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* PANEL 2: AHORRO E INVERSIONES */}
            {activeMegaMenu === "ahorro" && (
              <>
                <div className="col-span-2 border-r border-brand-dark/10 pr-6">
                  <span className="font-mono text-[10px] text-brand-dark/50 uppercase tracking-widest block mb-4">
                    04 — Cuentas de Ahorro
                  </span>
                  <div className="space-y-4">
                    <button onClick={() => handleNavClick("/cuentas-ahorro?tipo=adulto", "megamenu_ahorro")} className="group flex flex-col text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Cuenta Ahorro Adultos</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Rentabilidad segura e interés anual garantizado</span>
                    </button>
                    <button onClick={() => handleNavClick("/cuentas-ahorro?tipo=nino", "megamenu_ahorro")} className="group flex flex-col text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Cuenta Ahorro Niños</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Fomenta el ahorro cooperativo desde temprano</span>
                    </button>
                    <button onClick={() => handleNavClick("/cuentas-ahorro?tipo=vivienda", "megamenu_ahorro")} className="group flex flex-col text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Cuenta Ahorro Vivienda</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Especial para postular al Subsidio Habitacional</span>
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="font-mono text-[10px] text-brand-dark/50 uppercase tracking-widest block mb-4">
                    05 — Inversiones Financieras
                  </span>
                  <div className="space-y-4">
                    <button onClick={() => handleNavClick("/deposito-a-plazo", "megamenu_ahorro")} className="group flex flex-col text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all">Depósito a Plazo (DAP)</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Calcula tu rentabilidad en pesos o UF de forma inmediata</span>
                    </button>
                  </div>
                </div>

                <div className="col-span-1 bg-brand-dark text-white p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono text-xs text-accent-cyan uppercase tracking-wider mb-2">MindersCredit Educa</h4>
                    <p className="text-[11px] text-white/80 font-sans leading-relaxed">
                      Aprende a presupuestar, manejar tu deuda y entender tu remanente cooperativo.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleNavClick("/educa", "megamenu_educa")} 
                    className="text-xs font-mono text-accent-lavender hover:underline text-left mt-4"
                  >
                    Ver contenidos →
                  </button>
                </div>
              </>
            )}

            {/* PANEL 3: SEGUROS */}
            {activeMegaMenu === "seguros" && (
              <>
                <div className="col-span-5 grid grid-cols-4 gap-6">
                  <button onClick={() => handleNavClick("/seguros?cat=automotriz", "megamenu_seguros")} className="p-4 bg-brand-dark/5 hover:bg-brand-dark/10 rounded-xl transition-all text-left">
                    <span className="font-mono text-[10px] text-brand-dark/60 uppercase">06 — Automotriz</span>
                    <h4 className="font-display text-sm mt-2">Seguro Auto Full & SOAP</h4>
                    <span className="text-[11px] text-brand-dark/70 font-mono block mt-1">Cotiza con o sin deducible + SOAP 2026 online</span>
                  </button>

                  <button onClick={() => handleNavClick("/seguros?cat=bienes", "megamenu_seguros")} className="p-4 bg-brand-dark/5 hover:bg-brand-dark/10 rounded-xl transition-all text-left">
                    <span className="font-mono text-[10px] text-brand-dark/60 uppercase">07 — Hogar</span>
                    <h4 className="font-display text-sm mt-2">Seguro Hogar Protegido</h4>
                    <span className="text-[11px] text-brand-dark/70 font-mono block mt-1">Frente a incendios, sismos y asistencia domiciliaria</span>
                  </button>

                  <button onClick={() => handleNavClick("/seguros?cat=salud", "megamenu_seguros")} className="p-4 bg-brand-dark/5 hover:bg-brand-dark/10 rounded-xl transition-all text-left">
                    <span className="font-mono text-[10px] text-brand-dark/60 uppercase">08 — Salud y Vida</span>
                    <h4 className="font-display text-sm mt-2">Seguro Mascotas Club & Salud</h4>
                    <span className="text-[11px] text-brand-dark/70 font-mono block mt-1">Cuidado clínico y preventivo para tus regalones</span>
                  </button>

                  <button onClick={() => handleNavClick("/seguros", "megamenu_seguros")} className="p-4 bg-brand-dark/5 hover:bg-brand-dark/10 rounded-xl transition-all text-left flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-brand-dark/60 uppercase">09 — Todo el catálogo</span>
                      <h4 className="font-display text-sm mt-2">Explorar Seguros</h4>
                    </div>
                    <span className="text-xs font-mono text-accent-lavender underline mt-4">Ver todos →</span>
                  </button>
                </div>
              </>
            )}

            {/* PANEL 4: SER SOCIO */}
            {activeMegaMenu === "socio" && (
              <>
                <div className="col-span-3 border-r border-brand-dark/10 pr-6">
                  <span className="font-mono text-[10px] text-brand-dark/50 uppercase tracking-widest block mb-4">
                    10 — El Modelo Cooperativo
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleNavClick("/que-es-minderscredit", "megamenu_socio")} className="group text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all block">¿Qué es MindersCredit?</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Nuestra historia, valores y foco social</span>
                    </button>

                    <button onClick={() => handleNavClick("/ventajas-socio", "megamenu_socio")} className="group text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all block">Ventajas de ser socio</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Diferencias de valor v/s los bancos tradicionales</span>
                    </button>

                    <button onClick={() => handleNavClick("/cuotas-participacion", "megamenu_socio")} className="group text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all block">Cuotas de participación</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">El capital cooperativo de propiedad colectiva</span>
                    </button>

                    <button onClick={() => handleNavClick("/remanente", "megamenu_socio")} className="group text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all block">Remanente de utilidades</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">La distribución equitativa anual para nuestros socios</span>
                    </button>
                  </div>
                </div>

                <div className="col-span-2 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-brand-dark/50 uppercase tracking-widest block mb-2">
                      ¡Comienza tu Onboarding!
                    </span>
                    <h4 className="font-display text-lg leading-snug">Asóciate 100% online en menos de 5 minutos</h4>
                    <p className="text-xs text-brand-dark/70 mt-1">
                      Adquiere tus cuotas de participación y accede de inmediato al beneficio del remanente.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleNavClick("/hazte-socio", "megamenu_onboarding")} 
                    className="mt-4 px-6 py-3 bg-brand-dark text-white font-mono text-xs uppercase tracking-wider rounded-full hover:bg-brand-dark/90 transition-all text-center font-bold"
                  >
                    Hazte Socio Digital →
                  </button>
                </div>
              </>
            )}

            {/* PANEL 5: BENEFICIOS */}
            {activeMegaMenu === "beneficios" && (
              <>
                <div className="col-span-3 border-r border-brand-dark/10 pr-6">
                  <span className="font-mono text-[10px] text-brand-dark/50 uppercase tracking-widest block mb-4">
                    11 — Alianzas y Descuentos
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleNavClick("/beneficios", "megamenu_beneficios")} className="group text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all block">Club de Beneficios</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Hasta 45% dscto en gas, comida, salud y entretención</span>
                    </button>

                    <button onClick={() => handleNavClick("/puntos", "megamenu_beneficios")} className="group text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all block">Puntos MindersCredit</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Canjea tus puntos por abonos o donaciones cooperativas</span>
                    </button>

                    <button onClick={() => handleNavClick("/acreencias", "megamenu_beneficios")} className="group text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all block">Acreencias Bancarias</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Busca si tienes dinero pendiente por cobrar</span>
                    </button>

                    <button onClick={() => handleNavClick("/educa", "megamenu_beneficios")} className="group text-left">
                      <span className="font-display text-sm group-hover:text-accent-lavender transition-all block">Becas y Bonos de Estudio</span>
                      <span className="text-[11px] text-brand-dark/70 font-mono">Premios para el desarrollo académico de socios e hijos</span>
                    </button>
                  </div>
                </div>

                <div className="col-span-2 bg-[#FC7E7F]/15 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono text-xs text-[#000000] uppercase tracking-wider mb-1">Campaña de Invierno</h4>
                    <h3 className="font-display text-sm text-[#000000]">Paga con MindersCredit y ahorra hasta $200 por litro de bencina</h3>
                  </div>
                  <button 
                    onClick={() => handleNavClick("/beneficios?cat=transporte", "megamenu_promo")} 
                    className="text-xs font-mono text-brand-dark font-bold hover:underline text-left mt-3"
                  >
                    Ver locales adheridos →
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* MOBILE FULL-SCREEN DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-[110px] bg-[#E8E8E8] z-30 overflow-y-auto p-6 flex flex-col border-t border-brand-dark/15">
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[10px] text-brand-dark/50 block mb-2 uppercase">Menú Principal</span>
              <div className="flex flex-col gap-3.5">
                <button onClick={() => handleNavClick("/simulador/consumo", "mobile")} className="text-left font-display text-base">Crédito de Consumo</button>
                <button onClick={() => handleNavClick("/simulador/hipotecario", "mobile")} className="text-left font-display text-base">Crédito Hipotecario</button>
                <button onClick={() => handleNavClick("/cuenta-vista", "mobile")} className="text-left font-display text-base">Cuenta Vista costo $0</button>
                <button onClick={() => handleNavClick("/tarjeta-credito", "mobile")} className="text-left font-display text-base">Tarjeta de Crédito</button>
                <button onClick={() => handleNavClick("/seguros", "mobile")} className="text-left font-display text-base">Seguros Cotizador</button>
                <button onClick={() => handleNavClick("/deposito-a-plazo", "mobile")} className="text-left font-display text-base">Depósito a Plazo</button>
                <button onClick={() => handleNavClick("/beneficios", "mobile")} className="text-left font-display text-base">Club de Beneficios</button>
                <button onClick={() => handleNavClick("/hazte-socio", "mobile")} className="text-left font-display text-base text-accent-lavender font-bold">¡Hazte Socio Digital!</button>
                <button onClick={() => handleNavClick("/regulariza-deuda", "mobile")} className="text-left font-display text-base text-accent-coral">Regulariza tu Deuda</button>
              </div>
            </div>

            <hr className="border-brand-dark/10" />

            <div>
              <span className="font-mono text-[10px] text-brand-dark/50 block mb-2 uppercase">Servicios Rápidos</span>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleNavClick("/agenda-tu-hora", "mobile")} className="p-3 border border-brand-dark/15 rounded-xl font-mono text-[11px] text-center uppercase tracking-wider font-semibold">Agenda Hora</button>
                <button onClick={() => handleNavClick("/pago-online", "mobile")} className="p-3 border border-brand-dark/15 rounded-xl font-mono text-[11px] text-center uppercase tracking-wider font-semibold">Pago Online</button>
                <button onClick={() => handleNavClick("/sucursales", "mobile")} className="p-3 border border-brand-dark/15 rounded-xl font-mono text-[11px] text-center uppercase tracking-wider font-semibold">Sucursales</button>
                <button onClick={() => handleNavClick("/centro-ayuda", "mobile")} className="p-3 border border-brand-dark/15 rounded-xl font-mono text-[11px] text-center uppercase tracking-wider font-semibold">Ayuda (FAQ)</button>
                <button onClick={() => handleNavClick("/emergencias", "mobile")} className="p-3 border border-brand-dark/15 rounded-xl font-mono text-[11px] text-center uppercase tracking-wider font-semibold text-accent-coral">Bloqueo Tarjetas</button>
                <button onClick={() => handleNavClick("/acreencias", "mobile")} className="p-3 border border-brand-dark/15 rounded-xl font-mono text-[11px] text-center uppercase tracking-wider font-semibold">Acreencias</button>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <button 
                    onClick={() => handleNavClick("/mi-minderscredit", "mobile")} 
                    className="w-full py-3.5 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider text-center"
                  >
                    Mi Cuenta (Sitio Privado)
                  </button>
                  <button 
                    onClick={handleLogoutClick} 
                    className="w-full py-3.5 border border-accent-coral text-accent-coral rounded-full font-mono text-xs uppercase tracking-wider text-center"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }} 
                  className="w-full py-3.5 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider text-center"
                >
                  MindersCredit en Línea
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
