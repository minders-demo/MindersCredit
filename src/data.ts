/**
 * MindersCredit — Shared Data (Chilean Comunas, Sucursales, FAQ, Seguros, Beneficios)
 */

export interface Comuna {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
  comunas: Comuna[];
}

export const CHILEAN_REGIONS: Region[] = [
  {
    id: "arica",
    name: "Región de Arica y Parinacota",
    comunas: [
      { id: "arica", name: "Arica" },
      { id: "putre", name: "Putre" },
      { id: "camarones", name: "Camarones" },
    ],
  },
  {
    id: "tarapaca",
    name: "Región de Tarapacá",
    comunas: [
      { id: "iquique", name: "Iquique" },
      { id: "alto_hospicio", name: "Alto Hospicio" },
      { id: "pozo_almonte", name: "Pozo Almonte" },
    ],
  },
  {
    id: "antofagasta",
    name: "Región de Antofagasta",
    comunas: [
      { id: "antofagasta", name: "Antofagasta" },
      { id: "calama", name: "Calama" },
      { id: "tocopilla", name: "Tocopilla" },
      { id: "mejillones", name: "Mejillones" },
    ],
  },
  {
    id: "atacama",
    name: "Región de Atacama",
    comunas: [
      { id: "copiapo", name: "Copiapó" },
      { id: "vallenar", name: "Vallenar" },
      { id: "caldera", name: "Caldera" },
    ],
  },
  {
    id: "coquimbo",
    name: "Región de Coquimbo",
    comunas: [
      { id: "la_serena", name: "La Serena" },
      { id: "coquimbo", name: "Coquimbo" },
      { id: "ovalle", name: "Ovalle" },
      { id: "vicuna", name: "Vicuña" },
    ],
  },
  {
    id: "valparaiso",
    name: "Región de Valparaíso",
    comunas: [
      { id: "valparaiso", name: "Valparaíso" },
      { id: "vina", name: "Viña del Mar" },
      { id: "quilpue", name: "Quilpué" },
      { id: "concon", name: "Concón" },
      { id: "san_antonio", name: "San Antonio" },
    ],
  },
  {
    id: "rm",
    name: "Región Metropolitana de Santiago",
    comunas: [
      { id: "santiago", name: "Santiago Centro" },
      { id: "providencia", name: "Providencia" },
      { id: "las_condes", name: "Las Condes" },
      { id: "maipu", name: "Maipú" },
      { id: "puente_alto", name: "Puente Alto" },
      { id: "nunoa", name: "Ñuñoa" },
      { id: "la_florida", name: "La Florida" },
    ],
  },
  {
    id: "ohiggins",
    name: "Región de O'Higgins",
    comunas: [
      { id: "rancagua", name: "Rancagua" },
      { id: "san_fernando", name: "San Fernando" },
      { id: "pichilemu", name: "Pichilemu" },
      { id: "rengo", name: "Rengo" },
    ],
  },
  {
    id: "maule",
    name: "Región del Maule",
    comunas: [
      { id: "talca", name: "Talca" },
      { id: "curico", name: "Curicó" },
      { id: "linares", name: "Linares" },
      { id: "constitucion", name: "Constitución" },
    ],
  },
  {
    id: "nuble",
    name: "Región de Ñuble",
    comunas: [
      { id: "chillan", name: "Chillán" },
      { id: "san_carlos", name: "San Carlos" },
      { id: "coihueco", name: "Coihueco" },
      { id: "bulnes", name: "Bulnes" },
    ],
  },
  {
    id: "biobio",
    name: "Región del Biobío",
    comunas: [
      { id: "concepcion", name: "Concepción" },
      { id: "talcahuano", name: "Talcahuano" },
      { id: "san_pedro", name: "San Pedro de la Paz" },
      { id: "los_angeles", name: "Los Ángeles" },
    ],
  },
  {
    id: "araucania",
    name: "Región de la Araucanía",
    comunas: [
      { id: "temuco", name: "Temuco" },
      { id: "padre_las_casas", name: "Padre Las Casas" },
      { id: "pucon", name: "Pucón" },
      { id: "villarrica", name: "Villarrica" },
    ],
  },
  {
    id: "los_rios",
    name: "Región de Los Ríos",
    comunas: [
      { id: "valdivia", name: "Valdivia" },
      { id: "la_union", name: "La Unión" },
      { id: "rio_bueno", name: "Río Bueno" },
    ],
  },
  {
    id: "los_lagos",
    name: "Región de Los Lagos",
    comunas: [
      { id: "puerto_montt", name: "Puerto Montt" },
      { id: "osorno", name: "Osorno" },
      { id: "castro", name: "Castro" },
      { id: "puerto_varas", name: "Puerto Varas" },
    ],
  },
  {
    id: "aysen",
    name: "Región de Aysén",
    comunas: [
      { id: "coyhaique", name: "Coyhaique" },
      { id: "puerto_aysen", name: "Puerto Aysén" },
      { id: "chile_chico", name: "Chile Chico" },
    ],
  },
  {
    id: "magallanes",
    name: "Región de Magallanes",
    comunas: [
      { id: "punta_arenas", name: "Punta Arenas" },
      { id: "puerto_natales", name: "Puerto Natales" },
      { id: "porvenir", name: "Porvenir" },
    ],
  },
];

