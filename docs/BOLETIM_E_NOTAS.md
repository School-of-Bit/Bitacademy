# Boletim, notas e períodos letivos

## Modelo adotado

Cada aluno tem matrícula em uma turma de um ano letivo. A turma recebe ofertas de disciplina, cada uma atribuída a um professor. O professor cria avaliações para um período e registra a nota de cada matrícula. A escala do sistema é de 0 a 10.

Períodos são registros configuráveis, com nome, datas, sequência e peso. Não há quantidade fixa de períodos: a escola pode cadastrar bimestres, trimestres, semestres ou períodos próprios. Os pesos são relativos; os cálculos normalizam a soma dos pesos disponíveis.

## Cálculos

1. **Média do período:** média ponderada das avaliações regulares com nota registrada, usando o peso de cada avaliação.
2. **Recuperação do período:** pode manter a maior nota entre média e recuperação ou calcular a média entre elas. A política é escolhida ao configurar o ano letivo.
3. **Média anual:** média ponderada das médias dos períodos, usando o peso cadastrado para cada período.
4. **Recuperação final:** quando todas as médias de período estiverem fechadas, pode manter a maior nota entre média anual e recuperação final ou calcular a média entre elas.
5. **Situação:** compara o resultado final com a média de aprovação definida no ano letivo. Se a média estiver abaixo do limite e o ano continuar aberto, o boletim sinaliza recuperação final pendente quando ainda não houver nota de recuperação.

Notas ainda não lançadas ficam em branco. O sistema impede encerrar um período quando uma turma com ofertas ativas não tem avaliação regular publicada ou há nota pendente em alguma avaliação publicada. O professor pode corrigir notas publicadas enquanto o período estiver aberto; as alterações ficam na tabela `grade_change_log`.

## Configuração inicial

1. Execute `Bitacademy/database/gradebook.sql` depois de `schema.sql`, `admin-migration.sql` e `academic.sql` no banco Neon.
2. No painel administrativo, crie o ano letivo e configure sua média mínima e políticas de recuperação.
3. Cadastre todos os períodos com datas, ordem e peso. Os intervalos não podem se sobrepor e devem ficar dentro das datas do ano.
4. Crie turmas para esse ano e matricule cada aluno em uma turma.
5. Atribua disciplinas e professores às turmas. O professor precisa já ter vínculo com a disciplina no painel.
6. O professor acessa **Boletim e notas**, cria avaliações, lança notas e publica as avaliações para os alunos.
7. O administrador encerra cada período depois de concluídas as notas. Quando todos estiverem fechados, o sistema calcula a média anual e o professor pode lançar a recuperação final.
8. O aluno consulta o boletim na página **Meu Perfil**.

## Regras de acesso

- Administradores configuram anos, períodos, turmas, matrículas e ofertas de disciplinas.
- Professores só veem suas próprias ofertas e só lançam notas de matrículas da turma correspondente.
- Alunos consultam apenas boletins ligados às suas próprias matrículas e avaliações publicadas.
- Notas, médias escolares, recordes de quiz e pontuações de jogos são dados separados. O ranking do melhor resultado não substitui uma nota de avaliação.
