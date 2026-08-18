(function () {
  const listEl = document.getElementById("goalList");
  const countEl = document.getElementById("resultCount");
  const filterGroups = document.querySelectorAll(".filter-group");

  let goals = [];

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

  function render() {
    const filters = getActiveFilters();
    const visible = goals.filter((g) => matchesFilters(g, filters));

    countEl.textContent = `${visible.length} of ${goals.length} goals`;

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
      render();
    });
})();
