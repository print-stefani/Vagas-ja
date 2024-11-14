// Encontra a chave da API
const key = window.process.env.API_KEY;

async function loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initMap`;
    script.async = true;
    document.body.appendChild(script);
}

// Chamar a função para carregar o script
window.addEventListener('load', loadGoogleMapsScript);

var map;
var markers = [];
var searchBox;
var infowindow;
var isMobile;

// Variáveis de controle para a quantidade de itens a exibir
let estacionamentos = []; // Armazena os estacionamentos encontrados
let quantidadeExibida = 6; // Quantidade inicial a ser exibida
let todosEstacionamentosExibidos = false; // Controle para saber se todos os estacionamentos estão exibidos

// Função de inicialização do mapa, chamada pelo callback do Google Maps
window.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -23.55052, lng: -46.633308 }, // Centro de São Paulo
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: "greedy"
    });

    // Carrega estilos do mapa
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var styles = JSON.parse(xhr.responseText);
            map.setOptions({ styles: styles });
        }
    };
    xhr.open('GET', 'js/styles.json');
    xhr.send();

    var input = document.getElementById('search-input') || document.getElementById('location-input');
    if (google.maps.places) {
        searchBox = new google.maps.places.SearchBox(input);
    } else {
        console.error('google.maps.places is not defined');
    }

    isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();
        if (places?.length === 0) {
            return;
        }

        clearMarkers(); // Limpa os marcadores antes de adicionar novos
        places?.forEach(function (place) {
            if (!place.geometry) {
                console.log("Localização retornada não contém geometria");
                return;
            }
            createMarker(place);
        });

        map.setCenter(places?.[0].geometry.location);

        // Reinicializa as variáveis de controle para nova pesquisa
        quantidadeExibida = 6; // Reseta a quantidade exibida
        todosEstacionamentosExibidos = false; // Reseta controle para exibição

        // Realiza a pesquisa dos estacionamentos na nova localização
        searchNearby();
    });

    infowindow = new google.maps.InfoWindow();
    document.getElementById('location-input-icon').addEventListener('click', searchNearby);
    (document.getElementById('location-input') || document.getElementById('search-input')).addEventListener('keypress', function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            searchNearby();
        }
    });

    // Pega o valor da URL e realiza a busca automática
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        (document.getElementById('location-input') || document.getElementById('search-input')).value = searchQuery;
        google.maps.event.trigger(searchBox, 'places_changed');
    } else {
        // Busca estacionamentos automaticamente ao inicializar o mapa
        searchNearby();
    }
};

function searchNearby() {
    var location = map.getCenter();
    var request = {
        location: location,
        radius: '300',
        type: ['parking']
    };

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            estacionamentos = results; // Armazena os resultados para uso posterior
            clearMarkers(); // Limpa marcadores antigos
            exibirEstacionamentos(estacionamentos); // Exibe a lista de estacionamentos
            for (var i = 0; i < estacionamentos.length; i++) {
                createMarker(estacionamentos[i]); // Cria marcadores para os estacionamentos
            }
        }
    });
}

function getSearchParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('search');
}

async function centralizarMapaEndereco(endereco) {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: endereco }, (results, status) => {
        if (status === "OK" && results[0]) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(15); // Ajuste o nível de zoom conforme necessário
            
            // Adiciona um marcador no endereço buscado
            const marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                title: endereco,
            });
            
            markers.push(marker);
        } else {
            console.error("Erro ao centralizar o mapa: " + status);
        }
    });
}

// Função para gerar um preço aleatório
function gerarPrecoAleatorio() {
    return (Math.random() * (20 - 5) + 5).toFixed(2); // Gera um preço entre R$ 5,00 e R$ 20,00
}

function createMarker(place) {
    const preco = gerarPrecoAleatorio(); // Gera um preço aleatório
    let marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: {
            url: 'image/pin.png',
            scaledSize: new google.maps.Size(32, 32)
        },
        label: {
            text: `R$ ${preco}`, // Usa o preço gerado
            color: 'black',
            fontSize: '14px',
            fontWeight: 'bold',
            className: 'price-label' // Classe CSS para customização
        }
    });

    google.maps.event.addListener(marker, 'click', function() {
        // Limpa a lista e adiciona apenas o estacionamento clicado
        clearMarkers();
        exibirEstacionamentos([place]); // Exibe apenas o estacionamento clicado
        map.setCenter(place.geometry.location); // Centraliza o mapa no estacionamento clicado
        document.getElementById('ver-mais-btn').style.display = 'none'; // Esconde o botão "Ver mais"
    });

    google.maps.event.addListener(marker, 'mouseover', function() {
        // Obtém a URL da primeira foto, se disponível
        const fotoUrl = place.photos && place.photos.length > 0 
            ? place.photos[0].getUrl({ maxWidth: 150, maxHeight: 100 }) // Tamanho ajustado
            : 'image/placeholder.png'; // Imagem padrão
    
        const content = `
            <div style="max-width: 200px; text-align: center;">
                <img src="${fotoUrl}" alt="${place.name}" style="width: 100%; height: auto; border-radius: 5px;" />
                <h4 style="margin: 5px 0;">${place.name}</h4>
                <p style="margin: 5px 0;"><strong>Endereço:</strong> ${place.vicinity}</p>
                <p style="margin: 5px 0;"><strong>Preço:</strong> R$ ${preco}/hora</p> <!-- Usa o preço gerado -->
            </div>
        `;
        infowindow.setContent(content);
        infowindow.open(map, marker);
    });
    
    // Adiciona evento de mouseout para fechar infowindow
    google.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close();
    });

    markers.push(marker);
}

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    document.getElementById('parking-info').style.display = 'none';
}

function exibirEstacionamentos(estacionamentos) {
    const listaEstacionamentos = document.querySelector('.lista-estacionamentos');
    listaEstacionamentos.innerHTML = ''; // Limpa a lista atual

    const listaParaExibir = estacionamentos.slice(0, quantidadeExibida); // Limita a lista à quantidade exibida

    listaParaExibir.forEach(estacionamento => {
        const itemEstacionamento = document.createElement('div');
        itemEstacionamento.classList.add('lista-estacionamentos-item');

        const fotoUrl = estacionamento.photos && estacionamento.photos.length > 0 
            ? estacionamento.photos[0].getUrl({maxWidth: 400, maxHeight: 300}) 
            : 'image/placeholder.png';

        const preco = gerarPrecoAleatorio(); // Gera um preço aleatório para cada estacionamento

        itemEstacionamento.innerHTML = `
            <img src="${fotoUrl}" alt="Imagem do estacionamento">
            <h3>${estacionamento.name}</h3>
            <p><strong>Endereço:</strong> ${estacionamento.vicinity}</p>
            <p><strong>Vagas Disponíveis:</strong> 50</p> <!-- Valor fictício para demonstração -->
            <p class="preco-hora"><strong>Preço:</strong> R$ ${preco}/hora</p> <!-- Usa o preço gerado -->
            <button class="selecionar-btn">Selecionar</button>
        `;

        listaEstacionamentos.appendChild(itemEstacionamento);
    });

    const verMaisBtn = document.getElementById('ver-mais-btn');
    if (quantidadeExibida < estacionamentos.length) {
        verMaisBtn.style.display = 'block'; // Mostra o botão "Ver mais"
    } else {
        verMaisBtn.style.display = 'none'; // Esconde o botão "Ver mais"
    }
}

// Evento de clique para o botão "Ver mais"
document.getElementById('ver-mais-btn').addEventListener('click', () => {
    quantidadeExibida += 6; // Aumenta a quantidade exibida
    if (quantidadeExibida >= estacionamentos.length) {
        quantidadeExibida = estacionamentos.length; // Não pode exceder o total de estacionamentos
        todosEstacionamentosExibidos = true; // Marca que todos foram exibidos
    }
    exibirEstacionamentos(estacionamentos); // Atualiza a exibição
});

// Evento de pesquisa
document.getElementById('search-btn').addEventListener('click', () => {
    searchNearby(); // Chama a função de pesquisa
});

