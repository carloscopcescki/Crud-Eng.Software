// CRUD de Produtos - Sistema de Gestão

class GerenciadorProdutos {
  constructor() {
    this.produtos = [];
    this.produtoEmEdicao = null;
    this.proximoId = 1;
    this.carregarDoLocalStorage();
    this.inicializarEventos();
    this.renderizarTabela();
  }

  // ============ INICIALIZAÇÃO ============
  inicializarEventos() {
    const btnCadastrar = document.querySelector('.btn-cadastrar');
    const inputBusca = document.querySelector('.search-box input');
    const iconLimpar = document.querySelector('.limpar');
    const btnFiltro = document.querySelector('.btn-filtro');

    btnCadastrar.addEventListener('click', () => this.salvarProduto());
    inputBusca.addEventListener('input', (e) => this.filtrarPorNome(e.target.value));
    iconLimpar.addEventListener('click', () => this.limparBusca());
    btnFiltro.addEventListener('click', () => this.abrirModalFiltro());

    // Permitir Enviar com Enter
    document.querySelector('.formulario').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.salvarProduto();
      }
    });
  }

  // ============ VALIDAÇÃO ============
  validarCampos() {
    const nome = document.getElementById('nome').value.trim();
    const categoria = document.getElementById('categoria').value;
    const fornecedor = document.getElementById('fornecedor').value.trim();
    const preco = document.getElementById('preco').value.trim();

    if (!nome) {
      alert('Por favor, preencha o Nome do produto');
      return false;
    }
    if (!categoria) {
      alert('Por favor, selecione uma Categoria');
      return false;
    }
    if (!fornecedor) {
      alert('Por favor, preencha o Fornecedor');
      return false;
    }
    if (!preco || isNaN(preco) || parseFloat(preco) <= 0) {
      alert('Por favor, insira um Preço válido');
      return false;
    }

    return true;
  }

  // ============ SALVAR PRODUTO ============
  salvarProduto() {
    if (!this.validarCampos()) return;

    const nome = document.getElementById('nome').value.trim();
    const categoria = document.getElementById('categoria').value;
    const fornecedor = document.getElementById('fornecedor').value.trim();
    const preco = parseFloat(document.getElementById('preco').value);

    if (this.produtoEmEdicao !== null) {
      // EDITAR
      const produto = this.produtos.find(p => p.id === this.produtoEmEdicao);
      if (produto) {
        produto.nome = nome;
        produto.categoria = categoria;
        produto.fornecedor = fornecedor;
        produto.preco = preco;
      }
      this.produtoEmEdicao = null;
      alert('Produto atualizado com sucesso!');
    } else {
      // CRIAR
      const novoProduto = {
        id: this.proximoId++,
        nome,
        categoria,
        fornecedor,
        preco
      };
      this.produtos.push(novoProduto);
      alert('Produto cadastrado com sucesso!');
    }

    this.salvarNoLocalStorage();
    this.limparFormulario();
    this.renderizarTabela();
  }

  // ============ EDITAR PRODUTO ============
  editarProduto(id) {
    const produto = this.produtos.find(p => p.id === id);
    if (!produto) return;

    this.produtoEmEdicao = id;
    document.getElementById('nome').value = produto.nome;
    document.getElementById('categoria').value = produto.categoria;
    document.getElementById('fornecedor').value = produto.fornecedor;
    document.getElementById('preco').value = produto.preco;

    document.querySelector('.btn-cadastrar').textContent = 'Atualizar';
    document.getElementById('nome').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============ DELETAR PRODUTO ============
  deletarProduto(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      this.produtos = this.produtos.filter(p => p.id !== id);
      this.salvarNoLocalStorage();
      this.renderizarTabela();
      alert('Produto deletado com sucesso!');
    }
  }

  // ============ RENDERIZAR TABELA ============
  renderizarTabela() {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    if (this.produtos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="color: #999;">Nenhum produto cadastrado</td></tr>';
      return;
    }

    this.produtos.forEach(produto => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${produto.id}</td>
        <td>${produto.nome}</td>
        <td>${produto.fornecedor}</td>
        <td>${produto.categoria}</td>
        <td>R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
        <td>
          <button class="acao editar" onclick="gerenciador.editarProduto(${produto.id})">Editar</button>
          <button class="acao excluir" onclick="gerenciador.deletarProduto(${produto.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ============ FILTROS ============
  filtrarPorNome(valor) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    const produtosFiltrados = valor.trim() === '' 
      ? this.produtos 
      : this.produtos.filter(p => 
          p.nome.toLowerCase().includes(valor.toLowerCase())
        );

    if (produtosFiltrados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="color: #999;">Nenhum resultado encontrado</td></tr>';
      return;
    }

    produtosFiltrados.forEach(produto => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${produto.id}</td>
        <td>${produto.nome}</td>
        <td>${produto.fornecedor}</td>
        <td>${produto.categoria}</td>
        <td>R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
        <td>
          <button class="acao editar" onclick="gerenciador.editarProduto(${produto.id})">Editar</button>
          <button class="acao excluir" onclick="gerenciador.deletarProduto(${produto.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  limparBusca() {
    document.querySelector('.search-box input').value = '';
    this.renderizarTabela();
  }

  abrirModalFiltro() {
    const filtro = prompt('Filtrar por Categoria:\n1. Material Escolar\n2. Eletrônicos\n3. Educação\n\nDigite o número (ou deixe em branco para cancelar):');
    
    if (filtro === null) return;

    const categoriasMap = {
      '1': 'material',
      '2': 'eletronico',
      '3': 'educacao'
    };

    const categoriaFiltro = categoriasMap[filtro];
    if (!categoriaFiltro) {
      alert('Opção inválida');
      return;
    }

    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    const produtosFiltrados = this.produtos.filter(p => p.categoria === categoriaFiltro);

    if (produtosFiltrados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="color: #999;">Nenhum produto nesta categoria</td></tr>';
      return;
    }

    produtosFiltrados.forEach(produto => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${produto.id}</td>
        <td>${produto.nome}</td>
        <td>${produto.fornecedor}</td>
        <td>${produto.categoria}</td>
        <td>R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
        <td>
          <button class="acao editar" onclick="gerenciador.editarProduto(${produto.id})">Editar</button>
          <button class="acao excluir" onclick="gerenciador.deletarProduto(${produto.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ============ LIMPEZA ============
  limparFormulario() {
    document.getElementById('nome').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('fornecedor').value = '';
    document.getElementById('preco').value = '';
    document.querySelector('.btn-cadastrar').textContent = 'Cadastrar';
    document.getElementById('nome').focus();
  }

  // ============ ARMAZENAMENTO ============
  salvarNoLocalStorage() {
    localStorage.setItem('produtos', JSON.stringify(this.produtos));
    localStorage.setItem('proximoId', this.proximoId.toString());
  }

  carregarDoLocalStorage() {
    const produtosArmazenados = localStorage.getItem('produtos');
    const proximoIdArmazenado = localStorage.getItem('proximoId');

    if (produtosArmazenados) {
      this.produtos = JSON.parse(produtosArmazenados);
    }

    if (proximoIdArmazenado) {
      this.proximoId = parseInt(proximoIdArmazenado);
    }
  }

  // ============ EXPORTAÇÃO DE DADOS ============
  exportarJSON() {
    const dataStr = JSON.stringify(this.produtos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'produtos.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  limparTodos() {
    if (confirm('Tem certeza que deseja deletar TODOS os produtos? Esta ação não pode ser desfeita!')) {
      this.produtos = [];
      this.proximoId = 1;
      this.salvarNoLocalStorage();
      this.renderizarTabela();
      this.limparFormulario();
      alert('Todos os produtos foram deletados!');
    }
  }
}

// ============ INICIALIZAR O GERENCIADOR ============
let gerenciador;
document.addEventListener('DOMContentLoaded', () => {
  gerenciador = new GerenciadorProdutos();
});
