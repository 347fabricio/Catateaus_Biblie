import { getBooks, getChapter, getVersions } from "../services/api.js";
import { buildVerses } from "./verses.js";

const bibleBooks = await getBooks();
const bibleVersions = await getVersions();

/**
 * Função principal de inicialização. Atua como o controlador da interface.
 */
function populateBookDiv() {
  const booksEl = document.querySelector("#books");
  const dropdownMenu = booksEl.querySelector(".dropdown-menu");
  const dropdownToggle = booksEl.querySelector(".dropdown-toggle");
  const chaptersEl = document.querySelector("#chapters");
  const liTemplate = dropdownMenu.querySelector("li");

  fixBootstrapDropdownScroll(dropdownToggle);
  populateBooksList(dropdownMenu, liTemplate, bibleBooks);
  setupMainButtonToggle(booksEl, dropdownMenu, chaptersEl);
  setupBookSelection(booksEl, dropdownMenu, chaptersEl);

  setupVersionSelection(dropdownMenu);
}

/**
 * Remove o redimensionamento do Dropdown ao scrollar do Bootstrap com configurações personalizadas do popper.
 * @param {HTMLElement} toggleElement - O elemento de botão que aciona o dropdown.
 */
function fixBootstrapDropdownScroll(toggleElement) {
  new bootstrap.Dropdown(toggleElement, {
    popperConfig: {
      modifiers: [
        {
          name: "eventListeners",
          options: { scroll: false, resize: false },
        },
      ],
    },
  });
}

/**
 * Clona o modelo (template) para renderizar a lista de livros e, em seguida, remove o modelo original.
 * @param {HTMLElement} dropdownMenu - O contêiner do menu suspenso onde os livros serão adicionados.
 * @param {HTMLElement} templateItem - O elemento `li` usado como modelo para clonagem.
 * @param {Array<Object>} booksData - O array contendo os objetos de dados dos livros (ex: bibleBooks).
 */
function populateBooksList(dropdownMenu, templateItem, booksData) {
  booksData.forEach((book, index) => {
    const newLi = templateItem.cloneNode(true);
    newLi.removeAttribute("id");
    newLi.classList.remove("d-none");
    newLi.querySelector("button").textContent = book.name;
    newLi.dataset.bookId = index + 1;
    newLi.dataset.bookName = book.name;
    dropdownMenu.append(newLi);
  });

  templateItem.querySelector("button").classList.add("fw-bold");
}

/**
 * Lida com a lógica do botão principal do dropdown (exibir a lista de livros ou ocultar os capítulos).
 * @param {HTMLElement} booksEl - O contêiner principal do componente de livros.
 * @param {HTMLElement} dropdownMenu - O contêiner do menu suspenso.
 * @param {HTMLElement} chaptersEl - O contêiner que agrupa a grade de capítulos.
 */
function setupMainButtonToggle(booksEl, dropdownMenu, chaptersEl) {
  const booksBtn = booksEl.querySelector("button");

  booksBtn.addEventListener("click", () => {
    const isDropdownShown = booksEl.querySelector(".btn").classList.contains("show");
    const versionItems = dropdownMenu.querySelectorAll(".versionName");

    if (isDropdownShown && chaptersEl.classList.contains("d-none")) {
      showVersionsSection(dropdownMenu);

      const listItems = dropdownMenu.querySelectorAll("li:not(.versionName)");
      listItems.forEach((li) => li.classList.remove("d-none"));
    } else if (versionItems.length) {
      hideVersionNames(dropdownMenu);
    } else {
      clearChapters(chaptersEl);
      chaptersEl.classList.add("d-none");
    }
  });
}

/**
 * Adiciona event listeners aos itens da lista de livros para buscar e exibir os capítulos.
 * @param {HTMLElement} booksEl - O contêiner principal do componente de livros.
 * @param {HTMLElement} dropdownMenu - O contêiner do menu suspenso contendo os livros.
 * @param {HTMLElement} chaptersEl - O contêiner onde os capítulos serão renderizados.
 */
function setupBookSelection(booksEl, dropdownMenu, chaptersEl) {
  const listItems = dropdownMenu.querySelectorAll("li:not(#versions):not(.versionName)");
  listItems.forEach((li, index) => {
    li.addEventListener("click", async () => {
      const bookId = li.dataset.bookId;
      const bookName = li.dataset.bookName;

      booksEl.dataset.bookId = bookId;
      booksEl.dataset.bookName = bookName;

      booksEl.querySelector("button").textContent = bookName;

      hideVersionsSection(dropdownMenu);
      hideHr(dropdownMenu);

      listItems.forEach((x) => x.classList.add("d-none"));

      await fetchAndRenderChapters(bookId, bookName, chaptersEl, booksEl);
    });
  });
}

/**
 * Busca a quantidade de capítulos na API/Banco de dados e aciona a renderização e a vinculação de eventos.
 * @param {string|number} bookId - O identificador único do livro selecionado.
 * @param {string} bookName - O nome do livro selecionado.
 * @param {HTMLElement} chaptersEl - O contêiner onde a grade de capítulos será renderizada.
 * @param {HTMLElement} booksEl - O contêiner principal do componente de livros.
 */
async function fetchAndRenderChapters(bookId, bookName, chaptersEl, booksEl) {
  const response = await getChapter(bookId, 999);
  const howManyChapters = response[0].chapter;

  renderChapterGrid(howManyChapters, chaptersEl);
  setupChapterSelection(chaptersEl, booksEl, bookName);

  chaptersEl.classList.remove("d-none");
}

