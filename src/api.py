import database as db
from config import APP_VERSION
import secrets

class Api:
    """
    API com sistema de sessão REAL para segurança.
    Toda operação sensível agora verifica se o usuário está autenticado.
    """
    
    def __init__(self):
        # Token de sessão único (gerado aleatoriamente)
        self.session_token = None
        self.usuario_logado = None
    
    # ============================================
    # DECORADOR DE SEGURANÇA
    # ============================================
    def requer_autenticacao(func):
        """
        Decorador que verifica se há sessão ativa.
        Se não houver, retorna erro 401.
        """
        def wrapper(self, *args, **kwargs):
            if not self.session_token or not self.usuario_logado:
                return {
                    "success": False, 
                    "mensagem": "Não autorizado. Faça login novamente.",
                    "codigo": 401
                }
            return func(self, *args, **kwargs)
        return wrapper
    
    def requer_nivel(niveis_permitidos):
        """
        Decorador que verifica o nível de acesso do usuário.
        Exemplo: @requer_nivel(['admin', 'estoquista'])
        """
        def decorator(func):
            def wrapper(self, *args, **kwargs):
                if not self.session_token or not self.usuario_logado:
                    return {
                        "success": False,
                        "mensagem": "Não autorizado. Faça login novamente.",
                        "codigo": 401
                    }
                
                if self.usuario_logado['nivel_acesso'] not in niveis_permitidos:
                    return {
                        "success": False,
                        "mensagem": f"Acesso negado. Apenas {', '.join(niveis_permitidos)} podem realizar esta ação.",
                        "codigo": 403
                    }
                
                return func(self, *args, **kwargs)
            return wrapper
        return decorator
    
    # ============================================
    # AUTENTICAÇÃO
    # ============================================
    
    def login(self, email, senha):
        """
        Realiza o login e cria uma sessão.
        """
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
            # Criar sessão segura
            self.session_token = secrets.token_urlsafe(32)
            self.usuario_logado = {
                'id': usuario['id'],
                'nome': usuario['nome'],
                'email': usuario['email'],
                'nivel_acesso': usuario['nivel_acesso']
            }
            
            print(f"[AUTH] Login bem-sucedido: {usuario['email']} (Sessão: {self.session_token[:8]}...)")
            
            return {
                "success": True,
                "usuario": self.usuario_logado,
                "redirect": "main.html"  # Frontend vai redirecionar
            }
        else:
            print(f"[AUTH] Falha no login: {email}")
            return {
                "success": False,
                "mensagem": "Email ou senha incorretos"
            }
    
    def logout(self):
        """
        Destrói a sessão.
        """
        if self.usuario_logado:
            print(f"[AUTH] Logout: {self.usuario_logado['email']}")
        
        self.session_token = None
        self.usuario_logado = None
        
        return {
            "success": True,
            "redirect": "login.html"
        }
    
    @requer_autenticacao
    def verificar_sessao(self):
        """
        Verifica se a sessão está ativa.
        Usado quando a página main.html carrega.
        """
        return {
            "success": True,
            "usuario": self.usuario_logado
        }
    
    # ============================================
    # PRODUTOS (PROTEGIDOS)
    # ============================================
    
    @requer_autenticacao
    def listar_produtos(self):
        """Lista produtos - requer autenticação"""
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM produtos WHERE ativo = 1 ORDER BY nome")
        produtos = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"success": True, "produtos": produtos}
    
    @requer_nivel(['admin', 'estoquista'])
    def adicionar_produto(self, dados):
        """Adiciona produto - apenas admin e estoquista"""
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
            
            print(f"[PRODUTO] Adicionado por {self.usuario_logado['email']}: {dados.get('nome')}")
            return {"success": True, "mensagem": "Produto adicionado!", "id": produto_id}
        except Exception as e:
            conn.close()
            return {"success": False, "mensagem": f"Erro: {str(e)}"}
    
    # ============================================
    # CLIENTES (PROTEGIDOS)
    # ============================================
    
    @requer_autenticacao
    def listar_clientes(self):
        """Lista clientes - requer autenticação"""
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM clientes ORDER BY nome")
        clientes = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"success": True, "clientes": clientes}
    
    @requer_autenticacao
    def adicionar_cliente(self, dados):
        """Adiciona cliente - requer autenticação"""
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
            
            print(f"[CLIENTE] Adicionado por {self.usuario_logado['email']}: {dados.get('nome')}")
            return {"success": True, "mensagem": "Cliente adicionado!", "id": cliente_id}
        except Exception as e:
            conn.close()
            return {"success": False, "mensagem": f"Erro: {str(e)}"}
    
    # ============================================
    # VENDAS (PROTEGIDAS)
    # ============================================
    
    @requer_autenticacao
    def registrar_venda(self, dados):
        """Registra venda - requer autenticação"""
        conn = db.get_connection()
        cursor = conn.cursor()
        
        try:
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
            
            for item in dados.get('itens', []):
                cursor.execute("""
                    INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                """, (venda_id, item['produto_id'], item['quantidade'], item['preco_unitario'], item['subtotal']))
                
                cursor.execute("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", 
                             (item['quantidade'], item['produto_id']))
            
            conn.commit()
            conn.close()
            
            print(f"[VENDA] Registrada por {self.usuario_logado['email']}: R$ {dados.get('valor_final')}")
            return {"success": True, "mensagem": "Venda registrada!", "id": venda_id}
        except Exception as e:
            conn.close()
            return {"success": False, "mensagem": f"Erro: {str(e)}"}
    
    # ============================================
    # CONTROLE DA JANELA
    # ============================================
    
    def maximize_window(self):
        """
        Maximiza a janela do aplicativo.
        Chamado pelo JavaScript quando qualquer página carrega.
        """
        try:
            import webview
            windows = webview.windows
            if windows:
                windows[0].maximize()
                print(f"[WINDOW] Janela maximizada")
                return {"success": True}
        except Exception as e:
            print(f"[WINDOW] Erro ao maximizar: {e}")
            return {"success": False}
    
    def resize_window(self, width, height):
        """
        Redimensiona a janela do aplicativo.
        """
        try:
            import webview
            windows = webview.windows
            if windows:
                windows[0].resize(width, height)
                print(f"[WINDOW] Janela redimensionada para {width}x{height}")
                return {"success": True}
        except Exception as e:
            print(f"[WINDOW] Erro ao redimensionar: {e}")
            return {"success": False}
    
    # ============================================
    # INFORMAÇÕES DO SISTEMA
    # ============================================
    
    def get_version(self):
        """Versão do app - não requer autenticação"""
        return {"version": APP_VERSION}