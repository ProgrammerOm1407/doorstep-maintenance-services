/* ==========================================================================
   Premium Appliance Repair & Maintenance: Interactive Frontend Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const isTestMode = new URLSearchParams(window.location.search).has('test');

  // ==========================================
  // 1. Data Config Database (Funnel Steps)
  // ==========================================
  const dbApplianceConfig = {
    "Washing Machine": {
      types: ["Front Load", "Top Load", "Semi-Automatic", "Washer-Dryer Combo"],
      issues: ["Drum not spinning / stuck", "Water leaking on floor", "Loud vibration noise", "Error code displayed", "Won't turn on / no power"]
    },
    "Refrigerator": {
      types: ["Single Door", "Double Door", "Triple Door", "Side-by-Side", "French Door"],
      issues: ["Not cooling / warm fridge", "Excessive ice forming", "Water dripping inside/out", "Compressor making noise", "Faulty digital display"]
    },
    "Water Purifier": {
      types: ["RO (Reverse Osmosis)", "UV + UF Purifier", "RO + UV + TDS Controller"],
      issues: ["Low water flow rate", "Bad water taste / odor", "Continuous reject water leak", "Filter replacement alert", "Won't turn on"]
    },
    "Air Conditioner": {
      types: ["Split AC", "Window AC", "Inverter AC", "Cassette AC"],
      issues: ["Blowing warm air", "Water leaking from indoor unit", "Extremely loud compressor", "Remote sensor not working", "Ice forming on coils"]
    },
    "Microwave Oven": {
      types: ["Solo Microwave", "Grill Microwave", "Convection Oven"],
      issues: ["Food not heating", "Glass tray won't rotate", "Sparks inside cabin", "Display / Touchpad unresponsive", "No power / dead display"]
    }
  };

  // ==========================================
  // 2. State Management Object
  // ==========================================
  const funnelState = {
    currentStep: 1,
    category: "",
    subType: "",
    brand: "",
    issues: [],
    name: "",
    phone: "",
    timeSlot: "Morning (9 AM - 12 PM)"
  };

  // ==========================================
  // 3. Navigation Header Scroll Effect
  // ==========================================
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ==========================================
  // 4. Mobile Navigation Toggle
  // ==========================================
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav');
  
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    // Simple toggle icon swap between Hamburger and Close X
    if (mainNav.classList.contains('active')) {
      menuToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    } else {
      menuToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    }
  });

  // Close mobile nav when link is clicked
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('active');
      menuToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    });
  });

  // ==========================================
  // 4b. Scroll Spy (Active Navigation Links)
  // ==========================================
  const spySections = document.querySelectorAll('section');
  window.addEventListener('scroll', () => {
    let currentSection = "home";
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    spySections.forEach(section => {
      const sectionTop = section.offsetTop - 150; // Offset for header height
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentSection}` || (currentSection === 'home' && href === '#')) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================
  // 5. Floating Bottom Pill CTA Visibility
  // ==========================================
  const bottomBar = document.getElementById('mobile-bottom-bar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      bottomBar.classList.add('show');
    } else {
      bottomBar.classList.remove('show');
    }
  });

  // ==========================================
  // 6. Intersection Observer Scroll-reveal
  // ==========================================
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Stop observing once animated in
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });

  // ==========================================
  // 7. Booking Funnel Logic Controller
  // ==========================================
  const stepElements = {
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    step4: document.getElementById('step4')
  };

  const stepBadge = document.getElementById('step-badge');
  const progressFill = document.getElementById('funnel-progress-fill');
  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');
  const progressText = document.getElementById('funnel-progress-text');

  // Input elements
  const inputName = document.getElementById('cust-name');
  const inputPhone = document.getElementById('cust-phone');
  const slotPills = document.querySelectorAll('.slot-pill');

  // Real-time Inline Validation listeners
  inputName.addEventListener('input', () => {
    const val = inputName.value.trim();
    const errorSpan = document.getElementById('name-error');
    const isValid = /^[a-zA-Z\s\'\-]{2,50}$/.test(val);
    
    if (isValid || val === "") {
      inputName.classList.remove('invalid');
      errorSpan.style.display = 'none';
    } else {
      inputName.classList.add('invalid');
      errorSpan.style.display = 'block';
    }
  });

  inputPhone.addEventListener('input', () => {
    const val = inputPhone.value.trim();
    const errorSpan = document.getElementById('phone-error');
    const clean = val.replace(/\D/g, "");
    const hasOnlyPhoneChars = /^[\d\s\-\+\(\)]*$/.test(val);
    let local = clean;
    
    if (clean.startsWith("91") && clean.length === 12) local = clean.substring(2);
    if (clean.startsWith("0") && clean.length === 11) local = clean.substring(1);
    
    const isValid = hasOnlyPhoneChars && /^[6-9]\d{9}$/.test(local);
    if (isValid || val === "") {
      inputPhone.classList.remove('invalid');
      errorSpan.style.display = 'none';
    } else {
      inputPhone.classList.add('invalid');
      errorSpan.style.display = 'block';
    }
  });

  // Deep Link Selection Handler (from services grids)
  document.querySelectorAll('[data-category]').forEach(link => {
    link.addEventListener('click', (e) => {
      const category = link.getAttribute('data-category');
      const card = document.querySelector(`.device-select-card[data-device="${category}"]`);
      if (card) {
        // Reset steps to 1 first and trigger selection
        goToStep(1);
        card.click();
      }
    });
  });

  // Step 1 Device Card Selections
  const deviceCards = document.querySelectorAll('.device-select-card');
  deviceCards.forEach(card => {
    card.addEventListener('click', () => {
      deviceCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      funnelState.category = card.getAttribute('data-device');
      
      // State Consistency Fix: Reset brand card highlights and state when category changes
      funnelState.brand = "";
      brandCards.forEach(c => c.classList.remove('selected'));
      
      // Auto build dynamic contents for Step 2 and Step 4
      buildSubtypes(funnelState.category);
      buildIssues(funnelState.category);
      
      // Smooth visual progression feel
      setTimeout(() => {
        navigateFunnel(1);
      }, 250);
    });
  });

  // Dynamic Subtypes Generator (Step 2)
  function buildSubtypes(category) {
    const subtypesContainer = document.getElementById('subtypes-container');
    const subtypeQuestion = document.getElementById('step2-question');
    
    // Clear out past cards
    subtypesContainer.innerHTML = "";
    subtypeQuestion.textContent = `Select your ${category} type`;
    
    const config = dbApplianceConfig[category];
    if (!config) return;
    
    config.types.forEach((type, index) => {
      const card = document.createElement('div');
      card.className = "subtype-card";
      card.setAttribute('data-subtype', type);
      
      card.innerHTML = `
        <span>${type}</span>
        <div class="radio-circle"></div>
      `;
      
      // Automatically select the first one to make UX easy
      if (index === 0) {
        card.classList.add('selected');
        funnelState.subType = type;
      }
      
      card.addEventListener('click', () => {
        document.querySelectorAll('.subtype-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        funnelState.subType = type;
        
        // Minor delay for selection feedback before continuing
        setTimeout(() => {
          navigateFunnel(1);
        }, 200);
      });
      
      subtypesContainer.appendChild(card);
    });
  }

  // Brand Selector cards (Step 3)
  const brandCards = document.querySelectorAll('.brand-select-card');
  brandCards.forEach(card => {
    card.addEventListener('click', () => {
      brandCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      funnelState.brand = card.getAttribute('data-brand');
      
      setTimeout(() => {
        navigateFunnel(1);
      }, 200);
    });
  });

  // Dynamic Issues Checklist (Step 4)
  function buildIssues(category) {
    const issuesContainer = document.getElementById('issues-container');
    issuesContainer.innerHTML = "";
    
    const config = dbApplianceConfig[category];
    if (!config) return;
    
    // Clean past array
    funnelState.issues = [];
    
    config.issues.forEach(issue => {
      const label = document.createElement('label');
      label.className = "issue-checkbox-label";
      
      label.innerHTML = `
        <input type="checkbox" value="${issue}">
        <div class="checkbox-square"></div>
        <span>${issue}</span>
      `;
      
      const input = label.querySelector('input');
      input.addEventListener('change', () => {
        if (input.checked) {
          label.classList.add('checked');
          funnelState.issues.push(issue);
        } else {
          label.classList.remove('checked');
          funnelState.issues = funnelState.issues.filter(i => i !== issue);
        }
      });
      
      issuesContainer.appendChild(label);
    });
  }

  // Appointment Slots Pills Selection
  slotPills.forEach(pill => {
    pill.addEventListener('click', () => {
      slotPills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      funnelState.timeSlot = pill.getAttribute('data-slot');
    });
  });

  // Navigation Logic Forward/Backward
  btnBack.addEventListener('click', () => navigateFunnel(-1));
  btnNext.addEventListener('click', () => navigateFunnel(1));

  function navigateFunnel(direction) {
    const nextStep = funnelState.currentStep + direction;
    
    // Validation before moving ahead
    if (direction === 1) {
      if (funnelState.currentStep === 1 && !funnelState.category) {
        shakeForm();
        return;
      }
      if (funnelState.currentStep === 2 && !funnelState.subType) {
        shakeForm();
        return;
      }
      if (funnelState.currentStep === 3 && !funnelState.brand) {
        shakeForm();
        return;
      }
      if (funnelState.currentStep === 4) {
        if (!validateStep4()) {
          shakeForm();
          return;
        }
        submitBookingForm();
        return;
      }
    }
    
    goToStep(nextStep);
  }

  function goToStep(step) {
    if (step < 1 || step > 4) return;
    
    const previousStep = funnelState.currentStep;
    const currentActive = document.querySelector('.funnel-step.active');
    const targetElement = document.getElementById(`step${step}`);
    
    if (previousStep === step) return;
    
    // Determine transition direction animation classes
    let exitClass = "";
    let enterClass = "";
    
    if (step > previousStep) {
      exitClass = "slide-next-exit";
      enterClass = "slide-next-enter";
    } else {
      exitClass = "slide-back-exit";
      enterClass = "slide-back-enter";
    }
    
    // Apply slide-exit transition to old active step
    if (currentActive) {
      currentActive.classList.add(exitClass);
      
      const oldStep = currentActive;
      setTimeout(() => {
        oldStep.classList.remove('active', exitClass);
      }, 480);
    }
    
    // Apply slide-enter transition to new target step
    targetElement.className = `funnel-step active ${enterClass}`;
    setTimeout(() => {
      targetElement.classList.remove(enterClass);
    }, 480);
    
    funnelState.currentStep = step;
    
    // Update Indicators
    stepBadge.textContent = `Step ${step} of 4`;
    progressFill.style.width = `${step * 25}%`;
    progressText.textContent = targetElement.getAttribute('data-title');
    
    // Back button state
    btnBack.disabled = (step === 1);
    
    // Next Button visual transformations
    if (step === 4) {
      btnNext.className = "btn-submit";
      btnNext.innerHTML = `
        <span>Submit Booking</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      `;
    } else {
      btnNext.className = "btn-next";
      btnNext.innerHTML = `
        <span>Continue</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      `;
    }
    
    // Auto scroll slightly to widget top to focus for mobile users
    const widget = document.getElementById('booking-widget');
    widget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function validateStep4() {
    funnelState.name = inputName.value.trim();
    funnelState.phone = inputPhone.value.trim();
    
    console.log("Validating step 4 data...");
    
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    
    // 1. Validate Name (only letters, spaces, apostrophes, and dashes, minimum 2 characters)
    const isNameValid = /^[a-zA-Z\s\'\-]{2,50}$/.test(funnelState.name);
    if (!isNameValid) {
      console.warn("Validation failed: Name is invalid.");
      inputName.classList.add('invalid');
      nameError.style.display = 'block';
      inputName.focus();
      return false;
    } else {
      inputName.classList.remove('invalid');
      nameError.style.display = 'none';
    }
    
    // 2. Validate Phone (checks for a 10-digit Indian Mobile format with optional prefix & allowed characters)
    const cleanPhone = funnelState.phone.replace(/\D/g, "");
    const hasOnlyPhoneChars = /^[\d\s\-\+\(\)]*$/.test(funnelState.phone);
    let localPhone = cleanPhone;
    
    if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
      localPhone = cleanPhone.substring(2);
    }
    if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      localPhone = cleanPhone.substring(1);
    }
    
    const isPhoneValid = hasOnlyPhoneChars && /^[6-9]\d{9}$/.test(localPhone);
    if (!isPhoneValid) {
      console.warn("Validation failed: Phone is invalid.");
      inputPhone.classList.add('invalid');
      phoneError.style.display = 'block';
      inputPhone.focus();
      return false;
    } else {
      inputPhone.classList.remove('invalid');
      phoneError.style.display = 'none';
    }
    
    console.log("Validation passed successfully.");
    return true;
  }

  function shakeForm() {
    const body = document.querySelector('.booking-body');
    body.style.animation = "shake 0.4s ease-in-out";
    setTimeout(() => {
      body.style.animation = "";
    }, 450);
  }

  // Adding dynamic shake CSS rule
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
  `;
  document.head.appendChild(styleSheet);

  // ==========================================
  // 8. Lead Data packaging & WhatsApp Direct Redirect
  // ==========================================
  function submitBookingForm() {
    console.log("Creating booking lead package...");
    // Generate clean JSON payload
    const payload = {
      leadId: `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      appliance: funnelState.category,
      deviceType: funnelState.subType,
      brand: funnelState.brand,
      reportedIssues: funnelState.issues.length > 0 ? funnelState.issues : ["General Inspection & Tune-up"],
      customer: {
        name: funnelState.name,
        phone: funnelState.phone,
        preferredSlot: funnelState.timeSlot
      }
    };
    
    console.log("Lead Package Compiled:", payload);
    
    // Dynamic WhatsApp url generator
    const messageTemplate = `*New Lead Request ${payload.leadId}*
- Appliance: ${payload.appliance} (${payload.deviceType})
- Brand: ${payload.brand}
- Issues: ${payload.reportedIssues.join(', ')}
- Customer: ${payload.customer.name}
- Phone: ${payload.customer.phone}
- Preferred Slot: ${payload.customer.preferredSlot}`;
    
    const waUrl = `https://api.whatsapp.com/send?phone=917507632232&text=${encodeURIComponent(messageTemplate)}`;
    console.log("Forming redirection URL: ", waUrl);
    
    if (isTestMode) {
      console.log("[QA Test] Submission successful. Redirect bypassed in test mode.");
      if (window.qaTestLogger) {
        window.qaTestLogger("PASS: Form submitted successfully. Lead compiled: " + JSON.stringify(payload), "pass");
        if (typeof window.onQaSubmitSuccess === 'function') {
          window.onQaSubmitSuccess();
        }
      }
    } else {
      // Safety check to bypass strict browser pop-up blockers:
      // If window.open is blocked, fallback immediately to direct location redirect
      try {
        console.log("Attempting window.open redirection in a new tab...");
        const newTab = window.open(waUrl, '_blank');
        if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
          console.warn("New tab blocked by pop-up blocker. Redirecting current tab instead...");
          window.location.href = waUrl;
        }
      } catch (err) {
        console.error("Window open error, redirecting current tab:", err);
        window.location.href = waUrl;
      }
    }
    
    // Auto reset funnel states back to step 1 immediately
    inputName.value = "";
    inputPhone.value = "";
    deviceCards.forEach(c => c.classList.remove('selected'));
    brandCards.forEach(c => c.classList.remove('selected'));
    funnelState.category = "";
    funnelState.subType = "";
    funnelState.brand = "";
    funnelState.issues = [];
    goToStep(1);
  }

  // ==========================================
  // 9. Testimonials Carousel logic
  // ==========================================
  const track = document.getElementById('testimonial-track');
  const dots = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;
  let slideInterval;

  function updateSlider(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function startSlideShow() {
    slideInterval = setInterval(() => {
      let nextSlide = (currentSlide + 1) % dots.length;
      updateSlider(nextSlide);
    }, 6000);
  }

  function resetSlideShow() {
    clearInterval(slideInterval);
    startSlideShow();
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'));
      updateSlider(idx);
      resetSlideShow();
    });
  });

  // Initialize carousel
  startSlideShow();

  // ==========================================
  // 10. FAQ Accordion handler
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close other open questions
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      if (!isActive) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        // Smoothly adjust maxHeight to children height
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // ==========================================
  // 11. 3D Mouse Card Hover Tilt Effect
  // ==========================================
  deviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within element
      const y = e.clientY - rect.top;  // y position within element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation degree (max 8 degrees tilt)
      const rotateX = ((centerY - y) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * -8; // Reverse to match natural tilt direction
      
      card.style.setProperty('--tilt-x', `${rotateX}deg`);
      card.style.setProperty('--tilt-y', `${rotateY}deg`);
    });
    
    card.addEventListener('mouseleave', () => {
      // Smoothly return card back to flat state
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });

  // ==========================================
  // 12. Trust Metric Numeric Count-up Animation
  // ==========================================
  function startCounterAnimation() {
    const counterElement = document.getElementById('count-homes');
    if (!counterElement) return;
    
    const targetVal = parseInt(counterElement.getAttribute('data-target'));
    const animateDuration = 1800; // 1.8 seconds duration
    const frameRateMs = 20;
    const totalFrames = animateDuration / frameRateMs;
    const incrementStep = targetVal / totalFrames;
    
    let currentVal = 0;
    let frame = 0;
    
    const timerInterval = setInterval(() => {
      frame++;
      currentVal += incrementStep;
      
      if (frame >= totalFrames) {
        counterElement.textContent = targetVal.toLocaleString();
        clearInterval(timerInterval);
      } else {
        counterElement.textContent = Math.floor(currentVal).toLocaleString();
      }
    }, frameRateMs);
  }

  // Trigger counter count-up 300ms after load finishes
  setTimeout(startCounterAnimation, 300);

  // ==========================================
  // 13. Automated QA Test Suite Injector & Runner
  // ==========================================
  if (isTestMode) {
    // 1. Create and inject the QA Panel element
    const qaPanel = document.createElement('div');
    qaPanel.id = 'qa-test-panel';
    qaPanel.innerHTML = `
      <div class="qa-header">
        <span class="qa-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Automated QA Test Runner
        </span>
        <div class="qa-controls">
          <button class="qa-btn" id="qa-run-btn">Run Suite</button>
          <button class="qa-btn qa-btn-toggle" id="qa-toggle-btn">Minimize</button>
        </div>
      </div>
      <div class="qa-summary">
        Status: <span id="qa-status">Ready</span> | Passed: <span id="qa-passed">0</span> | Failed: <span id="qa-failed">0</span>
      </div>
      <div class="qa-logs" id="qa-logs">
        <div class="qa-log info">[System] QA Test Dashboard loaded. Click "Run Suite" to begin automated validation testing.</div>
      </div>
    `;
    document.body.appendChild(qaPanel);

    // 2. Event Listeners for Minimize/Restore
    const toggleBtn = document.getElementById('qa-toggle-btn');
    toggleBtn.addEventListener('click', () => {
      qaPanel.classList.toggle('minimized');
      toggleBtn.textContent = qaPanel.classList.contains('minimized') ? 'Restore' : 'Minimize';
    });

    const qaHeader = qaPanel.querySelector('.qa-header');
    qaHeader.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        qaPanel.classList.toggle('minimized');
        toggleBtn.textContent = qaPanel.classList.contains('minimized') ? 'Restore' : 'Minimize';
      }
    });

    // 3. Logger helper function
    const logsContainer = document.getElementById('qa-logs');
    const statusEl = document.getElementById('qa-status');
    const passedEl = document.getElementById('qa-passed');
    const failedEl = document.getElementById('qa-failed');
    
    let passedCount = 0;
    let failedCount = 0;

    window.qaTestLogger = function(msg, type = 'info') {
      const logDiv = document.createElement('div');
      logDiv.className = `qa-log ${type}`;
      const now = new Date();
      const timestamp = `[${now.toTimeString().split(' ')[0]}] `;
      logDiv.textContent = timestamp + msg;
      logsContainer.appendChild(logDiv);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      
      if (type === 'pass') {
        passedCount++;
        passedEl.textContent = passedCount;
      } else if (type === 'fail') {
        failedCount++;
        failedEl.textContent = failedCount;
      }
    };

    // 4. Run Suite Trigger
    const runBtn = document.getElementById('qa-run-btn');
    runBtn.addEventListener('click', async () => {
      runBtn.disabled = true;
      runBtn.style.opacity = '0.5';
      statusEl.textContent = 'Running...';
      statusEl.style.color = '#fbbf24';
      
      passedCount = 0;
      failedCount = 0;
      passedEl.textContent = '0';
      failedEl.textContent = '0';
      logsContainer.innerHTML = '';
      
      window.qaTestLogger('Starting automated validation test suite...', 'info');
      
      try {
        await runAutomatedSuite();
      } catch (err) {
        window.qaTestLogger('Error running tests: ' + err.message, 'fail');
        console.error(err);
      } finally {
        runBtn.disabled = false;
        runBtn.style.opacity = '1';
        if (failedCount > 0) {
          statusEl.textContent = 'FAILED';
          statusEl.style.color = '#ef4444';
          window.qaTestLogger('Suite execution finished with errors.', 'warn');
        } else {
          statusEl.textContent = 'PASSED';
          statusEl.style.color = '#10b981';
          window.qaTestLogger('All tests completed successfully. Funnel reset verified.', 'pass');
        }
      }
    });

    // 5. Automated Test Cases Execution Logic
    async function runAutomatedSuite() {
      const sleep = ms => new Promise(res => setTimeout(res, ms));
      const assert = (condition, passMsg, failMsg) => {
        if (condition) {
          window.qaTestLogger('✓ ' + passMsg, 'pass');
        } else {
          window.qaTestLogger('✗ ' + failMsg, 'fail');
        }
      };

      // Reset step 1 and clear inputs initially
      window.qaTestLogger('Resetting funnel to clean initial state...', 'info');
      inputName.value = '';
      inputPhone.value = '';
      inputName.classList.remove('invalid');
      inputPhone.classList.remove('invalid');
      document.getElementById('name-error').style.display = 'none';
      document.getElementById('phone-error').style.display = 'none';
      
      deviceCards.forEach(c => c.classList.remove('selected'));
      brandCards.forEach(c => c.classList.remove('selected'));
      funnelState.category = "";
      funnelState.subType = "";
      funnelState.brand = "";
      funnelState.issues = [];
      goToStep(1);
      await sleep(600);

      // --- TEST 1: Initial State Assertion ---
      window.qaTestLogger('Running Test 1: Initial State Assertion...', 'info');
      assert(funnelState.currentStep === 1, 'Current step index is 1', 'Current step index should be 1');
      assert(document.getElementById('step1').classList.contains('active'), 'Step 1 element is active', 'Step 1 element should have active class');
      assert(progressFill.style.width === '25%', 'Progress bar is at 25%', 'Progress bar should be at 25%');
      assert(btnBack.disabled === true, 'Back button is disabled', 'Back button should be disabled');
      assert(inputName.value === '' && inputPhone.value === '', 'Inputs are empty', 'Inputs should be empty');

      // --- TEST 2: Step 1 Category Selection Simulation ---
      window.qaTestLogger('Running Test 2: Step 1 Category Selection Simulation...', 'info');
      const testCategoryCard = document.querySelector('.device-select-card[data-device="Refrigerator"]');
      if (testCategoryCard) {
        window.qaTestLogger('Simulating click on "Refrigerator" card', 'info');
        testCategoryCard.click();
        await sleep(600); // Wait for transition
        assert(funnelState.currentStep === 2, 'Funnel transitioned to step 2', 'Funnel should be at step 2');
        assert(funnelState.category === 'Refrigerator', 'funnelState.category set to Refrigerator', 'Category state should be Refrigerator');
        assert(document.getElementById('step2').classList.contains('active'), 'Step 2 element is active', 'Step 2 should be active');
        assert(progressFill.style.width === '50%', 'Progress bar is at 50%', 'Progress bar should be 50%');
      } else {
        window.qaTestLogger('Refrigerator card not found', 'fail');
      }

      // --- TEST 3: Step 2 Sub-type Selection Simulation ---
      window.qaTestLogger('Running Test 3: Step 2 Sub-type Selection Simulation...', 'info');
      const testSubtypeCard = document.querySelector('.subtype-card[data-subtype="Double Door"]');
      if (testSubtypeCard) {
        window.qaTestLogger('Simulating click on "Double Door" subtype card', 'info');
        testSubtypeCard.click();
        await sleep(600);
        assert(funnelState.currentStep === 3, 'Funnel transitioned to step 3', 'Funnel should be at step 3');
        assert(funnelState.subType === 'Double Door', 'funnelState.subType set to Double Door', 'Subtype state should be Double Door');
        assert(document.getElementById('step3').classList.contains('active'), 'Step 3 element is active', 'Step 3 should be active');
        assert(progressFill.style.width === '75%', 'Progress bar is at 75%', 'Progress bar should be 75%');
      } else {
        window.qaTestLogger('Double Door subtype card not found', 'fail');
      }

      // --- TEST 4: Step 3 Brand Selection Simulation ---
      window.qaTestLogger('Running Test 4: Step 3 Brand Selection Simulation...', 'info');
      const testBrandCard = document.querySelector('.brand-select-card[data-brand="Whirlpool"]');
      if (testBrandCard) {
        window.qaTestLogger('Simulating click on "Whirlpool" brand card', 'info');
        testBrandCard.click();
        await sleep(600);
        assert(funnelState.currentStep === 4, 'Funnel transitioned to step 4', 'Funnel should be at step 4');
        assert(funnelState.brand === 'Whirlpool', 'funnelState.brand set to Whirlpool', 'Brand state should be Whirlpool');
        assert(document.getElementById('step4').classList.contains('active'), 'Step 4 element is active', 'Step 4 should be active');
        assert(progressFill.style.width === '100%', 'Progress bar is at 100%', 'Progress bar should be 100%');
      } else {
        window.qaTestLogger('Whirlpool brand card not found', 'fail');
      }

      // --- TEST 5: Validation - Empty Submission Check ---
      window.qaTestLogger('Running Test 5: Validation - Empty Submission Check...', 'info');
      inputName.value = '';
      inputPhone.value = '';
      window.qaTestLogger('Simulating click on Submit with empty inputs', 'info');
      btnNext.click();
      await sleep(500);
      assert(funnelState.currentStep === 4, 'Funnel remains at step 4', 'Funnel should block submission and remain at step 4');
      assert(inputName.classList.contains('invalid'), 'Name input has invalid highlight class', 'Name input should be invalid');
      assert(document.getElementById('name-error').style.display === 'block', 'Name error message is displayed', 'Name error message should be block');

      // --- TEST 6: Validation - Invalid Name Check ---
      window.qaTestLogger('Running Test 6: Validation - Invalid Name Check...', 'info');
      
      // Check too short name
      inputName.value = 'R'; 
      inputName.dispatchEvent(new Event('input'));
      window.qaTestLogger('Simulating click on Submit with invalid name "R" (too short)', 'info');
      btnNext.click();
      await sleep(500);
      assert(funnelState.currentStep === 4, 'Funnel remains at step 4', 'Funnel should block submission');
      assert(inputName.classList.contains('invalid'), 'Name input "R" is marked invalid', 'Name input should be invalid');
      
      // Check numeric name
      inputName.value = 'Rahul123';
      inputName.dispatchEvent(new Event('input'));
      window.qaTestLogger('Simulating click on Submit with invalid name "Rahul123" (numbers)', 'info');
      btnNext.click();
      await sleep(500);
      assert(inputName.classList.contains('invalid'), 'Name input "Rahul123" is marked invalid', 'Name input should be invalid');

      // --- TEST 7: Validation - Invalid Phone Check ---
      window.qaTestLogger('Running Test 7: Validation - Invalid Phone Check...', 'info');
      
      // Set name to valid
      inputName.value = 'Rahul Sharma';
      inputName.dispatchEvent(new Event('input'));
      assert(!inputName.classList.contains('invalid'), 'Name error cleared with valid input "Rahul Sharma"', 'Name input should be valid');

      // Test 5 digit phone
      inputPhone.value = '98765';
      inputPhone.dispatchEvent(new Event('input'));
      window.qaTestLogger('Simulating click on Submit with 5 digit phone "98765"', 'info');
      btnNext.click();
      await sleep(500);
      assert(funnelState.currentStep === 4, 'Funnel remains at step 4', 'Funnel should block submission');
      assert(inputPhone.classList.contains('invalid'), 'Phone input "98765" is marked invalid', 'Phone input should be invalid');
      assert(document.getElementById('phone-error').style.display === 'block', 'Phone error message is displayed', 'Phone error message should be block');

      // Test starting with invalid digit
      inputPhone.value = '5555555555';
      inputPhone.dispatchEvent(new Event('input'));
      window.qaTestLogger('Simulating click on Submit with phone starting with 5: "5555555555"', 'info');
      btnNext.click();
      await sleep(500);
      assert(inputPhone.classList.contains('invalid'), 'Phone starting with 5 is marked invalid', 'Phone input should be invalid');

      // --- TEST 8: Successful Submission Simulation ---
      window.qaTestLogger('Running Test 8: Successful Submission Simulation...', 'info');
      
      // Set valid Indian phone format (e.g. +91 98765 43210)
      inputPhone.value = '+91 98765 43210';
      inputPhone.dispatchEvent(new Event('input'));
      await sleep(100);
      assert(!inputPhone.classList.contains('invalid'), 'Phone error cleared with valid input "+91 98765 43210"', 'Phone input should be valid');

      // Check an issue checkbox
      const checkboxes = document.querySelectorAll('#issues-container input[type="checkbox"]');
      if (checkboxes.length > 0) {
        window.qaTestLogger('Selecting first issue checkbox', 'info');
        checkboxes[0].click();
      }

      // Setup one-shot submit callback
      let submissionSuccessful = false;
      window.onQaSubmitSuccess = () => {
        submissionSuccessful = true;
      };

      window.qaTestLogger('Simulating click on Submit Booking with valid inputs', 'info');
      btnNext.click();
      await sleep(800); // Allow reset slide transitions

      assert(submissionSuccessful === true, 'Submit form action completed and redirect bypassed successfully', 'Redirection callback should be triggered');

      // --- TEST 9: Verification of Post-Submission Reset ---
      window.qaTestLogger('Running Test 9: Verification of Post-Submission Reset...', 'info');
      assert(funnelState.currentStep === 1, 'Funnel state reset back to step 1', 'Funnel state should be step 1');
      assert(funnelState.category === '', 'Category state cleared', 'Category state should be empty');
      assert(funnelState.subType === '', 'Subtype state cleared', 'Subtype state should be empty');
      assert(funnelState.brand === '', 'Brand state cleared', 'Brand state should be empty');
      assert(funnelState.issues.length === 0, 'Issues array is empty', 'Issues array should be empty');
      assert(inputName.value === '', 'Name input is cleared', 'Name input should be empty');
      assert(inputPhone.value === '', 'Phone input is cleared', 'Phone input should be empty');
      assert(progressFill.style.width === '25%', 'Progress bar reset to 25%', 'Progress bar should be 25%');
    }
  }

});
