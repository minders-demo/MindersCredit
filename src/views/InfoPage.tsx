import React, { useEffect } from "react";
import { useRouter } from "../RouterContext";
import { trackEvent } from "../analytics";
import { 
  Shield, Landmark, ShieldAlert, Calculator, Gift, 
  UserPlus, Wallet, TrendingUp, RefreshCw, Scale, 
  ShieldCheck, Calendar, ArrowRight, HelpCircle 
} from "lucide-react";

interface BlockData {
  title: string;
  content: string;
  iconName: string;
}

interface FaqData {
  question: string;
  answer: string;
}

interface InfoPageContent {
  tagline: string;
  title: string;
  editorialHero: {
    title: string;
    description: string;
    badge: string;
  };
  blocks: BlockData[];
  faqs: FaqData[];
  cta: {
    text: string;
    subtext: string;
    actionPath: string;
  };
}

const PAGE_DATA_MAP: Record<string, InfoPageContent> = {
  "que-es-minderscredit": {
    tagline: "SOBRE NOSOTROS",
    title: "Qué es MindersCredit",
    editorialHero: {
      title: "Una Cooperativa de Ahorro y Crédito Moderna",
      description: "En MindersCredit no tenemos clientes, tenemos socios. Nacimos con el propósito de democratizar el acceso financiero y redistribuir nuestras utilidades de forma justa, transparente y equitativa entre todos nuestros copropietarios.",
      badge: "Inclusión Financiera Real",
    },
    blocks: [
      {
        title: "Propósito Social",
        content: "Priorizamos el bienestar de las personas y el desarrollo de sus familias sobre el lucro corporativo tradicional.",
        iconName: "Shield",
      },
      {
        title: "Reparto de Remanente",
        content: "Al finalizar cada año fiscal, las utilidades netas se distribuyen proporcionalmente entre todos los socios activos.",
        iconName: "Landmark",
      },
      {
        title: "Garantía Estatal",
        content: "Tus ahorros y participaciones cuentan con el sólido respaldo regulatorio de la CMF y la Ley de Cooperativas.",
        iconName: "ShieldAlert",
      },
    ],
    faqs: [
      {
        question: "¿Cuál es la diferencia con un banco?",
        answer: "Un banco tradicional maximiza ganancias para accionistas externos. Una cooperativa como MindersCredit pertenece a sus propios usuarios (socios) y distribuye el remanente anualmente.",
      },
      {
        question: "¿Cómo me hago socio?",
        answer: "Solo debes adquirir tus cuotas de participación iniciales en un trámite digital de 3 minutos y abonar tu aporte social inicial.",
      },
      {
        question: "¿Quién regula a MindersCredit?",
        answer: "Estamos supervisados por la Comisión para el Mercado Financiero (CMF) de Chile y regidos por el Departamento de Cooperativas (DECOOP).",
      },
    ],
    cta: {
      text: "Únete a la Cooperativa de Ahorro y Crédito hoy",
      subtext: "Adquiere tus cuotas de participación y conviértete en copropietario.",
      actionPath: "/hazte-socio",
    },
  },
  "ventajas-socio": {
    tagline: "BENEFICIOS EXCLUSIVOS",
    title: "Ventajas de ser Socio",
    editorialHero: {
      title: "Más que un cliente, eres dueño de tus finanzas",
      description: "Ser socio de MindersCredit te abre las puertas a un ecosistema de beneficios preferenciales: tasas de interés más bajas en créditos, mayor rentabilidad en tus cuentas de ahorro, descuentos en comercios nacionales y el derecho al reparto anual de remanente.",
      badge: "Beneficios de Propietario",
    },
    blocks: [
      {
        title: "Tasa de Interés Preferencial",
        content: "Accede a créditos de consumo, hipotecarios y automotrices con condiciones y tasas exclusivas para socios activos.",
        iconName: "Calculator",
      },
      {
        title: "Descuentos en Comercios",
        content: "Ahorra todos los días de la semana en salud, transporte, gastronomía y entretención con tu tarjeta socio.",
        iconName: "Gift",
      },
      {
        title: "Voz y Voto Cooperativo",
        content: "Participa activamente en las decisiones democráticas y juntas de socios para definir el rumbo de la institución.",
        iconName: "UserPlus",
      },
    ],
    faqs: [
      {
        question: "¿Qué son las cuotas de participación?",
        answer: "Son los títulos representativos de capital en la cooperativa que te acreditan como socio y copropietario de la misma.",
      },
      {
        question: "¿Tengo descuentos en farmacias o combustible?",
        answer: "Sí, contamos con convenios activos con Farmacias de la Unión y Combustibles ChileCoop para descuentos de hasta 20% y $200/L respectivamente.",
      },
      {
        question: "¿Puedo postular a beneficios si estoy cesante?",
        answer: "Sí, nuestras tarjetas y seguros cuentan con cláusulas especiales de cesantía e incapacidad para apoyarte en momentos difíciles.",
      },
    ],
    cta: {
      text: "Comienza a disfrutar de las ventajas hoy mismo",
      subtext: "Hazte socio 100% online y accede a todos los convenios al instante.",
      actionPath: "/hazte-socio",
    },
  },
  "remanente": {
    tagline: "REPARTO ANUAL DE UTILIDADES",
    title: "Remanente Cooperativo",
    editorialHero: {
      title: "Tus finanzas generan retornos reales para ti",
      description: "A diferencia de la banca tradicional donde el lucro va a grandes inversionistas, en MindersCredit eres copropietario. Al finalizar el año, si la gestión financiera es positiva, distribuimos el Remanente de utilidades de forma proporcional a tus cuotas de participación e intereses pagados.",
      badge: "Economía Colaborativa",
    },
    blocks: [
      {
        title: "Distribución Justa",
        content: "El remanente se reparte de manera equitativa y transparente de acuerdo con el volumen de tus operaciones y capital.",
        iconName: "Wallet",
      },
      {
        title: "Pago Directo y Automático",
        content: "Recibe tu abono de remanente directamente en tu Cuenta Vista o abónalo para incrementar tus cuotas de participación.",
        iconName: "Landmark",
      },
      {
        title: "Ahorro que Crece",
        content: "Cada cuota de participación que posees no solo te da derecho a voz, sino que amplía tu porción en el reparto anual.",
        iconName: "TrendingUp",
      },
    ],
    faqs: [
      {
        question: "¿Qué es exactamente el Remanente?",
        answer: "Es el saldo positivo (utilidad) resultante del ejercicio anual de la cooperativa tras cubrir gastos operacionales, reservas legales y fondos sociales.",
      },
      {
        question: "¿Cuándo se paga el remanente?",
        answer: "La propuesta de reparto es aprobada por la Junta General de Socios en el mes de abril y el pago se efectúa habitualmente entre mayo y junio.",
      },
      {
        question: "¿Cómo se calcula mi parte?",
        answer: "Se calcula ponderando dos factores: el saldo promedio en tus cuotas de participación y el total de intereses que hayas pagado en tus créditos.",
      },
    ],
    cta: {
      text: "Súmate a la economía colaborativa",
      subtext: "Regístrate hoy, adquiere tus cuotas y califica para el próximo reparto del remanente.",
      actionPath: "/hazte-socio",
    },
  },
  "cuotas-participacion": {
    tagline: "APORTE CAPITAL SOCIO",
    title: "Cuotas de Participación",
    editorialHero: {
      title: "Tu capital de socio que te otorga propiedad",
      description: "Las Cuotas de Participación constituyen el capital social cooperativo. Son aportes nominativos que realiza cada persona para convertirse en socio oficial de MindersCredit. Al adquirirlas, participas de las utilidades anuales y posees derecho a voto.",
      badge: "Capital Social Seguro",
    },
    blocks: [
      {
        title: "Requisito de Ingreso",
        content: "Para ser socio debes suscribir un monto inicial mínimo de cuotas, el cual queda resguardado en tu cuenta de capital.",
        iconName: "Landmark",
      },
      {
        title: "Rentabilidad por Remanente",
        content: "Las cuotas de participación son el indicador clave para el cálculo del reparto anual del remanente de utilidades.",
        iconName: "TrendingUp",
      },
      {
        title: "Devolución Garantizada",
        content: "Si decides renunciar a la cooperativa, puedes solicitar el rescate y la devolución total de tus cuotas reajustadas por IPC.",
        iconName: "RefreshCw",
      },
    ],
    faqs: [
      {
        question: "¿Cuánto vale cada cuota?",
        answer: "El valor unitario de la cuota se reajusta anualmente según el IPC acumulado para resguardar tu capital de la inflación.",
      },
      {
        question: "¿Cuál es el mínimo para ingresar?",
        answer: "El mínimo inicial equivale a $1.000 CLP de capital social. Puedes adquirir cuotas adicionales en cualquier momento para aumentar tu capital.",
      },
      {
        question: "¿Puedo transferir mis cuotas?",
        answer: "Sí, el estatuto permite transferir tus cuotas de participación a otros socios con la aprobación del Consejo de Administración.",
      },
    ],
    cta: {
      text: "Conviértete en dueño adquiriendo tus cuotas",
      subtext: "Completa tu registro en simples pasos y suscribe tu capital de socio.",
      actionPath: "/hazte-socio",
    },
  },
  "credito-mype": {
    tagline: "FINANCIAMIENTO EMPRENDEDOR",
    title: "Crédito MYPE Minders",
    editorialHero: {
      title: "El impulso cooperativo para tu negocio",
      description: "Diseñado exclusivamente para micro y pequeñas empresas chilenas que buscan financiamiento ágil, capital de trabajo o adquisición de activos fijos. Te acompañamos en el crecimiento de tu emprendimiento con plazos flexibles y tasas que apoyan tu productividad.",
      badge: "Apoyo Pyme Real",
    },
    blocks: [
      {
        title: "Capital de Trabajo Mype",
        content: "Financia la compra de materias primas, insumos, inventario y mercadería con cuotas mensuales fijas.",
        iconName: "Wallet",
      },
      {
        title: "Plazos Flexibles",
        content: "Paga hasta en 60 cuotas mensuales y obtén hasta 3 meses de gracia para el pago de tu primera cuota.",
        iconName: "Calendar",
      },
      {
        title: "Garantía Corfo / Fogape",
        content: "Evaluamos tu solicitud complementándola con fondos de garantía estatal Fogape o Corfo para agilizar tu aprobación.",
        iconName: "Shield",
      },
    ],
    faqs: [
      {
        question: "¿Qué documentos requiere mi empresa?",
        answer: "Necesitas carpeta tributaria electrónica, iniciación de actividades de al menos 12 meses, y las últimas declaraciones de IVA.",
      },
      {
        question: "¿Puedo solicitarlo como persona natural con giro?",
        answer: "Sí, financiamos tanto a personas jurídicas como a personas naturales con giro comercial de primera categoría.",
      },
      {
        question: "¿Cuál es el monto máximo?",
        answer: "Financiamos proyectos comerciales de microempresas desde $1.000.000 hasta $30.000.000 CLP sujeto a evaluación crediticia.",
      },
    ],
    cta: {
      text: "Simula el financiamiento para tu pyme hoy",
      subtext: "Haz crecer tu negocio con el apoyo de finanzas cooperativas reales.",
      actionPath: "/simulador/consumo",
    },
  },
  "credito-universal": {
    tagline: "CRÉDITO TRANSPARENTE LEY 20.455",
    title: "Crédito de Consumo Universal",
    editorialHero: {
      title: "Compara con absoluta transparencia y seguridad",
      description: "El Crédito de Consumo Universal es un formato estandarizado por ley que te permite comparar de forma rápida y sencilla las condiciones de financiamiento entre distintas entidades financieras. Cuenta con seguros opcionales y sin cargos adicionales ocultos.",
      badge: "Estandarizado y Transparente",
    },
    blocks: [
      {
        title: "Fácil de Comparar",
        content: "Estructura estandarizada por la CMF. Ideal para cotizar la CAE y costo total del crédito frente a bancos.",
        iconName: "Scale",
      },
      {
        title: "Sin Cargos Ocultos",
        content: "Solo incluye la tasa de interés pactada, el impuesto de timbres y estampillas, y los seguros opcionales.",
        iconName: "ShieldCheck",
      },
      {
        title: "Hasta 36 meses",
        content: "Financiamiento universal diseñado para plazos fijos de hasta 36 meses con cuotas iguales de principio a fin.",
        iconName: "Calendar",
      },
    ],
    faqs: [
      {
        question: "¿Qué es exactamente el Crédito Universal?",
        answer: "Es un formato exigido por la ley chilena para garantizar homogeneidad, permitiendo al cliente comparar de manera directa la tasa de interés y la CAE.",
      },
      {
        question: "¿Los seguros son obligatorios?",
        answer: "No, los seguros de desgravamen y cesantía son totalmente opcionales. Puedes decidir no contratarlos.",
      },
      {
        question: "¿Cuál es el monto de financiamiento?",
        answer: "Aplica para montos estandarizados de hasta UF 1.000, orientados al consumo directo o consolidación de deudas.",
      },
    ],
    cta: {
      text: "Simula tu Crédito Universal ahora",
      subtext: "Accede a nuestro simulador cooperativo con plazos flexibles.",
      actionPath: "/simulador/consumo",
    },
  },
};

