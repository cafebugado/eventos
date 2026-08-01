'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCountUp } from '../hooks/useCountUp'

/**
 * Exibe um número animado de 0 até `value` quando entra na viewport.
 */
export default function StatCounter({ value, suffix = '', prefix = '', label, duration = 2000 }) {
  const { ref, displayValue } = useCountUp(value, duration)

  return (
    <Box ref={ref} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
      <Typography variant="h3" component="h3" color="primary" sx={{ fontWeight: 700 }}>
        {prefix}
        {displayValue}
        {suffix}
      </Typography>
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  )
}
