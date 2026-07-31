/* eslint-disable no-undef */
import path from 'node:path'

// Config em JS (em vez de .lintstagedrc JSON) porque o repo passou a ter dois
// projetos com stacks/ESLint configs independentes durante a migração para
// Next.js: o app Vite legado na raiz e o novo app em web/. Cada grupo de
// arquivos precisa rodar com o eslint/prettier do seu próprio projeto.
// lint-staged passa caminhos absolutos, por isso comparamos pelo caminho
// relativo à raiz do repositório.
const isWebFile = (file) => {
  const relative = path.relative(process.cwd(), file)
  return relative.split(path.sep)[0] === 'web'
}

const quote = (files) => files.map((file) => `"${file}"`).join(' ')

export default {
  '*.{js,jsx}': (filenames) => {
    const rootFiles = filenames.filter((file) => !isWebFile(file))
    const webFiles = filenames.filter(isWebFile)
    const commands = []

    if (rootFiles.length > 0) {
      commands.push(`eslint --fix ${quote(rootFiles)}`, `prettier --write ${quote(rootFiles)}`)
    }
    if (webFiles.length > 0) {
      // Usa o eslint/prettier instalados dentro de web/ (versões e config
      // próprias) em vez dos da raiz — evita quebrar a resolução interna
      // de parser/plugins do eslint-config-next.
      commands.push(
        `pnpm --dir web exec eslint --fix ${quote(webFiles)}`,
        `pnpm --dir web exec prettier --write ${quote(webFiles)}`
      )
    }
    return commands
  },
  '*.{json,css,md}': ['prettier --write'],
}
