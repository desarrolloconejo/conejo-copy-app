export const PASS_SCORE = 70;

export type LibraryEntry = {
  id: number;
  territory: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  mechanism: Mechanism[];
  template: string;
  example: string;
  overlay: string;
  edit: string;
  useWhen: string;
};

export type Mechanism = "comparación" | "número" | "pregunta" | "dato" | "prueba-visual" | "antes-después" | "coste" | "persona";
export const territoryLabels = { A: "Curiosidad útil", B: "Demostración", C: "Historia y oficio", D: "Identidad", E: "Guía guardable", F: "Objeciones", G: "Contradicción" } as const;
export const mechanismLabels: Record<Mechanism, string> = { "comparación": "Comparación", "número": "Número", "pregunta": "Pregunta", "dato": "Dato", "prueba-visual": "Prueba visual", "antes-después": "Antes / después", "coste": "Coste", "persona": "Persona" };

const entry = (territory: LibraryEntry["territory"], mechanism: Mechanism[], template: string, example: string, overlay: string, edit: string, useWhen: string): Omit<LibraryEntry, "id"> => ({ territory, mechanism, template, example, overlay, edit, useWhen });
const entries: Omit<LibraryEntry, "id">[] = [];

entries.push(
  entry("A", ["dato", "prueba-visual"], "El detalle de [objeto/proceso] que cambia [resultado].", "El detalle de esta etiqueta que cambia cómo eliges café.", "El detalle de la etiqueta", "Macro del detalle, círculo o zoom. Insert-Titulo de tres a cinco palabras.", "Existe un detalle concreto que explica una decisión."),
  entry("A", ["comparación", "prueba-visual"], "Probamos [A] y [B] para entender [pregunta].", "Probamos dos formas de cocinar arroz para ver cuál queda más suelto.", "Dos arroces, un ganador", "Pantalla dividida desde el fotograma uno, sin introducción.", "Puedes mostrar una comparación justa."),
  entry("A", ["número", "prueba-visual"], "[Cantidad] segundos para ver por qué [resultado].", "15 segundos para ver por qué este corte da más volumen.", "15 segundos, más volumen", "Cuenta regresiva ligera y demostración inmediata. Sin explicación previa.", "El mecanismo se puede revelar rápido."),
  entry("A", ["prueba-visual"], "Esto parecía [suposición], hasta que vimos [prueba].", "Parecía una crema normal, hasta que la vimos sobre piel seca.", "Hasta que la vimos así", "Inicio con la expectativa y corte seco hacia la prueba en el segundo 2.", "Hay una sorpresa verificable."),
  entry("A", ["comparación"], "La diferencia entre [A] y [B] para decidir mejor.", "La diferencia entre café de origen y blend, en una taza.", "Origen o blend", "Dos objetos lado a lado con etiquetas limpias y legibles.", "El contenido aclara una confusión habitual."),
  entry("A", ["persona", "comparación"], "Si [situación], mira esto antes de elegir [producto].", "Si estás renovando escritorio, mira esto antes de elegir silla.", "Antes de elegir silla", "Escena cotidiana del problema, transición al criterio de decisión.", "El producto responde a una decisión concreta."),
  entry("B", ["antes-después", "prueba-visual"], "Así se ve [resultado] cuando [método] se usa así.", "Así queda la cocina cuando cada utensilio tiene su zona.", "Cada cosa, su zona", "Antes y después con el mismo ángulo de cámara. Sin transición decorativa.", "La transformación es visualmente clara."),
  entry("B", ["antes-después", "prueba-visual"], "De [estado inicial] a [estado deseado] con [acción].", "De agenda caótica a semana clara en 10 minutos.", "Caos a semana clara", "El estado inicial dura un segundo. Entrar al proceso enseguida.", "La mejora requiere pasos simples y demostrables."),
  entry("B", ["prueba-visual"], "Ponemos a prueba [producto] en [situación real].", "Ponemos a prueba esta mochila en un viaje de dos días.", "Dos días, una mochila", "Contexto real de uso, texto mínimo, nada de estudio.", "El producto gana credibilidad en acción."),
  entry("B", ["prueba-visual"], "El paso que cambia [resultado] está aquí.", "El paso que cambia la textura de esta salsa está aquí.", "Este paso lo cambia todo", "Mano ejecutando el paso. Sonido limpio o textura sonora de apoyo.", "Hay un momento técnico decisivo."),
  entry("B", ["comparación", "prueba-visual"], "Mismo objetivo, dos caminos: [A] y [B].", "Mismo objetivo, dos desayunos: energía o pico de hambre.", "Dos desayunos, dos mañanas", "Dos rutas visuales paralelas y conclusión clara al final.", "La comparación educa sin dramatizar."),
  entry("B", ["prueba-visual", "dato"], "Lo que pasa cuando [acción] se hace con [detalle correcto].", "Lo que pasa cuando aplicas protector solar en la cantidad correcta.", "La cantidad correcta", "Demostración con medida visual. Cierre con el resultado.", "Corriges una práctica común con respeto."),
  entry("C", ["persona", "número"], "Lo que aprendimos al intentar [reto real].", "Lo que aprendimos sirviendo 300 desayunos en una mañana.", "300 desayunos, una mañana", "Empieza por la escena más intensa y pasa a la lección.", "El equipo vivió algo que aporta contexto."),
  entry("C", ["persona", "prueba-visual"], "Esta parte de [oficio] casi nadie la ve.", "Esta parte de hacer pan casi nadie la ve.", "La parte que no se ve", "Manos, herramientas y detalle del proceso. Deja respirar el sonido.", "El detrás de escena muestra oficio y paciencia."),
  entry("C", ["persona"], "Cuando [persona] nos dijo [frase], entendimos que…", "Cuando una clienta dijo «quiero sentirme yo misma», cambiamos todo.", "Quiero sentirme yo misma", "Persona hablando a cámara. B-roll auténtico, no de archivo.", "Hay una conversación real que orienta a la marca."),
  entry("C", ["persona", "antes-después"], "El pequeño cambio que hizo más fácil [situación].", "El cambio que hizo más fácil llegar a casa con dos bebés.", "Llegar a casa con bebés", "Escena cotidiana y solución integrada, no exhibida.", "La mejora se conecta con una rutina real."),
  entry("C", ["persona", "pregunta"], "De esta pregunta nació [producto o decisión].", "De esta pregunta nació nuestra forma de empacar pedidos.", "De una pregunta", "Mostrar la pregunta escrita y el prototipo o resultado.", "Quieres explicar la convicción de marca."),
  entry("C", ["persona", "prueba-visual"], "La parte más satisfactoria de [oficio] empieza aquí.", "La parte más satisfactoria de restaurar una mesa empieza aquí.", "Empieza aquí", "Primer plano táctil. Que el gesto y el sonido lleven la escena.", "El valor está en el proceso y la transformación."),
  entry("D", ["persona"], "Para quienes [comportamiento reconocible].", "Para quienes cocinan lento incluso en semanas ocupadas.", "Cocinar lento, semana ocupada", "Insert-Titulo directo sobre escena aspiracional pero cotidiana.", "La audiencia comparte una identidad clara."),
  entry("D", ["persona", "pregunta"], "Si tu versión de [situación] se parece a esto…", "Si tu versión de oficina ordenada se parece a esto…", "¿Tu oficina es así?", "Montaje breve de detalles reconocibles, ritmo rápido.", "Invitas a identificarse sin excluir."),
  entry("D", ["persona"], "El ritual de [momento] que entendemos quienes [grupo].", "El ritual del domingo que entendemos quienes recibimos amigos.", "El ritual del domingo", "Música cálida y gestos naturales. Nada de plano publicitario.", "La marca entra en una rutina significativa."),
  entry("D", ["persona"], "La señal de que eres de [comunidad] es [detalle].", "Si hueles la bolsa antes de abrirla, esto es para ti.", "Hueles la bolsa, ¿verdad?", "Primer plano del gesto y remate visual rápido.", "Hay una observación ligera y genuina."),
  entry("D", ["persona"], "Cuando [situación], este es el tipo de [solución] que buscas.", "Cuando el día se alarga, esta es la cena que buscas.", "Cuando el día se alarga", "Contraste entre jornada intensa y solución simple.", "El producto acompaña un momento emocional."),
  entry("D", ["persona"], "Tu [actividad] puede parecerse más a ti con [detalle].", "Tu escritorio puede parecerse más a ti con un sistema simple.", "Que se parezca a ti", "Elementos personales reales, no un montaje de catálogo.", "Quieres activar expresión personal o pertenencia."),
  entry("E", ["número", "comparación"], "Tres señales para elegir [opción] según [criterio].", "Tres señales para elegir planta según la luz de tu casa.", "Tres señales, una planta", "Lista de tres con ejemplo visual en cada una. Insert-Titulo por etapa.", "La audiencia necesita decidir entre opciones."),
  entry("E", ["prueba-visual"], "La forma más simple de empezar [acción] es esta.", "La forma más simple de empezar movilidad es esta.", "Empieza por aquí", "Mostrar el primer paso completo antes de explicarlo.", "El tema parece difícil y se puede simplificar."),
  entry("E", ["número"], "Guarda esto para la próxima vez que [situación].", "Guarda esto para la próxima maleta de fin de semana.", "Para tu próxima maleta", "Abrir con el resultado. Checklist en pantalla, legible al pausar.", "La pieza se consulta y se reutiliza."),
  entry("E", ["prueba-visual"], "Así organizamos [proceso] cuando necesitamos [resultado].", "Así organizamos una semana de contenidos cuando falla la consistencia.", "Una semana en un tablero", "Captura de proceso, notas o tablero real, no maqueta.", "El cliente puede mostrar método, no solo resultado."),
  entry("E", ["pregunta"], "La pregunta que resuelve [problema] más rápido.", "La pregunta que resuelve una compra de muebles más rápido.", "Haz esta pregunta", "Pregunta grande en pantalla y ejemplo de respuesta inmediato.", "Un marco mental aclara la decisión."),
  entry("E", ["número", "comparación"], "Antes de [acción], revisa estos [cantidad] puntos.", "Antes de contratar un seguro, revisa estos cuatro puntos.", "Cuatro puntos antes de firmar", "Cada punto con imagen, icono o documento real.", "Ofreces una revisión útil y responsable."),
  entry("F", ["pregunta", "comparación"], "¿Vale la pena [servicio] si [condición]?", "¿Vale la pena una asesoría si recién empiezas a invertir?", "¿Vale la pena si empiezas?", "Pregunta frontal. Respuesta por condiciones, nunca promesa universal.", "La audiencia formula una objeción clara."),
  entry("F", ["prueba-visual"], "Lo que incluye [solución] en una situación real.", "Lo que incluye una asesoría cuando tu negocio está creciendo.", "Qué incluye de verdad", "Recorrido de inicio a fin con pantallas o entregables reales.", "Conviene hacer tangible un servicio intangible."),
  entry("F", ["prueba-visual", "dato"], "Elegimos [decisión] para resolver [necesidad], por esto.", "Elegimos este material para el uso diario de una familia.", "Por qué este material", "Mostrar el material en uso y el criterio de elección.", "La marca tiene una decisión de producto explicable."),
  entry("F", ["persona", "comparación"], "Para [perfil], [solución] funciona mejor cuando [condición].", "Para piel mixta, esta rutina funciona mejor si se simplifica.", "Piel mixta: menos es más", "Aclarar a quién aplica e incluir el límite o la contraindicación.", "Necesitas segmentar con honestidad."),
  entry("F", ["comparación", "dato"], "La comparación que hacemos antes de recomendar [opción].", "Lo que comparamos antes de recomendar una silla ergonómica.", "Antes de recomendarla", "Tabla breve o prueba de uso con criterios visibles.", "La confianza depende de explicar el proceso."),
  entry("F", ["persona"], "Empieza por [paso] si quieres llegar a [resultado].", "Empieza por una consulta si quieres una cocina a medida.", "Empieza por la consulta", "Mostrar cómo empieza, quién acompaña y qué pasa después.", "El CTA necesita reducir fricción y dar seguridad."),
  entry("G", ["dato", "coste"], "[Práctica aceptada] es la razón de [problema que ya tienen].", "Publicar todos los días está hundiendo tu alcance.", "Publicar a diario te frena", "El dato o la curva en pantalla en el segundo 2. La prueba antes de la explicación.", "Tienes datos propios que contradicen la creencia."),
  entry("G", ["comparación", "prueba-visual"], "[Resultado] no depende de [causa asumida].", "Que el pan suba no depende de la levadura.", "No es la levadura", "Dos panes idénticos en plano. La variable real se revela después.", "Puedes demostrar la causa real en el mismo vídeo."),
  entry("G", ["dato", "número", "antes-después"], "Dejamos de [práctica del sector] y [resultado medible].", "Dejamos de usar plantillas y bajamos las revisiones a la mitad.", "Sin plantillas, mitad de revisiones", "Cifra antes y después sobre pantalla real de trabajo.", "La agencia o el cliente tomaron la decisión de verdad."),
  entry("G", ["comparación", "prueba-visual"], "Lo que se recomienda para [objetivo] falla si [condición].", "Lo que se recomienda para piel grasa falla en clima húmedo.", "Falla en clima húmedo", "Mostrar el fallo, no contarlo. Producto en la condición adversa.", "La excepción es real y afecta a una parte de tu público."),
  entry("G", ["comparación", "coste"], "[Cosa cara] no arregla [problema]. [Cosa concreta] sí.", "Una cámara mejor no arregla un vídeo aburrido. El primer plano sí.", "No es la cámara", "Mismo plano rodado con móvil y con cámara: la diferencia no está ahí.", "Quieres desmontar una excusa de compra habitual."),
  entry("G", ["dato", "comparación"], "Todos miden [métrica popular]. Nosotros miramos [métrica real].", "Todos miran seguidores. Nosotros miramos envíos por alcance.", "Seguidores no, envíos", "Captura real de analítica con la cifra señalada a mano.", "Tienes una tesis de medición que puedes defender."),
);

