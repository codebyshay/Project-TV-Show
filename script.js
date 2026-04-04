// عناصر الصفحة
const root = document.getElementById("root");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const episodeSelect = document.getElementById("episodeSelect");

// تخزين الحلقات
let allEpisodes = [];

// ========================
// Loading message
// ========================
root.innerHTML = "<p style='text-align:center;'>Loading episodes... ⏳</p>";

// ========================
// Fetch data (ONLY ONCE)
// ========================
fetch("https://api.tvmaze.com/shows/82/episodes")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }
    return response.json();
  })
  .then((episodes) => {
    allEpisodes = episodes;

    populateDropdown(allEpisodes);
    displayEpisodes(allEpisodes);
  })
  .catch((error) => {
    root.innerHTML = `
      <p style="color:red; text-align:center;">
        ❌ Failed to load episodes. Please try again later.
      </p>
    `;
    console.error(error);
  });

// ========================
// Search
// ========================
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();

  const filtered = allEpisodes.filter((ep) => {
    return (
      ep.name.toLowerCase().includes(searchTerm) ||
      (ep.summary || "").toLowerCase().includes(searchTerm)
    );
  });

  displayEpisodes(filtered);
});

// ========================
// Display episodes
// ========================
function displayEpisodes(episodes) {
  root.innerHTML = "";

  resultsCount.textContent =
    `Displaying ${episodes.length} / ${allEpisodes.length} episodes`;

  episodes.forEach((ep) => {
    const code = formatEpisodeCode(ep.season, ep.number);

    const div = document.createElement("div");
    div.className = "episode";
    div.id = `episode-${ep.id}`;

    div.innerHTML = `
      <h3>${code} - ${ep.name}</h3>
      <img src="${ep.image?.medium || ""}" alt="${ep.name}">
      <p>${(ep.summary || "").replace(/<[^>]+>/g, "")}</p>
    `;

    root.appendChild(div);
  });
}

// ========================
// Dropdown
// ========================
function populateDropdown(episodes) {
  episodeSelect.innerHTML = `<option value="">All Episodes</option>`;

  episodes.forEach((ep) => {
    const option = document.createElement("option");
    const code = formatEpisodeCode(ep.season, ep.number);

    option.value = ep.id;
    option.textContent = `${code} - ${ep.name}`;

    episodeSelect.appendChild(option);
  });
}

// ========================
// Jump to episode
// ========================
episodeSelect.addEventListener("change", () => {
  const selectedId = episodeSelect.value;

  if (!selectedId) {
    displayEpisodes(allEpisodes);
    return;
  }

  // Ensure all episodes are visible before scrolling
  displayEpisodes(allEpisodes);

  const element = document.getElementById(`episode-${selectedId}`);

  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
});

// ========================
// Format SxxExx
// ========================
function formatEpisodeCode(season, number) {
  const s = String(season).padStart(2, "0");
  const e = String(number).padStart(2, "0");
  return `S${s}E${e}`;
}