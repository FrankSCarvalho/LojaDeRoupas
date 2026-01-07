import database as db
from config import APP_VERSION

class Api:
    """
    Classe que contém todas as funções que serão chamadas pelo JavaScript.
    """
    
    def __init__(self):
        self.usuario_logado = None
    
    def get_version(self):
        """Retorna a versão do aplicativo"""
        return {"version": APP_VERSION}
    
    # ========== AUTENTICAÇÃO ==========
    
    def login(self, email, senha):
        """Realiza o login do usuário"""
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, nome, email, nivel_acesso, ativo 
            FROM usuarios 
            WHERE email = ? AND senha = ? AND ativo = 1
        """, (email, senha))
        
        usuario = cursor.fetchone()
        conn.close()
        
        if usuario:
            self.usuario_logado = {
                'id': usuario['id'],
                'nome': usuario['nome'],
                'email': usuario['email'],
                'nivel_acesso': usuario['nivel_acesso']
            }
            return {"success": True, "usuario": self.usuario_logado}
        else:
            return {"success": False, "mensagem": "Email ou senha incorretos"}
    
    def logout(self):
        """Faz logout do usuário"""
        self.usuario_logado = None
        return {"success": True}
    
    def get_usuario_logado(self):
        """Retorna o usuário atualmente logado"""
        return self.usuario_logado
    
    # ========== PRODUTOS ==========
    
    def listar_produtos(self):
        """Lista todos os produtos ativos"""
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM produtos WHERE ativo = 1 ORDER BY nome
        """)
        
        produtos = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"success": True, "produtos": produtos}
    
    def adicionar_produto(self, dados):
        """Adiciona um novo produto"""
        if not self.usuario_logado:
            return {"success": False, "mensagem": "Usuário não autenticado"}
        
        if self.usuario_logado['nivel_acesso'] not in ['admin', 'estoquista']:
            return {"success": False, "mensagem": "Sem permissão para adicionar produtos"}
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                INSERT INTO produtos (nome, descricao, categoria, tamanho, cor, 
                                     preco_compra, preco_venda, estoque, estoque_minimo, codigo_barras)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                dados.get('nome'),
                dados.get('descricao', ''),
                dados.get('categoria', ''),
                dados.get('tamanho', ''),
                dados.get('cor', ''),
                dados.get('preco_compra', 0),
                dados.get('preco_venda'),
                dados.get('estoque', 0),
                dados.get('estoque_minimo', 5),
                dados.get('codigo_barras', '')
            ))
            
            conn.commit()
            produto_id = cursor.lastrowid
            conn.close()
            
            return {"success": True, "mensagem": "Produto adicionado com sucesso!", "id": produto_id}
        except Exception as e:
            conn.close()
            return {"success": False, "mensagem": f"Erro ao adicionar produto: {str(e)}"}
    
    # ========== CLIENTES ==========
    
    def listar_clientes(self):
        """Lista todos os clientes"""
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM clientes ORDER BY nome")
        clientes = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {"success": True, "clientes": clientes}
    
    def adicionar_cliente(self, dados):
        """Adiciona um novo cliente"""
        if not self.usuario_logado:
            return {"success": False, "mensagem": "Usuário não autenticado"}
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                INSERT INTO clientes (nome, cpf, telefone, email, endereco, cidade, estado, cep)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                dados.get('nome'),
                dados.get('cpf', ''),
                dados.get('telefone', ''),
                dados.get('email', ''),
                dados.get('endereco', ''),
                dados.get('cidade', ''),
                dados.get('estado', ''),
                dados.get('cep', '')
            ))
            
            conn.commit()
            cliente_id = cursor.lastrowid
            conn.close()
            
            return {"success": True, "mensagem": "Cliente adicionado com sucesso!", "id": cliente_id}
        except Exception as e:
            conn.close()
            return {"success": False, "mensagem": f"Erro ao adicionar cliente: {str(e)}"}
    
    # ========== VENDAS ==========
    
    def registrar_venda(self, dados):
        """Registra uma nova venda"""
        if not self.usuario_logado:
            return {"success": False, "mensagem": "Usuário não autenticado"}
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        try:
            # Inserir a venda
            cursor.execute("""
                INSERT INTO vendas (cliente_id, usuario_id, valor_total, desconto, valor_final, forma_pagamento)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                dados.get('cliente_id'),
                self.usuario_logado['id'],
                dados.get('valor_total'),
                dados.get('desconto', 0),
                dados.get('valor_final'),
                dados.get('forma_pagamento')
            ))
            
            venda_id = cursor.lastrowid
            
            # Inserir itens da venda e atualizar estoque
            for item in dados.get('itens', []):
                cursor.execute("""
                    INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                """, (venda_id, item['produto_id'], item['quantidade'], item['preco_unitario'], item['subtotal']))
                
                # Atualizar estoque
                cursor.execute("""
                    UPDATE produtos SET estoque = estoque - ? WHERE id = ?
                """, (item['quantidade'], item['produto_id']))
            
            conn.commit()
            conn.close()
            
            return {"success": True, "mensagem": "Venda registrada com sucesso!", "id": venda_id}
        except Exception as e:
            conn.close()
            return {"success": False, "mensagem": f"Erro ao registrar venda: {str(e)}"}