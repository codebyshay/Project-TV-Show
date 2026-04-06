// DOM ELEMENTS
const showsRoot = document.getElementById("showsRoot");
const showSelect = document.getElementById("showSelect");
const backToShows = document.getElementById("backToShows");
const showSearchInput = document.getElementById("showSearchInput");
const root = document.getElementById("root");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const episodeSelect = document.getElementById("episodeSelect");
const showResultsCount = document.getElementById("showResultsCount");

// STATE
let allShows = [];
let allEpisodes = [];
const episodeCache = {};

// INITIAL UI 
root.innerHTML = "<p>Loading shows...</p>";
showsRoot.innerHTML = "";

// ===================== FETCH SHOWS (ONLY ONCE) =====================
fetch("https://api.tvmaze.com/shows")
  .then((res) => res.json())
  .then((shows) => {
    allShows = shows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    populateShowDropdown(allShows);
    renderShows(allShows);
  })
  .catch((err) => {
    showsRoot.innerHTML =
      "<p class='error'>Failed to load shows. Please refresh.</p>";
    console.error(err);
  });

// ===================== RENDER SHOWS =====================
function renderShows(shows) {
  showsRoot.innerHTML = "";

  // 👇 UPDATE COUNTER HERE
  showResultsCount.textContent =
    `Displaying ${shows.length} / ${allShows.length} shows`;

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.className = "show-card";

    card.innerHTML = `
      <h2>${show.name}</h2>
      <img src="${show.image?.medium || ""}" alt="${show.name}">
      <p>${show.summary || "No summary available."}</p>
      <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
      <p><strong>Status:</strong> ${show.status}</p>
      <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
      <p><strong>Runtime:</strong> ${show.runtime || "N/A"}</p>
    `;

    card.addEventListener("click", () => loadShowEpisodes(show.id));

    showsRoot.appendChild(card);
  });
}

// ===================== SHOW SEARCH =====================
showSearchInput.addEventListener("input", () => {
  const term = showSearchInput.value.toLowerCase();

  const filtered = allShows.filter((show) => {
    return (
      show.name.toLowerCase().includes(term) ||
      show.genres.join(" ").toLowerCase().includes(term) ||
      (show.summary || "").toLowerCase().includes(term)
    );
  });

  renderShows(filtered);
});

// ===================== LOAD EPISODES =====================
function loadShowEpisodes(showId) {
  showsRoot.style.display = "none";
  root.style.display = "block";

  searchInput.value = "";
  resultsCount.textContent = "";
  episodeSelect.innerHTML = "";

  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];
    setupEpisodes(allEpisodes);
    return;
  }

  root.innerHTML = "<p>Loading episodes...</p>";

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((res) => res.json())
    .then((episodes) => {
      episodeCache[showId] = episodes;
      allEpisodes = episodes;
      setupEpisodes(allEpisodes);
    })
    .catch((err) => {
      root.innerHTML =
        "<p class='error'>Failed to load episodes.</p>";
      console.error(err);
    });
}

// ===================== SETUP EPISODES VIEW =====================
function setupEpisodes(episodes) {
  populateDropdown(episodes);
  displayEpisodes(episodes);
}

// ===================== DISPLAY EPISODES =====================
function displayEpisodes(episodes) {
  root.innerHTML = "";

  resultsCount.textContent =
    `Displaying ${episodes.length} / ${allEpisodes.length} episodes`;

  episodes.forEach((ep) => {
    const div = document.createElement("div");
    div.className = "episode-card";

    div.innerHTML = `
      <h3>${formatEpisodeCode(ep.season, ep.number)} - ${ep.name}</h3>
      <img src="${ep.image?.medium || ""}" alt="${ep.name}">
      <p>${(ep.summary || "").replace(/<[^>]+>/g, "")}</p>
    `;

    root.appendChild(div);
  });
}

// ===================== EPISODE SEARCH =====================
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();

  const filtered = allEpisodes.filter((ep) => {
    return (
      ep.name.toLowerCase().includes(term) ||
      (ep.summary || "").toLowerCase().includes(term)
    );
  });

  displayEpisodes(filtered);
});

// ===================== DROPDOWN =====================
function populateDropdown(episodes) {
  episodeSelect.innerHTML = `<option value="">All Episodes</option>`;

  episodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `${formatEpisodeCode(ep.season, ep.number)} - ${ep.name}`;
    episodeSelect.appendChild(option);
  });
}

episodeSelect.addEventListener("change", () => {
  const id = episodeSelect.value;

  if (!id) {
    displayEpisodes(allEpisodes);
    return;
  }

  displayEpisodes(allEpisodes.filter(ep => ep.id == id));
});

// ===================== BACK BUTTON =====================
backToShows.addEventListener("click", () => {
  root.style.display = "none";
  showsRoot.style.display = "grid";

  searchInput.value = "";
  showSearchInput.value = "";
});

// ===================== HELPERS =====================
function populateShowDropdown(shows) {
  showSelect.innerHTML = `<option value="">Select a show</option>`;

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}