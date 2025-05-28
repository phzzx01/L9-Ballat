/*
Arquivo: main_fixed_v2.js
Descrição: Script principal para o site L9 Ballat, incluindo animações, interações,
           sistema de avaliação, notificações, navegação de seções, funcionalidade admin
           e integração com widget Discord.
Versão: v14 (Correções finais: Notificações, Seções, Persistência)
*/

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM carregado. Iniciando scripts v14...");
    createParticles();
    setupMenuToggle();
    setupEnvelopeAnimation();
    setupRatingSystem();
    setupNotificationsSystem(); 
    loadInitialData(); 
    setupAdminFunctionality(); // Configura login e painel admin
    setupSectionNavigation(); // Configura navegação e visibilidade das seções
    
    // Inicia a busca de dados do Discord com atualização periódica
    const serverId = "1375595372788977735"; // ID do servidor Discord L9 Ballat
    setupDiscordWidgetUpdate(serverId);
    
    // Garante o estado inicial correto das seções APÓS tudo ser configurado
    initializeSectionVisibility(); 
});

// --- Funções Auxiliares e de Configuração ---

// Cria partículas de fundo
function createParticles() {
    const particlesContainer = document.querySelector(".particles");
    if (!particlesContainer) return;
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
        particlesContainer.appendChild(particle);
    }
}

// Configura o toggle do menu hambúrguer
function setupMenuToggle() {
    const menuToggle = document.querySelector(".menu-toggle"); // CORRIGIDO: Seleciona pela classe
    const sidebar = document.querySelector(".sidebar"); // CORRIGIDO: Seleciona a sidebar pela classe
    const overlay = document.querySelector(".overlay"); // Seleciona o overlay

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("active");
            menuToggle.classList.toggle("active");
            overlay.classList.toggle("active"); // Ativa/desativa o overlay
            document.body.classList.toggle('no-scroll'); // Impede scroll do body quando menu aberto
        });

        // Fecha o menu ao clicar no overlay
        overlay.addEventListener("click", () => {
            sidebar.classList.remove("active");
            menuToggle.classList.remove("active");
            overlay.classList.remove("active");
            document.body.classList.remove('no-scroll');
        });

        // Fecha o menu ao clicar em um link dentro da sidebar
        sidebar.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                // Apenas fecha se não for um link interno para a mesma página (que já é tratado pela navegação)
                if (!link.getAttribute('href').startsWith('#')) {
                    sidebar.classList.remove("active");
                    menuToggle.classList.remove("active");
                    overlay.classList.remove("active");
                    document.body.classList.remove('no-scroll');
                }
            });
        });
    } else {
        console.error("Elemento menu-toggle, sidebar ou overlay não encontrado!");
    }
}

// Configura a animação do envelope
function setupEnvelopeAnimation() {
    const envelope = document.querySelector(".envelope");
    if (envelope) {
        envelope.addEventListener("click", () => {
            envelope.classList.toggle("open");
        });
    }
}

// Configura o sistema de avaliação por estrelas
function setupRatingSystem() {
    const stars = document.querySelectorAll(".rating-stars .star");
    const submitRatingBtn = document.querySelector(".rating-submit"); // CORRIGIDO: Seleciona pela classe
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener("mouseover", () => {
            // resetStars(); // Reset é feito dentro do highlightStars agora
            const rating = parseInt(star.dataset.value);
            highlightStars(rating);
        });
        star.addEventListener("mouseout", () => {
            // resetStars(); // Reset é feito dentro do highlightStars agora
            highlightStars(currentRating); // Volta para a avaliação clicada
        });
        star.addEventListener("click", () => {
            currentRating = parseInt(star.dataset.value);
            highlightStars(currentRating); // Fixa a avaliação clicada
        });
    });

    if (submitRatingBtn) {
        submitRatingBtn.addEventListener("click", (e) => { // CORRIGIDO: Adiciona parâmetro 'e'
            e.preventDefault(); // CORRIGIDO: Previne envio do formulário
            if (currentRating > 0) {
                addRatingToLocalStorage(currentRating);
                showNotification(`Obrigado por avaliar com ${currentRating} estrela(s)!`);
                currentRating = 0; // Reseta após enviar
                resetStars(); // Limpa visualmente as estrelas
            } else {
                showNotification("Por favor, selecione uma avaliação antes de enviar.", "warning");
            }
        });
    }

    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add("selected");
            } else {
                star.classList.remove("selected");
            }
        });
    }

    function resetStars() {
        stars.forEach(star => star.classList.remove("selected"));
    }
}

// Configura o sistema de notificações (avisos)
function setupNotificationsSystem() {
    // Atualiza os badges de notificação a cada 5 segundos para garantir sincronização
    setInterval(updateNotificationBadges, 5000);
}

