// Mobile navigation toggle
const siteHeader = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');
const heroCta = document.querySelector('#hero-cta');
const mobileMenuBreakpoint = 768;

// Keep initial entry pinned to the top hero instead of restoring old scroll/hash.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const resetInitialScrollToHero = () => {
  if (window.location.hash && window.location.hash !== '#hero') {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

window.addEventListener('pageshow', resetInitialScrollToHero, { once: true });

// Hero Name — Typewriter Reload Transition
document.addEventListener('DOMContentLoaded', () => {
  const heroName = document.querySelector('.hero-name');
  if (!heroName) {
    return;
  }

  const fullName = heroName.textContent.trim();
  if (!fullName) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  heroName.textContent = '';
  heroName.classList.add('is-typewriting');

  if (prefersReducedMotion) {
    heroName.textContent = fullName;
    heroName.classList.remove('is-typewriting');
    heroName.classList.add('typing-complete');
    return;
  }

  const viewportWidth = window.innerWidth;
  const typingSpeedMs = viewportWidth <= 375 ? 68 : viewportWidth < 768 ? 78 : 90;
  const typingStartDelayMs = viewportWidth < 768 ? 220 : 320;
  let charIndex = 0;

  const typeNextCharacter = () => {
    if (charIndex >= fullName.length) {
      heroName.classList.remove('is-typewriting');
      heroName.classList.add('typing-complete');
      return;
    }

    heroName.textContent += fullName.charAt(charIndex);
    charIndex += 1;
    window.setTimeout(typeNextCharacter, typingSpeedMs);
  };

  window.setTimeout(typeNextCharacter, typingStartDelayMs);
});

// Swap transparent nav for a solid nav after slight scrolling.
const updateHeaderScrollState = () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle('is-scrolled', window.scrollY > 80);
};

window.addEventListener('scroll', updateHeaderScrollState);
window.addEventListener('load', updateHeaderScrollState);

if (navToggle && navLinks) {
  const isMobileViewport = () => window.innerWidth <= mobileMenuBreakpoint;
  const navItems = navLinks.querySelectorAll('li');

  navItems.forEach((item, index) => {
    item.style.setProperty('--nav-stagger', String(index));
  });

  const getFocusableMenuElements = () => {
    return navLinks.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  };

  const trapMenuFocus = (event) => {
    if (event.key !== 'Tab' || !navLinks.classList.contains('open')) {
      return;
    }

    const focusableElements = getFocusableMenuElements();
    if (focusableElements.length === 0) {
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const setMenuState = (isOpen) => {
    navLinks.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
    navOverlay?.classList.toggle('is-visible', isOpen);

    if (isOpen) {
      window.setTimeout(() => {
        const firstFocusable = getFocusableMenuElements()[0];
        firstFocusable?.focus();
      }, 120);
      document.addEventListener('keydown', trapMenuFocus);
    } else {
      document.removeEventListener('keydown', trapMenuFocus);
      navToggle.focus();
    }
  };

  const closeMobileMenu = () => {
    setMenuState(false);
  };

  navToggle.addEventListener('click', () => {
    if (!isMobileViewport()) {
      return;
    }

    const shouldOpen = !navLinks.classList.contains('open');
    setMenuState(shouldOpen);
  });

  // Close when tapping the menu backdrop area outside nav links.
  navLinks.addEventListener('click', (event) => {
    if (event.target === navLinks) {
      closeMobileMenu();
    }
  });

  navOverlay?.addEventListener('click', () => {
    closeMobileMenu();
  });

  // Close the menu after selecting a section on small screens.
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Keep nav state in sync when viewport exits mobile menu breakpoint.
  const syncMenuWithViewport = () => {
    if (!isMobileViewport()) {
      closeMobileMenu();
    }
  };

  window.addEventListener('resize', syncMenuWithViewport, { passive: true });
  window.addEventListener('orientationchange', syncMenuWithViewport, {
    passive: true,
  });

  // Keyboard close for accessibility and quick recovery on small screens.
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMobileMenu();
    }
  });
}