export interface Sucursal {
  id: string;
  name: string;
  regionId: string;
  comunaId: string;
  address: string;
  hours: string;
  phone: string;
}

export const SUCURSALES: Sucursal[] = [
  {
    id: "suc_santiago_centro",
    name: "Sucursal Agustinas (Casa Matriz)",
    regionId: "rm",
    comunaId: "santiago",
    address: "Agustinas 1141, Santiago Centro",
    hours: "Lunes a Jueves: 09:00 - 18:00 hrs. Viernes: 09:00 - 16:00 hrs.",
    phone: "+56 2 2600 1201",
  },
  {
    id: "suc_providencia",
    name: "Sucursal Providencia",
    regionId: "rm",
    comunaId: "providencia",
    address: "Av. Providencia 1920, Providencia",
    hours: "Lunes a Jueves: 09:00 - 18:00 hrs. Viernes: 09:00 - 16:00 hrs.",
    phone: "+56 2 2600 1202",
  },
  {
    id: "suc_las_condes",
    name: "Sucursal El Golf",
    regionId: "rm",
    comunaId: "las_condes",
    address: "Apoquindo 3200, Las Condes",
    hours: "Lunes a Viernes: 09:00 - 14:00 hrs.",
    phone: "+56 2 2600 1203",
  },
  {
    id: "suc_maipu",
    name: "Sucursal Plaza de Maipú",
    regionId: "rm",
    comunaId: "maipu",
    address: "Pajaritos 2100, Maipú",
    hours: "Lunes a Jueves: 09:00 - 18:00 hrs. Viernes: 09:00 - 16:00 hrs.",
    phone: "+56 2 2600 1204",
  },
  {
    id: "suc_puente_alto",
    name: "Sucursal Puente Alto",
    regionId: "rm",
    comunaId: "puente_alto",
    address: "Concha y Toro 450, Puente Alto",
    hours: "Lunes a Jueves: 09:00 - 18:00 hrs. Viernes: 09:00 - 16:00 hrs.",
    phone: "+56 2 2600 1205",
  },
  {
    id: "suc_valparaiso",
    name: "Sucursal Puerto Valparaíso",
    regionId: "valparaiso",
    comunaId: "valparaiso",
    address: "Prat 780, Valparaíso",
    hours: "Lunes a Viernes: 09:00 - 16:00 hrs.",
    phone: "+56 32 2600 1206",
  },
  {
    id: "suc_vina",
    name: "Sucursal Viña del Mar",
    regionId: "valparaiso",
    comunaId: "vina",
    address: "Libertad 350, Viña del Mar",
    hours: "Lunes a Jueves: 09:00 - 18:00 hrs. Viernes: 09:00 - 16:00 hrs.",
    phone: "+56 32 2600 1207",
  },
  {
    id: "suc_concepcion",
    name: "Sucursal Concepción Centro",
    regionId: "biobio",
    comunaId: "concepcion",
    address: "O'Higgins 540, Concepción",
    hours: "Lunes a Jueves: 09:00 - 18:00 hrs. Viernes: 09:00 - 16:00 hrs.",
    phone: "+56 41 2600 1208",
  },
  {
    id: "suc_temuco",
    name: "Sucursal Temuco Alemania",
    regionId: "araucania",
    comunaId: "temuco",
    address: "Av. Alemania 0820, Temuco",
    hours: "Lunes a Jueves: 09:00 - 18:00 hrs. Viernes: 09:00 - 16:00 hrs.",
    phone: "+56 45 2600 1209",
  },
  {
    id: "suc_antofagasta",
    name: "Sucursal Antofagasta Prat",
    regionId: "antofagasta",
    comunaId: "antofagasta",
    address: "Arturo Prat 450, Antofagasta",
    hours: "Lunes a Jueves: 09:00 - 18:00 hrs. Viernes: 09:00 - 16:00 hrs.",
    phone: "+56 55 2600 1210",
  },
];

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    id: "faq_c1",
    category: "Créditos",
    question: "¿Cuáles son los requisitos básicos para un Crédito de Consumo?",
    answer: "Los requisitos básicos incluyen ser mayor de 18 años, contar con cédula de identidad vigente (RUT chileno), tener antecedentes comerciales idóneos, acreditar ingresos estables (liquidaciones de sueldo para dependientes, boletas de honorarios o carpeta tributaria para independientes) y cumplir con la antigüedad laboral mínima de 12 meses.",
  },
  {
    id: "faq_c2",
    category: "Créditos",
    question: "¿Puedo postergar el pago de mi primera cuota?",
    answer: "Sí, en MindersCredit te ofrecemos flexibilidad. Puedes elegir comenzar a pagar tu primera cuota hasta en 90 días corridos desde el momento del desembolso de tu crédito.",
  },
  {
    id: "faq_t1",
    category: "Tarjetas",
    question: "¿Qué costo de mantención tiene la Cuenta Vista?",
    answer: "La Cuenta Vista MindersCredit tiene un costo de mantención mensual de $0, sin cobros ocultos ni letra chica. Queremos promover la inclusión financiera de todos los chilenos y chilenas.",
  },
  {
    id: "faq_t2",
    category: "Tarjetas",
    question: "¿Cómo acumulo Puntos MindersCredit?",
    answer: "Acumulas Puntos MindersCredit con todas las compras nacionales e internacionales realizadas con tu Tarjeta de Crédito MindersCredit. Acumulas 1 punto por cada $100 CLP de compra. Los puntos se pueden canjear por abonos en tu cuenta, descuentos en comercios asociados o donaciones cooperativas.",
  },
  {
    id: "faq_s1",
    category: "Seguros",
    question: "¿Qué cubre el Seguro SOAP?",
    answer: "El Seguro Obligatorio de Accidentes Personales (SOAP) cubre la muerte, incapacidad permanente y gastos médicos que resulten directamente de accidentes de tránsito en los que participe el vehículo asegurado. Es un seguro exigido por ley para renovar el permiso de circulación.",
  },
  {
    id: "faq_s2",
    category: "Seguros",
    question: "¿Cómo declaro un siniestro de Seguro Mascotas?",
    answer: "Puedes declarar un siniestro directamente desde la App MindersCredit, sección 'Seguros'. Adjunta la boleta de atención de la clínica veterinaria acreditada y la receta médica de tu mascota. El reembolso se efectuará en un plazo máximo de 5 días hábiles en tu Cuenta Vista.",
  },
  {
    id: "faq_r1",
    category: "Remanente",
    question: "¿Qué es el Remanente de la Cooperativa?",
    answer: "A diferencia de un banco tradicional, en las cooperativas las utilidades anuales se denominan 'Remanente'. Al ser una entidad sin fines de lucro, si hay remanente positivo al finalizar el año fiscal, este se distribuye de manera proporcional entre todos los socios activos de MindersCredit de acuerdo con sus cuotas de participación e intereses pagados.",
  },
  {
    id: "faq_r2",
    category: "Remanente",
    question: "¿Cuándo y cómo se paga el Remanente?",
    answer: "El pago del remanente se realiza habitualmente entre los meses de mayo y junio de cada año, tras ser aprobado por la Junta General de Socios. El dinero se deposita directamente en tu Cuenta Vista MindersCredit o se abona a tus cuotas de participación según lo que decidas.",
  },
  {
    id: "faq_k1",
    category: "Clave",
    question: "¿Qué hago si olvidé mi clave de acceso a MindersCredit en Línea?",
    answer: "Puedes recuperar tu clave directamente en el portal de acceso haciendo clic en 'Recupera tu Clave'. Necesitarás ingresar tu RUT y te enviaremos un código verificador SMS a tu celular registrado. Tras ingresar el código, podrás definir tu nueva clave de 8 caracteres.",
  },
];

