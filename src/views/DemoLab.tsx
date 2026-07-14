import React, { useState, useEffect } from "react";
import { ArrowLeft, Play, LayoutDashboard, Bug, ShieldCheck, FileText } from "lucide-react";
import { DEMO_USERS } from "../data";
import { useRouter } from "../RouterContext";

export default function DemoLab() {
  const { navigate } = useRouter();
  
  const [numUsers, setNumUsers] = useState(10);
  const [daysHistory, setDaysHistory] = useState(30);
  const [webMix, setWebMix] = useState(60);
  const [activeTab, setActiveTab] = useState("consumo");
  const [logs, setLogs] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preset, setPreset] = useState("default");

  const [apiKey, setApiKey] = useState((import.meta as any).env.VITE_AMPLITUDE_API_KEY || "714214e5842a299f3fa47e23db5fe728");

  const tabs = [
    { id: "consumo", label: "Crédito de Consumo" },
    { id: "educa", label: "Educa" },
    { id: "socio", label: "Hazte Socio" },
    { id: "tarjeta", label: "Tarjeta de Crédito" },
    { id: "vista", label: "Cuenta Vista" },
    { id: "seguros", label: "Seguros" },
    { id: "dap", label: "Depósito a Plazo" },
    { id: "hipotecario", label: "Hipotecario" },
    { id: "portabilidad", label: "Portabilidad" },
    { id: "pago", label: "Pago Online" },
  ];

  const logMsg = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 100));
  };

  const applyPreset = (presetId: string) => {
    setPreset(presetId);
    if (presetId === "coopeuch") {
      setNumUsers(50);
      setWebMix(70);
      setDaysHistory(15);
      logMsg("⚙️ Preset 'Caso Coopeuch' aplicado: 50 usuarios, 70% web, 15 días.");
    }
  };

  const generateEvents = async (tabId: string) => {
    if (!apiKey) {
      alert("Falta VITE_AMPLITUDE_API_KEY");
      return;
    }
    
    setIsSending(true);
    setProgress(0);
    setLogs([]);
    logMsg(`🚀 Iniciando generación sintética para: ${tabId}`);
    
    const events = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const mediaSources = ["meta", "google", "organic", "referral"];
    
    for (let i = 0; i < numUsers; i++) {
      const syntheticUserId = `cust_synth_${Math.floor(Math.random() * 1000000)}`;
      const deviceId = `dev_synth_${syntheticUserId}`;
      const isMobile = Math.random() * 100 > webMix;
      const platform = isMobile ? "mobile_web" : "web";
      const osName = isMobile ? (Math.random() > 0.5 ? "iOS" : "Android") : (Math.random() > 0.5 ? "Windows" : "Mac OS X");
      
      const timeOffset = Math.random() * daysHistory * dayMs;
      const eventTime = now - timeOffset;
      
      // Calidad por fuente (organic y referral tienen más propensión a educa y conversión)
      const source = mediaSources[Math.floor(Math.random() * mediaSources.length)];
      const qualityMultiplier = (source === "organic" || source === "referral") ? 1.5 : 1.0;
      
      const consumeEduca = Math.random() < (0.35 * qualityMultiplier); // ~35% base consume educa
      const conversionChance = 0.3 * (consumeEduca ? 1.5 : 1.0) * qualityMultiplier;

      const baseEvent = {
        user_id: syntheticUserId,
        device_id: deviceId,
        time: eventTime,
        app_version: "1.0.0",
        platform: platform,
        os_name: osName,
        user_properties: {
          customer_segment: "socio_activo",
          es_socio: true,
          app_platform_ultimo_login: platform,
          region: "Región Metropolitana de Santiago",
          media_source: source
        }
      };

      if (tabId === "consumo") {
        events.push({
          ...baseEvent,
          event_type: "simulador_consumo_iniciado",
          insert_id: `ev_${syntheticUserId}_1_${eventTime}`
        });
        
        // Simular consumo de educa previo (inject en user properties de los siguientes eventos)
        let localUserProps = { ...baseEvent.user_properties };
        
        if (consumeEduca) {
          localUserProps = {
            ...localUserProps,
            // @ts-ignore
            contenidos_educa_completados: Math.floor(Math.random() * 3) + 1,
            nivel_educacion_financiera: "iniciado",
            categorias_educa: ["creditos"]
          };
          
          events.push({
            ...baseEvent,
            user_properties: localUserProps,
            event_type: "educa_contenido_completado",
            event_properties: {
              contenido_id: "cred-01",
              formato: "articulo",
              categoria: "creditos",
              tema_producto: "credito_consumo"
            },
            insert_id: `ev_${syntheticUserId}_ed_${eventTime}`
          });
        }

        if (Math.random() < conversionChance + 0.2) { // Algo más alto para la simulación
          events.push({
            ...baseEvent,
            user_properties: localUserProps,
            event_type: "simulacion_calculada",
            event_properties: { monto: 5000000, cuotas: 24, valor_cuota: 250000, leyo_contenido_educa: consumeEduca, contenidos_educa_vistos: consumeEduca ? 1 : 0 },
            insert_id: `ev_${syntheticUserId}_2_${eventTime}`
          });
          
          if (Math.random() < conversionChance) {
            events.push({
              ...baseEvent,
              user_properties: localUserProps,
              event_type: "simulador_consumo_completado",
              event_properties: { monto: 5000000, cuotas: 24, valor_cuota: 250000, folio: "SIM-123", leyo_contenido_educa: consumeEduca, contenidos_educa_vistos: consumeEduca ? 1 : 0 },
              insert_id: `ev_${syntheticUserId}_3_${eventTime}`
            });
          }
        }
      } else if (tabId === "educa") {
        events.push({
          ...baseEvent,
          event_type: "educa_hub_vista",
          insert_id: `ev_${syntheticUserId}_hub_${eventTime}`
        });
        
        if (Math.random() > 0.2) {
          events.push({
            ...baseEvent,
            event_type: "educa_contenido_iniciado",
            event_properties: { contenido_id: "aho-01", formato: "modulo", categoria: "ahorro", nivel: "basico", tema_producto: "deposito_plazo" },
            insert_id: `ev_${syntheticUserId}_ini_${eventTime}`
          });
          
          if (Math.random() > 0.4) {
             events.push({
              ...baseEvent,
              event_type: "educa_contenido_completado",
              event_properties: { contenido_id: "aho-01", formato: "modulo", categoria: "ahorro", tema_producto: "deposito_plazo", tiempo_seg: 120 },
              insert_id: `ev_${syntheticUserId}_comp_${eventTime}`
            });
            if (Math.random() > 0.5) {
               events.push({
                ...baseEvent,
                event_type: "educa_cta_producto_clic",
                event_properties: { contenido_id: "aho-01", tema_producto: "deposito_plazo", destino: "/deposito-a-plazo" },
                insert_id: `ev_${syntheticUserId}_cta_${eventTime}`
              });
            }
          }
        }
      }
      
      // We can expand logic for other tabs based on taxonomy.
    }

    logMsg(`📦 Preparando ${events.length} eventos para Amplitude HTTP API v2`);
    
    const batches = [];
    for (let i = 0; i < events.length; i += 100) {
      batches.push(events.slice(i, i + 100));
    }

    let successCount = 0;
    let failCount = 0;

    for (let b = 0; b < batches.length; b++) {
      try {
        const response = await fetch("https://api2.amplitude.com/2/httpapi", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "*/*"
          },
          body: JSON.stringify({
            api_key: apiKey,
            events: batches[b]
          })
        });

        if (response.ok) {
          successCount += batches[b].length;
          logMsg(`✅ Batch ${b+1}/${batches.length} enviado con éxito`);
        } else {
          failCount += batches[b].length;
          logMsg(`❌ Error en Batch ${b+1}: HTTP ${response.status}`);
        }
      } catch (err: any) {
        failCount += batches[b].length;
        logMsg(`❌ Excepción en Batch ${b+1}: ${err.message}`);
      }
      
      setProgress(Math.round(((b + 1) / batches.length) * 100));
    }
    
    setIsSending(false);
    logMsg(`🏁 Proceso completado. ${successCount} enviados, ${failCount} fallidos.`);
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col">
      <header className="bg-[#1C1F24] text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-white/60 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-accent-coral" />
              <h1 className="font-mono text-lg font-bold tracking-tight">Demo Lab v2</h1>
            </div>
            <div className="ml-2 flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-300 rounded text-[10px] font-mono border border-amber-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Entorno Aislado (No contamina sesiones reales)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex flex-col">
              <label className="text-white/50">API Key</label>
              <input 
                type="password" 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)}
                className="bg-black/50 border border-white/10 rounded px-2 py-1 w-48 text-white focus:outline-none focus:border-accent-coral"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Config & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[18px] p-6 shadow-sm border border-brand-dark/5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-mono text-sm font-bold text-brand-dark flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Configuración Global
              </h2>
              {activeTab === "consumo" && (
                 <button onClick={() => applyPreset("coopeuch")} className="px-3 py-1 bg-brand-dark text-white rounded text-[10px] font-mono uppercase">
                   Preset: Caso Coopeuch
                 </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-dark/60 mb-2">
                  Volumen de Usuarios
                </label>
                <input 
                  type="number" 
                  value={numUsers} 
                  onChange={e => setNumUsers(Number(e.target.value))}
                  className="w-full bg-[#F2F2F2] border-none rounded-lg p-2 font-mono text-sm text-brand-dark"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-dark/60 mb-2">
                  Días de Historia
                </label>
                <input 
                  type="number" 
                  value={daysHistory} 
                  onChange={e => setDaysHistory(Number(e.target.value))}
                  className="w-full bg-[#F2F2F2] border-none rounded-lg p-2 font-mono text-sm text-brand-dark"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-dark/60 mb-2">
                  Mezcla (Web / Mobile)
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={webMix} 
                    onChange={e => setWebMix(Number(e.target.value))}
                    className="flex-1 accent-brand-dark"
                  />
                  <span className="font-mono text-xs w-10 text-right">{webMix}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[18px] p-6 shadow-sm border border-brand-dark/5">
            <h2 className="font-mono text-sm font-bold text-brand-dark mb-4">
              Seleccionar Journey
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-full font-mono text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === t.id 
                    ? "bg-brand-dark text-white shadow-md" 
                    : "bg-[#F2F2F2] text-brand-dark/70 hover:bg-[#E8E8E8]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
              <p className="font-mono text-xs text-brand-dark/60">
                Se generarán eventos sintéticos (HTTP API v2) siguiendo la secuencia real de {tabs.find(t=>t.id===activeTab)?.label}.
                Los eventos incluyen propiedades como `media_source` para simular calidades de tráfico y correlaciones de conversión (ej. usuarios que pasan por Educa convierten 1.5x más).
              </p>
              
              <button 
                onClick={() => generateEvents(activeTab)}
                disabled={isSending || !apiKey}
                className="w-full py-3 bg-[#A4F1FB] hover:bg-[#8CEAF7] text-brand-dark font-mono text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-brand-dark" />
                {isSending ? `Generando... ${progress}%` : `Generar Journey: ${tabs.find(t=>t.id===activeTab)?.label}`}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Console */}
        <div className="bg-[#1C1F24] rounded-[18px] flex flex-col overflow-hidden shadow-xl border border-white/10">
          <div className="bg-black/40 p-3 border-b border-white/10 flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase text-white/50">Consola de Generación</span>
            {isSending && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[500px] font-mono text-[10px] space-y-2 text-emerald-400/90 break-words">
            {logs.length === 0 ? (
              <span className="text-white/30">Esperando ejecución...</span>
            ) : (
              logs.map((l, i) => <div key={i}>{l}</div>)
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
