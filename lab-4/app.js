const board = document.querySelector('.board');
let state = loadState();

renderBoard();

board.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-card'))
        addCard(e.target.closest('.column').dataset.column);

    if (e.target.classList.contains('delete'))
        deleteCard(e.target.closest('.card').dataset.id);

    if (e.target.classList.contains('right'))
        moveCard(e.target.closest('.card').dataset.id, 'right');

    if (e.target.classList.contains('left'))
        moveCard(e.target.closest('.card').dataset.id, 'left');

    if (e.target.classList.contains('color-card'))
        colorCard(e.target.closest('.card').dataset.id);

    if (e.target.classList.contains('color-column'))
        colorColumn(e.target.closest('.column').dataset.column);
});

board.addEventListener('input', (e) => {
    if (e.target.classList.contains('title')) {
        let id = e.target.closest('.card').dataset.id;
        let col = findCardColumn(id);
        state.columns[col].find(c => c.id == id).title = e.target.innerText;
        saveState();
    }
});

function addCard(column) {
    let id = Date.now().toString();
    state.columns[column].push({ id, title: 'Nowa karta', color: '#ffffff' });
    saveState();
    renderBoard();
}

function deleteCard(id) {
    let col = findCardColumn(id);
    state.columns[col] = state.columns[col].filter(c => c.id != id);
    saveState();
    renderBoard();
}

function moveCard(id, dir) {
    let col = findCardColumn(id);
    let order = ['todo', 'inprogress', 'done'];
    let idx = order.indexOf(col);

    if (dir === 'right' && idx < 2)
        transfer(id, col, order[idx + 1]);

    if (dir === 'left' && idx > 0)
        transfer(id, col, order[idx - 1]);
}

function transfer(id, from, to) {
    let card = state.columns[from].find(c => c.id == id);
    state.columns[from] = state.columns[from].filter(c => c.id != id);
    state.columns[to].push(card);
    saveState();
    renderBoard();
}

function colorCard(id) {
    let col = findCardColumn(id);
    let card = state.columns[col].find(c => c.id == id);
    card.color = randomColor();
    saveState();
    renderBoard();
}

function colorColumn(column) {
    state.columns[column].forEach(c => c.color = randomColor());
    saveState();
    renderBoard();
}

function renderBoard() {
    document.querySelectorAll('.column').forEach(col => {
        let name = col.dataset.column;
        let cont = col.querySelector('.cards');
        cont.innerHTML = '';

        state.columns[name].forEach(card => {
            let el = document.createElement('div');
            el.className = 'card';
            el.dataset.id = card.id;
            el.style.backgroundColor = card.color;

            el.innerHTML = `
        <div class="card-header">
          <div class="title" contenteditable="true">${card.title}</div>
          <div class="buttons">
            <button class="left">←</button>
            <button class="right">→</button>
            <button class="color-card">🎨</button>
            <button class="delete">✖</button>
          </div>
        </div>
      `;

            cont.appendChild(el);
        });

        col.querySelector('.count').innerText = state.columns[name].length;
    });
}

function findCardColumn(id) {
    return Object.keys(state.columns).find(col =>
        state.columns[col].some(c => c.id == id)
    );
}

function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function saveState() {
    localStorage.setItem('kanbanState', JSON.stringify(state));
}

function loadState() {
    let s = localStorage.getItem('kanbanState');
    return s ? JSON.parse(s) : { columns: { todo: [], inprogress: [], done: [] } };
}
