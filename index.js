import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "iluv7boi",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1; // Default user to start with

// Fetch the list of all users
async function getAllUsers() {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
}

// Fetch the countries visited by the current user
async function checkVisited(userId) {
  try {
    const result = await db.query(
      "SELECT country_code FROM visited_countries WHERE user_id = $1;",
      [userId]
    );
    return result.rows.map((row) => row.country_code);
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Get current user by userId
async function getCurrentUser(userId) {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
  return result.rows[0];
}

// Home route to display countries and current user info
app.get("/", async (req, res) => {
  const countries = await checkVisited(currentUserId); // Get visited countries
  const currentUser = await getCurrentUser(currentUserId); // Get current user details
  const users = await getAllUsers(); // Get all users
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
    error: null, // Initially no error
  });
});

// Add new country for the current user
app.post("/add", async (req, res) => {
  const input = req.body["country"].trim(); // Trim spaces from user input
  const currentUser = await getCurrentUser(currentUserId); // Get the current user

  try {
    // Search for country by exact match or partial match
    const result = await db.query(
      `SELECT country_code FROM countries 
       WHERE LOWER(country_name) = $1 OR LOWER(country_name) LIKE '%' || $1 || '%'
       ORDER BY (LOWER(country_name) = $1::text) DESC
       LIMIT 1;`,
      [input.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Country not found, show error
      const countries = await checkVisited(currentUserId);
      return res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        users: await getAllUsers(),
        color: currentUser.color,
        error: "Country name does not exist, try again.",
      });
    }

    const countryCode = result.rows[0].country_code;

    // Check if the country has already been visited by the current user
    const checkIfExists = await db.query(
      "SELECT * FROM visited_countries WHERE country_code = $1 AND user_id = $2",
      [countryCode, currentUserId]
    );

    if (checkIfExists.rows.length > 0) {
      // Country already visited, show error
      const countries = await checkVisited(currentUserId);
      return res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        users: await getAllUsers(),
        color: currentUser.color,
        error: "Country has already been added, try again.",
      });
    }

    // Insert the new country for the current user
    await db.query(
      "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
      [countryCode, currentUserId]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    const countries = await checkVisited(currentUserId);
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: await getAllUsers(),
      color: currentUser.color,
      error: "An unexpected error occurred, try again.",
    });
  }
});

// Handle user switching or creating a new user
app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = parseInt(req.body.user, 10); // Set the new current user
    res.redirect("/");
  }
});

// Create a new user
app.post("/new", async (req, res) => {
  const name = req.body.name.trim(); // Ensure no extra spaces in the name
  const color = req.body.color.trim();

  try {
    const result = await db.query(
      "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *;",
      [name, color]
    );

    currentUserId = result.rows[0].id; // Set the newly created user as the current user

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("new.ejs", {
      error: "An error occurred while creating the user, please try again.",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
