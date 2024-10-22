let currentPage = 1; // Initialize current page
let filters = {}; // Object to hold current filters

async function fetchListings(page, filters = {}) {
    // Set default values for filters if not provided
    const { location = "", propertyType = "", bedrooms = "" } = filters;

    // Construct the query string for filters
    const queryParams = new URLSearchParams({
        page, // Current page
        location,
        propertyType,
        bedrooms,
    }).toString();

    const response = await fetch(`/listings?${queryParams}`);
    const data = await response.json();
    
    displayListings(data.listings);
    displayPagination(data.totalPages, data.currentPage);
    document.getElementById("count").innerText = data.totalDocuments || 0; // Update listing count
}

function displayListings(listings) {
    const listingsDiv = document.getElementById("listings");
    listingsDiv.innerHTML = "";

    listings.forEach((listing) => {
        const listingDiv = document.createElement("div");
        listingDiv.className = "col-md-4 mb-4"; // Use Bootstrap column classes

        const price = listing.price ? listing.price["$numberDecimal"] : "Price not available";

        const reviewScore =
            listing.review_scores && listing.review_scores.review_scores_rating
                ? listing.review_scores.review_scores_rating
                : "No rating available.";

        const summary = listing.summary || "No summary available.";
        const truncatedSummary = summary.length > 100 ? summary.substring(0, 100) + "..." : summary;

        const cardLink = document.createElement("a");
        cardLink.href = `bookings.html?listing_id=${listing._id}`; // Redirect to bookings page with listing ID
        cardLink.className = "text-decoration-none text-reset"; // Remove default anchor styles

        cardLink.innerHTML = `
            <div class="card d-flex flex-column" style="height: 100%;">
                <div class="card-body">
                    <h5 class="card-title">${listing.name}</h5>
                    <p class="card-text">${truncatedSummary}</p>
                    <div class="mt-auto">
                        <p class="card-text"><strong>Daily Rate: ${price}</strong></p>
                        <p class="card-text"><strong>Review Score: ${reviewScore}</strong></p>
                    </div>
                </div>
            </div>
        `;

        listingDiv.appendChild(cardLink);
        listingsDiv.appendChild(listingDiv);
    });
}

function displayPagination(totalPages, currentPage) {
    const paginationDiv = document.getElementById("pagination");
    paginationDiv.innerHTML = "";

    // Always display the first page
    if (totalPages > 0) {
        const firstPageLink = document.createElement("li");
        firstPageLink.className = "page-item";
        firstPageLink.innerHTML = `<a class="page-link" href="#" onclick="goToPage(1)">1</a>`;
        paginationDiv.appendChild(firstPageLink);
    }

    // Display ellipsis if necessary
    if (currentPage > 3) {
        const ellipsis = document.createElement("li");
        ellipsis.className = "page-item disabled";
        ellipsis.innerHTML = `<span class="page-link">...</span>`;
        paginationDiv.appendChild(ellipsis);
    }

    // Display pages around the current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        const pageLink = document.createElement("li");
        pageLink.className = "page-item" + (i === currentPage ? " active" : "");
        pageLink.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>`;
        paginationDiv.appendChild(pageLink);
    }

    // Display ellipsis if necessary
    if (currentPage < totalPages - 2) {
        const ellipsis = document.createElement("li");
        ellipsis.className = "page-item disabled";
        ellipsis.innerHTML = `<span class="page-link">...</span>`;
        paginationDiv.appendChild(ellipsis);
    }

    // Always display the last page
    if (totalPages > 1) {
        const lastPageLink = document.createElement("li");
        lastPageLink.className = "page-item";
        lastPageLink.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${totalPages})">${totalPages}</a>`;
        paginationDiv.appendChild(lastPageLink);
    }
}

function goToPage(page) {
    currentPage = page; // Update current page
    fetchListings(currentPage, filters); // Fetch listings with current filters
}

// Initial fetch
fetchListings(currentPage);
fetchDropdownData();

document
    .getElementById("filter-form")
    .addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        const formData = new FormData(event.target);
        filters = { // Update global filters object
            location: formData.get("location"),
            propertyType: formData.get("propertyType"),
            bedrooms: formData.get("bedrooms"),
        };

        fetchListings(1, filters); // Fetch listings for page 1 with filters
    });

// Event listener for the reset button
document.getElementById("reset-button").addEventListener("click", function () {
    // Reset the form
    document.getElementById("filter-form").reset();
    filters = {}; // Clear filters
    fetchListings(1, filters); // Fetch listings for page 1 with default filters
});

async function fetchDropdownData() {
    const [propertyTypesResponse, bedroomsResponse] = await Promise.all([
        fetch('/property-types'),  // Fetch property types from the server
        fetch('/bedrooms')         // Fetch number of bedrooms from the server
    ]);

    const propertyTypes = await propertyTypesResponse.json();
    const bedrooms = await bedroomsResponse.json();

    populateDropdown('propertyType', propertyTypes);
    populateDropdown('bedrooms', bedrooms);
}

function populateDropdown(dropdownId, data) {
    const dropdown = document.getElementById(dropdownId);

    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value; // Assuming your data has a 'value' property
        option.text = item.label;   // Assuming your data has a 'label' property
        dropdown.add(option);
    });
}