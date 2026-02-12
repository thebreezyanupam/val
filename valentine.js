/* ===== Valentine's Day Card - Logic ===== */

(function () {
  'use strict';

  const NO_MESSAGES = [
    'No 🙃',
    'Catch me if you can 🏃',
    'What do we say to rejection? ⚔️',
    'Not today. 😏',
    'You almost caught it',
    'Just kidding',
    'Keep trying',
    'Keep trying....',
    'Keep trying....',
    'Keep trying....',
    "You're still trying girl? Get the hint already....",
    "Okay, that's it"
  ];

  const DESKTOP_NOTE_MESSAGES = [
    '...the "Just say no" button is a little shy and...',
    'Catch me if you can 🏃',
    'What do we say to rejection? ⚔️',
    'Not today. 😏',
    'You almost caught it',
    'Just kidding',
    'Keep trying',
    'Keep trying....',
    'Keep trying....',
    'Keep trying....',
    "You're still trying girl? Get the hint already....",
    "Okay, that's it"
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
  let lastEvadeTime = 0;
  let lastNoX = null;
  let lastNoY = null;
  let lastCursorX = 0;
  let lastCursorY = 0;
  let cursorWasClose = false;
  const MOVE_THROTTLE_MS = 100;
  const EVADE_DEBOUNCE_MS = 400;
  const PROXIMITY_RADIUS = 60;
  const MIN_DISTANCE_FROM_PREVIOUS = 70;

  function init() {
    detectMobile();
    createHearts();
    updateNoButton();
    if (isMobile) {
      enableSlippery();
      moveNo();
    }
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
    const centerX = r.left - c.left + r.width * 0.75;
    const centerY = r.top - c.top + r.height / 2;
    noBtn.style.left = centerX + 'px';
    noBtn.style.top = centerY + 'px';
    lastNoX = centerX;
    lastNoY = centerY;
  }

  function overlapsYes(noX, noY) {
    const yesRect = yesBtn.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const noW = noBtn.getBoundingClientRect().width;
    const noH = noBtn.getBoundingClientRect().height;
    const pad = 8;
    const yesLeft = yesRect.left - cardRect.left - pad;
    const yesRight = yesRect.right - cardRect.left + pad;
    const yesTop = yesRect.top - cardRect.top - pad;
    const yesBottom = yesRect.bottom - cardRect.top + pad;
    const noLeft = noX - noW / 2;
    const noRight = noX + noW / 2;
    const noTop = noY - noH / 2;
    const noBottom = noY + noH / 2;
    return !(noRight < yesLeft || noLeft > yesRight || noBottom < yesTop || noTop > yesBottom);
  }

  function moveNo() {
    if (hasGivenUp()) return true;
    const c = card.getBoundingClientRect();
    const b = noBtn.getBoundingClientRect();
    const padding = 30;
    let maxY = c.height - b.height - 40;
    if (noteEl) {
      const noteRect = noteEl.getBoundingClientRect();
      maxY = Math.min(maxY, noteRect.top - c.top - b.height - 12);
    }
    const minY = 80;

    function distFromPrev(cx, cy) {
      if (lastNoX == null || lastNoY == null) return Infinity;
      return Math.sqrt((cx - lastNoX) ** 2 + (cy - lastNoY) ** 2);
    }

    function tryPlace(x, y, skipDistanceCheck) {
      const centerX = x + b.width / 2;
      const centerY = y + b.height / 2;
      if (overlapsYes(centerX, centerY)) return false;
      if (!skipDistanceCheck && distFromPrev(centerX, centerY) < MIN_DISTANCE_FROM_PREVIOUS) return false;
      noBtn.style.left = centerX + 'px';
      noBtn.style.top = centerY + 'px';
      lastNoX = centerX;
      lastNoY = centerY;
      return true;
    }

    if (isMobile) {
      for (let attempt = 0; attempt < 50; attempt++) {
        const x = padding + Math.random() * (c.width - b.width - 2 * padding);
        const y = minY + Math.random() * Math.max(0, maxY - minY);
        if (tryPlace(x, y, false)) return true;
      }
      for (let attempt = 0; attempt < 20; attempt++) {
        const x = padding + Math.random() * (c.width - b.width - 2 * padding);
        const y = minY + Math.random() * Math.max(0, maxY - minY);
        if (tryPlace(x, y, true)) return true;
      }
      return tryPlace(c.width - padding - b.width, minY, true);
    } else {
      const cursorX = lastCursorX - c.left;
      const cursorY = lastCursorY - c.top;
      const halfW = c.width / 2;
      const halfH = (minY + maxY) / 2;
      for (let i = 0; i < 50; i++) {
        const x = cursorX < halfW
          ? halfW + padding + Math.random() * Math.max(0, c.width - halfW - b.width - padding * 2)
          : padding + Math.random() * Math.max(0, halfW - b.width - padding * 2);
        const y = cursorY < halfH
          ? (minY + maxY) / 2 + Math.random() * Math.max(0, maxY - (minY + maxY) / 2)
          : minY + Math.random() * Math.max(0, (minY + maxY) / 2 - minY);
        const bx = x + b.width / 2;
        const by = y + b.height / 2;
        const dist = Math.sqrt((bx - cursorX) ** 2 + (by - cursorY) ** 2);
        if (dist >= PROXIMITY_RADIUS + 100 && tryPlace(x, y, false)) return true;
      }
      for (let i = 0; i < 30; i++) {
        const x = cursorX < halfW
          ? halfW + padding + Math.random() * Math.max(0, c.width - halfW - b.width - padding * 2)
          : padding + Math.random() * Math.max(0, halfW - b.width - padding * 2);
        const y = cursorY < halfH
          ? (minY + maxY) / 2 + Math.random() * Math.max(0, maxY - (minY + maxY) / 2)
          : minY + Math.random() * Math.max(0, (minY + maxY) / 2 - minY);
        if (tryPlace(x, y, true)) return true;
      }
      
      for (let i = 0; i < 30; i++) {
        const x = padding + Math.random() * Math.max(0, c.width - b.width - 2 * padding);
        const y = minY + Math.random() * Math.max(0, maxY - minY);
        if (tryPlace(x, y, true)) return true;
      }
      
      const corners = [
        [padding, minY],
        [c.width - padding - b.width, minY],
        [padding, maxY],
        [c.width - padding - b.width, maxY],
        [c.width / 2 - b.width / 2, minY],
        [c.width / 2 - b.width / 2, maxY],
        [c.width / 2 - b.width / 2, (minY + maxY) / 2]
      ];
      for (const [x, y] of corners) {
        if (tryPlace(x, y, true)) return true;
      }
      return false;
    }
  }

  function hasGivenUp() {
    return noPressCount >= DESKTOP_NOTE_MESSAGES.length - 1;
  }

  function updateNoButton() {
    if (hasGivenUp()) {
      noBtn.textContent = 'Yes 💘';
      noBtn.classList.add('yes-style', 'stationary');
      noBtn.classList.remove('slippery');
    } else {
      noBtn.textContent = 'No 🙃';
      noBtn.classList.remove('yes-style', 'stationary');
    }
    if (noteEl) {
      noteEl.textContent = DESKTOP_NOTE_MESSAGES[Math.min(noPressCount, DESKTOP_NOTE_MESSAGES.length - 1)];
    }
  }

  function evade(e) {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastEvadeTime < EVADE_DEBOUNCE_MS) return;
    lastEvadeTime = now;
    noPressCount++;
    updateNoButton();
    if (hasGivenUp()) {
      if (noPressCount > DESKTOP_NOTE_MESSAGES.length - 1) {
        showYes();
      }
      return;
    }
    if (!slippery) enableSlippery();
    moveNo();
  }

  function isCursorOverButton(e) {
    const rect = noBtn.getBoundingClientRect();
    return e.clientX >= rect.left && 
           e.clientX <= rect.right && 
           e.clientY >= rect.top && 
           e.clientY <= rect.bottom;
  }

  function onCardMouseMove(e) {
    if (isMobile) return;
    if (questionBlock.style.display === 'none') return;
    if (hasGivenUp()) return;
    lastCursorX = e.clientX;
    lastCursorY = e.clientY;
    
    const isOver = isCursorOverButton(e);
    
    if (!isOver) {
      cursorWasClose = false;
      return;
    }
    
    if (cursorWasClose) return;
    
    enableSlippery();
    cursorWasClose = true;
    noPressCount++;
    updateNoButton();
    const moved = moveNo();
    if (!moved) {
      cursorWasClose = false;
      noPressCount--;
      updateNoButton();
    }
  }

  function onNoBtnClick(e) {
    if (hasGivenUp()) {
      e.preventDefault();
      showYes();
    }
  }

  function bindEvents() {
    if (isMobile) {
      noBtn.addEventListener('pointerdown', evade, { passive: false });
    } else {
      document.addEventListener('mousemove', onCardMouseMove);
    }

    noBtn.addEventListener('click', onNoBtnClick);
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