// Configura a navegação entre seções e o efeito toggle
function setupSectionNavigation() {
    const navLinks = document.querySelectorAll(".sidebar-menu-link[href^='#']");
    const sectionsToToggle = ["#avisos", "#creditos"]; // Seções que devem abrir/fechar
    
    // Restaura o estado das seções do localStorage
    restoreSectionVisibility();
    
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            console.log(`Link clicado: ${href}`);

            // Ignora links externos ou que não sejam âncoras internas
            if (!href || !href.startsWith("#")) {
                console.log("Link ignorado (não é âncora interna).");
                return; 
            }

            try {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    console.log(`Elemento alvo encontrado: ${href}`);
                    e.preventDefault(); // Previne o salto padrão

                    const isToggleableTarget = sectionsToToggle.includes(href);
                    const isCurrentlyVisible = targetElement.classList.contains("visible");

                    // Se o alvo clicado já está visível E é alternável, apenas o esconda.
                    if (isToggleableTarget && isCurrentlyVisible) {
                        targetElement.classList.remove("visible");
                        console.log(`Escondendo seção já visível: ${href}`);
                        // Salva o estado no localStorage
                        saveSectionVisibility(href.substring(1), false);
                    } 
                    // Se o alvo não está visível (ou não é alternável, mas queremos rolar)
                    else {
                        // Mostra a seção alvo APENAS se ela for uma das que devem ser alternadas
                        if (isToggleableTarget) {
                            targetElement.classList.add("visible");
                            console.log(`Mostrando seção: ${href}`);
                            // Salva o estado no localStorage
                            saveSectionVisibility(href.substring(1), true);
                        } else {
                            console.log(`Seção ${href} não é para alternar visibilidade (ou é sempre visível).`);
                        }

                        // Rola suavemente para o elemento alvo APÓS garantir visibilidade
                        requestAnimationFrame(() => {
                            const headerOffset = 20; // Pequeno offset para não colar no topo
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                            console.log(`Rolando para a posição: ${offsetPosition}`);
                            window.scrollTo({
                                top: offsetPosition,
                                behavior: "smooth"
                            });
                        });

                        // Marcar avisos como lidos ao navegar para a seção #avisos
                        if (href === "#avisos") {
                            console.log("Marcando notificações como lidas.");
                            markAllNotificationsAsRead();
                        }
                    }

                } else {
                    console.warn(`Elemento alvo para ${href} não encontrado.`);
                }
            } catch (error) {
                console.error(`Erro ao processar o link ${href}:`, error);
            }
        });
    });
}

// Salva o estado de visibilidade de uma seção no localStorage
function saveSectionVisibility(sectionId, isVisible) {
    const sectionStates = JSON.parse(localStorage.getItem("sectionStates") || "{}");
    sectionStates[sectionId] = isVisible;
    localStorage.setItem("sectionStates", JSON.stringify(sectionStates));
    console.log(`Estado da seção ${sectionId} salvo: ${isVisible}`);
}

// Restaura o estado de visibilidade das seções do localStorage
function restoreSectionVisibility() {
    const sectionStates = JSON.parse(localStorage.getItem("sectionStates") || "{}");
    
    // Aplica os estados salvos
    Object.keys(sectionStates).forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            if (sectionStates[sectionId]) {
                section.classList.add("visible");
                console.log(`Restaurando seção ${sectionId} como visível`);
            } else {
                section.classList.remove("visible");
                console.log(`Restaurando seção ${sectionId} como oculta`);
            }
        }
    });
}

// Garante que apenas a seção inicial (#hero) seja visível ao carregar
function initializeSectionVisibility() {
    // Primeiro, restaura do localStorage
    restoreSectionVisibility();
    
    // Se não houver estados salvos, define o padrão
    const sectionStates = JSON.parse(localStorage.getItem("sectionStates") || "{}");
    if (Object.keys(sectionStates).length === 0) {
        const sectionsToToggle = ["avisos", "creditos"];
        sectionsToToggle.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.remove("visible");
                saveSectionVisibility(sectionId, false);
                console.log(`Definindo estado inicial da seção ${sectionId} como oculta`);
            }
        });
    }
}

// --- Funções de Dados (LocalStorage e Notificações) ---

// Adiciona uma avaliação ao localStorage
function addRatingToLocalStorage(rating) {
    const ratings = JSON.parse(localStorage.getItem("ratings") || "[]");
    const newRating = {
        id: ratings.length > 0 ? Math.max(...ratings.map(r => r.id)) + 1 : 1,
        rating: rating,
        date: new Date().toLocaleString()
    };
    ratings.push(newRating);
    localStorage.setItem("ratings", JSON.stringify(ratings));
    console.log(`Nova avaliação adicionada: ${rating} estrelas`);
}

