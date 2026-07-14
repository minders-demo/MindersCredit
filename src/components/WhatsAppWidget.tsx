import React, { useState, useEffect, useRef } from "react";
import { trackEvent } from "../analytics";
import { useRouter } from "../RouterContext";
import { MessageSquare, Send, X, Phone } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  actions?: { label: string; value: string; nextStep: string }[];
  link?: { label: string; path: string };
}

interface WhatsAppWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: string;
}

export default function WhatsAppWidget({ isOpen, onClose, initialAmount }: WhatsAppWidgetProps) {
  const { navigate } = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentFlow, setCurrentFlow] = useState<"welcome" | "amount" | "rut" | "done">("welcome");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [enteredRut, setEnteredRut] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      trackEvent("whatsapp_chat_iniciado", { context: "sticky_bar_or_floating" });
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      const welcomeMsg: Message = {
        id: "msg_1",
        sender: "bot",
        text: "¡Hola! Bienvenido al canal oficial de MindersCredit. Soy MinderBot 🤖, tu asistente digital cooperativo. ¿Estás buscando simular un Crédito de Consumo hoy?",
        time: now,
        actions: [
          { label: "Sí, simular crédito", value: "simular", nextStep: "ask_amount" },
          { label: "Ver otros productos", value: "otros", nextStep: "other_products" }
        ]
      };
      setMessages([welcomeMsg]);
      setCurrentFlow("welcome");
    }
  }, [isOpen]);

  // Autoscroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const addMessage = (sender: "bot" | "user", text: string, actions?: Message["actions"], link?: Message["link"]) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      sender,
      text,
      time: now,
      actions,
      link
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleActionClick = (action: { label: string; value: string; nextStep: string }) => {
    // 1. Add user message
    addMessage("user", action.label);
    trackEvent("whatsapp_monto_seleccionado", { action_clicked: action.value });

    // 2. Trigger bot response based on nextStep
    setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (action.nextStep === "ask_amount") {
        setCurrentFlow("amount");
        addMessage(
          "bot",
          "¡Excelente decisión! Te daremos una simulación rápida. ¿Cuánto dinero necesitas solicitar?",
          undefined,
          undefined
        );
      } else if (action.nextStep === "other_products") {
        addMessage(
          "bot",
          "Te sugiero revisar nuestra Cuenta Vista costo $0 o nuestros Seguros. Puedes ir directamente en el menú de la web. ¿Deseas hacer algo más?",
          [
            { label: "Quiero simular de todas formas", value: "simular", nextStep: "ask_amount" },
            { label: "Cerrar chat", value: "close", nextStep: "close_chat" }
          ]
        );
      } else if (action.nextStep === "close_chat") {
        addMessage("bot", "Entendido. ¡Que tengas un excelente día!");
        setTimeout(() => onClose(), 1500);
      }
    }, 800);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    addMessage("user", userText);
    setInputText("");

    setTimeout(() => {
      if (currentFlow === "amount") {
        // Amount provided
        setSelectedAmount(userText);
        trackEvent("whatsapp_monto_provisto", { monto: userText });
        setCurrentFlow("rut");
        addMessage(
          "bot",
          "Perfecto. Por favor, indícame tu RUT para comprobar las mejores tasas de cooperativa disponibles hoy."
        );
      } else if (currentFlow === "rut") {
        // RUT provided
        setEnteredRut(userText);
        trackEvent("whatsapp_rut_entregado", { rut: userText });
        setCurrentFlow("done");
        
        // Simulating the live calculation of J1 params
        const numericAmount = parseInt(selectedAmount.replace(/[^0-9]/g, "")) || 3000000;
        const interestRate = 0.0199; // 1.99%
        const cuotas = 36;
        const factor = (interestRate * Math.pow(1 + interestRate, cuotas)) / (Math.pow(1 + interestRate, cuotas) - 1);
        const estimatedCuota = Math.round(numericAmount * factor);
        const clpCuota = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(estimatedCuota);
        const clpMonto = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(numericAmount);

        addMessage("bot", "Verificando en nuestro sistema cooperativo... ⏳");

        setTimeout(() => {
          trackEvent("whatsapp_completado", { monto: clpMonto, valor_cuota: clpCuota });
          addMessage(
            "bot",
            `¡Listo! Tu preaprobación para un monto de *${clpMonto}* a ${cuotas} cuotas arroja un valor estimado de *${clpCuota}* al mes (Tasa cooperativa 1,99%).\n\n¿Quieres personalizar los plazos de pago y seguros? Accede a nuestro simulador oficial:`,
            undefined,
            {
              label: "Ir al Simulador Oficial 🚀",
              path: `/simulador/consumo?monto=${numericAmount}&rut=${encodeURIComponent(userText)}`
            }
          );
        }, 1200);
      } else {
        addMessage("bot", "Disculpa, no comprendo. ¿Te gustaría simular un crédito?", [
          { label: "Sí, simular crédito", value: "simular", nextStep: "ask_amount" }
        ]);
      }
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-full max-w-sm bg-white shadow-2xl border border-emerald-600/20" style={{ borderRadius: "18px", height: "500px" }}>
      {/* Header style WhatsApp */}
      <div className="bg-emerald-600 text-white p-4 flex justify-between items-center" style={{ borderTopLeftRadius: "17px", borderTopRightRadius: "17px" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center font-display font-bold">
            MC.
          </div>
          <div>
            <div className="font-mono text-sm font-bold tracking-tight">MindersCredit WhatsApp</div>
            <div className="text-[10px] text-white/80 font-mono">● En línea (Canal Oficial)</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-4 bg-[#efeae2] overflow-y-auto space-y-3 flex flex-col">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col max-w-[85%] ${m.sender === "user" ? "self-end items-end" : "self-start items-start"}`}>
            <div className={`p-3 rounded-xl text-xs leading-relaxed ${m.sender === "user" ? "bg-[#d9fdd3] text-brand-dark rounded-tr-none" : "bg-white text-brand-dark rounded-tl-none"}`}>
              <div className="whitespace-pre-line">{m.text}</div>
              
              {m.link && (
                <button
                  onClick={() => {
                    navigate(m.link!.path);
                    onClose();
                  }}
                  className="mt-3 w-full bg-brand-dark text-white text-center py-2 px-3 font-mono text-[10px] rounded-lg hover:bg-brand-dark/90 transition-all font-bold block"
                >
                  {m.link.label}
                </button>
              )}
              
              <div className="text-[9px] text-brand-dark/40 font-mono text-right mt-1">
                {m.time}
              </div>
            </div>

            {/* Actions if present */}
            {m.actions && m.actions.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2 w-full">
                {m.actions.map((act) => (
                  <button
                    key={act.value}
                    onClick={() => handleActionClick(act)}
                    className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 text-[11px] font-mono font-medium py-1.5 px-3 rounded-full border border-emerald-600/10 transition-all self-start text-left"
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#f0f2f5] flex items-center gap-2" style={{ borderBottomLeftRadius: "17px", borderBottomRightRadius: "17px" }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            currentFlow === "amount"
              ? "Ej: 3000000 o 3 millones..."
              : currentFlow === "rut"
              ? "Ej: 12.345.678-9"
              : "Escribe un mensaje..."
          }
          className="flex-1 bg-white p-2.5 px-4 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 text-brand-dark font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-emerald-600 text-white p-2.5 rounded-full hover:bg-emerald-700 disabled:opacity-40 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
