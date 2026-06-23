import './style.css';
import { gsap } from 'gsap';

// Prevent browser from restoring scroll position on reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

// 1. MULTILINGUAL PRELOADER
(function initPreloader() {
  const words = ['Hello', 'Bonjour', 'Ciao', 'Olà', 'やあ', 'Hallå', 'Guten tag', 'Namaste'];
  const preloader  = document.getElementById('preloader');
  const wordText   = document.getElementById('preloader-word-text');
  const wordEl     = document.getElementById('preloader-word');
  const curvePath  = document.getElementById('preloader-curve');

  const W = window.innerWidth;
  const H = window.innerHeight;

  // Set initial SVG path — bellied bottom (like the React component)
  const initialD = `M0 0 L${W} 0 L${W} ${H} Q${W/2} ${H+300} 0 ${H} L0 0`;
  const targetD  = `M0 0 L${W} 0 L${W} ${H} Q${W/2} ${H} 0 ${H} L0 0`;
  curvePath.setAttribute('d', initialD);

  let index = 0;

  function swapWord() {
    // Fade out current word
    wordEl.style.animation = 'none';
    wordEl.style.opacity = '0';
    wordEl.style.transform = 'translateY(-6px)';
    wordEl.style.transition = 'opacity 0.1s ease, transform 0.1s ease';

    setTimeout(() => {
      wordText.textContent = words[index];
      // Fade in new word
      wordEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      wordEl.style.opacity = '0.85';
      wordEl.style.transform = 'translateY(0)';
    }, 100);
  }

  function runExitSequence() {
    // 1. Flatten the SVG curve (0.7s)
    curvePath.style.transition = 'd 0.7s cubic-bezier(0.76,0,0.24,1)';
    // Use GSAP-less morphing via CSS custom property trick — do it in JS
    animateCurve(initialD, targetD, 700, () => {
      // 2. Slide the whole preloader up (0.8s delay 0.2s = matches component)
      setTimeout(() => {
        preloader.classList.add('exiting');

        // 3. After slide-up, remove and boot app
        setTimeout(() => {
          preloader.style.display = 'none';
          bootApp();
        }, 900);
      }, 200);
    });
  }

  // Lightweight path d interpolator
  function animateCurve(from, to, duration, onDone) {
    const start = performance.now();
    const fromNums = from.match(/-?\d+(\.\d+)?/g).map(Number);
    const toNums   = to.match(/-?\d+(\.\d+)?/g).map(Number);

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      // ease: cubic-bezier(0.76,0,0.24,1) approximated
      const e = easeInOutCubic(t);
      const interpolated = fromNums.map((f, i) => f + (toNums[i] - f) * e);

      // Rebuild the path string with interpolated numbers
      let rebuilt = from;
      let counter = 0;
      rebuilt = from.replace(/-?\d+(\.\d+)?/g, () => {
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

  // Start cycling words
  function cycle() {
    if (index === words.length - 1) {
      // Last word shown — wait then exit
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

  // Kick off after initial word is visible
  setTimeout(cycle, 1200);
})();

function bootApp() {
  // Always start at the hero/intro section
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  const heroSection = document.getElementById('hero');
  if (heroSection) heroSection.scrollIntoView({ behavior: 'instant', block: 'start' });

  // Initialize 3D Engine after preloader exits
  import('./three-bg.js').then(({ initBackground, initSkillCloud }) => {
    initBackground();
    initSkillCloud('skills-canvas-holder', handleSkillSelection);
    setTimeout(() => {
      const defaultSkill = {
        name: 'Data Analysis',
        desc: 'Parsing logs, cleaning data, conducting EDA, and exporting data reports.',
        val: 0.85
      };
      handleSkillSelection(defaultSkill);
    }, 500);
  });

  import('./charts.js'); // pre-warm module
  initScrollReveal();
}


// 2. SKILL SELECTION CONTROLLER
function handleSkillSelection(skill) {
  const titleEl = document.getElementById('selected-skill-title');
  const descEl = document.getElementById('selected-skill-desc');
  const progressEl = document.getElementById('selected-skill-progress');
  const frequencyEl = document.getElementById('selected-skill-frequency');

  if (!titleEl || !descEl || !progressEl || !frequencyEl) return;

  // Text details update
  titleEl.textContent = skill.name;
  descEl.textContent = skill.desc;

  // Mock proficiencies map
  const skillValues = {
    'Python': { pct: 85, freq: 'DAILY' },
    'SQL': { pct: 80, freq: 'DAILY' },
    'Web Dev': { pct: 75, freq: 'WEEKLY' },
    'Graphic Design': { pct: 70, freq: 'WEEKLY' },
    'Data Analysis': { pct: 85, freq: 'DAILY' },
    'Excel': { pct: 90, freq: 'DAILY' },
    'Google Workspace': { pct: 80, freq: 'DAILY' },
    'Troubleshooting': { pct: 75, freq: 'AS_NEEDED' },
    'Online Teaching': { pct: 80, freq: 'WEEKLY' },
    'Digital Literacy': { pct: 85, freq: 'DAILY' }
  };

  const currentSkillData = skillValues[skill.name] || { pct: 75, freq: 'N/A' };
  
  // Animate progress bar fill
  progressEl.style.width = '0%';
  setTimeout(() => {
    progressEl.style.width = `${currentSkillData.pct}%`;
  }, 50);

  frequencyEl.textContent = currentSkillData.freq;

  // Draw the custom orbital canvas chart
  drawSkillChart('skill-chart-canvas', skill);
}

// 3. TYPEWRITER EFFECT
const typewriterText = document.getElementById('typewriter-text');
const phrases = [
  'Data Science Student',
  'Aspiring Educator',
  'Problem Solver',
  'Web Developer',
  'Graphic Designer'
];
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeEffect() {
  const currentPhrase = phrases[phraseIdx];
  
  if (isDeleting) {
    typewriterText.textContent = currentPhrase.substring(0, charIdx - 1);
    charIdx--;
    typeSpeed = 50; // delete speed is faster
  } else {
    typewriterText.textContent = currentPhrase.substring(0, charIdx + 1);
    charIdx++;
    typeSpeed = 100; // standard typing speed
  }

  // Typewriting completed, pause before deleting
  if (!isDeleting && charIdx === currentPhrase.length) {
    isDeleting = true;
    typeSpeed = 2000; // Pause at end of word
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
    typeSpeed = 500; // Pause before typing next word
  }

  setTimeout(typeEffect, typeSpeed);
}
if (typewriterText) {
  setTimeout(typeEffect, 2500); // Start after loading finishes
}

// 4. NAVIGATION BAR CONTROLLER
// 4. NAVIGATION & SIDEBAR CONTROLLER
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.querySelectorAll('.sidebar-nav-link');
const sections = document.querySelectorAll('section');

// Draw scroll progress percentage and spy scroll intersections
window.addEventListener('scroll', () => {
  const scrollProgress = document.getElementById('scroll-progress');
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (totalHeight > 0 && scrollProgress) {
    const percentage = (window.scrollY / totalHeight) * 100;
    scrollProgress.style.width = `${percentage}%`;
  }

  // Set active link on scroll intersections
  let currentActive = 'hero';
  sections.forEach(sec => {
    const top = sec.offsetTop - 150;
    const height = sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < top + height) {
      currentActive = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentActive}`) {
      link.classList.add('active');
    }
  });
});

// Mobile Sidebar Hamburger Toggle
if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('sidebar-active');
    menuToggle.classList.toggle('active');
    
    // Animate bars
    const bars = menuToggle.querySelectorAll('.bar');
    if (menuToggle.classList.contains('active')) {
      bars[0].style.transform = 'rotate(-45deg) translate(-5px, 5px)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'rotate(45deg) translate(-5px, -5px)';
    } else {
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  });

  // Close sidebar when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('sidebar-active');
      menuToggle.classList.remove('active');
      menuToggle.querySelectorAll('.bar').forEach(b => {
        b.style.transform = 'none';
        b.style.opacity = '1';
      });
    });
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 && 
        sidebar.classList.contains('sidebar-active') && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      sidebar.classList.remove('sidebar-active');
      menuToggle.classList.remove('active');
      menuToggle.querySelectorAll('.bar').forEach(b => {
        b.style.transform = 'none';
        b.style.opacity = '1';
      });
    }
  });
}

// 5. SCROLL REVEAL (INTERSECTION OBSERVER)
function initScrollReveal() {
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // If it is timeline cards, trigger cascading reveals
        const items = entry.target.querySelectorAll('.scroll-reveal-item');
        items.forEach((item, idx) => {
          setTimeout(() => {
            item.classList.add('revealed');
          }, idx * 200);
        });
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(revealCallback, {
    root: null,
    threshold: 0.15
  });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
  });
}

// 6. RETRO TERMINAL SHELL INTERACTIVE CLIENT
const terminalInput = document.getElementById('terminal-input-box');
const terminalHistory = document.getElementById('terminal-history-list');
const terminalScreen = document.getElementById('terminal-screen');

if (terminalInput) {
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = terminalInput.value.trim();
      terminalInput.value = '';
      if (input !== '') {
        processCommand(input);
      }
    }
  });

  // Keep focus on input box when clicking anywhere in terminal body
  const terminalInterface = document.getElementById('terminal-interface');
  if (terminalInterface) {
    terminalInterface.addEventListener('click', () => {
      terminalInput.focus();
    });
  }
}

function printToTerminal(text, type = '') {
  const line = document.createElement('p');
  line.className = `terminal-text ${type}`;
  line.innerHTML = text;
  terminalHistory.appendChild(line);
  // Auto-scroll terminal body to bottom
  terminalScreen.scrollTop = terminalScreen.scrollHeight;
}

function processCommand(cmd) {
  const cleanCmd = cmd.toLowerCase().trim();
  printToTerminal(`anuj-nexus@portfolio:~$ ${cmd}`, 'text-accent');

  switch (cleanCmd) {
    case 'help':
      printToTerminal('Available commands:');
      printToTerminal('  <span class="text-accent">about</span>          - Print Anuj\'s professional summary');
      printToTerminal('  <span class="text-accent">skills</span>         - Retrieve detailed skill proficiency data');
      printToTerminal('  <span class="text-accent">education</span>      - Read academic credentials');
      printToTerminal('  <span class="text-accent">contact</span>        - Get digital contact channels');
      printToTerminal('  <span class="text-accent">download-cv</span>    - Fetch resume document');
      printToTerminal('  <span class="text-accent">clear</span>          - Clear terminal logs');
      break;
    
    case 'about':
      printToTerminal('SYSTEM RETRIEVED SUMMARY:');
      printToTerminal('Dedicated aspiring educator & Bachelor of Science in Data Science student at the University of Mumbai.');
      printToTerminal('Skilled in Python scripting, SQL query engines, Excel analytical models, and front-end development.');
      break;

    case 'skills':
      printToTerminal('RETRIEVING SKILL STACK DATAFRAME:');
      printToTerminal('+--------------------+-------------+');
      printToTerminal('| Skill              | Level       |');
      printToTerminal('+--------------------+-------------+');
      printToTerminal('| Python Scripting   | 85% [Daily] |');
      printToTerminal('| SQL Query Design   | 80% [Daily] |');
      printToTerminal('| Excel Pivot Models | 90% [Daily] |');
      printToTerminal('| Web Development    | 75% [Weekly]|');
      printToTerminal('| Graphic Design     | 70% [Weekly]|');
      printToTerminal('+--------------------+-------------+');
      break;

    case 'education':
      printToTerminal('FETCHING ACADEMIC RECORDS:');
      printToTerminal('- B.Sc. Data Science | Mumbai University | 2025 - Present (Pursuing)');
      printToTerminal('- HSC Science        | HSC Board         | 2024 (Result: 64.33%)');
      printToTerminal('- SSC General        | SSC Board         | 2022 (Result: 85.60%)');
      break;

    case 'contact':
      printToTerminal('CONTACT ENDPOINTS:');
      printToTerminal('- Mobile: +91 7710916655');
      printToTerminal('- Email: anujat9987@gmail.com');
      printToTerminal('- Address: Kalyan, Maharashtra, India');
      break;

    case 'download-cv':
      printToTerminal('Connecting to document repository...');
      printToTerminal('>> CV_Anuj_Tiwari.pdf: Request accepted.');
      printToTerminal('>> Generating dynamic transmission packet...');
      printToTerminal('<span class="pulse-text">SUCCESS: Downloading file CV_Anuj_Tiwari.pdf ...</span>');
      
      // Simulate download link
      const link = document.createElement('a');
      link.href = 'mailto:anujat9987@gmail.com?subject=Requesting Anuj Resume';
      link.target = '_blank';
      link.click();
      break;

    case 'clear':
      terminalHistory.innerHTML = '';
      break;

    default:
      printToTerminal(`bash: command not found: ${cmd}. Type 'help' to review directory functions.`, 'text-dim');
  }
}

// 7. CONTACT FORM SUBMISSION HOOK
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const message = document.getElementById('form-message').value;

    // Reset Form Fields
    contactForm.reset();

    // Scroll to and highlight terminal
    const terminalSec = document.getElementById('terminal-interface');
    if (terminalSec) {
      terminalSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Flash glowing border on terminal to grab attention
      terminalSec.style.borderColor = '#06b6d4';
      terminalSec.style.boxShadow = '0 0 30px rgba(6, 182, 212, 0.4)';
      setTimeout(() => {
        terminalSec.style.borderColor = '';
        terminalSec.style.boxShadow = '';
      }, 2000);
    }

    // Run sending logs inside terminal
    setTimeout(() => {
      printToTerminal('>> INCOMING MESSAGE QUERY TRANSMISSION RECEIVED...', 'text-accent');
      
      setTimeout(() => {
        printToTerminal(`>> Sender: <span class="text-accent">${name}</span>`);
        printToTerminal(`>> Endpoint: <span class="text-accent">${email}</span>`);
        printToTerminal(`>> Payload size: ${message.length} bytes`);
      }, 500);

      setTimeout(() => {
        printToTerminal('>> Establishing secure websocket socket to DB...');
        printToTerminal('>> Query compiled: INSERT INTO messages (sender, endpoint, body) VALUES ($1, $2, $3)...');
      }, 1200);

      setTimeout(() => {
        printToTerminal('<span class="pulse-text">TRANSMISSION OK: Response 200 SUCCESS</span>');
        printToTerminal('>> Message forwarded to Anuj. Thank you for connecting!');
      }, 2200);

    }, 600);
  });
}

// 8. CERTIFICATE PREVIEW MODAL CONTROLLER
const certModal = document.getElementById('cert-modal');
const modalImg = document.getElementById('modal-img');
const modalCaption = document.getElementById('modal-caption');
const modalCloseBtn = document.getElementById('modal-close-btn');
const certCards = document.querySelectorAll('.certificate-card');

if (certModal && modalImg && modalCaption) {
  certCards.forEach(card => {
    card.addEventListener('click', () => {
      const certSrc = card.getAttribute('data-cert');
      const certTitle = card.getAttribute('data-title');
      
      modalImg.src = certSrc;
      modalCaption.textContent = certTitle;
      
      certModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // prevent scrolling behind modal
    });
  });

  const closeModal = () => {
    certModal.classList.remove('active');
    document.body.style.overflow = '';
    // Clear image source after transition to prevent layout flickering on next open
    setTimeout(() => {
      if (!certModal.classList.contains('active')) {
        modalImg.src = '';
      }
    }, 300);
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // Close modal when clicking on the backdrop
  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) {
      closeModal();
    }
  });

  // Close modal on Escape key press
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('active')) {
      closeModal();
    }
  });
}

