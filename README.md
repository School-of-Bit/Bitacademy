# BitAcademy

Portal de aprendizado com disciplinas, materiais, quizzes e jogos. O projeto usa páginas HTML/CSS/JavaScript, funções serverless Node.js na Vercel e PostgreSQL hospedado no Neon.

## Funcionalidades

- Catálogo de disciplinas carregado do banco de dados e páginas dinâmicas de conteúdo por disciplina (`materia.html?slug=...`).
- Materiais de estudo publicados pelos professores, com suporte a rascunhos, links complementares e tempo estimado de leitura.
- **8 quizzes temáticos** e **8 jogos educativos competitivos** (1 por disciplina: *Matemática Infinita*, *Termo Escolar*, *Word Match Bilíngue*, *Antes ou Depois?*, *GeoRadar*, *Lab Relâmpago*, *Estúdio Cromático* e *Oráculo Filosófico*), com ranking oficial nos quizzes e em Matemática Infinita; os outros sete jogos funcionam em modo treino.
- Cadastro e login guiados com validação por campo, medidor de força de senha, checklist em tempo real, detector de Caps Lock, sessão autenticada e senha armazenada como hash.
- Perfis de **Aluno**, **Professor** e **Administrador**, com avatares dinâmicos via **DiceBear API**, navegação adaptada ao papel e identidade visual própria (logos oficiais, Lucide Icons, tipografia 3-níveis e animações fluidas).
- Perfil do aluno com visão geral gamificada, recordes nos quizzes e jogos, **Boletim Escolar** detalhado com exportação em **PDF** e área de **Atividades & Entregas** (envio de texto/link, feedbacks e notas sincronizadas).
- Área do professor com gestão de materiais, criação/edição/exclusão de atividades (manuais ou com correção automática via Quiz), **Mesa de Correção**, **Pauta da Turma**, **Diário de Notas**, **Histórico de Alterações** e exportação **CSV**.
- Boletim escolar com anos letivos, períodos de duração e peso configuráveis, componentes avaliativos (soma 100%), turmas, matrículas, notas, recuperações de período/final e média anual.
- Painel administrativo para gerenciar usuários, redefinir senhas, editar disciplinas, vincular professores, cadastrar recursos interativos e acompanhar o **Conselho de Classe** (visão consolidada das turmas com exportação CSV).
- Layout responsivo para celular e computador.

## Tecnologias

- HTML, CSS e JavaScript no cliente (ícones **Lucide**, animações **BitAcademyMotion**, fontes *Space Grotesk*, *Plus Jakarta Sans* e *JetBrains Mono*, e avatares via **DiceBear API**).
- Node.js 20 ou superior nas funções serverless de API.
- PostgreSQL no Neon, acessado por `@neondatabase/serverless`.
- Vercel para hospedar páginas estáticas e funções serverless.
- `bcryptjs` para hash de senha e `jsonwebtoken` para sessões.

## Estrutura

O código da aplicação está na pasta `Bitacademy/`:

```text
Bitacademy/
├── api/                 # autenticação, dados acadêmicos, boletim, quizzes, jogos, perfil e admin
├── assets/logos/        # identidade visual oficial (logo-mark, favicon e banner)
├── database/            # esquema e migrações SQL idempotentes
├── Jogos/               # Matemática Infinita e motor arcade multi-matérias (jogo.html)
├── Quiz/                # quizzes temáticos HTML/JavaScript
├── lib/                 # conexão Neon e autenticação de sessão
├── Bitacademy.html      # página inicial e Arena de Prática
├── login.html           # login e cadastro guiados
├── materia.html         # página dinâmica de disciplina
├── perfil.html          # perfil do aluno, boletim e entregas de atividades
├── professor.html       # área do professor (materiais, atividades e boletim)
├── admin.html           # painel administrativo e conselho de classe
├── sobre-mim.html       # página institucional e equipe
└── package.json
```

## Preparar o banco Neon

