const { sql } = require("../lib/db");
const { getSessionUserId } = require("../lib/_auth");

const QUIZZES = {
  matematica: {
    titulo: "Matemática Avançada",
    emoji: "📐",
    cor: "#f97316",
    perguntas: [
      {
        pergunta: "Qual é o valor de x na equação logarítmica: log₂(x) + log₂(x − 2) = 3?",
        opcoes: ["x = 2", "x = 4", "x = 8", "x = 6"],
        correta: 1,
        explicação: "Pela propriedade do logaritmo: log₂(x(x − 2)) = 3 ⇒ x² − 2x = 8. Resolvendo a equação do 2º grau (x > 2), obtemos x = 4."
      },
      {
        pergunta: "Em um triângulo retângulo, se a hipotenusa mede 10 e um dos ângulos é 30°, qual o valor do cateto oposto a esse ângulo?",
        opcoes: ["5", "5√3", "10√2", "8"],
        correta: 0,
        explicação: "sen(30°) = cateto oposto / hipotenusa ⇒ 0,5 = x / 10 ⇒ x = 5."
      },
      {
        pergunta: "Qual é a derivada da função f(x) = x³ − 5x + 2?",
        opcoes: ["3x² - 5", "3x² + 5", "x² - 5", "2x³ - 5"],
        correta: 0,
        explicação: "Aplicando a regra do tombo para derivadas polinomiais: d/dx(x³) = 3x², d/dx(−5x) = −5 e d/dx(2) = 0."
      },
      {
        pergunta: "Qual a probabilidade de obter soma 7 ao lançar dois dados não viciados de seis faces?",
        opcoes: ["1/12", "1/8", "1/6", "1/36"],
        correta: 2,
        explicação: "As combinações favoráveis são (1,6), (2,5), (3,4), (4,3), (5,2) e (6,1): 6 casos em 36 possíveis, ou seja, 6/36 = 1/6."
      }
    ]
  },

  portugues: {
    titulo: "Língua Portuguesa & Literatura",
    emoji: "🖋️",
    cor: "#ef4444",
    perguntas: [
      {
        pergunta: "Assinale a alternativa em que há erro de concordância verbal:",
        opcoes: [
          "Fazem dez anos que não o vejo.",
          "Havia muitos alunos na sala.",
          "Mais de um aluno faltou à prova.",
          "Estados Unidos são uma potência."
        ],
        correta: 0,
        explicação: "O verbo 'fazer' indicando tempo decorrido é impessoal e deve permanecer na 3ª pessoa do singular: 'Faz dez anos'."
      },
      {
        pergunta: "Qual é a figura de linguagem predominante em: 'O sol amanheceu pálido e cansado'?",
        opcoes: ["Catacrese", "Prosopopeia", "Sinédoque", "Eufemismo"],
        correta: 1,
        explicação: "Prosopopeia (ou personificação) é a atribuição de características ou sentimentos humanos a seres inanimados."
      },
      {
        pergunta: "Na oração 'Acredito que você vencerá', a oração subordinada é classificada como:",
        opcoes: ["Substantiva Objetiva Direta", "Adjetiva Restritiva", "Adverbial Causal", "Substantiva Completiva Nominal"],
        correta: 0,
        explicação: "A oração 'que você vencerá' exerce função de objeto direto do verbo transitivo direto 'Acredito'."
      }
    ]
  },

  ciencias: {
    titulo: "Ciências da Natureza",
    emoji: "⚛️",
    cor: "#22c55e",
    perguntas: [
      {
        pergunta: "Qual é a molaridade de uma solução com 180 g de Glicose (C₆H₁₂O₆) em 1 L de solução? (Massa molar da Glicose = 180 g/mol)",
        opcoes: ["0,5 mol/L", "1,0 mol/L", "2,0 mol/L", "0,1 mol/L"],
        correta: 1,
        explicação: "Número de mols n = massa / massa molar = 180 / 180 = 1 mol em 1 L, resultando em 1,0 mol/L."
      },
      {
        pergunta: "Qual organela celular é responsável pela síntese de ATP através da cadeia transportadora de elétrons?",
        opcoes: ["Ribossomo", "Complexo de Golgi", "Mitocôndria", "Lisossomo"],
        correta: 2,
        explicação: "As mitocôndrias realizam a respiração celular aeróbica, produzindo a maior parte do ATP da célula."
      },
      {
        pergunta: "Na primeira lei da Termodinâmica, se um sistema recebe 500 J de calor e realiza 200 J de trabalho, qual a variação da energia interna?",
        opcoes: ["700J", "300J", "-300J", "500J"],
        correta: 1,
        explicação: "Pela conservação da energia: ΔU = Q − W ⇒ ΔU = 500 J − 200 J = 300 J."
      }
    ]
  },

  filosofia: {
    titulo: "Filosofia Moderna e Ética",
    emoji: "🧠",
    cor: "#8b5cf6",
    perguntas: [
      {
        pergunta: "Para Immanuel Kant, o agir moralmente correto baseia-se em:",
        opcoes: [
          "Maximizar a felicidade geral.",
          "Seguir o Imperativo Categórico.",
          "Agir de acordo com as paixões.",
          "Atingir o sucesso pessoal."
        ],
        correta: 1,
        explicação: "Na ética deontológica de Kant, a ação moral é guiada pelo dever racional universalizável (Imperativo Categórico)."
      },
      {
        pergunta: "Qual conceito de Nietzsche descreve a superação dos valores tradicionais e a criação de novos?",
        opcoes: ["Dialética", "Amor Fati", "Além-do-Homem (Übermensch)", "Niilismo Passivo"],
        correta: 2,
        explicação: "O 'Além-do-Homem' (Übermensch) simboliza aquele capaz de transvalorar os valores e afirmar a vida de modo criador."
      }
    ]
  },

  historia: {
    titulo: "História",
    emoji: "📜",
    cor: "#f59e0b",
    perguntas: [
      {
        pergunta: "Qual acontecimento é considerado um marco inicial da Idade Moderna?",
        opcoes: ["Queda de Constantinopla", "Revolução Francesa", "Primeira Guerra Mundial", "Independência do Brasil"],
        correta: 0,
        explicação: "A tomada de Constantinopla pelos otomanos em 1453 é tradicionalmente usada como marco de transição para a Idade Moderna."
      },
      {
        pergunta: "O Renascimento valorizou principalmente:",
        opcoes: ["O teocentrismo medieval", "A censura científica", "O humanismo e a razão", "O isolamento cultural"],
        correta: 2,
        explicação: "O movimento renascentista destacou o antropocentrismo, o humanismo, a investigação científica e a inspiração greco-romana."
      },
      {
        pergunta: "Em que ano ocorreu a Independência do Brasil?",
        opcoes: ["1500", "1789", "1822", "1889"],
        correta: 2,
        explicação: "A proclamação da Independência do Brasil ocorreu em 7 de setembro de 1822."
      }
    ]
  },

  geografia: {
    titulo: "Geografia",
    emoji: "🌎",
    cor: "#06b6d4",
    perguntas: [
      {
        pergunta: "Qual camada da Terra é formada por placas tectônicas?",
        opcoes: ["Núcleo interno", "Litosfera", "Manto inferior", "Atmosfera"],
        correta: 1,
        explicação: "A litosfera é a camada sólida mais externa da Terra, fragmentada em placas tectônicas que se movimentam sobre a astenosfera."
      },
      {
        pergunta: "O clima de uma região é definido principalmente pela análise:",
        opcoes: ["De um único dia", "De poucos minutos", "De longos períodos", "Apenas da vegetação"],
        correta: 2,
        explicação: "Diferente do tempo meteorológico (momentâneo), o clima caracteriza o padrão atmosférico observado ao longo de décadas."
      },
      {
        pergunta: "Bacia hidrográfica é:",
        opcoes: ["Uma área drenada por um rio principal e seus afluentes", "Um tipo de montanha", "Uma formação de nuvens", "Um movimento das marés"],
        correta: 0,
        explicação: "Toda a água das chuvas captada pelos divisores topográficos de uma bacia escoa para um rio principal e seus afluentes."
      }
    ]
  },

  artes: {
    titulo: "Artes",
    emoji: "🎨",
    cor: "#ec4899",
    perguntas: [
      {
        pergunta: "Qual movimento artístico valorizou a luz natural e as impressões visuais do momento?",
        opcoes: ["Barroco", "Impressionismo", "Cubismo", "Surrealismo"],
        correta: 1,
        explicação: "Os impressionistas pintavam ao ar livre para capturar as variações da luz solar nas cores e formas."
      },
      {
        pergunta: "A perspectiva, nas artes visuais, é usada para:",
        opcoes: ["Representar profundidade", "Apagar cores", "Criar sons", "Medir temperatura"],
        correta: 0,
        explicação: "A técnica da perspectiva cria a ilusão tridimensional de volume e profundidade em superfícies bidimensionais."
      },
      {
        pergunta: "A Semana de Arte Moderna no Brasil ocorreu em:",
        opcoes: ["1822", "1889", "1922", "1964"],
        correta: 2,
        explicação: "Realizada no Theatro Municipal de São Paulo em fevereiro de 1922, marcou o início do Modernismo brasileiro."
      }
    ]
  },

  ingles: {
    titulo: "Inglês",
    emoji: "🗣️",
    cor: "#3b82f6",
    perguntas: [
      {
        pergunta: "Qual alternativa está no Simple Past?",
        opcoes: ["I study every day", "I studied yesterday", "I am studying now", "I will study tomorrow"],
        correta: 1,
        explicação: "'Studied' é a forma no passado simples do verbo regular 'to study', acompanhada do advérbio de tempo passado 'yesterday'."
      },
      {
        pergunta: "A tradução mais adequada de 'false friend' em estudo de idiomas é:",
        opcoes: ["Amigo falso", "Palavra parecida com significado diferente", "Gíria informal", "Verbo irregular"],
        correta: 1,
        explicação: "Falsos cognatos ('false friends') têm grafia semelhante entre dois idiomas, mas sentidos distintos (ex.: 'pretend' = fingir)."
      },
      {
        pergunta: "Qual frase está correta?",
        opcoes: ["She are happy", "They is students", "He am tired", "We are ready"],
        correta: 3,
        explicação: "O pronome 'We' (nós) conjuga o verbo to be na forma 'are': 'We are ready'."
      }
    ]
  }
};

