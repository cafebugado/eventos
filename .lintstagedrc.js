/* eslint-disable no-undef */
import path from 'node:path'

// Config em JS (em vez de .lintstagedrc JSON) porque o repo so tem eslint/prettier
// instalados dentro de web/ (a raiz so tem tooling de git hooks: husky, lint-staged,
// commitlint). Tudo roda via `pnpm --dir web exec`, independente de onde o arquivo
// staged esteja. lint-staged passa caminhos absolutos, por isso comparamos pelo
// caminho relativo a raiz do repositorio.
const isWebFile = (file) => {
  const relative = path.relative(process.cwd(), file)
  return relative.split(path.sep)[0] === 'web'
}

const quote = (files) => files.map((file) => `"${file}"`).join(' ')

export default {
  '*.{js,jsx}': (filenames) => {
    const webFiles = filenames.filter(isWebFile)
    const otherFiles = filenames.filter((file) => !isWebFile(file))
    const commands = []

    if (webFiles.length > 0) {
      commands.push(
        `pnpm --dir web exec eslint --fix ${quote(webFiles)}`,
        `pnpm --dir web exec prettier --write ${quote(webFiles)}`
      )
    }
    // Arquivos .js fora de web/ (ex: commitlint.config.js) sao config simples
    // de Node — so formatacao, sem rodar o eslint-config-next contra eles.
    if (otherFiles.length > 0) {
      commands.push(`pnpm --dir web exec prettier --write ${quote(otherFiles)}`)
    }
    return commands
  },
  '*.{json,css,md}': (filenames) => [`pnpm --dir web exec prettier --write ${quote(filenames)}`],
}
