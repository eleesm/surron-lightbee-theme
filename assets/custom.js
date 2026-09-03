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

  // 2. Global Scroll-Reveal ([data-rv] threshold 0.25)
  const rvElements = document.querySelectorAll('[data-rv]');
  if (rvElements.length > 0) {
    const rvObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    rvElements.forEach(el => rvObserver.observe(el));
  }

  // 3. Color Stage Swatch Switcher (Crossfade 220ms, .on class, tag update)
  const colorStage = document.querySelector('.stage-card');
  const mainImage = document.getElementById('StageProductImage');
  const variantTag = document.getElementById('StageVariantName');
  const swatches = document.querySelectorAll('.stage-swatch');

  if (swatches.length > 0 && mainImage) {
    swatches.forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        e.preventDefault();
        swatches.forEach(s => s.classList.remove('on', 'active'));
        swatch.classList.add('on', 'active');

        const newSrc = swatch.getAttribute('data-image-src');
        const colorName = swatch.getAttribute('data-color-name');

        if (mainImage.src !== newSrc) {
          mainImage.style.transition = 'opacity 220ms ease';
          mainImage.style.opacity = '0';
          setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.alt = colorName;
            mainImage.style.opacity = '1';
          }, 220);
        }

        if (variantTag && colorName) {
          variantTag.textContent = colorName;
        }
      });
    });
  }

  // 3D Tilt Effect on Color Stage (rotateY ±12deg, rotateX ±9deg, translateY -10px)
  if (colorStage) {
    const inner = colorStage.querySelector('.stage-inner') || colorStage;
    
    colorStage.addEventListener('mousemove', (e) => {
      const rect = colorStage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // rotateY ±12deg, rotateX ±9deg
      const rotateX = ((centerY - y) / centerY) * 9;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      inner.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-10px)`;
    });

    colorStage.addEventListener('mouseleave', () => {
      inner.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  }

  // 4. Performance Stats Count-Up Animation (1400ms, ease-out cubic)
  const statNumbers = document.querySelectorAll('[data-counter-target]');
  if (statNumbers.length > 0) {
    const countUp = (el) => {
      const target = parseFloat(el.getAttribute('data-counter-target'));
      const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
      const duration = 1400; // 1400ms
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
    }, { threshold: 0.25 });

    statNumbers.forEach(stat => counterObserver.observe(stat));
  }
});
