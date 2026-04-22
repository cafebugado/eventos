export const validateURL = (value) => {
  const allowedProtocolsRegExp =
    /^(http[s]?:\/{2})((?!.{254,})(?:(?!-)(?:xn--[A-Za-z0-9-]{1,59}|(?!xn--)[A-Za-z0-9-]{1,63})(?<!-)\.)+(?:xn--[A-Za-z0-9-]{1,59}|[A-Za-z]{2,63}))/

  const isURLValid = allowedProtocolsRegExp.test(value)

  return isURLValid
}
