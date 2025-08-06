/**
 * Quality Mais - Script Principal
 * Versão otimizada com melhor performance e organização
 */

class QualityMaisApp {
    constructor() {
        this.elements = {};
        this.config = {
            scrollThreshold: 50,
            animationDuration: 1500,
            counterStepTime: 20,
            feedbackDuration: 2500
        };
        this.products = {
            picanha: { name: "Picanha Bovina Premium", price: 54.90, originalPrice: 69.90 },
            tomate: { name: "Tomate Italiano", price: 5.99, originalPrice: 8.99 },
            pao: { name: "Pão Francês", price: 14.99, originalPrice: 18.90 },
            guarana: { name: "Guaraná 2L", price: 5.50, originalPrice: 7.50 }
        };
        
        this.init();
    }

    /**
     * Inicialização da aplicação
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupObservers();
        this.updateCurrentYear();
        this.initializeAnimations();
    }

    /**
     * Cache dos elementos DOM para melhor performance
     */
    cacheElements() {
        this.elements = {
            mobileMenuButton: document.getElementById("mobile-menu-button"),
            mobileMenu: document.getElementById("mobile-menu"),
            navbar: document.getElementById("navbar"),
            backToTopButton: document.getElementById("back-to-top"),
            currentYearSpan: document.getElementById("current-year"),
            calculateBtn: document.getElementById("calculate-btn"),
            productSelect: document.getElementById("product-select"),
            quantityInput: document.getElementById("product-quantity"),
            calculationResultDiv: document.getElementById("calculation-result"),
            resultTextEl: document.getElementById("result-text"),
            counters: document.querySelectorAll(".counter, .counter-percent"),
            animatedElements: document.querySelectorAll(".animate-on-scroll"),
            mobileNavLinks: document.querySelectorAll("#mobile-menu a"),
            anchorLinks: document.querySelectorAll("a[href^=\"#\"]"),
            addToCartButtons: document.querySelectorAll(".add-to-cart")
        };
    }

    /**
     * Vinculação de eventos
     */
    bindEvents() {
        // Menu mobile
        this.elements.mobileMenuButton?.addEventListener("click", () => this.toggleMobileMenu());
        
        // Links do menu mobile
        this.elements.mobileNavLinks.forEach(link => {
            link.addEventListener("click", () => this.closeMobileMenu());
        });

        // Scroll events
        window.addEventListener("scroll", this.throttle(() => this.handleScroll(), 16));
        
        // Botão voltar ao topo
        this.elements.backToTopButton?.addEventListener("click", () => this.scrollToTop());

        // Scroll suave para âncoras
        this.elements.anchorLinks.forEach(anchor => {
            anchor.addEventListener("click", (e) => this.handleAnchorClick(e));
        });

        // Calculadora de ofertas
        this.elements.calculateBtn?.addEventListener("click", () => this.calculateSavings());

        // Carrinho de compras
        document.addEventListener("click", (e) => this.handleCartActions(e));

        // Keyboard navigation
        document.addEventListener("keydown", (e) => this.handleKeyboardNavigation(e));
    }