export interface Beneficio {
  id: string;
  category: "Momentos Ñami" | "Transporte" | "Salud" | "Entretención";
  title: string;
  partner: string;
  discount: string;
  terms: string;
  code: string;
  bannerUrl: string;
}

export const BENEFICIOS: Beneficio[] = [
  {
    id: "b1",
    category: "Momentos Ñami",
    partner: "La Pizzería del Barrio",
    title: "Martes y Jueves de Pizza Cooperativa",
    discount: "25% de Descuento",
    terms: "Válido para consumo presencial y delivery pagando con Tarjeta de Crédito MindersCredit. No acumulable con otras promociones.",
    code: "MINDERPIZZA25",
    bannerUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b2",
    category: "Momentos Ñami",
    partner: "Wraps & Greens",
    title: "Almuerzos Saludables de Lunes a Viernes",
    discount: "40% de Descuento",
    terms: "Válido en toda la carta de wraps y ensaladas. Exclusivo pagando con Cuenta Vista MindersCredit.",
    code: "MINDERWRAP40",
    bannerUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b3",
    category: "Transporte",
    partner: "Combustibles ChileCoop",
    title: "Carga de Combustible con Súper Descuento",
    discount: "Hasta $200 de descuento por litro",
    terms: "Aplica en gasolinas de 93, 95, 97 octanos y Diésel los días Sábado y Domingo. Tope de 50 litros por transacción.",
    code: "MINDERBENCINA200",
    bannerUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b4",
    category: "Salud",
    partner: "Farmacias de la Unión",
    title: "Descuento en Medicamentos y Bienestar",
    discount: "20% de Descuento",
    terms: "Descuento aplicable en el mes de compra presentando RUT socio. Excluye medicamentos oncológicos e inmunológicos.",
    code: "MINDERSALUD20",
    bannerUrl: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b5",
    category: "Entretención",
    partner: "Cine Arte Alameda Coop",
    title: "Cine 2x1 en Todas las Funciones",
    discount: "Entradas 2x1",
    terms: "Válido de Lunes a Domingo para boletería física u online ingresando los primeros 6 dígitos de tu Tarjeta de Crédito.",
    code: "MINDER2X1CINE",
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b6",
    category: "Transporte",
    partner: "Bicicletas EcoSpeed",
    title: "Arriendo de Bicicletas y Scooters Eléctricos",
    discount: "30% de Descuento",
    terms: "Aplica para todos los viajes mensuales desbloqueados con la App de EcoSpeed registrando tu Tarjeta de Débito MindersCredit.",
    code: "ECOSPEED30",
    bannerUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b7",
    category: "Salud",
    partner: "Ópticas del Sur",
    title: "Cristales y Marcos Ópticos",
    discount: "15% de Descuento",
    terms: "Presenta tu RUT de socio en cualquier sucursal y obtén 15% adicional sobre precios vigentes en lentes ópticos y de sol.",
    code: "MINDEROPTICA15",
    bannerUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b8",
    category: "Entretención",
    partner: "Teatro Municipal",
    title: "Butacas y Funciones de Ópera o Conciertos",
    discount: "25% de Descuento",
    terms: "Válido en compras online para toda la temporada artística del Teatro. Ingresa tu código de socio al pagar.",
    code: "TEATROMINDER25",
    bannerUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b9",
    category: "Momentos Ñami",
    partner: "Café de Especialidad La Coope",
    title: "Café + Muffin de Regalo por tu Cumpleaños",
    discount: "Cumpleaños Feliz 100% Gratis",
    terms: "Canjeable presencialmente durante todo el mes de tu cumpleaños mostrando tu cédula de identidad y tu tarjeta de socio.",
    code: "COOPBIRTHDAY",
    bannerUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b10",
    category: "Salud",
    partner: "Clínica Dental Sana",
    title: "Evaluación y Limpieza Dental Profiláctica",
    discount: "50% de Descuento",
    terms: "Válido para una higienización anual completa y diagnóstico sin costo. Agenda previa llamada identificándote como socio.",
    code: "SANACOOP50",
    bannerUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b11",
    category: "Transporte",
    partner: "Estacionamientos CityPark",
    title: "Tarifa Plana de Estacionamiento Seguro",
    discount: "10% de Descuento Diario",
    terms: "Descuento directo al pagar en el tótem con tus tarjetas de débito o crédito MindersCredit.",
    code: "CITYPARK10",
    bannerUrl: "https://images.unsplash.com/photo-1506521788701-1e13a4e83c2a?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b12",
    category: "Entretención",
    partner: "Parque Aventura",
    title: "Pases Diarios e Ingresos Familiares",
    discount: "35% de Descuento",
    terms: "Máximo 4 pases diarios por socio. Válido fines de semana y festivos en boleterías presenciales.",
    code: "AVENTURAMINDER35",
    bannerUrl: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "b13",
    category: "Momentos Ñami",
    partner: "Heladería Cremoso",
    title: "Copas de Helado Dobles 2x1",
    discount: "Helado Doble 2x1",
    terms: "Exclusivo los días Miércoles en todas las sucursales de Heladería Cremoso del país pagando con Cuenta Vista.",
    code: "CREMOSO2X1",
    bannerUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=600&auto=format&fit=crop",
  },
];

