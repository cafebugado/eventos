'use client'

import { useState } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import AppleIcon from '@mui/icons-material/Apple'
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import { downloadICS, getGoogleCalendarUrl } from '../utils/calendarExport'

// Usa Menu do MUI em vez do dropdown com detecção de clique fora escrita à
// mão no app antigo (foco/Escape/clique-fora já vêm de graça). Os ícones de
// marca (Google/Apple/Outlook) do app antigo eram SVG inline — aqui trocamos
// por ícones genéricos do @mui/icons-material (o pacote não inclui logos de
// marca além de alguns poucos como Apple), mantendo a convenção do design
// system desta migração.
export default function AddToCalendarButton({ event }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [downloaded, setDownloaded] = useState(null)
  const open = Boolean(anchorEl)

  function handleClose() {
    setAnchorEl(null)
  }

  function handleICS(type) {
    downloadICS(event)
    setDownloaded(type)
    setTimeout(() => setDownloaded(null), 2500)
    handleClose()
  }

  function handleGoogle() {
    window.open(getGoogleCalendarUrl(event), '_blank', 'noopener,noreferrer')
    handleClose()
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<EventOutlinedIcon />}
        endIcon={<KeyboardArrowDownOutlinedIcon />}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Adicionar ao Calendário
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleGoogle}>
          <ListItemIcon>
            <LanguageOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Google Calendar" secondary="Abre no navegador" />
          <OpenInNewOutlinedIcon fontSize="small" sx={{ ml: 2, color: 'text.disabled' }} />
        </MenuItem>

        <MenuItem onClick={() => handleICS('apple')}>
          <ListItemIcon>
            <AppleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Apple / iCal" secondary="Baixa arquivo .ics" />
          {downloaded === 'apple' ? (
            <CheckOutlinedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
          ) : (
            <DownloadOutlinedIcon fontSize="small" sx={{ ml: 2, color: 'text.disabled' }} />
          )}
        </MenuItem>

        <MenuItem onClick={() => handleICS('outlook')}>
          <ListItemIcon>
            <MailOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Outlook" secondary="Baixa arquivo .ics" />
          {downloaded === 'outlook' ? (
            <CheckOutlinedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
          ) : (
            <DownloadOutlinedIcon fontSize="small" sx={{ ml: 2, color: 'text.disabled' }} />
          )}
        </MenuItem>
      </Menu>
    </>
  )
}
