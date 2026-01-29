export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nova funcionalidade
        'fix', // Correção de bug
        'docs', // Documentação
        'style', // Formatação (não afeta código)
        'refactor', // Refatoração de código
        'perf', // Melhorias de performance
        'test', // Adição/correção de testes
        'build', // Alterações no build
        'ci', // Alterações no CI/CD
        'chore', // Tarefas gerais (deps, configs)
        'revert', // Reverter commit anterior
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
}