const ICON_MAP: Record<string, any> = {
  Shield, Landmark, ShieldAlert, Calculator, Gift, 
  UserPlus, Wallet, TrendingUp, RefreshCw, Scale, 
  ShieldCheck, Calendar
};

export default function InfoPage({ pathKey }: { pathKey: string }) {
  const { navigate } = useRouter();
  
  // Clean key (remove leading slashes, map legacy paths)
  let cleanKey = pathKey.replace(/^\//, "");
  if (cleanKey === "ventajas-de-ser-socio" || cleanKey === "ventajas-socio") {
    cleanKey = "ventajas-socio";
  }
  if (cleanKey === "cuotas-de-participacion" || cleanKey === "cuotas-participacion") {
    cleanKey = "cuotas-participacion";
  }

  const content = PAGE_DATA_MAP[cleanKey] || PAGE_DATA_MAP["que-es-minderscredit"];

  useEffect(() => {
  }, [cleanKey]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-16">
      
      {/* 1. EDITORIAL HERO */}
      <div className="bg-white border border-brand-dark/10 rounded-[28px] p-8 md:p-12 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <span className="font-mono text-[10px] text-accent-lavender font-bold tracking-widest uppercase bg-accent-lavender/10 px-2.5 py-1 rounded-full inline-block">
            {content.tagline}
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-brand-dark tracking-tight leading-tight">
            {content.editorialHero.title}
          </h1>
          <p className="text-sm md:text-base text-brand-dark/75 leading-relaxed">
            {content.editorialHero.description}
          </p>
        </div>
        <div className="bg-brand-bg rounded-2xl p-6 border border-brand-dark/5 flex flex-col items-center justify-center text-center space-y-3">
          <span className="font-display text-xs text-brand-dark/50 font-bold tracking-wider uppercase">SELLO COOPERATIVO</span>
          <span className="text-xs font-mono font-bold text-[#0F766E] bg-[#E6F4F1] border border-[#0F766E]/20 py-1.5 px-3 rounded-full">
            {content.editorialHero.badge}
          </span>
          <p className="text-[10px] font-sans text-brand-dark/40">MindersCredit está 100% regulado y garantizado por la Comisión para el Mercado Financiero de Chile.</p>
        </div>
      </div>

      {/* 2. THREE CONTENT BLOCKS (GRID) */}
      <div className="space-y-6">
        <h3 className="font-display text-xl uppercase tracking-tight text-brand-dark border-b border-brand-dark/10 pb-2">
          Pilares y Características del Servicio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.blocks.map((block, idx) => {
            const IconComponent = ICON_MAP[block.iconName] || Shield;
            return (
              <div 
                key={idx} 
                className="bg-white border border-brand-dark/10 p-6 md:p-8 rounded-[20px] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-brand-dark/5 text-brand-dark rounded-xl flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h4 className="font-display text-base text-brand-dark uppercase tracking-tight font-bold">{block.title}</h4>
                  <p className="text-xs text-brand-dark/70 leading-relaxed">{block.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SHORT FAQ SECTION */}
      <div className="bg-white border border-brand-dark/10 p-8 md:p-10 rounded-[28px] space-y-6">
        <div className="flex items-center gap-2 border-b border-brand-dark/10 pb-3">
          <HelpCircle className="w-5 h-5 text-accent-lavender" />
          <h3 className="font-display text-xl uppercase tracking-tight text-brand-dark">
            Preguntas Frecuentes
          </h3>
        </div>
        <div className="space-y-5">
          {content.faqs.map((faq, idx) => (
            <div key={idx} className="space-y-1 border-b border-brand-dark/5 last:border-0 pb-4 last:pb-0">
              <h4 className="font-sans text-sm font-bold text-brand-dark">
                {faq.question}
              </h4>
              <p className="text-xs text-brand-dark/75 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CONTEXTUAL CTA */}
      <div className="bg-[#1C1F24] text-white rounded-[28px] p-8 md:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-t from-accent-lavender/20 via-transparent to-transparent opacity-50" />
        <div className="relative space-y-3 max-w-xl mx-auto">
          <h3 className="font-display text-2xl md:text-3xl tracking-tight uppercase leading-tight">
            {content.cta.text}
          </h3>
          <p className="text-xs md:text-sm text-white/70">
            {content.cta.subtext}
          </p>
        </div>
        <div className="relative pt-2">
          <button
            onClick={() => navigate(content.cta.actionPath)}
            className="px-8 py-3.5 bg-white text-brand-dark font-mono text-xs uppercase tracking-widest rounded-full hover:bg-accent-lavender hover:text-brand-dark transition-all inline-flex items-center gap-2 font-bold cursor-pointer shadow-lg"
          >
            Comenzar Solicitud Online
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
