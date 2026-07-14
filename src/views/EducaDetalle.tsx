import React, { useState, useEffect, useRef } from "react";
import { amplitudeService, driverService } from "../services/amplitude.service";
import { useRouter } from "../RouterContext";
import { EDUCA_CONTENT, EducaContent } from "../data";
import { ArrowLeft, Play, Pause, CheckCircle2, ChevronRight } from "lucide-react";

export default function EducaDetalle({ id }: { id: string }) {
  const { navigate } = useRouter();
  const content = EDUCA_CONTENT.find(c => c.contenido_id === id);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [lesson, setLesson] = useState(1);
  const startTime = useRef(Date.now());
  
  const trackedProgress = useRef(new Set<number>());

  useEffect(() => {
    if (!content) return;
    
    // Set global drivers indicating active usage of Educa
    driverService.set("ultimo_contenido_educa", content.contenido_id);
    driverService.set("leyo_contenido_educa", "true");
    const vistos = parseInt(driverService.get("contenidos_educa_vistos") || "0", 10);
    
    amplitudeService.track("educa_contenido_iniciado", {
      contenido_id: content.contenido_id,
      formato: content.formato,
      categoria: content.categoria,
      tema_producto: content.tema_producto,
      nivel: content.nivel
    });

    if (content.formato === "articulo") {
      const handleScroll = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        const pct = Math.min(100, Math.round((currentScroll / docHeight) * 100));
        setProgress(pct);
        checkProgressMarkers(pct);
        if (pct > 95 && !completed) {
          completeContent();
        }
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [content]);

  useEffect(() => {
    if (content?.formato === "video" && isPlaying) {
      const interval = setInterval(() => {
        setProgress(p => {
          const next = p + (100 / (content.duracion_min * 60)); // Simulate progress per second
          checkProgressMarkers(next);
          if (next >= 100 && !completed) {
            completeContent();
            setIsPlaying(false);
            return 100;
          }
          return Math.min(next, 100);
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, content, completed]);

  const checkProgressMarkers = (pct: number) => {
    const marks = [25, 50, 75];
    marks.forEach(mark => {
      if (pct >= mark && !trackedProgress.current.has(mark)) {
        trackedProgress.current.add(mark);
        amplitudeService.track("educa_contenido_progreso", {
          contenido_id: content!.contenido_id,
          formato: content!.formato,
          pct: mark
        });
      }
    });
  };

  const completeContent = () => {
    if (completed) return;
    setCompleted(true);
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    
    amplitudeService.track("educa_contenido_completado", {
      contenido_id: content!.contenido_id,
      formato: content!.formato,
      categoria: content!.categoria,
      tema_producto: content!.tema_producto,
      tiempo_seg: elapsed
    });

    const vistos = parseInt(driverService.get("contenidos_educa_vistos") || "0", 10) + 1;
    driverService.set("contenidos_educa_vistos", vistos);
    
    amplitudeService.addValueUserProperty("contenidos_educa_completados", 1);
    amplitudeService.appendUserProperty("categorias_educa", content!.categoria);
    
    if (content!.formato === "modulo" || vistos >= 5) {
      amplitudeService.setUserProperty("nivel_educacion_financiera", "avanzado");
    } else if (vistos >= 3) {
      amplitudeService.setUserProperty("nivel_educacion_financiera", "activo");
    } else {
      amplitudeService.setUserProperty("nivel_educacion_financiera", "iniciado");
    }
  };

  const nextLesson = () => {
    amplitudeService.track("educa_modulo_leccion_completada", {
      contenido_id: content!.contenido_id,
      numero_leccion: lesson
    });
    if (lesson < 3) {
      setLesson(lesson + 1);
      setProgress((lesson) / 3 * 100);
    } else {
      setLesson(4); // Quiz
      setProgress(100);
    }
  };

  const handleQuizSubmit = () => {
    const correct = quizAnswers.filter(a => a === 1).length;
    amplitudeService.track("educa_quiz_respondido", {
      contenido_id: content!.contenido_id,
      correctas: correct,
      total: 3
    });
    setQuizSubmitted(true);
    completeContent();
  };

  const handleCtaClick = () => {
    amplitudeService.track("educa_cta_producto_clic", {
      contenido_id: content!.contenido_id,
      tema_producto: content!.tema_producto,
      destino: `/${content!.tema_producto.replace("_", "/")}`
    });
    
    // Mapeo simple de producto a ruta
    let route = "/";
    if (content!.tema_producto === "credito_consumo") route = "/simulador/consumo";
    else if (content!.tema_producto === "deposito_plazo") route = "/servicios/ahorro-inversiones";
    else if (content!.tema_producto === "cuenta_ahorro") route = "/servicios/ahorro-inversiones";
    else if (content!.tema_producto.startsWith("seguro")) route = "/servicios/seguros";
    else if (content!.tema_producto === "hazte_socio") route = "/hazte-socio";
    else if (content!.tema_producto === "tarjeta_credito") route = "/tarjeta-credito";
    
    navigate(`${route}?origen=educa`);
  };

  if (!content) return <div className="p-10 text-center">Contenido no encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] pt-24 pb-20">
      {/* Sticky Progress Bar */}
      <div className="fixed top-[72px] left-0 w-full h-1 bg-gray-200 z-40">
        <div className="h-full bg-brand-dark transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-3xl mx-auto px-6">
        <button 
          onClick={() => navigate("/educa")}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-dark/50 hover:text-brand-dark transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Educa
        </button>

        <div className="mb-8 border-b border-brand-dark/10 pb-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent-lavender font-bold block mb-3">
            {content.categoria} • Nivel {content.nivel}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-brand-dark mb-4">
            {content.titulo}
          </h1>
          <p className="text-sm text-brand-dark/60 font-sans leading-relaxed">
            {content.descripcion}
          </p>
        </div>

        {/* CONTENIDO: Artículo */}
        {content.formato === "articulo" && (
          <div className="prose prose-sm sm:prose-base text-brand-dark/80 font-sans leading-relaxed">
            <p>La educación financiera es el pilar fundamental para tomar decisiones acertadas. Cuando entendemos los conceptos básicos como tasas de interés, inflación y riesgo, podemos proyectar mejor nuestro futuro y proteger nuestro patrimonio ante imprevistos. Este conocimiento no solo te beneficia a ti, sino a tu familia entera.</p>
            <p>A menudo, las personas se centran únicamente en la tasa nominal de los créditos o inversiones. Sin embargo, existen costos ocultos o efectos compuestos que cambian drásticamente el resultado. Aprender a calcular el costo real o la ganancia efectiva es una habilidad que rinde frutos inmediatos.</p>
            <p>Otro aspecto vital es la diversificación. No pongas todos tus huevos en la misma canasta. Tener un fondo de emergencia en instrumentos líquidos (como un Depósito a Plazo renovable o una cuenta de ahorro) asegura que no tengas que endeudarte en condiciones desfavorables si ocurre una crisis inesperada.</p>
            <p>Por último, comprender cómo interactúan los seguros en tu planificación financiera te da tranquilidad. Un seguro adecuado transfiere el riesgo financiero de un desastre a una compañía aseguradora, dejando intacto tu ahorro. Esta es la esencia de una estrategia financiera resiliente y a prueba del tiempo.</p>
            
            {/* Espaciador para scroll */}
            <div className="h-40"></div>
          </div>
        )}

        {/* CONTENIDO: Video */}
        {content.formato === "video" && (
          <div className="space-y-6">
            <div className="aspect-video bg-brand-dark rounded-2xl relative overflow-hidden flex items-center justify-center group">
              <img src={`https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80`} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all shadow-xl"
              >
                {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
              </button>
              
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-cyan transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
            {completed && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-mono text-xs uppercase tracking-wider font-bold">Video completado</span>
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO: Módulo Interactivo */}
        {content.formato === "modulo" && (
          <div className="space-y-6">
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className={`h-1.5 flex-1 rounded-full ${lesson >= step ? 'bg-accent-coral' : 'bg-gray-200'}`} />
              ))}
            </div>

            {lesson < 4 ? (
              <div className="bg-white p-8 rounded-2xl border border-brand-dark/10 shadow-sm">
                <span className="font-mono text-xs uppercase text-brand-dark/50 tracking-wider">Lección {lesson} de 3</span>
                <h3 className="font-display text-2xl tracking-tight text-brand-dark mt-2 mb-4">
                  Conceptos fundamentales de tu producto
                </h3>
                <p className="text-brand-dark/70 font-sans leading-relaxed mb-8">
                  En esta lección aprenderemos sobre la importancia de evaluar diferentes alternativas antes de tomar una decisión financiera. Lee detenidamente y avanza cuando estés listo para continuar el aprendizaje iterativo.
                </p>
                <button 
                  onClick={nextLesson}
                  className="px-6 py-3 bg-brand-dark text-white font-mono text-xs uppercase tracking-wider rounded-full hover:bg-brand-dark/90 transition-all flex items-center gap-2"
                >
                  Siguiente Lección <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-brand-dark/10 shadow-sm">
                {!quizSubmitted ? (
                  <>
                    <span className="font-mono text-xs uppercase text-accent-coral font-bold tracking-wider">Evaluación Final</span>
                    <h3 className="font-display text-2xl tracking-tight text-brand-dark mt-2 mb-4">
                      Pon a prueba tus conocimientos
                    </h3>
                    <div className="space-y-4 mb-8">
                      {[1, 2, 3].map((q, idx) => (
                        <div key={q} className="p-4 border border-brand-dark/10 rounded-xl">
                          <p className="font-sans text-sm font-bold text-brand-dark mb-3">¿Pregunta de prueba número {q} sobre el contenido?</p>
                          <div className="flex gap-3">
                            <button onClick={() => { const newA = [...quizAnswers]; newA[idx] = 1; setQuizAnswers(newA); }} className={`px-4 py-2 rounded-lg text-xs font-mono uppercase border ${quizAnswers[idx] === 1 ? 'bg-brand-dark text-white' : 'border-brand-dark/20 text-brand-dark'}`}>Verdadero</button>
                            <button onClick={() => { const newA = [...quizAnswers]; newA[idx] = 0; setQuizAnswers(newA); }} className={`px-4 py-2 rounded-lg text-xs font-mono uppercase border ${quizAnswers[idx] === 0 ? 'bg-brand-dark text-white' : 'border-brand-dark/20 text-brand-dark'}`}>Falso</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={handleQuizSubmit}
                      disabled={quizAnswers.length < 3}
                      className="px-6 py-3 bg-brand-dark text-white font-mono text-xs uppercase tracking-wider rounded-full hover:bg-brand-dark/90 transition-all disabled:opacity-50"
                    >
                      Enviar Respuestas
                    </button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="font-display text-2xl tracking-tight text-brand-dark">¡Módulo Completado!</h3>
                    <p className="text-sm text-brand-dark/60 mt-2">Has demostrado dominio en este tema financiero.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CTA FINAL CONTEXTUAL */}
        {completed && (
          <div className="mt-12 p-8 bg-brand-dark text-white rounded-3xl text-center relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-display text-2xl tracking-tight mb-2">
                Pon en práctica lo aprendido
              </h3>
              <p className="text-sm text-white/70 mb-6 max-w-lg mx-auto">
                Ya tienes los conocimientos necesarios. Ahora da el siguiente paso en tu bienestar financiero con MindersCredit.
              </p>
              <button 
                onClick={handleCtaClick}
                className="px-8 py-3.5 bg-white text-brand-dark font-mono text-xs uppercase tracking-widest rounded-full hover:bg-gray-100 transition-all font-bold shadow-xl shadow-black/10"
              >
                Simula tu producto →
              </button>
            </div>
            
            {/* Background elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent-lavender/20 rounded-full blur-3xl"></div>
          </div>
        )}

      </div>
    </div>
  );
}
