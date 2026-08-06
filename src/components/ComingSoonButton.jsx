'use client'

import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

// Botão pra funcionalidades ainda não lançadas (login/cadastro, por enquanto).
// Fica desabilitado de verdade (semântica/acessibilidade corretas — some da
// ordem de tab, aria-disabled automático), mas sobrescreve o cinza padrão do
// MUI pra estado disabled: mantém a cor real do botão, só com opacidade
// reduzida. O badge "Em breve" (cadeado + texto na mesma linha) só aparece no
// hover — o botão disabled tem pointer-events: none nativo do MUI, então o
// :hover "atravessa" ele e é o wrapper do Badge (não o botão) que detecta o mouse.
export default function ComingSoonButton({ children, variant = 'text', ...props }) {
  return (
    <Badge
      badgeContent={
        <Stack direction="row" spacing={0.4} sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
          <LockOutlinedIcon sx={{ fontSize: 10 }} />
          <span>Em breve</span>
        </Stack>
      }
      color="warning"
      sx={{
        '& .MuiBadge-badge': {
          right: 8,
          top: 4,
          fontSize: '0.6rem',
          minHeight: 16,
          height: 'auto',
          padding: '2px 6px',
          borderRadius: 1,
          flexWrap: 'nowrap',
          whiteSpace: 'nowrap',
          opacity: 0,
          transition: 'opacity 0.15s ease',
        },
        '&:hover .MuiBadge-badge': {
          opacity: 1,
        },
      }}
    >
      <Button
        variant={variant}
        disabled
        sx={{
          '&.Mui-disabled': {
            color: variant === 'contained' ? 'primary.contrastText' : 'text.primary',
            bgcolor: variant === 'contained' ? 'primary.main' : 'transparent',
            opacity: 0.75,
          },
        }}
        {...props}
      >
        {children}
      </Button>
    </Badge>
  )
}
