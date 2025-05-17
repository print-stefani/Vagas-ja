// Recupera os dados do estacionamento selecionado
const dados = JSON.parse(localStorage.getItem('estacionamentoSelecionado'));

if (dados) {
  const container = document.getElementById('estacionamento-info');
  container.innerHTML = `
    <img src="${dados.foto}" alt="Imagem do estacionamento" class="card-img-top">
    <div class="card-body">
        <h5 class="card-title">${dados.nome}</h5>
        <p class="card-text"><strong>Endereço:</strong> ${dados.endereco}</p>
        <p class="card-text preco-hora"><strong>Preço:</strong> R$ ${dados.preco}/hora</p>
        <p class="card-text linha-preco" style="display: flex; justify-content: space-between;">
        <span id="preco-hora-label">Preço por 1 hora</span>
        <span id="preco-hora-valor">R$ ${dados.preco}</span>
        </p>
        <p class="card-text taxa-servico" style="display:flex; justify-content: space-between; margin-top: 5px;">
        <span>Taxa de serviço</span>
        <span id="taxa-servico-valor">R$ 0,00</span>
        </p>
        <p class="card-text valor-final" style="display:flex; justify-content: space-between; font-weight: bold; margin-top: 10px; font-size: 1.1em;">
        <span>Valor Final</span>
        <span id="valor-final-valor">R$ 0,00</span>
        </p>
    </div>
  `;
} else {
  document.getElementById('estacionamento-info').innerHTML = `
    <p class="text-danger">Nenhum estacionamento foi selecionado.</p>
  `;
}



// Função para formatar valor em moeda brasileira
function formatarValor(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
const duracaoInput = document.getElementById('duracao');

duracaoInput.addEventListener('input', () => {
  const horas = parseInt(duracaoInput.value);
  if (!isNaN(horas) && dados) {
    const precoPorHora = parseFloat(dados.preco);
    const total = precoPorHora * horas;
    const taxa = precoPorHora * 0.2;
    const valorFinal = total + taxa;

    // Atualiza os textos dinamicamente
    document.getElementById('preco-hora-label').textContent = `Preço por ${horas} hora${horas > 1 ? 's' : ''}`;
    document.getElementById('preco-hora-valor').textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('taxa-servico-valor').textContent = `R$ ${taxa.toFixed(2)}`;
    document.getElementById('valor-final-valor').textContent = `R$ ${valorFinal.toFixed(2)}`;

    localStorage.setItem('valorFinalPagamento', valorFinal.toFixed(2));

  }
});


// AJUSTE CALENDARIO E HORA RESERVA

window.addEventListener('DOMContentLoaded', () => {
    const inputEntrada = document.getElementById('entrada');
    if (inputEntrada) {
      const agora = new Date();
  
      const ano = agora.getFullYear();
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const dia = String(agora.getDate()).padStart(2, '0');
      const hora = String(agora.getHours()).padStart(2, '0');
      const minuto = String(agora.getMinutes()).padStart(2, '0');
  
      const dataMinima = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
      inputEntrada.min = dataMinima;
  
      // Exemplo: quando o usuário mudar a data, mostramos ela formatada:
      inputEntrada.addEventListener('change', () => {
        const valor = new Date(inputEntrada.value);
        if (!isNaN(valor)) {
          const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          const dia = valor.getDate();
          const mes = meses[valor.getMonth()];
          const ano = valor.getFullYear();
          const hora = String(valor.getHours()).padStart(2, '0');
          const min = String(valor.getMinutes()).padStart(2, '0');
  
          const dataFormatada = `${dia} ${mes} ${ano}, ${hora}:${min}`;
          console.log("Data formatada:", dataFormatada);
          // Você pode mostrar essa string onde quiser no seu HTML.
        }
      });
    }
  });

