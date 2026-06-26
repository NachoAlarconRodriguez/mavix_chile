document.addEventListener('DOMContentLoaded', () => {
  
  // 0. Hero Background Spotlight & KPI Counter
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const watermark = heroSection.querySelector('.hero-watermark-scale');
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      heroSection.style.setProperty('--mouse-x', `${x}px`);
      heroSection.style.setProperty('--mouse-y', `${y}px`);
      
      // Subtle parallax effect on the background watermark
      if (watermark) {
        const moveX = (x - rect.width / 2) * -0.04;
        const moveY = (y - rect.height / 2) * -0.04;
        watermark.style.transform = `translate(${moveX}px, ${moveY}px) rotate(-8deg)`;
      }
    });
  }

  function animateValue(obj, start, end, duration, suffix = "", prefix = "") {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = prefix + Math.floor(progress * (end - start) + start).toLocaleString() + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  const kpiElements = document.querySelectorAll('.kpi-num[data-val]');
  kpiElements.forEach(el => {
    const target = parseInt(el.getAttribute('data-val'));
    const isPercent = el.textContent.includes('%') || el.getAttribute('data-val') === '150';
    const prefix = '+';
    const suffix = isPercent ? '%' : '';
    animateValue(el, 0, target, 2000, suffix, prefix);
  });

  const heroLikesCounter = document.getElementById('hero-likes-counter');
  if (heroLikesCounter) {
    animateValue(heroLikesCounter, 150, 12500, 2500, "");
  }

  // 0.1. Drag and Drop for Holographic Cards
  const holoCards = document.querySelectorAll('.holo-card');
  const heroVisual = document.querySelector('.hero-visual');

  if (holoCards.length && heroVisual) {
    holoCards.forEach(card => {
      let isDragging = false;
      let startX, startY;
      let cardLeft, cardTop;

      card.addEventListener('pointerdown', (e) => {
        // Prevent dragging when clicking inner links or action buttons
        if (e.target.closest('a') || e.target.closest('button') || e.target.closest('svg')) return;

        isDragging = true;
        card.classList.add('dragging');
        card.setPointerCapture(e.pointerId);

        // Get starting mouse/touch positions
        startX = e.clientX;
        startY = e.clientY;

        // Get current card offsets relative to the parent container
        const rect = card.getBoundingClientRect();
        const containerRect = heroVisual.getBoundingClientRect();
        cardLeft = rect.left - containerRect.left;
        cardTop = rect.top - containerRect.top;
      });

      card.addEventListener('pointermove', (e) => {
        if (!isDragging) return;

        // Calculate moved distances
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // Calculate proposed positions
        let newLeft = cardLeft + deltaX;
        let newTop = cardTop + deltaY;

        // Contain positions within hero-visual box boundaries (with a margin)
        const containerRect = heroVisual.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        
        const minLeft = -cardRect.width / 2;
        const maxLeft = containerRect.width - cardRect.width / 2;
        const minTop = -cardRect.height / 2;
        const maxTop = containerRect.height - cardRect.height / 2;

        newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
        newTop = Math.max(minTop, Math.min(newTop, maxTop));

        card.style.left = `${newLeft}px`;
        card.style.top = `${newTop}px`;
        card.style.right = 'auto';
        card.style.bottom = 'auto';
      });

      card.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove('dragging');
        card.releasePointerCapture(e.pointerId);
      });

      card.addEventListener('pointercancel', (e) => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove('dragging');
        card.releasePointerCapture(e.pointerId);
      });
    });
  }

  // 1. Navigation Scroll Tracker
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 2. Mobile Menu Toggle
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      // Rotate sandwich lines into an X
      const spans = mobileNavToggle.querySelectorAll('span');
      if (spans.length >= 3) {
        spans[0].style.transform = navLinks.classList.contains('open') ? 'rotate(45deg) translate(5px, 5px)' : 'none';
        spans[1].style.opacity = navLinks.classList.contains('open') ? '0' : '1';
        spans[2].style.transform = navLinks.classList.contains('open') ? 'rotate(-45deg) translate(5px, -5px)' : 'none';
      }
    });

    // Close mobile nav when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = mobileNavToggle.querySelectorAll('span');
        if (spans.length >= 3) {
          spans[0].style.transform = 'none';
          spans[1].style.opacity = '1';
          spans[2].style.transform = 'none';
        }
      });
    });
  }

  // 3. Typewriter Effect
  const typewriterElement = document.getElementById('typewriter');
  const words = ["estrategias de marketing digital", "sitios web de alta conversión", "identidades de marca memorables", "embudos de venta automatizados", "campañas publicitarias rentables"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause at end of word
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }
  
  if (typewriterElement) {
    type();
  }

  // 4. Testimonial Carousel
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.querySelector('.tn-dots');
  const prevBtn = document.getElementById('prev-testimonial');
  const nextBtn = document.getElementById('next-testimonial');
  const brandItems = document.querySelectorAll('.brand-item');
  let currentSlide = 0;
  let autoPlayTimer;

  if (slides.length > 0) {
    // Create dots dynamically
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('tn-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      if (dotsContainer) dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.tn-dot');

    // Add click listener to brand navigation items
    if (brandItems.length > 0) {
      brandItems.forEach((item, index) => {
        item.addEventListener('click', () => goToSlide(index));
      });
    }

    function updateSlides() {
      slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (dots[index]) dots[index].classList.remove('active');
        if (brandItems[index]) brandItems[index].classList.remove('active');
      });
      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');
      if (brandItems[currentSlide]) brandItems[currentSlide].classList.add('active');
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      goToSlide(currentSlide);
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      goToSlide(currentSlide);
    }

    function goToSlide(index) {
      currentSlide = index;
      updateSlides();
      resetAutoPlay();
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', prevSlide);
      nextBtn.addEventListener('click', nextSlide);
      startAutoPlay();
    }

    function startAutoPlay() {
      autoPlayTimer = setInterval(nextSlide, 7000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }
  }

  // 5. Reveal on Scroll (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(element => {
    observer.observe(element);
  });

  // 6. Interactive Multi-Step Form
  const formSteps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressBar = document.querySelector('.step-progress-bar');
  const nextStepBtns = document.querySelectorAll('.next-step');
  const prevStepBtns = document.querySelectorAll('.prev-step');
  const contactForm = document.getElementById('lead-form');
  const successMessage = document.getElementById('form-success');
  const serviceOptions = document.querySelectorAll('.option-btn');
  let currentStep = 0;
  
  // Service Options multi-selection logic
  let selectedServices = [];
  
  // Phone Formatting, Input Constraints & Custom Dropdown Logic
  const phoneInput = document.getElementById('client-phone');
  const countryCodeSelect = document.getElementById('country-code');
  const dropdownWrapper = document.getElementById('country-code-dropdown');

  if (phoneInput && countryCodeSelect) {
    phoneInput.addEventListener('input', (e) => {
      // Remove non-digit characters
      let value = e.target.value.replace(/\D/g, '');
      const selectedCode = countryCodeSelect.value.replace(/\D/g, ''); // e.g. "56"
      
      // If they pasted the country code at the beginning, strip it
      if (value.startsWith(selectedCode) && value.length > 9) {
        value = value.substring(selectedCode.length);
      }
      
      // Also strip leading '0' if they accidentally type it
      if (value.startsWith('0') && value.length > 9) {
        value = value.substring(1);
      }

      // Limit to 9 digits
      if (value.length > 9) {
        value = value.substring(0, 9);
      }
      e.target.value = value;
    });
  }

  // Company Size Custom Dropdown Elements
  const companySizeDropdown = document.getElementById('company-size-dropdown');
  const companySizeHiddenInput = document.getElementById('company-size');

  if (dropdownWrapper && countryCodeSelect) {
    const trigger = dropdownWrapper.querySelector('.custom-select-trigger');
    const options = dropdownWrapper.querySelectorAll('.custom-option');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other custom dropdowns
      if (companySizeDropdown) companySizeDropdown.classList.remove('open');
      dropdownWrapper.classList.toggle('open');
    });

    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remove selected class from others and add to clicked
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        // Update trigger UI
        const val = option.getAttribute('data-value');
        const flag = option.getAttribute('data-flag');
        dropdownWrapper.querySelector('.selected-flag').textContent = flag;
        dropdownWrapper.querySelector('.selected-code').textContent = val;
        
        // Update hidden input
        countryCodeSelect.value = val;
        
        // Close dropdown
        dropdownWrapper.classList.remove('open');
        
        // Trigger input event on phone number to re-run format constraints
        if (phoneInput) {
          phoneInput.dispatchEvent(new Event('input'));
        }
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdownWrapper.contains(e.target)) {
        dropdownWrapper.classList.remove('open');
      }
    });
  }

  if (companySizeDropdown && companySizeHiddenInput) {
    const trigger = companySizeDropdown.querySelector('.custom-select-trigger');
    const options = companySizeDropdown.querySelectorAll('.custom-option');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other custom dropdowns
      if (dropdownWrapper) dropdownWrapper.classList.remove('open');
      companySizeDropdown.classList.toggle('open');
    });

    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();

        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        const val = option.getAttribute('data-value');
        const title = option.querySelector('.option-title').textContent;

        companySizeDropdown.querySelector('.selected-text').textContent = title;
        companySizeHiddenInput.value = val;

        companySizeDropdown.classList.remove('open');

        // Clear error styling on select
        companySizeDropdown.classList.remove('input-error');
        const errorText = companySizeDropdown.parentNode.querySelector('.error-text');
        if (errorText) errorText.remove();
      });
    });

    document.addEventListener('click', (e) => {
      if (!companySizeDropdown.contains(e.target)) {
        companySizeDropdown.classList.remove('open');
      }
    });
  }
  
  // Form Logic Helper Functions (global to this block)
  function updateFormStep() {
    if (!formSteps.length) return;
    formSteps.forEach((step, index) => {
      step.classList.toggle('active', index === currentStep);
    });
    
    // Update progress steps
    progressSteps.forEach((step, index) => {
      if (index <= currentStep) {
        step.classList.add('active');
        if (index < currentStep) step.classList.add('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
    
    // Update progress bar width
    if (progressBar && progressSteps.length > 1) {
      const percentage = (currentStep / (progressSteps.length - 1)) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  }

  // Custom Toast Notification System
  function showToast(message, type = 'error') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '⚠️';
    if (type === 'success') icon = '✓';
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Trigger slide-in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Remove after 3.5s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3500);
  }

  // Inline validation error helpers
  function markFieldError(inputElement, wrapperElement, message) {
    const target = wrapperElement || inputElement;
    target.classList.add('input-error');
    
    let errorSpan = target.parentNode.querySelector('.error-text');
    if (!errorSpan) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'error-text';
      target.parentNode.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
  }

  function clearErrors() {
    document.querySelectorAll('.form-control, .custom-select-wrapper, .select-wrapper').forEach(el => {
      el.classList.remove('input-error');
    });
    document.querySelectorAll('.error-text').forEach(el => {
      el.remove();
    });
  }

  function validateStep(stepIndex) {
    clearErrors();
    const formCard = document.querySelector('.form-card');

    const triggerShake = () => {
      if (formCard) {
        formCard.classList.remove('shake-error');
        formCard.offsetHeight; // trigger reflow
        formCard.classList.add('shake-error');
        setTimeout(() => {
          formCard.classList.remove('shake-error');
        }, 500);
      }
    };

    if (stepIndex === 0) {
      // Step 1: Services Selection
      if (selectedServices.length === 0) {
        showToast('Por favor, selecciona al menos un servicio para continuar.');
        triggerShake();
        return false;
      }
      return true;
    } else if (stepIndex === 1) {
      // Step 2: Client Info
      const nameInput = document.getElementById('client-name');
      const emailInput = document.getElementById('client-email');
      const phoneInput = document.getElementById('client-phone');
      
      const nombre = nameInput.value.trim();
      const email = emailInput.value.trim();
      const cel = phoneInput.value.trim();
      let hasError = false;

      if (!nombre) {
        markFieldError(nameInput, null, 'Por favor, ingresa tu nombre completo.');
        hasError = true;
      }
      
      if (!email) {
        markFieldError(emailInput, null, 'Por favor, ingresa tu correo electrónico.');
        hasError = true;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          markFieldError(emailInput, null, 'Por favor, ingresa un correo electrónico válido.');
          hasError = true;
        }
      }

      if (!cel) {
        markFieldError(phoneInput, phoneInput.parentNode, 'Por favor, ingresa tu número de teléfono.');
        hasError = true;
      } else if (cel.length !== 9) {
        markFieldError(phoneInput, phoneInput.parentNode, 'Por favor, ingresa un número de teléfono de 9 dígitos.');
        hasError = true;
      }

      if (hasError) {
        showToast('Por favor, completa correctamente los campos obligatorios.');
        triggerShake();
        return false;
      }
      return true;
    } else if (stepIndex === 2) {
      // Step 3: Project Details (Business Info)
      const companyNameInput = document.getElementById('company-name');
      const companyIndustryInput = document.getElementById('company-industry');
      const companySizeSelect = document.getElementById('company-size');

      let hasError = false;

      if (!companyNameInput.value.trim()) {
        markFieldError(companyNameInput, null, 'El nombre de la empresa es obligatorio.');
        hasError = true;
      }

      if (!companyIndustryInput.value.trim()) {
        markFieldError(companyIndustryInput, null, 'El rubro de la empresa es obligatorio.');
        hasError = true;
      }

      if (!companySizeSelect.value) {
        markFieldError(companySizeSelect, companySizeSelect.parentNode, 'Debes seleccionar el tamaño de la empresa.');
        hasError = true;
      }

      if (hasError) {
        showToast('Por favor, completa los campos del negocio obligatorios.');
        triggerShake();
        return false;
      }
      return true;
    } else if (stepIndex === 3) {
      // Step 4: Project Details
      return true;
    }
    return true;
  }

  function fillContactForm(service, brand = '') {
    if (!formSteps.length) return;
    
    // Reset form to Step 1
    currentStep = 0;
    updateFormStep();
    if (successMessage) successMessage.style.display = 'none';
    if (contactForm) contactForm.style.display = 'block';

    // Pre-select service in form
    let targetOption = null;
    serviceOptions.forEach(opt => {
      const serviceName = opt.getAttribute('data-service');
      if (serviceName && serviceName.toLowerCase().includes(service.toLowerCase())) {
        targetOption = opt;
      }
    });

    if (targetOption) {
      serviceOptions.forEach(opt => opt.classList.remove('selected'));
      selectedServices = [];
      targetOption.classList.add('selected');
      selectedServices.push(targetOption.getAttribute('data-service'));
    }

    // Step 3: Populate textarea
    const clientMsg = document.getElementById('client-msg');
    if (clientMsg) {
      if (brand && brand !== 'servicio') {
        clientMsg.value = `¡Hola! Me interesó mucho el caso de éxito de ${brand} y me gustaría cotizar una solución similar para mi negocio.`;
      } else {
        clientMsg.value = `¡Hola! Me gustaría cotizar el servicio de ${service} para mi negocio y recibir más información.`;
      }
    }
  }

  function highlightFormCard() {
    const formCard = document.querySelector('.form-card');
    if (formCard) {
      formCard.style.outline = '3px solid var(--secondary)';
      formCard.style.boxShadow = '0 0 30px rgba(0, 201, 167, 0.4)';
      formCard.style.transition = 'all 0.5s ease';
      
      setTimeout(() => {
        formCard.style.outline = 'none';
        formCard.style.boxShadow = '';
      }, 2000);
    }
  }

  // Helper for Cross-Page or Local CTA Click Routing
  window.handleCtaClick = function(service, brand = '') {
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      fillContactForm(service, brand);
      contactSection.scrollIntoView({ behavior: 'smooth' });
      highlightFormCard();
    } else {
      let url = 'contacto.html';
      const params = [];
      if (service) params.push(`service=${encodeURIComponent(service)}`);
      if (brand) params.push(`brand=${encodeURIComponent(brand)}`);
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      window.location.href = url;
    }
  };

  if (formSteps.length > 0) {
    serviceOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Deselect other options to allow single selection behavior when auto-advancing
        serviceOptions.forEach(opt => {
          if (opt !== option) {
            opt.classList.remove('selected');
          }
        });

        option.classList.toggle('selected');
        const serviceName = option.getAttribute('data-service');
        
        if (option.classList.contains('selected')) {
          selectedServices = [serviceName];
          // Auto-advance to the next step after a short delay for visual feedback
          setTimeout(() => {
            if (validateStep(currentStep)) {
              currentStep++;
              updateFormStep();
            }
          }, 350);
        } else {
          selectedServices = [];
        }
      });
    });

    // Next step click
    nextStepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
          currentStep++;
          updateFormStep();
        }
      });
    });

    // Previous step click
    prevStepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentStep--;
        updateFormStep();
      });
    });

    // Handle Form Submit
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate Step 3 (Business Info) and Step 4 (Project Details) before submitting
        if (!validateStep(2) || !validateStep(3)) {
          return;
        }
        
        // Get all final data values
        const name = document.getElementById('client-name').value.trim();
        
        // Simulate API submit animation
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
          contactForm.style.display = 'none';
          
          const successTitle = successMessage.querySelector('h3');
          if (successTitle) {
            successTitle.innerHTML = `¡Gracias, ${name}!`;
          }
          
          if (successMessage) successMessage.style.display = 'flex';
          const stepProgress = document.querySelector('.step-progress');
          if (stepProgress) stepProgress.style.display = 'none';
          
          // Show custom success toast
          showToast('¡Solicitud enviada con éxito!', 'success');
        }, 1500);
      });
    }

    // Check URL parameters on load for pre-filling
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const brandParam = urlParams.get('brand');
    if (serviceParam) {
      fillContactForm(serviceParam, brandParam || '');
    }
  }

  // ==========================================
  // 7. Bento Grid Interactive Motion Effects
  // ==========================================
  
  // 7.1. Cursor Spotlight Glare (Shine Effect)
  const tiltCards = document.querySelectorAll('.tilt-card');
  
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update spotlight position variables
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 7.2. Social Card Live-Likes Counter Animation
  const socialCard = document.querySelector('.sb-social');
  const likesSpan = document.querySelector('.likes-number');
  
  if (socialCard && likesSpan) {
    let counterInterval;
    const initialLikes = 150;
    const targetLikes = 1582;
    
    socialCard.addEventListener('mouseenter', () => {
      clearInterval(counterInterval);
      let current = initialLikes;
      const duration = 1000; // 1 second animation
      const stepTime = 15; // ms between updates
      const totalSteps = duration / stepTime;
      const increment = (targetLikes - initialLikes) / totalSteps;
      
      counterInterval = setInterval(() => {
        current += increment;
        if (current >= targetLikes) {
          current = targetLikes;
          clearInterval(counterInterval);
          const heartSvg = socialCard.querySelector('.radar-core svg');
          if (heartSvg) {
            heartSvg.classList.add('heart-pop');
          }
        }
        likesSpan.textContent = Math.floor(current).toLocaleString();
      }, stepTime);
    });
    
    socialCard.addEventListener('mouseleave', () => {
      clearInterval(counterInterval);
      // Reset back to initial likes with a slight delay for smooth visual transition
      setTimeout(() => {
        likesSpan.textContent = initialLikes.toString();
        const heartSvg = socialCard.querySelector('.radar-core svg');
        if (heartSvg) {
          heartSvg.classList.remove('heart-pop');
        }
      }, 300);
    });
  }

  // 7.3. Branding Card Palette Switcher (with Auto-rotation and Interactive Pause)
  const swatches = document.querySelectorAll('.palette-swatches .swatch');
  const brandingLetter = document.querySelector('.branding-letter');
  const brandingCard = document.querySelector('.sb-branding');
  
  if (swatches.length && brandingLetter && brandingCard) {
    const brandingThemes = [
      {
        font: "'Outfit', sans-serif",
        gradient: "linear-gradient(135deg, #00f0ff 0%, #0072ff 100%)",
        color: "#00f0ff",
        themeClass: "theme-cyber"
      },
      {
        font: "'Playfair Display', 'Georgia', serif",
        gradient: "linear-gradient(135deg, #f39c12 0%, #d4af37 100%)",
        color: "#d4af37",
        themeClass: "theme-lux"
      },
      {
        font: "'Fira Code', 'Courier New', monospace",
        gradient: "linear-gradient(135deg, #ff007f 0%, #7b2ff7 100%)",
        color: "#ff007f",
        themeClass: "theme-retro"
      }
    ];

    let currentThemeIdx = 0;
    let autoThemeInterval = null;
    let userInteracted = false;

    function applyTheme(idx) {
      currentThemeIdx = idx;
      
      // Reset swatch styles and highlight active
      swatches.forEach((s, sIdx) => {
        if (sIdx === idx) {
          s.style.transform = 'scaleX(1.15) translateX(4px)';
          s.style.borderColor = brandingThemes[idx].color;
          s.classList.add('active');
        } else {
          s.style.transform = 'none';
          s.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          s.classList.remove('active');
        }
      });
      
      // Remove other branding themes and add the new one
      brandingThemes.forEach(t => brandingCard.classList.remove(t.themeClass));
      brandingCard.classList.add(brandingThemes[idx].themeClass);
      
      // Apply theme to branding display letter
      brandingLetter.style.fontFamily = brandingThemes[idx].font;
      brandingLetter.style.backgroundImage = brandingThemes[idx].gradient;
      
      // Trigger a cool pulse keyframe animation on the card itself
      brandingCard.style.animation = 'none';
      brandingCard.offsetHeight; // trigger reflow
      brandingCard.style.animation = 'themePulse 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    function startAutoRotation() {
      if (userInteracted) return;
      stopAutoRotation();
      autoThemeInterval = setInterval(() => {
        const nextIdx = (currentThemeIdx + 1) % brandingThemes.length;
        applyTheme(nextIdx);
      }, 4000); // Cycle every 4 seconds
    }

    function stopAutoRotation() {
      if (autoThemeInterval) {
        clearInterval(autoThemeInterval);
        autoThemeInterval = null;
      }
    }

    // Initialize auto rotation
    startAutoRotation();

    // Event listeners for manual selection
    swatches.forEach((swatch, idx) => {
      swatch.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click event
        userInteracted = true;
        stopAutoRotation();
        applyTheme(idx);
      });
    });

    // Pause on hover, resume on leave
    brandingCard.addEventListener('mouseenter', () => {
      stopAutoRotation();
    });

    brandingCard.addEventListener('mouseleave', () => {
      startAutoRotation();
    });
  }

  // 7.4. Web Card Interactive Mock Browser Scroll & Loading Preview
  const webCard = document.querySelector('.sb-web');
  const codeView = document.querySelector('.mock-code-view');
  const webPreview = document.querySelector('.mock-web-preview');
  const progressLine = document.querySelector('.mock-url-progress');
  
  if (webCard && codeView && webPreview && progressLine) {
    let loadingTimeout;
    let progressInterval;
    
    webCard.addEventListener('mousemove', (e) => {
      if (webPreview.classList.contains('show')) return;
      
      const rect = webCard.getBoundingClientRect();
      // Normalize Y position from 0 to 1
      const relativeY = (e.clientY - rect.top) / rect.height;
      // Scroll the container slightly based on mouse position
      const translateY = (relativeY * -30) + 5; // Translate range: +5px to -25px
      
      codeView.style.transform = `translateY(${translateY}px)`;
      codeView.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    
    webCard.addEventListener('mouseenter', () => {
      clearInterval(progressInterval);
      clearTimeout(loadingTimeout);
      
      let width = 0;
      progressLine.style.width = '0%';
      
      progressInterval = setInterval(() => {
        width += 2.5; // 40 steps total
        progressLine.style.width = `${width}%`;
        if (width >= 100) {
          clearInterval(progressInterval);
          codeView.classList.add('hide');
          webPreview.classList.add('show');
        }
      }, 20); // 20ms * 40 steps = 800ms total loading time
    });
    
    webCard.addEventListener('mouseleave', () => {
      clearInterval(progressInterval);
      clearTimeout(loadingTimeout);
      
      progressLine.style.width = '0%';
      codeView.classList.remove('hide');
      webPreview.classList.remove('show');
      
      codeView.style.transform = 'translateY(0)';
      codeView.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  }

  // 8. Interactive Case Study Terminal Logic
  const caseSelectors = document.querySelectorAll('.case-selector');
  const simScreens = document.querySelectorAll('.sim-screen');
  const detailsPanels = document.querySelectorAll('.details-panel');
  const simUrlText = document.getElementById('sim-url-text');
  const projectGlow = document.getElementById('project-glow');
  const simulatorFrame = document.querySelector('.simulator-frame');

  if (caseSelectors.length > 0) {
    const projectUrls = {
      blu: 'mavixchile.com/blu',
      vintage: 'vintagesalon.cl',
      colonos: 'colonos.cl',
      burger: 'blackburger.cl',
      parma: 'diparma.cl',
      rafting: 'happyrafting.cl'
    };

    caseSelectors.forEach(selector => {
      selector.addEventListener('click', () => {
        // 1. Remove active state from other selectors
        caseSelectors.forEach(sel => sel.classList.remove('active'));
        selector.classList.add('active');

        const project = selector.getAttribute('data-project');
        const glowColor = selector.getAttribute('data-color');

        // 2. Switch simulator screen
        simScreens.forEach(screen => {
          screen.classList.remove('active');
          if (screen.getAttribute('data-project') === project) {
            screen.classList.add('active');
          }
        });

        // 3. Switch details panel
        detailsPanels.forEach(panel => {
          panel.classList.remove('active');
          if (panel.getAttribute('data-project') === project) {
            panel.classList.add('active');
          }
        });

        // 4. Update simulator URL
        if (simUrlText && projectUrls[project]) {
          simUrlText.textContent = projectUrls[project];
        }

        // 5. Update ambient glow color dynamically
        if (projectGlow && glowColor) {
          projectGlow.style.background = `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`;
        }

        // 6. Switch simulator device wrapper class
        if (simulatorFrame) {
          simulatorFrame.classList.remove('device-desktop', 'device-mobile', 'device-branding');
          if (project === 'blu' || project === 'colonos') {
            simulatorFrame.classList.add('device-desktop');
          } else if (project === 'parma') {
            simulatorFrame.classList.add('device-branding');
          } else {
            simulatorFrame.classList.add('device-mobile');
          }
        }
      });
    });
  }

  // 9. Portfolio CRO Conversion flow (Success Terminal CTA & Services CTA)
  const terminalCtaBtns = document.querySelectorAll('.btn-terminal-cta');
  if (terminalCtaBtns.length > 0) {
    terminalCtaBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const brand = btn.getAttribute('data-brand');
        const service = btn.getAttribute('data-service'); // Web, Redes Sociales, Branding

        if (window.handleCtaClick) {
          window.handleCtaClick(service, brand);
        }
      });
    });
  }

  // 10. Team Member Contact Flow
  const memberCtaBtns = document.querySelectorAll('[data-member-contact]');
  if (memberCtaBtns.length > 0) {
    memberCtaBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const name = btn.getAttribute('data-member-contact');

        if (window.handleCtaClick) {
          window.handleCtaClick('servicio', name);
        }
      });
    });
  }

  // 11. Scroll Spy for Home Page Navigation Links
  const spySections = document.querySelectorAll('section[id]');
  const navAnchorLinks = document.querySelectorAll('.nav-links a');
  
  if (spySections.length > 0 && navAnchorLinks.length > 0) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchorLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Match local anchor, full page with anchor, or home path
            if (href === `#${id}` || href === `index.html#${id}` || (id === 'inicio' && href === 'index.html')) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      root: null,
      threshold: 0.2, // Trigger when 20% of the section is visible
      rootMargin: '-80px 0px -30% 0px' // Offset header height and focus on middle-top of screen
    });

    spySections.forEach(section => {
      spyObserver.observe(section);
    });
  }

});