export interface SeguroPlan {
  name: string;
  priceMonthly: number;
  coverage: string;
}

export interface SeguroConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  basePrice: number;
  icon: string;
  plans: SeguroPlan[];
  formFields: { label: string; name: string; type: string; placeholder: string; required: boolean }[];
}

export const SEGUROS_CONFIG: SeguroConfig[] = [
  {
    id: "seguro-hogar",
    name: "Seguro Hogar Protegido",
    tagline: "Protección integral para tu casa o departamento.",
    description: "Cubre incendios, sismos, robos de bienes y asistencia domiciliaria 24/7 (gasfitería, cerrajería, electricidad).",
    basePrice: 6500,
    icon: "Home",
    plans: [
      { name: "Plan Base", priceMonthly: 6500, coverage: "Incendio + Sismo básico (cobertura UF 1.000)" },
      { name: "Plan Full Hogar", priceMonthly: 12900, coverage: "Incendio + Sismo completo + Robo (cobertura UF 2.500) + Asistencia 24/7" },
      { name: "Plan Premium", priceMonthly: 21000, coverage: "Cobertura total UF 5.000, daños a terceros y responsabilidad civil" }
    ],
    formFields: [
      { label: "Dirección de la Propiedad", name: "direccion", type: "text", placeholder: "Ej. Av. Providencia 1234, depto 402", required: true },
      { label: "Tipo de Propiedad", name: "tipo", type: "select", placeholder: "Casa / Departamento", required: true },
      { label: "Avalúo Estimado (UF o Pesos)", name: "avaluo", type: "number", placeholder: "Ej. 2500", required: true }
    ]
  },
  {
    id: "seguro-mascotas",
    name: "Seguro Mascotas Club",
    tagline: "El mejor cuidado veterinario para tu perro o gato.",
    description: "Cubre consultas veterinarias, exámenes, vacunas, urgencias quirúrgicas y responsabilidad civil si causa daños.",
    basePrice: 8900,
    icon: "Heart",
    plans: [
      { name: "Plan Cachorros / Gatitos", priceMonthly: 8900, coverage: "Reembolso 60% en consultas y vacunas (Tope anual $200.000)" },
      { name: "Plan Mascota Protegida", priceMonthly: 14500, coverage: "Reembolso 80% en exámenes, urgencias y hospitalizaciones (Tope anual $500.000)" },
      { name: "Plan Master Elite", priceMonthly: 22000, coverage: "Reembolso 90% sin deducible + Responsabilidad Civil extendida (Tope $1.500.000)" }
    ],
    formFields: [
      { label: "Nombre de tu Mascota", name: "nombre_mascota", type: "text", placeholder: "Ej. Firulais o Luna", required: true },
      { label: "Especie", name: "especie", type: "select", placeholder: "Perro / Gato", required: true },
      { label: "Edad (Años)", name: "edad", type: "number", placeholder: "Ej. 3", required: true }
    ]
  },
  {
    id: "seguro-auto-full",
    name: "Seguro Automotriz Auto Full",
    tagline: "Tranquilidad total en la ruta frente a todo evento.",
    description: "Cubre colisiones, robo de vehículo, daños a terceros, auto de reemplazo garantizado y asistencia en ruta 24 horas.",
    basePrice: 28900,
    icon: "Car",
    plans: [
      { name: "Deducible UF 10", priceMonthly: 28900, coverage: "Pérdida total y parcial, asistencia en ruta 24/7" },
      { name: "Deducible UF 5", priceMonthly: 37500, coverage: "Cobertura completa, auto de reemplazo por 15 días, daños a terceros extendidos" },
      { name: "Deducible UF 0", priceMonthly: 49900, coverage: "Daño propio sin deducible, auto de reemplazo ilimitado, grúa premium" }
    ],
    formFields: [
      { label: "Patente del Vehículo", name: "patente", type: "text", placeholder: "Ej. ABCD12 o AB1234", required: true },
      { label: "Marca del Vehículo", name: "marca", type: "text", placeholder: "Ej. Toyota", required: true },
      { label: "Año de Fabricación", name: "ano", type: "number", placeholder: "Ej. 2022", required: true }
    ]
  },
  {
    id: "seguro-soap",
    name: "Seguro SOAP 2026",
    tagline: "El seguro obligatorio exigido por ley al mejor precio.",
    description: "Cubre gastos de hospitalización, invalidez y fallecimiento para el conductor, pasajeros y terceros afectados.",
    basePrice: 5490,
    icon: "ShieldAlert",
    plans: [
      { name: "SOAP Automóvil / Station Wagon", priceMonthly: 5490, coverage: "Cobertura obligatoria exigida por ley de tránsito" },
      { name: "SOAP Camioneta / Furgón", priceMonthly: 8490, coverage: "Cobertura obligatoria exigida por ley de tránsito" },
      { name: "SOAP Motocicleta", priceMonthly: 32500, coverage: "Cobertura obligatoria para vehículos de dos ruedas" }
    ],
    formFields: [
      { label: "Patente del Vehículo", name: "patente", type: "text", placeholder: "Ej. ABCD12", required: true },
      { label: "RUT del Propietario", name: "rut_propietario", type: "text", placeholder: "Ej. 12.345.678-9", required: true },
      { label: "Modelo del Vehículo", name: "modelo", type: "text", placeholder: "Ej. Yaris", required: true }
    ]
  }
];

