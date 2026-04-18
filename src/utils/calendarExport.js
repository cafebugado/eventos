// Converte DD/MM/YYYY + HH:MM para formato iCal YYYYMMDDTHHMMSS
function toICalDate(dateBR, time) {
  const [day, month, year] = dateBR.split('/')
  const [hour, minute] = (time || '00:00').split(':')
  return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}T${hour.padStart(2, '0')}${minute.padStart(2, '0')}00`
}

function sanitizePlainText(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Retorna data/hora + 2h (duração padrão do evento)
function addHours(iCalDate, hours) {
  const year = parseInt(iCalDate.slice(0, 4))
  const month = parseInt(iCalDate.slice(4, 6)) - 1
  const day = parseInt(iCalDate.slice(6, 8))
  const hour = parseInt(iCalDate.slice(9, 11))
  const minute = parseInt(iCalDate.slice(11, 13))

  const d = new Date(year, month, day, hour + hours, minute)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
}

export function generateICS(event) {
  const dtStart = toICalDate(event.data_evento, event.horario)
  const dtEnd = addHours(dtStart, 2)
  const uid = `evento-${event.id || Date.now()}@cafebugado`

  const location = [event.endereco, event.cidade, event.estado].filter(Boolean).join(', ')
  const description = event.descricao
    ? sanitizePlainText(event.descricao).replace(/\n/g, '\\n').slice(0, 500)
    : ''

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cafe Bugado//Agendas Eventos//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICalDate(new Date().toLocaleDateString('pt-BR'), new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.nome || event.titulo}`,
    location ? `LOCATION:${location}` : null,
    description ? `DESCRIPTION:${description}` : null,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Lembrete: ${event.nome || event.titulo} em 1 hora`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')

  return ics
}

export function downloadICS(event) {
  const ics = generateICS(event)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(event.nome || event.titulo || 'evento').replace(/[^a-z0-9]/gi, '_')}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getGoogleCalendarUrl(event) {
  const dtStart = toICalDate(event.data_evento, event.horario)
  const dtEnd = addHours(dtStart, 2)
  const location = [event.endereco, event.cidade, event.estado].filter(Boolean).join(', ')
  const description = event.descricao ? sanitizePlainText(event.descricao).slice(0, 500) : ''

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.nome || event.titulo,
    dates: `${dtStart}/${dtEnd}`,
    details: description,
    location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
