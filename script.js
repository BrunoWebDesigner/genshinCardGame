let cartas; // Variável para armazenar as cartas do JSON
let colecaoJogador = {}; // Coleção do jogador, agora armazenada como objeto para contar repetições
let moedas = parseInt(localStorage.getItem('moedas')) || 100; // Moedas carregadas do localStorage ou 100 iniciais
let deck = []; // Lista para armazenar o deck do jogador (máximo 7 cartas)

// Carregar o arquivo JSON de cartas e depois exibir a coleção
fetch('cartas.json')
    .then(response => response.json())
    .then(data => {
        cartas = data.personagens;
        exibirColecao();
    })
    .catch(error => {
        console.error('Erro ao carregar o arquivo JSON de cartas:', error);
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

        // Aplicar a lógica de tier
        let tierProb = Math.random();
        let tierObtido;

        if (tierProb < 1 / 3) {
            tierObtido = 5;
        } else {
            tierObtido = 4;
        }

        // Selecionar uma carta aleatória do rank e tier obtidos
        let cartasRankTier = cartas.filter(carta => carta.rank === rankObtido && carta.tier === tierObtido);
        
        if (cartasRankTier.length === 0) {
            console.error("Nenhuma carta disponível para o rank e tier selecionados.");
            return;
        }
        
        let cartaObtida = cartasRankTier[Math.floor(Math.random() * cartasRankTier.length)];

        // Adicionar à coleção do jogador ou incrementar contador de repetidas
        const chaveCarta = cartaObtida.nome + '-' + cartaObtida.rank;
        if (colecaoJogador[chaveCarta]) {
            colecaoJogador[chaveCarta].quantidade += 1;
        } else {
            colecaoJogador[chaveCarta] = { ...cartaObtida, quantidade: 1 };
        }

        // Salvar os dados após a modificação
        salvarDados();

        // Mostrar o resultado
        const resultadoGacha = document.getElementById('resultado-gacha');
        resultadoGacha.innerHTML = `Você conseguiu a carta: ${cartaObtida.nome} (${cartaObtida.rank}, Tier ${cartaObtida.tier})!`;

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
    cartaAnimadaDiv.innerHTML = '';
    cartaAnimadaDiv.style.display = 'block';
    cartaAnimadaDiv.innerHTML = `
        <div class="carta-animada" style="padding: 20px;">
            <p style="color: white; text-align: center; font-size: 20px; font-weight: bold; margin-top: 10px;">Última Carta</p>
            <img src="${carta.imagem}" alt="${carta.nome}" style="width: 200px; height: auto; display: block; margin: 0 auto;">
            <p style="color: white; text-align: center; font-size: 20px; font-weight: bold; margin-top: 10px;">${carta.nome}</p>
        </div>
    `;
}

function exibirColecao() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <h2>Catalogo de Cartas</h2>
        <div id="colecao" style="display: flex; flex-wrap: wrap; gap: 20px;"></div>
    `;
    const colecaoDiv = document.getElementById('colecao');

    if (!cartas || cartas.length === 0) {
        colecaoDiv.innerHTML = '<p>Não há cartas disponíveis.</p>';
        return;
    }

    cartas.forEach(carta => {
        const chaveCarta = carta.nome + '-' + carta.rank;
        const possuiCarta = colecaoJogador[chaveCarta];
        const transparencia = possuiCarta ? '1' : '0.2';

        let cartaHtml = `
            <div class="carta" style="position: relative; opacity: ${transparencia}; text-align: center;" data-nome="${carta.nome}" data-rank="${carta.rank}">
                <img src="${carta.imagem}" alt="${carta.nome}" style="width: 100%; height: auto;">
        `;

        if (possuiCarta && possuiCarta.quantidade > 1) {
            cartaHtml += `
                <span class="contador" style="position: absolute; top: 5px; right: 5px; background-color: rgb(0, 14, 68); color: white; border-radius: 50%; padding: 5px;">
                    ${possuiCarta.quantidade}
                </span>
            `;
        }

        if (possuiCarta && possuiCarta.quantidade >= 3) {
            cartaHtml += `
                <button class="upgrade-btn" style="position: absolute; bottom: 5px; left: 5px; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">
                    ⇧
                </button>
            `;
        }

        cartaHtml += `</div>`;
        colecaoDiv.innerHTML += cartaHtml;
    });

    document.querySelectorAll('.carta').forEach(cartaElement => {
        cartaElement.addEventListener('click', function () {
            const nomeCarta = this.getAttribute('data-nome');
            const rankCarta = this.getAttribute('data-rank');
            const cartaSelecionada = cartas.find(c => c.nome === nomeCarta && c.rank === rankCarta);
            exibirCartaAmpliada(cartaSelecionada);
        });

        cartaElement.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            const nomeCarta = this.getAttribute('data-nome');
            const rankCarta = this.getAttribute('data-rank');
            enviarParaDeck(nomeCarta, rankCarta);
        });
    });

    document.querySelectorAll('.upgrade-btn').forEach(button => {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            const cartaNome = this.parentElement.getAttribute('data-nome');
            const cartaRank = this.parentElement.getAttribute('data-rank');
            realizarUpgrade(cartaNome, cartaRank);
        });
    });
}

// Função para enviar uma carta para o deck
function enviarParaDeck(nomeCarta, rankCarta) {
    const carta = cartas.find(c => c.nome === nomeCarta && c.rank === rankCarta);
    const cartaNoDeck = deck.some(c => c.nome === carta.nome && c.rank === carta.rank);
    if (deck.length < 7 && !cartaNoDeck) {
        deck.push(carta);
        atualizarExibicaoDeck();
        salvarDados();
        alert(`Carta ${nomeCarta} de rank ${rankCarta} foi adicionada ao deck.`);
    } else if (cartaNoDeck) {
        alert(`A carta ${nomeCarta} de rank ${rankCarta} já está no deck!`);
    } else {
        alert('O deck já está cheio (máximo 7 cartas)!');
    }
}

// Função para realizar o upgrade de cartas
function realizarUpgrade(nomeCarta, rankCarta) {
    const chaveCarta = nomeCarta + '-' + rankCarta;
    if (colecaoJogador[chaveCarta] && colecaoJogador[chaveCarta].quantidade >= 3) {
        colecaoJogador[chaveCarta].quantidade -= 3;
        if (colecaoJogador[chaveCarta].quantidade === 0) {
            delete colecaoJogador[chaveCarta];
        }

        let novoRank = obterProximoRank(rankCarta);
        const novaChave = nomeCarta + '-' + novoRank;
        if (colecaoJogador[novaChave]) {
            colecaoJogador[novaChave].quantidade += 1;
        } else {
            let carta = cartas.find(c => c.nome === nomeCarta && c.rank === novoRank);
            colecaoJogador[novaChave] = { ...carta, quantidade: 1 };
        }

        salvarDados();
        exibirColecao();
    } else {
        alert('Você precisa de 3 cartas repetidas para realizar o upgrade!');
    }
}

// Função para obter o próximo rank
function obterProximoRank(rankAtual) {
    const ranks = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
    const indexAtual = ranks.indexOf(rankAtual);
    if (indexAtual < ranks.length - 1) {
        return ranks[indexAtual + 1];
    } else {
        return rankAtual;
    }
}

// Função para exibir a versão ampliada da carta
function exibirCartaAmpliada(carta) {
    const cartaAmpliadaExistente = document.getElementById('carta-ampliada');
    if (cartaAmpliadaExistente) {
        cartaAmpliadaExistente.remove();
    }

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
    <button id="fechar-carta" style="background-color: red; color: white; border: none; padding: 10px; margin-top: 10px; cursor: pointer; border-radius: 5px; transition: background-color 0.3s;">Fechar</button>
    `;

    const chaveCarta = carta.nome + '-' + carta.rank;
    const possuiCarta = colecaoJogador[chaveCarta] && colecaoJogador[chaveCarta].quantidade > 0;

    if (possuiCarta) {
        cartaAmpliadaHtml += `
        <button id="adicionar-remover-btn" style="background-color: blue; color: white; border: none; padding: 10px; margin-top: 10px; cursor: pointer; border-radius: 5px;">Adicionar</button>
        `;
    }

    cartaAmpliadaDiv.innerHTML = cartaAmpliadaHtml;
    document.body.appendChild(cartaAmpliadaDiv);
    cartaAmpliadaDiv.style.display = 'block';

    const fecharCartaBtn = document.getElementById('fechar-carta');
    fecharCartaBtn.addEventListener('click', function () {
        cartaAmpliadaDiv.remove();
    });

    // Hover effects for fechar-carta
    fecharCartaBtn.onmouseover = function() {
        fecharCartaBtn.style.backgroundColor = 'darkred';
    };
    fecharCartaBtn.onmouseout = function() {
        fecharCartaBtn.style.backgroundColor = 'red';
    };

    // Close card when clicking outside the image and add/remove button
    const closeCardOutside = function(e) {
        const cartaImg = cartaAmpliadaDiv.querySelector('img');
        const adicionarRemoverBtn = cartaAmpliadaDiv.querySelector('#adicionar-remover-btn');
        
        // Check if the click is outside the image and the add/remove button
        if (!cartaImg.contains(e.target) && (!adicionarRemoverBtn || !adicionarRemoverBtn.contains(e.target))) {
            cartaAmpliadaDiv.remove();
            document.removeEventListener('click', closeCardOutside); // Clean up listener
        }
    };

    // Add listener after a slight delay to avoid immediate closure from the triggering click
    setTimeout(() => {
        document.addEventListener('click', closeCardOutside);
    }, 0);

    if (possuiCarta) {
        const adicionarRemoverBtn = document.getElementById('adicionar-remover-btn');
        atualizarBotaoAdicionarRemover(adicionarRemoverBtn, carta);

        adicionarRemoverBtn.addEventListener('click', function () {
            if (adicionarRemoverBtn.textContent === 'Adicionar') {
                adicionarAoDeck(carta, adicionarRemoverBtn);
            } else {
                removerDoDeck(carta, adicionarRemoverBtn);
            }
        });
    }
}

