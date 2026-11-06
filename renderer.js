const TMDB_API_KEY = "be913361e1b10e14169dff04232961d1";

// Function for navigation 
function switchView(viewName, event) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    
    if (viewName === 'explore') {
        document.getElementById('page-explore').classList.add('active');
        if (event) event.target.classList.add('active');
    } else if (viewName === 'watchlist') {
        document.getElementById('page-watchlist').classList.add('active');
        if (event) event.target.classList.add('active');
        renderWatchlistAndCalculations();
    }
}

// Function to display message 
function showFeedback(message, type) {
    const box = document.getElementById('feedback-box');
    box.style.display = 'block';
    box.className = type === 'success' ? 'alert-success' : 'alert-error';
    box.textContent = message;
    setTimeout(() => { box.style.display = 'none'; }, 4000);
}

// External API integration & JSON processing
function searchMoviesAPI() {
    const query = document.getElementById("movieSearchInput").value.trim();
    const container = document.getElementById("apiResultsContainer");
    container.innerHTML = "<p> Fetching data from TMDB...</p>";

    if (!query) {
        showFeedback("Please enter a valid movie title to search.", "error");
        container.innerHTML = "";
        return;
    }

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to connect to API server (Status: " + response.status + ")");
            }
            return response.json();
        })
        .then(data => {
            if (!data.results || data.results.length === 0) {
                container.innerHTML = "";
                showFeedback("No movies found matching your search query.", "error");
                return;
            }
            renderAPIResults(data.results);
            showFeedback(`Successfully fetched ${data.results.length} records from TMDB!`, "success");
        })
        .catch(error => {
            container.innerHTML = "";
            showFeedback("API Error: " + error.message, "error");
        });
}

function renderAPIResults(movies) {
    const container = document.getElementById("apiResultsContainer");
    container.innerHTML = "";
    movies.forEach(movie => {
        let posterUrl = movie.poster_path 
            ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
            : 'https://via.placeholder.com/220x300?text=No+Poster';

        const card = document.createElement("div");
        card.className = "movie-card";

        card.onclick = (e) => {
            if (e.target.tagName === 'BUTTON') return; 
            openMovieModal(movie);
        };

        card.innerHTML = `
            <img class="movie-poster" src="${posterUrl}" alt="${movie.title}">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-meta">Release: ${movie.release_date || 'N/A'} | Rating: ⭐${movie.vote_average || 'N/A'}</div>
                <div class="movie-overview">${movie.overview || 'No overview available.'}</div>
                <button class="btn" style="padding: 6px; font-size: 12px;" 
                onclick='addMovieToWatchlistFromAPI(${JSON.stringify(movie).replace(/'/g, "&#39;")})'> + Add to Watchlist </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Fetch trending movies from tmdb
function fetchTrendingMovies() {
    const container = document.getElementById("trendingContainer");
    if (!container) return;
    
    container.innerHTML = "<p>Loading trending movies...</p>";

    const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch trending movies");
            }
            return response.json();
        })
        .then(data => {
            if (!data.results || data.results.length === 0) {
                container.innerHTML = "<p> No trending movies found. </p>";
                return;
            }
            renderTrendingResults(data.results.slice(0, 8)); 
        })
        .catch(error => {
            container.innerHTML = `<p style="color: #c0392b;"> Could not load trending movies: ${error.message} </p>`;
        });
}

function renderTrendingResults(movies) {
    const container = document.getElementById("trendingContainer");
    container.innerHTML = "";
    movies.forEach(movie => {
        let posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/220x300?text=No+Poster';

        const card = document.createElement("div");
        card.className = "movie-card";

        card.onclick = (e) => {
            if (e.target.tagName === 'BUTTON') return; 
            openMovieModal(movie);
        };

        card.innerHTML = `
            <img class="movie-poster" src="${posterUrl}" alt="${movie.title}">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-meta">Release: ${movie.release_date || 'N/A'} | ⭐${Number(movie.vote_average || 0).toFixed(1)}</div>
                <div class="movie-overview">${movie.overview || 'No overview available.'}</div>
                <button class="btn" style="padding: 6px; font-size: 12px;" 
                onclick='addMovieToWatchlistFromAPI(${JSON.stringify(movie).replace(/'/g, "&#39;")})'> + Add to Watchlist </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Call fetchTrendingMovies when the application starts up
