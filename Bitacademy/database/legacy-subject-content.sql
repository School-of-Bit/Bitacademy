-- Idempotent import of the original static subject pages into the content library.
-- These legacy entries have no teacher owner and are credited to the BitAcademy team.
-- Re-running this file does not duplicate or overwrite imported entries.
-- Run after schema.sql and the updated academic.sql.

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Por que estudar Artes?', 'A Arte é uma das formas mais profundas de comunicação e reflexão da sociedade. 
Nesta seção, exploraremos como o olhar artístico transforma o mundo e como você pode desenvolver suas habilidades críticas e práticas.', 'published', NOW(), 10, 'legacy:artes:introducao'
FROM subjects s WHERE s.slug = 'artes'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'História da Arte', 'A História da Arte mostra como diferentes sociedades representaram crenças, emoções, poder, cotidiano e identidade. Cada período artístico revela técnicas, valores e formas de olhar o mundo.

Observe obras perguntando: quando foram feitas, por quem, com qual técnica e que mensagem ou sensação procuram transmitir.

• Arte na Pré-história e Antiguidade

• O Renascimento e a valorização do homem

• A evolução das cores e pigmentos

• Grandes mestres (Da Vinci, Michelangelo, Caravaggio)', 'published', NOW(), 20, 'legacy:artes:historia'
FROM subjects s WHERE s.slug = 'artes'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Técnicas e Elementos Visuais', 'Técnicas e elementos visuais são ferramentas usadas para construir imagens: linha, forma, cor, textura, luz, perspectiva e composição. Eles orientam como uma obra conduz o olhar e cria significado.

Ao analisar uma imagem, repare em contraste, equilíbrio, direção das linhas e escolha das cores. Esses elementos afetam a interpretação.

• Teoria das Cores e Círculo Cromático

• Desenho, Perspectiva e Composição

• Pintura, Escultura e Gravura

• Fotografia e Artes Digitais', 'published', NOW(), 30, 'legacy:artes:tecnicas'
FROM subjects s WHERE s.slug = 'artes'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Movimentos Artísticos', 'Movimentos artísticos reúnem artistas e obras com ideias, estilos ou críticas semelhantes. Muitos surgem como resposta ao período anterior, propondo novas formas de representar a realidade.

Compare movimentos olhando para tema, técnica e intenção: o Realismo, o Impressionismo e o Modernismo enxergam o mundo de maneiras muito diferentes.

• Impressionismo e a luz natural

• Modernismo e as Vanguardas Europeias

• Arte Contemporânea e Conceitual

• O Modernismo no Brasil (Semana de 22)', 'published', NOW(), 40, 'legacy:artes:movimentos'
FROM subjects s WHERE s.slug = 'artes'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'O que são Ciências?', 'Ciências é o estudo do mundo natural e dos fenômenos que ocorrem ao nosso redor. Ela é dividida em várias áreas, sendo as principais: Biologia, Química e Física. 
Cada uma dessas áreas explora diferentes aspectos da natureza e nos ajuda a entender como o universo funciona.', 'published', NOW(), 10, 'legacy:ciencias:introducao'
FROM subjects s WHERE s.slug = 'ciencias'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Biologia', 'A Biologia estuda os seres vivos, suas estruturas, funções e relações com o ambiente. Ela explica como células formam organismos, como características são herdadas e como os ecossistemas se mantêm em equilíbrio.

Ao estudar Biologia, conecte cada conceito a exemplos reais: corpo humano, alimentação, doenças, plantas, animais e impactos ambientais.

• Estrutura e função das células

• Genética e hereditariedade

• Ecossistemas e meio ambiente

• Evolução e adaptação dos organismos', 'published', NOW(), 20, 'legacy:ciencias:biologia'
FROM subjects s WHERE s.slug = 'ciencias'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Química', 'A Química investiga a composição da matéria e as transformações que ocorrem quando substâncias interagem. Ela está presente em alimentos, remédios, materiais, limpeza, combustíveis e processos industriais.

Um bom ponto de partida é entender partículas, elementos e ligações químicas. Depois disso, as reações deixam de parecer fórmulas soltas.

• Elementos químicos e a tabela periódica

• Reações químicas e suas aplicações

• Propriedades dos materiais

• Química no dia a dia (alimentos, medicamentos, etc.)', 'published', NOW(), 30, 'legacy:ciencias:quimica'
FROM subjects s WHERE s.slug = 'ciencias'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Física', 'A Física busca explicar movimento, energia, forças, luz, som, eletricidade e muitos fenômenos do cotidiano. Ela ajuda a compreender por que objetos caem, como aparelhos funcionam e como energia se transforma.

Antes de usar fórmulas, identifique o fenômeno: há força? movimento? troca de energia? Essa leitura do problema guia o cálculo correto.

• Leis do movimento e forças

