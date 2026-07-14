import React, { useState, useEffect } from "react";
import { DEMO_USERS, DemoUser } from "../data";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/auth.service";
import { rotateInstallationId, getInstallationId } from "../utils/installation";
import { amplitudeService } from "../services/amplitude.service";
import { 
  Terminal, User, RotateCcw, ChevronDown, ChevronUp, Radio, 
  Smartphone, Monitor, RefreshCw, Key, ShieldCheck, Sparkles, Activity
} from "lucide-react";

interface TrackedEvent {
  eventName: string;
  properties: any;
  timestamp: string;
}

export default function DevPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<TrackedEvent[]>([]);
  const { user, logout } = useAuth();
  const [currentPlatform, setCurrentPlatform] = useState<"web" | "mobile_web">("web");
  const [deviceId, setDeviceId] = useState<string>("");
  const [journeyState, setJourneyState] = useState<any>(null);

  useEffect(() => {
    // Cargar plataforma simulada actual y device_id
    const savedPlatform = localStorage.getItem("minders_demo_platform");
    if (savedPlatform === "web" || savedPlatform === "mobile_web") {
      setCurrentPlatform(savedPlatform);
    } else {
      setCurrentPlatform(typeof window !== "undefined" && window.innerWidth < 768 ? "mobile_web" : "web");
    }

    setDeviceId(getInstallationId());

    // Cargar journeys state
    const updateJourneysState = () => {
      const stored = localStorage.getItem("minders_demo_journeys");
      if (stored) {
        try {
          setJourneyState(JSON.parse(stored));
        } catch (e) {
          setJourneyState(null);
        }
      } else {
        setJourneyState(null);
      }
    };
    updateJourneysState();

    // Escuchar logs analíticos de AmplitudeService
    const handleAnalyticsLog = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail || {};
      const newEvent: TrackedEvent = {
        eventName: detail.eventName || "unknown",
        properties: detail.properties || {},
        timestamp: new Date().toLocaleTimeString("es-CL"),
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 5)); // Mostrar últimos 5 eventos
      updateJourneysState(); // Actualizar journeys en tiempo real cuando hay eventos
    };

    window.addEventListener("amplitude_log", handleAnalyticsLog);
    return () => {
      window.removeEventListener("amplitude_log", handleAnalyticsLog);
    };
  }, [user]);

  // Cambiar plataforma simulada (Desktop Web / Mobile Web)
  const handleTogglePlatform = (platform: "web" | "mobile_web") => {
    localStorage.setItem("minders_demo_platform", platform);
    setCurrentPlatform(platform);
    amplitudeService.track("platform_simulated_changed", { new_platform: platform });
    window.location.reload();
  };

  // Rotar el ID del dispositivo (Simula cambio físico de móvil/computadora)
  const handleRotateDevice = () => {
    const nextId = rotateInstallationId();
    setDeviceId(nextId);
    alert(`¡Dispositivo Simulado Rotado!\nNuevo Device ID: ${nextId}\n\nPara probar la continuidad del journey, inicia sesión con la misma cuenta.`);
    window.location.reload();
  };

  // Inicio de sesión rápido directo mediante el catálogo estático
  const handleSelectPersona = async (p: DemoUser) => {
    try {
      if (user) {
        await logout();
      }
      
      await authService.login(p.rut_normalized, "Demo1234");
      window.location.reload();
    } catch (err: any) {
      alert(`Error al iniciar sesión simulada: ${err.message}`);
    }
  };

  const handleResetDemo = async () => {
    await logout();
    localStorage.removeItem("minders_demo_platform");
    localStorage.removeItem("minders_installation_id");
    localStorage.removeItem("minders_demo_journeys");
    localStorage.removeItem("minders_pensionado");
    localStorage.removeItem("minders_transactions");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      {/* Closed Button / Badge */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#1C1F24] hover:bg-brand-dark/95 text-white border-2 border-accent-lavender/30 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-mono font-bold tracking-wide transition-all scale-100 active:scale-95 cursor-pointer"
          id="btn_dev_panel_trigger"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          MINDERS DEMO PANEL
        </button>
      ) : (
        /* Open Dev Panel */
        <div
          className="bg-[#1C1F24] border border-white/10 rounded-[24px] p-5 w-[360px] shadow-2xl flex flex-col text-white relative animate-scale-up"
          style={{ maxHeight: "85vh" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5 mb-3.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider">HERRAMIENTAS DE CONTROL</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white font-mono text-[10px] uppercase bg-white/10 hover:bg-white/15 px-2 py-1 rounded transition-all cursor-pointer"
            >
              Ocultar
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto pr-1 scrollbar-thin flex-1 max-h-[60vh]">
            
            {/* AMPLITUDE INTEGRATION STATUS */}
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest block">
                Estado de Amplitude SDK
              </span>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">Conectado</span>
                </span>
                <span className="font-mono text-[9px] text-white/60 truncate max-w-[200px]">
                  {user ? `ID: ${user.customer_id}` : "Invitado sin ID"}
                </span>
              </div>
            </div>

            {/* 1. Platform Switcher (Web / Mobile) */}
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
              <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest block">
                Simular Canal / Plataforma
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePlatform("web")}
                  className={`py-1.5 px-3 rounded-lg font-mono text-[10px] flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    currentPlatform === "web"
                      ? "bg-accent-lavender/25 border-accent-lavender text-white font-bold"
                      : "bg-black/20 border-transparent text-white/60 hover:bg-black/30"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Escritorio (Web)
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePlatform("mobile_web")}
                  className={`py-1.5 px-3 rounded-lg font-mono text-[10px] flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    currentPlatform === "mobile_web"
                      ? "bg-accent-lavender/25 border-accent-lavender text-white font-bold"
                      : "bg-black/20 border-transparent text-white/60 hover:bg-black/30"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Móvil (Mobile Web)
                </button>
              </div>
            </div>

            {/* 2. Device Key Rotation */}
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest">
                  Simulación de Dispositivo
                </span>
                <span className="text-[8px] font-mono text-white/30 truncate max-w-[150px]" title={deviceId}>
                  ID: {deviceId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRotateDevice}
                className="w-full py-2 bg-brand-dark hover:bg-brand-dark/90 border border-white/10 text-white font-mono text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-accent-cyan" />
                Rotar ID Dispositivo
              </button>
            </div>

            {/* 3. Persona Switcher Section */}
            <div>
              <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-2">
                Selector Rápido de Usuario Demo
              </span>
              <div className="space-y-1.5">
                {DEMO_USERS.map((p) => {
                  const isActive = user?.customer_id === p.customer_id;
                  return (
                    <button
                      key={p.customer_id}
                      onClick={() => handleSelectPersona(p)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? "bg-accent-lavender/25 border-accent-lavender text-white animate-scale"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className={`w-4 h-4 ${isActive ? "text-accent-lavender" : "text-white/40"}`} />
                        <div>
                          <p className="text-xs font-bold leading-tight">{p.first_name} {p.last_name}</p>
                          <p className="text-[9px] font-mono text-white/40 leading-none mt-1">
                            RUT: {p.rut_normalized} | Clave: Demo1234
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[8px] font-mono uppercase bg-white/10 px-1 rounded-sm block">
                          {p.customer_segment === "pensionado" ? "IPS Senior" : p.customer_segment}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Visor of LocalStorage Journeys State */}
            <div className="flex flex-col min-h-0">
              <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">
                Estado de Journeys (localStorage)
              </span>
              <div className="bg-black/50 border border-white/5 rounded-xl p-2.5 font-mono text-[8px] text-emerald-400 overflow-y-auto max-h-28 scrollbar-thin">
                {journeyState && Object.keys(journeyState).length > 0 ? (
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(journeyState, null, 2)}
                  </pre>
                ) : (
                  <div className="text-white/30 text-center py-4">
                    Sin borradores guardados.
                  </div>
                )}
              </div>
            </div>

            {/* 5. Event Feed Analytics Console */}
            <div className="flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest block">
                  CONSOLA DE EVENTOS REALES
                </span>
                <span className="text-[7px] font-mono text-emerald-400 bg-emerald-500/15 px-1 rounded-sm animate-pulse flex items-center gap-1 shrink-0 font-bold">
                  <Activity className="w-2.5 h-2.5 text-emerald-400" />
                  REPLAY ACTIVADO (1.0)
                </span>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-2 font-mono text-[9px] text-white/90 overflow-y-auto space-y-2 h-28 max-h-28 scrollbar-thin">
                {events.length === 0 ? (
                  <div className="text-white/30 text-center py-6">
                    <Radio className="w-4 h-4 mx-auto mb-1 animate-pulse text-white/50" />
                    Esperando eventos analíticos...
                  </div>
                ) : (
                  events.map((evt, idx) => (
                    <div key={idx} className="border-b border-white/5 pb-1.5 last:border-0 last:pb-0 text-left">
                      <div className="flex justify-between items-start text-accent-cyan font-bold">
                        <span className="break-all">{evt.eventName}</span>
                        <span className="text-white/40 text-[7px] shrink-0 ml-1">{evt.timestamp}</span>
                      </div>
                      {evt.properties && Object.keys(evt.properties).length > 0 && (
                        <pre className="text-[7px] text-white/50 mt-0.5 max-w-full overflow-x-auto whitespace-pre-wrap font-mono">
                          {JSON.stringify(evt.properties)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-3">
            <button
              onClick={handleResetDemo}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-[9px] font-mono font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg border border-red-500/20 flex items-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Completo
            </button>
            <span className="text-[9px] font-mono text-white/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              100% PII-Safe
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
