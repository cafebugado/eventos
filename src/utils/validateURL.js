export const validateURL = (value) => {
  const allowedProtocolsRegExp =
    /^(http[s]?:\/{2})((?!.{254,})(?:(?!-)(?:xn--[A-Za-z0-9-]{1,59}|(?!xn--)[A-Za-z0-9-]{1,63})(?<!-)\.)+(?:xn--[A-Za-z0-9-]{1,59}|[A-Za-z]{2,63}))(\/)(([A-Za-z0-9-]{1,59})(\.png|jpg|jpeg|webp)|(images\?q=\w+:[A-Za-z0-9&_-]+))$/

  const isURLValid = allowedProtocolsRegExp.test(value)

  return isURLValid
}