window.addEventListener('DOMContentLoaded', () => {
    fetchTrendingMovies();
});

// Function to open movie overview
function openMovieModal(movieObj) {
    const modal = document.getElementById("movieModal");
    const container = document.getElementById("modalBodyContainer");

    let backdropUrl = movieObj.backdrop_path 
        ? `https://image.tmdb.org/t/p/w1280${movieObj.backdrop_path}`
        : (movieObj.poster_path ? `https://image.tmdb.org/t/p/w500${movieObj.poster_path}` : 'https://via.placeholder.com/800x400?text=No+Image');

    container.innerHTML = `
        <img class="modal-banner" src="${backdropUrl}" alt="${movieObj.title}">
        <div class="modal-body-info">
            <div class="modal-title">${movieObj.title}</div>
            <div class="modal-meta">Release Date: ${movieObj.release_date || 'N/A'} &nbsp;|&nbsp; 
            Rating: ⭐ ${Number(movieObj.vote_average || 0).toFixed(1)} / 10 </div>
            <div class="modal-synopsis"><strong>Full Synopsis:</strong>
            <br>${movieObj.overview || 'No detailed synopsis available for this film.'}</div>
            <div class="modal-actions">
                <button class="btn" onclick='addMovieToWatchlistFromAPI(${JSON.stringify(movieObj).replace(/'/g, "&#39;")}); 
                closeMovieModal();'> + Add to Watchlist </button>
                <button class="btn btn-secondary" onclick="closeMovieModal()"> Close </button>
            </div>
        </div>
    `;

    modal.classList.add("active");
}

function closeMovieModal(event) {
    if (event && event.target.id !== "movieModal") return;
    document.getElementById("movieModal").classList.remove("active");
}

// Function to get movie suggestion
function generateSmartSuggestion() {
    const genreId = document.getElementById("suggestGenre").value;
    const mood = document.getElementById("suggestMood").value;
    const outputEl = document.getElementById("suggestionOutput");

    let recommendation = "";

    if (genreId === "28") {
        if (mood === "high") {
            recommendation = "Suggested Match: 'MadMax: Fury Road'";
        } else if (mood === "relax") {
            recommendation = "Suggested Match: 'Spider-Man: Into the Spider-Verse'";
        }
    } 
    else if (genreId === "878") {
        if (mood === "deep") {
            recommendation = "Suggested Match: 'Interstellar'";
        } else if (mood === "relax") {
            recommendation = "Suggested Match: 'Jurassic Park'";
        }
    } 
    else if (genreId === "18") {
        if (mood === "relax") {
            recommendation = "Suggested Match: 'The Pursuit of Happyness'";
        } else if (mood === "deep") {
            recommendation = "Suggested Match: 'The Shawshank Redemption'";
        }
    } 
    else if (genreId === "16") {
        if (mood === "relax" || mood === "high" || mood === "deep") {
            recommendation = "Suggested Match: 'Spirited Away'";
        }
    } 
    else if (genreId === "27") {
        if (mood === "high") {
            recommendation = "Suggested Match: 'A Quiet Place'";
        }
    }

    // Error handling 
    if (recommendation === "") {
        outputEl.style.color = "#c0392b";
        outputEl.textContent = "No suggestion found. Please try a different selection.";
        showFeedback("No suggestion found.", "error");
    } else {
        outputEl.style.color = "#6b1116";
        outputEl.textContent = recommendation;
        showFeedback("Smart suggestion generated successfully!", "success");
    }
}

// Function to get data from local storage 
function getWatchlistFromStorage() {
    return JSON.parse(localStorage.getItem("myMovies")) || [];
}

function saveWatchlistToStorage(watchlist) {
    localStorage.setItem("myMovies", JSON.stringify(watchlist));
}

