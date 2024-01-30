const apiKey = '6022d1c1d2422abd7b5a34d8a5bfc67e';
const baseEndpoint = 'https://api.themoviedb.org/3';
const authEndpoint = `${baseEndpoint}/authentication/token/new?api_key=${apiKey}`;
const configEndpoint = `${baseEndpoint}/configuration?api_key=${apiKey}`;

const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Function to fetch authentication token
function getAuthToken() {
  return fetch(authEndpoint, options)
    .then(response => response.json())
    .then(data => data.request_token);
}

// Function to fetch TMDb configuration
function getTmdbConfig() {
  return fetch(configEndpoint, options)
    .then(response => response.json())
    .then(configData => configData.images.base_url);
}

// Function to fetch movies based on a specific category
function getMoviesByCategory(authToken, category) {
  const categoryMoviesEndpoint = `${baseEndpoint}/movie/${category}?api_key=${apiKey}&request_token=${authToken}`;
  return fetch(categoryMoviesEndpoint, options)
    .then(response => response.json());
}

// Function to display movie rows
function displayMovieRows(authToken, imgBaseUrl) {
  const categories = ['popular', 'top_rated', 'now_playing', 'upcoming']; // Add more categories as needed

  categories.forEach(category => {
    getMoviesByCategory(authToken, category)
      .then(movies => {
        console.log("category: ", category)
        const movieRow = createMovieRow(category, movies, imgBaseUrl);
        document.getElementById("movie-container").appendChild(movieRow);
      })
      .catch(err => console.error(`Error fetching ${category} movies:`, err));
  });
}

// Function to create a movie row
function createMovieRow(category, movies, imgBaseUrl) {
    const categoryDisplay = category.replace("_", " ").toUpperCase();
  const row = document.createElement("div");
  row.className = "row netflixrow";

  const title = document.createElement("h2");
  title.className = "row_title";
  title.innerText = categoryDisplay;
  row.appendChild(title);

  const startArrow = document.createElement("div");
  startArrow.innerText="Start"
  startArrow.className = "arrow-left"

  const row_posters = document.createElement("div");
  row_posters.className = "row_posters";
  row.appendChild(row_posters);

  movies.results.forEach(movie => {
    const poster = document.createElement("img");
    poster.className = "row_posterLarge";
    var s = movie.original_title.replace(/\s+/g, "");
    poster.id = s;
    poster.src = imgBaseUrl + 'w500' + movie.poster_path; // Adjust 'w500' for different image sizes
    row_posters.appendChild(poster);
  });

  return row;
}

// Usage
getAuthToken()
  .then(authToken => {
    getTmdbConfig()
      .then(imgBaseUrl => {
        // Display movie rows for different categories
        displayMovieRows(authToken, imgBaseUrl);

        // Fetch and display a random popular movie in the banner
        getMoviesByCategory(authToken, 'popular')
          .then(popularMovies => {
            const randomIndex = Math.floor(Math.random() * popularMovies.results.length);
            const randomMovie = popularMovies.results[randomIndex];

            // Update the banner with the selected movie details
            var banner = document.getElementById("banner");
            var banner_title = document.getElementById("banner_title");
            var banner_desc = document.getElementById("banner_description");

            // Constructing the complete image URL
            var img_url = imgBaseUrl + 'w500' + randomMovie.backdrop_path; // Adjust 'w500' for different image sizes
            banner.style.backgroundImage = "url(" + img_url + ")";
            banner_desc.innerText = truncate(randomMovie.overview, 150);
            banner_title.innerText = randomMovie.title;
          })
          .catch(err => console.error('Error fetching popular movies:', err));
      })
      .catch(err => console.error('Error fetching TMDb configuration:', err));
  })
  .catch(err => console.error('Error fetching authentication token:', err));

// Function to truncate the string
function truncate(str, n) {
  return str?.length > n ? str.substr(0, n - 1) + "..." : str;
}
