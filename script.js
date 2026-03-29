// Mobile navigation toggle
const siteHeader = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const heroCta = document.querySelector('#hero-cta');

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