export const library: LibraryEntry[] = entries.map((item, index) => ({ ...item, id: index + 1 }));

export type AuditRuleConfig = { maxSpokenWords?: number; maxOverlayWords?: number; requireProof?: boolean; preambles?: string; tiredPhrases?: string; tensionTerms?: string };
export type AuditCheck = { status: "pass" | "warn" | "fail"; title: string; detail: string; hard?: boolean };
export type AuditResult = { score: number; checks: AuditCheck[]; hardFailures: number; wordCount: number; overlayWordCount: number; passed: boolean };

const PREAMBLE = ["hola", "holaa", "buenas", "chicos", "chicas", "gente", "bienvenid", "muy buenas", "hoy os voy", "hoy te voy", "hoy vamos", "en este video", "en este vídeo", "antes de empezar", "como estan", "cómo estáis", "qué tal", "que tal", "os habla", "os traigo", "en el vídeo de hoy"];
const TIRED = ["espera al final", "espérate al final", "no vas a creer", "no te vas a creer", "te va a volar la cabeza", "esto lo cambia todo", "parte 1", "storytime", "story time", "sigue leyendo", "mira hasta el final", "increíble", "increible", "impresionante", "esto es oro", "el secreto que nadie"];
const VAGUE = ["cosas", "algo", "mucho", "muchos", "muchas", "varias", "varios", "mejores", "tips", "trucos", "consejos"];
const TENSION = ["por qué", "porque", "porqué", "razón", "razon", "error", "equivoc", "deja de", "dejamos de", "dejé de", "antes de", "nadie", "nunca", "ningún", "ninguna", "esto es lo que", "en realidad", "sin ", "no es", "no son", "no depende", "no funciona", "ya no", "falla", "fall", "perdí", "perdi", "cuesta", "cost", "frena", "fren", "hundi", "hunde", "arruin", "mata", "empeor", "en vez de", "en lugar de", "pero ", "aunque"];
const SECOND = ["tu ", "tus ", "te ", "ti ", "tú", "contigo", "vos", "usted", "tuyo", "tuya", "si eres", "si tienes", "si llevas", "si haces", "si estás"];
const words = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
const firstMatch = (value: string, terms: string[]) => terms.find((term) => value.includes(term));
const customTerms = (value?: string) => value?.split(",").map((term) => term.trim().toLowerCase()).filter(Boolean) ?? [];

