/**
 * Sur-Ron Light Bee 2026 - Custom Theme JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Scroll State
  const headerWrapper = document.querySelector('.header-wrapper');
  if (headerWrapper) {
    const handleHeaderScroll = () => {
      if (window.scrollY > 25) {
        headerWrapper.classList.add('scrolled');
      } else {
        headerWrapper.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

  // 2. Sticky Buy Bar Visibility
  const stickyBuyBar = document.querySelector('.sticky-buy-bar');
  if (stickyBuyBar) {
    const handleStickyBar = () => {
      const threshold = window.innerHeight * 0.8;
      if (window.scrollY > threshold) {
        stickyBuyBar.classList.add('is-visible');
      } else {
        stickyBuyBar.classList.remove('is-visible');
      }
    };
    window.addEventListener('scroll', handleStickyBar, { passive: true });
    handleStickyBar();
  }

  // 3. Color Stage Swatch Switcher & 3D Tilt
  const colorStage = document.querySelector('.stage-card');
  const mainImage = document.getElementById('StageProductImage');
  const variantTag = document.getElementById('StageVariantName');
  const swatches = document.querySelectorAll('.stage-swatch');

  if (swatches.length > 0 && mainImage) {
    swatches.forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        e.preventDefault();
        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const newSrc = swatch.getAttribute('data-image-src');
        const colorName = swatch.getAttribute('data-color-name');

        if (mainImage.src !== newSrc) {
          mainImage.style.opacity = '0';
          setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.alt = colorName;
            mainImage.style.opacity = '1';
          }, 200);
        }

        if (variantTag && colorName) {
          variantTag.textContent = colorName;
        }
      });
    });
  }

  // 3D Tilt Effect on Color Stage (.stage-card)
  if (colorStage) {
    const inner = colorStage.querySelector('.stage-inner') || colorStage;
    
    colorStage.addEventListener('mousemove', (e) => {
      const rect = colorStage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // rotateY up to 12deg, rotateX up to 9deg
      const rotateX = ((centerY - y) / centerY) * 9;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      inner.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-10px)`;
    });

    colorStage.addEventListener('mouseleave', () => {
      inner.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  }

  // 4. Performance Stats Count-Up Animation
  const statNumbers = document.querySelectorAll('[data-counter-target]');
  if (statNumbers.length > 0) {
    const countUp = (el) => {
      const target = parseFloat(el.getAttribute('data-counter-target'));
      const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
      const duration = 1400; // 1.4s
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutCubic: 1 - Math.pow(1 - progress, 3)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeOut * target;
        
        el.textContent = currentVal.toFixed(decimals);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target.toFixed(decimals);
        }
      };

      requestAnimationFrame(updateCounter);
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    statNumbers.forEach(stat => counterObserver.observe(stat));
  }

  // 5. Scroll Reveal Observer
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 6. FAQ Accordion Interaction
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      
      // Close other open FAQ items
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          const otherBody = other.querySelector('.faq-body');
          if (otherBody) otherBody.style.maxHeight = null;
        }
      });

      if (!isOpen) {
        item.classList.add('is-open');
        const body = item.querySelector('.faq-body');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        item.classList.remove('is-open');
        const body = item.querySelector('.faq-body');
        if (body) body.style.maxHeight = null;
      }
    });
  });
});