// Explicitly smooth-scroll hero call-to-action to portfolio.
if (heroCta) {
  heroCta.addEventListener('click', (event) => {
    event.preventDefault();

    const portfolio = document.querySelector('#portfolio');
    if (portfolio) {
      portfolio.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Highlight active nav link based on scroll position.
const sections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const setActiveLink = () => {
  const scrollPosition = window.scrollY + 130;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navAnchors.forEach((anchor) => {
        anchor.classList.toggle('active', anchor.getAttribute('href') === `#${sectionId}`);
      });
    }
  });
};

window.addEventListener('scroll', setActiveLink);
window.addEventListener('load', setActiveLink);

// Subtle fade-and-rise animation using IntersectionObserver.
const revealElements = document.querySelectorAll('.reveal');
const serviceCards = document.querySelectorAll('.service-card.reveal');
const portfolioItems = document.querySelectorAll('.portfolio-item.reveal');
const portfolioTabs = document.querySelectorAll('.portfolio-tab');
const journalHead = document.querySelector('.journal-head-reveal');
const journalCards = document.querySelectorAll('.journal-card.journal-reveal');
const contactSection = document.querySelector('#contact');
const contactLeftPanel = document.querySelector('.contact-panel-left');
const contactRightPanel = document.querySelector('.contact-panel-right');
const contactFields = document.querySelectorAll('.contact-field');
const contactSocialLinks = document.querySelectorAll('.contact-social-link');
const contactForm = document.querySelector('#contact-form');
const contactSuccess = document.querySelector('#contact-success');
const backToTopLink = document.querySelector('#back-to-top');

// Stagger service cards so they cascade in sequence as they enter view.
serviceCards.forEach((card, index) => {
  card.style.setProperty('--stagger-delay', `${index * 100}ms`);
});

// Stagger portfolio items for scroll reveal.
portfolioItems.forEach((item, index) => {
  item.style.setProperty('--portfolio-delay', `${index * 120}ms`);
});

// Stagger journal cards for a magazine-like cascade reveal.
journalCards.forEach((card, index) => {
  card.style.setProperty('--journal-delay', `${index * 150}ms`);
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: '0px 0px -8% 0px',
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

// Journal heading/cards observer that disconnects after all entries animate.
const journalElements = [
  ...(journalHead ? [journalHead] : []),
  ...journalCards,
];

if (journalElements.length > 0) {
  let remainingJournalElements = journalElements.length;

  const journalObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
        remainingJournalElements -= 1;

        if (remainingJournalElements <= 0) {
          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  journalElements.forEach((element) => {
    journalObserver.observe(element);
  });
}

// Contact section reveal animations and social stagger.
if (contactSection && contactLeftPanel && contactRightPanel) {
  let contactActivated = false;

  const activateContactAnimations = () => {
    if (contactActivated) {
      return;
    }

    contactLeftPanel.classList.add('in-view');
    contactRightPanel.classList.add('in-view');

    contactFields.forEach((field, index) => {
      window.setTimeout(() => {
        field.classList.add('is-visible');
      }, index * 80 + 120);
    });

    contactSocialLinks.forEach((link, index) => {
      window.setTimeout(() => {
        link.classList.add('is-visible');
      }, index * 60 + 220);
    });

    contactActivated = true;
  };

  const contactObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        activateContactAnimations();
        observer.unobserve(entry.target);
        observer.disconnect();
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  contactObserver.observe(contactSection);
}

// Handle contact form submission via WhatsApp.
if (contactForm && contactSuccess) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get form data
    const fullName = document.querySelector('#full-name').value.trim();
    const email = document.querySelector('#email-address').value.trim();
    const subject = document.querySelector('#subject').value.trim();
    const message = document.querySelector('#message').value.trim();

    // Validate form
    if (!fullName || !email || !subject || !message) {
      alert('Please fill in all fields');
      return;
    }

    // Create WhatsApp message with form data
    const whatsappMessage = `*Contact Form Submission*%0A%0A*Name:* ${encodeURIComponent(fullName)}%0A*Email:* ${encodeURIComponent(email)}%0A*Subject:* ${encodeURIComponent(subject)}%0A%0A*Message:*%0A${encodeURIComponent(message)}`;

    // WhatsApp number (256708384946)
    const whatsappLink = `https://wa.me/256708384946?text=${whatsappMessage}`;

    // Show success message
    contactSuccess.classList.add('is-visible');
    contactForm.reset();

    // Open WhatsApp in a new tab after a brief delay
    setTimeout(() => {
      window.open(whatsappLink, '_blank');
    }, 800);

    // Hide success message after 5 seconds
    setTimeout(() => {
      contactSuccess.classList.remove('is-visible');
    }, 5000);
  });
}

// Smoothly scroll back to top from footer link.
if (backToTopLink) {
  backToTopLink.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Portfolio tab filtering with smooth leave/hide/enter sequencing.
if (portfolioTabs.length > 0 && portfolioItems.length > 0) {
  let filterTimerId;

  const projectDescriptions = {
    'Heritage Mask':
      'Detailed graphite study of African tribal iconography.',
    'Organic Veins':
      'A surrealist exploration of the human form merged with botanical elements.',
    'The Leader':
      'A high-fidelity portrait study focusing on texture and conviction.',
    'Prayer & Pattern':
      'A celebration of cultural beauty and spiritual devotion through henna art.',
    'Floral Synthesis':
      'A multi-layered digital edit blending portraiture with organic textures.',
    'The Studio':
      'A glimpse into the workspace where traditional tools meet creative vision.',
  };

  const ensureProjectModal = () => {
    let modal = document.querySelector('.project-modal');
    if (modal) {
      return modal;
    }

    modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="project-modal-backdrop" data-close="true"></div>
      <div class="project-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
        <button class="project-modal-close" type="button" aria-label="Close project view">×</button>
        <div class="project-modal-content">
          <div class="project-modal-media">
            <img src="" alt="" loading="lazy" />
          </div>
          <p class="project-modal-category"></p>
          <h3 id="project-modal-title" class="project-modal-title"></h3>
          <p class="project-modal-description"></p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  };

  const setProjectModalState = (isOpen, sourceLink = null) => {
    const modal = ensureProjectModal();
    modal.classList.toggle('is-open', isOpen);
    modal.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('project-modal-open', isOpen);

    if (!isOpen && sourceLink) {
      sourceLink.focus();
    }
  };

  const applyPortfolioFilter = (activeCategory) => {
    const matchingItems = [];
    const nonMatchingItems = [];

    portfolioItems.forEach((item) => {
      const itemCategory = item.dataset.category;
      const isMatch = activeCategory === 'all' || itemCategory === activeCategory;

      if (isMatch) {
        matchingItems.push(item);
      } else {
        nonMatchingItems.push(item);
      }
    });

    nonMatchingItems.forEach((item) => {
      item.classList.remove('is-entering');
      item.classList.add('is-leaving');
    });

    clearTimeout(filterTimerId);
    filterTimerId = window.setTimeout(() => {
      nonMatchingItems.forEach((item) => {
        item.classList.add('is-hidden');
        item.classList.remove('is-leaving');
      });

      matchingItems.forEach((item) => {
        item.classList.remove('is-hidden', 'is-leaving');
        item.classList.add('is-entering');

        requestAnimationFrame(() => {
          item.classList.remove('is-entering');
        });
      });
    }, 300);
  };

  portfolioTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const nextCategory = tab.dataset.filter ?? 'all';

      portfolioTabs.forEach((candidate) => {
        const isActive = candidate === tab;
        candidate.classList.toggle('active', isActive);
        candidate.setAttribute('aria-selected', String(isActive));
      });

      applyPortfolioFilter(nextCategory);
    });
  });

  portfolioItems.forEach((item) => {
    const link = item.querySelector('.portfolio-link');
    const titleElement = item.querySelector('.portfolio-title');
    const categoryElement = item.querySelector('.portfolio-category');
    const imageElement = item.querySelector('img');

    if (!link || !titleElement || !categoryElement || !imageElement) {
      return;
    }

    const projectTitle = titleElement.textContent.trim();
    const projectCategory = categoryElement.textContent.trim();
    const projectImage = imageElement.getAttribute('src') ?? '';
    const projectImageAlt = imageElement.getAttribute('alt') ?? projectTitle;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        const modal = ensureProjectModal();
        const modalImage = modal.querySelector('.project-modal-media img');
        const modalCategory = modal.querySelector('.project-modal-category');
        const modalTitle = modal.querySelector('.project-modal-title');
        const modalDescription = modal.querySelector('.project-modal-description');

        if (!modalImage || !modalCategory || !modalTitle || !modalDescription) {
          console.warn('Modal elements not found', {
            modalImage: !!modalImage,
            modalCategory: !!modalCategory,
            modalTitle: !!modalTitle,
            modalDescription: !!modalDescription,
          });
          return;
        }

        modalImage.src = projectImage;
        modalImage.alt = projectImageAlt;
        modalCategory.textContent = projectCategory;
        modalTitle.textContent = projectTitle;
        modalDescription.textContent =
          projectDescriptions[projectTitle] ??
          'A selected project from Mugema Brian\'s practice across photography, videography, and printmaking.';

        setProjectModalState(true);

        const closeButton = modal.querySelector('.project-modal-close');
        if (closeButton) {
          setTimeout(() => closeButton.focus(), 50);
        }

        // Clean up old handlers before adding new ones
        const oldCloseHandler = modal._closeHandler;
        const oldEscapeHandler = modal._escapeHandler;
        if (oldCloseHandler) {
          modal.removeEventListener('click', oldCloseHandler);
        }
        if (oldEscapeHandler) {
          window.removeEventListener('keydown', oldEscapeHandler);
        }

        const closeHandler = (closeEvent) => {
          const closeTarget = closeEvent.target;
          if (
            closeTarget instanceof HTMLElement &&
            (closeTarget.dataset.close === 'true' ||
              closeTarget.classList.contains('project-modal-close') ||
              closeTarget.classList.contains('project-modal-backdrop'))
          ) {
            setProjectModalState(false, link);
            modal.removeEventListener('click', closeHandler);
            window.removeEventListener('keydown', escapeHandler);
            delete modal._closeHandler;
            delete modal._escapeHandler;
          }
        };

        const escapeHandler = (keyEvent) => {
          if (keyEvent.key === 'Escape' && modal.classList.contains('is-open')) {
            setProjectModalState(false, link);
            modal.removeEventListener('click', closeHandler);
            window.removeEventListener('keydown', escapeHandler);
            delete modal._closeHandler;
            delete modal._escapeHandler;
          }
        };

        modal._closeHandler = closeHandler;
        modal._escapeHandler = escapeHandler;

        modal.addEventListener('click', closeHandler);
        window.addEventListener('keydown', escapeHandler);
      } catch (error) {
        console.error('Portfolio modal error:', error);
      }

      return false;
    });
  });
}

