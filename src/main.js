import './style.css';
import { gsap } from 'gsap';
import { drawSkillChart } from './charts.js';

// Prevent browser from restoring scroll position on reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

// 0. WEB AUDIO API SYNTHESIZER FOR 3D SCI-FI SOUND FX
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playHover() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

const sound = new SoundFX();

// Sound Toggle Button Handler
(function initSoundButton() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (!soundBtn) return;

  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = soundBtn.querySelector('.sound-label');

  soundBtn.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    if (isMuted) {
      soundBtn.classList.add('muted');
      if (soundIcon) soundIcon.textContent = '🔇';
      if (soundLabel) soundLabel.textContent = 'SOUND: OFF';
    } else {
      soundBtn.classList.remove('muted');
      if (soundIcon) soundIcon.textContent = '🔊';
      if (soundLabel) soundLabel.textContent = 'SOUND: ON';
      sound.playClick();
    }
  });
})();

// 1. MULTILINGUAL PRELOADER
(function initPreloader() {
  const words = ['Hello', 'Bonjour', 'Ciao', 'Olà', 'やあ', 'Hallå', 'Guten tag', 'नमस्ते'];
  const preloader  = document.getElementById('preloader');
  const wordText   = document.getElementById('preloader-word-text');
  const wordEl     = document.getElementById('preloader-word');
  const curvePath  = document.getElementById('preloader-curve');

  if (!preloader || !wordText || !wordEl || !curvePath) return;

  const W = window.innerWidth;
  const H = window.innerHeight;

  const initialD = `M0 0 L${W} 0 L${W} ${H} Q${W/2} ${H+300} 0 ${H} L0 0`;
  const targetD  = `M0 0 L${W} 0 L${W} ${H} Q${W/2} ${H} 0 ${H} L0 0`;
  curvePath.setAttribute('d', initialD);

  let index = 0;

  function swapWord() {
    wordEl.style.animation = 'none';
    wordEl.style.opacity = '0';
    wordEl.style.transform = 'translateY(-6px)';
    wordEl.style.transition = 'opacity 0.1s ease, transform 0.1s ease';

    setTimeout(() => {
      wordText.textContent = words[index];
      wordEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      wordEl.style.opacity = '0.85';
      wordEl.style.transform = 'translateY(0)';
    }, 100);
  }

  function runExitSequence() {
    curvePath.style.transition = 'd 0.7s cubic-bezier(0.76,0,0.24,1)';
    animateCurve(initialD, targetD, 700, () => {
      setTimeout(() => {
        preloader.classList.add('exiting');
        setTimeout(() => {
          preloader.style.display = 'none';
          bootApp();
        }, 900);
      }, 200);
    });
  }

  function animateCurve(from, to, duration, onDone) {
    const start = performance.now();
    const fromNums = from.match(/-?\d+(\.\d+)?/g).map(Number);
    const toNums   = to.match(/-?\d+(\.\d+)?/g).map(Number);

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const e = easeInOutCubic(t);
      const interpolated = fromNums.map((f, i) => f + (toNums[i] - f) * e);

      let counter = 0;
      const rebuilt = from.replace(/-?\d+(\.\d+)?/g, () => {
        const val = interpolated[counter++];
        return Math.round(val * 100) / 100;
      });
      curvePath.setAttribute('d', rebuilt);

      if (t < 1) requestAnimationFrame(step);
      else onDone && onDone();
    }
    requestAnimationFrame(step);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function cycle() {
    if (index === words.length - 1) {
      setTimeout(runExitSequence, 1000);
      return;
    }
    const delay = index === 0 ? 1000 : 150;
    setTimeout(() => {
      index++;
      swapWord();
      cycle();
    }, delay);
  }

  setTimeout(cycle, 1200);
})();

function bootApp() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  const heroSection = document.getElementById('hero');
  if (heroSection) heroSection.scrollIntoView({ behavior: 'instant', block: 'start' });

  // Boot 3D Engine & Canvas visualizer
  import('./three-bg.js').then(({ initBackground, initSkillCloud }) => {
    initBackground();
    initSkillCloud('skills-canvas-holder', handleSkillSelection);
    setTimeout(() => {
      const defaultSkill = {
        name: 'Python',
        category: 'Data Science',
        desc: 'Data analytics, model pipelines, scripting, NumPy, Pandas, Scikit-Learn.',
        val: 0.85
      };
      handleSkillSelection(defaultSkill);
    }, 500);
  });

  initScrollReveal();
  initTiltEffect();
  animateHeroStats();

  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    const hint = document.querySelector('.visualizer-hint');
    if (hint) hint.textContent = 'Tap & drag to rotate 3D sphere · Tap nodes for stats';
  }

  if (typeof startTypewriter === 'function') {
    startTypewriter();
  }
}

// 2. 3D CARD TILT TRACKING
function initTiltEffect() {
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });

    card.addEventListener('mouseenter', () => {
      sound.playHover();
    });
  });
}

// 3. ANIMATED HERO STAT COUNTERS
function animateHeroStats() {
  const statNums = document.querySelectorAll('.stat-num');

  statNums.forEach((stat) => {
    const target = parseInt(stat.getAttribute('data-count'), 10) || 0;
    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = target;
        clearInterval(timer);
      } else {
        stat.textContent = current;
      }
    }, 30);
  });
}