// Function for create operation (manual add)
function addCustomMovie() {
    const title = document.getElementById("customTitle").value.trim();
    const runtime = parseInt(document.getElementById("customRuntime").value) || 120;
    const vote_average = parseFloat(document.getElementById("customRating").value) || 8.0;
    const status = document.getElementById("customStatus").value;

    if (!title) {
        showFeedback("Movie title cannot be left blank.", "error");
        return;
    }

    let watchlist = getWatchlistFromStorage();
    const newMovie = {
        id: Date.now(),
        title: title,
        runtime: runtime,
        vote_average: vote_average,
        status: status
    };

    watchlist.push(newMovie);
    saveWatchlistToStorage(watchlist);
    
    document.getElementById("customTitle").value = "";
    renderWatchlistAndCalculations();
    showFeedback(`Successfully added "${title}" to your watchlist!`, "success");
}

// Function for create operation (add from API)
function addMovieToWatchlistFromAPI(movieObj) {
    let watchlist = getWatchlistFromStorage();
    if (watchlist.some(m => m.title.toLowerCase() === movieObj.title.toLowerCase())) {
        showFeedback(`"${movieObj.title}" already exists in your watchlist!`, "error");
        return;
    }

    const formattedMovie = {
        id: movieObj.id || Date.now(),
        title: movieObj.title,
        runtime: movieObj.runtime || 120,
        vote_average: movieObj.vote_average || 7.5,
        status: "Plan to Watch"
    };

    watchlist.push(formattedMovie);
    saveWatchlistToStorage(watchlist);
    showFeedback(`Successfully added "${movieObj.title}" to watchlist!`, "success");
}

// Function for delete operation
function deleteWatchlistItem(id) {
    let watchlist = getWatchlistFromStorage();
    watchlist = watchlist.filter(item => item.id !== id);
    saveWatchlistToStorage(watchlist);
    renderWatchlistAndCalculations();
    showFeedback("Watchlist record successfully deleted.", "success");
}

// Function for update operation
function updateWatchlistItemStatus(id, newStatus) {
    let watchlist = getWatchlistFromStorage();
    let item = watchlist.find(m => m.id === id);
    if (item) {
        item.status = newStatus;
        saveWatchlistToStorage(watchlist);
        renderWatchlistAndCalculations();
        showFeedback(`Status for "${item.title}" updated to ${newStatus}`, "success");
    }
}

// Function for read operation
function renderWatchlistAndCalculations() {
    const watchlist = getWatchlistFromStorage();
    const tbody = document.getElementById("watchlistTableBody");
    tbody.innerHTML = "";

    if (watchlist.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #777;"> 
        No movies found in your watchlist. Start adding movies! </td></tr>`;
        document.getElementById("calcTotalTime").textContent = "0 mins (0.0 hrs)";
        document.getElementById("calcAvgRating").textContent = "0.0 / 10";
        document.getElementById("calcMarathonDays").textContent = "0 Days";
        return;
    }

    let totalMinutes = 0;
    let totalRatingScore = 0;

    watchlist.forEach(movie => {
        totalMinutes += parseInt(movie.runtime) || 120;
        totalRatingScore += parseFloat(movie.vote_average) || 0;

        const badgeClass = movie.status === 'Completed' ? 'badge-completed' : (movie.status === 'Watching' ? 'badge-watching' : 'badge-plan');

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${movie.title}</strong></td>
            <td>${movie.runtime || 120} mins</td>
            <td>⭐ ${Number(movie.vote_average || 0).toFixed(1)}</td>
            <td><span class="badge ${badgeClass}">${movie.status}</span></td>
            <td>
                <div class="action-btns">
                    <select onchange="updateWatchlistItemStatus(${movie.id}, this.value)" style="padding: 3px; font-size: 11px;">
                        <option value="" disabled selected> Change Status </option>
                        <option value="Plan to Watch"> Plan to Watch </option>
                        <option value="Watching"> Watching </option>
                        <option value="Completed"> Completed </option>
                    </select>
                    <button class="btn-delete" onclick="deleteWatchlistItem(${movie.id})"> Delete </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Function for meaningful calculation
    const totalHours = (totalMinutes / 60).toFixed(1);
    const averageRating = (totalRatingScore / watchlist.length).toFixed(1);
    const marathonDays = (totalMinutes / 120).toFixed(0); 

    // Function to update metrics card
    document.getElementById("calcTotalTime").textContent = `${totalMinutes} mins (${totalHours} hrs)`;
    document.getElementById("calcAvgRating").textContent = `${averageRating} / 10`;
    document.getElementById("calcMarathonDays").textContent = `${marathonDays} Days`;
}