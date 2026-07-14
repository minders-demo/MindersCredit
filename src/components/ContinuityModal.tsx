import React, { useState, useEffect } from "react";
import { Sparkles, Copy, Check, FileDown, AlertTriangle, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { amplitudeService } from "../services/amplitude.service";
import { getInstallationId } from "../utils/installation";
import { journeyService } from "../services/journey.service";
import { QRCodeSVG } from "qrcode.react";

interface ContinuityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (journey: any) => void;
}

export default function ContinuityModal({ isOpen, onClose, onImportSuccess }: ContinuityModalProps) {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [pastedCode, setPastedCode] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Generar datos serializados en base64 de la simulación activa
  const getHandoffData = () => {
    const activeJourneysRaw = localStorage.getItem("minders_demo_journeys");
    if (!activeJourneysRaw || !user) return null;

    try {
      const journeysMap = JSON.parse(activeJourneysRaw);
      const journey = journeysMap[user.customer_id];
      if (!journey || (journey.status !== "started" && journey.status !== "in_progress")) {
        return null;
      }

      const payload = {
        schema_version: "1.0",
        customer_id: user.customer_id,
        journey_id: journey.journey_id,
        journey_type: journey.journey_type,
        current_step: journey.current_step,
        step_order: journey.step_order,
        form_data: journey.form_data,
        source_platform: amplitudeService.getPlatform(),
        source_installation_id: getInstallationId(),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Expiración +30 minutos
      };

      const jsonStr = JSON.stringify(payload);
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
      
      const fullUrl = `${window.location.origin}${window.location.pathname}#/continue?handoff=${base64}`;

      return {
        code: base64,
        url: fullUrl,
        journey,
      };
    } catch (e) {
      return null;
    }
  };

  const handoffData = getHandoffData();

  const handleCopyLink = () => {
    if (!handoffData) return;
    navigator.clipboard.writeText(handoffData.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);

    amplitudeService.track("journey_handoff_created", {
      handoff_method: "url_hash",
      journey_type: handoffData.journey.journey_type,
      journey_id: handoffData.journey.journey_id,
    });
  };

  const handleCopyCode = () => {
    if (!handoffData) return;
    navigator.clipboard.writeText(handoffData.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);

    amplitudeService.track("journey_handoff_created", {
      handoff_method: "base64_code",
      journey_type: handoffData.journey.journey_type,
      journey_id: handoffData.journey.journey_id,
    });
  };

  const processImportCode = (code: string) => {
    setImportError(null);
    setImportSuccessMsg(null);

    if (!code.trim()) {
      setImportError("Por favor ingresa un código válido.");
      return;
    }

    try {
      amplitudeService.track("journey_handoff_opened");

      const decodedJson = decodeURIComponent(escape(atob(code.trim())));
      const payload = JSON.parse(decodedJson);

      // 1. Validar versión del esquema
      if (payload.schema_version !== "1.0") {
        amplitudeService.track("journey_handoff_rejected", { error: "version_mismatch" });
        setImportError("El formato de este código de continuidad ya no es compatible.");
        return;
      }

      // 2. Validar expiración
      const expirationDate = Date.parse(payload.expires_at);
      if (isNaN(expirationDate) || Date.now() > expirationDate) {
        amplitudeService.track("journey_handoff_expired");
        setImportError("Este código de continuidad ha expirado (límite de 30 minutos).");
        return;
      }

      // 3. Exigir login previo
      if (!user) {
        setImportError("Debes iniciar sesión con tu usuario demo para importar este progreso.");
        return;
      }

      // 4. Validar que pertenezca al mismo usuario demo
      if (payload.customer_id !== user.customer_id) {
        amplitudeService.track("journey_handoff_rejected", { error: "user_mismatch" });
        setImportError(`Este progreso pertenece a otro usuario demo (${payload.customer_id}). Por favor inicia sesión con la cuenta correspondiente.`);
        return;
      }

      // 5. Proceder con el guardado local del progreso importado
      const now = new Date().toISOString();
      const instId = getInstallationId();
      const currentPlatform = amplitudeService.getPlatform();

      const importedJourney = {
        journey_id: payload.journey_id,
        customer_id: payload.customer_id,
        journey_type: payload.journey_type,
        current_step: payload.current_step,
        step_order: payload.step_order,
        status: "in_progress",
        form_data: payload.form_data,
        started_at: payload.created_at,
        updated_at: now,
        source_platform: payload.source_platform,
        last_platform: currentPlatform,
        last_device_key: instId,
        last_activity_at: now,
      };

      // Guardar en el mapa local
      const stored = localStorage.getItem("minders_demo_journeys");
      let map = {};
      if (stored) {
        try {
          map = JSON.parse(stored);
        } catch (e) {
          map = {};
        }
      }
      (map as any)[user.customer_id] = importedJourney;
      localStorage.setItem("minders_demo_journeys", JSON.stringify(map));

      // Tracks de éxito
      amplitudeService.track("journey_handoff_imported", {
        journey_type: payload.journey_type,
        journey_id: payload.journey_id,
      });

      const wasDifferentDevice = payload.source_installation_id !== instId;
      if (wasDifferentDevice) {
        amplitudeService.track("cross_device_journey_resumed", {
          journey_type: payload.journey_type,
          journey_id: payload.journey_id,
          previous_platform: payload.source_platform,
          current_platform: currentPlatform,
          step_name: payload.current_step,
          step_order: payload.step_order,
          days_since_last_activity: 0,
        });
      } else {
        amplitudeService.track("journey_resumed", {
          journey_type: payload.journey_type,
          journey_id: payload.journey_id,
          resume_source: "same_device",
          same_installation: true,
          days_since_last_activity: 0,
          step_name: payload.current_step,
          step_order: payload.step_order,
        });
      }

      setImportSuccessMsg("¡Progreso importado con éxito! Recargando simulación...");
      setPastedCode("");

      if (onImportSuccess) {
        setTimeout(() => {
          onImportSuccess(importedJourney);
        }, 1200);
      }
    } catch (err) {
      amplitudeService.track("journey_handoff_rejected", { error: "invalid_payload" });
      setImportError("Código de continuidad corrupto o inválido.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[24px] border border-brand-dark/10 max-w-lg w-full overflow-hidden shadow-2xl relative animate-scale-up">
        
        {/* Cabecera */}
        <div className="p-6 bg-brand-dark text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#A4F1FB]" />
            <h3 className="font-display text-base font-bold uppercase tracking-tight">
              Continuidad de Solicitud
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          
          {/* SECCIÓN EMISOR: Exportar Progreso */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase font-bold text-brand-dark/50 flex items-center gap-1">
              <span>1. Enviar progreso actual</span>
            </h4>
            
            {user && handoffData ? (
              <div className="bg-slate-50 border border-brand-dark/10 p-4 rounded-xl space-y-4">
                <p className="text-xs text-brand-dark/70 text-center">
                  Transfiere esta simulación activa a tu teléfono u otro navegador de forma instantánea.
                </p>
                
                <div className="flex justify-center mb-2">
                  <QRCodeSVG value={handoffData.url} size={140} level="L" includeMargin={true} />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 bg-brand-dark text-white rounded-lg font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 hover:bg-brand-dark/95 transition-all"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? "¡Copiado!" : "Copiar Enlace"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex-1 py-2 px-3 border border-brand-dark/20 text-brand-dark rounded-lg font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 hover:bg-black/5 transition-all"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileDown className="w-3.5 h-3.5" />}
                    {copiedCode ? "¡Copiado!" : "Copiar Código"}
                  </button>
                </div>
                <span className="text-[9px] text-brand-dark/40 block text-center">
                  * El código expira automáticamente en 30 minutos por seguridad.
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  No hay ninguna simulación activa con datos guardados. Completa el primer paso de tu simulación e inicia sesión para habilitar la transferencia.
                </span>
              </div>
            )}
          </div>

          <hr className="border-brand-dark/10" />

          {/* SECCIÓN RECEPTOR: Pegar / Importar Progreso */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase font-bold text-brand-dark/50">
              <span>2. Recibir progreso en este dispositivo</span>
            </h4>
            
            <p className="text-xs text-brand-dark/70">
              Pega el código de continuidad copiado para reanudar el borrador correspondiente de manera inmediata.
            </p>

            <div className="space-y-2">
              <textarea
                value={pastedCode}
                onChange={(e) => setPastedCode(e.target.value)}
                placeholder="Pega el código base64 de continuidad aquí..."
                className="w-full h-20 bg-slate-50 border border-brand-dark/10 rounded-xl p-3 text-[10px] font-mono focus:outline-none focus:border-brand-dark"
              />

              <button
                type="button"
                onClick={() => processImportCode(pastedCode)}
                className="w-full py-2.5 bg-accent-lavender hover:bg-accent-lavender/90 text-brand-dark font-mono text-xs uppercase font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Importar Progreso de Solicitud</span>
              </button>
            </div>

            {/* Alertas de Importación */}
            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800 font-sans">
                {importError}
              </div>
            )}

            {importSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-mono flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{importSuccessMsg}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