// 4. SKILL SELECTION CONTROLLER
function handleSkillSelection(skill) {
  sound.playClick();
  const titleEl = document.getElementById('selected-skill-title');
  const descEl = document.getElementById('selected-skill-desc');
  const progressEl = document.getElementById('selected-skill-progress');
  const categoryEl = document.getElementById('selected-skill-category');

  if (!titleEl || !descEl || !progressEl) return;

  titleEl.textContent = skill.name;
  descEl.textContent = skill.desc;

  const skillDataMap = {
    'Python': { pct: 90, cat: 'Data Science' },
    'SQL': { pct: 85, cat: 'Data Science' },
    'Machine Learning': { pct: 80, cat: 'AI / ML' },
    'Web Dev': { pct: 85, cat: 'Frontend 3D' },
    'Three.js': { pct: 80, cat: 'WebGL Graphics' },
    'Data Visualization': { pct: 88, cat: 'Analytics' },
    'Graphic Design': { pct: 75, cat: 'UI / UX Design' },
    'Git & GitHub': { pct: 82, cat: 'Version Control' },
    'Excel / Sheets': { pct: 90, cat: 'Spreadsheets' },
    'Problem Solving': { pct: 88, cat: 'Core Logic' }
  };

  const currentData = skillDataMap[skill.name] || { pct: 80, cat: skill.category || 'Data Science' };

  progressEl.style.width = '0%';
  setTimeout(() => {
    progressEl.style.width = `${currentData.pct}%`;
  }, 50);

  if (categoryEl) {
    categoryEl.textContent = currentData.cat;
  }

  drawSkillChart('skill-chart-canvas', skill);
}

// 5. TYPEWRITER EFFECT
const typewriterText = document.getElementById('typewriter-text');
const phrases = [
  'B.Sc. Data Science Student',
  'Full-Stack & 3D Web Developer',
  'Machine Learning Practitioner',
  'Data Analytics Specialist'
];
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeEffect() {
  if (!typewriterText) return;
  const currentPhrase = phrases[phraseIdx];
  
  if (isDeleting) {
    typewriterText.textContent = currentPhrase.substring(0, charIdx - 1);
    charIdx--;
    typeSpeed = 45;
  } else {
    typewriterText.textContent = currentPhrase.substring(0, charIdx + 1);
    charIdx++;
    typeSpeed = 90;
  }

  if (!isDeleting && charIdx === currentPhrase.length) {
    isDeleting = true;
    typeSpeed = 2000;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
    typeSpeed = 400;
  }

  setTimeout(typeEffect, typeSpeed);
}
function startTypewriter() {
  if (typewriterText) {
    typeEffect();
  }
}

// 6. NAVIGATION & SIDEBAR CONTROLLER
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.querySelectorAll('.sidebar-nav-link');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
  const scrollProgress = document.getElementById('scroll-progress');
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (totalHeight > 0 && scrollProgress) {
    const percentage = (window.scrollY / totalHeight) * 100;
    scrollProgress.style.width = `${percentage}%`;
  }

  let currentActive = 'hero';
  sections.forEach((sec) => {
    const top = sec.offsetTop - 150;
    const height = sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < top + height) {
      currentActive = sec.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentActive}`) {
      link.classList.add('active');
    }
  });
});

if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    sidebar.classList.toggle('active');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      sound.playClick();
      menuToggle.classList.remove('active');
      sidebar.classList.remove('active');
    });
  });
}

// 7. SCROLL REVEAL OBSERVER
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }
}

// 8. CERTIFICATE PREVIEW MODAL CONTROLLER
const certModal = document.getElementById('cert-modal');
const modalImg = document.getElementById('modal-img');
const modalCaption = document.getElementById('modal-caption');
const modalCloseBtn = document.getElementById('modal-close-btn');
const certCards = document.querySelectorAll('.certificate-card');

if (certModal && modalImg && modalCaption) {
  certCards.forEach((card) => {
    card.addEventListener('click', () => {
      sound.playClick();
      const certSrc = card.getAttribute('data-cert');
      const certTitle = card.getAttribute('data-title');
      
      modalImg.src = certSrc;
      modalCaption.textContent = certTitle;
      
      certModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    certModal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!certModal.classList.contains('active')) {
        modalImg.src = '';
      }
    }, 300);
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('active')) {
      closeModal();
    }
  });
}

// 9. 3D CURSOR TRAIL EFFECT
(function initCursorEffect() {
  if ('ontouchstart' in window && navigator.maxTouchPoints > 0 && !window.matchMedia('(hover: hover)').matches) return;

  const glow = document.getElementById('cursor-glow');
  const ring = document.getElementById('cursor-ring');
  if (!glow || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isVisible = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      glow.style.opacity = '1';
      ring.style.opacity = '1';
    }

    glow.style.left = mouseX + 'px';
    glow.style.top = mouseY + 'px';
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    ring.style.opacity = '0';
    isVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    glow.style.opacity = '1';
    ring.style.opacity = '1';
    isVisible = true;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = document.querySelectorAll('a, button, .btn, .sidebar-nav-link, .certificate-card, .interest-tag, .mobile-toggle, .social-link, .tilt-card');

  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      sound.playHover();
      ring.classList.add('cursor-hover');
      glow.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('cursor-hover');
      glow.classList.remove('cursor-hover');
    });
  });

  document.addEventListener('mousedown', () => {
    ring.classList.add('cursor-click');
  });
  document.addEventListener('mouseup', () => {
    ring.classList.remove('cursor-click');
  });
})();
