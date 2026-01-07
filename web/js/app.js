// === VARIÁVEIS GLOBAIS ===
let usuarioLogado = null;

// === INICIALIZAÇÃO ===
console.log('Script carregado!');

// Esperar o PyWebView estar pronto
window.addEventListener('pywebviewready', function() {
    console.log('✅ PyWebView está pronto!');
    carregarVersao();
});

// Se pywebview já estiver disponível (caso o evento já tenha disparado)
setTimeout(() => {
    if (window.pywebview) {
        console.log('✅ PyWebView detectado diretamente');
        carregarVersao();
    } else {
        console.log('⏳ Aguardando PyWebView...');
    }
}, 500);

// === FUNÇÕES DE LOGIN ===
async function realizarLogin() {
    console.log('🔐 Tentando fazer login...');
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    
    console.log('Email digitado:', email);
    
    if (!email || !senha) {
        mostrarMensagem('login-mensagem', 'Preencha todos os campos', 'erro');
        return;
    }
    
    // Verificar se pywebview está disponível
    if (!window.pywebview || !window.pywebview.api) {
        console.error('❌ PyWebView não está disponível!');
        mostrarMensagem('login-mensagem', 'Erro: Sistema não inicializado', 'erro');
        return;
    }
    
    try {
        console.log('📡 Enviando requisição de login...');
        const resultado = await window.pywebview.api.login(email, senha);
        console.log('📥 Resposta recebida:', resultado);
        
        if (resultado.success) {
            console.log('✅ Login bem-sucedido!');
            usuarioLogado = resultado.usuario;
            mostrarTelaPrincipal();
        } else {
            console.log('❌ Login falhou:', resultado.mensagem);
            mostrarMensagem('login-mensagem', resultado.mensagem, 'erro');
        }
    } catch (erro) {
        console.error('❌ Erro no login:', erro);
        mostrarMensagem('login-mensagem', 'Erro ao conectar com o sistema', 'erro');
    }
}

function realizarLogout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        window.pywebview.api.logout();
        usuarioLogado = null;
        mostrarTelaLogin();
    }
}

function mostrarTelaPrincipal() {
    console.log('📺 Mostrando tela principal...');
    
    // Esconder tela de login
    document.getElementById('tela-login').classList.remove('ativa');
    
    // Mostrar tela principal
    document.getElementById('tela-principal').classList.add('ativa');
    
    // Atualizar informações do usuário
    document.getElementById('usuario-nome').textContent = usuarioLogado.nome;
    document.getElementById('usuario-nivel').textContent = usuarioLogado.nivel_acesso;
    
    // Carregar dados iniciais
    carregarDashboard();
}

function mostrarTelaLogin() {
    console.log('📺 Mostrando tela de login...');
    
    // Mostrar tela de login
    document.getElementById('tela-login').classList.add('ativa');
    
    // Esconder tela principal
    document.getElementById('tela-principal').classList.remove('ativa');
    
    // Limpar campos
    document.getElementById('login-email').value = '';
    document.getElementById('login-senha').value = '';
    
    // Limpar mensagens
    const mensagem = document.getElementById('login-mensagem');
    mensagem.className = 'mensagem';
    mensagem.textContent = '';
}

// === NAVEGAÇÃO ===
function mostrarSecao(nomeSecao) {
    console.log('📂 Navegando para:', nomeSecao);
    
    // Esconder todas as seções
    const secoes = document.querySelectorAll('.secao');
    secoes.forEach(secao => secao.classList.remove('ativa'));
    
    // Mostrar a seção selecionada
    document.getElementById('secao-' + nomeSecao).classList.add('ativa');
    
    // Carregar dados da seção
    if (nomeSecao === 'produtos') {
        carregarProdutos();
    } else if (nomeSecao === 'clientes') {
        carregarClientes();
    } else if (nomeSecao === 'dashboard') {
        carregarDashboard();
    }
}

