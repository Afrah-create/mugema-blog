// Mobile navigation toggle
const siteHeader = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const heroCta = document.querySelector('#hero-cta');

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
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  // Close the menu after selecting a section on small screens.
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
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

// Show inline success feedback for contact form submission.
if (contactForm && contactSuccess) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactSuccess.classList.add('is-visible');
    contactForm.reset();
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