QUIZZES.matematica.perguntas.push({"pergunta": "Qual é a raiz positiva de x² = 49?", "opcoes": ["5", "6", "7", "8"], "correta": 2, "explicação": "7 × 7 = 49."});
QUIZZES.matematica.perguntas.push({"pergunta": "Qual é o valor de 2⁵?", "opcoes": ["10", "16", "25", "32"], "correta": 3, "explicação": "2 multiplicado por si mesmo cinco vezes resulta em 32."});
QUIZZES.matematica.perguntas.push({"pergunta": "Qual é a média de 4, 6, 8 e 10?", "opcoes": ["6", "7", "8", "9"], "correta": 1, "explicação": "A soma é 28 e há quatro valores: 28/4 = 7."});
QUIZZES.matematica.perguntas.push({"pergunta": "Qual é a inclinação da reta y = 3x + 2?", "opcoes": ["3", "2", "5", "−3"], "correta": 0, "explicação": "O coeficiente de x é a inclinação da reta."});
QUIZZES.portugues.perguntas.push({"pergunta": "Em “A menina leu o livro”, qual é o objeto direto?", "opcoes": ["A menina", "leu", "o livro", "menina"], "correta": 2, "explicação": "O termo completa o verbo leu sem preposição."});
QUIZZES.portugues.perguntas.push({"pergunta": "Qual palavra é proparoxítona?", "opcoes": ["café", "médico", "papel", "amor"], "correta": 1, "explicação": "A sílaba tônica é a antepenúltima: mé-di-co."});
QUIZZES.portugues.perguntas.push({"pergunta": "Qual conjunção indica oposição?", "opcoes": ["porque", "portanto", "e", "mas"], "correta": 3, "explicação": "Mas é uma conjunção adversativa."});
QUIZZES.portugues.perguntas.push({"pergunta": "Em “Vendem-se casas”, qual é o sujeito?", "opcoes": ["casas", "se", "vendem", "indeterminado"], "correta": 0, "explicação": "O se funciona como partícula apassivadora; casas é o sujeito paciente."});
QUIZZES.portugues.perguntas.push({"pergunta": "Qual palavra é um advérbio de tempo?", "opcoes": ["feliz", "ontem", "mesa", "azul"], "correta": 1, "explicação": "Ontem situa a ação no tempo."});
QUIZZES.ciencias.perguntas.push({"pergunta": "Qual gás é liberado na fotossíntese oxigênica?", "opcoes": ["Nitrogênio", "Oxigênio", "Hélio", "Metano"], "correta": 1, "explicação": "A quebra da água durante o processo libera oxigênio."});
QUIZZES.ciencias.perguntas.push({"pergunta": "Qual unidade mede força no SI?", "opcoes": ["Joule", "Watt", "Newton", "Pascal"], "correta": 2, "explicação": "O newton é a unidade de força."});
QUIZZES.ciencias.perguntas.push({"pergunta": "Qual partícula tem carga elétrica negativa?", "opcoes": ["Próton", "Nêutron", "Fóton", "Elétron"], "correta": 3, "explicação": "O elétron possui carga negativa."});
QUIZZES.ciencias.perguntas.push({"pergunta": "Qual é o pH aproximado da água pura a 25 °C?", "opcoes": ["7", "0", "14", "3"], "correta": 0, "explicação": "A água pura é neutra nessa temperatura."});
QUIZZES.ciencias.perguntas.push({"pergunta": "Qual processo transforma líquido em gás?", "opcoes": ["Fusão", "Vaporização", "Solidificação", "Condensação"], "correta": 1, "explicação": "A vaporização é a passagem do estado líquido para o gasoso."});
QUIZZES.filosofia.perguntas.push({"pergunta": "Quem é associado à maiêutica?", "opcoes": ["Sócrates", "Descartes", "Locke", "Marx"], "correta": 0, "explicação": "A maiêutica socrática utiliza perguntas para estimular a reflexão."});
QUIZZES.filosofia.perguntas.push({"pergunta": "Qual corrente enfatiza a experiência sensorial como fonte de conhecimento?", "opcoes": ["Estoicismo", "Empirismo", "Idealismo", "Ceticismo absoluto"], "correta": 1, "explicação": "O empirismo destaca a experiência na formação do conhecimento."});
QUIZZES.filosofia.perguntas.push({"pergunta": "Quem formulou “Penso, logo existo”?", "opcoes": ["Aristóteles", "Hume", "Descartes", "Epicuro"], "correta": 2, "explicação": "Descartes parte da certeza do pensamento."});
QUIZZES.filosofia.perguntas.push({"pergunta": "Qual área investiga a natureza do conhecimento?", "opcoes": ["Estética", "Retórica", "Política", "Epistemologia"], "correta": 3, "explicação": "A epistemologia examina conhecimento, crença e justificação."});
QUIZZES.filosofia.perguntas.push({"pergunta": "O utilitarismo clássico avalia ações principalmente por quê?", "opcoes": ["Consequências para o bem-estar", "Tradição familiar", "Origem social", "Força física"], "correta": 0, "explicação": "O utilitarismo considera as consequências para a felicidade ou o bem-estar."});
QUIZZES.filosofia.perguntas.push({"pergunta": "Qual escola antiga enfatiza a virtude e o domínio dos próprios juízos?", "opcoes": ["Sofística", "Estoicismo", "Atomismo", "Cinismo"], "correta": 1, "explicação": "O estoicismo distingue o que depende de nós e valoriza a virtude."});
QUIZZES.historia.perguntas.push({"pergunta": "Em que ano foi promulgada a atual Constituição brasileira?", "opcoes": ["1824", "1889", "1967", "1988"], "correta": 3, "explicação": "A Constituição Federal vigente foi promulgada em 1988."});
QUIZZES.historia.perguntas.push({"pergunta": "A Revolução Industrial começou em qual país?", "opcoes": ["Grã-Bretanha", "Itália", "Brasil", "Japão"], "correta": 0, "explicação": "A industrialização pioneira ocorreu na Grã-Bretanha no século XVIII."});
QUIZZES.historia.perguntas.push({"pergunta": "Qual lei aboliu legalmente a escravidão no Brasil?", "opcoes": ["Lei de Terras", "Lei Áurea", "Lei do Ventre Livre", "Lei Eusébio de Queirós"], "correta": 1, "explicação": "A Lei Áurea foi sancionada em 1888."});
QUIZZES.historia.perguntas.push({"pergunta": "Qual civilização antiga desenvolveu a escrita cuneiforme?", "opcoes": ["Asteca", "Romana", "Suméria", "Inca"], "correta": 2, "explicação": "Os sumérios desenvolveram a escrita cuneiforme na Mesopotâmia."});
QUIZZES.historia.perguntas.push({"pergunta": "A Proclamação da República no Brasil ocorreu em qual ano?", "opcoes": ["1822", "1888", "1930", "1889"], "correta": 3, "explicação": "A República foi proclamada em 1889."});
QUIZZES.geografia.perguntas.push({"pergunta": "Qual linha imaginária divide a Terra em hemisférios Norte e Sul?", "opcoes": ["Equador", "Greenwich", "Trópico de Câncer", "Círculo Polar Ártico"], "correta": 0, "explicação": "A linha do Equador corresponde à latitude 0°."});
QUIZZES.geografia.perguntas.push({"pergunta": "Qual instrumento indica direções usando o campo magnético terrestre?", "opcoes": ["Barômetro", "Bússola", "Termômetro", "Pluviômetro"], "correta": 1, "explicação": "A bússola indica direções magnéticas."});
QUIZZES.geografia.perguntas.push({"pergunta": "Qual bioma brasileiro é conhecido por savanas e árvores de troncos retorcidos?", "opcoes": ["Pampa", "Pantanal", "Cerrado", "Mata Atlântica"], "correta": 2, "explicação": "O Cerrado possui diversas formações de savana."});
QUIZZES.geografia.perguntas.push({"pergunta": "O que mede a escala de um mapa?", "opcoes": ["Temperatura", "Altitude", "Densidade", "Proporção entre distâncias no mapa e reais"], "correta": 3, "explicação": "A escala relaciona a representação à distância real."});
QUIZZES.geografia.perguntas.push({"pergunta": "Qual processo descreve o crescimento da população urbana em relação à rural?", "opcoes": ["Urbanização", "Erosão", "Desertificação", "Sedimentação"], "correta": 0, "explicação": "A urbanização é o aumento relativo da população urbana."});
QUIZZES.artes.perguntas.push({"pergunta": "Qual movimento é associado a formas geométricas e múltiplos pontos de vista?", "opcoes": ["Cubismo", "Barroco", "Romantismo", "Realismo"], "correta": 0, "explicação": "O Cubismo representa objetos por planos e perspectivas múltiplas."});
QUIZZES.artes.perguntas.push({"pergunta": "Qual elemento musical se refere à duração organizada dos sons?", "opcoes": ["Cor", "Ritmo", "Perspectiva", "Textura visual"], "correta": 1, "explicação": "O ritmo organiza durações e acentos no tempo."});
QUIZZES.artes.perguntas.push({"pergunta": "Qual técnica cria imagens pela montagem de materiais sobre uma superfície?", "opcoes": ["Gravura", "Aquarela", "Colagem", "Escultura"], "correta": 2, "explicação": "A colagem combina materiais fixados a um suporte."});
QUIZZES.artes.perguntas.push({"pergunta": "Qual cor resulta usualmente da mistura de pigmentos azul e amarelo?", "opcoes": ["Vermelho", "Roxo", "Laranja", "Verde"], "correta": 3, "explicação": "Na mistura tradicional de tintas, azul e amarelo produzem verde."});
QUIZZES.artes.perguntas.push({"pergunta": "Qual elemento visual delimita contornos e pode sugerir movimento?", "opcoes": ["Linha", "Silêncio", "Ritmo sonoro", "Tempo verbal"], "correta": 0, "explicação": "A linha pode delimitar formas e orientar o olhar."});
QUIZZES.ingles.perguntas.push({"pergunta": "Qual é o plural de child?", "opcoes": ["childs", "children", "childes", "childrens"], "correta": 1, "explicação": "Children é o plural irregular de child."});
QUIZZES.ingles.perguntas.push({"pergunta": "Qual alternativa contém um comparativo correto?", "opcoes": ["more tall than", "tallest than", "taller than", "tall than"], "correta": 2, "explicação": "Adjetivos curtos geralmente recebem -er no comparativo."});
QUIZZES.ingles.perguntas.push({"pergunta": "Qual frase está no Present Continuous?", "opcoes": ["I work", "I worked", "I will work", "I am working"], "correta": 3, "explicação": "O Present Continuous usa be + verbo com -ing."});
QUIZZES.ingles.perguntas.push({"pergunta": "Qual é a tradução de “although”?", "opcoes": ["Embora", "Portanto", "Nunca", "Ontem"], "correta": 0, "explicação": "Although introduz uma concessão."});
QUIZZES.ingles.perguntas.push({"pergunta": "Complete: She ___ to school every day.", "opcoes": ["go", "goes", "going", "gone"], "correta": 1, "explicação": "No Simple Present, a terceira pessoa do singular recebe -es em go."});

