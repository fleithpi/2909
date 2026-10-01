/**
 * ProgWeb 2 — Roteiro Prático 03 (Atividade Autônoma de 2 Semanas)
 * Tema: Lanchonete Express — Calculadora de Pedidos & Carrinho
 * Tecnologias: Bootstrap 5 + jQuery + LocalStorage
 */

$(document).ready(function() {

  // Estado global da aplicação
  let cupomAtivo = false;
  const PERCENTUAL_DESCONTO = 0.10; // 10% de desconto

  // =====================================================
  // 1. FUNÇÃO AUXILIAR DE FORMATAÇÃO DE MOEDA (R$)
  // =====================================================
  function formatarMoeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
  }

  // =====================================================
  // 2. FUNÇÃO PRINCIPAL DE CÁLCULO DO PEDIDO
  // =====================================================
  function calcularTotal() {
    // A. Leitura do Lanche Principal (Leitura + Conversão Float)
    const precoLanche = parseFloat($('#select-lanche').val()) || 0;

    // B. Soma dos Adicionais Selecionados (.each() nos checkboxes marcados)
    let somaAdicionais = 0;
    $('.check-adicional:checked').each(function() {
      somaAdicionais += parseFloat($(this).val()) || 0;
    });

    // C. Leitura da Quantidade (Integer)
    let qtd = parseInt($('#input-qtd').val()) || 1;
    if (qtd < 1) {
      qtd = 1;
      $('#input-qtd').val(1);
    }

    // D. Cálculo do Subtotal
    const precoUnitario = precoLanche + somaAdicionais;
    const subtotal = precoUnitario * qtd;

    // E. Taxa de Entrega
    const taxaEntrega = parseFloat($('#select-entrega').val()) || 0;

    // F. Cálculo do Desconto (se o cupom estiver ativo)
    let valorDesconto = 0;
    if (cupomAtivo && subtotal > 0) {
      valorDesconto = subtotal * PERCENTUAL_DESCONTO;
    }

    // G. Total Geral Final
    const totalGeral = subtotal + taxaEntrega - valorDesconto;

    // H. Atualização da Interface (Escrever na Tela com .text())
    $('#res-lanche-unit').text(formatarMoeda(precoLanche));
    $('#res-adicionais').text(formatarMoeda(somaAdicionais));
    $('#res-subtotal').text(formatarMoeda(subtotal));
    $('#res-entrega').text(formatarMoeda(taxaEntrega));
    $('#res-desconto').text('- ' + formatarMoeda(valorDesconto));
    $('#total-geral').text(formatarMoeda(totalGeral < 0 ? 0 : totalGeral));
  }

  // =====================================================
  // 3. ESCUTADORES DE EVENTO EM TEMPO REAL (input & change)
  // =====================================================

  // Atualiza instantaneamente ao trocar o lanche principal ou tipo de entrega
  $('#select-lanche, #select-entrega').on('change', function() {
    calcularTotal();
  });

  // Atualiza instantaneamente ao marcar/desmarcar adicionais
  $('.check-adicional').on('change', function() {
    calcularTotal();
  });

  // Atualiza em tempo real enquanto o aluno digita a quantidade
  $('#input-qtd').on('input change', function() {
    calcularTotal();
  });

  // Botões de mais (+) e menos (-) na quantidade
  $('#btn-mais').on('click', function() {
    let qtd = parseInt($('#input-qtd').val()) || 1;
    $('#input-qtd').val(qtd + 1);
    calcularTotal();
  });

  $('#btn-menos').on('click', function() {
    let qtd = parseInt($('#input-qtd').val()) || 1;
    if (qtd > 1) {
      $('#input-qtd').val(qtd - 1);
      calcularTotal();
    }
  });

  // Aplicação do Cupom de Desconto
  $('#btn-aplicar-cupom').on('click', function() {
    const codigo = $('#input-cupom').val().trim().toUpperCase();
    
    if (codigo === 'IFSC10') {
      cupomAtivo = true;
      $('#msg-cupom').removeClass('d-none');
    }
      else if (codigo ==='ALUNOIFSC10'){
        cupomAtivo = true;
        $('#msg-cupom').removeClass('d-none');
      }
      else if (codigo ==='PROFESSOR25'){
        cupomAtivo = true;
        $('#msg-cupom').removeClass('d-none');
      }
    else {
      cupomAtivo = false;
      $('#msg-cupom').addClass('d-none');
      if (codigo !== '') {
        alert('Cupom inválido! Utilize o cupom IFSC10 para 10% de desconto. OU ALUNO IFSC10 OU PROFESSOR25'); //AQUI É UM PROBLEMA, POis não deve mostrar qual o cupom o cliente deve utilizar... 
      }
    }
    calcularTotal();
  });

  // =====================================================
  // 4. PERSISTÊNCIA NO LOCALSTORAGE & AUTO-RELOAD (F5)
  // =====================================================

  // Finalizar e salvar rascunho no LocalStorage
  $('#btn-finalizar').on('click', function() {
    const precoLanche = parseFloat($('#select-lanche').val()) || 0;
    
    if (precoLanche === 0) {
      alert('Por favor, selecione um lanche principal antes de finalizar o pedido!');
      return;
    }

    // Monta objeto com o estado do pedido
    const pedido = {
      lanche: $('#select-lanche').val(),
      adicionais: $('.check-adicional:checked').map(function() { return $(this).attr('id'); }).get(),
      quantidade: $('#input-qtd').val(),
      entrega: $('#select-entrega').val(),
      cupom: $('#input-cupom').val(),
      cupomAtivo: cupomAtivo,
      dataHora: new Date().toLocaleString('pt-BR')
    };

    // Grava no LocalStorage em formato JSON String
    localStorage.setItem('rascunho_pedido_lanchonete', JSON.stringify(pedido));

    // Exibe feedback animado com .removeClass('d-none') e .fadeIn()
    $('#alerta-sucesso').removeClass('d-none').hide().fadeIn(400);
    setTimeout(function() {
      $('#alerta-sucesso').fadeOut(400);
    }, 4000);
  });

  // Limpar formulário e apagar do LocalStorage
  $('#btn-limpar').on('click', function() {
    $('#form-pedido')[0].reset();
    $('.check-adicional').prop('checked', false);
    $('#input-qtd').val(1);
    cupomAtivo = false;
    $('#msg-cupom').addClass('d-none');
    localStorage.removeItem('rascunho_pedido_lanchonete');
    calcularTotal();
  });

  // Carregar rascunho automaticamente ao abrir a página (F5)
  function carregarRascunhoStorage() {
    const rascunhoSalvo = localStorage.getItem('rascunho_pedido_lanchonete');
    if (rascunhoSalvo) {
      try {
        const pedido = JSON.parse(rascunhoSalvo);
        $('#select-lanche').val(pedido.lanche);
        $('#input-qtd').val(pedido.quantidade);
        $('#select-entrega').val(pedido.entrega);
        $('#input-cupom').val(pedido.cupom || '');

        if (pedido.cupomAtivo && pedido.cupom.toUpperCase() === 'IFSC10') {
          cupomAtivo = true;
          $('#msg-cupom').removeClass('d-none');
        }

        if (pedido.adicionais && Array.isArray(pedido.adicionais)) {
          pedido.adicionais.forEach(function(id) {
            $('#' + id).prop('checked', true);
          });
        }
      } catch (e) {
        console.error('Erro ao ler o rascunho do LocalStorage', e);
      }
    }
  }

  // Inicialização inicial
  carregarRascunhoStorage();
  calcularTotal();

});
