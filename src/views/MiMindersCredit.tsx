import React, { useState, useEffect } from "react";
import { trackEvent, getStoredTransactions, saveSimulatedTransaction } from "../analytics";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "../RouterContext";
import { BANK_LIST } from "../data";
import { Landmark, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Send, ShieldAlert, CreditCard, Wallet, UserCheck } from "lucide-react";

interface MiMindersCreditProps {
  onOpenLogin: () => void;
}

export default function MiMindersCredit({ onOpenLogin }: MiMindersCreditProps) {
  const { navigate } = useRouter();
  const { user } = useAuth();

  // If not logged in, display locked state
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-brand-dark/10 p-8 rounded-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-brand-dark/5 rounded-full flex items-center justify-center mx-auto border border-brand-dark/10 text-brand-dark/70">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <span className="font-mono text-xs text-accent-lavender font-bold">ACCESO RESTRINGIDO</span>
          <h2 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
            "MindersCredit en Línea"
          </h2>
          <p className="text-xs text-brand-dark/70 mt-1 leading-relaxed">
            Para ver tus cuentas, saldos, realizar transferencias electrónicas y canjear puntos debes iniciar sesión con tu RUT socio.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={onOpenLogin}
            className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase hover:bg-brand-dark/95 transition-all font-bold"
          >
            Iniciar Sesión con mi RUT 🔐
          </button>
          <button
            onClick={() => navigate("/hazte-socio")}
            className="w-full py-3 border border-brand-dark/25 hover:bg-brand-dark/5 text-brand-dark rounded-full font-mono text-xs uppercase transition-all font-bold"
          >
            Hacerme Socio Cooperativo ✨
          </button>
        </div>
      </div>
    );
  }

  const userNombre = `${user.first_name} ${user.last_name}`;

  // --- PRIVATE DASHBOARD ACTIVE ---
  const [balanceVista, setBalanceVista] = useState<number>(124500);
  const [balanceAhorro, setBalanceAhorro] = useState<number>(45000);
  
  // Transactions list
  const [transactions, setTransactions] = useState<any[]>([]);

  // Transfer Wizard State: "dashboard" | "tx_recipient" | "tx_amount" | "tx_pass" | "tx_success"
  const [txStep, setTxStep] = useState<"dashboard" | "tx_recipient" | "tx_amount" | "tx_pass" | "tx_success">("dashboard");

  // Transfer inputs
  const [txRut, setTxRut] = useState("");
  const [txNombre, setTxNombre] = useState("");
  const [txBanco, setTxBanco] = useState("");
  const [txCuenta, setTxCuenta] = useState("");
  const [txEmail, setTxEmail] = useState("");
  const [txMonto, setTxMonto] = useState<number>(0);
  const [txError, setTxError] = useState("");

  useEffect(() => {
    trackEvent("sitio_privado_dashboard_vista", { usuario_rut: user.rut });
    
    // Load local storage transactions or load defaults
    const stored = getStoredTransactions();
    if (stored && stored.length > 0) {
      setTransactions(stored);
    } else {
      const defaults = [
        { date: "10/07/2026", desc: "Abono Liquidación Sueldos IPS", amount: 720000, type: "abono" },
        { date: "08/07/2026", desc: "Transferencia Recibida - Pedro G.", amount: 25000, type: "abono" },
        { date: "05/07/2026", desc: "Supermercados Líder Chile", amount: -42500, type: "cargo" },
        { date: "03/07/2026", desc: "Suscripción Netflix Familiar", amount: -10900, type: "cargo" },
        { date: "01/07/2026", desc: "Cuota Social MindersCredit", amount: -1000, type: "cargo" },
      ];
      setTransactions(defaults);
    }
  }, [user.rut]);

  const handleStartTransfer = () => {
    setTxStep("tx_recipient");
    setTxRut("");
    setTxNombre("");
    setTxBanco(BANK_LIST[0]);
    setTxCuenta("");
    setTxEmail("");
    setTxMonto(0);
    setTxError("");
    trackEvent("transferencia_iniciada");
  };

  const handleRecipientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTxError("");

    if (!txRut || !txNombre || !txCuenta) {
      setTxError("Todos los campos obligatorios deben ser completados.");
      return;
    }

    setTxStep("tx_amount");
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTxError("");

    if (txMonto <= 0) {
      setTxError("El monto a transferir debe ser mayor a $0 CLP.");
      return;
    }

    if (txMonto > balanceVista) {
      setTxError(`Saldo insuficiente en tu Cuenta Vista. Saldo disponible: $${balanceVista.toLocaleString("es-CL")}`);
      return;
    }

    setTxStep("tx_pass");
  };

  const handleConfirmTransfer = () => {
    // Process debit from Vista balance
    const newBal = balanceVista - txMonto;
    setBalanceVista(newBal);

    // Save transaction
    const newTx = {
      date: new Date().toLocaleDateString("es-CL"),
      desc: `Transferencia a ${txNombre} (${txBanco})`,
      amount: -txMonto,
      type: "cargo"
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveSimulatedTransaction(newTx);

    trackEvent("transferencia_completada", {
      monto: txMonto,
      banco_destino: txBanco,
      destinatario_rut: txRut,
    });
    setTxStep("tx_success");
  };

  const clpFormat = (num: number) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 animate-fade-in">
      
      {/* DASHBOARD VIEW */}
      {txStep === "dashboard" && (
        <div className="space-y-8">
          
          {/* Welcome client-header banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-brand-dark text-white rounded-3xl border border-white/10 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-lavender text-brand-dark rounded-full flex items-center justify-center font-display text-lg font-bold">
                {user.first_name.charAt(0)}
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-lavender font-bold">CUENTA COOPERATIVA ACTIVA</span>
                <h2 className="font-display text-xl sm:text-2xl tracking-tight text-white leading-tight mt-0.5">
                  Hola, {userNombre}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 font-mono text-[10px] text-white/80">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">RUT: {user.rut}</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 text-accent-cyan font-bold">Socio N° {user.rut.split("-")[0].slice(-5)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left bento column (balances & transactions) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Balances widgets row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Cuenta Vista Card */}
                <div className="bg-white border border-brand-dark/10 p-5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cyan/5 rounded-full blur-2xl" />
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-brand-dark/60 font-bold">Cuenta Vista Socio</span>
                    <Wallet className="w-4 h-4 text-[#0F766E]" />
                  </div>
                  <span className="font-display text-2xl text-brand-dark block font-bold">
                    {clpFormat(balanceVista)}
                  </span>
                  <span className="font-mono text-[10px] text-brand-dark/50 block mt-1">
                    Disponible para compras y giros
                  </span>

                  <div className="mt-4 pt-3 border-t border-brand-dark/5 flex gap-2">
                    <button
                      onClick={handleStartTransfer}
                      className="flex-1 py-2 bg-[#0F766E] hover:bg-opacity-95 text-white font-mono text-[9px] uppercase tracking-wider rounded-lg text-center font-bold"
                    >
                      Transferir Fondos ⚡
                    </button>
                    <button
                      onClick={() => navigate("/pago-online")}
                      className="flex-1 py-2 bg-brand-dark hover:bg-opacity-95 text-white font-mono text-[9px] uppercase tracking-wider rounded-lg text-center font-bold"
                    >
                      Pagar Cuotas
                    </button>
                  </div>
                </div>

                {/* 2. Cuenta de Ahorro Card */}
                <div className="bg-white border border-brand-dark/10 p-5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent-lavender/5 rounded-full blur-2xl" />
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-brand-dark/60 font-bold">Cuentas de Ahorro</span>
                    <Landmark className="w-4 h-4 text-accent-lavender" />
                  </div>
                  <span className="font-display text-2xl text-brand-dark block font-bold">
                    {clpFormat(balanceAhorro)}
                  </span>
                  <span className="font-mono text-[10px] text-brand-dark/50 block mt-1">
                    Reajustable en UF garantizado
                  </span>

                  <div className="mt-4 pt-3 border-t border-brand-dark/5 flex gap-2">
                    <button
                      onClick={() => navigate("/cuentas-ahorro")}
                      className="w-full py-2 border border-brand-dark/25 hover:bg-brand-dark/5 text-brand-dark font-mono text-[9px] uppercase tracking-wider rounded-lg text-center font-bold"
                    >
                      Depositar Ahorros
                    </button>
                  </div>
                </div>

              </div>

              {/* Transactions Ledger Ledger */}
              <div className="bg-white border border-brand-dark/10 p-5 rounded-2xl">
                <div className="flex justify-between items-center border-b border-brand-dark/5 pb-3 mb-4">
                  <h4 className="font-display text-sm text-brand-dark">Cartola de Últimos Movimientos</h4>
                  <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-brand-dark/5 rounded text-brand-dark/60">Actualizado recién</span>
                </div>

                <div className="space-y-2 divide-y divide-brand-dark/5 font-mono text-xs">
                  {transactions.map((tx, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5 last:pb-0 first:pt-0">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-brand-dark/50 block">{tx.date}</span>
                        <span className="font-sans text-xs font-bold text-brand-dark block">{tx.desc}</span>
                      </div>
                      <span className={`font-bold ${tx.amount > 0 ? "text-[#0F766E]" : "text-[#C2410C]"}`}>
                        {tx.amount > 0 ? "+" : ""}{clpFormat(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right bento sidebar (services, blocks, actions) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Puntos / Recompensas Widget */}
              <div className="p-5 border border-[#0F766E]/20 bg-emerald-50 rounded-2xl">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#0F766E] font-bold block mb-1">
                  PUNTOS MINDERSCREDIT
                </span>
                <div className="flex justify-between items-center">
                  <span className="font-display text-xl text-[#0F766E] font-bold">4.250 Pts.</span>
                  <button
                    onClick={() => {
                      alert("¡Puntos canjeados! Se han abonado $4.250 CLP a tu Cuenta Vista.");
                      setBalanceVista(prev => prev + 4250);
                      trackEvent("puntos_canjeados", { puntos_canjeados: 4250 });
                    }}
                    className="py-1 px-2.5 bg-brand-dark text-white font-mono text-[8px] uppercase tracking-wider rounded"
                  >
                    Canjear por dinero 💰
                  </button>
                </div>
                <p className="text-[10px] text-brand-dark/70 mt-2 font-sans">
                  Acumula puntos por tus consumos con tus tarjetas de débito/crédito y canjéalos de forma inmediata por abonos directos.
                </p>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="p-5 border border-brand-dark/10 bg-white rounded-2xl space-y-3">
                <h4 className="font-display text-xs text-brand-dark uppercase tracking-wider border-b border-brand-dark/5 pb-2">Acceso Preferencial</h4>
                
                <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                  <button onClick={() => navigate("/deposito-a-plazo")} className="flex justify-between items-center p-2.5 border border-brand-dark/5 hover:bg-brand-dark/5 rounded-xl">
                    <span>Constituir Depósito DAP</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-dark/60" />
                  </button>
                  <button onClick={() => navigate("/simulador/consumo")} className="flex justify-between items-center p-2.5 border border-brand-dark/5 hover:bg-brand-dark/5 rounded-xl">
                    <span>Simular Crédito Consumo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-dark/60" />
                  </button>
                  <button onClick={() => navigate("/emergencias")} className="flex justify-between items-center p-2.5 border border-brand-dark/5 hover:bg-accent-coral/10 hover:border-accent-coral/20 rounded-xl text-accent-coral">
                    <span>Bloqueo Preventivo Tarjeta</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TRANSFER STEP 1: RECIPIENT */}
      {txStep === "tx_recipient" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl">
          <div className="mb-6">
            <button onClick={() => setTxStep("dashboard")} className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark flex items-center gap-1 mb-2">
              ← Volver al Dashboard
            </button>
            <h3 className="font-display text-lg tracking-tight">Datos del Destinatario</h3>
            <p className="text-xs text-brand-dark/70">Ingresa la información bancaria de la persona a transferir.</p>
          </div>

          {txError && (
            <div className="mb-4 p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 text-accent-coral shrink-0" />
              <span>{txError}</span>
            </div>
          )}

          <form onSubmit={handleRecipientSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">RUT Destinatario</label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={txRut}
                onChange={(e) => setTxRut(e.target.value)}
                className="w-full p-2.5 border border-brand-dark/20 rounded-xl text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej. Pedro González"
                value={txNombre}
                onChange={(e) => setTxNombre(e.target.value)}
                className="w-full p-2.5 border border-brand-dark/20 rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">Banco Destino</label>
                <select
                  value={txBanco}
                  onChange={(e) => setTxBanco(e.target.value)}
                  className="w-full p-2.5 border border-brand-dark/20 rounded-xl text-xs bg-white"
                >
                  {BANK_LIST.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">N° de Cuenta</label>
                <input
                  type="text"
                  placeholder="1122334455"
                  value={txCuenta}
                  onChange={(e) => setTxCuenta(e.target.value)}
                  className="w-full p-2.5 border border-brand-dark/20 rounded-xl text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">Email (Notificación)</label>
              <input
                type="email"
                placeholder="pedro.g@email.com"
                value={txEmail}
                onChange={(e) => setTxEmail(e.target.value)}
                className="w-full p-2.5 border border-brand-dark/20 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0F766E] text-white rounded-full font-mono text-xs uppercase tracking-wider font-bold hover:bg-opacity-95"
            >
              Continuar
            </button>
          </form>
        </div>
      )}

      {/* TRANSFER STEP 2: AMOUNT */}
      {txStep === "tx_amount" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl">
          <div className="mb-6">
            <button onClick={() => setTxStep("tx_recipient")} className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark flex items-center gap-1 mb-2">
              ← Modificar Destinatario
            </button>
            <h3 className="font-display text-lg tracking-tight">Monto a Transferir</h3>
            <p className="text-xs text-brand-dark/70">Define el monto de dinero que quieres enviar.</p>
          </div>

          {txError && (
            <div className="mb-4 p-3 bg-accent-coral/15 border border-accent-coral/25 rounded-lg text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 text-accent-coral shrink-0 mt-0.5" />
              <span>{txError}</span>
            </div>
          )}

          <form onSubmit={handleAmountSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-brand-dark/80 mb-1">Monto en Pesos (CLP)</label>
              <input
                type="number"
                placeholder="Ej. 10000"
                value={txMonto || ""}
                onChange={(e) => setTxMonto(parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-brand-dark/20 rounded-xl text-sm focus:outline-none font-mono"
                required
              />
              <span className="text-[10px] text-brand-dark/50 mt-1 block">
                Saldo disponible: <strong>{clpFormat(balanceVista)}</strong>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0F766E] text-white rounded-full font-mono text-xs uppercase tracking-wider font-bold hover:bg-opacity-95"
            >
              Confirmar Monto
            </button>
          </form>
        </div>
      )}

      {/* TRANSFER STEP 3: SECURITY PASS */}
      {txStep === "tx_pass" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl text-center space-y-6">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>

          <div>
            <span className="font-mono text-xs text-accent-lavender font-bold">AUTORIZACIÓN REQUERIDA</span>
            <h3 className="font-display text-lg tracking-tight mt-1">Autoriza tu Transacción con PassMinders</h3>
            <p className="text-xs text-brand-dark/70 mt-1">
              Hemos enviado una notificación push de autorización a tu celular. Si no la recibes, aprueba utilizando tu código SMS.
            </p>
          </div>

          {/* Simulated SMS passcode field */}
          <div className="p-5 bg-brand-bg rounded-xl border border-brand-dark/5 max-w-xs mx-auto">
            <label className="block text-xs font-mono uppercase text-brand-dark/70 mb-2">Ingresa tu clave provisoria SMS</label>
            <input
              type="text"
              maxLength={4}
              placeholder="••••"
              defaultValue="1284"
              className="w-32 p-2 border border-brand-dark/20 rounded text-center text-sm font-mono tracking-widest focus:outline-none"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={handleConfirmTransfer}
              className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase hover:bg-brand-dark/95 transition-all font-bold"
            >
              Aprobar y Transferir Fondos 🚀
            </button>
            <button
              onClick={() => setTxStep("tx_amount")}
              className="text-xs font-mono text-brand-dark/50 hover:text-brand-dark block w-full text-center hover:underline"
            >
              Cancelar operación
            </button>
          </div>
        </div>
      )}

      {/* TRANSFER STEP 4: SUCCESS RECEIPT */}
      {txStep === "tx_success" && (
        <div className="max-w-md mx-auto bg-white border border-brand-dark/10 p-6 md:p-8 rounded-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300 animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <div>
            <span className="font-mono text-xs text-[#0F766E] font-bold">¡TRANSFERENCIA COMPLETADA!</span>
            <h3 className="font-display text-2xl tracking-tight text-brand-dark mt-1">
              Envío Exitoso de Fondos
            </h3>
            <p className="text-xs text-brand-dark/70 mt-1">
              La transferencia interbancaria se ha completado de forma instantánea.
            </p>
          </div>

          {/* Receipt detail */}
          <div className="p-5 bg-brand-bg rounded-xl font-mono text-xs text-left border border-brand-dark/5 space-y-2">
            <div className="flex justify-between">
              <span>DESTINATARIO:</span>
              <span className="font-bold text-brand-dark uppercase">{txNombre}</span>
            </div>
            <div className="flex justify-between">
              <span>BANCO DESTINO:</span>
              <span className="font-bold text-brand-dark">{txBanco}</span>
            </div>
            <div className="flex justify-between">
              <span>N° DE CUENTA:</span>
              <span className="font-bold text-brand-dark">{txCuenta}</span>
            </div>
            <div className="flex justify-between text-sm text-[#0F766E] font-bold border-t border-brand-dark/5 pt-2 mt-2">
              <span>MONTO TRANSFERIDO:</span>
              <span>{clpFormat(txMonto)}</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setTxStep("dashboard")}
              className="w-full py-3 bg-brand-dark text-white rounded-full font-mono text-xs uppercase hover:bg-brand-dark/95 transition-all font-bold"
            >
              Volver a mi Dashboard 🔐
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
