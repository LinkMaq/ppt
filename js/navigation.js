/* =========================================
   导航逻辑 (翻页、键盘控制、进度条、hash 路由) (navigation.js)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const slideList = Array.from(slides);
    const totalSlides = slides.length;
    let currentSlideIndex = 0;
    let lastWheelNavigationAt = 0;
    let isSyncingHash = false;

    // UI 元素
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const progressBar = document.getElementById('progress-bar');
    const pageCounter = document.getElementById('current-page');
    const elTotalPages = document.getElementById('total-pages');
    const slideTitle = document.getElementById('slide-title');
    const globalWatermark = document.getElementById('global-watermark');

    elTotalPages.textContent = totalSlides;
    /**
     * 更新幻灯片状态
     */
    function updateSlide(index) {
        // 边界检查
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;

        // 更新前后样式 (为过渡动画做准备)
        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'past');
            if (i < index) {
                slide.classList.add('past');
            }
        });

        // 激活当前页
        slides[index].classList.add('active');
        currentSlideIndex = index;

        if (globalWatermark) {
            const shouldShowWatermark = !slides[index].classList.contains('no-watermark');
            globalWatermark.classList.toggle('show', shouldShowWatermark);
            globalWatermark.classList.toggle('on-dark', slides[index].classList.contains('theme-dark'));
        }

        // 更新 UI
        pageCounter.textContent = index + 1;
        progressBar.style.width = `${((index + 1) / totalSlides) * 100}%`;
        
        const title = slides[index].getAttribute('data-title');
        slideTitle.textContent = title ? title : `Slide ${index + 1}`;

        // 使用 History API 同步路由，避免浏览器按锚点滚动到对应 section
        const currentSlideId = slides[index].id;
        const targetHash = currentSlideId ? `#${currentSlideId}` : `#slide-${index + 1}`;
        if (window.location.hash !== targetHash) {
            isSyncingHash = true;
            window.history.replaceState(null, '', targetHash);
            window.setTimeout(() => {
                isSyncingHash = false;
            }, 0);
        }

        // 强制保持演示视口停留在页面顶部，防止刷新或 hash 跳转导致页面被滚动到 DOM 深处
        window.scrollTo(0, 0);
    }

    /**
     * 下一页
     */
    function nextSlide() {
        if (currentSlideIndex < totalSlides - 1) {
            updateSlide(currentSlideIndex + 1);
        }
    }

    /**
     * 上一页
     */
    function prevSlide() {
        if (currentSlideIndex > 0) {
            updateSlide(currentSlideIndex - 1);
        }
    }

    // 绑定按钮事件
    btnNext.addEventListener('click', nextSlide);
    btnPrev.addEventListener('click', prevSlide);

    // 绑定键盘事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
            prevSlide();
        }
    });

    // 处理鼠标滚轮 / 触控板滚动翻页
    document.addEventListener('wheel', (e) => {
        const deltaY = e.deltaY;
        const threshold = 60;
        const cooldown = 650;

        if (e.ctrlKey || Math.abs(deltaY) < threshold) {
            return;
        }

        const now = Date.now();
        if (now - lastWheelNavigationAt < cooldown) {
            e.preventDefault();
            return;
        }

        lastWheelNavigationAt = now;
        e.preventDefault();

        if (deltaY > 0) {
            nextSlide();
            return;
        }

        prevSlide();
    }, { passive: false });

    // 处理触摸滑动 (移动端)
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const threshold = 50; // 滑动阈值
        if (touchEndX < touchStartX - threshold) {
            nextSlide(); // 向左滑 -> 下一页
        }
        if (touchEndX > touchStartX + threshold) {
            prevSlide(); // 向右滑 -> 上一页
        }
    }

    // 初始路由检查 (允许直接打开 #slide-N 跳转)
    function initFromHash() {
        window.scrollTo(0, 0);

        if (window.location.hash) {
            const targetId = window.location.hash.replace(/^#/, '');
            const targetIndex = slideList.findIndex((slide) => slide.id === targetId);
            if (targetIndex >= 0 && targetIndex < totalSlides) {
                updateSlide(targetIndex);
                return;
            }

            const match = targetId.match(/slide-(\d+)/);
            if (match && match[1]) {
                const fallbackIndex = parseInt(match[1], 10) - 1;
                if (fallbackIndex >= 0 && fallbackIndex < totalSlides) {
                    updateSlide(fallbackIndex);
                    return;
                }
            }
        }
        updateSlide(0); // 默认第一页
    }

    initFromHash();
    window.addEventListener('hashchange', () => {
        if (isSyncingHash) {
            window.scrollTo(0, 0);
            return;
        }

        initFromHash();
    });
});
