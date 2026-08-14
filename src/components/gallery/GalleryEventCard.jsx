'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'

export default function GalleryEventCard({ event, onPhotoClick }) {
  const firstPhoto = event.photos[0]
  const lastPosted = event.photos.at(-1)?.postedAt

  return (
    <CardActionArea
      component="article"
      onClick={() => onPhotoClick(event, 0)}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '220px 1fr' },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src={firstPhoto.url}
        alt={firstPhoto.caption || event.eventName}
        loading="lazy"
        sx={{ width: '100%', height: { xs: 180, sm: '100%' }, objectFit: 'cover' }}
      />

      <Stack spacing={1.5} sx={{ p: 2.5 }}>
        <Typography variant="h6" component="h2">
          {event.eventName}
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0.75, sm: 2 }}
          sx={{ flexWrap: { sm: 'wrap' } }}
          useFlexGap
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <CalendarMonthOutlinedIcon fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.secondary">
              {event.eventDate}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <GroupsOutlinedIcon fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.secondary">
              {event.community}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <PhotoLibraryOutlinedIcon fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.secondary">
              {event.photos.length} foto{event.photos.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
          Postado por <strong>{event.createdBy || 'Desconhecido'}</strong>
          {lastPosted && (
            <>
              {' '}
              em <strong>{lastPosted}</strong>
            </>
          )}
        </Typography>
      </Stack>
    </CardActionArea>
  )
}
