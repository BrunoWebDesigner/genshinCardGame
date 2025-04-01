// Global variables for battle state
let playerDeck = [];
let opponentDeck = [];
let currentRound = 0;
let playerWins = 0;
let opponentWins = 0;
let opponentLevel = 0;
let coinsEarned = 0;

function updateCoinDisplay() {
    const moedas = parseInt(localStorage.getItem('moedas')) || 0;
    document.getElementById('coin-amount').textContent = moedas;
}

// Função para carregar o deck do localStorage
function carregarDeckParaBatalha() {
    const deckSalvo = localStorage.getItem('deck');
    if (deckSalvo) {
        playerDeck = JSON.parse(deckSalvo);
        atualizarDeck(playerDeck);
    } else {
        console.log('Nenhum deck salvo encontrado.');
        document.getElementById('campo-batalha').innerHTML = '<p>Monte um deck antes de batalhar!</p>';
    }
}

// Função para atualizar a exibição do deck na página (deck do jogador)
function atualizarDeck(deck) {
    const deckContainer = document.getElementById('deck-container2');
    const slots = deckContainer.getElementsByClassName('deck-slot');
    for (let slot of slots) {
        slot.innerHTML = ''; 
    }
    deck.forEach((card, index) => {
        if (index < slots.length) {
            const slot = slots[index];
            const cardInfo = `
                <div class="card-buttons">
                    <button onclick="selecionarAtributo(this, 'hp', ${card.hp}, ${index})">HP: ${card.hp}</button>
                    <button onclick="selecionarAtributo(this, 'atq', ${card.atq}, ${index})">ATK: ${card.atq}</button>
                    <button onclick="selecionarAtributo(this, 'def', ${card.def}, ${index})">DEF: ${card.def}</button>
                    <button onclick="selecionarAtributo(this, 'prof', ${card.prof}, ${index})">PROF: ${card.prof}</button>
                </div>
                <img src="${card.imagem}" alt="${card.nome}" style="width: 90px; height: 135px;">
            `;
            slot.innerHTML = cardInfo;
        }
    });
}

// Função para selecionar um atributo e iniciar a comparação
function selecionarAtributo(element, atributo, valor, cardIndex) {
    if (currentRound >= 7 || playerDeck.length <= cardIndex || opponentDeck.length <= currentRound) return;

    const playerCard = playerDeck[cardIndex];
    const opponentCard = opponentDeck[currentRound];
    const opponentStat = opponentCard[atributo];

    // Desabilitar botões após a seleção
    const cardButtons = element.parentElement.querySelectorAll('button');
    cardButtons.forEach(button => button.disabled = true);

    // Comparar atributos
    const result = compareStats(valor, opponentStat, atributo, playerCard, opponentCard);
    updateBattleUI(result, playerCard, opponentCard, atributo);

    currentRound++;
    if (currentRound === 7 || playerDeck.length === currentRound || opponentDeck.length === currentRound) {
        endBattle();
    }
}

// Função para comparar os atributos
function compareStats(playerStat, opponentStat, atributo, playerCard, opponentCard) {
    let resultText = '';

    if (playerStat > opponentStat) {
        playerWins++;
        resultText = `Você venceu esta rodada!<br>${playerCard.nome} (${atributo.toUpperCase()}: ${playerStat}) vs ${opponentCard.nome} (${atributo.toUpperCase()}: ${opponentStat})`;
    } else if (playerStat < opponentStat) {
        opponentWins++;
        resultText = `O oponente venceu esta rodada!<br>${playerCard.nome} (${atributo.toUpperCase()}: ${playerStat}) vs ${opponentCard.nome} (${atributo.toUpperCase()}: ${opponentStat})`;
    } else {
        resultText = `Empate nesta rodada!<br>${playerCard.nome} (${atributo.toUpperCase()}: ${playerStat}) vs ${opponentCard.nome} (${atributo.toUpperCase()}: ${opponentStat})`;
    }

    return resultText;
}

// Função para exibir as cartas do oponente (initially hide stats)
function mostrarCartasOponente(cartas) {
    const oponenteCartasContainer = document.querySelector('#oponente-cartas-container .oponente-slot-container');
    oponenteCartasContainer.innerHTML = '';
    cartas.forEach((carta, index) => {
        const cardHTML = `
            <div class="oponente-carta" data-index="${index}">
                <div class="card-image">
                    <img src="${carta.imagem}" alt="${carta.nome}">
                </div>
                <div class="card-stats hidden">
                    <p>${carta.nome}</p>
                    <p>HP: ${carta.hp}</p>
                    <p>ATK: ${carta.atq}</p>
                    <p>DEF: ${carta.def}</p>
                    <p>PROF: ${carta.prof}</p>
                </div>
            </div>
        `;
        oponenteCartasContainer.innerHTML += cardHTML;
    });
}