// About section entrance and stat count-up animation.
const aboutSection = document.querySelector('#about');
const aboutImage = document.querySelector('.about-image-reveal');
const aboutText = document.querySelector('.about-text-reveal');
const aboutStatValues = document.querySelectorAll('.about-stat-value[data-target]');

let aboutStatsAnimated = false;
let aboutRevealed = false;

const animateCount = (element, target, suffix = '') => {
  const durationMs = 1300;
  const startTime = performance.now();

  const step = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);

    element.textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

if (aboutSection && aboutImage && aboutText) {
  // Start hidden only when JS is running so content never stays invisible.
  aboutImage.classList.add('is-hidden');
  aboutText.classList.add('is-hidden');

  const revealAboutContent = () => {
    if (aboutRevealed) {
      return;
    }

    aboutImage.classList.remove('is-hidden');
    aboutText.classList.remove('is-hidden');
    aboutImage.classList.add('in-view');
    aboutText.classList.add('in-view');
    aboutRevealed = true;

    if (!aboutStatsAnimated) {
      aboutStatValues.forEach((stat) => {
        const target = Number.parseInt(stat.dataset.target ?? '0', 10);
        const suffix = stat.dataset.suffix ?? '';

        if (!Number.isNaN(target) && target > 0) {
          animateCount(stat, target, suffix);
        }
      });

      aboutStatsAnimated = true;
    }
  };

  // Ensure About never stays hidden if observer timing is missed.
  const revealWhenNearViewport = () => {
    const bounds = aboutSection.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.9) {
      revealAboutContent();
      window.removeEventListener('scroll', revealWhenNearViewport);
    }
  };

  window.addEventListener('scroll', revealWhenNearViewport, { passive: true });
  window.addEventListener('load', revealWhenNearViewport);
  setTimeout(revealWhenNearViewport, 650);

  const aboutObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        revealAboutContent();

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -12% 0px',
    }
  );

  aboutObserver.observe(aboutSection);
}

