# BitAcademy — atualização de segurança e manutenção

Esta versão foi preparada a partir do ZIP original. O HTML, CSS, banco e arquitetura serverless foram mantidos. Não houve deploy nem alteração do seu banco real.

## Instalação

1. Faça backup do projeto e do banco Neon. Trabalhe em uma branch de teste.
2. No SQL Editor do Neon, execute `Bitacademy/database/security-upgrade.sql` **depois** das migrações já existentes. Para um banco novo, siga toda a ordem do README.
3. Substitua os arquivos da aplicação em conjunto (a API, o quiz e os scripts novos dependem uns dos outros). Mantenha suas variáveis `DATABASE_URL` e `JWT_SECRET` ou `JWT_SECRET_KEY` existentes. Não coloque segredos no Git.
4. Na pasta `Bitacademy`, execute `npm install`, `npm test` e `vercel dev`. Faça os testes manuais abaixo antes de publicar.

## O que mudou

| Área | Arquivos | Alteração |
| --- | --- | --- |
| Login | `api/auth/login.js`, `lib/login-rate-limit.js`, `database/security-upgrade.sql` | Janela de 15 minutos, 10 tentativas por e-mail, 60 por IP quando disponível em fonte confiável. Conta também logins bem-sucedidos. Retorno 429 e Retry-After. Estado compartilhado entre funções serverless no PostgreSQL. |
| Quiz | `api/quizzes.js`, `Quiz/quiz.js`, `Quiz/quiz.css`, `auth.js` | Banco de 64 questões no código da API (8 por disciplina). Cinco por rodada, ordem de questões e opções aleatória, token assinado de 30 minutos vinculado à sessão e à disciplina. Correção e gabarito ao final; rodada autenticada consumida uma vez. Visitantes podem praticar sem gravar notas. Ranking compara percentuais, depois quantidade de questões, preservando recordes anteriores. |
| Atividades | `api/academic.js`, `api/quizzes.js`, `js/profile.js` | Validação do prazo usando relógio do banco, rejeição de entrega manual em atividade automática, checagem de matrícula e proteção contra sobrescrever entrega já corrigida. A interface bloqueia novos envios fora do prazo. A sincronização automática do quiz ignora atividades vencidas ou com avaliação encerrada. |
| Jogos | `api/games.js`, `Jogos/jogos-arcade.js`, `Jogos/jogo.html`, `api/profile.js` | Bloqueia registro direto de pontos. Sete arcades continuam jogáveis em treino; ranking de Matemática Infinita segue ativo. Recordes históricos dos arcades não são apagados, mas ficam ocultos do ranking e perfil. |
| Organização | `js/icons.js`, `js/motion.js`, `js/profile.js`, `auth.js`, páginas HTML | Separa ícones, animações e perfil/boletim do núcleo de autenticação. |
| Testes | `tests/security.test.js`, `package.json` | 11 testes de regressão com Node Test Runner e dependências simuladas. |

## Testes manuais em ambiente de homologação

- Login: faça 10 tentativas válidas de formato com a mesma conta de teste e verifique que a 11ª responde 429. Confirme expiração após 15 minutos. Use conta própria de teste e valide o cabeçalho de IP na Vercel.
- Quiz: teste as oito disciplinas, como visitante e como aluno. Confirme cinco questões, ausência de gabarito na resposta inicial da API, correção ao finalizar, ranking, recordes e rejeição de reenvio. Confira que o servidor usa o resultado da rodada, não o recorde anterior, ao sincronizar notas.
- Atividades: crie uma atividade manual futura e outra vencida. Teste a primeira entrega, reenvio após prazo, atividade já corrigida e tentativa fora da turma. Repita para quiz automático com prazo futuro e passado.
- Jogos: jogue os oito modos e confirme que apenas Matemática Infinita grava recordes oficiais. Verifique navegação e perfil.
- Perfis: teste aluno, professor e administrador, abas de perfil, boletim, exportação, ícones, animações e páginas em celular.
- Banco: confirme que a migração é idempotente e não apagou registros anteriores. Faça testes concorrentes reais de login, entrega e finalização de quiz.

## Limites e próximos passos

- **Arcades:** não foi feita a migração das sete mecânicas para sessões de servidor. O bloqueio é provisório e intencional. A documentação de jogos explica o contrato para restaurar rankings com pontuação calculada pelo servidor. Não reabilite `record` para aceitar totais do cliente.
- **Quizzes:** o banco está no código do servidor, não em tabela editável pelo professor. O token é assinado, não criptografado; não inclui as respostas, mas inclui índices. O gabarito após o fim, tentativas ilimitadas de prática e o código-fonte (se o repositório for público) permitem memorizar questões. Serve para fixação e ranking recreativo, não para uma prova de alto impacto. Para avaliações formais, criar banco privado por avaliação, tentativas limitadas, controle de publicação e liberação tardia do gabarito.
- As regras acadêmicas anteriores de aproveitamento da melhor nota e sincronização por disciplina foram mantidas. O consumo da rodada, o recorde e a sincronização de notas são operações distintas: uma falha de banco intermediária pode exigir nova rodada e revisão da sincronização. As notas anteriores não foram auditadas.
- **Login:** limites são escolhas iniciais, não valores universais. Um terceiro pode esgotar a cota de um e-mail; considere proteção adicional no edge, CAPTCHA adaptativo ou autenticação multifator. Em produção configure limpeza periódica das linhas expiradas conforme comentários no SQL. Os hashes de e-mail/IP são pseudônimos, não anonimização completa.
- A validação de prazo utiliza a data/hora do PostgreSQL e não depende do relógio do aluno. Alterações concorrentes no estado acadêmico precisam de testes reais e podem exigir bloqueios transacionais mais fortes.
- O pacote foi verificado com Node.js 22 (`node --check` e `npm test`). Não houve instalação das dependências externas, execução SQL no Neon, teste criptográfico real do JWT, teste de navegador nem deploy. Os testes simulam SQL e autenticação, não comprovam integração real. Valide tudo em homologação antes de usar com estudantes.
