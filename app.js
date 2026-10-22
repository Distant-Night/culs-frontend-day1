const herbsSection = document.querySelector("#herbs")
const herbsList = document.querySelector("#herbs-list")
const count = document.querySelector(".count")
const detailSection = document.querySelector("#herb-detail")

// Helper to create DOM elements
function element(tag, className, text) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text) node.textContent = text
    return node
}

// Build herb card for the main list
function card(herb) {
    const item = element("li", "card", "")
    const slug = herb.name.toLowerCase()

    const titleNode = element("h3", "name", "")
    const link = element("a", "herb-link", herb.name)
    link.href = `#${slug}`
    titleNode.append(link)

    item.append(
        titleNode,
        element("p", "latin", herb.latin),
        element("p", "use", herb.use),
        element("p", "life", herb.life)
    )
    return item
}

// Load full list of herbs for the overview + along with some minor error handling
async function loadHerbs() {
    try {
        const response = await fetch("data/herbs.json")
        if (!response.ok) {
            throw new Error(`Server returned ${response.status} (${response.statusText || "Error"})`)
        }
        return await response.json()
    } catch (error) {
        throw new Error("Unable to connect to the server. Please check that the local server is running.")
    }
}

// Load a single herb by its slug (e.g., "basil" -> "data/basil.json")
async function loadHerbDetail(slug) {
    const response = await fetch(`data/${slug}.json`)
    if (!response.ok) {
        throw new Error(`Could not load data/${slug}.json: ${response.status}`)
    }
    return response.json()
}

// Render individual herb detail view
async function showDetail(slug) {
    herbsSection.hidden = true
    detailSection.hidden = false
    detailSection.replaceChildren(element("p", "status", "Loading herb…"))

    try {
        const herb = await loadHerbDetail(slug)

        const article = element("article", "herb-article", "")

        const backLink = element("a", "back-link", "← Back to all herbs")
        backLink.href = "#herbs"

        const header = element("header", "herb-header", "")
        header.append(
            element("h2", "name", herb.name),
            element("p", "latin-name", herb.latin)
        )

        const grid = element("div", "herb-info-grid", "")

        const useCard = element("div", "info-card", "")
        useCard.append(
            element("h3", "", "Culinary & Practical Use"),
            element("p", "", herb.use)
        )

        const lifeCard = element("div", "info-card", "")
        lifeCard.append(
            element("h3", "", "Life Cycle"),
            element("p", "", herb.life)
        )

        grid.append(useCard, lifeCard)
        article.append(backLink, header, grid)

        detailSection.replaceChildren(article)
    } catch (error) {
        detailSection.replaceChildren(
            element("p", "error", `Could not find data for "${slug}".`),
            element("a", "back-link", "← Back to all herbs")
        )
        detailSection.querySelector("a").href = "#herbs"
        console.error(error)
    }
}

// Render main herbs list + modified to handle errors with a predefined error function
async function showList() {
    detailSection.hidden = true
    herbsSection.hidden = false

    try {
        const herbs = await loadHerbs()
        herbsList.replaceChildren(...herbs.map(card))
        count.textContent = `${herbs.length} herbs grow here.`
    } catch (error) {
        count.textContent = error.message
        herbsList.replaceChildren()
    }
}

// Hash router
function handleRoute() {
    const hash = window.location.hash.replace("#", "").toLowerCase()

    // Standard section navigation or empty hash
    if (!hash || hash === "herbs" || hash === "visit" || hash === "about") {
        showList()
    } else {
        showDetail(hash)
    }
}

window.addEventListener("hashchange", handleRoute)

// Initial run on page load
handleRoute()