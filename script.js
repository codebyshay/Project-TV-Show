// Grab the elements we need from the page
const root = document.getElementById("root");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const episodeSelect = document.getElementById("episodeSelect");

// Holds all episodes after they are fetched
let allEpisodes = [];

// Cache fetched episode lists so we never fetch the same show twice
const episodeCache = {};

// Let the user know the page is loading
root.innerHTML = "<p style='text-align:center;'>Loading episodes... ⏳</p>";

// Fetch all shows from TVMaze when the page first loads
fetch("https://api.tvmaze.com/shows")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }
    return response.json();
  })
  .then((shows) => {
    // Sort shows alphabetically, case-sensitive
    shows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );

    // Add each show as an option in the show selector
    shows.forEach((show) => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      showSelect.appendChild(option);
    });
    root.innerHTML =
      "<p class='loading-message'>Select a show to get started</p>";
  })
  .catch((error) => {
    // If something goes wrong, show a message on the page
    root.innerHTML =
      "<p class='error-message'>❌ Something went wrong loading shows. Please try again later.</p>";
    console.error(error);
  });

// Fetch episodes for the selected show when the user makes a selection
showSelect.addEventListener("change", () => {
  const selectedShowId = showSelect.value;

  if (!selectedShowId) return;

  // Show a loading message while episodes are being fetched
  root.innerHTML =
    "<p class='loading-message'>Loading episodes... please wait</p>";

  // Use cached episodes if we have already fetched this show
  if (episodeCache[selectedShowId]) {
    allEpisodes = episodeCache[selectedShowId];
    searchInput.value = "";
    populateDropdown(allEpisodes);
    displayEpisodes(allEpisodes);
    return;
  }

  fetch(`https://api.tvmaze.com/shows/${selectedShowId}/episodes`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch episodes");
      }
      return response.json();
    })
    .then((episodes) => {
      // Save to cache so we don't fetch this show again
      episodeCache[selectedShowId] = episodes;
      allEpisodes = episodes;
      // Reset search for the new show
      searchInput.value = "";
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
