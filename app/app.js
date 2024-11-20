import { tables } from "./matrixData.js";
import * as quizData from "../app/data.js";

let quiz_1 = quizData.quiz1;
let quiz_2 = quizData.quiz2;

let player = 0;
let gameTables = [];
let gameStatus = "selecting";

let counter = [0, 0];

// Доделать удаление вопроса который уже был выведен в модалку
// Сделать модалку на регистрацию игроков (необязательно)
// Сделать счетчик попаданий и функцию winner()
// Сделать так чтобы можно было рисовать на заднем фоне письки

var clearTextArea;
var closeModalWhenTimeOut;

function matrixGenerator() {
  var randomValue = Math.floor(Math.random() * tables.length);
  console.log(randomValue);
  if (gameTables[0] === tables[randomValue]) {
    if (randomValue < 19) {
      gameTables.push(tables[randomValue + 1]);
    } else {
      gameTables.push(tables[randomValue - 1]);
    }
  } else {
    gameTables.push(tables[randomValue]);
  }

  if (gameTables.length < 2) {
    matrixGenerator();
  } else {
    console.log(gameTables);
  }
}

function clearTable() {
  // Получаем все ячейки всех таблиц
  const cells = document.querySelectorAll("table td");

  // Удаляем класс "selected" у каждой ячейки
  cells.forEach((cell) => {
    cell.classList.remove("selected");
  });
}

function getPlacementShip() {
  const tables = document.querySelectorAll("table"); // Все таблицы на странице
  tables.forEach((table, tableIndex) => {
    // Получить соответствующую матрицу из gameTables
    const matrix = gameTables[tableIndex];
    if (!matrix) return; // Если матрицы не хватает, пропустить эту таблицу

    // Получаем все ячейки таблицы
    const cells = table.querySelectorAll("td");
    cells.forEach((td, index) => {
      // Вычисляем координаты ячейки в матрице
      const row = Math.floor(index / 10); // Например, 10x10 матрица
      const col = index % 10;

      // Проверяем соответствие ячейки значению в матрице
      if (matrix[row][col] === 1) {
        td.classList.add("selected");
      } else {
        td.classList.remove("selected");
      }
    });
  });
}

