// =============================================================
// Гүлім үшін жасалған сайт — интерактивтер мен анимациялар
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScrollButtons();
  initScrollReveal();
  initFloatingHeartsCanvas();
  initTypewriter();
  initAnswerReveal();
  initFinale();
  initMusicPlayer();
  initButtonPressEffect();
});

/* ---------------------------------------------------------
   1. Батырма арқылы жұмсақ скролл
--------------------------------------------------------- */
function initSmoothScrollButtons(){
  const scrollBtn = document.getElementById('scrollToConfession');
  if(!scrollBtn) return;
  scrollBtn.addEventListener('click', () => {
    const target = document.getElementById('confession');
    if(target){
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/* ---------------------------------------------------------
   2. Элементтердің прокруткада пайда болуы
--------------------------------------------------------- */
function initScrollReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if(entry.isIntersecting){
        const el = entry.target;
        // топтағы элементтерге кішкене кідіріс беру үшін
        const siblingsRevealed = [...el.parentElement.querySelectorAll('.reveal.is-visible')].length;
        setTimeout(() => el.classList.add('is-visible'), Math.min(siblingsRevealed, 4) * 90);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach(el => observer.observe(el));
}

/* ---------------------------------------------------------
   3. Фондағы жүзіп жүрген жүрекшелер (canvas)
--------------------------------------------------------- */
function initFloatingHeartsCanvas(){
  const canvas = document.getElementById('heartsCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, hearts = [];
  const COLORS = ['#ff6fa5', '#ff4d6d', '#a86bff', '#ffb4cf'];

  function resize(){
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function makeHeart(){
    return {
      x: Math.random() * width,
      y: height + Math.random() * height * 0.5,
      size: 6 + Math.random() * 14,
      speed: 0.25 + Math.random() * 0.55,
      drift: (Math.random() - 0.5) * 0.6,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.15 + Math.random() * 0.35
    };
  }

  function initHearts(){
    const count = window.innerWidth < 640 ? 16 : 30;
    hearts = Array.from({ length: count }, makeHeart);
  }

  function drawHeart(h){
    const s = h.size;
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.globalAlpha = h.opacity;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.4, -s, s * 0.15, 0, s);
    ctx.bezierCurveTo(s, s * 0.15, s * 0.5, -s * 0.4, 0, s * 0.3);
    ctx.closePath();
    ctx.fillStyle = h.color;
    ctx.fill();
    ctx.restore();
  }

  function tick(){
    ctx.clearRect(0, 0, width, height);
    hearts.forEach(h => {
      h.y -= h.speed;
      h.wobble += h.wobbleSpeed;
      h.x += Math.sin(h.wobble) * 0.4 + h.drift * 0.15;
      if(h.y < -30){
        Object.assign(h, makeHeart(), { y: height + 20 });
      }
      drawHeart(h);
    });
    requestAnimationFrame(tick);
  }

  resize();
  initHearts();
  window.addEventListener('resize', () => { resize(); initHearts(); });

  if(!prefersReducedMotion){
    requestAnimationFrame(tick);
  } else {
    // қозғалысты азайту таңдалса — статикалық бір рет салу
    hearts.forEach(drawHeart);
  }
}

/* ---------------------------------------------------------
   4. Негізгі мойындау мәтінінің «жазылу» эффектісі
--------------------------------------------------------- */
function initTypewriter(){
  const el = document.querySelector('[data-typewriter]');
  if(!el) return;

  const fullText = el.textContent;
  el.textContent = '';
  let started = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting && !started){
        started = true;
        typeText(el, fullText);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(el);
}

function typeText(el, text){
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReducedMotion){
    el.textContent = text;
    return;
  }
  let i = 0;
  const speed = 16; // мс/таңба
  function step(){
    if(i <= text.length){
      el.textContent = text.slice(0, i);
      i += 2; // жылдамырақ болу үшін бірнеше таңбадан қосамыз
      setTimeout(step, speed);
    } else {
      el.textContent = text;
    }
  }
  step();
}

/* ---------------------------------------------------------
   5. «Жүрегім біледі» батырмасы — жауапты ашу
--------------------------------------------------------- */
function initAnswerReveal(){
  const btn = document.getElementById('revealAnswerBtn');
  const answer = document.getElementById('answerBox');
  if(!btn || !answer) return;

  btn.addEventListener('click', () => {
    const isOpen = answer.classList.toggle('is-open');
    if(isOpen){
      answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      btn.textContent = 'Жүрегім айтып қойды ❤️';
    } else {
      btn.textContent = 'Жауабын жүрегім біледі';
    }
  });
}

/* ---------------------------------------------------------
   6. Финалдық анимация — хабарлама + жүрек конфеттиі
--------------------------------------------------------- */
function initFinale(){
  const btn = document.getElementById('finalBtn');
  const message = document.getElementById('finalMessage');
  if(!btn || !message) return;

  let alreadyPlayed = false;

  btn.addEventListener('click', () => {
    message.classList.add('is-visible');
    message.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if(!alreadyPlayed){
      alreadyPlayed = true;
      launchHeartConfetti();
    }
  });
}

function launchHeartConfetti(){
  const layer = document.getElementById('confettiLayer');
  if(!layer) return;
  const emojis = ['❤️', '💗', '💖', '💫', '✨'];
  const count = 60;

  for(let i = 0; i < count; i++){
    setTimeout(() => {
      const span = document.createElement('span');
      span.className = 'confetti-heart';
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = Math.random() * 100 + 'vw';
      span.style.fontSize = (0.9 + Math.random() * 1.6) + 'rem';
      const duration = 3.5 + Math.random() * 3;
      span.style.animationDuration = duration + 's';
      layer.appendChild(span);
      setTimeout(() => span.remove(), duration * 1000 + 200);
    }, i * 45);
  }
}

/* ---------------------------------------------------------
   7. Романтикалық фондық музыка (music.mp3)
--------------------------------------------------------- */
function initMusicPlayer(){
  const btn = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');
  const textEl = btn ? btn.querySelector('.music-btn__text') : null;
  if(!btn || !audio) return;

  audio.volume = 0;
  let isPlaying = false;
  let fadeInterval = null;

  function fadeVolume(target, duration = 900){
    if(fadeInterval) clearInterval(fadeInterval);
    const steps = 30;
    const stepTime = duration / steps;
    const startVol = audio.volume;
    const diff = target - startVol;
    let step = 0;
    fadeInterval = setInterval(() => {
      step++;
      audio.volume = Math.min(1, Math.max(0, startVol + (diff * step) / steps));
      if(step >= steps){
        clearInterval(fadeInterval);
        audio.volume = target;
      }
    }, stepTime);
  }

  btn.addEventListener('click', () => {
    if(!isPlaying){
      audio.play().then(() => {
        isPlaying = true;
        btn.classList.add('is-playing');
        if(textEl) textEl.textContent = 'Музыканы тоқтату';
        btn.querySelector('.music-btn__icon').textContent = '⏸';
        fadeVolume(0.55);
      }).catch(() => {
        if(textEl) textEl.textContent = 'music.mp3 табылмады';
      });
    } else {
      fadeVolume(0, 600);
      setTimeout(() => {
        audio.pause();
      }, 620);
      isPlaying = false;
      btn.classList.remove('is-playing');
      if(textEl) textEl.textContent = 'Музыканы қосу';
      btn.querySelector('.music-btn__icon').textContent = '🎵';
    }
  });

  // Ән аяқталса, басынан қайта бастау (loop атрибуты бар,
  // бірақ дыбыс деңгейін қайта жайлап көтеру үшін)
  audio.addEventListener('ended', () => {
    if(isPlaying){
      audio.currentTime = 0;
      audio.play();
    }
  });
}

/* ---------------------------------------------------------
   8. Барлық батырмаларға әдемі басу эффектісі
--------------------------------------------------------- */
function initButtonPressEffect(){
  const buttons = document.querySelectorAll('.btn, .music-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      ripple.style.position = 'absolute';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255,255,255,0.35)';
      ripple.style.pointerEvents = 'none';
      ripple.style.transform = 'scale(0)';
      ripple.style.opacity = '1';
      ripple.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '0';
      });

      setTimeout(() => ripple.remove(), 650);
    });
  });
}