export const BANK_LIST = [
  "Banco Estado",
  "Banco de Chile",
  "Banco Santander",
  "Banco BCI",
  "Banco Itaú",
  "Scotiabank",
  "Banco Security",
  "Banco BICE",
  "Coopeuch",
  "Banco Falabella",
  "Banco Ripley"
];

export interface TransactionDemo {
  id: string;
  date: string;
  desc: string;
  amount: number;
  type: "cargo" | "abono";
}

export interface PersonaDemo {
  rut: string;
  nombre: string;
  es_socio: boolean;
  region: string;
  comuna: string;
  balance_vista: number;
  balance_ahorro: number;
  remanente_acumulado: number;
  puntos: number;
  pensionada: boolean;
  has_credito: boolean;
  has_tarjeta: boolean;
  transactions: TransactionDemo[];
}

export const PERSONAS_DEMO: PersonaDemo[] = [
  {
    rut: "12.345.678-0",
    nombre: "Camila Rojas",
    es_socio: true,
    region: "Región Metropolitana de Santiago",
    comuna: "Providencia",
    balance_vista: 1450000,
    balance_ahorro: 5200000,
    remanente_acumulado: 345000,
    puntos: 1250,
    pensionada: false,
    has_credito: true,
    has_tarjeta: true,
    transactions: [
      { id: "tx_c1", date: "2026-07-09", desc: "Supermercado Lider Providencia", amount: 45200, type: "cargo" },
      { id: "tx_c2", date: "2026-07-08", desc: "Farmacias Ahumada", amount: 12400, type: "cargo" },
      { id: "tx_c3", date: "2026-07-05", desc: "Abono Remanente Cooperativo MC", amount: 180000, type: "abono" },
      { id: "tx_c4", date: "2026-07-03", desc: "Sencillito Pago Cuentas", amount: 32500, type: "cargo" },
      { id: "tx_c5", date: "2026-06-30", desc: "Traspaso de Fondos - Sueldo", amount: 1200000, type: "abono" },
      { id: "tx_c6", date: "2026-06-28", desc: "Combustibles Copec", amount: 25000, type: "cargo" },
      { id: "tx_c7", date: "2026-06-25", desc: "Starbucks Pocuro", amount: 6400, type: "cargo" },
      { id: "tx_c8", date: "2026-06-22", desc: "Abono Intereses Cuenta Ahorro", amount: 15400, type: "abono" },
      { id: "tx_c9", date: "2026-06-18", desc: "Suscripción Netflix Chile", amount: 10700, type: "cargo" },
      { id: "tx_c10", date: "2026-06-15", desc: "Tiendas Falabella Costanera", amount: 89900, type: "cargo" },
      { id: "tx_c11", date: "2026-06-12", desc: "Pago Seguro Mascotas Minders", amount: 14500, type: "cargo" }
    ]
  },
  {
    rut: "15.654.321-3",
    nombre: "Jorge Fuentes",
    es_socio: true,
    region: "Región de Valparaíso",
    comuna: "Viña del Mar",
    balance_vista: 85000,
    balance_ahorro: 120000,
    remanente_acumulado: 42000,
    puntos: 320,
    pensionada: false,
    has_credito: false,
    has_tarjeta: false,
    transactions: [
      { id: "tx_j1", date: "2026-07-10", desc: "Giro Cajero Automático BancoEstado", amount: 20000, type: "cargo" },
      { id: "tx_j2", date: "2026-07-07", desc: "Panadería Los Olivos", amount: 4500, type: "cargo" },
      { id: "tx_j3", date: "2026-07-05", desc: "Abono Solidario Cooperativa MC", amount: 15000, type: "abono" },
      { id: "tx_j4", date: "2026-07-01", desc: "Supermercado Jumbo Viña", amount: 62400, type: "cargo" },
      { id: "tx_j5", date: "2026-06-29", desc: "Transferencia Recibida Juan F.", amount: 50000, type: "abono" },
      { id: "tx_j6", date: "2026-06-26", desc: "Pago Cuentas Gas Valpo", amount: 18900, type: "cargo" },
      { id: "tx_j7", date: "2026-06-22", desc: "Café Journal Viña", amount: 5200, type: "cargo" },
      { id: "tx_j8", date: "2026-06-18", desc: "Carga Tarjeta Metro Valparaíso", amount: 10000, type: "cargo" },
      { id: "tx_j9", date: "2026-06-15", desc: "Farmacias Cruz Verde", amount: 8900, type: "cargo" },
      { id: "tx_j10", date: "2026-06-12", desc: "Transferencia de Fondos", amount: 120000, type: "abono" },
      { id: "tx_j11", date: "2026-06-10", desc: "Suscripción Spotify Chile", amount: 6500, type: "cargo" }
    ]
  },
  {
    rut: "11.222.334-K",
    nombre: "Rosa Sepúlveda",
    es_socio: true,
    region: "Región del Biobío",
    comuna: "Concepción",
    balance_vista: 620000,
    balance_ahorro: 15400000,
    remanente_acumulado: 812000,
    puntos: 4500,
    pensionada: true,
    has_credito: true,
    has_tarjeta: false,
    transactions: [
      { id: "tx_r1", date: "2026-07-08", desc: "Farmacias Dr. Simi Concepción", amount: 18500, type: "cargo" },
      { id: "tx_r2", date: "2026-07-06", desc: "Abono IPS Pensión de Vejez", amount: 350000, type: "abono" },
      { id: "tx_r3", date: "2026-07-05", desc: "Abono Anual Remanente MC", amount: 125000, type: "abono" },
      { id: "tx_r4", date: "2026-07-02", desc: "Supermercado Unimarc Lomas", amount: 42100, type: "cargo" },
      { id: "tx_r5", date: "2026-06-29", desc: "Pago Cuenta Luz CGE", amount: 22400, type: "cargo" },
      { id: "tx_r6", date: "2026-06-25", desc: "Zapatería Beba Concepción", amount: 28000, type: "cargo" },
      { id: "tx_r7", date: "2026-06-21", desc: "Almacén La Esquina", amount: 7300, type: "cargo" },
      { id: "tx_r8", date: "2026-06-18", desc: "Abono Intereses Depósito a Plazo", amount: 48900, type: "abono" },
      { id: "tx_r9", date: "2026-06-14", desc: "Clínica Dental Sana", amount: 15000, type: "cargo" },
      { id: "tx_r10", date: "2026-06-10", desc: "Combustibles Petrobras", amount: 15000, type: "cargo" },
      { id: "tx_r11", date: "2026-06-05", desc: "Traspaso de Fondos Hija", amount: 100000, type: "abono" }
    ]
  }
];