const { randomInt, randomUUID } = require("node:crypto");
const jwt = require("jsonwebtoken");
const { getSessionSecret } = require("../lib/_auth");
const ROUND_SIZE = 5;
const ROUND_AUDIENCE = "bitacademy-quiz-round-v2";

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function createRound(materia, userId) {
  const quiz = QUIZZES[materia];
  const items = shuffle(quiz.perguntas.map((_, i) => i)).slice(0, ROUND_SIZE)
    .map(i => ({ i, order: shuffle(quiz.perguntas[i].opcoes.map((_, j) => j)) }));
  const token = jwt.sign({ materia, userId: userId || null, items }, getSessionSecret(), {
    algorithm: "HS256", audience: ROUND_AUDIENCE, expiresIn: "30m", jwtid: randomUUID()
  });
  return { token, quiz: { titulo: quiz.titulo, emoji: quiz.emoji, cor: quiz.cor,
    perguntas: items.map(({i, order}) => ({ pergunta: quiz.perguntas[i].pergunta,
      opcoes: order.map(j => quiz.perguntas[i].opcoes[j]) })) } };
}
function gradeRound(quiz, items, answers) {
  if (!Array.isArray(answers) || answers.length !== items.length) return null;
  const selected = new Map();
  for (const answer of answers) {
    const { questionIndex, selected: option } = answer || {};
    if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= items.length ||
        selected.has(questionIndex) || !Number.isInteger(option) || option < 0 || option >= items[questionIndex].order.length) return null;
    selected.set(questionIndex, option);
  }
  const review = items.map(({i, order}, questionIndex) => {
    const q = quiz.perguntas[i];
    const correta = order.indexOf(q.correta), escolhida = selected.get(questionIndex);
    return { pergunta: q.pergunta, opcoes: order.map(j => q.opcoes[j]), correta,
      escolhida, acertou: escolhida === correta, explicacao: q.explicação };
  });
  const score = review.filter(q => q.acertou).length, total = review.length;
  return { score, total, percentage: Math.round(score * 100 / total), review };
}

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