• Energia e suas transformações

• Ondas, luz e som

• Fenômenos elétricos e magnéticos', 'published', NOW(), 40, 'legacy:ciencias:fisica'
FROM subjects s WHERE s.slug = 'ciencias'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'O que é Filosofia?', 'Mais do que decorar nomes, a Filosofia é o exercício do pensamento crítico. 
Nesta página, exploraremos como os grandes pensadores tentaram responder às perguntas fundamentais sobre a existência, o conhecimento e a convivência humana.', 'published', NOW(), 10, 'legacy:filosofia:introducao'
FROM subjects s WHERE s.slug = 'filosofia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'História da Filosofia', 'A História da Filosofia acompanha como diferentes épocas formularam respostas para perguntas sobre verdade, justiça, conhecimento, existência e sociedade. Cada período dialoga com os problemas de seu tempo.

Ao estudar filósofos, procure entender a pergunta que eles tentavam responder. Isso torna as ideias menos abstratas e mais conectadas.

• Filosofia Antiga (Pré-socráticos, Sócrates, Platão e Aristóteles)

• Filosofia Medieval (A relação entre Fé e Razão)

• Filosofia Moderna (O surgimento do sujeito e do método científico)

• Filosofia Contemporânea (Crítica social, Existencialismo e Linguagem)', 'published', NOW(), 20, 'legacy:filosofia:historia'
FROM subjects s WHERE s.slug = 'filosofia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Ética, Moral e Política', 'Ética e Moral investigam valores, escolhas e responsabilidades. Política discute como a vida coletiva deve ser organizada, quem exerce poder e quais direitos devem ser protegidos.

Use dilemas concretos para estudar Ética: uma decisão justa nem sempre é simples, e diferentes teorias podem defender respostas diferentes.

• Diferença entre Ética e Moral

• Utilitarismo vs. Imperativo Categórico de Kant

• Contratualismo (Hobbes, Locke e Rousseau)

• Direitos Humanos e Cidadania', 'published', NOW(), 30, 'legacy:filosofia:etica'
FROM subjects s WHERE s.slug = 'filosofia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Teoria do Conhecimento (Epistemologia)', 'Epistemologia pergunta como conhecemos algo, quais são os limites da razão, qual o papel da experiência e como diferenciar opinião, crença e conhecimento justificado.

Questione a fonte das informações: evidências, método, lógica e contexto são essenciais para avaliar se uma afirmação é confiável.

• Racionalismo vs. Empirismo

• O Mito da Caverna e a busca pela verdade

• O método científico e a dúvida metódica

• Lógica: a estrutura do raciocínio correto', 'published', NOW(), 40, 'legacy:filosofia:epistemologia'
FROM subjects s WHERE s.slug = 'filosofia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'O que é Geografia?', 'A Geografia é a ciência que estuda o espaço geográfico e as interações entre o homem e o meio ambiente. 
Nesta página, você encontrará informações sobre as principais áreas do estudo da Geografia: Relevo, Clima e Hidrografia.', 'published', NOW(), 10, 'legacy:geografia:introducao'
FROM subjects s WHERE s.slug = 'geografia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Relevo', 'O relevo corresponde às formas da superfície terrestre, como montanhas, planaltos, planícies e depressões. Ele influencia moradia, transporte, agricultura, clima local e ocupação humana.

Ao estudar relevo, observe mapas físicos e associe formas do terreno aos processos que as criaram, como erosão, tectonismo e sedimentação.

• Formação do relevo

• Tipos de relevo

• Impactos do relevo na vida humana

• Principais relevos do Brasil', 'published', NOW(), 20, 'legacy:geografia:relevo'
FROM subjects s WHERE s.slug = 'geografia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Clima', 'Clima é o comportamento médio da atmosfera em uma região ao longo de muitos anos. Ele depende de fatores como latitude, altitude, massas de ar, maritimidade, relevo e vegetação.

Não confunda clima com tempo. Tempo é a condição do dia; clima é o padrão observado por longos períodos.

• Fatores que influenciam o clima

• Tipos de climas no mundo

• Impactos das mudanças climáticas

• Climas predominantes no Brasil', 'published', NOW(), 30, 'legacy:geografia:clima'
FROM subjects s WHERE s.slug = 'geografia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Hidrografia', 'A Hidrografia estuda rios, lagos, oceanos, aquíferos e bacias hidrográficas. Ela é fundamental para compreender abastecimento, energia, agricultura, transporte, biodiversidade e preservação ambiental.

Ao analisar uma bacia hidrográfica, identifique rio principal, afluentes, nascente, foz e usos humanos da água.

• Importância da água para o planeta

• Principais bacias hidrográficas

• Gestão dos recursos hídricos

