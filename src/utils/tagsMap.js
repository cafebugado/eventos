export function filterTagsMapByEvents(tagsMap, events) {
  if (!tagsMap || typeof tagsMap !== 'object' || !Array.isArray(events)) {
    return {}
  }

  const filtered = {}
  for (const event of events) {
    const id = event?.id
    if (id != null && Object.prototype.hasOwnProperty.call(tagsMap, id)) {
      filtered[id] = tagsMap[id]
    }
  }

  return filtered
}
