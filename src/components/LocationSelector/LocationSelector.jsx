import { useMemo } from 'react'
import { getStates, getCities } from '@brazilian-utils/brazilian-utils'
import { MapPin } from 'lucide-react'
import './LocationSelector.css'

const STATES = getStates()

/**
 * LocationSelector — seletor encadeado de Estado → Cidade.
 *
 * Props:
 *  - estado        {string}   código UF selecionado (ex: "SP")
 *  - cidade        {string}   cidade selecionada
 *  - onEstadoChange {fn}      callback (uf: string) => void
 *  - onCidadeChange {fn}      callback (cidade: string) => void
 *  - disabled      {boolean}  desabilita ambos os selects
 *  - required      {boolean}  marca campos como required
 */
export function LocationSelector({
  estado = '',
  cidade = '',
  onEstadoChange,
  onCidadeChange,
  disabled = false,
  required = false,
}) {
  const cities = useMemo(() => {
    if (!estado) {
      return []
    }
    return getCities(estado)
  }, [estado])

  function handleEstadoChange(e) {
    onEstadoChange?.(e.target.value)
    onCidadeChange?.('')
  }

  function handleCidadeChange(e) {
    onCidadeChange?.(e.target.value)
  }

  return (
    <div className="location-selector">
      <div className="location-selector__field">
        <label className="location-selector__label">
          <MapPin size={16} />
          Estado
          {required && <span className="location-selector__required">*</span>}
        </label>
        <select
          className="location-selector__select"
          value={estado}
          onChange={handleEstadoChange}
          disabled={disabled}
        >
          <option value="">Selecione o estado...</option>
          {STATES.map(({ code, name }) => (
            <option key={code} value={code}>
              {code} — {name}
            </option>
          ))}
        </select>
      </div>

      <div className="location-selector__field">
        <label className="location-selector__label">
          <MapPin size={16} />
          Cidade
          {required && <span className="location-selector__required">*</span>}
        </label>
        <select
          className="location-selector__select"
          value={cidade}
          onChange={handleCidadeChange}
          disabled={disabled || !estado}
        >
          <option value="">
            {estado ? 'Selecione a cidade...' : 'Selecione o estado primeiro'}
          </option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
