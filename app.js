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

let movies = [];
let busy = false;

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

function setBusy(value) {
  busy = value;
  submitButton.disabled = value;
  cancelButton.disabled = value;
  movieList.querySelectorAll("button").forEach(button => { button.disabled = value; });
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

function makeCell(value) {
  const cell = document.createElement("td");
  cell.textContent = String(value ?? "");
  return cell;
}