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

function renderMovies() {
  const term = searchInput.value.trim().toLocaleLowerCase();
  const filtered = movies.filter(movie =>
    [movie.title, movie.director, movie.distributor]
      .some(value => String(value ?? "").toLocaleLowerCase().includes(term))
  );
  movieList.replaceChildren();
  for (const movie of filtered) {
    const row = document.createElement("tr");
    row.append(makeCell(movie.title), makeCell(movie.director),
      makeCell(movie.distributor), makeCell(movie.releasedDate));
    const actions = document.createElement("td");
    actions.className = "row-actions";
    for (const [action, label] of [["edit", "수정"], ["delete", "삭제"]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.action = action;
      button.dataset.id = movie.id;
      button.textContent = label;
      button.disabled = busy;
      actions.append(button);
    }
    row.append(actions);
    movieList.append(row);
  }
  setStatus(`${filtered.length}개 표시 / 전체 ${movies.length}개`);
}

async function loadMovies() {
  setStatus("목록을 불러오는 중...");
  try {
    const data = await request(API_URL);
    if (!Array.isArray(data)) throw new Error("목록 형식이 올바르지 않습니다.");
    movies = data;
    renderMovies();
  } catch (error) {
    setStatus(`목록 조회 실패: ${error.message}`, true);
  }
}