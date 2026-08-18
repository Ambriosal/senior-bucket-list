(function () {
  const downloadBtn = document.getElementById("downloadBtn");
  const statusEl = document.getElementById("mitStatus");

  const STANDALONE_CSS = `
    :root {
      --color-bg: #FBF7F1;
      --color-text: #2B2620;
      --color-accent: #BF3A3A;
      --color-accent-2: #DC9E41;
      --color-card-bg: #FFFFFF;
      --color-border: #EDE4D6;
      --color-muted: #8A7C68;
      --color-cat-clubs-involvements: #4C8C86;
      --color-cat-academic: #6B8F71;
      --color-cat-volunteering: #8A6FA3;
      --color-cat-seasonal: #C77B3C;
      --color-cat-city: #7C8CA6;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0 1.5rem 3rem;
      background: var(--color-bg);
      color: var(--color-text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
    }
    .page-header { max-width: 900px; margin: 0 auto; padding: 2.5rem 0 1.5rem; text-align: center; }
    .page-header h1 { margin: 0 0 0.4rem; font-size: 2rem; }
    .subtitle { margin: 0 0 1rem; color: var(--color-muted); }
    .print-btn {
      display: inline-block; padding: 0.45rem 1.1rem; border-radius: 20px;
      border: 1px solid var(--color-border); background: var(--color-card-bg);
      color: var(--color-text); font-size: 0.85rem; cursor: pointer; font-family: inherit;
    }
    .print-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
    main { max-width: 900px; margin: 0 auto; }
    .todays-goal {
      background: var(--color-card-bg); border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-accent-2); border-radius: 16px;
      padding: 1.1rem 1.25rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.4rem;
    }
    .todays-goal-badge {
      display: inline-block; align-self: flex-start; padding: 0.2rem 0.75rem; border-radius: 20px;
      background: var(--color-accent-2); color: #fff; font-size: 0.72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .todays-goal h2 { margin: 0; font-size: 1.2rem; }
    .todays-goal p { margin: 0; color: var(--color-muted); font-size: 0.9rem; }
    .progress { margin-bottom: 1rem; }
    .progress-track { width: 100%; height: 14px; background: var(--color-border); border-radius: 20px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: var(--color-accent); border-radius: 20px; transition: width 0.25s ease; }
    .progress-label { margin: 0.5rem 0 0 0.25rem; font-size: 0.9rem; color: var(--color-muted); }
    .filters {
      display: flex; flex-wrap: wrap; gap: 1.5rem; padding: 1.25rem;
      background: var(--color-card-bg); border: 1px solid var(--color-border); border-radius: 16px; margin-bottom: 1rem;
    }
    .filter-group { border: none; margin: 0; padding: 0; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .filter-group legend {
      font-size: 0.8rem; font-weight: 600; color: var(--color-muted); text-transform: uppercase;
      letter-spacing: 0.03em; padding: 0; margin-right: 0.25rem;
    }
    .filter-pill {
      display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.85rem;
      border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem;
      cursor: pointer; background: var(--color-bg); transition: background 0.15s ease, border-color 0.15s ease;
    }
    .filter-pill:has(input:checked) { background: var(--color-accent); border-color: var(--color-accent); color: #fff; }
    .filter-pill input { margin: 0; accent-color: var(--color-accent); }
    .result-count { color: var(--color-muted); font-size: 0.9rem; margin: 0 0 1rem 0.25rem; }
    .category-group { margin-bottom: 2rem; }
    .category-group:last-child { margin-bottom: 0; }
    .category-group-title {
      margin: 0 0 0.75rem; padding-bottom: 0.4rem; font-size: 1.15rem; border-bottom: 2px solid var(--color-border);
    }
    .category-group-title-clubs-involvements { border-bottom-color: var(--color-cat-clubs-involvements); }
    .category-group-title-academic { border-bottom-color: var(--color-cat-academic); }
    .category-group-title-volunteering { border-bottom-color: var(--color-cat-volunteering); }
    .category-group-title-seasonal { border-bottom-color: var(--color-cat-seasonal); }
    .category-group-title-city { border-bottom-color: var(--color-cat-city); }
    .goal-list {
      list-style: none; margin: 0; padding: 0; display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem;
    }
    .goal-card {
      position: relative; background: var(--color-card-bg); border: 1px solid var(--color-border);
      border-radius: 16px; padding: 1.1rem; padding-right: 2.4rem; display: flex; flex-direction: column;
      gap: 0.6rem; cursor: pointer; transition: border-color 0.15s ease;
    }
    .goal-card:hover { border-color: var(--color-accent); }
    .goal-card.goal-form { cursor: default; }
    .goal-card h2 { margin: 0; font-size: 1.05rem; line-height: 1.35; }
    .goal-card h2 a { color: inherit; text-decoration: none; border-bottom: 1px dashed var(--color-accent); }
    .goal-card h2 a:hover { color: var(--color-accent); }
    .badges { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .badge {
      display: inline-block; padding: 0.2rem 0.7rem; border-radius: 20px; font-size: 0.72rem;
      font-weight: 600; color: #fff; text-transform: capitalize; border: none; font-family: inherit;
    }
    button.badge { cursor: pointer; }
    .badge-category-clubs-involvements { background: var(--color-cat-clubs-involvements); }
    .badge-category-academic { background: var(--color-cat-academic); }
    .badge-category-volunteering { background: var(--color-cat-volunteering); }
    .badge-category-seasonal { background: var(--color-cat-seasonal); }
    .badge-category-city { background: var(--color-cat-city); }
    .badge-effort { background: var(--color-muted); }
    .badge-status-not-started { background: var(--color-border); color: var(--color-muted); }
    .badge-status-in-progress { background: var(--color-accent-2); }
    .badge-status-done { background: var(--color-accent); }
    .goal-notes {
      width: 100%; resize: vertical; min-height: 2.2rem; padding: 0.4rem 0.5rem;
      border-radius: 8px; border: 1px solid var(--color-border); font-size: 0.82rem;
      font-family: inherit; color: var(--color-text); background: var(--color-bg);
    }
    .goal-actions { display: flex; gap: 0.75rem; }
    .goal-actions button {
      background: none; border: none; padding: 0; font-size: 0.78rem; font-family: inherit;
      color: var(--color-muted); cursor: pointer; text-decoration: underline;
    }
    .goal-actions button:hover { color: var(--color-accent); }
    .expand-indicator {
      position: absolute; top: 1.1rem; right: 1.1rem; color: var(--color-muted);
      transition: transform 0.25s ease;
    }
    .goal-card.expanded .expand-indicator { transform: rotate(180deg); }
    .goal-expand { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
    .goal-card.expanded .goal-expand { grid-template-rows: 1fr; }
    .goal-expand-inner { overflow: hidden; display: flex; flex-direction: column; gap: 0.6rem; }
    .goal-notes-empty { margin: 0; color: var(--color-muted); font-size: 0.85rem; font-style: italic; }
    .goal-image { width: 100%; max-height: 220px; object-fit: cover; border-radius: 10px; display: block; }
    .photo-upload-label {
      display: inline-block; align-self: flex-start; padding: 0.35rem 0.9rem; border-radius: 20px;
      border: 1px solid var(--color-border); background: var(--color-bg); font-size: 0.78rem;
      cursor: pointer; color: var(--color-muted);
    }
    .photo-upload-label:hover { border-color: var(--color-accent); color: var(--color-accent); }
    .storage-meter { margin-bottom: 1rem; }
    .storage-track { width: 100%; height: 8px; background: var(--color-border); border-radius: 20px; overflow: hidden; }
    .storage-fill { height: 100%; width: 0%; background: var(--color-cat-academic); border-radius: 20px; transition: width 0.25s ease, background 0.25s ease; }
    .storage-fill.storage-fill-warning { background: var(--color-accent); }
    .storage-label { margin: 0.4rem 0 0 0.25rem; font-size: 0.78rem; color: var(--color-muted); }
    .add-goal-bar { margin-bottom: 1rem; }
    .goal-form { gap: 0.55rem; }
    .goal-form .field-label {
      display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.72rem; font-weight: 600;
      color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.03em;
    }
    .goal-form input, .goal-form select {
      padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--color-border);
      font-size: 0.85rem; font-family: inherit; color: var(--color-text);
      text-transform: none; font-weight: 400; letter-spacing: normal;
    }
    .goal-form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.2rem; }
    .goal-form-actions button {
      padding: 0.35rem 0.9rem; border-radius: 20px; border: 1px solid var(--color-border);
      background: var(--color-bg); font-size: 0.8rem; cursor: pointer; font-family: inherit;
    }
    .goal-form-actions button.primary { background: var(--color-accent); border-color: var(--color-accent); color: #fff; }
    .empty-state { text-align: center; color: var(--color-muted); padding: 2.5rem 1rem; }
    .print-checklist { display: none; }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .print-btn, .todays-goal, .progress, .storage-meter, .filters, .result-count, #goalList, .add-goal-bar { display: none !important; }
      .page-header { padding: 0 0 1rem; text-align: left; }
      .print-checklist { display: block; }
      .print-group { margin-top: 1.5rem; }
      .print-group:first-child { margin-top: 0; }
      .print-group-title {
        margin: 0 0 0.3rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.06em; color: #555; border-bottom: 1px solid #999; padding-bottom: 0.25rem;
      }
      .print-group-list { list-style: none; margin: 0; padding: 0; }
      .goal-card {
        display: block; background: transparent; border: none;
        border-bottom: 1px solid #ccc; border-radius: 0; padding: 0.4rem 0; break-inside: avoid;
      }
      .goal-card h2 { font-size: 1rem; font-weight: 400; margin: 0; }
      .goal-card h2::before { content: "\\2610  "; }
      .goal-card[data-status="done"] h2::before { content: "\\2611  "; }
      .goal-card .badges, .goal-card .expand-indicator, .goal-card .photo-upload-label, .goal-card .goal-expand { display: none; }
      .goal-card .goal-actions { display: none; }
      .goal-card h2 a { color: inherit; text-decoration: underline; }
    }
  `;

  const STANDALONE_BODY = `
    <header class="page-header">
      <h1>My Senior Year Bucket List</h1>
      <p class="subtitle">Your own copy — progress is saved in this browser only.</p>
      <button type="button" id="printBtn" class="print-btn">Print / Save as PDF</button>
    </header>
    <main>
      <section class="todays-goal" id="todaysGoal" aria-label="Today's goal"></section>
      <section class="progress" aria-label="Progress">
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
        <p class="progress-label" id="progressLabel"></p>
      </section>
      <section class="storage-meter" aria-label="Browser storage used">
        <div class="storage-track"><div class="storage-fill" id="storageFill"></div></div>
        <p class="storage-label" id="storageLabel"></p>
      </section>
      <section class="filters" aria-label="Filter goals">
        <fieldset class="filter-group" data-filter-key="category">
          <legend>Category</legend>
          <label class="filter-pill"><input type="checkbox" value="clubs-involvements" checked><span>Clubs &amp; Involvements</span></label>
          <label class="filter-pill"><input type="checkbox" value="academic" checked><span>Academic</span></label>
          <label class="filter-pill"><input type="checkbox" value="volunteering" checked><span>Volunteering</span></label>
          <label class="filter-pill"><input type="checkbox" value="seasonal" checked><span>Seasonal</span></label>
          <label class="filter-pill"><input type="checkbox" value="city" checked><span>City</span></label>
        </fieldset>
        <fieldset class="filter-group" data-filter-key="frequency">
          <legend>Frequency</legend>
          <label class="filter-pill"><input type="checkbox" value="one-time" checked><span>One-time</span></label>
          <label class="filter-pill"><input type="checkbox" value="ongoing" checked><span>Ongoing</span></label>
        </fieldset>
        <fieldset class="filter-group" data-filter-key="effort">
          <legend>Effort</legend>
          <label class="filter-pill"><input type="checkbox" value="simple" checked><span>Simple</span></label>
          <label class="filter-pill"><input type="checkbox" value="complex" checked><span>Complex</span></label>
        </fieldset>
        <fieldset class="filter-group" data-filter-key="status">
          <legend>Status</legend>
          <label class="filter-pill"><input type="checkbox" value="not-started" checked><span>Not Started</span></label>
          <label class="filter-pill"><input type="checkbox" value="in-progress" checked><span>In Progress</span></label>
          <label class="filter-pill"><input type="checkbox" value="done" checked><span>Done</span></label>
        </fieldset>
      </section>
      <p class="result-count" id="resultCount"></p>
      <div class="add-goal-bar"><button type="button" id="addGoalBtn" class="print-btn">+ Add a goal</button></div>
      <div id="goalList" aria-live="polite"></div>
      <div class="print-checklist" id="printChecklist"></div>
    </main>
  `;

  // Everything inside this function becomes the downloaded file's inline <script>.
  // It must be fully self-contained: no references outside its own body, and it
  // reads a `GOALS` constant that gets embedded above it in the generated file.
  function standaloneApp() {
    var STORAGE_KEY = "senior-bucket-list-goals";
    var STATUS_CYCLE = ["not-started", "in-progress", "done"];
    var CATEGORY_LABELS = {
      "clubs-involvements": "Clubs & Involvements",
      academic: "Academic",
      volunteering: "Volunteering",
      seasonal: "Seasonal",
      city: "City",
    };
    var FREQUENCY_LABELS = { "one-time": "One-time", ongoing: "Ongoing" };
    var EFFORT_LABELS = { simple: "Simple", complex: "Complex" };

    var STORAGE_LIMIT_BYTES = 5 * 1024 * 1024;
    var MAX_PHOTO_BYTES = 3 * 1024 * 1024;

    var listEl = document.getElementById("goalList");
    var countEl = document.getElementById("resultCount");
    var progressFillEl = document.getElementById("progressFill");
    var progressLabelEl = document.getElementById("progressLabel");
    var storageFillEl = document.getElementById("storageFill");
    var storageLabelEl = document.getElementById("storageLabel");
    var todaysGoalEl = document.getElementById("todaysGoal");
    var printChecklistEl = document.getElementById("printChecklist");
    var printBtn = document.getElementById("printBtn");
    var addGoalBtn = document.getElementById("addGoalBtn");
    var filterGroups = document.querySelectorAll(".filter-group");

    var isAdding = false;
    var editingId = null;
    var expandedIds = {};

    printBtn.addEventListener("click", function () {
      window.print();
    });

    function escapeHtml(str) {
      var div = document.createElement("div");
      div.textContent = str == null ? "" : String(str);
      return div.innerHTML;
    }

    function loadGoals() {
      try {
        var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (Array.isArray(stored)) return stored;
      } catch (e) {}
      return GOALS.map(function (g) {
        return Object.assign({}, g, { status: "not-started", notes: "", imagePath: null });
      });
    }

    function saveGoals() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
        return true;
      } catch (e) {
        return false;
      }
    }

    var goals = loadGoals();

    function slugify(text) {
      var base = text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "goal";
      var id = base;
      var n = 2;
      while (goals.some(function (g) { return g.id === id; })) {
        id = base + "-" + n;
        n += 1;
      }
      return id;
    }

    function nextStatus(s) {
      return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % STATUS_CYCLE.length];
    }

    function todayKey() {
      var d = new Date();
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var day = String(d.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + day;
    }

    function hashString(str) {
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    }

    function pickTodaysGoalId() {
      var incomplete = goals.filter(function (g) {
        return g.status !== "done";
      });
      if (!incomplete.length) return null;
      var seed = hashString(todayKey());
      return incomplete[seed % incomplete.length].id;
    }

    var todaysGoalId = pickTodaysGoalId();

    function renderTodaysGoal() {
      var goal = todaysGoalId
        ? goals.filter(function (g) { return g.id === todaysGoalId; })[0]
        : null;

      if (!goal) {
        todaysGoalId = pickTodaysGoalId();
        goal = todaysGoalId ? goals.filter(function (g) { return g.id === todaysGoalId; })[0] : null;
      }

      if (!goal) {
        todaysGoalEl.innerHTML =
          '<span class="todays-goal-badge">Today\'s Goal</span><h2>All done!</h2><p>Every goal on the list is complete.</p>';
        return;
      }

      var title = goal.link
        ? '<a href="' + escapeHtml(goal.link) + '" target="_blank" rel="noopener">' + escapeHtml(goal.title) + "</a>"
        : escapeHtml(goal.title);
      var doneNote = goal.status === "done" ? "<p>Nice, you already did this one.</p>" : "";
      todaysGoalEl.innerHTML =
        '<span class="todays-goal-badge">Today\'s Goal</span><h2>' + title + "</h2>" + doneNote;
    }

    function getActiveFilters() {
      var active = {};
      filterGroups.forEach(function (group) {
        var key = group.dataset.filterKey;
        var checked = [].slice.call(group.querySelectorAll("input:checked")).map(function (i) {
          return i.value;
        });
        active[key] = checked;
      });
      return active;
    }

    function matchesFilters(goal, filters) {
      return Object.keys(filters).every(function (key) {
        return filters[key].length === 0 || filters[key].indexOf(goal[key]) !== -1;
      });
    }

    function renderBadges(goal) {
      var categoryLabel = CATEGORY_LABELS[goal.category] || goal.category;
      return (
        '<span class="badge badge-category-' + goal.category + '">' + categoryLabel + "</span>" +
        '<span class="badge badge-effort">' + goal.effort + "</span>" +
        '<button type="button" class="badge badge-status-' + goal.status + '" data-action="cycle-status" data-goal-id="' + goal.id + '" title="Click to change status">' +
          goal.status.replace("-", " ") +
        "</button>"
      );
    }

    function renderPhotoArea(goal) {
      if (goal.imagePath) {
        return (
          '<img class="goal-image" src="' + goal.imagePath + '" alt="' + escapeHtml(goal.title) + '">' +
          '<div class="goal-actions"><button type="button" data-action="remove-photo" data-goal-id="' + goal.id + '">Remove photo</button></div>'
        );
      }
      return (
        '<label class="photo-upload-label">+ Add a photo' +
          '<input type="file" accept="image/*" data-action="upload-photo" data-goal-id="' + goal.id + '" hidden>' +
        "</label>"
      );
    }

    function renderCard(goal) {
      var title = goal.link
        ? '<a href="' + escapeHtml(goal.link) + '" target="_blank" rel="noopener">' + escapeHtml(goal.title) + "</a>"
        : escapeHtml(goal.title);

      var expandedClass = expandedIds[goal.id] ? " expanded" : "";

      return (
        '<li class="goal-card' + expandedClass + '" data-status="' + goal.status + '" data-goal-id="' + goal.id + '">' +
          "<h2>" + title + "</h2>" +
          '<div class="badges">' + renderBadges(goal) + "</div>" +
          '<span class="expand-indicator" aria-hidden="true">&#9662;</span>' +
          '<div class="goal-expand"><div class="goal-expand-inner">' +
            '<textarea class="goal-notes" data-action="notes" data-goal-id="' + goal.id + '" placeholder="Add a note...">' + escapeHtml(goal.notes) + "</textarea>" +
            renderPhotoArea(goal) +
            '<div class="goal-actions">' +
              '<button type="button" data-action="edit-goal" data-goal-id="' + goal.id + '">Edit</button>' +
              '<button type="button" data-action="delete-goal" data-goal-id="' + goal.id + '">Delete</button>' +
            "</div>" +
          "</div></div>" +
        "</li>"
      );
    }

    function optionsHtml(labels, selected) {
      return Object.keys(labels)
        .map(function (value) {
          return '<option value="' + value + '"' + (value === selected ? " selected" : "") + ">" + labels[value] + "</option>";
        })
        .join("");
    }

    function renderGoalForm(existing) {
      return (
        '<li class="goal-card goal-form">' +
          '<label class="field-label">Title<input type="text" data-field="title" value="' + (existing ? escapeHtml(existing.title) : "") + '" placeholder="e.g. Try the new taco place"></label>' +
          '<label class="field-label">Category<select data-field="category">' + optionsHtml(CATEGORY_LABELS, existing ? existing.category : "clubs-involvements") + "</select></label>" +
          '<label class="field-label">Frequency<select data-field="frequency">' + optionsHtml(FREQUENCY_LABELS, existing ? existing.frequency : "one-time") + "</select></label>" +
          '<label class="field-label">Effort<select data-field="effort">' + optionsHtml(EFFORT_LABELS, existing ? existing.effort : "simple") + "</select></label>" +
          '<label class="field-label">Link (optional)<input type="text" data-field="link" value="' + (existing && existing.link ? escapeHtml(existing.link) : "") + '" placeholder="https://..."></label>' +
          '<div class="goal-form-actions">' +
            '<button type="button" data-action="cancel-form">Cancel</button>' +
            '<button type="button" class="primary" data-action="save-form" data-goal-id="' + (existing ? existing.id : "") + '">Save</button>' +
          "</div>" +
        "</li>"
      );
    }

    function renderProgress(visible) {
      var completed = visible.filter(function (g) {
        return g.status === "done";
      }).length;
      var percent = visible.length ? Math.round((completed / visible.length) * 100) : 0;
      progressFillEl.style.width = percent + "%";
      progressLabelEl.textContent = completed + " of " + visible.length + " completed (" + percent + "%)";
    }

    function renderStorageMeter() {
      var bytes = new Blob([JSON.stringify(goals)]).size;
      var percent = Math.min(100, Math.round((bytes / STORAGE_LIMIT_BYTES) * 100));
      var mb = (bytes / (1024 * 1024)).toFixed(2);

      storageFillEl.style.width = percent + "%";
      storageFillEl.classList.toggle("storage-fill-warning", percent >= 80);

      var label = mb + " MB of about 5 MB of browser storage used";
      if (percent >= 80) {
        label += " — getting close to the limit. Consider removing a photo or two.";
      }
      storageLabelEl.textContent = label;
    }

    function groupByCategory(visible) {
      var groups = {};
      visible.forEach(function (goal) {
        groups[goal.category] = groups[goal.category] || [];
        groups[goal.category].push(goal);
      });
      return Object.keys(CATEGORY_LABELS)
        .filter(function (category) {
          return groups[category] && groups[category].length;
        })
        .map(function (category) {
          return { category: category, label: CATEGORY_LABELS[category], goals: groups[category] };
        });
    }

    function renderGoalGroups(visible) {
      return groupByCategory(visible)
        .map(function (group) {
          var itemsHtml = group.goals
            .map(function (g) {
              return editingId === g.id ? renderGoalForm(g) : renderCard(g);
            })
            .join("");
          return (
            '<section class="category-group"><h2 class="category-group-title category-group-title-' + group.category + '">' +
              group.label +
            "</h2><ul class=\"goal-list\">" + itemsHtml + "</ul></section>"
          );
        })
        .join("");
    }

    function renderPrintChecklist(visible) {
      printChecklistEl.innerHTML = groupByCategory(visible)
        .map(function (group) {
          return (
            '<div class="print-group"><h3 class="print-group-title">' + group.label + "</h3>" +
            '<ul class="print-group-list">' + group.goals.map(renderCard).join("") + "</ul></div>"
          );
        })
        .join("");
    }

    function render() {
      var filters = getActiveFilters();
      var visible = goals.filter(function (g) {
        return matchesFilters(g, filters);
      });

      countEl.textContent = visible.length + " of " + goals.length + " goals";
      renderProgress(visible);
      renderStorageMeter();

      var addFormHtml = isAdding ? '<ul class="goal-list">' + renderGoalForm(null) + "</ul>" : "";
      var groupsHtml = renderGoalGroups(visible);

      listEl.innerHTML = addFormHtml + groupsHtml || '<p class="empty-state">No goals match these filters.</p>';

      renderPrintChecklist(visible);
      renderTodaysGoal();
    }

    function readFormFields(li) {
      return {
        title: li.querySelector('[data-field="title"]').value.trim(),
        category: li.querySelector('[data-field="category"]').value,
        frequency: li.querySelector('[data-field="frequency"]').value,
        effort: li.querySelector('[data-field="effort"]').value,
        link: li.querySelector('[data-field="link"]').value.trim() || null,
      };
    }

    filterGroups.forEach(function (group) {
      group.addEventListener("change", render);
    });

    addGoalBtn.addEventListener("click", function () {
      isAdding = true;
      editingId = null;
      render();
    });

    listEl.addEventListener("click", function (e) {
      var statusBtn = e.target.closest('[data-action="cycle-status"]');
      if (statusBtn) {
        var goal = goals.filter(function (g) { return g.id === statusBtn.dataset.goalId; })[0];
        goal.status = nextStatus(goal.status);
        saveGoals();
        render();
        return;
      }

      var editBtn = e.target.closest('[data-action="edit-goal"]');
      if (editBtn) {
        isAdding = false;
        editingId = editBtn.dataset.goalId;
        render();
        return;
      }

      var deleteBtn = e.target.closest('[data-action="delete-goal"]');
      if (deleteBtn) {
        if (window.confirm("Delete this goal? This can't be undone.")) {
          goals = goals.filter(function (g) { return g.id !== deleteBtn.dataset.goalId; });
          if (editingId === deleteBtn.dataset.goalId) editingId = null;
          saveGoals();
          render();
        }
        return;
      }

      var cancelBtn = e.target.closest('[data-action="cancel-form"]');
      if (cancelBtn) {
        isAdding = false;
        editingId = null;
        render();
        return;
      }

      var saveBtn = e.target.closest('[data-action="save-form"]');
      if (saveBtn) {
        var li = saveBtn.closest(".goal-form");
        var fields = readFormFields(li);
        if (!fields.title) {
          li.querySelector('[data-field="title"]').focus();
          return;
        }

        if (saveBtn.dataset.goalId) {
          var existing = goals.filter(function (g) { return g.id === saveBtn.dataset.goalId; })[0];
          Object.assign(existing, fields);
          editingId = null;
        } else {
          goals.push(Object.assign({ id: slugify(fields.title), status: "not-started", notes: "", imagePath: null }, fields));
          isAdding = false;
        }
        saveGoals();
        render();
        return;
      }

      var removePhotoBtn = e.target.closest('[data-action="remove-photo"]');
      if (removePhotoBtn) {
        var photoGoal = goals.filter(function (g) { return g.id === removePhotoBtn.dataset.goalId; })[0];
        photoGoal.imagePath = null;
        saveGoals();
        render();
        return;
      }

      if (e.target.closest("a, button, input, textarea, select, label")) return;

      var card = e.target.closest(".goal-card");
      if (!card || card.classList.contains("goal-form")) return;

      var cardId = card.dataset.goalId;
      if (expandedIds[cardId]) {
        delete expandedIds[cardId];
      } else {
        expandedIds[cardId] = true;
      }
      card.classList.toggle("expanded");
    });

    function handlePhotoUpload(input) {
      var file = input.files && input.files[0];
      if (!file) return;

      if (file.type.indexOf("image/") !== 0) {
        window.alert("Please choose an image file.");
        input.value = "";
        return;
      }

      if (file.size > MAX_PHOTO_BYTES) {
        var tooBig = window.confirm(
          "That photo is " + (file.size / (1024 * 1024)).toFixed(1) + " MB — large photos can fill up your " +
          "browser's storage quickly. Add it anyway?"
        );
        if (!tooBig) {
          input.value = "";
          return;
        }
      }

      var reader = new FileReader();
      reader.onload = function () {
        var goal = goals.filter(function (g) { return g.id === input.dataset.goalId; })[0];
        var previous = goal.imagePath;
        goal.imagePath = reader.result;
        var ok = saveGoals();
        if (!ok) {
          goal.imagePath = previous;
          window.alert("Couldn't save that photo — your browser's storage is full. Try removing another photo first.");
        }
        render();
      };
      reader.onerror = function () {
        window.alert("Couldn't read that file. Try a different photo.");
      };
      reader.readAsDataURL(file);
    }

    listEl.addEventListener("change", function (e) {
      var ta = e.target.closest('[data-action="notes"]');
      if (ta) {
        var goal = goals.filter(function (g) {
          return g.id === ta.dataset.goalId;
        })[0];
        goal.notes = ta.value;
        saveGoals();
        return;
      }

      var fileInput = e.target.closest('[data-action="upload-photo"]');
      if (fileInput) {
        handlePhotoUpload(fileInput);
      }
    });

    render();
  }

  function buildStandaloneHtml(goalsFromSource) {
    const strippedGoals = goalsFromSource.map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      frequency: g.frequency,
      effort: g.effort,
      link: g.link,
    }));

    let scriptBody = standaloneApp.toString();
    scriptBody = scriptBody.slice(scriptBody.indexOf("{") + 1, scriptBody.lastIndexOf("}"));

    return (
      "<!DOCTYPE html>\n" +
      '<html lang="en">\n' +
      "<head>\n" +
      '<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      "<title>My Senior Year Bucket List</title>\n" +
      "<style>" + STANDALONE_CSS + "</style>\n" +
      "</head>\n" +
      "<body>\n" +
      STANDALONE_BODY + "\n" +
      "<script>\n" +
      "var GOALS = " + JSON.stringify(strippedGoals) + ";\n" +
      "(function () {" + scriptBody + "})();\n" +
      "</" + "script>\n" +
      "</body>\n" +
      "</html>\n"
    );
  }

  downloadBtn.addEventListener("click", () => {
    statusEl.textContent = "Building your copy...";
    fetch("goals.json")
      .then((res) => res.json())
      .then((data) => {
        const html = buildStandaloneHtml(data.goals);
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-senior-bucket-list.html";
        a.click();
        URL.revokeObjectURL(url);
        statusEl.textContent = "Downloaded — open the file in any browser.";
      })
      .catch(() => {
        statusEl.textContent = "Something went wrong building your copy. Try again?";
      });
  });
})();
