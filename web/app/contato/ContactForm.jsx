'use client'

import { useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL_VALUES = { nome: '', email: '', assunto: '', mensagem: '' }

// O app antigo usava react-hook-form aqui; como esse formulário não envia
// para nenhum backend (só simula com alert()), optamos por state manual em
// vez de adicionar react-hook-form como dependência nova de web/ nesta fase
// — reavaliar se formulários maiores (ex.: admin, Fase 3) justificarem a lib.
function validate(values) {
  const errors = {}
  if (!values.nome || values.nome.trim().length < 2) {
    errors.nome = 'Nome deve ter pelo menos 2 caracteres'
  }
  if (!values.email) {
    errors.email = 'Email é obrigatório'
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'Email inválido'
  }
  if (!values.assunto) {
    errors.assunto = 'Assunto é obrigatório'
  }
  if (!values.mensagem || values.mensagem.trim().length < 10) {
    errors.mensagem = 'Mensagem deve ter pelo menos 10 caracteres'
  }
  return errors
}

export default function ContactForm() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function handleChange(field) {
    return (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    setValues(INITIAL_VALUES)
    setSubmitted(true)
  }

  return (
    <Stack spacing={2.5} component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" component="h3">
        Fale com a comunidade
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Seu nome"
          value={values.nome}
          onChange={handleChange('nome')}
          error={!!errors.nome}
          helperText={errors.nome}
          fullWidth
        />
        <TextField
          label="Seu email"
          type="email"
          value={values.email}
          onChange={handleChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
        />
      </Stack>

      <TextField
        label="Sobre o que você quer falar"
        value={values.assunto}
        onChange={handleChange('assunto')}
        error={!!errors.assunto}
        helperText={errors.assunto}
        fullWidth
      />

      <TextField
        label="Conte sua mensagem aqui"
        value={values.mensagem}
        onChange={handleChange('mensagem')}
        error={!!errors.mensagem}
        helperText={errors.mensagem}
        multiline
        rows={4}
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        endIcon={<SendOutlinedIcon />}
        sx={{ alignSelf: 'flex-start' }}
      >
        Enviar mensagem
      </Button>

      <Snackbar
        open={submitted}
        autoHideDuration={4000}
        onClose={() => setSubmitted(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSubmitted(false)}>
          Mensagem enviada com sucesso!
        </Alert>
      </Snackbar>
    </Stack>
  )
}