// === DASHBOARD ===
async function carregarDashboard() {
    console.log('📊 Carregando dashboard...');
    
    try {
        const produtos = await window.pywebview.api.listar_produtos();
        const clientes = await window.pywebview.api.listar_clientes();
        
        document.getElementById('total-produtos').textContent = produtos.produtos.length;
        document.getElementById('total-clientes').textContent = clientes.clientes.length;
        
        console.log('✅ Dashboard carregado!');
    } catch (erro) {
        console.error('❌ Erro ao carregar dashboard:', erro);
    }
}

// === PRODUTOS ===
async function carregarProdutos() {
    console.log('👕 Carregando produtos...');
    
    try {
        const resultado = await window.pywebview.api.listar_produtos();
        
        if (resultado.success) {
            const produtos = resultado.produtos;
            let html = '';
            
            if (produtos.length === 0) {
                html = '<p>Nenhum produto cadastrado.</p>';
            } else {
                html = `
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Tamanho</th>
                                <th>Cor</th>
                                <th>Preço</th>
                                <th>Estoque</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                produtos.forEach(produto => {
                    const estoqueClasse = produto.estoque <= produto.estoque_minimo ? 'style="color: red;"' : '';
                    html += `
                        <tr>
                            <td>${produto.codigo_barras || '-'}</td>
                            <td>${produto.nome}</td>
                            <td>${produto.categoria || '-'}</td>
                            <td>${produto.tamanho || '-'}</td>
                            <td>${produto.cor || '-'}</td>
                            <td>R$ ${parseFloat(produto.preco_venda).toFixed(2)}</td>
                            <td ${estoqueClasse}>${produto.estoque}</td>
                        </tr>
                    `;
                });
                
                html += '</tbody></table>';
            }
            
            document.getElementById('lista-produtos').innerHTML = html;
            console.log('✅ Produtos carregados:', produtos.length);
        }
    } catch (erro) {
        console.error('❌ Erro ao carregar produtos:', erro);
    }
}

function mostrarFormProduto() {
    document.getElementById('modal-produto').classList.add('ativo');
}

async function salvarProduto() {
    const dados = {
        nome: document.getElementById('produto-nome').value,
        descricao: document.getElementById('produto-descricao').value,
        categoria: document.getElementById('produto-categoria').value,
        tamanho: document.getElementById('produto-tamanho').value,
        cor: document.getElementById('produto-cor').value,
        preco_compra: parseFloat(document.getElementById('produto-preco-compra').value) || 0,
        preco_venda: parseFloat(document.getElementById('produto-preco-venda').value),
        estoque: parseInt(document.getElementById('produto-estoque').value) || 0,
        estoque_minimo: parseInt(document.getElementById('produto-estoque-minimo').value) || 5,
        codigo_barras: document.getElementById('produto-codigo').value
    };
    
    if (!dados.nome || !dados.preco_venda) {
        mostrarMensagem('produto-mensagem', 'Preencha os campos obrigatórios', 'erro');
        return;
    }
    
    try {
        const resultado = await window.pywebview.api.adicionar_produto(dados);
        
        if (resultado.success) {
            mostrarMensagem('produto-mensagem', resultado.mensagem, 'sucesso');
            setTimeout(() => {
                fecharModal('modal-produto');
                carregarProdutos();
                limparFormProduto();
            }, 1500);
        } else {
            mostrarMensagem('produto-mensagem', resultado.mensagem, 'erro');
        }
    } catch (erro) {
        console.error('Erro ao salvar produto:', erro);
        mostrarMensagem('produto-mensagem', 'Erro ao salvar produto', 'erro');
    }
}

function limparFormProduto() {
    document.getElementById('produto-nome').value = '';
    document.getElementById('produto-descricao').value = '';
    document.getElementById('produto-categoria').value = '';
    document.getElementById('produto-tamanho').value = '';
    document.getElementById('produto-cor').value = '';
    document.getElementById('produto-preco-compra').value = '';
    document.getElementById('produto-preco-venda').value = '';
    document.getElementById('produto-estoque').value = '0';
    document.getElementById('produto-estoque-minimo').value = '5';
    document.getElementById('produto-codigo').value = '';
    
    // Limpar mensagem
    const mensagem = document.getElementById('produto-mensagem');
    mensagem.className = 'mensagem';
    mensagem.textContent = '';
}

// === CLIENTES ===
async function carregarClientes() {
    console.log('👥 Carregando clientes...');
    
    try {
        const resultado = await window.pywebview.api.listar_clientes();
        
        if (resultado.success) {
            const clientes = resultado.clientes;
            let html = '';
            
            if (clientes.length === 0) {
                html = '<p>Nenhum cliente cadastrado.</p>';
            } else {
                html = `
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Telefone</th>
                                <th>Email</th>
                                <th>Cidade</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                clientes.forEach(cliente => {
                    html += `
                        <tr>
                            <td>${cliente.nome}</td>
                            <td>${cliente.cpf || '-'}</td>
                            <td>${cliente.telefone || '-'}</td>
                            <td>${cliente.email || '-'}</td>
                            <td>${cliente.cidade || '-'}</td>
                        </tr>
                    `;
                });
                
                html += '</tbody></table>';
            }
            
            document.getElementById('lista-clientes').innerHTML = html;
            console.log('✅ Clientes carregados:', clientes.length);
        }
    } catch (erro) {
        console.error('❌ Erro ao carregar clientes:', erro);
    }
}

