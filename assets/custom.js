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
  const mainImage = document.getElementById('StageProductImage') || document.querySelector('.stage-image-wrapper img');
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

  // -------------------------------------------------------------
  // 5. Premium Slide-Out Cart Drawer & AJAX Interactions
  // -------------------------------------------------------------
  const cartDrawer = document.getElementById('CartDrawer');
  const cartBackdrop = document.getElementById('CartDrawerBackdrop');
  const cartTrigger = document.getElementById('CartDrawerTrigger');

  const openCartDrawer = () => {
    document.body.classList.add('cart-drawer-open');
    if (cartDrawer) cartDrawer.setAttribute('aria-hidden', 'false');
    if (cartBackdrop) cartBackdrop.setAttribute('aria-hidden', 'false');
    if (cartTrigger) cartTrigger.setAttribute('aria-expanded', 'true');
  };

  const closeCartDrawer = () => {
    document.body.classList.remove('cart-drawer-open');
    if (cartDrawer) cartDrawer.setAttribute('aria-hidden', 'true');
    if (cartBackdrop) cartBackdrop.setAttribute('aria-hidden', 'true');
    if (cartTrigger) cartTrigger.setAttribute('aria-expanded', 'false');
  };

  const updateHeaderCartCount = (count) => {
    const countBadge = document.getElementById('HeaderCartCount') || document.querySelector('.header__cart-count');
    const num = parseInt(count, 10) || 0;
    if (countBadge) {
      countBadge.textContent = num;
      if (num > 0) {
        countBadge.classList.remove('is-hidden');
        countBadge.style.display = 'flex';
      } else {
        countBadge.classList.add('is-hidden');
        countBadge.style.display = 'none';
      }
    }
  };

  const renderCartDrawerHTML = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newDrawer = doc.querySelector('#CartDrawer');
    const currentDrawer = document.getElementById('CartDrawer');

    if (newDrawer && currentDrawer) {
      currentDrawer.innerHTML = newDrawer.innerHTML;
    }

    const countTracker = doc.querySelector('#CartDrawerItemCount');
    if (countTracker) {
      updateHeaderCartCount(countTracker.getAttribute('data-item-count'));
    }
  };

  const fetchAndUpdateCartDrawer = async () => {
    try {
      const rootUrl = window.Shopify?.routes?.root || '/';
      const res = await fetch(`${rootUrl}?section_id=cart-drawer`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('Failed to fetch cart drawer');
      const html = await res.text();
      renderCartDrawerHTML(html);
    } catch (err) {
      console.error('Error fetching cart drawer:', err);
    }
  };

  const changeCartItem = async (key, quantity) => {
    const drawerBody = document.getElementById('CartDrawerBody');
    if (drawerBody) drawerBody.style.opacity = '0.5';

    try {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: key,
          quantity: quantity,
          sections: 'cart-drawer'
        })
      });

      if (!res.ok) throw new Error('Failed to update cart');
      const data = await res.json();

      if (data.sections && data.sections['cart-drawer']) {
        renderCartDrawerHTML(data.sections['cart-drawer']);
        if (data.item_count !== undefined) {
          updateHeaderCartCount(data.item_count);
        }
      } else {
        await fetchAndUpdateCartDrawer();
      }
    } catch (err) {
      console.error('Cart item update error:', err);
      await fetchAndUpdateCartDrawer();
    } finally {
      if (drawerBody) drawerBody.style.opacity = '1';
    }
  };

  // Delegated Click Handlers for Drawer
  document.addEventListener('click', (e) => {
    // 1. Open Drawer from Header trigger or any data-open-cart element
    if (e.target.closest('#CartDrawerTrigger') || e.target.closest('[data-open-cart]')) {
      e.preventDefault();
      openCartDrawer();
      return;
    }

    // 2. Close Drawer via X button
    if (e.target.closest('#CartDrawerClose') || e.target.closest('.cart-drawer__close-btn')) {
      e.preventDefault();
      closeCartDrawer();
      return;
    }

    // 3. Close Drawer via Backdrop click
    if (e.target.id === 'CartDrawerBackdrop' || e.target.closest('#CartDrawerBackdrop')) {
      e.preventDefault();
      closeCartDrawer();
      return;
    }

    // 4. Continue Shopping button
    if (e.target.closest('#CartDrawerContinue') || e.target.closest('.cart-drawer__continue-btn')) {
      e.preventDefault();
      closeCartDrawer();
      return;
    }

    // 5. Stepper Minus
    const minusBtn = e.target.closest('.cart-drawer__stepper-btn--minus');
    if (minusBtn) {
      e.preventDefault();
      const key = minusBtn.getAttribute('data-item-key');
      const qty = parseInt(minusBtn.getAttribute('data-quantity'), 10);
      changeCartItem(key, Math.max(0, qty));
      return;
    }

    // 6. Stepper Plus
    const plusBtn = e.target.closest('.cart-drawer__stepper-btn--plus');
    if (plusBtn) {
      e.preventDefault();
      const key = plusBtn.getAttribute('data-item-key');
      const qty = parseInt(plusBtn.getAttribute('data-quantity'), 10);
      changeCartItem(key, qty);
      return;
    }

    // 7. Remove Item Trash Button
    const removeBtn = e.target.closest('.cart-drawer__remove-btn');
    if (removeBtn) {
      e.preventDefault();
      const key = removeBtn.getAttribute('data-item-key');
      changeCartItem(key, 0);
      return;
    }
  });

  // ESC key to close drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('cart-drawer-open')) {
      closeCartDrawer();
    }
  });

  // Intercept Add to Cart form submissions
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form) return;

    // Ignore checkout form in cart drawer
    if (form.id === 'CartDrawerForm' || (e.submitter && e.submitter.name === 'checkout')) {
      return;
    }

    // Intercept product add forms
    const isCartAddForm = form.id === 'ProductForm' ||
                          form.classList.contains('product-form') ||
                          form.getAttribute('action')?.includes('/cart/add');

    if (isCartAddForm) {
      e.preventDefault();

      const atcBtn = form.querySelector('#AddToCartBtn') || form.querySelector('button[name="add"]') || form.querySelector('button[type="submit"]');
      const originalText = atcBtn ? atcBtn.innerHTML : '';

      if (atcBtn) {
        atcBtn.disabled = true;
        atcBtn.style.opacity = '0.7';
        atcBtn.innerHTML = '<span>ADDING TO CART...</span>';
      }

      try {
        const formData = new FormData(form);
        formData.append('sections', 'cart-drawer');

        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });

        if (!res.ok) {
          const errJson = await res.json();
          throw new Error(errJson.description || 'Could not add item to cart.');
        }

        const data = await res.json();

        if (data.sections && data.sections['cart-drawer']) {
          renderCartDrawerHTML(data.sections['cart-drawer']);
        } else {
          await fetchAndUpdateCartDrawer();
        }

        // Fetch fresh cart item count
        const cartRes = await fetch('/cart.js');
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          updateHeaderCartCount(cartData.item_count);
        }

        openCartDrawer();
      } catch (err) {
        console.error('Add to Cart Error:', err);
        alert(err.message || 'Error adding product to cart.');
      } finally {
        if (atcBtn) {
          atcBtn.disabled = false;
          atcBtn.style.opacity = '1';
          atcBtn.innerHTML = originalText;
        }
      }
    }
  });
});
