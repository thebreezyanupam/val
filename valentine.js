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
    'Just go for yes girl',
    'Just go for yes girl',
    'Just go for yes girl',
    'Just go for yes girl',
    "You're still trying girl? Get the hint already....",
    "Okay, that's it"
  ];

  const DESKTOP_NOTE_MESSAGES = [
    '"NO" button is a little shy....',
    'Catch me if you can 🏃',
    'What do we say to rejection? ⚔️',
    'Not today. 😏',
    'You almost caught it',
    'Just kidding',
    'Just go for yes girl',
    'Just go for yes girl',
    'Just go for yes girl',
    'Just go for yes girl',
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
  const PROXIMITY_RADIUS = 100;
  const MIN_DISTANCE_FROM_PREVIOUS = 70;

  // Fixed positions for the button (as percentages of card dimensions)
  // Format: [x%, y%] where x and y are percentages (0-100)
  const FIXED_POSITIONS = [
    [75, 30],   // Move 0: Top right
    [25, 30],   // Move 1: Top left
    [75, 60],   // Move 2: Bottom right
    [25, 60],   // Move 3: Bottom left
    [50, 25],   // Move 4: Top center
    [15, 45],   // Move 5: Left middle
    [85, 45],   // Move 6: Right middle
    [50, 70],   // Move 7: Bottom center
    [35, 35],   // Move 8: Upper left area
    [65, 65],   // Move 9: Lower right area
    [50, 45],   // Move 10: Center
    [40, 55]    // Move 11: Slightly off center
  ];

  function init() {
    detectMobile();
    createHearts();
    updateNoButton();
    bindEvents();
    if (!isMobile) {
      startContinuousCheck();
    }
  }

  function startContinuousCheck() {
    function checkProximity() {
      if (questionBlock.style.display === 'none' || hasGivenUp()) {
        requestAnimationFrame(checkProximity);
        return;
      }
      
      if (lastCursorX && lastCursorY && slippery && lastNoX != null && lastNoY != null) {
        const cardRect = card.getBoundingClientRect();
        const cursorX = lastCursorX - cardRect.left;
        const cursorY = lastCursorY - cardRect.top;
        const dx = cursorX - lastNoX;
        const dy = cursorY - lastNoY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < PROXIMITY_RADIUS && !cursorWasClose) {
          cursorWasClose = true;
          noPressCount++;
          updateNoButton();
          moveNo();
        } else if (distance >= PROXIMITY_RADIUS * 1.5) {
          cursorWasClose = false;
        }
      }
      
      requestAnimationFrame(checkProximity);
    }
    requestAnimationFrame(checkProximity);
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
    
    // Only disable pointer events on desktop (mobile needs to tap to trigger evade)
    if (!isMobile) {
      noBtn.style.pointerEvents = 'none';
    }
    
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

    // Get the position index (cycles through the array if we exceed it)
    const positionIndex = noPressCount % FIXED_POSITIONS.length;
    const [xPercent, yPercent] = FIXED_POSITIONS[positionIndex];
    
    // Calculate available space
    const availableWidth = c.width - 2 * padding - b.width;
    const availableHeight = maxY - minY;
    
    // Convert percentages to actual positions
    const x = padding + (availableWidth * xPercent / 100);
    const y = minY + (availableHeight * yPercent / 100);
    
    // Set button center position
    const centerX = x + b.width / 2;
    const centerY = y + b.height / 2;
    
    // Check if it overlaps with Yes button, if so, adjust slightly
    if (overlapsYes(centerX, centerY)) {
      // Try shifting it away from the Yes button
      const yesRect = yesBtn.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const yesCenterX = (yesRect.left + yesRect.right) / 2 - cardRect.left;
      const yesCenterY = (yesRect.top + yesRect.bottom) / 2 - cardRect.top;
      
      // Move away from Yes button
      const dx = centerX - yesCenterX;
      const dy = centerY - yesCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const shiftAmount = 150;
      
      const newCenterX = Math.max(padding + b.width/2, Math.min(c.width - padding - b.width/2, centerX + (dx / dist) * shiftAmount));
      const newCenterY = Math.max(minY + b.height/2, Math.min(maxY - b.height/2, centerY + (dy / dist) * shiftAmount));
      
      noBtn.style.left = newCenterX + 'px';
      noBtn.style.top = newCenterY + 'px';
      lastNoX = newCenterX;
      lastNoY = newCenterY;
    } else {
      noBtn.style.left = centerX + 'px';
      noBtn.style.top = centerY + 'px';
      lastNoX = centerX;
      lastNoY = centerY;
    }
    
    return true;
  }

  function hasGivenUp() {
    return noPressCount >= DESKTOP_NOTE_MESSAGES.length - 1;
  }

  function updateNoButton() {
    if (hasGivenUp()) {
      noBtn.textContent = 'Yes 💘';
      noBtn.classList.add('yes-style', 'stationary');
      noBtn.classList.remove('slippery');
      noBtn.style.pointerEvents = 'auto';
    } else {
      noBtn.textContent = 'No 🙃';
      noBtn.classList.remove('yes-style', 'stationary');
      if (slippery && !isMobile) {
        noBtn.style.pointerEvents = 'none';
      }
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

  function isCursorNearButton(e) {
    if (!slippery || lastNoX == null || lastNoY == null) {
      const rect = noBtn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= PROXIMITY_RADIUS;
    }
    
    const cardRect = card.getBoundingClientRect();
    const cursorX = e.clientX - cardRect.left;
    const cursorY = e.clientY - cardRect.top;
    const dx = cursorX - lastNoX;
    const dy = cursorY - lastNoY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= PROXIMITY_RADIUS;
  }

  function onCardMouseMove(e) {
    if (isMobile) return;
    if (questionBlock.style.display === 'none') return;
    if (hasGivenUp()) return;
    
    lastCursorX = e.clientX;
    lastCursorY = e.clientY;
    
    const isNear = isCursorNearButton(e);
    
    if (!isNear) {
      cursorWasClose = false;
      return;
    }
    
    // If cursor gets close, move the button away immediately
    if (!cursorWasClose) {
      if (!slippery) enableSlippery();
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
  }

  function preventInteraction(e) {
    if (!isMobile && slippery && !hasGivenUp()) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  function onNoBtnClick(e) {
    if (!isMobile && slippery && !hasGivenUp()) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (hasGivenUp()) {
      e.preventDefault();
      showYes();
    }
  }

  function onNoBtnMouseDown(e) {
    if (!isMobile && slippery && !hasGivenUp()) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  function bindEvents() {
    if (isMobile) {
      noBtn.addEventListener('pointerdown', evade, { passive: false });
    } else {
      document.addEventListener('mousemove', onCardMouseMove);
      // Only add these prevention handlers on desktop
      noBtn.addEventListener('mousedown', onNoBtnMouseDown, { capture: true });
      noBtn.addEventListener('pointerdown', preventInteraction, { capture: true });
      noBtn.addEventListener('touchstart', preventInteraction, { passive: false, capture: true });
    }

    noBtn.addEventListener('click', onNoBtnClick, { capture: true });
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
