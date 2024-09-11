
let cartas; // Variável para armazenar as cartas do JSON
let colecaoJogador = {}; // Coleção do jogador, agora armazenada como objeto para contar repetições
let moedas = 50000; // Moedas iniciais do jogador
let deck = []; // Lista para armazenar o deck do jogador (máximo 7 cartas)

// Carregar o arquivo JSON de cartas e depois exibir a coleção
fetch('cartas.json')
    .then(response => response.json())
    .then(data => {
        cartas = data.personagens;

        // Exibir a coleção após o carregamento bem-sucedido das cartas
        exibirColecao();
    })
    .catch(error => {
        console.error('Erro ao carregar o arquivo JSON de cartas:', error);
    });

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

        // Aplicar a lógica de tier
        let tierProb = Math.random();  // Gera um número aleatório para decidir o tier
        let tierObtido;

        // Tier 5 é 2x mais raro que o tier 4
        if (tierProb < 1 / 3) {
            tierObtido = 5;  // 1/3 de chance de pegar tier 5
        } else {
            tierObtido = 4;  // 2/3 de chance de pegar tier 4
        }

        // Selecionar uma carta aleatória do rank e tier obtidos
        let cartasRankTier = cartas.filter(carta => carta.rank === rankObtido && carta.tier === tierObtido);
        
        // Verificar se existem cartas disponíveis com o rank e tier
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

    // Limpar a animação anterior, se houver
    cartaAnimadaDiv.innerHTML = '';
    cartaAnimadaDiv.style.display = 'block';

    // Adicionar o conteúdo da carta com animação
    cartaAnimadaDiv.innerHTML = `
        <div class="carta-animada" style="padding: 20px;">
            <p style="color: black; text-align: center; font-size: 20px; font-weight: bold; margin-top: 10px;">Última Carta</p>
            <img src="${carta.imagem}" alt="${carta.nome}" style="width: 200px; height: auto; display: block; margin: 0 auto;">
            <p style="color: black; text-align: center; font-size: 20px; font-weight: bold; margin-top: 10px;">${carta.nome}</p>
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

    // Se não há cartas no arquivo JSON
    if (!cartas || cartas.length === 0) {
        colecaoDiv.innerHTML = '<p>Não há cartas disponíveis.</p>';
        return;
    }

    // Exibir catálogo de cartas com transparência para as não obtidas
    cartas.forEach(carta => {
        const chaveCarta = carta.nome + '-' + carta.rank;
        const possuiCarta = colecaoJogador[chaveCarta];

        // Definir a transparência: 0.2 se não possuir, 1 se possuir
        const transparencia = possuiCarta ? '1' : '0.2';

        // Criar o elemento da carta
        let cartaHtml = `
            <div class="carta" style="position: relative; opacity: ${transparencia}; text-align: center;" data-nome="${carta.nome}" data-rank="${carta.rank}">
                <img src="${carta.imagem}" alt="${carta.nome}" style="width: 100%; height: auto;">
        `;

        // Mostrar o contador de cartas repetidas se o jogador possuir a carta
        if (possuiCarta && possuiCarta.quantidade > 1) {
            cartaHtml += `
                <span class="contador" style="position: absolute; top: 5px; right: 5px; background-color: rgb(0, 14, 68); color: white; border-radius: 50%; padding: 5px;">
                    ${possuiCarta.quantidade}
                </span>
            `;
        }

        // Verificar se o jogador tem 3 ou mais cartas repetidas para exibir o botão de upgrade
        if (possuiCarta && possuiCarta.quantidade >= 3) {
            cartaHtml += `
                <button class="upgrade-btn" style="position: absolute; bottom: 5px; left: 5px; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">
                    &#x21e7; <!-- Seta para cima -->
                </button>
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

    // Adicionar evento de clique para o botão de upgrade
    document.querySelectorAll('.upgrade-btn').forEach(button => {
        button.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevenir que o clique abra a carta
            const cartaNome = this.parentElement.getAttribute('data-nome');
            const cartaRank = this.parentElement.getAttribute('data-rank');

            // Executar a função de upgrade
            realizarUpgrade(cartaNome, cartaRank);
        });
    });
}

// Função para realizar o upgrade de cartas
function realizarUpgrade(nomeCarta, rankCarta) {
    const chaveCarta = nomeCarta + '-' + rankCarta;

    // Verificar se o jogador tem 3 ou mais cartas repetidas
    if (colecaoJogador[chaveCarta] && colecaoJogador[chaveCarta].quantidade >= 3) {
        // Subtrair 3 cartas da raridade atual
        colecaoJogador[chaveCarta].quantidade -= 3;

        // Se a quantidade chegar a 0, remover a carta da coleção
        if (colecaoJogador[chaveCarta].quantidade === 0) {
            delete colecaoJogador[chaveCarta];
        }

        // Determinar o próximo rank
        let novoRank = obterProximoRank(rankCarta);

        // Adicionar 1 carta do novo rank
        const novaChave = nomeCarta + '-' + novoRank;
        if (colecaoJogador[novaChave]) {
            colecaoJogador[novaChave].quantidade += 1;
        } else {
            let carta = cartas.find(c => c.nome === nomeCarta && c.rank === novoRank);
            colecaoJogador[novaChave] = { ...carta, quantidade: 1 };
        }

        // Atualizar a coleção exibida
        exibirColecao();
    } else {
        alert('Você precisa de 5 cartas repetidas para realizar o upgrade!');
    }
}

