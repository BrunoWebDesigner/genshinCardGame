// Função para carregar o deck do localStorage
function carregarDeckParaBatalha() {
    const deckSalvo = localStorage.getItem('deck');
    let deck = [];

    if (deckSalvo) {
        deck = JSON.parse(deckSalvo);
        atualizarDeck(deck);
        configurarBatalha(deck);
    } else {
        console.log('Nenhum deck salvo encontrado.');
    }
}

// Função para configurar a batalha com o deck carregado
function configurarBatalha(deck) {
    console.log('Deck carregado para batalha:', deck);
}

// Função para atualizar a exibição do deck na página (deck do jogador)
function atualizarDeck(deck) {
    const deckContainer = document.getElementById('deck-container');
    const slots = deckContainer.getElementsByClassName('deck-slot');

    // Limpe os slots
    for (let slot of slots) {
        slot.innerHTML = ''; 
    }

    // Preencha os slots com os itens do deck
    deck.forEach((card, index) => {
        if (index < slots.length) {
            const slot = slots[index];
            const cardInfo = `
                <div class="card-buttons">
                    <button onclick="selecionarAtributo(this, 'hp', ${card.hp})">HP: ${card.hp}</button>
                    <button onclick="selecionarAtributo(this, 'atq', ${card.atq})">ATK: ${card.atq}</button>
                    <button onclick="selecionarAtributo(this, 'def', ${card.def})">DEF: ${card.def}</button>
                    <button onclick="selecionarAtributo(this, 'prof', ${card.prof})">PROF: ${card.prof}</button>
                </div>
                <img src="${card.imagem}" alt="${card.nome}" style="width: 60px; height: 90px;">
            `;
            slot.innerHTML = cardInfo;
        }
    });
}

// Função para selecionar um atributo e alterar a aparência do botão
function selecionarAtributo(element, atributo, valor) {
    console.log(`Atributo selecionado: ${atributo}, Valor: ${valor}`);

    // Exemplo: desabilitar os botões de atributos após a seleção
    const cardButtons = element.parentElement.querySelectorAll('button');
    cardButtons.forEach(button => {
        button.disabled = true;
    });

    // Aqui você pode adicionar a lógica para lidar com a seleção do atributo,
    // como compará-lo com o valor da carta do oponente, calcular resultados, etc.
}

// Função para carregar oponentes no campo de batalha
function carregarOponentes() {
    const oponenteBotoesContainer = document.getElementById('oponente-botoes-container');

    for (let i = 1; i <= 20; i++) {
        const nivel = Math.ceil(i * 5); // Nível do oponente vai de 1 a 100
        const botao = document.createElement('button');
        botao.textContent = `Oponente Nível ${nivel}`;
        botao.onclick = () => iniciarBatalha(nivel);
        oponenteBotoesContainer.appendChild(botao);
    }
}

// Função para iniciar a batalha contra o oponente selecionado
function iniciarBatalha(nivelOponente) {
    console.log(`Batalha iniciada contra oponente de nível ${nivelOponente}`);
    
    // Gerar o deck de cartas do oponente com base no nível
    gerarCartasOponente(nivelOponente).then(cartasOponente => {
        mostrarCartasOponente(cartasOponente);
    });
}

// Função para gerar as cartas do oponente
async function gerarCartasOponente(nivel) {
    try {
        const response = await fetch('cartas.json');
        const dados = await response.json();

        if (!dados.personagens || !Array.isArray(dados.personagens)) {
            throw new Error("O formato de cartas.json não é válido. A chave 'personagens' está ausente ou não é um array.");
        }

        const cartasDisponiveis = dados.personagens;
        const cartasSelecionadas = [];

        const distribuicaoRanks = {
            F: Math.max(0, 7 - Math.floor(nivel / 20)),
            D: Math.max(0, 5 - Math.floor(nivel / 20)),
            C: Math.max(0, 4 - Math.floor(nivel / 20)),
            B: Math.max(0, 3 - Math.floor(nivel / 20)),
            A: Math.max(0, 2 - Math.floor(nivel / 20)),
            S: Math.floor(nivel / 20)
        };

        function selecionarRankAleatorio(distribuicao) {
            const ranks = Object.keys(distribuicao).filter(rank => distribuicao[rank] > 0);
            const rankSelecionado = ranks[Math.floor(Math.random() * ranks.length)];
            distribuicao[rankSelecionado]--;
            return rankSelecionado;
        }

        while (cartasSelecionadas.length < 7) {
            const rankAleatorio = selecionarRankAleatorio(distribuicaoRanks);
            const cartasRank = cartasDisponiveis.filter(carta => carta.rank === rankAleatorio);

            if (cartasRank.length > 0) {
                const cartaAleatoria = cartasRank[Math.floor(Math.random() * cartasRank.length)];
                cartasSelecionadas.push(cartaAleatoria);
            }
        }

        return cartasSelecionadas;

    } catch (error) {
        console.error("Erro ao carregar cartas:", error);
    }
}

// Função para exibir as cartas do oponente na interface
function mostrarCartasOponente(cartas) {
    const oponenteCartasContainer = document.querySelector('#oponente-cartas-container .oponente-slot-container');
    oponenteCartasContainer.innerHTML = ''; // Limpar cartas anteriores

    // Preencher os slots com as cartas do oponente
    cartas.forEach(carta => {
        const cardHTML = `
            <div class="oponente-carta">
                <img src="${carta.imagem}" alt="${carta.nome}" style="width: 60px; height: 90px;">
                <p>${carta.nome}</p>
                <p>HP: ${carta.hp}</p>
                <p>ATK: ${carta.atq}</p>
                <p>DEF: ${carta.def}</p>
                <p>PROF: ${carta.prof}</p>
            </div>
        `;
        oponenteCartasContainer.innerHTML += cardHTML;
    });
}

// Inicializa quando a página carregar
window.onload = function () {
    carregarDeckParaBatalha();
    carregarOponentes();
};