/**
 * Renderiza a grade de botões correspondentes a cada capítulo do livro.
 * @param {number} chapterCount - A quantidade total de capítulos a serem renderizados.
 * @param {HTMLElement} chaptersEl - O contêiner que agrupa a grade de capítulos.
 */
function renderChapterGrid(chapterCount, chaptersEl) {
  const row = chaptersEl.querySelector(".row");
  const templateCol = chaptersEl.querySelector(".col");

  clearChapters(chaptersEl);

  for (let i = 1; i <= chapterCount; i++) {
    const col = templateCol.cloneNode(true);
    col.querySelector("button").textContent = i;
    col.classList.remove("d-none");
    row.append(col);
  }
}

/**
 * Adiciona ouvintes de eventos (event listeners) aos botões de capítulos gerados dinamicamente.
 * @param {HTMLElement} chaptersEl - O contêiner que possui os botões de capítulos gerados.
 * @param {HTMLElement} booksEl - O contêiner principal para atualizar o texto do botão.
 * @param {string} bookName - O nome do livro selecionado atual.
 */
function setupChapterSelection(chaptersEl, booksEl, bookName) {
  const chapterButtons = chaptersEl.querySelectorAll(".col:not(.d-none) button");

  chapterButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const chapterId = e.target.textContent.trim();
      booksEl.dataset.chapterId = chapterId;
      booksEl.querySelector("button").textContent = `${bookName} ${chapterId}`;

      const dropdownToggle = booksEl.querySelector(".dropdown-toggle");
      const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle);
      if (dropdownInstance) {
        dropdownInstance.hide();
      }

      chaptersEl.classList.add("d-none");

      const bookId = booksEl.dataset.bookId;
      buildVerses(bookId, chapterId);

      clearChapters(chaptersEl);
    });
  });
}

/**
 * Função utilitária para remover as colunas de capítulos geradas, mantendo apenas o modelo original.
 * @param {HTMLElement} chaptersEl - O contêiner dos capítulos a ser limpo.
 */
function clearChapters(chaptersEl) {
  const cols = [...chaptersEl.querySelectorAll(".col")];
  const toRemove = cols.slice(1);
  toRemove.forEach((x) => x.remove());
}

/**
 * Exibe a seção de versões no menu suspenso.
 * @param {HTMLElement} dropdownMenu - O contêiner do menu suspenso onde os elementos estão localizados.
 */
function showVersionsSection(dropdownMenu) {
  const liVersions = dropdownMenu.querySelector("#versions");
  const versionsBtn = liVersions.querySelector("button");
  const hr = dropdownMenu.querySelector("hr");

  versionsBtn.textContent = "Versões";
  liVersions.classList.remove("d-none");
  hr.classList.remove("d-none");
}

/**
 * Oculta a seção de versões no menu suspenso.
 * @param {HTMLElement} dropdownMenu - O contêiner do menu suspenso onde os elementos estão localizados.
 */
function hideVersionsSection(dropdownMenu) {
  const liVersions = dropdownMenu.querySelector("#versions");
  liVersions.classList.add("d-none");
}

/**
 * Oculta a linha separadora no menu suspenso.
 * @param {HTMLElement} dropdownMenu - O contêiner do menu suspenso onde os elementos estão localizados.
 */
function hideHr(dropdownMenu) {
  const hr = dropdownMenu.querySelector("hr");
  hr.classList.add("d-none");
}

/**
 * Configura o comportamento do botão "Versões" no menu suspenso.
 * Ao ser clicado, oculta a lista de livros, exibe os itens de versão e,
 * caso ainda não existam, gera dinamicamente a lista de versões disponíveis.
 * @param {HTMLElement} dropdownMenu - O contêiner do menu suspenso que contém os elementos.
 */
function setupVersionSelection(dropdownMenu) {
  const liVersion = dropdownMenu.querySelector("#versions");

  liVersion.addEventListener("click", () => {
    liVersion.classList.remove("d-none");

    const listItems = dropdownMenu.querySelectorAll("li:not(#versions)");
    listItems.forEach((x) => x.classList.add("d-none"));

    const versionItems = dropdownMenu.querySelectorAll(".versionName");
    versionItems.forEach((x) => x.classList.remove("d-none"));

    hideVersionsSection(dropdownMenu);
    hideHr(dropdownMenu);

    const versionNames = dropdownMenu.querySelectorAll(".versionName");

    if (versionNames.length) return;

    bibleVersions.forEach((version) => {
      const newLiVersion = liVersion.cloneNode(true);
      newLiVersion.classList.add("versionName");
      newLiVersion.removeAttribute("id");
      newLiVersion.querySelector("button").textContent = version.name;
      newLiVersion.dataset.bookVersionId = version.id;
      newLiVersion.querySelector("button").classList.remove("fw-bold");
      newLiVersion.classList.remove("d-none");

      dropdownMenu.append(newLiVersion);
    });
  });

  hideVersionsSection(dropdownMenu);
}

/**
 * Oculta todos os itens correspondentes aos nomes das versões bíblicas no menu suspenso.
 * @param {HTMLElement} dropdownMenu - O contêiner do menu suspenso onde os elementos estão localizados.
 */
function hideVersionNames(dropdownMenu) {
  const versionNames = dropdownMenu.querySelectorAll(".versionName");

  if (versionNames) [...versionNames].forEach((el) => el.classList.add("d-none"));
}

/**
 * Função de inicialização principal (Entry Point) do componente de navegação.
 * Centraliza e dispara a configuração de livros, capítulos e versões.
 * Exportada para permitir inicialização assíncrona sob demanda a partir de outros módulos.
 */
export async function populateNav() {
  populateBookDiv();
}
populateNav();
