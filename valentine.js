/* ===== Valentine's Day Card - Logic ===== */

(function () {
  'use strict';

  const NO_MESSAGES = [
    'No 🙃',
    'Catch me if you can 🏃',
    'What do we say to rejection? ⚔️',
    'Not today. 😏',
    'Keep trying.... 💪'
  ];

  const DESKTOP_NOTE_MESSAGES = [
    '...the "Just say no" button is a little shy and...',
    'Catch me if you can 🏃',
    'What do we say to rejection? ⚔️',
    'Not today. 😏',
    'Keep trying.... 💪'
  ];

  const MOBILE_NOTE_MESSAGES = [
    '...the "Just say no" button is a little shy and...',
    '',
    '',
    '',
    ''
  ];

  const GIF_URL = 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNms3dXlzMXQxcmVkZ2V0YWNrcjBzOXNoamVwenZiN2hjNDhpM2FmMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/n4CZ0c7QjgS9sGAO5A/giphy.gif';

  const hearts = document.getElementById('hearts');
  const card = document.getElementById('card');
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const btnRow = document.getElementById('btnRow');
  const questionBlock = document.getElementById('questionBlock');
  const yaySection = document.getElementById('yaySection');
  const gifWrap = document.getElementById('gifWrap');
  const noteEl = document.getElementById('note');

  let slippery = false;
  let noPressCount = 0;
  let isMobile = false;
  let lastMoveTime = 0;
  let lastCursorX = 0;
  let lastCursorY = 0;
  const MOVE_THROTTLE_MS = 350;
  const PROXIMITY_RADIUS = 100;

  function init() {
    detectMobile();
    createHearts();
    bindEvents();
  }

  function detectMobile() {
    isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }

  function createHearts() {
    const colors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#fb7185'];
    for (let i = 0; i < 20; i++) {
      const h = document.createElement('div');
      h.className = 'heart';
      h.style.left = Math.random() * 100 + 'vw';
      h.style.animationDuration = (6 + Math.random() * 10) + 's';
      h.style.animationDelay = (-Math.random() * 10) + 's';
      h.style.background = colors[Math.floor(Math.random() * colors.length)];
      hearts.appendChild(h);
    }
  }

  function enableSlippery() {
    if (slippery) return;
    slippery = true;
    noBtn.classList.add('slippery');
    card.appendChild(noBtn);

    const r = btnRow.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    noBtn.style.left = (r.left - c.left + r.width * 0.75) + 'px';
    noBtn.style.top = (r.top - c.top + r.height / 2) + 'px';
  }

  function moveNo() {
    const c = card.getBoundingClientRect();
    const b = noBtn.getBoundingClientRect();
    const padding = 30;
    let maxY = c.height - b.height - 40;
    if (noteEl) {
      const noteRect = noteEl.getBoundingClientRect();
      maxY = Math.min(maxY, noteRect.top - c.top - b.height - 12);
    }
    const minY = 80;

    if (isMobile) {
      const x = padding + Math.random() * (c.width - b.width - 2 * padding);
      const y = minY + Math.random() * Math.max(0, maxY - minY);
      noBtn.style.left = x + 'px';
      noBtn.style.top = y + 'px';
    } else {
      const cursorX = lastCursorX - c.left;
      const cursorY = lastCursorY - c.top;
      const halfW = c.width / 2;
      const halfH = (minY + maxY) / 2;
      let x = padding;
      let y = minY;
      for (let i = 0; i < 15; i++) {
        x = cursorX < halfW
          ? halfW + padding + Math.random() * Math.max(0, c.width - halfW - b.width - padding * 2)
          : padding + Math.random() * Math.max(0, halfW - b.width - padding * 2);
        y = cursorY < halfH
          ? (minY + maxY) / 2 + Math.random() * Math.max(0, maxY - (minY + maxY) / 2)
          : minY + Math.random() * Math.max(0, (minY + maxY) / 2 - minY);
        const bx = x + b.width / 2;
        const by = y + b.height / 2;
        const dist = Math.sqrt((bx - cursorX) ** 2 + (by - cursorY) ** 2);
        if (dist >= PROXIMITY_RADIUS + 50) break;
      }
      noBtn.style.left = x + 'px';
      noBtn.style.top = y + 'px';
    }
  }

  function updateNoButton() {
    if (isMobile) {
      noBtn.textContent = NO_MESSAGES[Math.min(noPressCount, NO_MESSAGES.length - 1)];
      if (noteEl) {
        noteEl.textContent = MOBILE_NOTE_MESSAGES[Math.min(noPressCount, MOBILE_NOTE_MESSAGES.length - 1)];
      }
    } else {
      noBtn.textContent = 'No 🙃';
      if (noteEl) {
        noteEl.textContent = DESKTOP_NOTE_MESSAGES[Math.min(noPressCount, DESKTOP_NOTE_MESSAGES.length - 1)];
      }
    }
  }

  function evade(e) {
    e.preventDefault();
    e.stopPropagation();
    noPressCount++;
    updateNoButton();
    enableSlippery();
    moveNo();
  }

  function getCursorDistance(e) {
    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function onCardMouseMove(e) {
    if (isMobile) return;
    if (questionBlock.style.display === 'none') return;
    lastCursorX = e.clientX;
    lastCursorY = e.clientY;
    if (getCursorDistance(e) >= PROXIMITY_RADIUS) return;
    enableSlippery();
    const now = Date.now();
    if (now - lastMoveTime < MOVE_THROTTLE_MS) return;
    lastMoveTime = now;
    noPressCount++;
    updateNoButton();
    moveNo();
  }

  function bindEvents() {
    if (isMobile) {
      noBtn.addEventListener('pointerdown', evade, { passive: false });
      noBtn.addEventListener('touchstart', evade, { passive: false });
      noBtn.addEventListener('click', evade);
    } else {
      document.addEventListener('mousemove', onCardMouseMove);
    }

    yesBtn.addEventListener('click', showYes);
  }

  function showYes() {
    questionBlock.style.display = 'none';
    noBtn.style.display = 'none';
    yaySection.style.display = 'block';

    gifWrap.innerHTML = `
      <div class="gif-inner">
        <img src="${GIF_URL}" alt="Happy Valentine's Day!" loading="eager" />
      </div>
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