// Atualiza a exibição dos avisos na página principal
function updateNoticesDisplay() {
    const noticesContainer = document.getElementById("notices-container");
    if (!noticesContainer) return; // Sai se não estiver na página principal

    const notices = JSON.parse(localStorage.getItem("notices") || "[]");
    noticesContainer.innerHTML = ""; // Limpa a lista

    if (notices.length === 0) {
        noticesContainer.innerHTML = "<p class='no-notices'>Nenhum aviso no momento.</p>";
        return;
    }

    // Ordena por ID (mais recente primeiro)
    notices.sort((a, b) => b.id - a.id);

    notices.forEach(notice => {
        const noticeElement = document.createElement("div");
        noticeElement.classList.add("notice-card");
        if (!notice.read) {
            noticeElement.classList.add("unread");
        }
        noticeElement.innerHTML = `
            <h3 class="notice-title">${notice.title}</h3>
            <div class="notice-date">Publicado em: ${notice.date}</div>
            <div class="notice-content">${notice.content}</div>
        `;
        noticesContainer.appendChild(noticeElement);
    });
}

// Atualiza os badges de notificação
function updateNotificationBadges() {
    const notices = JSON.parse(localStorage.getItem("notices") || "[]");
    const unreadCount = notices.filter(notice => !notice.read).length;
    
    const badgeElements = document.querySelectorAll(".notification-badge");
    badgeElements.forEach(badge => {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.add("visible");
        } else {
            badge.classList.remove("visible");
        }
    });
    console.log(`Badges atualizados: ${unreadCount} não lidos.`);
}

// Marca todas as notificações como lidas
function markAllNotificationsAsRead() {
    let notices = JSON.parse(localStorage.getItem("notices") || "[]");
    let changed = false;
    notices = notices.map(notice => {
        if (!notice.read) {
            changed = true;
            return { ...notice, read: true };
        }
        return notice;
    });

    if (changed) {
        localStorage.setItem("notices", JSON.stringify(notices));
        updateNoticesDisplay(); // Atualiza a exibição para remover destaque de não lido
        updateNotificationBadges(); // Zera os badges
        console.log("Todas as notificações marcadas como lidas.");
    }
}

// Carregar dados iniciais (avisos) - Garante que o badge comece zerado
function loadInitialData() {
    let notices = JSON.parse(localStorage.getItem("notices") || "[]");
    if (localStorage.getItem("notices") === null) {
         localStorage.setItem("notices", JSON.stringify([]));
         notices = [];
    }
    updateNoticesDisplay();
    updateNotificationBadges();
}

