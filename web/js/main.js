console.log('📱 Main.js carregado');

let usuarioLogado = null;

// Esperar o PyWebView estar pronto
window.addEventListener('pywebviewready', inicializar);

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
    
    // VERIFICAR SESSÃO ANTES DE FAZER QUALQUER COISA
    const sessaoValida = await verificarSessao();
    
    if (!sessaoValida) {
        console.log('🚫 Sessão inválida - redirecionando para login');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('✅ Sessão válida - carregando aplicação');
    carregarVersao();
    carregarDashboard();
}

// ========================================
// VERIFICAÇÃO DE SESSÃO
// ========================================
async function verificarSessao() {
    try {
        const resultado = await window.pywebview.api.verificar_sessao();
        
        if (resultado.success) {
            usuarioLogado = resultado.usuario;
            
            // Atualizar interface com dados do usuário
            document.getElementById('usuario-nome').textContent = usuarioLogado.nome;
            document.getElementById('usuario-nivel').textContent = usuarioLogado.nivel_acesso;
            
            console.log('👤 Usuário logado:', usuarioLogado.nome);
            return true;
        } else {
            console.log('❌ Sessão inválida:', resultado.codigo);
            return false;
        }
    } catch (erro) {
        console.error('❌ Erro ao verificar sessão:', erro);
        return false;
    }
}

// ========================================
// LOGOUT
// ========================================
async function realizarLogout() {
    if (!confirm('Deseja realmente sair do sistema?')) {
        return;
    }
    
    try {
        await window.pywebview.api.logout();
        console.log('👋 Logout realizado');
        window.location.href = 'login.html';
    } catch (erro) {
        console.error('Erro no logout:', erro);
    }
}

// ========================================
// NAVEGAÇÃO
// ========================================
function mostrarSecao(nomeSecao) {
    console.log('📂 Navegando para:', nomeSecao);
    
    // Remover classe 'ativa' de todos os botões
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.classList.remove('ativo');
    });
    
    // Adicionar classe 'ativa' no botão clicado
    event.target.classList.add('ativo');
    
    // Esconder todas as seções
    document.querySelectorAll('.secao').forEach(secao => {
        secao.classList.remove('ativa');
    });
    
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

// ========================================
// DASHBOARD
// ========================================
async function carregarDashboard() {
    console.log('📊 Carregando dashboard...');
    
    try {
        const produtos = await window.pywebview.api.listar_produtos();
        const clientes = await window.pywebview.api.listar_clientes();
        
        // Verificar se houve erro de autenticação
        if (produtos.codigo === 401 || clientes.codigo === 401) {
            console.log('🚫 Sessão expirada');
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = 'login.html';
            return;
        }
        
        document.getElementById('total-produtos').textContent = produtos.produtos.length;
        document.getElementById('total-clientes').textContent = clientes.clientes.length;
        
        console.log('✅ Dashboard carregado');
    } catch (erro) {
        console.error('❌ Erro ao carregar dashboard:', erro);
    }
}

// ========================================
// PRODUTOS
// ========================================
async function carregarProdutos() {
    console.log('👕 Carregando produtos...');
    
    try {
        const resultado = await window.pywebview.api.listar_produtos();
        
        if (resultado.codigo === 401) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = 'login.html';
            return;
        }
        
        if (resultado.success) {
            const produtos = resultado.produtos;
            let html = '';
            
            if (produtos.length === 0) {
                html = '<p style="text-align: center; color: #999;">Nenhum produto cadastrado.</p>';
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
                    const estoqueClasse = produto.estoque <= produto.estoque_minimo ? 'style="color: red; font-weight: bold;"' : '';
                    html += `
                        <tr>
                            <td>${produto.codigo_barras || '-'}</td>
                            <td><strong>${produto.nome}</strong></td>
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
        
        if (resultado.codigo === 401) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = 'login.html';
            return;
        }
        
        if (resultado.codigo === 403) {
            mostrarMensagem('produto-mensagem', resultado.mensagem, 'erro');
            return;
        }
        
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
    document.getElementById('produto-mensagem').className = 'mensagem';
    document.getElementById('produto-mensagem').textContent = '';
}

// ========================================
// CLIENTES
// ========================================
async function carregarClientes() {
    console.log('👥 Carregando clientes...');
    
    try {
        const resultado = await window.pywebview.api.listar_clientes();
        
        if (resultado.codigo === 401) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = 'login.html';
            return;
        }
        
        if (resultado.success) {
            const clientes = resultado.clientes;
            let html = '';
            
            if (clientes.length === 0) {
                html = '<p style="text-align: center; color: #999;">Nenhum cliente cadastrado.</p>';
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
                            <td><strong>${cliente.nome}</strong></td>
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
        
        if (resultado.codigo === 401) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = 'login.html';
            return;
        }
        
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
    document.getElementById('cliente-mensagem').className = 'mensagem';
    document.getElementById('cliente-mensagem').textContent = '';
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================
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