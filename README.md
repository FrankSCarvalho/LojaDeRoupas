# 🛍️ Loja de Roupas - Sistema de Gestão

Sistema desktop para controle de vendas, estoque e clientes de loja de roupas.

## 📋 Funcionalidades

- ✅ Sistema de login com níveis de acesso (Admin, Vendedor, Estoquista)
- ✅ Cadastro e gerenciamento de produtos
- ✅ Cadastro e gerenciamento de clientes
- ✅ Controle de estoque
- ✅ Registro de vendas
- ✅ Banco de dados local (SQLite3)

## 🛠️ Tecnologias

- **Python 3.8+**
- **PyWebView** - Interface gráfica
- **SQLite3** - Banco de dados
- **HTML/CSS/JavaScript** - Frontend

## 📁 Estrutura do Projeto

```
loja-roupas/
├── src/              # Código Python
│   ├── main.py       # Arquivo principal
│   ├── database.py   # Gerenciamento do BD
│   ├── api.py        # Backend/API
│   └── config.py     # Configurações
├── web/              # Interface HTML
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── data/             # Dados do usuário (git ignore)
├── requirements.txt
└── build.py          # Script de compilação
```

## 🚀 Como Usar

### Desenvolvimento (Linux Fedora)

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

### Compilar para Windows (VM)

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

### 2. Criar tag no Git

```bash
git tag -a v1.0.0 -m "Primeira versão"
git push origin v1.0.0
```

### 3. Criar Release no GitHub

1. Vá em **Releases** no repositório
2. Clique em **Create a new release**
3. Selecione a tag `v1.0.0`
4. Adicione título: "Versão 1.0.0"
5. Descreva as funcionalidades
6. Faça upload do arquivo `LojaRoupas.exe`
7. Publique!

## 🔐 Proteção do Banco de Dados

**IMPORTANTE:** O banco de dados é salvo em:
```
Windows: C:/Users/[Usuario]/AppData/Local/LojaRoupas/loja.db
Linux: ~/.local/share/LojaRoupas/loja.db
```

Isso garante que:
- ✅ Os dados do usuário não são sobrescritos nas atualizações
- ✅ Cada usuário tem seu próprio banco de dados
- ✅ O aplicativo pode ser atualizado sem perda de dados

## 📝 Níveis de Acesso

- **Admin**: Acesso total ao sistema
- **Vendedor**: Pode registrar vendas e visualizar produtos/clientes
- **Estoquista**: Pode gerenciar produtos e estoque

## 🎯 Próximas Funcionalidades

- [ ] Relatórios de vendas
- [ ] Gráficos e estatísticas
- [ ] Backup do banco de dados
- [ ] Importar/Exportar dados
- [ ] Sistema de nota fiscal

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

## 👨‍💻 Desenvolvedor

Projeto desenvolvido como estudo de Python + PyWebView