• Hidrografia brasileira', 'published', NOW(), 40, 'legacy:geografia:hidrografia'
FROM subjects s WHERE s.slug = 'geografia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'O que é História?', 'A História é a ciência que estuda os acontecimentos do passado e suas influências no presente. 
Nesta página, você encontrará informações sobre as principais áreas do estudo da História: História Antiga, História Moderna e História do Brasil.', 'published', NOW(), 10, 'legacy:historia:introducao'
FROM subjects s WHERE s.slug = 'historia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'História Antiga', 'A História Antiga acompanha o surgimento das primeiras civilizações, cidades, leis, religiões, formas de governo e sistemas de escrita. Esse período mostra como sociedades complexas começaram a organizar trabalho, poder e cultura.

Compare as civilizações pelo que elas criaram: escrita, arquitetura, comércio, política, religião e formas de organização social.

• Civilizações Mesopotâmicas

• Egito Antigo

• Grécia e Roma

• Legados da História Antiga', 'published', NOW(), 20, 'legacy:historia:historia-antiga'
FROM subjects s WHERE s.slug = 'historia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'História Moderna', 'A História Moderna é marcada por expansão marítima, mudanças científicas, reformas religiosas, crescimento do comércio e fortalecimento dos Estados nacionais. É um período de transição que ajuda a explicar o mundo contemporâneo.

Observe as conexões: navegações, colonialismo, ciência, economia e poder político acontecem juntos e influenciam uns aos outros.

• Renascimento Cultural

• Revoluções Científicas

• Colonialismo e Expansão Marítima

• Revoluções Políticas', 'published', NOW(), 30, 'legacy:historia:historia-moderna'
FROM subjects s WHERE s.slug = 'historia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'História do Brasil', 'A História do Brasil analisa a formação social, econômica, política e cultural do país. Estudar esse percurso ajuda a entender desigualdades, identidades, conflitos e transformações que ainda influenciam a sociedade brasileira.

Procure relacionar cada período histórico com impactos atuais, como território, cultura, trabalho, cidadania e participação política.

• Colonização Portuguesa

• Independência do Brasil

• Período Imperial

• República e Atualidades', 'published', NOW(), 40, 'legacy:historia:historia-do-brasil'
FROM subjects s WHERE s.slug = 'historia'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Por que aprender Inglês?', 'O Inglês é a língua mais falada no mundo e essencial para comunicação global. 
Nesta página, você encontrará informações sobre as principais áreas do estudo do Inglês: Gramática, Vocabulário e Conversação.', 'published', NOW(), 10, 'legacy:ingles:introducao'
FROM subjects s WHERE s.slug = 'ingles'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Gramática', 'A Gramática em Inglês ajuda a formar frases compreensíveis e escolher tempos verbais adequados para cada situação. Ela é importante para leitura, escrita, conversação e compreensão de músicas, filmes e textos.

Comece observando a ordem das palavras. Em Inglês, a estrutura sujeito + verbo + complemento aparece com muita frequência.

• Tempos verbais (presente, passado, futuro)

• Estrutura de frases

• Pronomes e artigos

• Uso correto de preposições', 'published', NOW(), 20, 'legacy:ingles:gramatica'
FROM subjects s WHERE s.slug = 'ingles'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Vocabulário', 'Vocabulário é o repertório de palavras e expressões que permite compreender e produzir mensagens. Quanto mais palavras você reconhece em contexto, mais natural fica ler, ouvir e falar Inglês.

Aprenda palavras em frases, não isoladas. Isso ajuda a lembrar significado, uso e combinação com outras palavras.

• Palavras e expressões do dia a dia

• Falsos cognatos

• Sinônimos e antônimos

• Expansão de vocabulário com leitura', 'published', NOW(), 30, 'legacy:ingles:vocabulario'
FROM subjects s WHERE s.slug = 'ingles'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Conversação', 'Conversação desenvolve fluência, escuta ativa, pronúncia e confiança. O objetivo não é falar perfeito desde o início, mas conseguir se comunicar e melhorar com prática constante.

Pratique respostas curtas para situações reais: se apresentar, pedir informação, falar sobre rotina e expressar opinião.

• Frases úteis para situações cotidianas

• Pronúncia e entonação

• Diálogos práticos

• Dicas para melhorar a fluência', 'published', NOW(), 40, 'legacy:ingles:conversacao'
FROM subjects s WHERE s.slug = 'ingles'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Por que aprender Matemática?', 'A Matemática é a linguagem da ciência e a base para o desenvolvimento tecnológico.
Nesta página, você encontrará informações sobre as principais áreas do estudo matemático: Álgebra, Geometria e Estatística.', 'published', NOW(), 10, 'legacy:matematica:introducao'
FROM subjects s WHERE s.slug = 'matematica'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Modo Matemática Infinita', 'Resolva contas contra o relógio. Cada acerto aumenta seu tempo e sua pontuação; cada erro tira tempo. O resultado entra em um ranking local.

