(function () {
  const listEl = document.getElementById("goalList");
  const countEl = document.getElementById("resultCount");
  const progressFillEl = document.getElementById("progressFill");
  const progressLabelEl = document.getElementById("progressLabel");
  const todaysGoalEl = document.getElementById("todaysGoal");
  const filterGroups = document.querySelectorAll(".filter-group");
  const mapContainer = document.getElementById("mapContainer");
  const mapImage = document.getElementById("mapImage");
  const downloadGoalsBtn = document.getElementById("downloadGoalsBtn");

  let goals = [];
  let schemaDoc = [];

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

  // --- Campus map pin placement ---

  function closeMapPopover() {
    const existing = mapContainer.querySelector(".map-popover");
    if (existing) existing.remove();
  }

  function markDirty() {
    downloadGoalsBtn.hidden = false;
  }

  function renderPins() {
    mapContainer.querySelectorAll(".map-pin").forEach((el) => el.remove());

    goals
      .filter((g) => g.mapCoords)
      .forEach((goal) => {
        const pin = document.createElement("div");
        pin.className = "map-pin";
        pin.style.left = `${goal.mapCoords.x * 100}%`;
        pin.style.top = `${goal.mapCoords.y * 100}%`;
        pin.title = goal.title;
        pin.dataset.goalId = goal.id;
        mapContainer.appendChild(pin);
      });
  }

  function openAssignPopover(x, y, pixelX, pixelY) {
    closeMapPopover();

    const unplaced = goals.filter((g) => g.scope === "university" && !g.mapCoords);

    const popover = document.createElement("div");
    popover.className = "map-popover";
    popover.style.left = `${pixelX}px`;
    popover.style.top = `${pixelY}px`;

    if (!unplaced.length) {
      popover.innerHTML = `
        <h3>No unplaced campus goals</h3>
        <div class="map-popover-actions">
          <button type="button" data-action="cancel">Close</button>
        </div>
      `;
    } else {
      const options = unplaced
        .map((g) => `<option value="${g.id}">${g.title}</option>`)
        .join("");

      popover.innerHTML = `
        <h3>Pin this spot to...</h3>
        <select>${options}</select>
        <div class="map-popover-actions">
          <button type="button" data-action="cancel">Cancel</button>
          <button type="button" class="primary" data-action="save">Save pin</button>
        </div>
      `;
    }

    popover.addEventListener("click", (e) => e.stopPropagation());

    popover.querySelector('[data-action="cancel"]').addEventListener("click", closeMapPopover);

    const saveBtn = popover.querySelector('[data-action="save"]');
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const select = popover.querySelector("select");
        const goal = goals.find((g) => g.id === select.value);
        if (goal) {
          goal.mapCoords = { x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 };
          markDirty();
          renderPins();
        }
        closeMapPopover();
      });
    }

    mapContainer.appendChild(popover);
  }

  function openRemovePopover(goalId, pixelX, pixelY) {
    closeMapPopover();

    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const popover = document.createElement("div");
    popover.className = "map-popover";
    popover.style.left = `${pixelX}px`;
    popover.style.top = `${pixelY}px`;
    popover.innerHTML = `
      <h3>${goal.title}</h3>
      <div class="map-popover-actions">
        <button type="button" data-action="cancel">Close</button>
        <button type="button" class="primary" data-action="remove">Remove pin</button>
      </div>
    `;

    popover.addEventListener("click", (e) => e.stopPropagation());
    popover.querySelector('[data-action="cancel"]').addEventListener("click", closeMapPopover);
    popover.querySelector('[data-action="remove"]').addEventListener("click", () => {
      goal.mapCoords = null;
      markDirty();
      renderPins();
      closeMapPopover();
    });

    mapContainer.appendChild(popover);
  }

  mapContainer.addEventListener("click", (e) => {
    const pin = e.target.closest(".map-pin");
    const rect = mapImage.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;

    if (pin) {
      openRemovePopover(pin.dataset.goalId, pixelX, pixelY);
      return;
    }

    const x = Math.min(1, Math.max(0, pixelX / rect.width));
    const y = Math.min(1, Math.max(0, pixelY / rect.height));
    openAssignPopover(x, y, pixelX, pixelY);
  });

  document.addEventListener("click", (e) => {
    if (!mapContainer.contains(e.target)) closeMapPopover();
  });

  downloadGoalsBtn.addEventListener("click", () => {
    const output = JSON.stringify({ _schema: schemaDoc, goals }, null, 2) + "\n";
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "goals.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  fetch("goals.json")
    .then((res) => res.json())
    .then((data) => {
      goals = data.goals;
      schemaDoc = data._schema || [];
      renderTodaysGoal();
      render();
      renderPins();
    });
})();
