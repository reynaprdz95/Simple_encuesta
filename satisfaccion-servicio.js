(function () {
  const SURVEY_WEBHOOK_URL =
    window.SURVEY_WEBHOOK_URL || "PEGAR_AQUI_WEBHOOK_DE_GOOGLE_APPS_SCRIPT";

  const WEBHOOK_PLACEHOLDER = "PEGAR_AQUI_WEBHOOK_DE_GOOGLE_APPS_SCRIPT";
  const REQUIRED_MESSAGE = "Por favor responde esta pregunta para continuar.";

  const questions = [
    {
      key: "satisfaccion_general",
      title: "En general, ¿qué tan satisfecho estás con SIMPLE?",
      type: "scale",
      options: ["1", "2", "3", "4", "5"],
      lowLabel: "1 = Nada satisfecho",
      highLabel: "5 = Muy satisfecho",
    },
    {
      key: "calidad_agua",
      title: "¿Cómo calificas el sabor y la calidad del agua SIMPLE?",
      help: "Pensando en frescura, sabor y confianza al tomarla todos los días.",
      type: "choice",
      options: ["Excelente", "Buena", "Regular", "Mala"],
    },
    {
      key: "eventualidad_equipo_servicio",
      title: "En los últimos 3 meses, ¿tuviste alguna eventualidad con tu equipo o servicio?",
      type: "choice",
      options: [
        "No, todo ha funcionado bien",
        "Sí, pero fue atendida rápido",
        "Sí, pero tardaron en responder",
        "Sí, y aún no está resuelta",
      ],
    },
    {
      key: "tiempo_respuesta_soporte",
      title: "Si necesitaste soporte, ¿cómo calificas el tiempo de respuesta?",
      type: "choice",
      options: ["Excelente", "Bueno", "Regular", "Malo", "No he necesitado soporte"],
    },
    {
      key: "probabilidad_recomendacion",
      title: "¿Qué tan probable es que recomiendes SIMPLE a un familiar o amigo?",
      type: "scale",
      options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      lowLabel: "0 = Nada probable",
      highLabel: "10 = Muy probable",
    },
  ];

  const params = new URLSearchParams(window.location.search);
  const leadData = {
    codigo: getParam("codigo"),
    nombre: getParam("nombre"),
    asesor: getParam("asesor"),
    tecnico: getParam("tecnico"),
    zona: getParam("zona"),
    fecha_instalacion: getParam("fecha_instalacion"),
  };

  const state = {
    currentQuestion: 0,
    answers: {},
    codigo: leadData.codigo,
    nombre: leadData.nombre,
  };

  const startScreen = document.querySelector("#start-screen");
  const surveyScreen = document.querySelector("#survey-screen");
  const thanksScreen = document.querySelector("#thanks-screen");
  const clientCodePanel = document.querySelector("#client-code-panel");
  const clientCodeInput = document.querySelector("#client-code-input");
  const startButton = document.querySelector("#start-button");
  const startError = document.querySelector("#start-error");
  const progressLabel = document.querySelector("#progress-label");
  const progressFill = document.querySelector("#progress-fill");
  const codeChip = document.querySelector("#code-chip");
  const questionTitle = document.querySelector("#question-title");
  const questionHelp = document.querySelector("#question-help");
  const optionsGrid = document.querySelector("#options-grid");
  const questionError = document.querySelector("#question-error");
  const backButton = document.querySelector("#back-button");
  const nextButton = document.querySelector("#next-button");
  const submitButton = document.querySelector("#submit-button");
  const surveyForm = document.querySelector("#survey-form");
  const optionalComment = document.querySelector("#optional-comment");
  const improvementComment = document.querySelector("#improvement-comment");
  const restartButton = document.querySelector("#restart-button");
  const formActions = document.querySelector(".form-actions");

  setupInitialCode();
  renderQuestion();

  startButton.addEventListener("click", startSurvey);
  backButton.addEventListener("click", goBack);
  nextButton.addEventListener("click", goNext);
  surveyForm.addEventListener("submit", submitSurvey);
  restartButton.addEventListener("click", restartSurvey);

  function getParam(name) {
    return (params.get(name) || "").trim();
  }

  function setupInitialCode() {
    if (!leadData.codigo && !leadData.nombre) {
      return;
    }

    const label = leadData.codigo ? "Código precargado" : "Nombre precargado";
    const value = leadData.codigo || leadData.nombre;

    clientCodePanel.classList.add("is-prefilled");
    clientCodePanel.innerHTML = [
      `<span class="input-label">${label}</span>`,
      `<span class="prefilled-code">${escapeHtml(value)}</span>`,
    ].join("");
  }

  function startSurvey() {
    const typedCode = leadData.codigo;
    const typedName = leadData.nombre || clientCodeInput.value.trim();

    if (!typedCode && !typedName) {
      startError.textContent = "Por favor escribe tu nombre para continuar.";
      clientCodeInput.focus();
      return;
    }

    state.codigo = typedCode;
    state.nombre = typedName;
    startError.textContent = "";
    codeChip.textContent = state.codigo ? `Código: ${state.codigo}` : `Cliente: ${state.nombre}`;
    showScreen(surveyScreen);
    renderQuestion();
  }

  function renderQuestion() {
    const question = questions[state.currentQuestion];
    const questionNumber = state.currentQuestion + 1;
    const isLastQuestion = questionNumber === questions.length;

    progressLabel.textContent = `Pregunta ${questionNumber} de ${questions.length}`;
    progressFill.style.width = `${(questionNumber / questions.length) * 100}%`;
    questionTitle.textContent = question.title;
    questionHelp.textContent = question.help || "";
    optionsGrid.className =
      question.type === "scale" && question.options.length > 5
        ? "options-grid is-scale is-scale-wide"
        : question.type === "scale"
          ? "options-grid is-scale"
          : "options-grid";
    optionsGrid.innerHTML = "";
    questionError.textContent = "";

    question.options.forEach((option) => {
      const optionId = `${question.key}-${slugify(option)}`;
      const label = document.createElement("label");
      const input = document.createElement("input");
      const tile = document.createElement("span");

      input.className = "option-input";
      input.type = "radio";
      input.name = question.key;
      input.id = optionId;
      input.value = option;
      input.checked = state.answers[question.key] === option;
      input.addEventListener("change", () => {
        state.answers[question.key] = option;
        questionError.textContent = "";
      });

      tile.className = question.type === "scale" ? "option-tile option-tile--scale" : "option-tile";
      tile.textContent = option;

      label.append(input, tile);
      optionsGrid.append(label);
    });

    if (question.type === "scale") {
      const scaleLabels = document.createElement("div");
      scaleLabels.className = "scale-labels";
      scaleLabels.innerHTML = `<span>${question.lowLabel}</span><span>${question.highLabel}</span>`;
      optionsGrid.append(scaleLabels);
    }

    optionalComment.classList.toggle("is-visible", isLastQuestion);
    backButton.style.display = state.currentQuestion === 0 ? "none" : "inline-flex";
    nextButton.style.display = isLastQuestion ? "none" : "inline-flex";
    submitButton.style.display = isLastQuestion ? "inline-flex" : "none";
    formActions.classList.toggle("is-first", state.currentQuestion === 0);
    formActions.classList.toggle("has-submit", isLastQuestion);
    questionTitle.focus({ preventScroll: true });
  }

  function goNext() {
    if (!validateCurrentQuestion()) {
      return;
    }

    state.currentQuestion += 1;
    renderQuestion();
  }

  function goBack() {
    if (state.currentQuestion === 0) {
      return;
    }

    state.currentQuestion -= 1;
    renderQuestion();
  }

  async function submitSurvey(event) {
    event.preventDefault();

    if (!validateCurrentQuestion()) {
      return;
    }

    const payload = buildPayload();
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    questionError.textContent = "";

    try {
      await postSurvey(payload);
      showScreen(thanksScreen);
    } catch (error) {
      questionError.textContent =
        "No pudimos enviar tus respuestas. Por favor intenta de nuevo en unos segundos.";
      console.error("Error al enviar encuesta de satisfacción SIMPLE:", error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar respuestas";
    }
  }

  function validateCurrentQuestion() {
    const question = questions[state.currentQuestion];

    if (!state.answers[question.key]) {
      questionError.textContent = REQUIRED_MESSAGE;
      return false;
    }

    questionError.textContent = "";
    return true;
  }

  function buildPayload() {
    const payload = {
      fecha_respuesta: new Date().toISOString(),
      tipo_encuesta: "satisfaccion_servicio",
      sheet_name: "Satisfaccion Servicio",
      codigo: state.codigo,
      nombre: state.nombre,
      asesor: leadData.asesor,
      tecnico: leadData.tecnico,
      zona: leadData.zona,
      fecha_instalacion: leadData.fecha_instalacion,
      satisfaccion_general: Number(state.answers.satisfaccion_general),
      calidad_agua: state.answers.calidad_agua,
      eventualidad_equipo_servicio: state.answers.eventualidad_equipo_servicio,
      tiempo_respuesta_soporte: state.answers.tiempo_respuesta_soporte,
      probabilidad_recomendacion: Number(state.answers.probabilidad_recomendacion),
      comentario_mejora: improvementComment.value.trim(),
      user_agent: window.navigator.userAgent,
      url_origen: window.location.href,
    };

    payload.requiere_seguimiento = requiresFollowUp(payload);
    return payload;
  }

  function requiresFollowUp(response) {
    return (
      response.satisfaccion_general <= 3 ||
      ["Regular", "Mala"].includes(response.calidad_agua) ||
      ["Sí, pero tardaron en responder", "Sí, y aún no está resuelta"].includes(
        response.eventualidad_equipo_servicio
      ) ||
      ["Regular", "Malo"].includes(response.tiempo_respuesta_soporte) ||
      response.probabilidad_recomendacion <= 6
    );
  }

  async function postSurvey(payload) {
    if (!isWebhookConfigured()) {
      console.info("Webhook SIMPLE no configurado. Respuesta lista para enviar:", payload);
      return;
    }

    await fetch(SURVEY_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });
  }

  function isWebhookConfigured() {
    return Boolean(SURVEY_WEBHOOK_URL && SURVEY_WEBHOOK_URL !== WEBHOOK_PLACEHOLDER);
  }

  function showScreen(activeScreen) {
    [startScreen, surveyScreen, thanksScreen].forEach((screen) => {
      screen.classList.toggle("screen--active", screen === activeScreen);
    });

    activeScreen.scrollIntoView({ block: "start" });
  }

  function restartSurvey() {
    state.currentQuestion = 0;
    state.answers = {};
    improvementComment.value = "";
    document.querySelectorAll(".option-input").forEach((input) => {
      input.checked = false;
    });
    showScreen(startScreen);
    renderQuestion();
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
