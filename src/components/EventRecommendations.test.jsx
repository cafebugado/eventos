import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import EventRecommendations from './EventRecommendations'

describe('EventRecommendations', () => {
  it('não renderiza nada (sem fonte de dados até a nova API ser plugada)', () => {
    const { container } = render(<EventRecommendations currentEvent={{ id: 'current' }} />)

    expect(container).toBeEmptyDOMElement()
  })
})
