console.log('🔐 Login.js carregado');

// Esperar o PyWebView estar pronto
window.addEventListener('pywebviewready', inicializar);

// Backup: se já estiver pronto
setTimeout(() => {
    if (window.pywebview) {
        inicializar();
    }
}, 500);

async function inicializar() {
    console.log('✅ PyWebView pronto');
    
    // MAXIMIZAR A JANELA
    try {
        if (window.pywebview && window.pywebview.api) {
            await window.pywebview.api.maximize_window();
            console.log('🖥️ Janela maximizada');
        }
    } catch (erro) {
        console.log('⚠️ Não foi possível maximizar automaticamente');
    }
    
    carregarVersao();
    
    // Configurar formulário
    const form = document.getElementById('form-login');
    form.addEventListener('submit', realizarLogin);
}

async function realizarLogin(e) {
    e.preventDefault(); // Previne reload da página
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    console.log('🔐 Tentando login:', email);
    
    if (!window.pywebview || !window.pywebview.api) {
        mostrarMensagem('Sistema não inicializado', 'erro');
        return;
    }
    
    try {
        const resultado = await window.pywebview.api.login(email, senha);
        console.log('📥 Resposta:', resultado);
        
        if (resultado.success) {
            console.log('✅ Login bem-sucedido!');
            mostrarMensagem('Login bem-sucedido! Redirecionando...', 'sucesso');
            
            // Redirecionar para a tela principal
            setTimeout(() => {
                console.log('🚀 Redirecionando para main.html');
                window.location.href = 'main.html';
            }, 800);
        } else {
            console.log('❌ Login falhou:', resultado.mensagem);
            mostrarMensagem(resultado.mensagem, 'erro');
        }
    } catch (erro) {
        console.error('❌ Erro no login:', erro);
        mostrarMensagem('Erro ao conectar com o sistema', 'erro');
    }
}

function mostrarMensagem(texto, tipo) {
    const elemento = document.getElementById('mensagem');
    elemento.textContent = texto;
    elemento.className = 'mensagem ' + tipo;
}

async function carregarVersao() {
    try {
        if (window.pywebview && window.pywebview.api) {
            const resultado = await window.pywebview.api.get_version();
            document.getElementById('versao').textContent = 'v' + resultado.version;
        }
    } catch (erro) {
        console.error('Erro ao carregar versão:', erro);
    }
}