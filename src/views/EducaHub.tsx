import React, { useEffect } from "react";
import { amplitudeService, driverService } from "../services/amplitude.service";
import { useRouter } from "../RouterContext";
import { EDUCA_CONTENT, EducaContent } from "../data";
import { BookOpen, PlayCircle, GraduationCap, Clock, ArrowRight } from "lucide-react";

export default function EducaHub() {
  const { navigate } = useRouter();

  useEffect(() => {
    amplitudeService.track("educa_hub_vista");
  }, []);

  const getFormatIcon = (formato: string) => {
    switch (formato) {
      case "articulo": return <BookOpen className="w-4 h-4" />;
      case "video": return <PlayCircle className="w-4 h-4" />;
      case "modulo": return <GraduationCap className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getFormatColor = (formato: string) => {
    switch (formato) {
      case "articulo": return "bg-accent-lavender/20 text-accent-lavender";
      case "video": return "bg-accent-cyan/20 text-accent-cyan";
      case "modulo": return "bg-accent-coral/20 text-accent-coral";
      default: return "bg-brand-dark/10 text-brand-dark";
    }
  };

  const handleContentClick = (content: EducaContent) => {
    navigate(`/educa/${content.contenido_id}`);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pt-24 pb-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/50">
            MindersCredit Educa
          </span>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-brand-dark mt-4 mb-6">
            Aprende hoy,<br />invierte mañana.
          </h1>
          <p className="text-sm sm:text-base text-brand-dark/70 leading-relaxed font-sans">
            Educación financiera clara y directa. Seleccionamos los conceptos más importantes 
            para que tomes el control de tu futuro económico.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EDUCA_CONTENT.map((item) => (
            <div 
              key={item.contenido_id}
              onClick={() => handleContentClick(item)}
              className="bg-white p-6 rounded-2xl border border-brand-dark/10 hover:border-brand-dark/30 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg flex items-center justify-center ${getFormatColor(item.formato)}`}>
                    {getFormatIcon(item.formato)}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand-dark/60 font-bold">
                    {item.categoria}
                  </span>
                </div>
                <h3 className="font-display text-xl tracking-tight text-brand-dark mb-3 group-hover:text-accent-lavender transition-colors">
                  {item.titulo}
                </h3>
                <p className="text-xs text-brand-dark/70 font-sans leading-relaxed line-clamp-3">
                  {item.descripcion}
                </p>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-brand-dark/5 pt-4">
                <div className="flex items-center gap-2 text-brand-dark/50 font-mono text-[10px] uppercase">
                  <Clock className="w-3 h-3" />
                  <span>{item.duracion_min} min</span>
                  <span>•</span>
                  <span>{item.nivel}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-dark/30 group-hover:text-brand-dark transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