// Função para atualizar a UI da batalha (show current card with stats)
function updateBattleUI(result, playerCard, opponentCard, atributo) {
    const campoBatalha = document.getElementById('campo-batalha');
    campoBatalha.innerHTML = `
        <p>Round ${currentRound + 1}/7</p>
        <p>${result}</p>
        <p>Placar: Você ${playerWins} - ${opponentWins} Oponente</p>
        <div class="current-opponent">
            <div class="oponente-carta">
                <div class="card-image">
                    <img src="${opponentCard.imagem}" alt="${opponentCard.nome}">
                </div>
                <div class="card-stats">
                    <p>${opponentCard.nome}</p>
                    <p>HP: ${opponentCard.hp}</p>
                    <p>ATK: ${opponentCard.atq}</p>
                    <p>DEF: ${opponentCard.def}</p>
                    <p>PROF: ${opponentCard.prof}</p>
                </div>
            </div>
        </div>
    `;

    // Highlight the current opponent card in the deck without revealing stats
    const opponentCards = document.querySelectorAll('.oponente-carta');
    opponentCards.forEach(card => card.classList.remove('active'));
    const currentCard = document.querySelector(`.oponente-carta[data-index="${currentRound}"]`);
    if (currentCard) currentCard.classList.add('active');
}

// Função para finalizar a batalha e calcular recompensas
function endBattle() {
    const campoBatalha = document.getElementById('campo-batalha');
    let outcome = '';
    coinsEarned = 0;

    if (playerWins > opponentWins) {
        outcome = `Você venceu a batalha! (${playerWins} - ${opponentWins})`;
        coinsEarned = Math.min(Math.floor(opponentLevel / 5) + 3, 50);
        if (playerWins === 7 && opponentWins === 0) {
            coinsEarned *= 3;
            outcome += `<br>Vitória Perfeita! Recompensa especial: Moedas x3!`;
        } else if (playerWins === 6 && opponentWins === 1) {
            coinsEarned *= 2;
            outcome += `<br>Grande Vitória! Recompensa especial: Moedas x2!`;
        } else if (playerWins === 6 && opponentWins === 0) {
            coinsEarned *= 2;
            outcome += `<br>Grande Vitória! Recompensa especial: Moedas x2!`;
        }
        updateCoins(coinsEarned);

        const beatenLevels = JSON.parse(localStorage.getItem('beatenLevels')) || [];
        if (!beatenLevels.includes(opponentLevel)) {
            beatenLevels.push(opponentLevel);
            localStorage.setItem('beatenLevels', JSON.stringify(beatenLevels));
        }
    } else if (playerWins < opponentWins) {
        outcome = `Você perdeu a batalha! (${playerWins} - ${opponentWins})`;
    } else {
        outcome = `Empate! (${playerWins} - ${opponentWins})`;
        coinsEarned = Math.min(Math.floor(opponentLevel / 10), 10);
        updateCoins(coinsEarned);
    }

    let resultDiv = document.getElementById('battle-result');
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'battle-result';
        campoBatalha.appendChild(resultDiv);
    }
    resultDiv.innerHTML = `
        <p>${outcome}</p>
        <p>Moedas ganhas: ${coinsEarned}</p>
        <button onclick="oponentesPage()">Oponentes</button>
        <button onclick="console.log('Battling again at level ${opponentLevel}'); window.location.href='batalha.html?level=${opponentLevel}'">Batalhar Novamente</button>
    `;
}

// Função para atualizar as moedas no localStorage
function updateCoins(amount) {
    let moedas = parseInt(localStorage.getItem('moedas')) || 0;
    moedas += amount;
    localStorage.setItem('moedas', moedas);
    updateCoinDisplay(); // Add this
}

// Função para carregar oponentes no campo de batalha
function carregarOponentes() {
    const oponenteBotoesContainer = document.getElementById('oponente-botoes-container');
    oponenteBotoesContainer.innerHTML = '';

    // Load beaten levels from localStorage
    const beatenLevels = JSON.parse(localStorage.getItem('beatenLevels')) || [];

    for (let i = 1; i <= 20; i++) {
        const nivel = Math.ceil(i * 5);
        const isBeaten = beatenLevels.includes(nivel);
        const botao = document.createElement('button');
        botao.textContent = `Oponente Nível ${nivel}${isBeaten ? ' ✓' : ''}`;
        botao.onclick = () => iniciarBatalha(nivel);
        oponenteBotoesContainer.appendChild(botao);
    }
}

// Função para iniciar a batalha contra o oponente selecionado
function iniciarBatalha(nivelOponente) {
    if (playerDeck.length !== 7) {
        alert('Seu deck deve conter exatamente 7 cartas para iniciar uma batalha!');
        return;
    }

    opponentLevel = nivelOponente;
    currentRound = 0;
    playerWins = 0;
    opponentWins = 0;

    // Clear previous battle result
    const resultDiv = document.getElementById('battle-result');
    if (resultDiv) resultDiv.innerHTML = '';

    gerarCartasOponente(nivelOponente).then(cartasOponente => {
        opponentDeck = cartasOponente;
        mostrarCartasOponente(opponentDeck);
        document.getElementById('campo-batalha').innerHTML = '<p>Escolha um atributo para começar a batalha!</p>';
    });
}

