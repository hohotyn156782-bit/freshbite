/* ===== FreshBite — Food Delivery JS ===== */
(function () {
    'use strict';

    // ===== Language =====
    let lang = localStorage.getItem('fb-lang') || 'en';
    function setLang(l) {
        lang = l;
        localStorage.setItem('fb-lang', l);
        document.documentElement.lang = l;
        document.getElementById('langBtn').textContent = l.toUpperCase();
        document.querySelectorAll('[data-lang-en]').forEach(el => {
            el.textContent = el.getAttribute('data-lang-' + l);
        });
        document.querySelectorAll('[data-placeholder-en]').forEach(el => {
            el.placeholder = el.getAttribute('data-placeholder-' + l);
        });
    }
    document.getElementById('langBtn').addEventListener('click', () => setLang(lang === 'en' ? 'ru' : 'en'));

    // ===== Mobile Menu =====
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        burger.classList.remove('active');
        nav.classList.remove('open');
    }));

    // ===== Category Filter =====
    document.querySelectorAll('.cat-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const cat = card.dataset.category;
            document.querySelectorAll('.dish-card').forEach(dish => {
                if (cat === 'all' || dish.dataset.category === cat) {
                    dish.style.display = '';
                    setTimeout(() => dish.classList.add('visible'), 50);
                } else {
                    dish.style.display = 'none';
                    dish.classList.remove('visible');
                }
            });
        });
    });

    // ===== Order System =====
    let order = [];
    const orderFab = document.getElementById('orderFab');
    const orderPanel = document.getElementById('orderPanel');
    const orderOverlay = document.getElementById('orderOverlay');
    const orderClose = document.getElementById('orderClose');
    const orderItems = document.getElementById('orderItems');
    const orderEmpty = document.getElementById('orderEmpty');
    const orderFooter = document.getElementById('orderFooter');
    const fabCount = document.getElementById('fabCount');

    function openOrder() { orderPanel.classList.add('open'); orderOverlay.classList.add('active'); }
    function closeOrder() { orderPanel.classList.remove('open'); orderOverlay.classList.remove('active'); }
    orderFab.addEventListener('click', openOrder);
    orderClose.addEventListener('click', closeOrder);
    orderOverlay.addEventListener('click', closeOrder);

    function updateOrder() {
        fabCount.textContent = order.reduce((s, i) => s + i.qty, 0);
        const subtotal = order.reduce((s, i) => s + i.price * i.qty, 0);
        document.getElementById('orderSubtotal').textContent = '$' + subtotal.toFixed(2);
        document.getElementById('orderTotal').textContent = '$' + (subtotal + 2.99).toFixed(2);

        const existing = orderItems.querySelectorAll('.order-item');
        existing.forEach(el => el.remove());

        if (order.length === 0) {
            orderEmpty.style.display = 'block';
            orderFooter.style.display = 'none';
            return;
        }
        orderEmpty.style.display = 'none';
        orderFooter.style.display = 'block';

        order.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'order-item';
            const name = lang === 'ru' ? item.nameRu : item.name;
            div.innerHTML = `
                <div class="order-item-img" style="background:${item.bg}">${item.emoji}</div>
                <div class="order-item-info">
                    <h4>${name}</h4>
                    <span class="oi-price">$${item.price.toFixed(2)}</span>
                </div>
                <div class="order-item-qty">
                    <button data-action="dec" data-idx="${idx}">-</button>
                    <span>${item.qty}</span>
                    <button data-action="inc" data-idx="${idx}">+</button>
                </div>`;
            orderItems.appendChild(div);
        });

        orderItems.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                if (btn.dataset.action === 'inc') order[idx].qty++;
                else { order[idx].qty--; if (order[idx].qty <= 0) order.splice(idx, 1); }
                updateOrder();
            });
        });
    }

    document.querySelectorAll('.dish-add').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.dish-card');
            const name = card.dataset.name;
            const nameRu = card.dataset.nameRu;
            const price = parseFloat(card.dataset.price);
            const bg = card.querySelector('.dish-img').style.background;
            const emoji = card.querySelector('.dish-emoji').textContent;

            const existing = order.find(i => i.name === name);
            if (existing) existing.qty++;
            else order.push({ name, nameRu, price, bg, emoji, qty: 1 });

            updateOrder();

            // Button pulse
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => btn.style.transform = '', 200);
        });
    });

    // ===== Reviews Carousel =====
    const reviews = document.querySelectorAll('.review-card');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let autoSlide;

    function goToSlide(idx) {
        reviews.forEach(r => r.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        reviews[idx].classList.add('active');
        dots[idx].classList.add('active');
        currentSlide = idx;
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goToSlide(parseInt(dot.dataset.slide));
            resetAuto();
        });
    });

    function resetAuto() {
        clearInterval(autoSlide);
        autoSlide = setInterval(() => goToSlide((currentSlide + 1) % reviews.length), 5000);
    }
    resetAuto();

    // ===== Scroll Animations =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.dish-card, .step').forEach((el, i) => {
        el.style.transitionDelay = (i % 4) * 0.1 + 's';
        observer.observe(el);
    });

    // ===== Init =====
    setLang(lang);

})();
