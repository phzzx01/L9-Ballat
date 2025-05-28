// Animação do envelope
function setupEnvelopeAnimation() {
    const envelopeContainer = document.querySelector('.envelope-container');
    if (!envelopeContainer) return;

    const envelope = document.querySelector('.envelope');

    // Criar container para partículas do convite
    const inviteParticles = document.createElement('div');
    inviteParticles.classList.add('invite-particles');
    envelopeContainer.appendChild(inviteParticles);

    // Adicionar efeito de clique para abrir o envelope
    envelopeContainer.addEventListener('click', function(event) {
        // Impede que o clique no container feche o envelope imediatamente
        event.stopPropagation();

        if (!envelope.classList.contains('open')) {
            envelope.classList.add('open');
            setTimeout(() => {
                createSparkles();
            }, 500); // Partículas aparecem após a animação de abertura
        }
        // Se já estiver aberto, o clique no container não faz nada (fechar é tratado pelo listener do documento)
    });

    // Adicionar listener ao documento para fechar ao clicar fora
    document.addEventListener('click', function(event) {
        // Verifica se o envelope está aberto E se o clique foi fora do container do envelope
        if (envelope.classList.contains('open') && !envelopeContainer.contains(event.target)) {
            envelope.classList.remove('open');
            clearSparkles();
        }
    });

    // Função para criar efeito de partículas (mantida como estava)
    function createSparkles() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.classList.add('sparkle');
                
                // Posição aleatória
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                const size = Math.random() * 6 + 2;
                const duration = Math.random() * 2 + 1;
                const delay = Math.random() * 0.5;
                
                sparkle.style.left = `${posX}%`;
                sparkle.style.top = `${posY}%`;
                sparkle.style.width = `${size}px`;
                sparkle.style.height = `${size}px`;
                sparkle.style.animation = `sparkle-animation ${duration}s ease-out ${delay}s`;
                
                inviteParticles.appendChild(sparkle);
                
                // Remover após a animação
                setTimeout(() => {
                    sparkle.remove();
                }, (duration + delay) * 1000);
            }, i * 100);
        }
    }
    
    // Função para limpar partículas (mantida como estava)
    function clearSparkles() {
        inviteParticles.innerHTML = '';
    }
}