export function auditHook(spokenRaw: string, overlayRaw: string, proof = "", rule?: AuditRuleConfig): AuditResult {
  const spoken = spokenRaw.toLowerCase().trim();
  const wordCount = words(spokenRaw);
  const overlayWordCount = words(overlayRaw);
  const checks: AuditCheck[] = [];
  if (wordCount === 0) return { score: 0, checks: [{ status: "fail", title: "Campo vacío", detail: "Escribe el hook hablado antes de auditar.", hard: true }], hardFailures: 1, wordCount, overlayWordCount, passed: false };
  const maxSpoken = rule?.maxSpokenWords ?? 12;
  const maxOverlay = rule?.maxOverlayWords ?? 6;
  const preambles = [...PREAMBLE, ...customTerms(rule?.preambles)];
  const tired = [...TIRED, ...customTerms(rule?.tiredPhrases)];
  const tensions = [...TENSION, ...customTerms(rule?.tensionTerms)];
  let score = 0;
  let hardFailures = 0;
  if (wordCount < 4) { hardFailures += 1; checks.push({ status: "fail", title: "Demasiado corto", detail: `${wordCount} ${wordCount === 1 ? "palabra" : "palabras"}. Por debajo de 4 no hay promesa que evaluar, solo un fragmento.`, hard: true }); }
  if (wordCount <= maxSpoken) { score += 16; checks.push({ status: "pass", title: "Longitud del hablado", detail: `${wordCount} palabras. Dentro del rango de 7 a ${maxSpoken} calibrado para castellano.` }); }
  else if (wordCount <= maxSpoken + 4) { score += 10; checks.push({ status: "warn", title: "Longitud del hablado", detail: `${wordCount} palabras. En el límite. Intenta bajar de ${maxSpoken}.` }); }
  else if (wordCount <= maxSpoken + 10) { score += 4; checks.push({ status: "fail", title: "Longitud del hablado", detail: `${wordCount} palabras. Se sale de la ventana. Corta la subordinada y quédate con la afirmación.` }); }
  else checks.push({ status: "fail", title: "Longitud del hablado", detail: `${wordCount} palabras. Esto es el primer párrafo del guion, no un hook. Recorta a la mitad.` });
  if (!overlayRaw.trim()) { score += 4; checks.push({ status: "warn", title: "Insert-Titulo", detail: "No has escrito Insert-Titulo. En Reels buena parte del consumo es en silencio: sin Insert-Titulo dependes del audio." }); }
  else if (overlayRaw.toLowerCase().trim() === spoken) { hardFailures += 1; checks.push({ status: "fail", title: "Insert-Titulo", detail: "El Insert-Titulo es idéntico al hablado. Escribe solo el núcleo.", hard: true }); }
  else if (overlayWordCount <= maxOverlay) { score += 12; checks.push({ status: "pass", title: "Insert-Titulo", detail: `${overlayWordCount} palabras. Entra completo en el fotograma uno y funciona en mudo.` }); }
  else { score += 4; checks.push({ status: "fail", title: "Insert-Titulo", detail: `${overlayWordCount} palabras. Pasa de ${maxOverlay} y ocupará dos líneas. Reduce al núcleo.` }); }
  const preamble = firstMatch(spoken, preambles);
  if (preamble) { hardFailures += 1; checks.push({ status: "fail", title: "Preámbulo detectado", detail: `Empiezas con «${preamble.trim()}». Borra la primera frase entera y avísalo antes de rodar.`, hard: true }); }
  else { score += 14; checks.push({ status: "pass", title: "Sin preámbulo", detail: "La primera palabra ya trabaja." }); }
  const tiredPhrase = firstMatch(spoken, tired);
  if (tiredPhrase) { hardFailures += 1; checks.push({ status: "fail", title: "Fórmula del cementerio", detail: `Contiene «${tiredPhrase}». La audiencia lo reconoce como plantilla y acelera el scroll.`, hard: true }); }
  else { score += 12; checks.push({ status: "pass", title: "Sin fórmulas quemadas", detail: "No detecto recursos del cementerio." }); }
  const vague = firstMatch(spoken, VAGUE); const hasNumber = /\d/.test(spokenRaw);
  if (hasNumber && !vague) { score += 14; checks.push({ status: "pass", title: "Especificidad", detail: "Hay cifra concreta y ninguna palabra vacía. Esto da credibilidad." }); }
  else if (hasNumber && vague) { score += 8; checks.push({ status: "warn", title: "Especificidad", detail: `Tienes cifra, pero también «${vague?.trim()}». Sustitúyela por el sustantivo real.` }); }
  else if (vague) checks.push({ status: "fail", title: "Especificidad", detail: `«${vague.trim()}» no dice nada. Cámbialo por el sustantivo exacto o por un número.` });
  else { score += 6; checks.push({ status: "warn", title: "Especificidad", detail: "No hay cifra. No es obligatorio, pero una cifra concreta sube la credibilidad." }); }
  if (firstMatch(spoken, tensions)) { score += 13; checks.push({ status: "pass", title: "Tensión", detail: "Hay conflicto, negación o hueco de información. El espectador tiene algo que resolver." }); }
  else checks.push({ status: "fail", title: "Tensión", detail: "No detecto contradicción, hueco ni coste. Prueba el territorio G." });
  if (firstMatch(spoken, SECOND)) { score += 9; checks.push({ status: "pass", title: "Dirección", detail: "Hablas a alguien concreto. Filtrar audiencia sube la retención media." }); }
  else { score += 3; checks.push({ status: "warn", title: "Dirección", detail: "No apelas al espectador. Vale si el territorio es demostración o historia; en el resto, señálalo." }); }
  const overpromise = /(garantizad|100 ?%|siempre funciona|nunca falla|en 24 horas|de la noche a la mañana|millonari|resultados asegurados)/.test(spoken);
  if (overpromise) { hardFailures += 1; checks.push({ status: "fail", title: "Promesa", detail: "Suena a sobrepromesa. Si el vídeo no la cumple, la salida temprana cuenta como señal negativa y es un riesgo de cliente.", hard: true }); }
  else { score += 10; checks.push({ status: "pass", title: "Promesa", detail: "No detecto exageración. La promesa parece cumplible en el cuerpo del vídeo." }); }
  if (rule?.requireProof && !proof.trim()) { hardFailures += 1; checks.push({ status: "fail", title: "Prueba declarada", detail: "La regla activa exige una prueba visible antes de producir. Declárala en el Canvas o desactiva la exigencia en Reglas.", hard: true }); }
  score = Math.min(100, score);
  if (hardFailures > 0) score = Math.min(score, wordCount < 4 ? 25 : 69);
  return { score, checks, hardFailures, wordCount, overlayWordCount, passed: score >= PASS_SCORE };
}

