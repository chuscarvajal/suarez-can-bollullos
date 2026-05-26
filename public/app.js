/*
   Club Suárez Can — Interactive Client Logic
   Adiestramiento Canino y Agility en Bollullos Par del Condado, Huelva
*/

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Navigation & Theme Toggle
  // ==========================================
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const themeToggle = document.querySelector('.theme-toggle');

  window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 50); });
  menuToggle.addEventListener('click', () => { menuToggle.classList.toggle('active'); navMenu.classList.toggle('active'); });
  document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => { menuToggle.classList.remove('active'); navMenu.classList.remove('active'); }));

  const savedTheme = localStorage.getItem('theme');
  document.documentElement.setAttribute('data-theme', (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'dark' : 'light');
  themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // ==========================================
  // 2. Before / After Image Slider
  // ==========================================
  const sliderContainer = document.querySelector('.comparison-slider');
  const afterImage = document.querySelector('.image-after');
  const handle = document.querySelector('.slider-handle');
  if (sliderContainer && afterImage && handle) {
    let isDragging = false;
    const moveSlider = (clientX) => {
      const rect = sliderContainer.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      afterImage.style.clipPath = `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)`;
      handle.style.left = `${pct}%`;
    };
    sliderContainer.addEventListener('mousedown', (e) => { isDragging = true; moveSlider(e.clientX); });
    window.addEventListener('mouseup', () => { isDragging = false; });
    sliderContainer.addEventListener('mousemove', (e) => { if (isDragging) moveSlider(e.clientX); });
    sliderContainer.addEventListener('touchstart', (e) => { isDragging = true; if (e.touches[0]) moveSlider(e.touches[0].clientX); });
    window.addEventListener('touchend', () => { isDragging = false; });
    sliderContainer.addEventListener('touchmove', (e) => { if (isDragging && e.touches[0]) moveSlider(e.touches[0].clientX); });
  }

  // ==========================================
  // 3. Needs Assessment Quiz
  // ==========================================
  const quizData = [
    {
      question: "¿Cuál es la principal situación que quieres trabajar con tu perro?",
      options: [
        { text: "Necesita aprender órdenes básicas, mejorar el paseo o el recall", score: "obediencia" },
        { text: "Tiene reactividad, miedo o agresividad que quiero resolver", score: "conducta" },
        { text: "Ya tiene base y quiero iniciarlo en el agility o mejorar en competición", score: "agility" },
        { text: "No sé bien — necesito que alguien evalúe su situación", score: "conducta" }
      ]
    },
    {
      question: "¿Qué edad tiene tu perro?",
      options: [
        { text: "Cachorro (menos de 6 meses) — quiero empezar desde el principio", score: "obediencia" },
        { text: "Joven (6 meses – 2 años) — tiene mucha energía y poca concentración", score: "agility" },
        { text: "Adulto (2 – 7 años) — tiene hábitos ya instaurados que quiero cambiar", score: "conducta" },
        { text: "Senior (más de 7 años) — quiero mejorar su calidad de vida", score: "obediencia" }
      ]
    },
    {
      question: "¿Cómo reacciona tu perro ante estímulos externos (otros perros, personas, ruidos)?",
      options: [
        { text: "Se pone muy nervioso, ladra o tira con fuerza", score: "conducta" },
        { text: "Se distrae pero no agrede ni tiene miedo intenso", score: "obediencia" },
        { text: "Reacciona con miedo — se bloquea o huye", score: "conducta" },
        { text: "Responde bien — es un perro equilibrado", score: "agility" }
      ]
    },
    {
      question: "¿Qué objetivo te gustaría alcanzar con el adiestramiento?",
      options: [
        { text: "Una convivencia diaria más fácil y paseos tranquilos", score: "obediencia" },
        { text: "Eliminar o reducir comportamientos peligrosos o problemáticos", score: "conducta" },
        { text: "Practicar agility como deporte y disfrutarlo juntos", score: "agility" },
        { text: "Todo lo anterior — una relación mejor en todos los aspectos", score: "obediencia" }
      ]
    }
  ];

  let currentStep = 0;
  const userAnswers = [];
  const quizStep = document.getElementById('quiz-step');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const progressFill = document.getElementById('progress-fill');
  const stepCount = document.getElementById('step-count');
  const quizResult = document.getElementById('quiz-result');
  const resultTitle = document.getElementById('result-title');
  const resultDesc = document.getElementById('result-desc');
  const recDesc = document.getElementById('rec-desc');
  const btnRestart = document.getElementById('btn-restart');
  const btnSelectResultPackage = document.getElementById('btn-select-result-package');

  function initQuiz() {
    if (!quizStep) return;
    currentStep = 0; userAnswers.length = 0;
    quizResult.classList.remove('active'); quizStep.classList.add('active');
    btnPrev.style.visibility = 'hidden'; btnNext.innerText = 'Siguiente';
    showQuestion();
  }

  function showQuestion() {
    const q = quizData[currentStep];
    quizQuestion.innerText = q.question;
    quizOptions.innerHTML = '';
    progressFill.style.width = `${(currentStep / quizData.length) * 100}%`;
    stepCount.innerText = `Paso ${currentStep + 1} de ${quizData.length}`;
    q.options.forEach((opt, idx) => {
      const el = document.createElement('div');
      el.classList.add('quiz-option');
      if (userAnswers[currentStep] === idx) el.classList.add('selected');
      el.innerHTML = `<div class="quiz-radio"></div><div class="quiz-option-text">${opt.text}</div>`;
      el.addEventListener('click', () => { document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected')); el.classList.add('selected'); userAnswers[currentStep] = idx; btnNext.disabled = false; });
      quizOptions.appendChild(el);
    });
    btnNext.disabled = userAnswers[currentStep] === undefined;
    btnPrev.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
    btnNext.innerText = currentStep === quizData.length - 1 ? 'Ver Resultado' : 'Siguiente';
  }

  if (btnNext) btnNext.addEventListener('click', () => { if (currentStep < quizData.length - 1) { currentStep++; showQuestion(); } else { showResults(); } });
  if (btnPrev) btnPrev.addEventListener('click', () => { if (currentStep > 0) { currentStep--; showQuestion(); } });
  if (btnRestart) btnRestart.addEventListener('click', initQuiz);

  function showResults() {
    quizStep.classList.remove('active'); quizResult.classList.add('active');
    progressFill.style.width = '100%'; stepCount.innerText = 'Resultado';
    const scores = { obediencia: 0, agility: 0, conducta: 0 };
    userAnswers.forEach((ansIdx, qIdx) => { scores[quizData[qIdx].options[ansIdx].score]++; });
    let rec = 'obediencia';
    if (scores.conducta >= scores.obediencia && scores.conducta >= scores.agility) rec = 'conducta';
    else if (scores.agility >= scores.obediencia && scores.agility >= scores.conducta) rec = 'agility';
    const results = {
      obediencia: { title: "Adiestramiento y Obediencia — la base de todo", desc: "Tu perro necesita construir una base sólida de comunicación y obediencia. Es el punto de partida para una convivencia más fácil y unos paseos sin estrés.", rec: "Trabajaréis obediencia básica, paseo con correa, recall y concentración en entornos con distracciones. Resultados visibles desde las primeras sesiones." },
      conducta: { title: "Modificación de Conducta — abordamos el problema de raíz", desc: "Tu perro muestra señales que requieren un trabajo especializado. Jacob Suárez es conocido en Huelva precisamente por resolver estos casos.", rec: "Evaluación exhaustiva, protocolo personalizado y trabajo progresivo respetando los tiempos del animal. El cambio es real y duradero." },
      agility: { title: "Agility Canino — deporte, disfrute y conexión", desc: "Tu perro está listo para ir más allá de la obediencia. El agility es la disciplina perfecta para canalizar su energía y fortalecer vuestra comunicación.", rec: "El Club Suárez Can tiene instalaciones propias de agility y niveles para todos — desde la iniciación hasta la competición." }
    };
    resultTitle.innerText = results[rec].title;
    resultDesc.innerText = results[rec].desc;
    recDesc.innerText = results[rec].rec;
    btnSelectResultPackage.setAttribute('data-target-package', rec);
  }

  if (btnSelectResultPackage) btnSelectResultPackage.addEventListener('click', () => { selectPackage(btnSelectResultPackage.getAttribute('data-target-package')); document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' }); });
  initQuiz();

  // ==========================================
  // 4. Pricing Calculator
  // ==========================================
  const pkgObediencia = document.getElementById('pkg-obediencia');
  const pkgAgility = document.getElementById('pkg-agility');
  const pkgConducta = document.getElementById('pkg-conducta');
  const rangeSessions = document.getElementById('range-sessions');
  const sessionCountVal = document.getElementById('session-count-val');
  const sessionsLabel = document.getElementById('sessions-label');
  const addonHome = document.getElementById('addon-home');
  const addonSupport = document.getElementById('addon-support');
  const addonMaterials = document.getElementById('addon-materials');
  const summaryPackageName = document.getElementById('summary-package-name');
  const summaryPackagePrice = document.getElementById('summary-package-price');
  const summarySessionsCount = document.getElementById('summary-sessions-count');
  const summarySessionsPrice = document.getElementById('summary-sessions-price');
  const summaryAddonsList = document.getElementById('summary-addons-list');
  const summaryAddonsPrice = document.getElementById('summary-addons-price');
  const summaryTotalPrice = document.getElementById('summary-total-price');
  const btnBookSession = document.getElementById('btn-book-session');

  const packages = {
    obediencia: { name: "Adiestramiento y Obediencia", unitPrice: 0, unitLabel: "sesiones", sliderMin:1, sliderMax:10, sliderDefault:5, priceLabel:"Consultar", sessionLabel:"2. Número de Sesiones" },
    agility:    { name: "Agility Canino",               unitPrice: 0, unitLabel: "sesiones", sliderMin:1, sliderMax:10, sliderDefault:5, priceLabel:"Consultar", sessionLabel:"2. Número de Sesiones" },
    conducta:   { name: "Modificación de Conducta",     unitPrice: 0, unitLabel: "sesiones", sliderMin:1, sliderMax:10, sliderDefault:5, priceLabel:"Consultar", sessionLabel:"2. Número de Sesiones" }
  };
  let activePackage = 'obediencia';

  function selectPackage(pkgKey) {
    if (!packages[pkgKey]) return;
    activePackage = pkgKey;
    [pkgObediencia, pkgAgility, pkgConducta].forEach(el => { if (el) el.classList.remove('selected'); });
    const targetEl = document.getElementById(`pkg-${pkgKey}`);
    if (targetEl) targetEl.classList.add('selected');
    const pkg = packages[pkgKey];
    rangeSessions.min = pkg.sliderMin; rangeSessions.max = pkg.sliderMax; rangeSessions.value = pkg.sliderDefault;
    sessionCountVal.innerText = pkg.sliderDefault;
    if (sessionsLabel) sessionsLabel.innerText = pkg.sessionLabel;
    calculateCosts();
  }

  function setupCalculatorEvents() {
    if (!pkgObediencia) return;
    pkgObediencia.addEventListener('click', () => selectPackage('obediencia'));
    pkgAgility.addEventListener('click', () => selectPackage('agility'));
    pkgConducta.addEventListener('click', () => selectPackage('conducta'));
    rangeSessions.addEventListener('input', (e) => { sessionCountVal.innerText = e.target.value; calculateCosts(); });
    [addonHome, addonSupport, addonMaterials].forEach(addon => { if (addon) addon.addEventListener('click', () => { addon.classList.toggle('selected'); calculateCosts(); }); });
    if (btnBookSession) btnBookSession.addEventListener('click', () => {
      const pkg = packages[activePackage];
      const msg = `Hola, me gustaría información sobre: *${pkg.name}* — ${rangeSessions.value} ${pkg.unitLabel}.`;
      const contactMessage = document.getElementById('message');
      if (contactMessage) contactMessage.value = msg;
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
  }

  function calculateCosts() {
    if (!rangeSessions || !summaryPackageName) return;
    const pkg = packages[activePackage];
    const qty = parseInt(rangeSessions.value);
    summaryPackageName.innerText = pkg.name;
    summaryPackagePrice.innerText = pkg.priceLabel;
    summarySessionsCount.innerText = `${qty} ${pkg.unitLabel}`;
    summarySessionsPrice.innerText = 'Consultar';
    summaryAddonsList.innerText = 'Ninguno';
    summaryAddonsPrice.innerText = '+0€';
    summaryTotalPrice.classList.remove('pulse'); void summaryTotalPrice.offsetWidth; summaryTotalPrice.classList.add('pulse');
    summaryTotalPrice.innerText = 'Consultar';
  }

  setupCalculatorEvents();
  calculateCosts();

  // ==========================================
  // 5. Testimonial Carousel
  // ==========================================
  const track = document.querySelector('.reviews-track');
  const slides = Array.from(document.querySelectorAll('.review-slide'));
  const dotsContainer = document.querySelector('.reviews-nav');
  if (track && slides.length > 0 && dotsContainer) {
    let currentSlideIdx = 0;
    slides.forEach((_, idx) => {
      const dot = document.createElement('div'); dot.classList.add('review-dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => { goToSlide(idx); clearInterval(autoPlayInterval); });
      dotsContainer.appendChild(dot);
    });
    const dots = Array.from(document.querySelectorAll('.review-dot'));
    function goToSlide(idx) { currentSlideIdx = idx; track.style.transform = `translateX(-${idx * 100}%)`; dots.forEach(d => d.classList.remove('active')); dots[idx].classList.add('active'); }
    let autoPlayInterval = setInterval(() => { goToSlide((currentSlideIdx + 1) % slides.length); }, 5000);
  }

  // ==========================================
  // 6. FAQ Accordion
  // ==========================================
  document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement; const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(el => { el.classList.remove('active'); el.querySelector('.faq-body').style.maxHeight = null; });
      if (!isActive) { item.classList.add('active'); const body = item.querySelector('.faq-body'); body.style.maxHeight = body.scrollHeight + 'px'; }
    });
  });

  // ==========================================
  // 7. Contact Form
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      if (!name || !email || !message) { formStatus.innerText = "Por favor, rellena los campos obligatorios."; formStatus.className = "form-status error"; return; }
      formStatus.innerText = "¡Gracias! Jacob Suárez te responderá lo antes posible.";
      formStatus.className = "form-status success"; contactForm.reset();
      setTimeout(() => { formStatus.style.display = 'none'; }, 5000);
    });
  }

});
