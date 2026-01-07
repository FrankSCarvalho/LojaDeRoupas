import webview
import os
import sys
from pathlib import Path
from api import Api
import database

# Adiciona o diretório src ao path
if getattr(sys, 'frozen', False):
    application_path = sys._MEIPASS
else:
    application_path = Path(__file__).parent

def main():
    print("="*50)
    print("LOJA DE ROUPAS - SISTEMA SEGURO")
    print("="*50)
    
    # Inicializar banco de dados
    database.init_database()
    
    # Criar instância da API (com sessão)
    api = Api()
    
    # Caminho para a pasta web
    if getattr(sys, 'frozen', False):
        web_path = Path(sys._MEIPASS) / 'web'
    else:
        web_path = Path(__file__).parent.parent / 'web'
    
    # Iniciar pela tela de LOGIN
    login_path = web_path / 'login.html'
    
    print(f"[MAIN] Iniciando em: {login_path}")
    
    if not login_path.exists():
        print(f"[ERRO] Arquivo login.html não encontrado!")
        sys.exit(1)
    
    # Criar janela do aplicativo
    window = webview.create_window(
        title='Loja de Roupas - Login',
        url=str(login_path),
        js_api=api,
        width=500,
        height=600,
        resizable=False,  # Login fixo
        min_size=(500, 600)
    )
    
    print("[MAIN] Janela criada (tela de login)")
    print("[SECURITY] Sistema de sessão ativo")
    
    # Iniciar o aplicativo
    webview.start(debug=True)
    
    print("[MAIN] Aplicativo encerrado")

if __name__ == '__main__':
    main()