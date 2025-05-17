const btnPix = document.getElementById('btn-pix');
const btnCartao = document.getElementById('btn-card');
const pixContent = document.getElementById('pix-content');
const cartaoContent = document.getElementById('card-content');

// Mostrar PIX por padrão e esconder Cartão
window.addEventListener('DOMContentLoaded', () => {
  btnPix.classList.add('selected');
  btnCartao.classList.remove('selected');
  pixContent.style.display = 'block';
  cartaoContent.style.display = 'none';
  atualizarTotal();
});

btnPix.addEventListener('click', () => {
  btnPix.classList.add('selected');
  btnCartao.classList.remove('selected');
  pixContent.style.display = 'block';
  cartaoContent.style.display = 'none';
});

btnCartao.addEventListener('click', () => {
  btnCartao.classList.add('selected');
  btnPix.classList.remove('selected');
  cartaoContent.style.display = 'block';
  pixContent.style.display = 'none';
});

window.addEventListener('load', atualizarTotal);

function atualizarTotal() {
  const totalPagamentoEl = document.getElementById('total-pagamento-valor');
  const valorFinal = localStorage.getItem('valorFinalPagamento');
  totalPagamentoEl.textContent = valorFinal ? `R$ ${valorFinal}` : 'R$ 0,00';
}

document.querySelector('.copy-btn').addEventListener('click', function () {
    const codigoPix = 'eb230773-257e-47a7-b4c8-977a5fb445bd';
    navigator.clipboard.writeText(codigoPix).then(() => {
      alert('Código PIX copiado com sucesso!');
    }).catch(err => {
      alert('Falha ao copiar o código: ' + err);
    });
  });