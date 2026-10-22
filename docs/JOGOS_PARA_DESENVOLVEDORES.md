# Desenvolvimento de jogos por disciplina

Este guia é para quem implementa jogos no BitAcademy. Ele cobre a página do jogo, o cadastro para uma disciplina e a integração obrigatória com a pontuação e o ranking.

## Como a integração funciona

O código executável de um jogo fica no repositório, em `Bitacademy/Jogos/`. O painel administrativo apenas cadastra o título, a descrição, a disciplina, o tipo `Jogo` e o caminho do HTML. A página dinâmica da disciplina lê esse cadastro e mostra o link aos alunos.

O navegador apresenta a partida e envia ações do jogador. A API deve validar as ações e calcular o resultado no servidor. A tabela `game_scores` guarda o recorde. O navegador nunca deve escolher nem enviar o total de pontos que será gravado.

## Pontuação obrigatória

Todo jogo ranqueado precisa calcular e persistir um campo inteiro `score` ao encerrar a partida. A tabela `game_scores` exige esse campo (`NOT NULL`) e aceita apenas valores iguais ou maiores que zero. No fluxo atual, resultados com zero pontos não são gravados; portanto, uma partida ranqueada precisa terminar com `score > 0` para aparecer no ranking.

O ranking mantém somente o melhor resultado de cada conta por modo de jogo. `game_mode` é um identificador estável e exclusivo do jogo, como `math-infinite`. Em caso de empate, o fluxo atual compara acertos e depois melhor sequência. Ao criar um jogo, defina como calcular esses critérios ou ajuste explicitamente a ordenação para as métricas adequadas ao novo jogo.

**Regra de segurança:** não aceite `score`, `correct_answers`, `duration_seconds` ou outros totais enviados pelo cliente como resultado final. O servidor deve derivar esses valores do estado da partida que ele próprio armazenou e validou.

## Limitação atual

A implementação atual de `api/games.js` e `game_sessions` aceita apenas o modo `math-infinite`, com questões aritméticas geradas e respostas verificadas pelo servidor. Cadastrar outro HTML como jogo no painel faz o link aparecer na disciplina, mas não cria automaticamente uma sessão validada nem um ranking para esse jogo.

Para ranquear um jogo novo, implemente sua validação no servidor e estenda a API e o armazenamento de sessões para o seu modo. Não reutilize o endpoint atual enviando a pontuação final pelo navegador.

## Passos para adicionar um jogo

1. **Defina as regras.** Escolha a disciplina, identificador `game_mode` (até 50 caracteres, minúsculo e com hífens), título, objetivo, regras de pontuação, condição de término e critérios de desempate. O modo deve permanecer estável depois da publicação, pois é a chave do recorde.
2. **Implemente a sessão no servidor.** Crie uma ação para iniciar a partida e retornar um identificador de sessão e os dados necessários para a primeira jogada. Guarde no servidor a identidade do aluno, modo, estado válido, progresso, limites de tempo, resultado parcial e revisão/nonce contra reenvios.
3. **Valide cada jogada.** Autentique o usuário em todas as ações, confirme que a sessão pertence a ele e está ativa, valide entrada e sequência de ações, aplique limites de tempo no servidor e atualize o estado de forma atômica. Requisições repetidas não podem conceder pontos duas vezes.
4. **Finalize no servidor.** Calcule o `score` a partir dos dados verificados. Grave também as métricas usadas nos desempates e a duração. Grave o recorde em `game_scores` com o `game_mode` e título corretos. Preserve o índice único por usuário e modo e atualize somente quando o novo resultado for melhor.
5. **Adicione o modo ao ranking.** Permita o modo na consulta de ranking da API e exponha `getGameRanking(mode, limite)` na interface do cliente se ainda não estiver disponível. A consulta deve ordenar por pontuação e pelos desempates definidos e retornar apenas partidas de contas registradas.
6. **Adapte o banco.** Atualize `game_sessions` ou crie armazenamento específico para o novo estado. A restrição atual `game_sessions_mode_check` permite somente `math-infinite`; altere-a por uma migração versionada para incluir o novo modo, ou use uma tabela específica. Não edite apenas o SQL original esperando que bancos já implantados sejam atualizados.
7. **Crie a interface.** Adicione `Jogos/<slug>.html`, JavaScript e CSS. A interface pode exibir o estado retornado pelo servidor, coletar ações e apresentar feedback. Ela não deve decidir qual resposta está correta nem enviar o total final de pontos para persistência.
8. **Cadastre na disciplina.** Publique os arquivos e a API atualizada. No painel administrativo, em **Quizzes e jogos**, selecione a disciplina, tipo **Jogo**, preencha título e descrição e informe um caminho relativo à raiz do site, por exemplo `Jogos/meu-jogo.html`.

## Contrato recomendado para a API

Cada jogo deve ter ações equivalentes a estas, usando nomes e payloads específicos conforme as regras:

| Ação | Entrada do cliente | Resultado do servidor |
| --- | --- | --- |
| Iniciar | modo do jogo | ID da sessão, estado inicial e primeiro desafio |
| Jogar | ID da sessão, ação do jogador e versão atual | Aceitação/rejeição, feedback seguro, próximo desafio e estado atualizado |
| Finalizar | ID da sessão | Estado final calculado, `score`, métricas e indicação de recorde atualizado |
| Abortar | ID da sessão | Confirmação de encerramento sem registrar resultado ranqueado |
| Ranking | modo e limite | Lista ordenada de melhores pontuações |

Esse contrato é uma orientação, não um endpoint genérico já implementado. A API atual possui ações `start`, `answer`, `finish` e `abort`, mas a lógica e o esquema são específicos de Matemática Infinita. Antes de usar esses nomes em outro jogo, implemente a validação e a persistência próprias do modo.

## Referência existente

Use Matemática Infinita como exemplo de fluxo servidor-autoritativo:

- Página: `Bitacademy/Jogos/matematica-infinita.html`
- Cliente: `Bitacademy/Jogos/matematica-infinita.js`
- API e cálculo: `Bitacademy/api/games.js`
- Chamadas autenticadas do navegador: `Bitacademy/auth.js`
- Esquema e índice de melhores resultados: `Bitacademy/database/schema.sql` e `Bitacademy/database/ranking-best-results.sql`

O exemplo mostra questões geradas no servidor, resposta validada contra a sessão, atualização condicional por revisão e persistência apenas do melhor resultado por usuário e modo.
