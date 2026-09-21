/* ============================================================
   Script — Vignesh V Portfolio
   Typewriter, Scroll Animations, Mobile Nav, Active Link
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Typewriter Effect ----
  const typewriterEl = document.getElementById('typewriter');
  const roles = [
    'AI Developer',
    'ML Engineer',
    'Full-Stack Developer',
    'IoT Enthusiast'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const TYPING_SPEED = 80;
  const DELETING_SPEED = 50;
  const PAUSE_AFTER_TYPING = 2000;
  const PAUSE_AFTER_DELETING = 400;

  function typewrite() {
    const currentRole = roles[roleIndex];

    if (!isDeleting) {
      typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(typewrite, PAUSE_AFTER_TYPING);
        return;
      }
      setTimeout(typewrite, TYPING_SPEED);
    } else {
      typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typewrite, PAUSE_AFTER_DELETING);
        return;
      }
      setTimeout(typewrite, DELETING_SPEED);
    }
  }

  typewrite();


  // ---- Mobile Navigation Toggle ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });


  // ---- Scroll Reveal Animations ----
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ---- Skill Bar Animation ----
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.getAttribute('data-width');
        entry.target.style.width = width + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });

  skillBars.forEach(bar => skillObserver.observe(bar));


  // ---- Active Navigation Link ----
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  function setActiveLink() {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navAnchors.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + sectionId) {
            a.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();


  // ---- Hero Scroll-Driven Blur ----
  const heroBgImg = document.getElementById('heroBgImg');
  const heroOverlay = document.getElementById('heroOverlay');
  const heroSection = document.getElementById('hero');

  function updateHeroBlur() {
    if (!heroBgImg || !heroSection) return;

    const heroHeight = heroSection.offsetHeight;
    const scrollY = window.scrollY;
    // progress goes 0 → 1 as you scroll through the hero
    const progress = Math.min(scrollY / (heroHeight * 0.7), 1);

    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

    // Blur: Add base blur for mobile/tablet to make text pop immediately
    let baseBlur = 0;
    if (isMobile) baseBlur = 4;
    else if (isTablet) baseBlur = 3;
    
    const blurAmount = baseBlur + (progress * 12);
    heroBgImg.style.filter = `blur(${blurAmount}px)`;

    // Only override overlay background with JS on desktop/tablet-landscape
    // so we don't break the CSS vertical gradient on mobile/tablet-portrait
    if (!isMobile) {
      const overlayAlpha = 0.95 + (progress * 0.05); // left side gets even darker
      const overlayMid = 0.65 + (progress * 0.3);    // mid section darkens
      const overlayRight = 0.05 + (progress * 0.6);   // right side darkens

      heroOverlay.style.background = `
        linear-gradient(
          90deg,
          rgba(20, 22, 31, ${overlayAlpha}) 0%,
          rgba(20, 22, 31, ${Math.min(overlayAlpha - 0.07, 0.98)}) 25%,
          rgba(20, 22, 31, ${overlayMid}) 50%,
          rgba(20, 22, 31, ${Math.min(overlayMid - 0.15, 0.85)}) 70%,
          rgba(20, 22, 31, ${overlayRight}) 85%,
          rgba(20, 22, 31, ${Math.max(overlayRight - 0.15, 0)}) 100%
        ),
        linear-gradient(
          180deg,
          rgba(20, 22, 31, 0.5) 0%,
          transparent 35%
        )
      `;
    } else {
      // Clear inline style on mobile so it falls back to the CSS vertical gradient
      heroOverlay.style.background = '';
    }
  }

  window.addEventListener('scroll', updateHeroBlur, { passive: true });
  updateHeroBlur();


  // ---- Back to Top Button ----
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
