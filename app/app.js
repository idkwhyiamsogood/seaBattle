import { tables } from "./notepad";
import { quiz1, quiz2 } from "./data";

let player = 0
const randomValue = Math.floor(Math.random() * 20) + 1;
let gameTables = [tables[randomValue], tables[randomValue + 1]];

function createBattlefield() {
    const tableArr = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'К'];
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

    if (table.querySelectorAll("td.shot") + table.querySelectorAll("td.hit") === 20) return winner();

    if (gameTables[currentPlayer][index][subIndex] === 1) {
      cell.classList.add("hit");
    } else {
      cell.classList.add("miss");
      player = player === 1 ? 0 : 1;
      toggleUntouchable();
    }
}

window.onload = () => {
    createBattlefield();
    createBattlefield();
}

