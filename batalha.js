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

        // Função para atualizar a exibição do deck na página
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
        function selecionarAtributo(button, tipo, valor) {
            // Remove a classe 'selected' de todos os botões
            const buttons = button.parentNode.getElementsByTagName('button');
            for (let btn of buttons) {
                btn.classList.remove('selected');
            }

            // Adiciona a classe 'selected' ao botão clicado
            button.classList.add('selected');

            // Aqui você pode adicionar a lógica para usar o atributo selecionado na batalha
            console.log(`Atributo selecionado: ${tipo.toUpperCase()} - ${valor}`);
        }

        // Chame a função quando a página estiver carregada
        window.onload = carregarDeckParaBatalha;