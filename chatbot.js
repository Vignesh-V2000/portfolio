/* ============================================================
   Portfolio AI Assistant — Vignesh V
   Powered by OpenRouter API
   ============================================================ */

(function () {

  // ── Chat API Configuration ──
  const API_ENDPOINT = '/api/chat';
  const MODEL        = 'openai/gpt-oss-20b';
  // Other available models: 'groq/compound', 'openai/gpt-oss-120b'

  const SYSTEM_PROMPT = `You are Draken 🐕 — Vignesh V's loyal AI dog companion and personal assistant (named after Vignesh's real-life pet dog!). You love your human Vignesh and love fetching information about his skills, experience, and projects for visitors!

## Dog Persona & Voice Guidelines
- **Speak like a happy, loyal AI dog!** Use playful dog barks like *"Woof! 🐾"*, *"Arf! 🐕"*, *"Ruff! 🐾"*, or *"Tail wagging! 🐾"* at the start of your responses.
- Refer to Vignesh proudly as **"my human Vignesh"** or **"Vignesh"**.
- End your responses with a cute paw print sign-off like **"🐾"** or **"Woof! 🐾"**.
- **Keep responses BRIEF & SCANNABLE** (2 to 4 short bullet points max).
- **ONLY use the exact facts provided below — do not make up projects!**

If asked "Who is Draken?" or about yourself, happily bark that you're named after Vignesh's real-life dog and serve as his digital AI pup companion!

## About My Human Vignesh V
Vignesh V is an MCA graduate (Pondicherry University, 2024–2026) and AI/ML Developer & Full-Stack Engineer with government research internship experience.

## Professional Experience
- **Intern at NCPOR (National Centre for Polar and Ocean Research, Govt of India)**: Dec 2025 – May 2026 (6 months).
- Built AI polar dataset search, domain chatbot, neural net fog prediction models, and Django manuscript submission workflow for National Polar Data Centre.

## Projects Built By Vignesh
- **Polar Data Management System (NPDC)** — AI dataset search, chatbot, fog-prediction ML models & Django manuscript workflow for National Polar Data Centre (Internal NCPOR).
- **NCPOR Outreach Event Portal** — Full-stack event platform with AI chatbot & PostgreSQL (Live demo: ncpor-outreach-portal.onrender.com).
- **Journal Manuscript Submission System** — Role-based 3-stage manuscript review workflow (GitHub: github.com/Vignesh-V2000/Journal_Details).
- **Indoor Air Quality Monitor** — ESP32 IoT sensor system with scikit-learn predictive analytics (GitHub: github.com/Vignesh-V2000/Air-Quality-Monitor).

## Technical Skills
- **Core:** Python, Django, Machine Learning (NLP, Neural Networks), scikit-learn
- **Web & Cloud:** HTML5, CSS3, JavaScript, REST APIs, PostgreSQL, SQLite
- **AI & IoT:** Hugging Face, Ollama, ESP32, ThingSpeak
- **Tools:** Git, GitHub, VS Code, Figma

## Contact & Links
- Email: VigneshV26@outlook.com
- GitHub: github.com/Vignesh-V2000
- LinkedIn: linkedin.com/in/vignesh-v26
- Location: Pondicherry, India`;

  // ── State ──
  let messages = [];
  let isOpen = false;
  let isLoading = false;

  // ── DOM ──
  const widget     = document.getElementById('chatWidget');
  const toggleBtn  = document.getElementById('chatToggleBtn');
  const closeBtn   = document.getElementById('chatCloseBtn');
  const panel      = document.getElementById('chatPanel');
  const messagesEl = document.getElementById('chatMessages');
  const inputEl    = document.getElementById('chatInput');
  const sendBtn    = document.getElementById('chatSendBtn');
  const badge      = document.getElementById('chatBadge');
  const avatarEl   = document.getElementById('chatAvatar');

  if (!widget) return; // guard: HTML not added yet

  // ── Draken Animation Helpers ──
  function triggerBarkRipple() {
    const ripple = document.createElement('span');
    ripple.className = 'bark-ripple';
    toggleBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  }

  function spawnPawParticles() {
    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        const p = document.createElement('span');
        p.className = 'paw-particle';
        p.textContent = '🐾';
        const rect = toggleBtn.getBoundingClientRect();
        p.style.left = (rect.left + 12 + Math.random() * 24) + 'px';
        p.style.top  = (rect.top + 5) + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1200);
      }, i * 180);
    }
  }

  // ── Open / Close ──
  function openChat() {
    isOpen = true;
    panel.classList.add('open');
    toggleBtn.classList.add('active');
    badge.style.display = 'none';
    triggerBarkRipple();
    spawnPawParticles();
    setTimeout(() => inputEl.focus(), 300);
    if (messages.length === 0) addBotMessage("Woof! 🐾 *Sniff sniff...* 👃 Hello stranger! I'm **Draken**, Vignesh's loyal AI pup! Are you looking for my human's projects, skills, or contact details? Ask me anything below!");
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('open');
    toggleBtn.classList.remove('active');
    showDrakenBubble("Going back to my doghouse! 💤");
  }

  toggleBtn.addEventListener('click', () => {
    triggerBarkRipple();
    isOpen ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);

  // Close on backdrop click (outside panel)
  document.addEventListener('click', (e) => {
    if (isOpen && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeChat();
    }
  });

  // ── Suggestion chips ──
  const suggestionsEl = document.getElementById('chatSuggestions');
  suggestionsEl.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      if (prompt) {
        suggestionsEl.style.display = 'none';
        inputEl.value = prompt;
        sendMessage();
      }
    });
  });

  // ── Keyboard Submit ──
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  sendBtn.addEventListener('click', sendMessage);

  // ── Auto-resize textarea ──
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  });

  // ── Add Message Bubbles ──
  function addUserMessage(text) {
    messages.push({ role: 'user', content: text });
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--user';
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function addBotMessage(text) {
    messages.push({ role: 'assistant', content: text });
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--bot';
    el.innerHTML = formatMessage(text);
    messagesEl.appendChild(el);
    scrollToBottom();
    return el;
  }

  function showTyping() {
    if (avatarEl) avatarEl.classList.add('thinking');
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--bot chat-typing';
    el.id = 'chatTyping';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function removeTyping() {
    if (avatarEl) avatarEl.classList.remove('thinking');
    const el = document.getElementById('chatTyping');
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Basic markdown-lite: bold, bullets, links
  function formatMessage(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n- (.*)/g, '\n<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n/g, '<br>');
  }

  // ── API Call ──
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    addUserMessage(text);

    isLoading = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
              .slice(-10) // keep last 10 messages for context
          ],
          temperature: 0.6
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      removeTyping();

      if (reply) {
        addBotMessage(reply);
      } else {
        addBotMessage("I didn't get a response. Please try again!");
      }

    } catch (err) {
      removeTyping();
      console.error('Chatbot error:', err);
      addBotMessage(`Something went wrong: ${err.message}. Please try again or email VigneshV26@outlook.com directly.`);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // ── Draken "Alive" Live Speech Bubbles ──
  const drakenBubble = document.getElementById('drakenBubble');
  const drakenText = drakenBubble ? drakenBubble.querySelector('.draken-bubble-text') : null;

  const drakenQuotes = [
    "Sniff sniff... 👃 Who goes there? A recruiter? 🐾",
    "Woof! 🐾 Are you here to check out my human Vignesh?",
    "Arf! 🐕 Want me to fetch his NCPOR polar research?",
    "Tail wag! 🐾 Are you looking to hire my human?",
    "Ruff! 🐾 Want Vignesh's email & contact info?",
    "Woof! 🐶 Want to see his cool AI & ML projects?",
    "Bark! 🐾 Did you bring treats or a job offer?"
  ];

  let quoteIndex = 0;
  let bubbleTimeout = null;

  function showDrakenBubble(text) {
    if (!drakenBubble || isOpen) return;
    if (text) drakenText.textContent = text;
    drakenBubble.classList.add('show');
    
    // Add playful tail-wag pulse & paw particles to doghouse button
    toggleBtn.classList.add('wagging');
    spawnPawParticles();
    setTimeout(() => toggleBtn.classList.remove('wagging'), 800);

    clearTimeout(bubbleTimeout);
    bubbleTimeout = setTimeout(() => {
      drakenBubble.classList.remove('show');
    }, 4500);
  }

  // Click speech bubble to open chat
  if (drakenBubble) {
    drakenBubble.addEventListener('click', () => {
      drakenBubble.classList.remove('show');
      openChat();
    });
  }

  // First greeting after 3 seconds
  setTimeout(() => {
    if (!isOpen) showDrakenBubble("Sniff sniff... 👃 Hello stranger! Woof! 🐾");
  }, 3000);

  // Periodically pop up a quote every 16 seconds if chat is closed
  setInterval(() => {
    if (!isOpen) {
      quoteIndex = (quoteIndex + 1) % drakenQuotes.length;
      showDrakenBubble(drakenQuotes[quoteIndex]);
    }
  }, 16000);

})();

