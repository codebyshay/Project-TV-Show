const root = document.getElementById("root");

// Example show: Game of Thrones (id = 82)
const url = "https://api.tvmaze.com/shows/82/episodes";

fetch(url)
  .then((response) => response.json())
  .then((episodes) => {
    episodes.forEach((ep) => {
      const episodeCode = formatEpisodeCode(ep.season, ep.number);

      const div = document.createElement("div");
      div.className = "episode";

      div.innerHTML = `
          <h3>${episodeCode} - ${ep.name}</h3>
          <img src="${ep.image?.medium || ""}" alt="${ep.name}">
          <p>${ep.summary || "No summary available"}</p>
        `;

      root.appendChild(div);
    });
  });

function formatEpisodeCode(season, number) {
  const s = String(season).padStart(2, "0");
  const e = String(number).padStart(2, "0");
  return `S${s}E${e}`;
}