function mostrarFormCliente() {
    document.getElementById('modal-cliente').classList.add('ativo');
}

async function salvarCliente() {
    const dados = {
        nome: document.getElementById('cliente-nome').value,
        cpf: document.getElementById('cliente-cpf').value,
        telefone: document.getElementById('cliente-telefone').value,
        email: document.getElementById('cliente-email').value,
        endereco: document.getElementById('cliente-endereco').value,
        cidade: document.getElementById('cliente-cidade').value,
        estado: document.getElementById('cliente-estado').value,
        cep: document.getElementById('cliente-cep').value
    };
    
    if (!dados.nome) {
        mostrarMensagem('cliente-mensagem', 'Preencha o nome do cliente', 'erro');
        return;
    }
    
    try {
        const resultado = await window.pywebview.api.adicionar_cliente(dados);
        
        if (resultado.success) {
            mostrarMensagem('cliente-mensagem', resultado.mensagem, 'sucesso');
            setTimeout(() => {
                fecharModal('modal-cliente');
                carregarClientes();
                limparFormCliente();
            }, 1500);
        } else {
            mostrarMensagem('cliente-mensagem', resultado.mensagem, 'erro');
        }
    } catch (erro) {
        console.error('Erro ao salvar cliente:', erro);
        mostrarMensagem('cliente-mensagem', 'Erro ao salvar cliente', 'erro');
    }
}

function limparFormCliente() {
    document.getElementById('cliente-nome').value = '';
    document.getElementById('cliente-cpf').value = '';
    document.getElementById('cliente-telefone').value = '';
    document.getElementById('cliente-email').value = '';
    document.getElementById('cliente-endereco').value = '';
    document.getElementById('cliente-cidade').value = '';
    document.getElementById('cliente-estado').value = '';
    document.getElementById('cliente-cep').value = '';
    
    // Limpar mensagem
    const mensagem = document.getElementById('cliente-mensagem');
    mensagem.className = 'mensagem';
    mensagem.textContent = '';
}

// === FUNÇÕES AUXILIARES ===
function mostrarMensagem(elementoId, texto, tipo) {
    const elemento = document.getElementById(elementoId);
    elemento.textContent = texto;
    elemento.className = 'mensagem ' + tipo;
}

function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('ativo');
}

async function carregarVersao() {
    try {
        if (window.pywebview && window.pywebview.api) {
            const resultado = await window.pywebview.api.get_version();
            document.getElementById('app-version').textContent = 'v' + resultado.version;
            console.log('✅ Versão carregada:', resultado.version);
        }
    } catch (erro) {
        console.error('Erro ao carregar versão:', erro);
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('ativo');
    }
}

// Permitir login com Enter
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado!');
    
    const senhaInput = document.getElementById('login-senha');
    if (senhaInput) {
        senhaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                realizarLogin();
            }
        });
    }
    
    const emailInput = document.getElementById('login-email');
    if (emailInput) {
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                realizarLogin();
            }
        });
    }
});