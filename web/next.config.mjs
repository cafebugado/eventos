import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Repo contém o app Vite legado na raiz (com seu próprio lockfile) enquanto
  // esta migração está em andamento — fixamos a raiz para não inferir errado.
  turbopack: {
    root: dirname,
  },
}

export default nextConfig
