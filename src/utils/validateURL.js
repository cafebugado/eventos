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
   *  - Recurso (Path): ((\/)([A-Za-z0-9-_,:./=]+)
   *  - Extensão do arquivo de image: (\.)(png|jpg|jpeg|webp)(\?[wh]=[0-9]{2,4})?
   *  - Arquivo no padrão da CDN do Google: |(\/)(images\?q=\w+:[A-Za-z0-9&-]+))$
   *
   */

  const allowedProtocolsRegExp =
    /^(http[s]?:\/{2})((?!.{254,})(?:(?!-)(?:xn--[A-Za-z0-9-]{1,59}|(?!xn--)[A-Za-z0-9-]{1,63})(?<!-)\.){1,}(?:xn--[A-Za-z0-9-]{1,59}|[A-Za-z]{2,63}))((\/)([A-Za-z0-9-_,:./=]+)(\.)(png|jpg|jpeg|webp)(\?[wh]=[0-9]{2,4})?|(\/)(images\?q=\w+:[A-Za-z0-9&-]+))$/

  const isURLValid = allowedProtocolsRegExp.test(value)

  return isURLValid
}
