let cartas; // Variável para armazenar as cartas do JSON
let colecaoJogador = {}; // Coleção do jogador, agora armazenada como objeto para contar repetições
let moedas = 100000; // Moedas iniciais do jogador

// Carregar o arquivo JSON de cartas
fetch('cartas.json')
    .then(response => response.json())
    .then(data => {
        cartas = data.personagens;
    });

// Função para exibir a tela de Gacha
function exibirGacha() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <h2>Sistema de Gacha</h2>
        <p>Você tem ${moedas} moedas.</p>
        <button id="gacha-rodar-btn">Rodar Gacha (Custo: 10 Moedas)</button>
        <div id="resultado-gacha"></div>
    `;

    document.getElementById('gacha-rodar-btn').addEventListener('click', gacha);
}

// Função para realizar o gacha
function gacha() {
    const custoPacote = 10;
    if (moedas >= custoPacote) {
        moedas -= custoPacote;

        // Definir as probabilidades de obtenção de rank
        let rankProb = Math.random();
        let rankObtido;

        if (rankProb < 0.001) {
            rankObtido = 'S';
        } else if (rankProb < 0.003) {
            rankObtido = 'A';
        } else if (rankProb < 0.006) {
            rankObtido = 'B';
        } else if (rankProb < 0.012) {
            rankObtido = 'C';
        } else if (rankProb < 0.025) {
            rankObtido = 'D';
        } else if (rankProb < 0.05) {
            rankObtido = 'E';
        } else {
            rankObtido = 'F';
        }

        // Selecionar uma carta aleatória do rank obtido
        let cartasRank = cartas.filter(carta => carta.rank === rankObtido);
        let cartaObtida = cartasRank[Math.floor(Math.random() * cartasRank.length)];

        // Adicionar à coleção do jogador ou incrementar contador de repetidas
        if (colecaoJogador[cartaObtida.nome + '-' + cartaObtida.rank]) {
            colecaoJogador[cartaObtida.nome + '-' + cartaObtida.rank].quantidade += 1;
        } else {
            colecaoJogador[cartaObtida.nome + '-' + cartaObtida.rank] = { ...cartaObtida, quantidade: 1 };
        }

        // Mostrar o resultado
        const resultadoGacha = document.getElementById('resultado-gacha');
        resultadoGacha.innerHTML = `Você conseguiu a carta: ${cartaObtida.nome} (${cartaObtida.rank})!`;

        // Mostrar a carta obtida com animação
        mostrarCartaAnimada(cartaObtida);

        // Atualizar moedas na tela
        exibirGacha();
    } else {
        alert('Moedas insuficientes!');
    }
}

// Função para mostrar a carta obtida com animação
function mostrarCartaAnimada(carta) {
    const cartaAnimadaDiv = document.getElementById('carta-animada');

    // Limpar a animação anterior, se houver
    cartaAnimadaDiv.innerHTML = '';
    cartaAnimadaDiv.style.display = 'block';

    // Adicionar o conteúdo da carta com animação
    cartaAnimadaDiv.innerHTML = `
        <div class="carta-animada" padding: 20px;">
            <p style="color: black; text-align: center; font-size: 20px; font-weight: bold; margin-top: 10px;">Ultima Carta</p>
            <img src="${carta.imagem}" alt="${carta.nome}" style="width: 200px; height: auto; display: block; margin: 0 auto;">
            <p style="color: black; text-align: center; font-size: 20px; font-weight: bold; margin-top: 10px;">${carta.nome}</p>
        </div>
    `;
}

// Função para resetar a animação ao mudar de tela
function mudarTela() {
    esconderCartaAnimada();  // Esconder a carta ao trocar de tela
}

function exibirColecao() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Sua Coleção de Cartas</h2><div id="colecao"></div>';
    const colecaoDiv = document.getElementById('colecao');

    // Se não há cartas no arquivo JSON
    if (!cartas || cartas.length === 0) {
        colecaoDiv.innerHTML = '<p>Não há cartas disponíveis.</p>';
        return;
    }

    // Exibir catálogo de cartas com transparência para as não obtidas
    cartas.forEach(carta => {
        const chaveCarta = carta.nome + '-' + carta.rank;
        const possuiCarta = colecaoJogador[chaveCarta];

        // Definir a transparência: 0.5 se não possuir, 1 se possuir
        const transparencia = possuiCarta ? '1' : '0.5';

        // Criar o elemento da carta
        let cartaHtml = `
            <div class="carta" style="opacity: ${transparencia};" data-nome="${carta.nome}" data-rank="${carta.rank}">
                <img src="${carta.imagem}" alt="${carta.nome}">
        `;

        // Mostrar o contador de cartas repetidas se o jogador possuir a carta
        if (possuiCarta && possuiCarta.quantidade > 1) {
            cartaHtml += `
                <span class="contador" style="position: absolute; top: 5px; right: 5px; background-color: red; color: white; border-radius: 50%; padding: 5px;">
                    ${possuiCarta.quantidade}
                </span>
            `;
        }

        cartaHtml += `</div>`;

        colecaoDiv.innerHTML += cartaHtml;
    });

    // Adicionar evento de clique para ampliar a carta
    document.querySelectorAll('.carta').forEach(cartaElement => {
        cartaElement.addEventListener('click', function () {
            const nomeCarta = this.getAttribute('data-nome');
            const rankCarta = this.getAttribute('data-rank');

            // Encontrar os detalhes da carta no JSON
            const cartaSelecionada = cartas.find(c => c.nome === nomeCarta && c.rank === rankCarta);

            // Exibir a carta ampliada
            exibirCartaAmpliada(cartaSelecionada);
        });
    });
}

// Função para exibir a tela de batalha (esqueleto)
function exibirBatalha() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <h2>Batalha</h2>
        <p>Em breve...</p>
    `;
}

