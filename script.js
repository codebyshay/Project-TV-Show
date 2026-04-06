// Grab the elements we need from the page
const root = document.getElementById("root");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const episodeSelect = document.getElementById("episodeSelect");

// Holds all episodes after they are fetched
let allEpisodes = [];

// Let the user know the page is loading
root.innerHTML = "<p style='text-align:center;'>Loading episodes... ⏳</p>";

// Fetch the full episode list from TVMaze when the page first loads
fetch("https://api.tvmaze.com/shows/82/episodes")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }
    return response.json();
  })
  .then((episodes) => {
    allEpisodes = episodes;
    // Fill in the dropdown and show all episodes on first load
    populateDropdown(allEpisodes);
    displayEpisodes(allEpisodes);
  })
  .catch((error) => {
    // If something goes wrong, show a message on the page instead of the console
    root.innerHTML =
      "<p class= 'error message'>❌ Failed to load episodes. Please try again later.</p>";
    console.error(error);
  });

// |Re-filter the episode list each time the user types in the search box
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

// Clear the grid and render a fresh set of episode cards
function displayEpisodes(episodes) {
  root.innerHTML = "";

  resultsCount.textContent = `Displaying ${episodes.length} / ${allEpisodes.length} episodes`;

  episodes.forEach((ep) => {
    const code = formatEpisodeCode(ep.season, ep.number);

    const div = document.createElement("div");
    div.className = "episode";
    div.id = `episode-${ep.id}`;

    // Remove any HTML tags from the summary text before rendering
    div.innerHTML = `
      <h3>${code} - ${ep.name}</h3>
      <img src="${ep.image?.medium || ""}" alt="${ep.name}">
      <p>${(ep.summary || "").replace(/<[^>]+>/g, "")}</p>
    `;

    root.appendChild(div);
  });
}

// Add every episode as an option in the dropdown menu
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

// Show only selected episode, or all episodes if All Episodes is chosen
episodeSelect.addEventListener("change", () => {
  const selectedId = episodeSelect.value;

  if (!selectedId) {
    // Reset to showing all episodes
    displayEpisodes(allEpisodes);
    return;
  }

  // Find the matching episode and display only that one
  const selectedEpisode = allEpisodes.filter(
    (ep) => ep.id === Number(selectedId),
  );
  // Ensure all episodes are visible before scrolling
  displayEpisodes(selectedEpisode);
});

// Format season and episode numbers into SxxExx
function formatEpisodeCode(season, number) {
  const s = String(season).padStart(2, "0");
  const e = String(number).padStart(2, "0");
  return `S${s}E${e}`;
}
