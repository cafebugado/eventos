'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import SocialIcons from './SocialIcons'

export default function ShareButtons({ eventName, eventDate, eventTime, eventUrl, eventLocation }) {
  return (
    <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
        <ShareOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Compartilhar
        </Typography>
      </Stack>
      <SocialIcons
        eventName={eventName}
        eventDate={eventDate}
        eventTime={eventTime}
        eventUrl={eventUrl}
        eventLocation={eventLocation}
      />
    </Stack>
  )
}
