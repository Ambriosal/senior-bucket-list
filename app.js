(function () {
  const listEl = document.getElementById("goalList");
  const countEl = document.getElementById("resultCount");
  const progressFillEl = document.getElementById("progressFill");
  const progressLabelEl = document.getElementById("progressLabel");
  const todaysGoalEl = document.getElementById("todaysGoal");
  const filterGroups = document.querySelectorAll(".filter-group");
  const printBtn = document.getElementById("printBtn");
  const printChecklistEl = document.getElementById("printChecklist");

  printBtn.addEventListener("click", () => window.print());

  let goals = [];
  const expandedIds = new Set();

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function pickTodaysGoal() {
    const incomplete = goals.filter((g) => g.status !== "done");
    if (!incomplete.length) return null;
    const seed = hashString(todayKey());
    return incomplete[seed % incomplete.length];
  }

  function renderTodaysGoal() {
    const goal = pickTodaysGoal();

    if (!goal) {
      todaysGoalEl.innerHTML = `
        <span class="todays-goal-badge">Today's Goal</span>
        <h2>All done!</h2>
        <p>Every goal on the list is complete.</p>
      `;
      return;
    }

    const title = goal.link
      ? `<a href="${goal.link}" target="_blank" rel="noopener">${goal.title}</a>`
      : goal.title;

    todaysGoalEl.innerHTML = `
      <span class="todays-goal-badge">Today's Goal</span>
      <h2>${title}</h2>
    `;
  }

  function getActiveFilters() {
    const active = {};
    filterGroups.forEach((group) => {
      const key = group.dataset.filterKey;
      const checked = [...group.querySelectorAll("input:checked")].map((i) => i.value);
      active[key] = checked;
    });
    return active;
  }

  function matchesFilters(goal, filters) {
    return Object.entries(filters).every(([key, values]) => values.length === 0 || values.includes(goal[key]));
  }

  const CATEGORY_LABELS = {
    "clubs-involvements": "Clubs & Involvements",
    academic: "Academic",
    volunteering: "Volunteering",
    seasonal: "Seasonal",
    city: "City",
  };

  function renderBadges(goal) {
    return `
      <span class="badge badge-category-${goal.category}">${CATEGORY_LABELS[goal.category] || goal.category}</span>
      <span class="badge badge-effort">${goal.effort}</span>
      <span class="badge badge-status-${goal.status}">${goal.status.replace("-", " ")}</span>
    `;
  }

  function renderCard(goal) {
    const title = goal.link
      ? `<a href="${goal.link}" target="_blank" rel="noopener">${goal.title}</a>`
      : goal.title;

    const expandedClass = expandedIds.has(goal.id) ? " expanded" : "";
    const notesHtml = goal.notes ? `<p class="goal-notes">${goal.notes}</p>` : "";
    const imageHtml = goal.imagePath
      ? `<img class="goal-image" src="${goal.imagePath}" alt="${goal.title}" loading="lazy">`
      : "";
    const expandBody = notesHtml || imageHtml
      ? notesHtml + imageHtml
      : `<p class="goal-notes-empty">No notes yet.</p>`;

    return `
      <li class="goal-card${expandedClass}" data-status="${goal.status}" data-goal-id="${goal.id}">
        <h2>${title}</h2>
        <div class="badges">${renderBadges(goal)}</div>
        <span class="expand-indicator" aria-hidden="true">&#9662;</span>
        <div class="goal-expand">
          <div class="goal-expand-inner">${expandBody}</div>
        </div>
      </li>
    `;
  }

  function renderProgress(visible) {
    const completed = visible.filter((g) => g.status === "done").length;
    const percent = visible.length ? Math.round((completed / visible.length) * 100) : 0;

    progressFillEl.style.width = `${percent}%`;
    progressLabelEl.textContent = `${completed} of ${visible.length} completed (${percent}%)`;
  }

  function groupByCategory(visible) {
    const groups = {};
    visible.forEach((goal) => {
      (groups[goal.category] = groups[goal.category] || []).push(goal);
    });
    return Object.keys(CATEGORY_LABELS).filter((category) => groups[category] && groups[category].length).map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      goals: groups[category],
    }));
  }

  function renderGoalGroups(visible) {
    return groupByCategory(visible)
      .map(
        (group) => `
          <section class="category-group">
            <h2 class="category-group-title category-group-title-${group.category}">${group.label}</h2>
            <ul class="goal-list">${group.goals.map(renderCard).join("")}</ul>
          </section>
        `
      )
      .join("");
  }

  function renderPrintChecklist(visible) {
    printChecklistEl.innerHTML = groupByCategory(visible)
      .map(
        (group) => `
          <div class="print-group">
            <h3 class="print-group-title">${group.label}</h3>
            <ul class="print-group-list">${group.goals.map(renderCard).join("")}</ul>
          </div>
        `
      )
      .join("");
  }

  function render() {
    const filters = getActiveFilters();
    const visible = goals.filter((g) => matchesFilters(g, filters));

    countEl.textContent = `${visible.length} of ${goals.length} goals`;
    renderProgress(visible);

    listEl.innerHTML = visible.length
      ? renderGoalGroups(visible)
      : `<p class="empty-state">No goals match these filters.</p>`;

    renderPrintChecklist(visible);
  }

  filterGroups.forEach((group) => {
    group.addEventListener("change", render);
  });

  listEl.addEventListener("click", (e) => {
    if (e.target.closest("a, button, input, textarea, select, label")) return;
    const card = e.target.closest(".goal-card");
    if (!card) return;

    const id = card.dataset.goalId;
    if (expandedIds.has(id)) {
      expandedIds.delete(id);
    } else {
      expandedIds.add(id);
    }
    card.classList.toggle("expanded");
  });

  fetch("goals.json")
    .then((res) => res.json())
    .then((goalsData) => {
      goals = goalsData.goals;
      renderTodaysGoal();
      render();
    });
})();
