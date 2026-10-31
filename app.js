const API_URL = "https://6ae5ac47877d34ccafc257c9.mockapi.io/api/movies/movies";

const form = document.querySelector("#movie-form");
const formTitle = document.querySelector("#form-title");
const movieIdInput = document.querySelector("#movie-id");
const titleInput = document.querySelector("#title");
const directorInput = document.querySelector("#director");
const distributorInput = document.querySelector("#distributor");
const releasedDateInput = document.querySelector("#released-date");
const formError = document.querySelector("#form-error");
const submitButton = document.querySelector("#submit-button");
const cancelButton = document.querySelector("#cancel-button");
const searchInput = document.querySelector("#search");
const status = document.querySelector("#status");
const movieList = document.querySelector("#movie-list");