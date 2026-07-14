import { useRouter } from "../RouterContext";
import { trackEvent } from "../analytics";

export default function Footer() {
  const { navigate } = useRouter();

  const handleLinkClick = (path: string, label: string) => {
    navigate(path);
    trackEvent("footer_link_clic", { link_path: path, link_label: label });
  };

  return (
    <footer className="w-full bg-[#1C1F24] text-[#F2F2F2] pt-16 pb-12 px-6 md:px-12 border-t border-brand-dark/20 relative z-10 overflow-hidden">
      {/* Giant Background Watermark */}
      <div className="absolute -right-10 top-0 text-[120px] sm:text-[180px] font-display opacity-[0.03] pointer-events-none uppercase leading-none select-none">
        MINDERSCREDIT.
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col gap-12 relative z-10">
        
        {/* Block A: Giant Brand Wordmark Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-tighter text-[#F2F2F2] leading-none mb-4 select-none">
              MindersCredit<span className="text-accent-lavender">.</span>
            </h2>
            <p className="font-mono text-xs sm:text-sm tracking-wider text-white/60 uppercase">
              // Finanzas cooperativas para tu progreso
            </p>
          </div>
          <button
            onClick={() => handleLinkClick("/hazte-socio", "footer_hazte_socio_cta")}
            className="px-6 py-3 bg-[#F2F2F2] text-[#1C1F24] font-mono text-xs uppercase tracking-wider rounded-full hover:bg-accent-lavender hover:text-[#1C1F24] transition-all self-start md:self-auto font-bold shrink-0"
            data-amp-event="btn_footer_asociate"
          >
            Hazte Socio →
          </button>
        </div>

        {/* Block B: Link Grid (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-4">
          {/* Col 1 */}
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent-lavender block mb-4">
              PARA SOCIOS
            </span>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <button onClick={() => handleLinkClick("/sucursales", "Sucursales")} className="hover:text-accent-lavender hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Sucursales
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/centro-ayuda", "Centro de Ayuda")} className="hover:text-accent-lavender hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Línea de Denuncias
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/centro-ayuda?cat=seguridad", "Ciberseguridad")} className="hover:text-accent-lavender hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Ciberseguridad
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/agenda-tu-hora", "Contáctenos")} className="hover:text-accent-lavender hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Contáctenos
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/centro-ayuda", "Evalúanos")} className="hover:text-accent-lavender hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Evalúanos
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent-cyan block mb-4">
              PARA FUTUROS SOCIOS
            </span>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <button onClick={() => handleLinkClick("/que-es-minderscredit", "Qué es MindersCredit")} className="hover:text-accent-cyan hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Qué es MindersCredit
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/ventajas-socio", "Ventajas de ser socio")} className="hover:text-accent-cyan hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Ventajas de ser socio
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/remanente", "Remanente")} className="hover:text-accent-cyan hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Remanente
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/cuotas-participacion", "Cuotas de participación")} className="hover:text-accent-cyan hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Cuotas de participación
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/acreencias", "Buscador de Acreencias")} className="hover:text-accent-cyan hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Buscador de Acreencias
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent-coral block mb-4">
              INSTITUCIONAL
            </span>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <span className="text-white/40 block text-xs font-mono">// Trabaja con nosotros</span>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/que-es-minderscredit", "Memoria Anual")} className="hover:text-accent-coral hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Memoria Anual 2025
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/remanente", "Balance Cooperativo")} className="hover:text-accent-coral hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Balance Cooperativo
                </button>
              </li>
              <li>
                <span className="text-white/40 block text-xs font-mono">// Políticas institucionales</span>
              </li>
              <li>
                <span className="text-white/40 block text-xs font-mono">// Proveedores sostenibles</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent-mint block mb-4">
              REGULACIONES
            </span>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <button onClick={() => handleLinkClick("/simulador/consumo", "Tasas y comisiones")} className="hover:text-accent-mint hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Tasas y comisiones
                </button>
              </li>
              <li>
                <span className="text-white/40 block text-xs font-mono">// Aviso de Privacidad</span>
              </li>
              <li>
                <span className="text-white/40 block text-xs font-mono">// Términos de uso</span>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/que-es-minderscredit", "Garantía Estatal")} className="hover:text-accent-mint hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Garantía Estatal de Depósitos
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("/regulariza-deuda", "Cobranza extrajudicial")} className="hover:text-accent-mint hover:underline underline-offset-4 decoration-1 text-left transition-colors font-sans">
                  Cobranza extrajudicial
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Block C: Social Media & Callouts */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-white/10">
          {/* Social icons minimal text list */}
          <div className="flex gap-4 font-mono text-xs tracking-wider text-white/50">
            <span className="hover:text-[#F2F2F2] cursor-pointer">INSTAGRAM</span>
            <span>/</span>
            <span className="hover:text-[#F2F2F2] cursor-pointer">LINKEDIN</span>
            <span>/</span>
            <span className="hover:text-[#F2F2F2] cursor-pointer">TWITTER</span>
            <span>/</span>
            <span className="hover:text-[#F2F2F2] cursor-pointer">YOUTUBE</span>
            <span>/</span>
            <span className="hover:text-[#F2F2F2] cursor-pointer">TIKTOK</span>
          </div>

          {/* WhatsApp Callout & Procalidad Badge */}
          <div className="flex flex-col md:items-end gap-2">
            <span className="font-mono text-xs text-accent-mint font-semibold">
              Solicita tu crédito por WhatsApp: +56 9 4424 8785
            </span>
            <span className="font-mono text-[10px] text-white/60 uppercase">
              🏆 1° lugar PROCALIDAD 2025 — Instituciones Financieras
            </span>
          </div>
        </div>

        {/* Block D: Bottom Legal & Trademark bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-white/5 text-[11px] text-white/40">
          <div>
            <p>MindersCredit ® 2026 — Todos los derechos reservados. Agustinas 1141, Santiago, Chile. Tel 600 200 1200.</p>
            <p className="mt-1">Inscrita en el Registro de Cooperativas CMF. Regulada y supervisada por la Comisión para el Mercado Financiero.</p>
            <button onClick={() => navigate("/demo-lab")} className="mt-2 text-white/50 hover:text-white hover:underline transition-all block">Demo Lab · Generador de datos</button>
          </div>
          <span className="font-mono text-xs tracking-wider uppercase text-white/60 shrink-0">
            Ahorradores. Socios. Minders.
          </span>
        </div>

      </div>
    </footer>
  );
}