// Função para exibir a versão ampliada da carta
function exibirCartaAmpliada(carta) {
    const cartaAmpliadaExistente = document.getElementById('carta-ampliada');
    if (cartaAmpliadaExistente) {
        cartaAmpliadaExistente.remove();
    }

    // Criar o novo contêiner da carta ampliada
    const cartaAmpliadaDiv = document.createElement('div');
    cartaAmpliadaDiv.id = 'carta-ampliada';
    cartaAmpliadaDiv.style.position = 'fixed';
    cartaAmpliadaDiv.style.top = '50%';
    cartaAmpliadaDiv.style.left = '50%';
    cartaAmpliadaDiv.style.transform = 'translate(-50%, -50%)';
    cartaAmpliadaDiv.style.backgroundColor = 'black';
    cartaAmpliadaDiv.style.padding = '0.1px';
    cartaAmpliadaDiv.style.boxShadow = '0 0 20px rgba(0, 0, 0, 1)';
    cartaAmpliadaDiv.style.zIndex = '1000';

    let cartaAmpliadaHtml = `
    <div style="position: relative; display: inline-block; max-width: 300px; border-radius: 10px; overflow: hidden;">
        <img src="${carta.imagem}" alt="${carta.nome}" style="width: 100%; height: auto; border-radius: 10px; display: block;">
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.7); padding: 10px 20px 20px 40px; color: white; box-sizing: border-box;">
            <p style="font-weight: bold; font-size: 16px; margin: 0;">${carta.nome}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                <div style="flex: 1;">
                    <p style="margin: 3px 0; font-size: 14px;"><strong>HP:</strong> ${carta.hp}</p>
                    <p style="margin: 3px 0; font-size: 14px;"><strong>ATQ:</strong> ${carta.atq}</p>
                </div>
                <div style="flex: 1;">
                    <p style="margin: 3px 0; font-size: 14px;"><strong>DEF:</strong> ${carta.def}</p>
                    <p style="margin: 3px 0; font-size: 14px;"><strong>PROF:</strong> ${carta.prof}</p>
                </div>
            </div>
        </div>
    </div>
    <button id="fechar-carta" style="background-color: red; color: white; border: none; padding: 10px; margin-top: 10px; cursor: pointer; border-radius: 5px;">Fechar</button>
`;

    cartaAmpliadaDiv.innerHTML = cartaAmpliadaHtml;
    document.body.appendChild(cartaAmpliadaDiv);

    // Mostrar a carta ampliada
    cartaAmpliadaDiv.style.display = 'block';

    // Evento para fechar a carta ampliada
    document.getElementById('fechar-carta').addEventListener('click', function () {
        cartaAmpliadaDiv.remove(); // Remove a carta ampliada da tela
    });
}

// Eventos de clique nos botões de navegação
document.getElementById('gacha-btn').addEventListener('click', exibirGacha);
document.getElementById('colecao-btn').addEventListener('click', exibirColecao);
document.getElementById('batalha-btn').addEventListener('click', exibirBatalha);
