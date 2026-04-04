const root = document.getElementById("root");
// Example show: Game of Thrones (id = 82)
const url = "https://api.tvmaze.com/shows/82/episodes";

// Store all episodes so we can filter them later
let allEpisodes = [];

fetch(url)
  .then((response) => response.json())
  .then((episodes) => {
    // Save episodes to the allEpisodes variable
    allEpisodes = episodes;

    // Create the search input
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search episodes...";
    searchInput.id = "search-input";

    // Create the count display
    const countDisplay = document.createElement("p");
    countDisplay.id = "count-display";

    // Add search input and count to the page before the cards
    document.body.insertBefore(searchInput, root);
    document.body.insertBefore(countDisplay, root);

    // Show all episodes initially
    displayEpisodes(allEpisodes);
    createEpisodeSelector(allEpisodes);

    // Listen for keystrokes in the search box
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filtered = allEpisodes.filter((ep) => {
        return (
          ep.name.toLowerCase().includes(searchTerm) ||
          ep.summary.toLowerCase().includes(searchTerm)
        );
      });
      displayEpisodes(filtered);
    });
  });

// Display a list of episodes and update the count
function displayEpisodes(episodes) {
  root.innerHTML = "";
  const countDisplay = document.getElementById("count-display");
  countDisplay.textContent = `Showing ${episodes.length} episode(s)`;

  episodes.forEach((ep) => {
    const episodeCode = formatEpisodeCode(ep.season, ep.number);
    const div = document.createElement("div");
    div.id = `episode-${ep.id}`;
    div.className = "episode";
    div.innerHTML = `
      <h3>${episodeCode} - ${ep.name}</h3>
      <img src="${ep.image?.medium || ""}" alt="${ep.name}">
      <p>${ep.summary || "No summary available"}</p>
    `;
    root.appendChild(div);
  });
}

function formatEpisodeCode(season, number) {
  // Shows season number
  const s = String(season).padStart(2, "0");
  // Shows episode number
  const e = String(number).padStart(2, "0");
  return `S${s}E${e}`;
}

// Create the episode selector dropdown
function createEpisodeSelector(episodes) {
  const select = document.createElement("select");
  select.id = "episode-selector";

  // Add a default option
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select an episode...";
  defaultOption.value = "";
  select.appendChild(defaultOption);

  // Add an option for each episode
  episodes.forEach((ep) => {
    const option = document.createElement("option");
    const episodeCode = formatEpisodeCode(ep.season, ep.number);
    option.textContent = `${episodeCode} - ${ep.name}`;
    option.value = ep.id;
    select.appendChild(option);
  });

  // When user selects an episode, scroll to it
  select.addEventListener("change", () => {
    const selectedId = select.value;
    const episodeDiv = document.getElementById(`episode-${selectedId}`);
    if (episodeDiv) {
      episodeDiv.scrollIntoView({ behavior: "smooth" });
    }
  });

  document.body.insertBefore(select, root);
}