// --- Funcionalidade Admin ---
function setupAdminFunctionality() {
    // Lógica para login_fixed_v2.html
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            
            // Credenciais de admin
            const correctUsername = "adm01011";
            const correctPassword = "11223";
            
            if (username === correctUsername && password === correctPassword) { 
                localStorage.setItem("isAdminAuthenticated", "true");
                window.location.href = "admin_fixed_v2.html";
            } else {
                showNotification("Usuário ou senha incorretos!", "error");
            }
        });
    }

    // Lógica para admin_fixed_v2.html
    const adminContainer = document.querySelector(".admin-container");
    if (adminContainer) {
        // Protege a página admin
        if (localStorage.getItem("isAdminAuthenticated") !== "true") {
            window.location.href = "login_fixed_v2.html";
            return; // Impede o resto do script de rodar se não autenticado
        }

        const adminNavLinks = document.querySelectorAll(".admin-nav-link");
        const adminSections = document.querySelectorAll(".admin-section");
        const logoutLink = document.getElementById("logout-link");
        const noticeForm = document.getElementById("notice-form");
        const noticesTableBody = document.getElementById("notices-table-body");
        const ratingsTableBody = document.getElementById("ratings-table-body");

        // Função para mostrar a seção correta no painel admin
        function showAdminSection(sectionId) {
            adminSections.forEach(section => {
                section.style.display = section.id === `${sectionId}-section` ? "block" : "none";
            });
            adminNavLinks.forEach(link => {
                link.classList.toggle("active", link.dataset.section === sectionId);
            });
            console.log(`Mostrando seção admin: ${sectionId}`);
        }

        // Adiciona listeners aos links da navegação admin
        adminNavLinks.forEach(link => {
            // Evita adicionar listener ao link de logout aqui
            if (link.id !== 'logout-link') { 
                link.addEventListener("click", function(e) {
                    e.preventDefault();
                    const section = this.dataset.section;
                    showAdminSection(section);
                });
            }
        });

        // Adiciona listener ao link de logout
        if (logoutLink) {
            logoutLink.addEventListener("click", function(e) {
                e.preventDefault();
                localStorage.removeItem("isAdminAuthenticated");
                window.location.href = "index.html";
            });
        }

        // Mostra a seção dashboard por padrão
        showAdminSection("dashboard");

        // Carrega os dados existentes nas tabelas
        loadAdminData();

        // Adiciona listener ao formulário de avisos
        if (noticeForm) {
            noticeForm.addEventListener("submit", function(e) {
                e.preventDefault();
                const title = document.getElementById("notice-title").value;
                const content = document.getElementById("notice-content").value;
                
                if (title && content) {
                    addNoticeToLocalStorage(title, content);
                    noticeForm.reset();
                    loadAdminData(); // Recarrega os dados para mostrar o novo aviso
                    showNotification("Aviso adicionado com sucesso!", "success");
                } else {
                    showNotification("Por favor, preencha todos os campos.", "warning");
                }
            });
        }

        // Função para carregar os dados nas tabelas admin
        function loadAdminData() {
            // Carrega avisos
            if (noticesTableBody) {
                const notices = JSON.parse(localStorage.getItem("notices") || "[]");
                noticesTableBody.innerHTML = "";
                
                if (notices.length === 0) {
                    noticesTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum aviso cadastrado.</td></tr>`;
                } else {
                    // Ordena por ID (mais recente primeiro)
                    notices.sort((a, b) => b.id - a.id);
                    
                    notices.forEach(notice => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${notice.id}</td>
                            <td>${notice.title}</td>
                            <td>${notice.date}</td>
                            <td class="actions-cell">
                                <button class="delete-btn" data-id="${notice.id}">Excluir</button>
                            </td>
                        `;
                        noticesTableBody.appendChild(row);
                    });
                    
                    // Adiciona listeners aos botões de excluir
                    document.querySelectorAll(".delete-btn").forEach(btn => {
                        btn.addEventListener("click", function() {
                            const id = parseInt(this.dataset.id);
                            deleteNotice(id);
                            loadAdminData(); // Recarrega os dados
                        });
                    });
                }
            }
            
            // Carrega avaliações
            if (ratingsTableBody) {
                const ratings = JSON.parse(localStorage.getItem("ratings") || "[]");
                ratingsTableBody.innerHTML = "";
                
                if (ratings.length === 0) {
                    ratingsTableBody.innerHTML = `<tr><td colspan="3" class="text-center">Nenhuma avaliação recebida.</td></tr>`;
                } else {
                    // Ordena por ID (mais recente primeiro)
                    ratings.sort((a, b) => b.id - a.id);
                    
                    ratings.forEach(rating => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${rating.id}</td>
                            <td>
                                <div class="rating-stars-display">
                                    ${"★".repeat(rating.rating)}${"☆".repeat(5 - rating.rating)}
                                </div>
                            </td>
                            <td>${rating.date}</td>
                        `;
                        ratingsTableBody.appendChild(row);
                    });
                }
            }
        }
    }
}

// Adiciona um aviso ao localStorage
function addNoticeToLocalStorage(title, content) {
    const notices = JSON.parse(localStorage.getItem("notices") || "[]");
    const newNotice = {
        id: notices.length > 0 ? Math.max(...notices.map(n => n.id)) + 1 : 1,
        title: title,
        content: content,
        date: new Date().toLocaleString(),
        read: false
    };
    notices.push(newNotice);
    localStorage.setItem("notices", JSON.stringify(notices));
    updateNotificationBadges(); // Atualiza os badges
    console.log(`Novo aviso adicionado: ${title}`);
}

// Exclui um aviso do localStorage
function deleteNotice(id) {
    let notices = JSON.parse(localStorage.getItem("notices") || "[]");
    notices = notices.filter(notice => notice.id !== id);
    localStorage.setItem("notices", JSON.stringify(notices));
    updateNotificationBadges(); // Atualiza os badges
    console.log(`Aviso ID ${id} excluído.`);
}

// --- Funções de UI e Notificações ---

// Mostra uma notificação na tela
function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Força um reflow para que a transição funcione
    notification.offsetHeight;
    
    // Mostra a notificação
    notification.classList.add("show");
    
    // Remove após 3 segundos
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.remove();
        }, 300); // Tempo para a transição de saída
    }, 3000);
}

// --- Funções para o Widget Discord ---

// Configura a atualização periódica dos dados do Discord
function setupDiscordWidgetUpdate(serverId) {
    // Atualiza imediatamente
    updateDiscordWidget(serverId);
    
    // E depois a cada 60 segundos
    setInterval(() => {
        updateDiscordWidget(serverId);
    }, 60000);
}

// Atualiza os dados do widget Discord
function updateDiscordWidget(serverId) {
    // Não é mais necessário buscar os dados do Discord para o cartão
    console.log("Cartão do Discord atualizado com botão convidativo.");
}

// --- Inicialização de Animações e Efeitos ---

// Observer para animações ao scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

// Observa todos os elementos com a classe animate-on-scroll
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});
