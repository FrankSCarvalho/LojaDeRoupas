import os
import sys
from pathlib import Path

# Versão do aplicativo
APP_VERSION = "1.0.0"
APP_NAME = "LojaRoupas"

def get_app_data_dir():
    """
    Retorna o diretório onde os dados do usuário serão salvos.
    No Windows: C:/Users/[Usuario]/AppData/Local/LojaRoupas/
    No Linux: ~/.local/share/LojaRoupas/
    
    Isso garante que o banco de dados NÃO será sobrescrito nas atualizações!
    """
    if sys.platform == "win32":
        # Windows
        base_dir = os.environ.get("LOCALAPPDATA", os.path.expanduser("~"))
        app_dir = Path(base_dir) / APP_NAME
    else:
        # Linux
        app_dir = Path.home() / ".local" / "share" / APP_NAME
    
    # Cria o diretório se não existir
    app_dir.mkdir(parents=True, exist_ok=True)
    return app_dir

def get_database_path():
    """
    Retorna o caminho completo do banco de dados.
    """
    return get_app_data_dir() / "loja.db"

# Caminho do banco de dados
DATABASE_PATH = get_database_path()

print(f"[CONFIG] Banco de dados será salvo em: {DATABASE_PATH}")