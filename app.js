(function () {
  const listEl = document.getElementById("goalList");
  const countEl = document.getElementById("resultCount");
  const progressFillEl = document.getElementById("progressFill");
  const progressLabelEl = document.getElementById("progressLabel");
  const todaysGoalEl = document.getElementById("todaysGoal");
  const filterGroups = document.querySelectorAll(".filter-group");
  const mapContainer = document.getElementById("mapContainer");
  const mapImage = document.getElementById("mapImage");
  const downloadPlacesBtn = document.getElementById("downloadPlacesBtn");
  const printBtn = document.getElementById("printBtn");
  const printChecklistEl = document.getElementById("printChecklist");

  printBtn.addEventListener("click", () => window.print());

  const PLACE_TAGS = ["study-space", "quiet", "busy", "fun"];

  let goals = [];
  let places = [];
  let placesSchemaDoc = [];
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
    return Object.entries(filters).every(([key, values]) => values.includes(goal[key]));
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

  // --- Campus map pins (places.json) ---

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function slugify(text) {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "place";

    let id = base;
    let n = 2;
    while (places.some((p) => p.id === id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    return id;
  }

  function closeMapPopover() {
    const existing = mapContainer.querySelector(".map-popover");
    if (existing) existing.remove();
  }

  function markDirty() {
    downloadPlacesBtn.hidden = false;
  }

  function renderPins() {
    mapContainer.querySelectorAll(".map-pin").forEach((el) => el.remove());

    places.forEach((place) => {
      const pin = document.createElement("div");
      pin.className = "map-pin";
      pin.style.left = `${place.coords.x * 100}%`;
      pin.style.top = `${place.coords.y * 100}%`;
      pin.title = place.title;
      pin.dataset.placeId = place.id;
      mapContainer.appendChild(pin);
    });
  }

  function tagCheckboxes(checkedTags) {
    return PLACE_TAGS.map((tag) => {
      const checked = checkedTags.includes(tag) ? "checked" : "";
      return `
        <label>
          <input type="checkbox" value="${tag}" ${checked}>
          <span>${tag.replace("-", " ")}</span>
        </label>
      `;
    }).join("");
  }

  function openPlaceForm({ pixelX, pixelY, existing, x, y }) {
    closeMapPopover();

    const popover = document.createElement("div");
    popover.className = "map-popover";
    popover.style.left = `${pixelX}px`;
    popover.style.top = `${pixelY}px`;

    popover.innerHTML = `
      <h3>${existing ? "Edit pin" : "New pin"}</h3>
      <label class="field-label">
        Title
        <input type="text" data-field="title" value="${existing ? escapeHtml(existing.title) : ""}" placeholder="e.g. MacKinnon Building">
      </label>
      <label class="field-label">
        Description
        <textarea data-field="description" rows="3" placeholder="How it felt, what you saw...">${existing ? escapeHtml(existing.description) : ""}</textarea>
      </label>
      <label class="field-label">Tags</label>
      <div class="map-popover-tags">${tagCheckboxes(existing ? existing.tags : [])}</div>
      <div class="map-popover-actions">
        <button type="button" data-action="cancel">Cancel</button>
        <button type="button" class="primary" data-action="save">Save pin</button>
      </div>
    `;

    popover.addEventListener("click", (e) => e.stopPropagation());
    popover.querySelector('[data-action="cancel"]').addEventListener("click", closeMapPopover);

    const titleInput = popover.querySelector('[data-field="title"]');
    const saveBtn = popover.querySelector('[data-action="save"]');

    saveBtn.addEventListener("click", () => {
      const title = titleInput.value.trim();
      if (!title) {
        titleInput.focus();
        return;
      }
      const description = popover.querySelector('[data-field="description"]').value.trim();
      const tags = [...popover.querySelectorAll('.map-popover-tags input:checked')].map((i) => i.value);

      if (existing) {
        existing.title = title;
        existing.description = description;
        existing.tags = tags;
      } else {
        places.push({
          id: slugify(title),
          title,
          description,
          tags,
          coords: { x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 },
        });
      }

      markDirty();
      renderPins();
      closeMapPopover();
    });

    mapContainer.appendChild(popover);
    titleInput.focus();
  }

  function openPlaceView(placeId, pixelX, pixelY) {
    closeMapPopover();

    const place = places.find((p) => p.id === placeId);
    if (!place) return;

    const popover = document.createElement("div");
    popover.className = "map-popover";
    popover.style.left = `${pixelX}px`;
    popover.style.top = `${pixelY}px`;

    const tagBadges = place.tags
      .map((tag) => `<span class="badge badge-tag">${tag.replace("-", " ")}</span>`)
      .join("");

    popover.innerHTML = `
      <h3>${escapeHtml(place.title)}</h3>
      ${place.description ? `<p>${escapeHtml(place.description)}</p>` : ""}
      ${tagBadges ? `<div class="place-tags">${tagBadges}</div>` : ""}
      <div class="map-popover-actions">
        <button type="button" data-action="delete">Delete</button>
        <button type="button" data-action="edit">Edit</button>
        <button type="button" class="primary" data-action="close">Close</button>
      </div>
    `;

    popover.addEventListener("click", (e) => e.stopPropagation());
    popover.querySelector('[data-action="close"]').addEventListener("click", closeMapPopover);
    popover.querySelector('[data-action="delete"]').addEventListener("click", () => {
      places = places.filter((p) => p.id !== place.id);
      markDirty();
      renderPins();
      closeMapPopover();
    });
    popover.querySelector('[data-action="edit"]').addEventListener("click", () => {
      openPlaceForm({ pixelX, pixelY, existing: place });
    });

    mapContainer.appendChild(popover);
  }

  mapContainer.addEventListener("click", (e) => {
    const pin = e.target.closest(".map-pin");
    const rect = mapImage.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;

    if (pin) {
      openPlaceView(pin.dataset.placeId, pixelX, pixelY);
      return;
    }

    const x = Math.min(1, Math.max(0, pixelX / rect.width));
    const y = Math.min(1, Math.max(0, pixelY / rect.height));
    openPlaceForm({ pixelX, pixelY, x, y });
  });

  document.addEventListener("click", (e) => {
    if (!mapContainer.contains(e.target)) closeMapPopover();
  });

  downloadPlacesBtn.addEventListener("click", () => {
    const output = JSON.stringify({ _schema: placesSchemaDoc, places }, null, 2) + "\n";
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "places.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  Promise.all([
    fetch("goals.json").then((res) => res.json()),
    fetch("places.json").then((res) => res.json()),
  ]).then(([goalsData, placesData]) => {
    goals = goalsData.goals;
    places = placesData.places;
    placesSchemaDoc = placesData._schema || [];
    renderTodaysGoal();
    render();
    renderPins();
  });
})();