export function objectiveDetail(objective: string) {
  const map: Record<string, { territory: string; metric: string; evidence: string; note: string }> = {
    "Alcance": { territory: "A · Curiosidad útil + G · Contradicción", metric: "Retención a 3 s", evidence: "Comparación, detalle inesperado, dato propio.", note: "Sin conflicto ni hueco de información no hay motivo para parar." },
    "Guardados": { territory: "E · Guía guardable + B · Demostración", metric: "Guardados por alcance", evidence: "Checklist, proceso claro, demostración por etapas.", note: "El Insert-Titulo debe funcionar si alguien pausa." },
    "Compartidos": { territory: "D · Identidad + G · Contradicción", metric: "Compartidos por alcance", evidence: "Situación reconocible, tesis defendible o contraste compartible.", note: "La audiencia comparte lo que le ayuda a nombrar algo o a abrir conversación." },
    "Comunidad": { territory: "D · Identidad + C · Historia y oficio", metric: "Comentarios por alcance", evidence: "Voz humana, situación reconocible, comentario real.", note: "Cuanto más estrecha la identidad, más fuerte el efecto." },
    "Consideración": { territory: "F · Objeciones + B · Demostración", metric: "Clics por alcance", evidence: "Producto en contexto, antes y después, explicación honesta.", note: "Decir para quién no es también convierte." },
    "Acción": { territory: "F · Objeciones + B · Demostración", metric: "Coste por resultado", evidence: "Uso real, beneficio explicado y CTA.", note: "Todo claim pasa por validación antes de publicar." },
  };
  return map[objective] ?? map.Guardados;
}

export const platformGuidance: Record<string, string> = {
  "Instagram Reels": "El Insert-Titulo y el primer fotograma cargan con el peso. Se pueden subir Reels de hasta 20 minutos, pero los de más de 3 minutos no se recomiendan a audiencias nuevas; para descubrimiento, 3 minutos es el techo real.",
  "TikTok": "El sonido suele estar activado: usa un efecto o una entonación rota como interruptor de patrón y respeta márgenes de seguridad.",
  "YouTube Shorts": "La decisión es aún más rápida y refleja. Optimiza el fotograma uno, no los tres segundos.",
  "Anuncio vertical": "Se juzga con hook rate a los 2 o 3 segundos según plataforma. El ciclo de refresco es de una a dos semanas.",
};
