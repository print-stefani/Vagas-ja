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
  atualizarTotalPix();
  atualizarTotalCartao();
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

window.addEventListener('load', atualizarTotalPix);
window.addEventListener('load', atualizarTotalCartao);

function atualizarTotalPix() {
  const totalPagamentoEl = document.getElementById('total-pagamento-pix');
  const valorFinal = localStorage.getItem('valorFinalPagamento');
  totalPagamentoEl.textContent = valorFinal ? `R$ ${valorFinal}` : 'R$ 0,00';
}

function atualizarTotalCartao() {
  const totalPagamentoEl = document.getElementById('total-pagamento-cartao');
  const valorFinal = localStorage.getItem('valorFinalPagamento');
  totalPagamentoEl.textContent = valorFinal ? `R$ ${valorFinal}` : 'R$ 0,00';
}

// Inputs do cartão
const cardNumberInput = document.getElementById('card-number');
const cardNameInput = document.getElementById('card-name');
const monthInput = document.getElementById('month');
const yearInput = document.getElementById('year');
const cvvInput = document.getElementById('cvv');

// Funções de validação
function validateCardNumber() {
  const val = cardNumberInput.value.replace(/\s+/g, '');
  if (/^\d{13,19}$/.test(val)) {
    cardNumberInput.classList.remove('error');
  } else {
    cardNumberInput.classList.add('error');
  }
}

function validateCardName() {
  if (/[a-zA-Z]/.test(cardNameInput.value.trim())) {
    cardNameInput.classList.remove('error');
  } else {
    cardNameInput.classList.add('error');
  }
}

function validateMonth() {
  const val = parseInt(monthInput.value, 10);
  if (!isNaN(val) && val >= 1 && val <= 12) {
    monthInput.classList.remove('error');
  } else {
    monthInput.classList.add('error');
  }
}

function validateYear() {
  const val = parseInt(yearInput.value, 10);
  const currentYear = new Date().getFullYear();
  if (!isNaN(val) && yearInput.value.length === 4 && val >= currentYear) {
    yearInput.classList.remove('error');
  } else {
    yearInput.classList.add('error');
  }
}

function validateCVV() {
  if (/^\d{3}$/.test(cvvInput.value)) {
    cvvInput.classList.remove('error');
  } else {
    cvvInput.classList.add('error');
  }
}

// Validação enquanto digita
cardNumberInput.addEventListener('input', validateCardNumber);
cardNameInput.addEventListener('input', validateCardName);
monthInput.addEventListener('input', validateMonth);
yearInput.addEventListener('input', validateYear);
cvvInput.addEventListener('input', validateCVV);

// Envio do email com EmailJS
function enviarEmail() {
  const userName = localStorage.getItem('userName'); 
  const estacionamentoSelecionado = JSON.parse(localStorage.getItem('estacionamentoSelecionado'));
  const totalPayment = localStorage.getItem('valorFinalPagamento');
  const reservationDate = localStorage.getItem('dataReserva');
  const userEmail = localStorage.getItem('userEmail'); 

  if (!userName || !estacionamentoSelecionado || !totalPayment || !reservationDate || !userEmail) {
    alert('Faltam dados da reserva para enviar o email.');
    return;
  }

  const templateParams = {
    nome: userName,
    parkingName: estacionamentoSelecionado.nome,
    parkingAddress: estacionamentoSelecionado.endereco,
    totalPayment: totalPayment,
    reservationDate: reservationDate,
    email: userEmail 
  };

  const serviceID = 'service_parking';
  const templateID = 'template_checkout';
  const userID = 'H5nz0ucpXY3x-7tfj';

  emailjs.send(serviceID, templateID, templateParams, userID)
    .then(() => {
      alert('Email enviado com sucesso! Reserva confirmada.');
    })
    .catch((error) => {
      console.error('Erro ao enviar email:', error);
      alert('Falha ao enviar email. Tente novamente.');
    });
}

// Clique no botão de confirmar
document.getElementById('btn-confirmar').addEventListener('click', function (e) {
  e.preventDefault();

  const isCartaoSelecionado = btnCartao.classList.contains('selected');

  if (isCartaoSelecionado) {
    validateCardNumber();
    validateCardName();
    validateMonth();
    validateYear();
    validateCVV();

    const errors = document.querySelectorAll('.form-input.error');
    if (errors.length > 0) {
      alert('Por favor, corrija os campos destacados em vermelho.');
      return;
    }
  }

  // Se for PIX ou cartão válido, envia o e-mail
  enviarEmail();
});
