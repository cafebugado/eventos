import { useCountUp } from '../hooks/useCountUp'

/**
 * Exibe um número animado de 0 até `value` quando entra na viewport.
 *
 * @param {number}  value    - Valor numérico final
 * @param {string}  suffix   - Texto após o número (ex: " anos", "%", "+")
 * @param {string}  prefix   - Texto antes do número (ex: "+")
 * @param {string}  label    - Descrição abaixo do número
 * @param {number}  duration - Duração da animação em ms (padrão 2000)
 */
function StatCounter({ value, suffix = '', prefix = '', label, duration = 2000 }) {
  const { ref, displayValue } = useCountUp(value, duration)

  return (
    <div className="about-stat" ref={ref}>
      <h3>
        {prefix}
        {displayValue}
        {suffix}
      </h3>
      {label && <p>{label}</p>}
    </div>
  )
}

export default StatCounter
