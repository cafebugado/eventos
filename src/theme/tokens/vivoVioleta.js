import colorTokens from './colors.json'

// Achata o formato Design Tokens ({ "500": { value, type } }) pra um mapa
// simples de degrau -> hex, mais direto de consumir no theme.js e nos poucos
// lugares fora do MUI que precisam da mesma cor (favicon, PWA theme-color,
// telas de erro que não confiam no ThemeProvider).
export const vivoVioleta = Object.fromEntries(
  Object.entries(colorTokens['vivo-violeta']).map(([step, token]) => [step, token.value])
)