Crie um banco PostgreSQL no [Neon](https://neon.tech/) e abra o SQL Editor do projeto. Execute os arquivos abaixo nesta ordem:

1. `Bitacademy/database/schema.sql` — cria usuários, disciplinas, vínculos de professores, tentativas de quiz e pontuações de jogos.
2. `Bitacademy/database/ranking-best-results.sql` — remove registros anônimos e duplicados, prepara um único recorde por usuário, disciplina e modo de jogo e cria a tabela de sessões validadas do jogo.
3. `Bitacademy/database/admin-migration.sql` — habilita o papel Administrador e `auth_version`. O script pode ser executado novamente com segurança.
4. `Bitacademy/database/academic.sql` — cria materiais, atividades e cadastro de recursos HTML; também pré-cadastra os 8 quizzes e os 8 jogos do repositório.
5. `Bitacademy/database/legacy-subject-content.sql` — importa para o banco os textos das páginas originais das disciplinas.
6. `Bitacademy/database/gradebook.sql` — cria anos letivos, períodos, componentes avaliativos, turmas, matrículas, ofertas de disciplinas, avaliações, notas e trilha de alterações (`grade_change_log`).
7. `Bitacademy/database/activities-gradebook.sql` — cria a tabela de entregas de atividades (`activity_submissions`) e integra atividades manuais e automáticas às avaliações do boletim.

8. `Bitacademy/database/security-upgrade.sql` — adiciona controle de tentativas de login e rodadas de quiz consumidas.

Os scripts 2 a 8 são idempotentes e podem ser executados novamente conforme indicado em cada arquivo. Em bancos já configurados, execute `academic.sql`, `gradebook.sql` e `activities-gradebook.sql` para aplicar os novos jogos, componentes avaliativos e entregas de atividades.

## Rodar localmente

As páginas dependem das APIs e do banco. Abrir `Bitacademy.html` diretamente pelo navegador (`file://`) não executa as funções serverless; rode o projeto com a CLI da Vercel.

1. Instale [Node.js 20+](https://nodejs.org/) e a CLI da Vercel:

   ```bash
   npm install --global vercel
   ```

2. No terminal, entre na pasta da aplicação e instale as dependências:

   ```bash
   cd Bitacademy
   npm install
   ```

3. Crie `Bitacademy/.env.local` com a URL do Neon e um segredo aleatório para a sessão:

   ```dotenv
   DATABASE_URL=postgresql://USUARIO:SENHA@HOST/BANCO?sslmode=require
   JWT_SECRET=COLOQUE_UM_SEGREDO_LONGO_E_ALEATORIO
   ```

   Use a connection string disponibilizada pelo Neon. Para gerar um valor para `JWT_SECRET`, rode `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` e copie o resultado. Não compartilhe nem envie `.env.local` ao Git.

4. Inicie o servidor local, ainda dentro de `Bitacademy/`:

   ```bash
   vercel dev
   ```

5. Abra o endereço informado pela CLI, normalmente `http://localhost:3000`.

## Primeiro acesso e perfis

1. Na página inicial, abra **Entrar** e crie uma conta de aluno. Contas de professor são criadas por um administrador no painel.
2. Para criar o primeiro administrador, promova uma conta confiável pelo SQL Editor do Neon, substituindo o e-mail:

   ```sql
   UPDATE users
   SET account_type = 'Administrador'
   WHERE email = 'seu-email@exemplo.com';
   ```

3. Saia e entre novamente com essa conta. O perfil e a página inicial mostrarão o link para o painel administrativo.
4. No painel, vincule disciplinas aos professores. O professor poderá então abrir **Área do Professor** e publicar conteúdos nelas.

## Ver as funcionalidades

### Aluno

1. Entre com uma conta de aluno.
2. Na página inicial, escolha uma disciplina. A página dinâmica reúne os textos importados, materiais publicados e recursos interativos cadastrados.
3. Entre na conta antes de responder quizzes ou jogar Matemática Infinita para registrar seus recordes. Os outros jogos funcionam em modo treino.
4. Consulte no perfil as atividades cadastradas pelos professores.

### Professor

1. Peça a um administrador para vincular uma ou mais disciplinas à conta de professor.
2. Abra **Área do Professor** pelo menu de perfil ou pelo endereço `professor.html`.
3. Selecione uma disciplina e use as abas de materiais e atividades. Um material em rascunho não aparece para os alunos; altere a visibilidade para **Publicado** para disponibilizá-lo.

### Administrador

1. Entre com a conta promovida no banco.
2. Abra **Painel administrativo** pelo perfil ou pelo endereço `admin.html`.
3. Use as seções para gerenciar professores e disciplinas, editar usuários, definir uma nova senha e manter o catálogo de disciplinas.
4. Em **Quizzes e jogos**, associe título, descrição, tipo e disciplina a um caminho como `Quiz/quiz-historia.html` ou `Jogos/meu-jogo.html`.

O cadastro administrativo aponta para um arquivo HTML que já faz parte do projeto. Para disponibilizar um jogo novo, primeiro adicione o HTML e seus arquivos JavaScript/CSS ao repositório e publique a versão; depois cadastre o caminho no painel. O conteúdo dos materiais de estudo é armazenado no banco, enquanto o código executável dos jogos permanece como arquivo do projeto.

Para implementar jogos ranqueados com pontuação validada no servidor, consulte [`docs/JOGOS_PARA_DESENVOLVEDORES.md`](docs/JOGOS_PARA_DESENVOLVEDORES.md). O painel registra o acesso ao arquivo, mas cada novo modo requer integração própria com a API e o armazenamento de sessões.

A configuração e as regras do boletim estão em [`docs/BOLETIM_E_NOTAS.md`](docs/BOLETIM_E_NOTAS.md). Em bancos já configurados, execute novamente `Bitacademy/database/gradebook.sql` no Neon para criar as tabelas dos componentes avaliativos e associá-las às avaliações existentes.

## Publicação na Vercel

Importe o repositório na Vercel e configure o **Root Directory** como `Bitacademy`. Cadastre `DATABASE_URL` e `JWT_SECRET` (ou `JWT_SECRET_KEY`) nas variáveis de ambiente dos ambientes desejados e publique novamente após alterar os valores. Vercel aplica as variáveis atualizadas somente a novos deployments; selecione os ambientes corretos (Production/Preview) e redeploy. Use o mesmo segredo estável em todas as funções e ambientes que precisam validar a mesma sessão. Alterar esse segredo invalida os cookies de sessão existentes. O arquivo `vercel.json` direciona a raiz do site para `Bitacademy.html`.

## Equipe

- Rodrigo Cernigoi
- Arthur Fita
- David Almeida
- Gabriel Duarte
- Gabriel de Jesus

Projeto acadêmico sem fins comerciais.

## Atualização de segurança

Veja [o guia de atualização](docs/MELHORIAS_SEGURANCA.md), com migração, testes e limitações.