// Função para obter o próximo rank
function obterProximoRank(rankAtual) {
    const ranks = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
    const indexAtual = ranks.indexOf(rankAtual);

    // Se o rank atual não for o último (S), retornar o próximo rank
    if (indexAtual < ranks.length - 1) {
        return ranks[indexAtual + 1];
    } else {
        // Já está no rank mais alto (S), então não faz upgrade
        return rankAtual;
    }
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
    <button id="fechar-carta" style="background-color: red; color: white; border: none; padding: 10px; margin-top: 10px; cursor: pointer; border-radius: 5px; transition: background-color 0.3s;">Fechar</button>
`;

    // Verificar se o jogador possui a carta (quantidade maior que 0)
    const chaveCarta = carta.nome + '-' + carta.rank; // Cria uma chave única para a carta (nome + rank)
    const possuiCarta = colecaoJogador[chaveCarta] && colecaoJogador[chaveCarta].quantidade > 0;

    if (possuiCarta) {
        cartaAmpliadaHtml += `
        <button id="adicionar-remover-btn" style="background-color: blue; color: white; border: none; padding: 10px; margin-top: 10px; cursor: pointer; border-radius: 5px;">Adicionar</button>
        `;
    }

    cartaAmpliadaDiv.innerHTML = cartaAmpliadaHtml;
    document.body.appendChild(cartaAmpliadaDiv);

    // Mostrar a carta ampliada
    cartaAmpliadaDiv.style.display = 'block';

    // Evento para fechar a carta ampliada
    const fecharCartaBtn = document.getElementById('fechar-carta');
    fecharCartaBtn.addEventListener('click', function () {
        cartaAmpliadaDiv.remove(); // Remove a carta ampliada da tela
    });

    // Adicionar efeito hover no botão fechar
    fecharCartaBtn.onmouseover = function() {
        fecharCartaBtn.style.backgroundColor = 'darkred'; // Mudar a cor de fundo para um vermelho mais escuro
    };
    fecharCartaBtn.onmouseout = function() {
        fecharCartaBtn.style.backgroundColor = 'red'; // Voltar para o vermelho original
    };

    // Se o jogador possui a carta, configurar o botão de adicionar/remover
    if (possuiCarta) {
        const adicionarRemoverBtn = document.getElementById('adicionar-remover-btn');
        atualizarBotaoAdicionarRemover(adicionarRemoverBtn, carta); // Atualizar o botão inicialmente

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
        botao.style.backgroundColor = 'lightcoral'; // Botão vermelho claro
    } else {
        botao.textContent = 'Adicionar';
        botao.style.backgroundColor = 'blue'; // Botão azul
    }
}

function removerDoDeck(carta, botao) {
    deck = deck.filter(c => c.nome !== carta.nome || c.rank !== carta.rank); // Remove a carta do deck
    atualizarBotaoAdicionarRemover(botao, carta); // Atualiza o botão para "Adicionar"
    atualizarExibicaoDeck(); // Atualiza a exibição do deck
    salvarDados(); // Salva os dados após a modificação
}

// Função para atualizar a exibição das cartas no deck
function atualizarExibicaoDeck() {
    const deckContainer = document.getElementById('deck-container');
    const slots = deckContainer.getElementsByClassName('deck-slot');

    // Limpar slots
    for (let i = 0; i < slots.length; i++) {
        slots[i].innerHTML = ''; // Remove qualquer conteúdo existente
    }

    // Preencher slots com as cartas do deck
    deck.forEach((carta, index) => {
        if (index < slots.length) {
            const img = document.createElement('img');
            img.src = carta.imagem; // Define a imagem da carta
            img.alt = carta.nome;

            // Adicionar um evento de clique à imagem para exibir a carta ampliada
            img.addEventListener('click', function() {
                exibirCartaAmpliada(carta);
            });

            slots[index].appendChild(img); // Adiciona a imagem no slot
        }
    });
}


function adicionarAoDeck(carta, botao) {
    if (deck.length < 7) {
        deck.push(carta); // Adiciona a carta ao deck
        atualizarBotaoAdicionarRemover(botao, carta); // Atualiza o botão para "Remover"
        atualizarExibicaoDeck(); // Atualiza a exibição do deck
        salvarDados(); // Salva os dados após a modificação
    } else {
        alert('Limite de cartas no deck atingido!'); // Notifica o jogador
    }
}


// Inicializar a exibição do deck (vazio no início)
atualizarExibicaoDeck();

// Função para criar o botão "Remover Todas as Cartas do Deck"
function criarBotaoRemoverTodas() {
    const botaoRemoverTodas = document.createElement('button');
    botaoRemoverTodas.id = 'botao-remover-todas';
    botaoRemoverTodas.textContent = 'Limpar o Deck';
    
    // Estilo do botão
    botaoRemoverTodas.style.backgroundColor = 'red';
    botaoRemoverTodas.style.color = 'white';
    botaoRemoverTodas.style.border = 'none';
    botaoRemoverTodas.style.padding = '15px';
    botaoRemoverTodas.style.cursor = 'pointer';
    botaoRemoverTodas.style.borderRadius = '5px';
    botaoRemoverTodas.style.position = 'fixed';
    botaoRemoverTodas.style.bottom = '20px'; // Coloca no canto inferior
    botaoRemoverTodas.style.right = '20px'; // Com margem de 20px das bordas
    botaoRemoverTodas.style.zIndex = '1000'; // Garante que fique sobre outros elementos

    // Estilo de hover
    botaoRemoverTodas.onmouseover = function() {
        botaoRemoverTodas.style.backgroundColor = 'darkred'; // Cor mais escura ao passar o mouse
    };
    botaoRemoverTodas.onmouseout = function() {
        botaoRemoverTodas.style.backgroundColor = 'red'; // Volta para a cor original ao tirar o mouse
    };

    // Adiciona o evento de clique para remover todas as cartas do deck
    botaoRemoverTodas.addEventListener('click', function () {
        removerTodasCartasDoDeck();
    });

    // Adiciona o botão diretamente ao body, já que é fixo
    document.body.appendChild(botaoRemoverTodas);
}

function removerTodasCartasDoDeck() {
    // Esvaziar o array do deck
    deck = [];

    // Atualizar a exibição do deck na interface
    atualizarExibicaoDeck();

    // Atualizar todos os botões de adicionar/remover das cartas
    document.querySelectorAll('#adicionar-remover-btn').forEach(botao => {
        const cartaNome = botao.dataset.nome;  // Assumindo que a carta foi armazenada no atributo data
        const cartaRank = botao.dataset.rank;  // Assumindo que o rank foi armazenado no atributo data
        const carta = cartas.find(c => c.nome === cartaNome && c.rank === cartaRank);
        atualizarBotaoAdicionarRemover(botao, carta);
    });

    // Salvar os dados após a modificação
    salvarDados();
}


// Função para atualizar o estado do botão com base se a carta está no deck
function atualizarBotaoAdicionarRemover(botao, carta) {
    const cartaNoDeck = deck.some(c => c.nome === carta.nome && c.rank === carta.rank);
    if (cartaNoDeck) {
        botao.textContent = 'Remover';
        botao.style.backgroundColor = 'lightcoral'; // Botão vermelho claro
    } else {
        botao.textContent = 'Adicionar';
        botao.style.backgroundColor = 'blue'; // Botão azul
    }
}

// Inicializar a exibição do deck (vazio no início)
atualizarExibicaoDeck();
criarBotaoRemoverTodas(); // Criar o botão de remover todas as cartas



// Redirecionar para a página de batalha
document.getElementById('batalha-btn').addEventListener('click', function() {
    window.location.href = 'batalha.html'; // Abre uma nova página (batalha.html)
});

// Chame a função para inicializar o deck quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    atualizarExibicaoDeck();
});

// Função para salvar o deck e a coleção no localStorage
function salvarDados() {
    localStorage.setItem('colecaoJogador', JSON.stringify(colecaoJogador));
    localStorage.setItem('deck', JSON.stringify(deck));
}

// Função para carregar o deck e a coleção do localStorage
function carregarDados() {
    const colecaoSalva = localStorage.getItem('colecaoJogador');
    const deckSalvo = localStorage.getItem('deck');

    if (colecaoSalva) {
        colecaoJogador = JSON.parse(colecaoSalva);
    }
    if (deckSalvo) {
        deck = JSON.parse(deckSalvo);
        atualizarExibicaoDeck(); // Atualiza a exibição do deck quando os dados são carregados
    }
}

// Chama a função carregarDados ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    atualizarExibicaoDeck(); // Garante que o deck é exibido ao carregar a página
});

function criarBotaoReset() {
    const botaoReset = document.getElementById('reset-btn');
    
    botaoReset.addEventListener('click', () => {
        // Confirmação antes de apagar o armazenamento
        const confirmacao = confirm('Você tem certeza de que deseja resetar o jogo? Todos os dados serão apagados.');

        if (confirmacao) {
            // Apagar o localStorage
            localStorage.clear();
            
            // Notificação de sucesso (pode ser substituída por um modal ou outra notificação mais elegante)
            alert('O jogo foi resetado com sucesso!');

            // Recarregar a página ou redirecionar conforme necessário
            location.reload(); // Recarregar a página para reiniciar o jogo
        }
    });
}

// Inicializa o botão de reset
criarBotaoReset();

// Eventos de clique nos botões de navegação
document.getElementById('gacha-btn').addEventListener('click', exibirGacha);
document.getElementById('colecao-btn').addEventListener('click', exibirColecao);
document.getElementById('batalha-btn').addEventListener('click', exibirBatalha);
