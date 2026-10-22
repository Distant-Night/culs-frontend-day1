const herbsSection = document.querySelector("#herbs")
const herbsList = document.querySelector("#herbs-list")
const count = document.querySelector(".count")
const detailSection = document.querySelector("#herb-detail")


// Variable to remember the last focused link
let lastFocusedElement = null

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

    // Life badge at top
    const lifeBadge = element("span", "life", herb.life)

    // Heading with link that stretches over the entire card
    const titleNode = element("h3", "name", "")
    const link = element("a", "herb-link", herb.name)
    link.href = `#${slug}`
    link.setAttribute("aria-label", `View details for ${herb.name}`)
    titleNode.append(link)

    // Save reference for keyboard focus management
    link.addEventListener("click", () => {
        lastFocusedElement = link
    })

    // Card footer with a subtle "View herb" cue
    const cardFooter = element("div", "card-footer", "")
    cardFooter.append(element("span", "view-cue", "View herb →"))

    item.append(
        lifeBadge,
        titleNode,
        element("p", "latin", herb.latin),
        element("p", "use", herb.use),
        cardFooter
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

// Load a single herb by its slug (e.g., "basil" -> "data/basil.json") + error handling
async function loadHerbDetail(slug) {
    let response
    try {
        response = await fetch(`data/${slug}.json`)
    } catch (networkError) {
        throw new Error("Network error: Unable to communicate with the server.")
    }

    if (response.status === 404) {
        throw new Error(`The herb "${slug}" does not exist in our garden records.`)
    }

    if (!response.ok) {
        throw new Error(`Failed to load data for "${slug}" (Status: ${response.status}).`)
    }

    return await response.json()
}

// Render individual herb detail view + error handling
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
        const heading = element("h2", "name", herb.name)
        heading.tabIndex = -1 // Allows JavaScript to focus on it without disrupting normal Tab order

        header.append(
            heading,
            element("p", "latin-name", herb.latin || "Botanical name unavailable")
        )

        const grid = element("div", "herb-info-grid", "")

        const useCard = element("div", "info-card", "")
        useCard.append(
            element("h3", "", "Culinary & Practical Use"),
            element("p", "", herb.use || "No usage instructions available.")
        )

        const lifeCard = element("div", "info-card", "")
        lifeCard.append(
            element("h3", "", "Life Cycle"),
            element("p", "", herb.life || "Unknown")
        )



        grid.append(useCard, lifeCard)
        article.append(backLink, header, grid)

        detailSection.replaceChildren(article)
    } catch (error) {
        const errorBox = element("div", "error-card", "")
        const title = element("h2", "error-title", "Herb Not Available")
        const message = element("p", "error-message", error.message)
        const backLink = element("a", "back-link", "← Back to all herbs")
        backLink.href = "#herbs"

        errorBox.append(title, message, backLink)
        detailSection.replaceChildren(errorBox)
        backLink.focus()
    }
}

// Render main herbs list + modified to handle errors with a predefined error function
async function showList() {
    detailSection.hidden = true
    herbsSection.hidden = false

    if (lastFocusedElement) {
        lastFocusedElement.focus()
        lastFocusedElement = null
    }

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

// Keyboard shortcut: Escape returns to the list from detail or error views
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !detailSection.hidden) {
        window.location.hash = "#herbs"
    }
})

// Initial run on page load
handleRoute()