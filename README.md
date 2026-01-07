# 🛍️ Loja de Roupas - Sistema de Gestão

Sistema desktop seguro para controle de vendas, estoque e clientes de loja de roupas.

## 🔐 Segurança

Este sistema utiliza:
- ✅ Autenticação real com sistema de sessão
- ✅ Verificação de permissões por nível de acesso
- ✅ Proteção contra acesso não autorizado (HTTP 401/403)
- ✅ Páginas HTML separadas (login e aplicação)
- ✅ Backend valida todas as operações

## 📋 Funcionalidades

- ✅ Sistema de login com sessão segura
- ✅ Níveis de acesso (Admin, Vendedor, Estoquista)
- ✅ Cadastro e gerenciamento de produtos
- ✅ Cadastro e gerenciamento de clientes
- ✅ Controle de estoque com alerta de estoque mínimo
- ✅ Registro de vendas
- ✅ Banco de dados local protegido (SQLite3)
- ✅ Dados do usuário preservados nas atualizações

## 🛠️ Tecnologias

- **Python 3.8+**
- **PyWebView 6.1** - Interface gráfica híbrida
- **SQLite3** - Banco de dados local
- **HTML5/CSS3/JavaScript** - Frontend moderno

## 📁 Estrutura do Projeto

```
loja-roupas/
├── src/              # Backend Python
│   ├── main.py       # Arquivo principal
│   ├── api.py        # API com sistema de sessão
│   ├── database.py   # Gerenciamento do BD
│   └── config.py     # Configurações
│
├── web/              # Frontend
│   ├── login.html    # Tela de login
│   ├── main.html     # Aplicação principal
│   ├── css/
│   │   ├── login.css
│   │   └── main.css
│   └── js/
│       ├── login.js
│       └── main.js
│
├── data/             # Dados do usuário (git ignore)
│   └── loja.db       # Banco de dados (criado automaticamente)
│
├── requirements.txt
├── build.py
└── README.md
```

## 🚀 Como Usar

### Desenvolvimento (Linux/Windows)

1. **Instalar dependências:**
```bash
pip install -r requirements.txt
```

2. **Executar o aplicativo:**
```bash
python src/main.py
```

3. **Login padrão:**
- Email: `admin@loja.com`
- Senha: `123456`

### Compilar para Windows

1. **Na VM Windows, instalar dependências:**
```cmd
pip install -r requirements.txt
```

2. **Compilar:**
```cmd
python build.py
```

3. **O executável estará em:**
```
dist/LojaRoupas.exe
```

## 📦 Criar Release no GitHub

### 1. Compilar o executável

Na VM Windows:
```cmd
python build.py
```

### 2. Testar o executável

```cmd
dist\LojaRoupas.exe
```

Verifique:
- ✅ Tela de login abre corretamente
- ✅ Login funciona
- ✅ Navegação entre seções funciona
- ✅ Cadastros funcionam

### 3. Criar tag no Git

```bash
git add .
git commit -m "Versão 2.0.0 - Sistema seguro"
git tag -a v2.0.0 -m "Arquitetura segura com autenticação"
git push origin main
git push origin v2.0.0
```

### 4. Criar Release no GitHub

1. Vá em **Releases** no seu repositório
2. Clique em **Create a new release**
3. Selecione a tag `v2.0.0`
4. Adicione título: "Versão 2.0.0 - Sistema Seguro"
5. Descreva as novidades:
   ```markdown
   ## 🔐 Versão 2.0.0 - Arquitetura Segura
   
   ### Novidades
   - Sistema de autenticação real com sessão
   - Proteção contra acesso não autorizado
   - Interface moderna com páginas separadas
   - Verificação de permissões por nível de acesso
   
   ### Download
   - Windows: LojaRoupas.exe
   
   ### Importante
   Seus dados são preservados! O banco de dados não é sobrescrito.
   ```
6. Faça upload do arquivo `LojaRoupas.exe`
7. Publique!

## 🔐 Proteção do Banco de Dados

**IMPORTANTE:** O banco de dados é salvo em:
```
Windows: C:/Users/[Usuario]/AppData/Local/LojaRoupas/loja.db
Linux: ~/.local/share/LojaRoupas/loja.db
```

Isso garante que:
- ✅ Os dados do usuário NÃO são sobrescritos nas atualizações
- ✅ Cada usuário Windows tem seu próprio banco de dados
- ✅ O aplicativo pode ser atualizado sem perda de dados
- ✅ O .exe pode ser deletado sem afetar o banco de dados

## 📝 Níveis de Acesso

| Nível | Permissões |
|-------|-----------|
| **Admin** | Acesso total ao sistema |
| **Vendedor** | Registrar vendas, visualizar produtos/clientes |
| **Estoquista** | Gerenciar produtos e estoque |

## 🔒 Segurança

### Sistema de Sessão
- Token único gerado no login
- Todas as operações verificam sessão ativa
- Logout destrói a sessão
- Tentativa de acesso sem sessão = redirecionamento para login

### Verificação de Permissões
```python
@requer_autenticacao           # Requer login
@requer_nivel(['admin'])       # Requer ser admin
```

### Códigos de Resposta
- **200**: Operação bem-sucedida
- **401**: Não autorizado (faça login)
- **403**: Proibido (sem permissão)

## 🎯 Melhorias Futuras

- [ ] Hash de senhas com bcrypt
- [ ] Timeout de sessão (auto-logout)
- [ ] Limite de tentativas de login
- [ ] Logs de auditoria
- [ ] Relatórios de vendas
- [ ] Gráficos e estatísticas
- [ ] Backup do banco de dados
- [ ] Importar/Exportar dados
- [ ] Sistema de nota fiscal

## 🐛 Solução de Problemas

### App não abre
```bash
# Verifique se as dependências estão instaladas:
pip list | grep pywebview
pip list | grep bottle
```

### Erro ao fazer login
- Verifique se o banco de dados foi criado em `AppData/Local/LojaRoupas/`
- Tente deletar `loja.db` e executar novamente

### Sessão expira imediatamente
- Isso é normal após reiniciar o app
- Faça login novamente

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

## 👨‍💻 Desenvolvedor

Projeto desenvolvido como estudo de:
- Python + PyWebView
- Arquitetura cliente-servidor
- Sistema de autenticação e autorização
- Desenvolvimento de aplicações desktop

---

**📧 Suporte:** Abra uma issue no GitHub
**🌟 Contribuições:** Pull requests são bem-vindos!

---

### 🔄 Histórico de Versões

#### v2.0.0 (2025-01-07)
- 🔐 Sistema de autenticação com sessão
- 📄 Páginas HTML separadas
- 🛡️ Verificação de permissões
- ✨ Interface moderna

#### v1.0.0 (2025-01-06)
- 🎉 Versão inicial
- ✅ CRUD de produtos e clientes
- 💾 Banco de dados local