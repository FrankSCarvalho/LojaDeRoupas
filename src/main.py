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
    
    # Criar janela do aplicativo - MAXIMIZADA
    window = webview.create_window(
        title='Loja de Roupas',
        url=str(login_path),
        js_api=api,
        fullscreen=False,    # Não é tela cheia (com barra de título)
        resizable=True,      # Permite redimensionar
        min_size=(800, 600)  # Tamanho mínimo caso desmaximize
    )
    
    print("[MAIN] Janela criada - Será maximizada ao iniciar")
    print("[SECURITY] Sistema de sessão ativo")
    
    # Iniciar o aplicativo com janela maximizada
    webview.start(debug=True)
    
    print("[MAIN] Aplicativo encerrado")

if __name__ == '__main__':
    main()