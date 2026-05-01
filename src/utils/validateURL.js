export const validateURL = (value) => {
  /**
   *  Expressão para validação de URL baseada em RFC 1035 / RFC 6570
   *
   *  Estrutura: <protocolo>://<subdomíno.domínio | domínio>/<file_path | resource path>
   *
   *  Para manter os requisitos de segurança, essa expressão regular permite apenas arquivos
   *  com extensão de arquivos de imagem permitidos e possui uma exceção para o
   *  domínio https://encrypted-tbn0.gstatic.com/images
   *
   *  Estrutura da expressão:
   *  - Schema/Procolo HTTP | HTTPS: ^(http[s]?:\/{2})
   *  - Domínio: ((?!.{254,})(?:(?!-)(?:xn--[A-Za-z0-9-]{1,59}|(?!xn--)[A-Za-z0-9-]{1,63})(?<!-)\.)+(?:xn--[A-Za-z0-9-]{1,59}|[A-Za-z]{2,63}))
   *  - Recurso (Path): ((\/)(images\?q=\w+:[A-Za-z0-9&-]+)
   *  - Arquivo no padrão da CDN do Google: ((\/)((images\?q=\w+:[A-Za-z0-9&-]+)
   *  - Ou extensão do arquivo de image: |(([A-Za-z0-9-_,:./=]{1,59}))+(\.)(png|jpg|jpeg|webp)(\?[wh]=[0-9]{2,4})?))$
   *
   */

  const allowedProtocolsRegExp =
    /^((http[s]?:\/{2})((?!.{254,})(?:(?!-)(?:xn--[A-Za-z0-9-]{1,59}|(?!xn--)[A-Za-z0-9-]{1,63})(?<!-)\.)+(?:xn--[A-Za-z0-9-]{1,59}|[A-Za-z]{2,63})))((\/)((images\?q=\w+:[A-Za-z0-9&-]+)|(([A-Za-z0-9-_,:./=]{1,59}))+(\.)(png|jpg|jpeg|webp)(\?[wh]=[0-9]{2,4})?))$/

  const isURLValid = allowedProtocolsRegExp.test(value)

  return isURLValid
}
