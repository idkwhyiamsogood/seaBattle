import { tables } from "../app/notepad.js";
import { quiz1, quiz2 } from "../app/data.js";

let player = 0;
let gameTables = [];

function matrixGenerator() {
  var randomValue = Math.floor(Math.random() * tables.length) + 1;
  gameTables.push(tables[randomValue]);
  delete tables[randomValue];
  console.log(tables.length);

  if (gameTables.length < 2) {
    matrixGenerator();
  } else {
    console.log(gameTables);
  }
}

function createBattlefield() {
  const tableArr = ["А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "К"];
  const table = document.createElement("table");
  table.classList.add("battlefield");
  table.id = player; // Устанавливаем id текущего поля (для каждой команды)
  player++;

  let headerRow = table.insertRow();
  for (let i = 0; i <= 10; i++) {
    const th = document.createElement("th");
    th.textContent = i;
    headerRow.appendChild(th);
  }

  for (let i = 0; i < 10; i++) {
    const row = table.insertRow();
    const rowHeader = document.createElement("th");
    rowHeader.textContent = tableArr[i];
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
  let index = Array.from(row.parentNode.children).indexOf(row) - 1;
  let subIndex = Array.from(row.children).indexOf(cell) - 1;

  if (gameTables[player][index][subIndex] === 1) {
    showModal("#modal-qustions");
    fillInput();
  } else {
    cell.classList.add("miss");
    player = player === 1 ? 0 : 1;
    toggleUntouchable();
  }
}

let currentQuiz = player === 1 ? quiz1 : quiz2;

function fillInput() {
  let random = Math.floor(Math.random() * currentQuiz.length - 1);

  const questionElem = document.querySelector(".question");

  questionElem.textContent = currentQuiz[random].title;
  document.querySelectorAll(".checkmark").forEach((input, index) => {
    input.nextElementSibling.textContent = currentQuiz[random].options[index];
  });
}

function getUserInput(cell) {
  const selectedOption = document.querySelector(
    'input[name="question"]:checked'
  );

  if (!selectedOption) return;

  const correctAnswer = currentQuiz[random].answer;
  if (parseInt(selectedOption.value) === correctAnswer) {
    cell.classList.add("hit");
  } else {
    cell.classList.add("shot");
  }
  document.querySelector(".answer").textContent =
    currentQuiz[random].answerText;
  setTimeout(closeModal("#modal-questions"), 10000);
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

function showModal(modalId) {
  document.querySelectorAll(modalId).forEach((modal) => {
    modal.style.display = "flex";
  });
}

function closeModal(modalId) {
  document.querySelectorAll(modalId).forEach((modal) => {
    modal.style.display = "none";
  });
}

function createBattlefields() {
  createBattlefield();
  createBattlefield();
  document.querySelector(".createBattlefield").style.display = "none";
  player = 1;
  toggleUntouchable();
}

window.onload = (matrixGenerator())

window.onload = () => {
  document
    .querySelector(".createBattlefield")
    .addEventListener("click", createBattlefields);
  document.querySelector(".checkAnswer").addEventListener("click", getUserInput);
};
