// Configuração Inicial de Produtos (padrão se o admin ainda não editou)
    const produtosPadrao = [
      { id: 1, nome: "X-Burguer Especial", desc: "Pão artesanal, hambúrguer 150g, queijo prato e molho da casa.", preco: 22.00 },
      { id: 2, nome: "X-Salada Tradicional", desc: "Pão, hambúrguer 120g, queijo, alface, tomate e maionese.", preco: 18.00 },
      { id: 3, nome: "Batata Frita G", desc: "Porção de 400g de batata crocante com cheddar e bacon.", preco: 25.00 }
    ];

    function getProdutos() {
      return JSON.parse(localStorage.getItem('cardapio_lanches')) || produtosPadrao;
    }

    let sacolinha = [];
    const WHATSAPP_NUMERO = "5511999999999"; // Substitua pelo seu número (DDD + número)

    function renderizarProdutos() {
      const container = document.getElementById('lista-produtos');
      const produtos = getProdutos();
      container.innerHTML = '';

      produtos.forEach(p => {
        container.innerHTML += `
          <div class="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100">
            <div class="pr-2">
              <h3 class="font-bold text-gray-800">${p.nome}</h3>
              <p class="text-xs text-gray-500 mb-2">${p.desc}</p>
              <span class="font-bold text-red-600">R$ ${p.preco.toFixed(2)}</span>
            </div>
            <button onclick="adicionarSacolinha(${p.id})" class="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition">
              <i class="fa-solid fa-plus text-lg"></i>
            </button>
          </div>
        `;
      });
    }

    function adicionarSacolinha(id) {
      const produtos = getProdutos();
      const item = produtos.find(p => p.id === id);
      const existe = sacolinha.find(i => i.id === id);

      if (existe) {
        existe.qtd += 1;
      } else {
        sacolinha.push({ ...item, qtd: 1 });
      }
      atualizarSacolinhaUI();
    }

    function alterarQtd(id, delta) {
      const item = sacolinha.find(i => i.id === id);
      if (!item) return;

      item.qtd += delta;
      if (item.qtd <= 0) {
        sacolinha = sacolinha.filter(i => i.id !== id);
      }
      atualizarSacolinhaUI();
    }

    function removerItem(id) {
      sacolinha = sacolinha.filter(i => i.id !== id);
      atualizarSacolinhaUI();
    }

    function atualizarSacolinhaUI() {
      const totalItens = sacolinha.reduce((acc, item) => acc + item.qtd, 0);
      const subtotal = sacolinha.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

      document.getElementById('qtd-sacolinha').innerText = totalItens;
      document.getElementById('total-barra').innerText = `R$ ${subtotal.toFixed(2)}`;

      const containerModal = document.getElementById('itens-sacolinha');
      containerModal.innerHTML = '';

      if (sacolinha.length === 0) {
        containerModal.innerHTML = '<p class="text-center text-gray-400 py-8">Sua sacolinha está vazia.</p>';
      } else {
        sacolinha.forEach(item => {
          containerModal.innerHTML += `
            <div class="flex justify-between items-center border-b pb-2">
              <div>
                <p class="font-semibold text-sm">${item.nome}</p>
                <p class="text-xs text-gray-500">R$ ${item.preco.toFixed(2)} un.</p>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="alterarQtd(${item.id}, -1)" class="w-6 h-6 bg-gray-200 text-gray-700 rounded text-xs font-bold">-</button>
                <span class="text-sm font-semibold">${item.qtd}</span>
                <button onclick="alterarQtd(${item.id}, 1)" class="w-6 h-6 bg-gray-200 text-gray-700 rounded text-xs font-bold">+</button>
                <button onclick="removerItem(${item.id})" class="text-red-500 ml-2 hover:text-red-700">
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          `;
        });
      }

      atualizarTotalSacolinha();
    }

    function atualizarTotalSacolinha() {
      const subtotal = sacolinha.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
      const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked').value;
      const taxa = tipoEntrega === 'entrega' ? 5.00 : 0.00;
      const total = subtotal + taxa;

      document.getElementById('total-sacolinha-modal').innerText = `R$ ${total.toFixed(2)}`;
    }

    function abrirSacolinha() {
      document.getElementById('modal-sacolinha').classList.remove('hidden');
    }

    function fecharSacolinha() {
      document.getElementById('modal-sacolinha').classList.add('hidden');
    }

    function finalizarWhatsApp() {
      if (sacolinha.length === 0) return alert("Sua sacolinha está vazia!");

      const nome = document.getElementById('nome-cliente').value.trim();
      const endereco = document.getElementById('endereco-cliente').value.trim();
      const pagamento = document.getElementById('pagamento-cliente').value;
      const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked').value;

      if (!nome) return alert("Por favor, informe seu nome.");
      if (tipoEntrega === 'entrega' && !endereco) return alert("Por favor, informe o endereço de entrega.");

      let mensagem = `*NOVO PEDIDO - BURGUER & CIA*\n`;
      mensagem += `*Cliente:* ${nome}\n`;
      mensagem += `*Tipo:* ${tipoEntrega === 'entrega' ? 'Entrega em Domicílio' : 'Retirada no Local'}\n`;
      if (tipoEntrega === 'entrega') mensagem += `*Endereço:* ${endereco}\n`;
      mensagem += `*Pagamento:* ${pagamento}\n\n`;
      mensagem += `*ITENS DO PEDIDO:*\n`;

      sacolinha.forEach(i => {
        mensagem += `• ${i.qtd}x ${i.nome} - R$ ${(i.preco * i.qtd).toFixed(2)}\n`;
      });

      const subtotal = sacolinha.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
      const taxa = tipoEntrega === 'entrega' ? 5.00 : 0.00;
      const total = subtotal + taxa;

      if (tipoEntrega === 'entrega') mensagem += `\n*Taxa de Entrega:* R$ 5,00`;
      mensagem += `\n*TOTAL:* R$ ${total.toFixed(2)}`;

      const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    }

    renderizarProdutos();