function createBattlefield() {
  const tableArr = [" ", "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "К"];
  const table = document.createElement("table");
  table.classList.add("battlefield");
  table.id = player; // Устанавливаем id текущего поля (для каждой команды)
  player++;

  let headerRow = table.insertRow();
  for (let i = 0; i <= 10; i++) {
    const th = document.createElement("th");
    th.textContent = tableArr[i];
    headerRow.appendChild(th);
  }

  for (let i = 1; i < 11; i++) {
    const row = table.insertRow();
    const rowHeader = document.createElement("th");
    rowHeader.textContent = i;
    row.appendChild(rowHeader);

    for (let j = 0; j < 10; j++) {
      const cell = row.insertCell();
      cell.dataset.row = i;
      cell.dataset.col = j;

      cell.addEventListener("click", function () {
        handleCellClick(cell, row, table);
      });
    }
  }
  document.querySelector("#main").appendChild(table);
}

//Дополни эту функцию чтобы если все единички стоящие рядом с другими единичками были выбиты тогда вокруг них все клетки получали класс miss
function handleCellClick(cell, row, table) {
  if (gameStatus === "selecting") {
    alert("Чтобы начать игру нажмите на кнопку начать игру");
    return;
  } else {
    let index = Array.from(row.parentNode.children).indexOf(row) - 1;
    let subIndex = Array.from(row.children).indexOf(cell) - 1;

    if (gameTables[player][index][subIndex] === 1) {
      cell.classList.add("hit");
      showModal("#modal-qustions");
      fillInput(cell);

      // Проверяем и обрабатываем группы единичек
      processConnectedShips(index, subIndex, table);
    } else {
      cell.classList.add("miss");
      player = player === 1 ? 0 : 1;
      toggleUntouchable();
    }
  }
}

function processConnectedShips(index, subIndex, table) {
  // Получаем всю группу связанных единичек
  const connectedCells = getConnectedCells(index, subIndex);
  const allHit = connectedCells.every(([x, y]) => {
    const cell = getTableCell(table, x, y);
    return cell.classList.contains("shot") || cell.classList.contains("hit");
  });

  if (allHit) {
    // Если все единички поражены, закрашиваем клетки вокруг них
    for (const [x, y] of connectedCells) {
      markSurroundingCellsAsMiss(x, y, table);
    }
  }
}

function getConnectedCells(index, subIndex) {
  const visited = new Set();
  const stack = [[index, subIndex]];
  const connected = [];

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    if (gameTables[player][x] && gameTables[player][x][y] === 1) {
      connected.push([x, y]);

      // Добавляем соседей в стек (включая диагонали)
      for (const [dx, dy] of [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (!visited.has(`${nx},${ny}`)) {
          stack.push([nx, ny]);
        }
      }
    }
  }

  return connected;
}

function markSurroundingCellsAsMiss(index, subIndex, table) {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (let [dx, dy] of directions) {
    let x = index + dx;
    let y = subIndex + dy;

    // Проверяем границы поля
    if (
      x >= 0 &&
      x < gameTables[player].length &&
      y >= 0 &&
      y < gameTables[player][x].length
    ) {
      let surroundingRow = table.rows[x + 1]; // +1 из-за заголовка таблицы
      let surroundingCell = surroundingRow.cells[y + 1]; // +1 из-за заголовка строки

      if (
        !surroundingCell.classList.contains("hit") &&
        !surroundingCell.classList.contains("shot")
      ) {
        surroundingCell.classList.add("miss");
      }
    }
  }
}

function getTableCell(table, x, y) {
  const row = table.rows[x + 1]; // +1 из-за заголовка таблицы
  return row ? row.cells[y + 1] : null; // +1 из-за заголовка строки
}

function fillInput(cell) {
  document.querySelector(".modalClose").style.display = "none";

  document.querySelectorAll(".container").forEach((container) => {
    container.style.display = "block";
  });
  document.querySelector(".checkAnswer").style.display = "block";

  let currentQuiz = player === 0 ? quiz_1 : quiz_2;
  let random = Math.floor(Math.random() * currentQuiz.length);

  console.log(currentQuiz[random]);

  const questionElem = document.querySelector(".question");
  if (!questionElem) {
    return;
  }

  questionElem.textContent = currentQuiz[random].title;
  document.querySelectorAll(".checkmark").forEach((input, index) => {
    if (currentQuiz[random].options[index]) {
      input.textContent = currentQuiz[random].options[index];
    }
  });

  const checkAnswerBtn = document.querySelector(".checkAnswer");
  if (checkAnswerBtn) {
    checkAnswerBtn.onclick = () =>
      getUserInput(cell, random, currentQuiz, player);
  }
}

const answerTextElem = document.querySelector(".answer");

function getUserInput(cell, random, currentQuiz, player) {
  let selectedOption = document.querySelector('input[name="question"]:checked');

  if (!selectedOption) {
    return;
  }

  document.querySelectorAll(".container").forEach((container) => {
    container.style.display = "none";
  });
  document.querySelector(".checkAnswer").style.display = "none";

  const correctAnswer = currentQuiz[random].answer;
  console.log(correctAnswer, parseInt(selectedOption.value));

  if (parseInt(selectedOption.value) === correctAnswer) {
    cell.classList.add("hit");
    updateCounter();
  } else {
    cell.classList.add("shot");
  }

  if (answerTextElem) {
    answerTextElem.textContent = currentQuiz[random].answerText;
  }

  document.querySelector(".modalClose").style.display = "block";
  clearTextArea = setTimeout(() => clearAnswer(), 4500);
  closeModalWhenTimeOut = setTimeout(() => closeModal(), 5000);

  if (player === 0) {
    quiz_1.splice(random, 1);
  } else {
    quiz_2.splice(random, 1);
  }

  checkWinner();
  console.log(quiz_1.length, quiz_2.length);
}

function clearAnswer() {
  answerTextElem.textContent = "";
}

function toggleUntouchable() {
  // Находим все таблицы с классом battlefield
  document.querySelectorAll(".battlefield").forEach((table) => {
    table.querySelectorAll("td").forEach((cell) => {
      // Если это поле текущего игрока, добавляем класс untouchable
      if (Number(table.id) != player) {
        cell.classList.add("untouchable");
      } else {
        cell.classList.remove("untouchable");
      }
    });
  });
}

function updateCounter() {
  if (player === 1) {
    counter[1]++;
  } else {
    counter[0]++;
  }
}

function showModal(modalId) {
  document.querySelectorAll(modalId).forEach((modal) => {
    modal.style.display = "block";
  });
}

function closeModal() {
  document
    .querySelectorAll('input[name="question"]:checked')
    .forEach((item) => {
      item.checked = false;
    });

  clearTimeout(closeModalWhenTimeOut);
  clearTimeout(clearTextArea);
  clearAnswer();

  document.querySelectorAll(".modalBackground").forEach((modal) => {
    modal.style.display = "none";
  });
  document.querySelectorAll(".modalActive").forEach((modal) => {
    modal.style.display = "none";
  });
}

function createBattlefields() {
  matrixGenerator();
  createBattlefield();
  createBattlefield();
  document.querySelector("#createBattlefield").style.display = "none";
  document.querySelectorAll(".btn.hidden").forEach((btn, index) => {
    if (index < 2) {
      btn.classList.remove("hidden");
    }
  });
  getPlacementShip();
}

function startGame() {
  gameStatus = "playing";
  player = 1;
  toggleUntouchable();
  clearTable();
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.style.display = "none";
  });
}

function reloadPage() {
  location.reload();
}

function checkWinner() {
  // Проверяем каждую таблицу игрока
  if (quiz_1.length === 0 || quiz_2.length === 0) {
    if (counter[0] > counter[1]) {
      winner(0);
    } else {
      winner(1);
    }
  }
}

function winner(teamIndex) {
  // Логика победы
  closeModal("#modal-questions");
  document.querySelectorAll(".battlefield").forEach((table) => {
    table.style.display = "none";
  });

  document.querySelector("#resetGame").style.display = "block";

  showModal("#showWinner");

  document.querySelector("#showWinnerClose").style.display = "block";
  document.querySelector("#showWinnerText").innerHTML += `${teamIndex}!`;
  document.querySelector("#winnerCounter").innerHTML = `Со счетом ${counter[0]} против ${counter[1]}`;
}

function rerollBattlefield() {
  gameTables = [];
  matrixGenerator();
  getPlacementShip();
}

window.onload = () => {
  document
    .querySelector("#createBattlefield")
    .addEventListener("click", createBattlefields);
  document
    .querySelector("#rerollBattlefield")
    .addEventListener("click", rerollBattlefield);
  document.querySelectorAll(".modalClose").forEach((close) => {
    close.addEventListener("click", closeModal);
  });
  document.querySelector("#startGame").addEventListener("click", startGame);
  document.querySelector("#resetGame").addEventListener("click", reloadPage);
};
