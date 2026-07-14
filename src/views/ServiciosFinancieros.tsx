import { amplitudeService } from "../services/amplitude.service";
import React, { useState, useEffect } from "react";
import { trackEvent } from "../analytics";
import { useRouter } from "../RouterContext";
import { SUCURSALES } from "../data";
import { Landmark, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Calendar, Clock, DollarSign, CreditCard, ShieldCheck } from "lucide-react";
import { generateFakeData } from "../utils/demoHelper";

export default function ServiciosFinancieros() {
  const { navigate } = useRouter();

  // Tab routing: "pago_online" | "agenda_hora" | "regulariza" | "acreencias"
  const [tab, setTab] = useState<"pago_online" | "agenda_hora" | "regulariza" | "acreencias">("pago_online");

  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const motivo = params.get("motivo");
    const branchName = params.get("sucursal");

    if (path.includes("pago-online") || hash.includes("pago-online")) {
      setTab("pago_online");
      trackEvent("pago_online_vista");
    } else if (path.includes("agenda-tu-hora") || hash.includes("agenda-tu-hora")) {
      setTab("agenda_hora");
      if (motivo) setAgendaMotivo(motivo);
      if (branchName) setAgendaBranch(decodeURIComponent(branchName));
      trackEvent("agenda_hora_vista");
    } else if (path.includes("regulariza") || hash.includes("regulariza")) {
      setTab("regulariza");
      trackEvent("regulariza_deuda_vista");
    } else if (path.includes("acreencias") || hash.includes("acreencias")) {
      setTab("acreencias");
      trackEvent("acreencias_vista");
    }
  }, [window.location.pathname, window.location.hash, window.location.search]);

  // --- J13: PAGO ONLINE STATES ---
  const [pagoRut, setPagoRut] = useState("");
  const [pagoStep, setPagoStep] = useState<"rut" | "checkout" | "webpay" | "receipt">("rut");
  const [duesToPay, setDuesToPay] = useState([
    { id: 1, name: "Cuota Social Cooperativa - Julio 2026", amount: 1000, checked: true },
    { id: 2, name: "Crédito de Consumo - Cuota N° 04/24", amount: 125400, checked: true },
    { id: 3, name: "Seguro de Auto Full - Mensualidad", amount: 28900, checked: false },
  ]);
  const [totalPago, setTotalPago] = useState(126400);

  useEffect(() => {
    const tot = duesToPay.filter(d => d.checked).reduce((acc, curr) => acc + curr.amount, 0);
    setTotalPago(tot);
  }, [duesToPay]);

  const handlePagoSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagoRut || pagoRut.length < 8) {
      alert("Ingresa un RUT válido.");
      return;
    }
    trackEvent("pago_online_consultado", { rut: pagoRut });
    setPagoStep("checkout");
  };

  const handleToggleDue = (id: number) => {
    setDuesToPay(prev => prev.map(d => d.id === id ? { ...d, checked: !d.checked } : d));
  };

  const handleLaunchWebpay = () => {
    setPagoStep("webpay");
    trackEvent("pago_online_webpay_redireccion");
    setTimeout(() => {
      setPagoStep("receipt");
      amplitudeService.trackRevenue("pago_online_completado", { monto_total: totalPago }, "pago_cuota", totalPago, 1);
      amplitudeService.incrementJourneysCompleted();
    }, 2500); // 2.5s simulated loading Webpay
  };

  // --- J10: AGENDA TU HORA STATES ---
  const [agendaMotivo, setAgendaMotivo] = useState("general");
  const [agendaBranch, setAgendaBranch] = useState(SUCURSALES[0].name);
  const [agendaDay, setAgendaDay] = useState("");
  const [agendaTime, setAgendaTime] = useState("");
  const [agendaCode, setAgendaCode] = useState("");
  const [agendaSuccess, setAgendaSuccess] = useState(false);

  // Generate 2 weeks of days starting tomorrow
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  useEffect(() => {
    const days: string[] = [];
    const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      // Skip Sundays
      if (d.getDay() !== 0) {
        const dateStr = `${weekdays[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
        days.push(dateStr);
      }
    }
    setAvailableDays(days);
    setAgendaDay(days[0]);
  }, []);

  const handleAgendaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaTime) {
      alert("Por favor selecciona un horario de atención.");
      return;
    }

    const resCode = `HRS-${Math.floor(1000 + Math.random() * 9000)}`;
    setAgendaCode(resCode);
    setAgendaSuccess(true);
    trackEvent("agenda_hora_agendada", {
      motivo: agendaMotivo,
      sucursal: agendaBranch,
      fecha: agendaDay,
      hora: agendaTime,
      codigo: resCode,
    });
  };

  // --- J8: REGULARIZA TU DEUDA STATES ---
  const [regRut, setRegRut] = useState("");
  const [regStep, setRegStep] = useState<"rut" | "options" | "success">("rut");
  const [debtAmount, setDebtAmount] = useState(840000); // Fictional overdue balance
  const [selectedRegOption, setSelectedRegOption] = useState("");

  const handleRegSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regRut || regRut.length < 8) {
      alert("Por favor ingresa un RUT válido.");
      return;
    }
    trackEvent("regularizacion_consultada", { rut: regRut });
    setRegStep("options");
  };

  const handleRegConfirm = (optionName: string, desc: string) => {
    setSelectedRegOption(optionName);
    trackEvent("regularizacion_confirmada", { metodo: optionName, rut: regRut });
    setRegStep("success");
  };

  // --- J17: BUSCADOR DE ACREENCIAS STATES ---
  const [acreenciaRut, setAcreenciaRut] = useState("");
  const [acreenciaStep, setAcreenciaStep] = useState<"rut" | "result">("rut");
  const [hasAcreencias, setHasAcreencias] = useState(false);
  const [acreenciaMonto, setAcreenciaMonto] = useState(0);

  const formatRut = (value: string) => {
    let raw = value.replace(/[^0-9kK]/g, "");
    if (raw.length === 0) return "";
    if (raw.length > 9) raw = raw.slice(0, 9);
    if (raw.length === 1) return raw;
    const dv = raw.slice(-1);
    const body = raw.slice(0, -1);
    let formatted = "";
    let count = 0;
    for (let i = body.length - 1; i >= 0; i--) {
      formatted = body.charAt(i) + formatted;
      count++;
      if (count === 3 && i > 0) {
        formatted = "." + formatted;
        count = 0;
      }
    }
    return `${formatted}-${dv}`;
  };

  const handleAcreenciasAutofill = () => {
    const data = generateFakeData();
    setAcreenciaRut(formatRut(data.rut));
    trackEvent("autofill_demo_clicked", { form: "acreencias_buscador" });
  };

  const handleAcreenciasSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acreenciaRut || acreenciaRut.length < 5) {
      alert("Por favor ingresa un RUT válido.");
      return;
    }

    // Determine deterministic has acreencias (par has, impar does not, except personas)
    let match = false;
    const cleanRut = acreenciaRut.replace(/\./g, "").trim();
    if (cleanRut.startsWith("12345678")) {
      match = true; // Camila Rojas
    } else if (cleanRut.startsWith("15654321")) {
      match = false; // Jorge Fuentes
    } else if (cleanRut.startsWith("11222334")) {
      match = true; // Rosa Sepúlveda
    } else {
      const parts = cleanRut.split("-");
      const body = parts[0];
      if (body.length > 0) {
        const lastDigitChar = body.charAt(body.length - 1);
        const lastDigit = parseInt(lastDigitChar, 10);
        if (!isNaN(lastDigit)) {
          match = (lastDigit % 2 === 0);
        }
      }
    }

    setHasAcreencias(match);
    setAcreenciaMonto(match ? 140500 : 0);
    setAcreenciaStep("result");
    trackEvent("acreencias_consultadas", { rut: acreenciaRut, posee_acreencia: match });
  };

  const clpFormat = (num: number) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 animate-fade-in">
      
      {/* HEADER SECTION TABS */}
      <div className="flex justify-center mb-8 border-b border-brand-dark/10 font-mono text-xs uppercase tracking-wider">
        <button
          onClick={() => {
            setTab("pago_online");
            navigate("/pago-online");
          }}
          className={`py-3 px-4 border-b-2 transition-all ${tab === "pago_online" ? "border-brand-dark text-brand-dark font-bold" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Pago de Cuotas Online
        </button>
        <button
          onClick={() => {
            setTab("agenda_hora");
            navigate("/agenda-tu-hora");
          }}
          className={`py-3 px-4 border-b-2 transition-all ${tab === "agenda_hora" ? "border-brand-dark text-brand-dark font-bold" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Agenda tu Hora 🗓
        </button>
        <button
          onClick={() => {
            setTab("regulariza");
            navigate("/regulariza-deuda");
          }}
          className={`py-3 px-4 border-b-2 transition-all ${tab === "regulariza" ? "border-brand-dark text-brand-dark font-bold" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Regulariza tu Deuda
        </button>
        <button
          onClick={() => {
            setTab("acreencias");
            navigate("/acreencias");
          }}
          className={`py-3 px-4 border-b-2 transition-all ${tab === "acreencias" ? "border-brand-dark text-brand-dark font-bold" : "border-transparent text-brand-dark/50 hover:text-brand-dark"}`}
        >
          Acreencias
        </button>
      </div>

      {/* J13: PAGO DE CUOTAS ONLINE */}
      {tab === "pago_online" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl">
          {pagoStep === "rut" && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#0F766E] font-bold block mb-1">
                  SERVICIOS EXPRESS
                </span>
                <h3 className="font-display text-lg tracking-tight">Pago en Línea MindersCredit</h3>
                <p className="text-xs text-brand-dark/70">Paga tus cuotas de crédito, cuota social o seguros vigentes con tu RUT.</p>
              </div>
              <form onSubmit={handlePagoSearch} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">RUT del Socio</label>
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={pagoRut}
                    onChange={(e) => setPagoRut(e.target.value)}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/95 transition-all font-bold"
                >
                  Consultar Deudas Vigentes →
                </button>
              </form>
            </div>
          )}

          {pagoStep === "checkout" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-brand-dark/5 pb-2">
                <h4 className="font-display text-base text-brand-dark">Detalle de Compromisos</h4>
                <button onClick={() => setPagoStep("rut")} className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark">← Volver</button>
              </div>
              
              <div className="space-y-2">
                {duesToPay.map(due => (
                  <label
                    key={due.id}
                    className="flex justify-between items-center p-3 border border-brand-dark/5 bg-brand-bg/40 rounded-xl cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={due.checked}
                        onChange={() => handleToggleDue(due.id)}
                        className="w-4 h-4 accent-brand-dark rounded shrink-0"
                      />
                      <span>{due.name}</span>
                    </div>
                    <span className="font-mono font-bold text-brand-dark">{clpFormat(due.amount)}</span>
                  </label>
                ))}
              </div>

              <div className="p-4 bg-brand-dark/5 rounded-xl border border-brand-dark/5 flex justify-between font-mono text-xs text-brand-dark">
                <span>TOTAL A PAGAR:</span>
                <strong className="text-sm text-[#0F766E]">{clpFormat(totalPago)}</strong>
              </div>

              <button
                onClick={handleLaunchWebpay}
                disabled={totalPago <= 0}
                className="w-full py-3 bg-[#0F766E] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-opacity-95 transition-all disabled:opacity-50 font-bold flex items-center justify-center gap-1.5"
              >
                Pagar con Webpay 💳
              </button>
            </div>
          )}

          {pagoStep === "webpay" && (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 border-4 border-accent-cyan border-t-brand-dark rounded-full animate-spin mx-auto" />
              <p className="font-display text-sm tracking-tight text-brand-dark">Conectando con Transbank Webpay Plus...</p>
              <p className="text-xs text-brand-dark/60">No cierres esta ventana ni recargues la página.</p>
            </div>
          )}

          {pagoStep === "receipt" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <span className="font-mono text-xs text-[#0F766E] font-bold">PAGO PROCESADO EXITOSAMENTE</span>
                <h3 className="font-display text-2xl tracking-tight text-brand-dark">¡Comprobante de Pago Electrónico!</h3>
                <p className="text-xs text-brand-dark/70 mt-1">Tu pago ha sido abonado correctamente a tus cuentas.</p>
              </div>

              <div className="p-4 bg-brand-bg rounded-xl font-mono text-xs text-left space-y-2 border border-brand-dark/5">
                <div className="flex justify-between">
                  <span>TRANSACCIÓN NÚMERO:</span>
                  <span className="font-bold">TX-{Math.floor(100000 + Math.random()*900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>RUT SOCIO:</span>
                  <span className="font-bold">{pagoRut}</span>
                </div>
                <div className="flex justify-between font-bold text-[#0F766E]">
                  <span>MONTO TOTAL PAGADO:</span>
                  <span>{clpFormat(totalPago)}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setPagoStep("rut");
                    setPagoRut("");
                  }}
                  className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase font-bold"
                >
                  Realizar otro Pago
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* J10: AGENDA TU HORA APPOINTMENT CALENDAR */}
      {tab === "agenda_hora" && (
        <div className="max-w-2xl mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-3xl">
          <div className="text-center mb-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#0F766E] font-bold">RESERVA TU TURNO</span>
            <h2 className="font-display text-2xl tracking-tight text-brand-dark mt-1">Agenda tu Atención Presencial</h2>
            <p className="text-xs text-brand-dark/70 mt-1">Evita esperas reservando tu cita de atención preferencial en cualquiera de nuestras sucursales.</p>
          </div>

          {!agendaSuccess ? (
            <form onSubmit={handleAgendaSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">Motivo de Atención</label>
                  <select
                    value={agendaMotivo}
                    onChange={(e) => setAgendaMotivo(e.target.value)}
                    className="w-full p-2.5 border border-brand-dark/20 rounded-xl text-xs bg-white text-brand-dark focus:outline-none"
                  >
                    <option value="general">Atención General Ejecutiva / Caja</option>
                    <option value="hipotecario">Asesoría Crédito Hipotecario 🏠</option>
                    <option value="consumo">Asesoría Crédito Consumo / Comercial</option>
                    <option value="socio">Incorporación de Socio Digital</option>
                    <option value="empresas">Asesoría MYPE / PYME</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">Sucursal de Atención</label>
                  <select
                    value={agendaBranch}
                    onChange={(e) => setAgendaBranch(e.target.value)}
                    className="w-full p-2.5 border border-brand-dark/20 rounded-xl text-xs bg-white text-brand-dark focus:outline-none"
                  >
                    {SUCURSALES.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[#0F766E]" /> Selecciona un Día
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {availableDays.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setAgendaDay(day)}
                      className={`py-2 px-3 border text-center font-mono text-[11px] rounded-lg shrink-0 transition-all ${agendaDay === day ? "bg-brand-dark text-white border-brand-dark" : "border-brand-dark/10 hover:border-brand-dark/20 text-brand-dark/70 bg-[#FDFDFD]"}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1.5 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#0F766E]" /> Selecciona un Bloque Horario
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["09:00", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15", "15:00", "15:45", "16:30"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAgendaTime(t)}
                      className={`py-2 border font-mono text-xs rounded-xl transition-all ${agendaTime === t ? "bg-[#0F766E] text-white border-[#0F766E]" : "border-brand-dark/10 hover:border-brand-dark/20 bg-white"}`}
                    >
                      {t} hrs
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/90 transition-all font-bold"
              >
                Agendar Mi Cita 📅
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-display text-2xl tracking-tight text-[#0F766E]">
                ¡Cita Agendada Exitosamente!
              </h3>
              <p className="text-xs text-brand-dark/80 leading-relaxed max-w-sm mx-auto">
                Tu hora de atención prioritaria ha quedado agendada en <strong>{agendaBranch}</strong> para el día <strong>{agendaDay}</strong> a las <strong>{agendaTime} hrs</strong>.
              </p>
              
              <div className="p-4 bg-brand-dark/5 rounded-xl font-mono text-xs text-left max-w-xs mx-auto space-y-2">
                <div className="flex justify-between">
                  <span>CÓDIGO RESERVA:</span>
                  <span className="font-bold text-brand-dark">{agendaCode}</span>
                </div>
                <div className="flex justify-between border-t border-brand-dark/5 pt-1.5 mt-1.5">
                  <span>MOTIVO DE CITA:</span>
                  <span className="font-bold uppercase text-brand-dark">{agendaMotivo}</span>
                </div>
              </div>

              <p className="text-[10px] text-brand-dark/50 max-w-sm mx-auto">
                Te hemos enviado un recordatorio por WhatsApp y SMS. Al llegar a la oficina, ingresa tu RUT o código de reserva en el tótem de atención al cliente.
              </p>

              <button
                onClick={() => setAgendaSuccess(false)}
                className="px-6 py-2.5 border border-brand-dark/20 rounded-full font-mono text-xs"
              >
                Agendar Nueva Hora
              </button>
            </div>
          )}
        </div>
      )}

      {/* J8: REGULARIZA TU DEUDA DEBT RENEGOTIATION */}
      {tab === "regulariza" && (
        <div className="max-w-xl mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-3xl">
          {regStep === "rut" && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="font-mono text-xs uppercase tracking-widest text-accent-coral font-bold block mb-1">
                  CANAL EMPÁTICO COOPERATIVO
                </span>
                <h3 className="font-display text-xl tracking-tight">Regulariza tu Situación con MindersCredit</h3>
                <p className="text-xs text-brand-dark/70 max-w-sm mx-auto mt-1">Queremos ayudarte a reordenar tu presupuesto. Consulta tus saldos vencidos de forma confidencial.</p>
              </div>
              <form onSubmit={handleRegSearch} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">RUT del Deudor</label>
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={regRut}
                    onChange={(e) => setRegRut(e.target.value)}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/95 transition-all font-bold"
                >
                  Buscar Ofertas de Regularización →
                </button>
              </form>
            </div>
          )}

          {regStep === "options" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-brand-dark/5 pb-2">
                <h4 className="font-display text-base text-brand-dark">Ofertas de Renegociación Especial</h4>
                <button onClick={() => setRegStep("rut")} className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark">← Volver</button>
              </div>

              <p className="text-xs text-brand-dark/80">
                Detectamos un saldo consolidado vencido de <strong className="font-mono font-bold text-accent-coral">{clpFormat(debtAmount)}</strong>. Ofrecemos las siguientes alternativas empáticas:
              </p>

              <div className="space-y-3">
                {/* Option 1: Cash 30% discount */}
                <div className="p-4 border border-brand-dark/10 hover:border-brand-dark rounded-xl flex justify-between items-center transition-all bg-[#FDFDFD]">
                  <div>
                    <h5 className="font-display text-xs text-brand-dark">Opción 1: Liquidación Pago Único (-30%)</h5>
                    <p className="text-[10px] text-brand-dark/60 mt-1">Saldar el total de la deuda al contado aplicando un 30% de descuento inmediato.</p>
                  </div>
                  <button
                    onClick={() => handleRegConfirm("pago_unico", "Descuento 30%")}
                    className="py-1.5 px-3 bg-brand-dark text-white font-mono text-[9px] uppercase tracking-wider rounded"
                  >
                    Pagar {clpFormat(debtAmount * 0.7)}
                  </button>
                </div>

                {/* Option 2: 12 installments */}
                <div className="p-4 border border-brand-dark/10 hover:border-brand-dark rounded-xl flex justify-between items-center transition-all bg-[#FDFDFD]">
                  <div>
                    <h5 className="font-display text-xs text-brand-dark">Opción 2: Repactación en 12 Cuotas s/Interés</h5>
                    <p className="text-[10px] text-brand-dark/60 mt-1">Reestructurar el saldo total en 12 cuotas fijas mensuales sin cobro de recargos.</p>
                  </div>
                  <button
                    onClick={() => handleRegConfirm("repactacion", "12 Cuotas s/interés")}
                    className="py-1.5 px-3 bg-[#0F766E] text-white font-mono text-[9px] uppercase tracking-wider rounded"
                  >
                    Pagar {clpFormat(debtAmount / 12)}/mes
                  </button>
                </div>

                {/* Option 3: Extends 30 days */}
                <div className="p-4 border border-brand-dark/10 hover:border-brand-dark rounded-xl flex justify-between items-center transition-all bg-[#FDFDFD]">
                  <div>
                    <h5 className="font-display text-xs text-brand-dark">Opción 3: Prórroga de Cuota (30 días)</h5>
                    <p className="text-[10px] text-brand-dark/60 mt-1">Posterga el cobro de tu saldo vencido por 30 días para reorganizar tu caja.</p>
                  </div>
                  <button
                    onClick={() => handleRegConfirm("prorroga", "Prórroga 30 días")}
                    className="py-1.5 px-3 border border-brand-dark/20 text-brand-dark font-mono text-[9px] uppercase tracking-wider rounded"
                  >
                    Postergar
                  </button>
                </div>
              </div>
            </div>
          )}

          {regStep === "success" && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-display text-xl tracking-tight text-[#0F766E]">
                ¡Convenio Firmado Exitosamente!
              </h3>
              <p className="text-xs text-brand-dark/80 leading-relaxed">
                Hemos suscrito tu convenio bajo la opción de <strong>{selectedRegOption === "pago_unico" ? "Pago Único con Descuento 30%" : selectedRegOption === "repactacion" ? "Repactación en 12 Cuotas" : "Prórroga de Cuota"}</strong>.
              </p>
              
              <div className="p-4 bg-brand-dark/5 rounded-xl font-mono text-xs text-left max-w-xs mx-auto">
                Código de Convenio: CONV-{Math.floor(1000 + Math.random()*9000)}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setRegStep("rut")}
                  className="px-6 py-2 bg-brand-dark text-white rounded-full font-mono text-xs uppercase"
                >
                  Volver al inicio de Regularización
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* J17: BUSCADOR DE ACREENCIAS UNCLAIMED FUNDS */}
      {tab === "acreencias" && (
        <div className="max-w-xl mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-3xl">
          {acreenciaStep === "rut" && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="font-mono text-xs uppercase tracking-widest text-[#0F766E] font-bold block mb-1">
                  LEY N° 19.628 / ACREENCIAS CHILE
                </span>
                <h3 className="font-display text-xl tracking-tight">Buscador de Acreencias Bancarias</h3>
                <p className="text-xs text-brand-dark/70 mt-1 max-w-sm mx-auto">Comprueba de forma instantánea si posees dineros pendientes de retiro u olvidados en cooperativas financieras chilenas.</p>
              </div>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleAcreenciasAutofill}
                  className="w-full py-2 bg-accent-lavender/10 hover:bg-accent-lavender/20 border border-accent-lavender/30 text-brand-dark font-mono text-[11px] uppercase tracking-wider rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  ⚡ Rellenar RUT de prueba
                </button>
              </div>

              <form onSubmit={handleAcreenciasSearch} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">RUT del Beneficiario</label>
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={acreenciaRut}
                    onChange={(e) => setAcreenciaRut(formatRut(e.target.value))}
                    className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none focus:border-brand-dark font-mono bg-[#FDFDFD]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-brand-dark/95 transition-all font-bold"
                >
                  Buscar Acreencias Pendientes →
                </button>
              </form>
            </div>
          )}

          {acreenciaStep === "result" && (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              {hasAcreencias ? (
                <>
                  <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto border border-amber-300">
                    <DollarSign className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="font-display text-xl tracking-tight text-brand-dark">
                    ¡Dineros Encontrados para tu RUT!
                  </h3>
                  <p className="text-xs text-brand-dark/80 leading-relaxed max-w-sm mx-auto">
                    El sistema detectó acreencias inactivas correspondientes a cuotas sociales de cooperativas absorbidas a tu favor por:
                  </p>
                  
                  <div className="p-4 bg-amber-50 rounded-xl font-mono text-lg font-bold text-amber-700 inline-block">
                    {clpFormat(acreenciaMonto)} CLP
                  </div>

                  {/* Claim Form */}
                  <div className="p-5 border border-brand-dark/10 rounded-2xl text-left bg-brand-bg/50 space-y-3">
                    <h5 className="font-display text-xs text-brand-dark flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-[#0F766E]" /> Formulario de Reclamación de Acreencia
                    </h5>
                    <p className="text-[11px] text-brand-dark/70 leading-normal">
                      Para transferir de forma directa estos fondos a tu Cuenta Vista MindersCredit, por favor confirma tu reclamación firmando a continuación.
                    </p>
                    <button
                      onClick={() => {
                        alert("¡Solicitud de reembolso ingresada! Los fondos se depositarán en un plazo máximo de 3 días hábiles.");
                        setAcreenciaStep("rut");
                        setAcreenciaRut("");
                      }}
                      className="w-full py-2 bg-brand-dark text-white font-mono text-[10px] uppercase tracking-wider rounded hover:bg-brand-dark/90 transition-all font-bold"
                    >
                      Reclamar y Transferir a mi Cuenta Vista ⚡
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-brand-dark/5 text-brand-dark/40 rounded-full flex items-center justify-center mx-auto border border-brand-dark/10">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-xl tracking-tight text-brand-dark">
                    Sin Acreencias Pendientes
                  </h3>
                  <p className="text-xs text-brand-dark/70 leading-normal max-w-sm mx-auto">
                    No detectamos saldos inactivos o acreencias a favor del RUT <strong className="font-mono">{acreenciaRut}</strong> en los registros cooperativos nacionales del año vigente.
                  </p>
                  <button
                    onClick={() => {
                      setAcreenciaStep("rut");
                      setAcreenciaRut("");
                    }}
                    className="mt-4 px-6 py-2 border border-brand-dark/20 text-brand-dark rounded-full font-mono text-xs"
                  >
                    Probar con otro RUT
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