Jogar agora', 'published', NOW(), 20, 'legacy:matematica:modo-infinito'
FROM subjects s WHERE s.slug = 'matematica'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Álgebra', 'A Álgebra utiliza símbolos e letras para representar valores desconhecidos e relações entre grandezas. Ela aparece em problemas de dinheiro, velocidade, crescimento populacional, programação e várias situações em que precisamos transformar uma pergunta em uma expressão lógica.

Ao estudar Álgebra, tente identificar o que cada letra representa antes de resolver. Esse hábito evita erros e ajuda a montar equações com mais segurança.

• Equações de 1º e 2º grau

• Funções lineares e quadráticas

• Expressões algébricas e polinômios

• Sistemas de equações', 'published', NOW(), 30, 'legacy:matematica:algebra'
FROM subjects s WHERE s.slug = 'matematica'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Geometria', 'A Geometria estuda formas, medidas, posições e propriedades do espaço. Ela ajuda a entender desde plantas de casas e mapas até gráficos, objetos tridimensionais e cálculos usados em engenharia, design e arquitetura.

Uma boa estratégia é desenhar a situação antes de calcular. Muitos problemas ficam mais simples quando você visualiza ângulos, lados, áreas e volumes.

• Cálculo de áreas e perímetros

• Teorema de Pitágoras e Trigonometria

• Geometria espacial (volumes)

• Ângulos e propriedades de polígonos', 'published', NOW(), 40, 'legacy:matematica:geometria'
FROM subjects s WHERE s.slug = 'matematica'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Estatística e Probabilidade', 'Estatística organiza dados para transformar números soltos em informação. Probabilidade, por sua vez, mede chances e ajuda a tomar decisões quando existe incerteza, como em pesquisas, jogos, previsão do tempo e análise de resultados.

Sempre observe o conjunto de dados antes de calcular. Média, moda e mediana podem contar histórias diferentes sobre a mesma situação.

• Média, moda e mediana

• Cálculo de probabilidades

• Análise de gráficos e tabelas

• Análise combinatória', 'published', NOW(), 50, 'legacy:matematica:estatistica'
FROM subjects s WHERE s.slug = 'matematica'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'O que é a Língua Portuguesa?', 'A Língua Portuguesa é um dos idiomas mais falados no mundo e possui uma rica história e estrutura. Estudá-la é essencial para desenvolver habilidades de comunicação, leitura e escrita. 
Nesta página, você encontrará informações sobre as principais áreas do estudo da língua: Gramática, Redação e Interpretação de Textos.', 'published', NOW(), 10, 'legacy:portugues:introducao'
FROM subjects s WHERE s.slug = 'portugues'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Gramática', 'A Gramática organiza as regras de funcionamento da língua. Ela ajuda a construir frases claras, evitar ambiguidades e compreender por que certas escolhas de palavras mudam o sentido de uma mensagem.

Mais do que decorar regras, observe como elas aparecem em textos reais: notícias, redações, conversas formais e textos literários.

• Classes gramaticais (substantivos, verbos, adjetivos, etc.)

• Concordância verbal e nominal

• Uso correto da pontuação

• Ortografia e acentuação', 'published', NOW(), 20, 'legacy:portugues:gramatica'
FROM subjects s WHERE s.slug = 'portugues'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Redação', 'Redação é a habilidade de transformar ideias em texto organizado. Uma boa escrita apresenta tema, desenvolvimento e conclusão com clareza, conectando argumentos de forma lógica e convincente.

Antes de escrever, faça um pequeno planejamento: tese, argumentos principais e exemplos. Isso reduz repetição e melhora a coerência.

• Estrutura de textos (introdução, desenvolvimento e conclusão)

• Coesão e coerência textual

• Tipos de textos (narrativos, dissertativos, descritivos, etc.)

• Dicas para melhorar a escrita', 'published', NOW(), 30, 'legacy:portugues:redacao'
FROM subjects s WHERE s.slug = 'portugues'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;

INSERT INTO materials (teacher_id, subject_id, title, content, status, published_at, display_order, legacy_key)
SELECT NULL, s.id, 'Interpretação de Textos', 'Interpretação de textos envolve localizar informações, perceber ideias implícitas e relacionar linguagem, contexto e intenção do autor. Essa habilidade é essencial em provas, leitura crítica e comunicação diária.

Leia procurando pistas: título, palavras repetidas, conectivos, tom do texto e relação entre os parágrafos.

• Identificação de ideias principais e secundárias

• Leitura crítica e reflexiva

• Reconhecimento de figuras de linguagem

• Estratégias para melhorar a compreensão', 'published', NOW(), 40, 'legacy:portugues:interpretacao'
FROM subjects s WHERE s.slug = 'portugues'
ON CONFLICT (legacy_key) WHERE legacy_key IS NOT NULL DO NOTHING;