// Scroll Progress Bar & Counter
const progressBar = document.getElementById('scroll-progress-bar');
const scrollPercent = document.getElementById('scroll-percent');

if (progressBar && scrollPercent) {
  const updateScrollProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const rawPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const percent = Math.min(100, Math.max(0, Math.round(rawPercent)));

    progressBar.style.width = `${percent}%`;
    scrollPercent.textContent = String(percent);

    progressBar.classList.toggle('complete', percent >= 100);
    progressBar.classList.toggle('at-zero', percent <= 0);
  };

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('load', updateScrollProgress);
  window.addEventListener('resize', updateScrollProgress);
  updateScrollProgress();
}

// Dynamic Footer Year
const footerYear = document.getElementById('footer-year');

if (footerYear) {
  footerYear.textContent = String(new Date().getFullYear());
}

// Hero Background — Particle Field Generator
const initHeroParticles = () => {
  const particlesContainer = document.querySelector('#hero-particles');
  if (!particlesContainer || particlesContainer.dataset.generated === 'true') {
    return;
  }

  particlesContainer.dataset.generated = 'true';

  const mobileTotalCount = 35;
  const isMobileViewport = window.innerWidth < 768;

  const smallParticleCount = isMobileViewport
    ? mobileTotalCount - 8
    : Math.floor(Math.random() * 16) + 55;
  const largeParticleCount = isMobileViewport
    ? 8
    : Math.floor(Math.random() * 6) + 15;

  const createParticle = ({
    sizeMin,
    sizeMax,
    opacityMin,
    opacityMax,
    durationMin,
    durationMax,
    isLarge,
  }) => {
    const particle = document.createElement('span');
    const size = Math.random() * (sizeMax - sizeMin) + sizeMin;
    const opacity = Math.random() * (opacityMax - opacityMin) + opacityMin;
    const duration = Math.random() * (durationMax - durationMin) + durationMin;
    const delay = Math.random() * -20;
    const rise = -(Math.random() * 120 + 80);
    const drift = Math.random() * 40 - 20;

    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.setProperty('--p-opacity', opacity.toFixed(3));
    particle.style.setProperty('--p-rise', `${rise.toFixed(1)}px`);
    particle.style.setProperty('--p-drift', `${drift.toFixed(1)}px`);
    particle.style.animationDuration = `${duration.toFixed(2)}s`;
    particle.style.animationDelay = `${delay.toFixed(2)}s`;
    particle.style.animationName = 'particle-float';

    if (isLarge) {
      particle.classList.add('particle-large');
    }

    particlesContainer.appendChild(particle);
  };

  for (let index = 0; index < smallParticleCount; index += 1) {
    createParticle({
      sizeMin: 1,
      sizeMax: 3,
      opacityMin: 0.08,
      opacityMax: 0.35,
      durationMin: 18,
      durationMax: 40,
      isLarge: false,
    });
  }

  for (let index = 0; index < largeParticleCount; index += 1) {
    createParticle({
      sizeMin: 3,
      sizeMax: 6,
      opacityMin: 0.04,
      opacityMax: 0.12,
      durationMin: 30,
      durationMax: 60,
      isLarge: true,
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroParticles, { once: true });
} else {
  initHeroParticles();
}
