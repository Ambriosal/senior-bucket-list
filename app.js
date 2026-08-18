(function () {
  const listEl = document.getElementById("goalList");
  const countEl = document.getElementById("resultCount");
  const progressFillEl = document.getElementById("progressFill");
  const progressLabelEl = document.getElementById("progressLabel");
  const todaysGoalEl = document.getElementById("todaysGoal");
  const filterGroups = document.querySelectorAll(".filter-group");

  let goals = [];

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
    return Object.entries(filters).every(([key, values]) => values.includes(goal[key]));
  }

  function renderBadges(goal) {
    return `
      <span class="badge badge-scope-${goal.scope}">${goal.scope}</span>
      <span class="badge badge-effort">${goal.effort}</span>
      <span class="badge badge-status-${goal.status}">${goal.status.replace("-", " ")}</span>
    `;
  }

  function renderCard(goal) {
    const title = goal.link
      ? `<a href="${goal.link}" target="_blank" rel="noopener">${goal.title}</a>`
      : goal.title;

    return `
      <li class="goal-card">
        <h2>${title}</h2>
        <div class="badges">${renderBadges(goal)}</div>
        ${goal.notes ? `<p class="goal-notes">${goal.notes}</p>` : ""}
      </li>
    `;
  }

  function renderProgress(visible) {
    const completed = visible.filter((g) => g.status === "done").length;
    const percent = visible.length ? Math.round((completed / visible.length) * 100) : 0;

    progressFillEl.style.width = `${percent}%`;
    progressLabelEl.textContent = `${completed} of ${visible.length} completed (${percent}%)`;
  }

  function render() {
    const filters = getActiveFilters();
    const visible = goals.filter((g) => matchesFilters(g, filters));

    countEl.textContent = `${visible.length} of ${goals.length} goals`;
    renderProgress(visible);

    listEl.innerHTML = visible.length
      ? visible.map(renderCard).join("")
      : `<li class="empty-state">No goals match these filters.</li>`;
  }

  filterGroups.forEach((group) => {
    group.addEventListener("change", render);
  });

  fetch("goals.json")
    .then((res) => res.json())
    .then((data) => {
      goals = data.goals;
      renderTodaysGoal();
      render();
    });
})();
