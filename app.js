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

function validateMovie() {
  const movie = {
    title: titleInput.value.trim(),
    director: directorInput.value.trim(),
    distributor: distributorInput.value.trim(),
    releasedDate: releasedDateInput.value
  };
  if (movie.title.length < 2 || movie.title.length > 80)
    return { error: "제목은 2~80자로 입력하세요.", input: titleInput };
  if (movie.director.length < 2 || movie.director.length > 50)
    return { error: "감독은 2~50자로 입력하세요.", input: directorInput };
  if (movie.distributor.length < 2 || movie.distributor.length > 50)
    return { error: "배급사는 2~50자로 입력하세요.", input: distributorInput };
  const parsedDate = new Date(`${movie.releasedDate}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(movie.releasedDate) ||
      Number.isNaN(parsedDate.getTime()) ||
      [parsedDate.getFullYear(), String(parsedDate.getMonth() + 1).padStart(2, "0"),
        String(parsedDate.getDate()).padStart(2, "0")].join("-") !== movie.releasedDate)
    return { error: "올바른 개봉일을 입력하세요.", input: releasedDateInput };
  return { movie };
}

function resetForm() {
  form.reset();
  movieIdInput.value = "";
  formTitle.textContent = "영화 추가";
  submitButton.textContent = "추가";
  cancelButton.hidden = true;
  showFormError("");
}

function startEdit(movie) {
  movieIdInput.value = movie.id;
  titleInput.value = movie.title ?? "";
  directorInput.value = movie.director ?? "";
  distributorInput.value = movie.distributor ?? "";
  releasedDateInput.value = movie.releasedDate ?? "";
  formTitle.textContent = "영화 수정";
  submitButton.textContent = "수정 저장";
  cancelButton.hidden = false;
  showFormError("");
  titleInput.focus();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (busy) return;
  const result = validateMovie();
  if (result.error) {
    showFormError(result.error);
    result.input.focus();
    return;
  }
  showFormError("");
  const id = movieIdInput.value;
  const updating = Boolean(id);
  setBusy(true);
  try {
    await request(updating ? `${API_URL}/${encodeURIComponent(id)}` : API_URL, {
      method: updating ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.movie)
    });
    resetForm();
    await loadMovies();
  } catch (error) {
    showFormError(`저장 실패: ${error.message}`);
  } finally {
    setBusy(false);
  }
});

movieList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button || busy) return;
  const movie = movies.find(item => String(item.id) === button.dataset.id);
  if (!movie) return;
  if (button.dataset.action === "edit") {
    startEdit(movie);
    return;
  }
  if (button.dataset.action === "delete" && window.confirm(`“${movie.title}”을(를) 삭제할까요?`)) {
    setBusy(true);
    try {
      await request(`${API_URL}/${encodeURIComponent(movie.id)}`, { method: "DELETE" });
      if (movieIdInput.value === String(movie.id)) resetForm();
      await loadMovies();
    } catch (error) {
      setStatus(`삭제 실패: ${error.message}`, true);
    } finally {
      setBusy(false);
    }
  }
});

cancelButton.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderMovies);
loadMovies();