export interface DemoUser {
  auth_uid: string;
  customer_id: string;
  rut_normalized: string;
  password: "Demo1234";
  first_name: string;
  last_name: string;
  customer_segment: "socio_activo" | "pensionado" | "socio_nuevo";
  region: string;
}

export const DEMO_USERS: DemoUser[] = [
  { auth_uid: "uid_demo_camila", customer_id: "cust_demo_camila", rut_normalized: "123456785", password: "Demo1234", first_name: "Camila", last_name: "Rojas", customer_segment: "socio_activo", region: "Metropolitana" },
  { auth_uid: "uid_demo_jorge",  customer_id: "cust_demo_jorge", rut_normalized: "98765433", password: "Demo1234", first_name: "Jorge",  last_name: "Fuentes", customer_segment: "pensionado", region: "Valparaíso" },
  { auth_uid: "uid_demo_rosa",   customer_id: "cust_demo_rosa", rut_normalized: "156789012", password: "Demo1234", first_name: "Rosa",   last_name: "Espinoza", customer_segment: "socio_nuevo", region: "Biobío" }
];

export interface EducaContent {
  contenido_id: string;
  titulo: string;
  formato: "articulo" | "video" | "modulo";
  categoria: "creditos" | "ahorro" | "endeudamiento" | "seguros" | "cooperativismo";
  tema_producto: string;
  duracion_min: number;
  nivel: "basico" | "intermedio";
  descripcion: string;
}

