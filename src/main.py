import webview
import os
import sys
from pathlib import Path
from api import Api
import database

# Adiciona o diretório src ao path para imports funcionarem
if getattr(sys, 'frozen', False):
    # Se estiver rodando como executável
    application_path = sys._MEIPASS
else:
    # Se estiver rodando como script
    application_path = Path(__file__).parent

def main():
    print("="*50)
    print("INICIANDO LOJA DE ROUPAS")
    print("="*50)
    
    # Inicializar banco de dados
    database.init_database()
    
    # Criar instância da API
    api = Api()
    
    # Caminho para a pasta web
    if getattr(sys, 'frozen', False):
        # Executável
        web_path = Path(sys._MEIPASS) / 'web'
    else:
        # Desenvolvimento
        web_path = Path(__file__).parent.parent / 'web'
    
    index_path = web_path / 'index.html'
    
    print(f"[MAIN] Procurando interface em: {index_path}")
    
    if not index_path.exists():
        print(f"[ERRO] Arquivo index.html não encontrado em: {index_path}")
        sys.exit(1)
    
    # Criar janela do aplicativo
    window = webview.create_window(
        title='Loja de Roupas - Sistema de Gestão',
        url=str(index_path),
        js_api=api,
        width=1280,
        height=720,
        resizable=True,
        min_size=(800, 600)
    )
    
    print("[MAIN] Janela criada, iniciando interface...")
    
    # Iniciar o aplicativo
    webview.start(debug=True)  # debug=True mostra console no desenvolvimento
    
    print("[MAIN] Aplicativo encerrado")

if __name__ == '__main__':
    main()
    