// Atualizar o estado do botão com base se a carta está no deck
function atualizarBotaoAdicionarRemover(botao, carta) {
    const cartaNoDeck = deck.some(c => c.nome === carta.nome && c.rank === carta.rank);
    if (cartaNoDeck) {
        botao.textContent = 'Remover';
        botao.style.backgroundColor = 'lightcoral';
    } else {
        botao.textContent = 'Adicionar';
        botao.style.backgroundColor = 'blue';
    }
}

function adicionarAoDeck(carta, botao) {
    const cartaNoDeck = deck.some(c => c.nome === carta.nome && c.rank === carta.rank);
    if (deck.length < 7 && !cartaNoDeck) {
        deck.push(carta);
        atualizarBotaoAdicionarRemover(botao, carta);
        atualizarExibicaoDeck();
        salvarDados();
    } else if (cartaNoDeck) {
        alert(`A carta ${carta.nome} de rank ${carta.rank} já está no deck!`);
    } else {
        alert('Limite de cartas no deck atingido!');
    }
}

function removerDoDeck(carta, botao) {
    deck = deck.filter(c => c.nome !== carta.nome || c.rank !== carta.rank);
    if (botao) {
        atualizarBotaoAdicionarRemover(botao, carta); // Only update button if provided
    }
    atualizarExibicaoDeck();
    salvarDados();
}

