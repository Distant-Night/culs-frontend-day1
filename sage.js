// Loads Sage from data/herbs.json and populates the page

async function loadHerbs() {
  const response = await fetch("data/herbs.json")
  if (!response.ok) {
    throw new Error(`Could not load data: ${response.status}`)
  }
  return response.json()
}

async function renderSage() {
  const article = document.querySelector("#herb-detail")
  const nameEl = document.querySelector("#herb-name")
  const latinEl = document.querySelector("#herb-latin")
  const useEl = document.querySelector("#herb-use")
  const lifeEl = document.querySelector("#herb-life")

  try {
    const herbs = await loadHerbs()
    const sage = herbs.find((herb) => herb.name.toLowerCase() === "sage")

    if (!sage) {
      nameEl.textContent = "Herb not found"
      article.setAttribute("aria-busy", "false")
      return
    }

    nameEl.textContent = sage.name
    latinEl.textContent = sage.latin
    useEl.textContent = sage.use
    lifeEl.textContent = sage.life.charAt(0).toUpperCase() + sage.life.slice(1)

    article.setAttribute("aria-busy", "false")
  } catch (error) {
    nameEl.textContent = "Error loading details"
    console.error(error)
  }
}

renderSage()