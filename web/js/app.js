// === VARIÁVEIS GLOBAIS ===
let usuarioLogado = null;

// === INICIALIZAÇÃO ===
window.addEventListener('pywebviewready', function() {
    console.log('PyWebView pronto!');
    carregarVersao();
});

// === FUNÇÕES DE LOGIN ===
async function realizarLogin() {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    
    if (!email || !senha) {
        mostrarMensagem('login-mensagem', 'Preencha todos os campos', 'erro');
        return;
    }
    
    try {
        const resultado = await pywebview.api.login(email, senha);
        
        if (resultado.success) {
            usuarioLogado = resultado.usuario;
            mostrarTelaPrincipal();
        } else {
            mostrarMensagem('login-mensagem', resultado.mensagem, 'erro');
        }
    } catch (erro) {
        console.error('Erro no login:', erro);
        mostrarMensagem('login-mensagem', 'Erro ao conectar com o sistema', 'erro');
    }
}

function realizarLogout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        pywebview.api.logout();
        usuarioLogado = null;
        mostrarTelaLogin();
    }
}

function mostrarTelaPrincipal() {
    document.getElementById('tela-login').classList.remove('ativa');
    document.getElementById('tela-principal').classList.add('ativa');
    
    // Atualizar informações do usuário
    document.getElementById('usuario-nome').textContent = usuarioLogado.nome;
    document.getElementById('usuario-nivel').textContent = usuarioLogado.nivel_acesso;
    
    // Carregar dados iniciais
    carregarDashboard();
}

function mostrarTelaLogin() {
    document.getElementById('tela-login').classList.add('ativa');
    document.getElementById('tela-principal').classList.remove('ativa');
    
    // Limpar campos
    document.getElementById('login-email').value = '';
    document.getElementById('login-senha').value = '';
}

// === NAVEGAÇÃO ===
function mostrarSecao(nomeSecao) {
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
    try {
        const produtos = await pywebview.api.listar_produtos();
        const clientes = await pywebview.api.listar_clientes();
        
        document.getElementById('total-produtos').textContent = produtos.produtos.length;
        document.getElementById('total-clientes').textContent = clientes.clientes.length;
    } catch (erro) {
        console.error('Erro ao carregar dashboard:', erro);
    }
}

// === PRODUTOS ===
async function carregarProdutos() {
    try {
        const resultado = await pywebview.api.listar_produtos();
        
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
        }
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
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
        const resultado = await pywebview.api.adicionar_produto(dados);
        
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
}

// === CLIENTES ===
async function carregarClientes() {
    try {
        const resultado = await pywebview.api.listar_clientes();
        
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
        }
    } catch (erro) {
        console.error('Erro ao carregar clientes:', erro);
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
        const resultado = await pywebview.api.adicionar_cliente(dados);
        
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
        const resultado = await pywebview.api.get_version();
        document.getElementById('app-version').textContent = 'v' + resultado.version;
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
    const senhaInput = document.getElementById('login-senha');
    if (senhaInput) {
        senhaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                realizarLogin();
            }
        });
    }
});