// Função para atualizar a exibição das cartas no deck
function atualizarExibicaoDeck() {
    const deckContainer = document.getElementById('deck-container');
    const slots = deckContainer.getElementsByClassName('deck-slot');
    for (let i = 0; i < slots.length; i++) {
        slots[i].innerHTML = '';
    }
    // Use a Set-like approach to ensure uniqueness by nome and rank
    const uniqueDeck = [];
    const seen = new Set();
    deck.forEach(carta => {
        const key = `${carta.nome}-${carta.rank}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueDeck.push(carta);
        }
    });
    deck = uniqueDeck; // Update deck to only include unique cards
    deck.forEach((carta, index) => {
        if (index < slots.length) {
            const slot = slots[index];
            slot.innerHTML = `
                <img src="${carta.imagem}" alt="${carta.nome}" data-index="${index}">
            `;
            const img = slot.querySelector('img');
            // Left-click to enlarge
            img.addEventListener('click', function() {
                exibirCartaAmpliada(carta);
            });
            // Right-click to remove
            img.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                removerDoDeck(carta, null);
            });
        }
    });
}

// Função para criar o botão "Remover Todas as Cartas do Deck"
function criarBotaoRemoverTodas() {
    const botaoRemoverTodas = document.createElement('button');
    botaoRemoverTodas.id = 'botao-remover-todas';
    botaoRemoverTodas.textContent = 'Limpar o Deck';
    botaoRemoverTodas.style.backgroundColor = 'red';
    botaoRemoverTodas.style.color = 'white';
    botaoRemoverTodas.style.border = 'none';
    botaoRemoverTodas.style.padding = '10px';
    botaoRemoverTodas.style.cursor = 'pointer';
    botaoRemoverTodas.style.borderRadius = '5px';
    botaoRemoverTodas.style.position = 'fixed';
    botaoRemoverTodas.style.bottom = '55px';
    botaoRemoverTodas.style.right = '20px';
    botaoRemoverTodas.style.zIndex = '1000';

    botaoRemoverTodas.onmouseover = function() {
        botaoRemoverTodas.style.backgroundColor = 'darkred';
    };
    botaoRemoverTodas.onmouseout = function() {
        botaoRemoverTodas.style.backgroundColor = 'red';
    };

    botaoRemoverTodas.addEventListener('click', function () {
        removerTodasCartasDoDeck();
    });

    document.body.appendChild(botaoRemoverTodas);
}

function removerTodasCartasDoDeck() {
    deck = [];
    atualizarExibicaoDeck();
    document.querySelectorAll('#adicionar-remover-btn').forEach(botao => {
        const cartaNome = botao.parentElement.querySelector('p').textContent;
        const cartaRank = cartas.find(c => c.nome === cartaNome).rank;
        const carta = cartas.find(c => c.nome === cartaNome && c.rank === cartaRank);
        atualizarBotaoAdicionarRemover(botao, carta);
    });
    salvarDados();
}

// Função para salvar o deck, coleção e moedas no localStorage
function salvarDados() {
    localStorage.setItem('colecaoJogador', JSON.stringify(colecaoJogador));
    localStorage.setItem('deck', JSON.stringify(deck));
    localStorage.setItem('moedas', moedas);
}

// Função para carregar o deck, coleção e moedas do localStorage
function carregarDados() {
    const colecaoSalva = localStorage.getItem('colecaoJogador');
    const deckSalvo = localStorage.getItem('deck');
    const moedasSalvas = localStorage.getItem('moedas');

    if (colecaoSalva) {
        colecaoJogador = JSON.parse(colecaoSalva);
    }
    if (deckSalvo) {
        deck = JSON.parse(deckSalvo);
        atualizarExibicaoDeck();
    }
    if (moedasSalvas) {
        moedas = parseInt(moedasSalvas);
    }
}

// Função para criar o botão de reset
function criarBotaoReset() {
    const botaoReset = document.getElementById('reset-btn');
    botaoReset.addEventListener('click', () => {
        const confirmacao = confirm('Você tem certeza de que deseja resetar o jogo? Todos os dados serão apagados.');
        if (confirmacao) {
            localStorage.clear();
            moedas = 100; // Resetar moedas para o valor inicial
            deck = [];
            colecaoJogador = {};
            salvarDados();
            alert('O jogo foi resetado com sucesso!');
            location.reload();
        }
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    atualizarExibicaoDeck();
    criarBotaoRemoverTodas();
    criarBotaoReset();
});

document.getElementById('gacha-btn').addEventListener('click', exibirGacha);
document.getElementById('colecao-btn').addEventListener('click', exibirColecao);
document.getElementById('batalha-btn').addEventListener('click', function() {
    window.location.href = 'batalha.html';
});