    /**
     * Configuração dos observers para animações
     */
    setupObservers() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleElementIntersection(entry.target);
                    this.intersectionObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar contadores e elementos animados
        [...this.elements.counters, ...this.elements.animatedElements].forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }

    /**
     * Manipulação de elementos que entram na viewport
     */
    handleElementIntersection(element) {
        if (element.classList.contains("counter") || element.classList.contains("counter-percent")) {
            this.animateCounter(element);
        } else {
            element.classList.add("animate-fadeIn");
        }
    }

    /**
     * Toggle do menu mobile
     */
    toggleMobileMenu() {
        this.elements.mobileMenu?.classList.toggle("hidden");
        
        // Acessibilidade
        const isOpen = !this.elements.mobileMenu?.classList.contains("hidden");
        this.elements.mobileMenuButton?.setAttribute("aria-expanded", isOpen);
    }

    /**
     * Fechar menu mobile
     */
    closeMobileMenu() {
        this.elements.mobileMenu?.classList.add("hidden");
        this.elements.mobileMenuButton?.setAttribute("aria-expanded", "false");
    }

    /**
     * Manipulação do scroll
     */
    handleScroll() {
        const scrollY = window.scrollY;
        const isScrolled = scrollY > this.config.scrollThreshold;

        // Navbar effect
        this.elements.navbar?.classList.toggle("scrolled", isScrolled);

        // Back to top button
        if (this.elements.backToTopButton) {
            this.elements.backToTopButton.classList.toggle("opacity-0", !isScrolled);
            this.elements.backToTopButton.classList.toggle("pointer-events-none", !isScrolled);
        }
    }

    /**
     * Scroll para o topo
     */
    scrollToTop() {
        window.scrollTo({ 
            top: 0, 
            behavior: "smooth" 
        });
    }

    /**
     * Manipulação de cliques em âncoras
     */
    handleAnchorClick(event) {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute("href");
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navbarHeight = this.elements.navbar?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });
        }
    }

    /**
     * Animação dos contadores
     */
    animateCounter(counter) {
        const target = parseInt(counter.dataset.target);
        const isPercent = counter.classList.contains("counter-percent");
        const steps = this.config.animationDuration / this.config.counterStepTime;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                counter.textContent = target + (isPercent ? "%" : "");
            } else {
                counter.textContent = Math.ceil(current) + (isPercent ? "%" : "");
            }
        }, this.config.counterStepTime);
    }

    /**
     * Calculadora de economia
     */
    calculateSavings() {
        const productId = this.elements.productSelect?.value;
        const quantity = parseFloat(this.elements.quantityInput?.value) || 1;
        
        if (!productId || !this.products[productId]) {
            this.showNotification("Por favor, selecione um produto válido.", "warning");
            return;
        }
        
        const product = this.products[productId];
        const totalPrice = product.price * quantity;
        const totalOriginal = product.originalPrice * quantity;
        const savings = totalOriginal - totalPrice;
        const savingsPercent = ((savings / totalOriginal) * 100).toFixed(0);
        
        if (this.elements.resultTextEl && this.elements.calculationResultDiv) {
            this.elements.resultTextEl.innerHTML = `
                Comprando <strong>${quantity}</strong> de <strong>${product.name}</strong>, 
                você paga <strong>R$ ${totalPrice.toFixed(2)}</strong> e 
                <span class="text-green-600 font-bold">economiza R$ ${savings.toFixed(2)} (${savingsPercent}%)</span>!
            `;
            this.elements.calculationResultDiv.classList.remove("hidden");
            
            // Animação de entrada
            this.elements.calculationResultDiv.style.opacity = "0";
            this.elements.calculationResultDiv.style.transform = "translateY(10px)";
            
            requestAnimationFrame(() => {
                this.elements.calculationResultDiv.style.transition = "all 0.3s ease";
                this.elements.calculationResultDiv.style.opacity = "1";
                this.elements.calculationResultDiv.style.transform = "translateY(0)";
            });
        }
    }

    /**
     * Manipulação de ações do carrinho
     */
    handleCartActions(event) {
        const addToCartButton = event.target.closest(".add-to-cart");
        if (!addToCartButton) return;

        const productCard = addToCartButton.closest(".product-card");
        if (!productCard) return;

        const productName = productCard.dataset.name;
        const productPrice = productCard.dataset.price;
        
        // Animação do botão
        this.animateButton(addToCartButton);
        
        // Feedback visual
        this.showNotification(`${productName} adicionado ao carrinho!`, "success");
        
        // Analytics (simulado)
        this.trackEvent("add_to_cart", {
            product_name: productName,
            product_price: productPrice
        });
    }

    /**
     * Animação de botão
     */
    animateButton(button) {
        button.style.transform = "scale(0.95)";
        button.style.transition = "transform 0.1s ease";
        
        setTimeout(() => {
            button.style.transform = "scale(1)";
        }, 100);
    }

    /**
     * Sistema de notificações
     */
    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        const typeClasses = {
            success: "bg-green-600",
            warning: "bg-yellow-600",
            error: "bg-red-600",
            info: "bg-blue-600"
        };
        
        notification.className = `
            fixed bottom-4 right-4 ${typeClasses[type]} text-white px-6 py-3 
            rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300
        `;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${this.getNotificationIcon(type)} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animação de entrada
        requestAnimationFrame(() => {
            notification.classList.remove("translate-x-full");
        });
        
        // Remoção automática
        setTimeout(() => {
            notification.classList.add("translate-x-full");
            setTimeout(() => notification.remove(), 300);
        }, this.config.feedbackDuration);
    }

    /**
     * Ícones para notificações
     */
    getNotificationIcon(type) {
        const icons = {
            success: "check-circle",
            warning: "exclamation-triangle",
            error: "times-circle",
            info: "info-circle"
        };
        return icons[type] || "info-circle";
    }

    /**
     * Navegação por teclado
     */
    handleKeyboardNavigation(event) {
        // ESC para fechar menu mobile
        if (event.key === "Escape") {
            this.closeMobileMenu();
        }
        
        // Enter/Space para ativar botões
        if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("nav-link")) {
            event.preventDefault();
            event.target.click();
        }
    }

    /**
     * Atualização do ano atual
     */
    updateCurrentYear() {
        if (this.elements.currentYearSpan) {
            this.elements.currentYearSpan.textContent = new Date().getFullYear();
        }
    }

    /**
     * Inicialização de animações
     */
    initializeAnimations() {
        // Verificar se o usuário prefere movimento reduzido
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        
        if (prefersReducedMotion) {
            document.documentElement.style.setProperty("--transition-normal", "0.01ms");
            document.documentElement.style.setProperty("--transition-slow", "0.01ms");
        }
    }

    /**
     * Throttle para otimização de performance
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Debounce para otimização de performance
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Tracking de eventos (simulado)
     */
    trackEvent(eventName, properties = {}) {
        // Em produção, aqui seria integrado com Google Analytics, etc.
        console.log(`Event tracked: ${eventName}`, properties);
    }

    /**
     * Cleanup ao descarregar a página
     */
    destroy() {
        this.intersectionObserver?.disconnect();
        window.removeEventListener("scroll", this.handleScroll);
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
    window.qualityMaisApp = new QualityMaisApp();
});

// Cleanup ao descarregar
window.addEventListener("beforeunload", () => {
    window.qualityMaisApp?.destroy();
});

