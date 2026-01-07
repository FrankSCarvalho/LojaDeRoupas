import sqlite3
from config import DATABASE_PATH

def get_connection():
    """
    Cria e retorna uma conexão com o banco de dados.
    """
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Permite acessar colunas por nome
    return conn

def init_database():
    """
    Cria as tabelas do banco de dados se elas não existirem.
    Essa função é executada toda vez que o app inicia, mas NÃO sobrescreve dados existentes.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # Tabela de Usuários
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            nivel_acesso TEXT NOT NULL CHECK(nivel_acesso IN ('admin', 'vendedor', 'estoquista')),
            ativo INTEGER DEFAULT 1,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Tabela de Clientes
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT UNIQUE,
            telefone TEXT,
            email TEXT,
            endereco TEXT,
            cidade TEXT,
            estado TEXT,
            cep TEXT,
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Tabela de Produtos
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            categoria TEXT,
            tamanho TEXT,
            cor TEXT,
            preco_compra REAL,
            preco_venda REAL NOT NULL,
            estoque INTEGER DEFAULT 0,
            estoque_minimo INTEGER DEFAULT 5,
            codigo_barras TEXT,
            ativo INTEGER DEFAULT 1,
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Tabela de Vendas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER,
            usuario_id INTEGER NOT NULL,
            valor_total REAL NOT NULL,
            desconto REAL DEFAULT 0,
            valor_final REAL NOT NULL,
            forma_pagamento TEXT,
            status TEXT DEFAULT 'concluida',
            data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
    """)
    
    # Tabela de Itens da Venda
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS itens_venda (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            venda_id INTEGER NOT NULL,
            produto_id INTEGER NOT NULL,
            quantidade INTEGER NOT NULL,
            preco_unitario REAL NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (venda_id) REFERENCES vendas(id),
            FOREIGN KEY (produto_id) REFERENCES produtos(id)
        )
    """)
    
    # Criar usuário admin padrão (só se não existir)
    cursor.execute("SELECT COUNT(*) as total FROM usuarios WHERE email = 'admin@loja.com'")
    if cursor.fetchone()['total'] == 0:
        cursor.execute("""
            INSERT INTO usuarios (nome, email, senha, nivel_acesso)
            VALUES ('Administrador', 'admin@loja.com', '123456', 'admin')
        """)
        print("[DATABASE] Usuário admin criado: admin@loja.com / 123456")
    
    conn.commit()
    conn.close()
    print("[DATABASE] Banco de dados inicializado com sucesso!")