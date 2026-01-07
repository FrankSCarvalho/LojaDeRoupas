"""
Script para compilar o aplicativo em executável Windows
Execute este script na sua VM Windows
"""
import PyInstaller.__main__
import shutil
from pathlib import Path

print("="*50)
print("COMPILANDO APLICATIVO LOJA DE ROUPAS")
print("="*50)

# Limpar pastas antigas
if Path('dist').exists():
    shutil.rmtree('dist')
    print("[BUILD] Pasta dist removida")

if Path('build').exists():
    shutil.rmtree('build')
    print("[BUILD] Pasta build removida")

# Configurações do PyInstaller
PyInstaller.__main__.run([
    'src/main.py',              # Arquivo principal
    '--name=LojaRoupas',        # Nome do executável
    '--onefile',                # Gerar um único arquivo exe
    '--windowed',               # Não mostrar console (interface gráfica)
    '--icon=NONE',              # Você pode adicionar um ícone depois
    '--add-data=web;web',       # Incluir pasta web no executável
    '--hidden-import=sqlite3',  # Importações necessárias
    '--hidden-import=webview',
    '--clean',                  # Limpar cache
])

print("="*50)
print("COMPILAÇÃO CONCLUÍDA!")
print("Executável criado em: dist/LojaRoupas.exe")
print("="*50)
print("\n⚠️  IMPORTANTE:")
print("O banco de dados será criado automaticamente em:")
print("C:/Users/[Usuario]/AppData/Local/LojaRoupas/loja.db")
print("Isso garante que as atualizações NÃO sobrescrevem os dados!")