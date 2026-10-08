# BitAcademy

Portal de aprendizado com disciplinas, materiais, quizzes e jogos. O projeto usa páginas HTML/CSS/JavaScript, funções serverless Node.js na Vercel e PostgreSQL hospedado no Neon.

## Funcionalidades

- Catálogo de disciplinas carregado do banco de dados e páginas de conteúdo por disciplina.
- Materiais de estudo publicados pelos professores, com suporte a rascunhos e links complementares.
- Oito quizzes temáticos e o jogo Matemática Infinita, com resultados e rankings.
- Cadastro e login com sessão autenticada e senha armazenada como hash.
- Perfis de **Aluno**, **Professor** e **Administrador**, com páginas e navegação de acordo com o papel.
- Perfil do aluno com histórico de quizzes, pontuação, rankings e atividades disponibilizadas pelos professores.
- Área do professor para consultar disciplinas vinculadas, criar/editar materiais e cadastrar atividades.
- Painel administrativo para gerenciar usuários, redefinir senhas, editar disciplinas, vincular professores e cadastrar/editar/remover quizzes e jogos.
- Recursos interativos associados a uma disciplina por um caminho de HTML já existente no projeto.
- Layout responsivo para celular e computador.

## Tecnologias

- HTML, CSS e JavaScript no cliente.
- Node.js 20 ou superior nas funções de API.
- PostgreSQL no Neon, acessado por `@neondatabase/serverless`.
- Vercel para hospedar páginas estáticas e funções serverless.
- `bcryptjs` para hash de senha e `jsonwebtoken` para sessões.

## Estrutura

O código da aplicação está na pasta `Bitacademy/`:

```text
Bitacademy/
├── api/                 # autenticação, dados acadêmicos, perfil e administração
├── database/            # esquema e scripts SQL
├── Jogos/               # jogos HTML/JavaScript
├── Quiz/                # quizzes HTML/JavaScript
├── lib/                 # conexão Neon e autenticação de sessão
├── Bitacademy.html      # página inicial
├── materia.html         # página dinâmica de disciplina
├── professor.html       # área do professor
├── admin.html           # área administrativa
└── package.json
```

## Preparar o banco Neon

Crie um banco PostgreSQL no [Neon](https://neon.tech/) e abra o SQL Editor do projeto. Execute os arquivos abaixo nesta ordem:

1. `Bitacademy/database/schema.sql` — cria usuários, disciplinas, vínculos de professores, tentativas de quiz e pontuações de jogos.
2. `Bitacademy/database/admin-migration.sql` — habilita o papel Administrador e `auth_version`. O script pode ser executado novamente com segurança.
3. `Bitacademy/database/academic.sql` — cria materiais, atividades e cadastro de recursos HTML; também pré-cadastra os quizzes e o jogo que já estão no repositório.
4. `Bitacademy/database/legacy-subject-content.sql` — importa para o banco os textos das páginas originais das disciplinas.

Os scripts 2 a 4 são idempotentes conforme indicado em cada arquivo. Se o banco já estiver configurado, execute as atualizações necessárias; para habilitar os recursos e jogos documentados aqui, execute a versão atualizada de `academic.sql`.

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

1. Na página inicial, abra **Entrar** e crie uma conta de aluno ou professor. O cadastro público não cria administradores.
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
3. Acesse um quiz ou o jogo Matemática Infinita. O perfil mostra os resultados associados à conta.
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

## Publicação na Vercel

Importe o repositório na Vercel e configure o **Root Directory** como `Bitacademy`. Cadastre `DATABASE_URL` e `JWT_SECRET` nas variáveis de ambiente dos ambientes desejados e publique. O arquivo `vercel.json` direciona a raiz do site para `Bitacademy.html`.

## Equipe

- Rodrigo Cernigoi
- Arthur Fita
- David Almeida
- Gabriel Duarte
- Gabriel de Jesus

Projeto acadêmico sem fins comerciais.
