# Configuração de Branch Protection Rules

Este documento descreve como configurar as regras de proteção de branches no GitHub para garantir o fluxo de trabalho correto.

## Fluxo de Branches

```
feature/* ──┐
fix/*     ──┼──► developer ──► main (produção)
hotfix/*  ──┘
              (1 aprovação)    (2 aprovações)
```

## Configuração no GitHub

Acesse: **Settings** → **Branches** → **Add branch protection rule**

---

## 1. Proteção da Branch `main`

**Branch name pattern:** `main`

### Regras obrigatórias:

- [x] **Require a pull request before merging**
  - [x] Require approvals: **2**
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners (opcional, se tiver CODEOWNERS)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Status checks obrigatórios:
    - `Validar Branch de Origem`
    - `CI Checks Completos`
    - `Informações do PR`

- [x] **Require conversation resolution before merging**

- [x] **Do not allow bypassing the above settings**

- [x] **Restrict who can push to matching branches**
  - Apenas via Pull Request (ninguém pode fazer push direto)

- [ ] **Allow force pushes** → **DESMARCAR**

- [ ] **Allow deletions** → **DESMARCAR**

---

## 2. Proteção da Branch `developer`

**Branch name pattern:** `developer`

### Regras obrigatórias:

- [x] **Require a pull request before merging**
  - [x] Require approvals: **1**
  - [x] Dismiss stale pull request approvals when new commits are pushed

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Status checks obrigatórios:
    - `Validar Branch de Origem`
    - `CI Checks`
    - `Informações do PR`

- [x] **Require conversation resolution before merging**

- [ ] **Allow force pushes** → **DESMARCAR**

- [ ] **Allow deletions** → **DESMARCAR**

---

## 3. Regra para Branches de Feature (Opcional)

**Branch name pattern:** `feature/**`

### Regras sugeridas:

- [x] **Require status checks to pass before merging**
  - Status checks: `lint`, `test`, `build`

- [x] **Allow deletions** (para limpar após merge)

---

## Verificação de Configuração

Após configurar, teste o fluxo:

1. Tente fazer push direto na `main` → Deve falhar
2. Tente fazer push direto na `developer` → Deve falhar
3. Crie uma branch `feature/teste` → Deve funcionar
4. Abra PR de `feature/teste` para `developer` → Deve exigir 1 aprovação
5. Abra PR de `developer` para `main` → Deve exigir 2 aprovações
6. Tente abrir PR de `feature/teste` para `main` → CI deve falhar

---

## Configuração via GitHub CLI (Opcional)

Se preferir usar a CLI:

```bash
# Proteger main (requer GitHub CLI instalado)
gh api repos/{owner}/{repo}/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{"strict":true,"contexts":["Validar Branch de Origem","CI Checks Completos"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true}' \
  -f restrictions=null

# Proteger developer
gh api repos/{owner}/{repo}/branches/developer/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{"strict":true,"contexts":["Validar Branch de Origem","CI Checks"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  -f restrictions=null
```

---

## Troubleshooting

### "Branch protection rule already exists"

Edite a regra existente em vez de criar uma nova.

### Status checks não aparecem

Os status checks só aparecem após o primeiro CI executar com sucesso. Execute o CI pelo menos uma vez antes de configurar.

### "Required status check is expected"

Certifique-se de que os nomes dos jobs no workflow correspondem exatamente aos nomes configurados na proteção.