module.exports = async function handler(req, res) {
  try {
    const action = String(req.query?.action || (req.method === "GET" ? "ranking" : "result")).trim().toLowerCase();

    res.setHeader("Cache-Control", "no-store");
    if (action === "questions") {
      if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });
      const materia = String(req.query?.materia || "").trim().toLowerCase();
      if (!Object.hasOwn(QUIZZES, materia)) return res.status(400).json({ error: "Disciplina de quiz inválida." });
      const userId = await getSessionUserId(req);
      return res.status(200).json(createRound(materia, userId));
    }

    if (action === "ranking") {
      if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

      const materia = String(req.query?.materia || "").trim().toLowerCase();
      const limit = Math.min(Math.max(Math.trunc(Number(req.query?.limit) || 10), 1), 50);
      if (!Object.hasOwn(QUIZZES, materia)) return res.status(400).json({ error: "Disciplina de quiz inválida." });

      const rows = await sql`
        SELECT qa.id, qa.quiz_title, qa.score, qa.total_questions, qa.percentage, qa.player_name, qa.completed_at
        FROM quiz_attempts qa
        JOIN subjects s ON s.id = qa.subject_id
        WHERE s.slug = ${materia} AND qa.user_id IS NOT NULL
        ORDER BY qa.percentage DESC, qa.total_questions DESC, qa.score DESC, qa.completed_at ASC
        LIMIT ${limit}
      `;

      return res.status(200).json({
        ranking: rows.map((row) => ({
          id: row.id,
          titulo: row.quiz_title,
          score: row.score,
          total: row.total_questions,
          percent: row.percentage,
          playerName: row.player_name,
          date: row.completed_at
        }))
      });
    }

    if (action === "result") {
      if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

      const body = jsonBody(req);
      const materia = String(body.materia || "").trim().toLowerCase();
      const userId = await getSessionUserId(req);
      const quiz = Object.hasOwn(QUIZZES, materia) ? QUIZZES[materia] : null;
      if (!quiz) return res.status(400).json({ error: "Disciplina de quiz inválida." });
      let round;
      try {
        round = jwt.verify(String(body.token || ""), getSessionSecret(), { algorithms: ["HS256"], audience: ROUND_AUDIENCE });
      } catch {
        return res.status(400).json({ error: "Rodada inválida ou expirada. Inicie outro quiz." });
      }
      if (round.materia !== materia || round.userId !== (userId || null))
        return res.status(403).json({ error: "Rodada não pertence a esta sessão." });
      const graded = gradeRound(quiz, round.items, body.answers);
      if (!graded) return res.status(400).json({ error: "Respostas do quiz inválidas." });
      const { score, total, percentage, review } = graded;
      if (!userId) return res.status(200).json({ result: { score, total, percent: percentage, review, practiceOnly: true } });
      const consumed = await sql`INSERT INTO quiz_used_rounds (id, expires_at)
        VALUES (${round.jti}, TO_TIMESTAMP(${round.exp})) ON CONFLICT (id) DO NOTHING RETURNING id`;
      if (!consumed.length) return res.status(409).json({ error: "Rodada já finalizada. Inicie outro quiz." });

      const rows = await sql`WITH subject AS (
          SELECT id FROM subjects WHERE slug = ${materia}
        ), saved AS (
          INSERT INTO quiz_attempts
            (user_id, subject_id, quiz_title, score, total_questions, percentage, player_name, started_at, completed_at)
          SELECT ${userId}, subject.id, ${quiz.titulo}, ${score}, ${total}, ${percentage}, users.name, NOW(), NOW()
          FROM subject JOIN users ON users.id = ${userId}
          WHERE TRUE
          ON CONFLICT (user_id, subject_id) WHERE user_id IS NOT NULL
          DO UPDATE SET quiz_title = EXCLUDED.quiz_title, score = EXCLUDED.score,
            total_questions = EXCLUDED.total_questions, percentage = EXCLUDED.percentage,
            player_name = EXCLUDED.player_name, started_at = EXCLUDED.started_at, completed_at = NOW()
          WHERE EXCLUDED.percentage > quiz_attempts.percentage
             OR (EXCLUDED.percentage = quiz_attempts.percentage AND EXCLUDED.total_questions > quiz_attempts.total_questions)
          RETURNING id, quiz_title, score, total_questions, percentage, player_name, completed_at
        ) SELECT saved.id, saved.quiz_title, saved.score, saved.total_questions,
            saved.percentage, saved.player_name, saved.completed_at, TRUE AS improved
          FROM saved
        UNION ALL
        SELECT qa.id, qa.quiz_title, qa.score, qa.total_questions, qa.percentage,
            qa.player_name, qa.completed_at, FALSE AS improved
          FROM quiz_attempts qa JOIN subject ON subject.id = qa.subject_id
          WHERE qa.user_id = ${userId} AND NOT EXISTS (SELECT 1 FROM saved)
        LIMIT 1
      `;

      if (!rows.length) return res.status(404).json({ error: "Disciplina não encontrada." });

      // Fase 3: Integração automática com atividades do tipo 'automatic' e Boletim Escolar
      let autoGradedActivities = 0;
      try {
        const autoScore = Math.round((score / total) * 1000) / 100;
        const autoContent = `Concluído automaticamente via Quiz (${score}/${total} acertos · ${percentage}%)`;
        const autoFeedback = `Nota calculada automaticamente pelo desempenho no Quiz de ${quiz.titulo}.`;

        const eligibleActivities = await sql`
          SELECT a.id AS activity_id, a.teacher_id, a.assessment_id, se.id AS enrollment_id
          FROM activities a
          JOIN subjects s ON s.id = a.subject_id
          LEFT JOIN course_offerings o ON o.id = a.course_offering_id
          LEFT JOIN grading_periods gp ON gp.id = a.grading_period_id
          LEFT JOIN academic_years y ON y.id = gp.academic_year_id
          LEFT JOIN assessments ass ON ass.id = a.assessment_id
          JOIN users student ON student.id = ${userId} AND student.account_type = 'Aluno'
          JOIN student_enrollments se ON se.student_id = ${userId} AND se.status = 'active'
            AND (a.course_offering_id IS NULL OR se.class_group_id = o.class_group_id)
          WHERE s.slug = ${materia}
            AND a.activity_type = 'automatic'
            AND (a.due_at IS NULL OR a.due_at > NOW())
            AND ass.status IS DISTINCT FROM 'closed'
            AND (gp.id IS NULL OR gp.status = 'open')
            AND (y.id IS NULL OR y.status <> 'closed')
        `;

        for (const item of eligibleActivities) {
          const autoSaved = await sql`
            INSERT INTO activity_submissions (activity_id, enrollment_id, content, score, feedback, status, submitted_at, graded_at, graded_by)
            SELECT a.id, ${item.enrollment_id}, ${autoContent}, ${autoScore}, ${autoFeedback}, 'graded', NOW(), NOW(), ${item.teacher_id}
            FROM activities a WHERE a.id = ${item.activity_id} AND a.activity_type = 'automatic'
              AND (a.due_at IS NULL OR a.due_at > NOW())
            ON CONFLICT (activity_id, enrollment_id)
            DO UPDATE SET
              content = CASE WHEN EXCLUDED.score >= COALESCE(activity_submissions.score, -1) THEN EXCLUDED.content ELSE activity_submissions.content END,
              score = GREATEST(COALESCE(activity_submissions.score, 0), EXCLUDED.score),
              feedback = CASE WHEN EXCLUDED.score >= COALESCE(activity_submissions.score, -1) THEN EXCLUDED.feedback ELSE activity_submissions.feedback END,
              status = 'graded',
              graded_at = NOW(),
              updated_at = NOW()
            RETURNING id
          `;
          if (!autoSaved.length) continue;

          if (item.assessment_id) {
            await sql`
              WITH previous AS (
                SELECT id, score, grade_status, feedback, TRUE AS existed
                FROM grades WHERE assessment_id = ${item.assessment_id} AND enrollment_id = ${item.enrollment_id}
              ), changed AS (
                INSERT INTO grades (assessment_id, enrollment_id, score, grade_status, feedback, entered_by)
                VALUES (${item.assessment_id}, ${item.enrollment_id}, ${autoScore}, 'scored', ${autoFeedback}, ${item.teacher_id})
                ON CONFLICT (assessment_id, enrollment_id)
                DO UPDATE SET
                  score = GREATEST(COALESCE(grades.score, 0), EXCLUDED.score),
                  grade_status = 'scored',
                  feedback = CASE WHEN EXCLUDED.score >= COALESCE(grades.score, -1) THEN EXCLUDED.feedback ELSE grades.feedback END,
                  updated_at = NOW()
                RETURNING *
              ), audit AS (
                INSERT INTO grade_change_log (grade_id, changed_by, previous_score, new_score, previous_grade_status, new_grade_status, previous_feedback, new_feedback)
                SELECT changed.id, ${item.teacher_id}, previous.score, changed.score, previous.grade_status, changed.grade_status, previous.feedback, changed.feedback
                FROM changed LEFT JOIN previous ON TRUE
                WHERE NOT COALESCE(previous.existed, FALSE)
                   OR previous.score IS DISTINCT FROM changed.score OR previous.grade_status IS DISTINCT FROM changed.grade_status
                RETURNING id
              )
              SELECT changed.id FROM changed
            `;
          }
          autoGradedActivities++;
        }
      } catch (autoErr) {
        console.warn("Aviso ao sincronizar atividade automática via quiz:", autoErr.message);
      }

      return res.status(200).json({
        result: {
          id: rows[0].id,
          materia,
          titulo: rows[0].quiz_title,
          score: rows[0].score,
          total: rows[0].total_questions,
          percent: rows[0].percentage,
          playerName: rows[0].player_name,
          date: rows[0].completed_at,
          improved: rows[0].improved,
          autoGradedActivities,
          currentScore: score, currentTotal: total, currentPercent: percentage, review
        }
      });
    }

    return res.status(400).json({ error: "Ação de quiz inválida." });
  } catch (error) {
    console.error("Quizzes API failed:", error);
    return res.status(500).json({ error: "Não foi possível concluir a operação do quiz." });
  }
};
