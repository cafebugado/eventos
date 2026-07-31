import { describe, expect, it } from 'vitest'
import { generateICS, getGoogleCalendarUrl } from './calendarExport'

const event = {
  id: '1',
  nome: 'Evento Teste',
  data_evento: '20/02/2026',
  horario: '19:00',
  descricao: 'Uma descrição <b>qualquer</b>',
  endereco: 'Rua Teste, 100',
  cidade: 'São Paulo',
  estado: 'SP',
}

describe('generateICS', () => {
  it('gera um VCALENDAR com DTSTART/DTEND corretos', () => {
    const ics = generateICS(event)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('DTSTART:20260220T190000')
    expect(ics).toContain('DTEND:20260220T210000')
    expect(ics).toContain('SUMMARY:Evento Teste')
    expect(ics).toContain('LOCATION:Rua Teste, 100, São Paulo, SP')
  })

  it('escapa caracteres HTML na descrição', () => {
    const ics = generateICS(event)
    expect(ics).toContain('DESCRIPTION:Uma descrição &lt;b&gt;qualquer&lt;/b&gt;')
  })
})

describe('getGoogleCalendarUrl', () => {
  it('gera uma URL do Google Calendar com os parâmetros do evento', () => {
    const url = getGoogleCalendarUrl(event)
    expect(url).toContain('https://calendar.google.com/calendar/render?')
    expect(url).toContain('action=TEMPLATE')
    expect(url).toContain('dates=20260220T190000%2F20260220T210000')
    expect(url).toContain('text=Evento+Teste')
  })
})
