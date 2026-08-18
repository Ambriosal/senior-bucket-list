(function () {
  const mapContainer = document.getElementById("mapContainer");
  const mapImage = document.getElementById("mapImage");
  const downloadPlacesBtn = document.getElementById("downloadPlacesBtn");

  const PLACE_TAGS = ["study-space", "quiet", "busy", "fun"];

  let places = [];
  let placesSchemaDoc = [];

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

  fetch("places.json")
    .then((res) => res.json())
    .then((placesData) => {
      places = placesData.places;
      placesSchemaDoc = placesData._schema || [];
      renderPins();
    });
})();