export const EDUCA_CONTENT: EducaContent[] = [
  {
    contenido_id: "cred-01",
    titulo: "¿Cómo calcular el costo real de tu crédito? El CAE explicado",
    formato: "articulo",
    categoria: "creditos",
    tema_producto: "credito_consumo",
    duracion_min: 3,
    nivel: "basico",
    descripcion: "Descubre por qué la tasa de interés no es suficiente para comparar créditos y cómo usar el CAE a tu favor."
  },
  {
    contenido_id: "cred-02",
    titulo: "El momento ideal para refinanciar deudas",
    formato: "video",
    categoria: "endeudamiento",
    tema_producto: "credito_consumo",
    duracion_min: 4,
    nivel: "intermedio",
    descripcion: "Estrategias para unificar tus deudas y reducir tu carga financiera mensual inteligentemente."
  },
  {
    contenido_id: "aho-01",
    titulo: "Depósitos a plazo: Tu primera inversión segura",
    formato: "modulo",
    categoria: "ahorro",
    tema_producto: "deposito_plazo",
    duracion_min: 10,
    nivel: "basico",
    descripcion: "Domina los conceptos básicos de inversión sin riesgo. Incluye lecciones interactivas y un quiz final."
  },
  {
    contenido_id: "aho-02",
    titulo: "Fondo de emergencia: ¿Cuánto y dónde guardarlo?",
    formato: "articulo",
    categoria: "ahorro",
    tema_producto: "cuenta_ahorro",
    duracion_min: 2,
    nivel: "basico",
    descripcion: "Aprende a construir un blindaje financiero contra imprevistos con cuentas de ahorro programado."
  },
  {
    contenido_id: "seg-01",
    titulo: "Mitos y verdades del seguro de vida",
    formato: "articulo",
    categoria: "seguros",
    tema_producto: "seguro_vida",
    duracion_min: 4,
    nivel: "intermedio",
    descripcion: "Todo lo que necesitas saber antes de contratar un seguro para proteger a tu familia."
  },
  {
    contenido_id: "coop-01",
    titulo: "Ventajas del modelo cooperativo financiero",
    formato: "video",
    categoria: "cooperativismo",
    tema_producto: "hazte_socio",
    duracion_min: 5,
    nivel: "basico",
    descripcion: "Por qué ser dueño de tu institución financiera cambia las reglas del juego a tu favor."
  },
  {
    contenido_id: "cred-03",
    titulo: "Uso inteligente de la tarjeta de crédito",
    formato: "modulo",
    categoria: "creditos",
    tema_producto: "tarjeta_credito",
    duracion_min: 15,
    nivel: "intermedio",
    descripcion: "Aprende a usar tu tarjeta para maximizar beneficios sin pagar intereses innecesarios."
  },
  {
    contenido_id: "seg-02",
    titulo: "¿Cómo asegurar tu hogar contra sismos e incendios?",
    formato: "articulo",
    categoria: "seguros",
    tema_producto: "seguro_hogar",
    duracion_min: 3,
    nivel: "basico",
    descripcion: "Guía práctica para entender las coberturas y exclusiones en seguros de hogar."
  },
  {
    contenido_id: "aho-03",
    titulo: "El poder del interés compuesto a largo plazo",
    formato: "video",
    categoria: "ahorro",
    tema_producto: "deposito_plazo",
    duracion_min: 4,
    nivel: "intermedio",
    descripcion: "Descubre cómo el tiempo y la reinversión multiplican tus ahorros de forma exponencial."
  }
];