// Função para gerar as cartas do oponente
async function gerarCartasOponente(nivel) {
    try {
        const response = await fetch('cartas.json');
        const dados = await response.json();

        if (!dados.personagens || !Array.isArray(dados.personagens)) {
            throw new Error("O formato de cartas.json não é válido.");
        }

        const cartasDisponiveis = dados.personagens;
        const cartasSelecionadas = [];
        const usedCardIds = new Set(); // Track used cards by a unique identifier

        // Nova distribuição para garantir Level 100 = 7 S-rank
        const nivelFactor = nivel / 100; // 0 a 1
        const distribuicaoRanks = {
            F: Math.max(Math.round(7 - (nivel / 10)), 0),           // Fades out by Level 70
            E: Math.min(Math.round((nivel / 15)), 7),               // Peaks mid-level, then fades
            D: Math.min(Math.round((nivel / 20)), 5),               // Peaks mid-level
            C: Math.min(Math.round((nivel / 25)), 4),               // Mid-to-high
            B: Math.min(Math.round((nivel / 30)), 3),               // High levels
            A: Math.min(Math.round((nivel / 40)), 3),               // Late-game
            S: nivel === 100 ? 7 : Math.min(Math.floor(nivel / 15), 7) // All S at 100, else scales
        };

        // Ajuste especial para Level 100: só S-rank
        if (nivel === 100) {
            distribuicaoRanks.F = 0;
            distribuicaoRanks.E = 0;
            distribuicaoRanks.D = 0;
            distribuicaoRanks.C = 0;
            distribuicaoRanks.B = 0;
            distribuicaoRanks.A = 0;
            distribuicaoRanks.S = 7;
        }

        // Ajustar para exatamente 7 cartas
        let totalCartas = Object.values(distribuicaoRanks).reduce((sum, val) => sum + val, 0);
        if (totalCartas < 7) {
            distribuicaoRanks.F += 7 - totalCartas; // Preenche com F se necessário
        } else if (totalCartas > 7) {
            for (let rank of ['F', 'E', 'D', 'C', 'B', 'A']) {
                while (totalCartas > 7 && distribuicaoRanks[rank] > 0) {
                    distribuicaoRanks[rank]--;
                    totalCartas--;
                }
            }
        }

        function selecionarRankAleatorio(distribuicao) {
            const ranks = Object.keys(distribuicao).filter(rank => distribuicao[rank] > 0);
            const rankSelecionado = ranks[Math.floor(Math.random() * ranks.length)];
            distribuicao[rankSelecionado]--;
            return rankSelecionado;
        }

        while (cartasSelecionadas.length < 7) {
            const rankAleatorio = selecionarRankAleatorio(distribuicaoRanks);
            const cartasRank = cartasDisponiveis.filter(carta => 
                carta.rank === rankAleatorio && !usedCardIds.has(carta.nome + '-' + carta.rank)
            );
            if (cartasRank.length > 0) {
                const cartaAleatoria = cartasRank[Math.floor(Math.random() * cartasRank.length)];
                const cardId = cartaAleatoria.nome + '-' + cartaAleatoria.rank; // Unique ID
                usedCardIds.add(cardId); // Mark as used
                cartasSelecionadas.push(cartaAleatoria);
            } else if (cartasSelecionadas.length < 7) {
                // If no unique cards left for this rank, relax uniqueness for remaining slots
                const fallbackCartas = cartasDisponiveis.filter(carta => carta.rank === rankAleatorio);
                if (fallbackCartas.length > 0) {
                    const cartaAleatoria = fallbackCartas[Math.floor(Math.random() * fallbackCartas.length)];
                    cartasSelecionadas.push(cartaAleatoria);
                }
            }
        }

        return cartasSelecionadas;
    } catch (error) {
        console.error("Erro ao carregar cartas:", error);
    }
}

// Função para reiniciar a batalha (usando refresh da página)
function oponentesPage() {
    window.location.href = 'batalha.html';
    carregarOponentes(); // Ensure list updates (though reload handles this)
}

// Inicializa quando a página carregar
window.onload = function () {
    carregarDeckParaBatalha();
    carregarOponentes();
    updateCoinDisplay();

    const urlParams = new URLSearchParams(window.location.search);
    const level = parseInt(urlParams.get('level'));
    if (level) {
        console.log(`Auto-starting battle for level ${level}`);
        const opponentButton = Array.from(document.querySelectorAll('#oponente-botoes-container button'))
            .find(btn => btn.textContent.startsWith(`Oponente Nível ${level}`));
        if (opponentButton) {
            opponentButton.click();
        } else {
            console.error(`No button found for level ${level}`);
        }
    }
};