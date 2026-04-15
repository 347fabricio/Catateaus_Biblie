/**
 * Inicializa o comportamento do cabeçalho, selecionando os elementos e configurando o evento de clique.
 */
export function header() {
  const navDiv = document.querySelector("#navDiv");
  const chevronDiv = document.querySelector("#chevronDiv");
  const chevronIcon = document.querySelector(".bi-chevron-compact-down");

  chevronDiv.addEventListener("click", () => {
    toggleNavigation(navDiv, chevronIcon);
  });
}

/**
 * Verifica o estado atual da navegação e decide se deve ocultá-la ou exibi-la.
 * @param {HTMLElement} navDiv - O contêiner de navegação principal.
 * @param {HTMLElement} chevronIcon - O ícone de seta que indica o estado (aberto/fechado).
 */
function toggleNavigation(navDiv, chevronIcon) {
  const isNavVisible = navDiv.classList.contains("nav-visible");

  isNavVisible ? hideNavigation(navDiv, chevronIcon) : showNavigation(navDiv, chevronIcon);
}

/**
 * Aplica as classes e estilos necessários para ocultar a barra de navegação e redefinir o ícone.
 * @param {HTMLElement} navDiv - O contêiner de navegação a ser ocultado.
 * @param {HTMLElement} chevronIcon - O ícone de seta a ser rotacionado para a posição original.
 */
export function hideNavigation(navDiv, chevronIcon) {
  chevronIcon.classList.replace("opacity-75", "opacity-25");
  chevronIcon.style.transform = "rotate(0deg)";
  navDiv.classList.replace("nav-visible", "nav-hidden");
}

/**
 * Aplica as classes e estilos necessários para exibir a barra de navegação e rotacionar o ícone.
 * @param {HTMLElement} navDiv - O contêiner de navegação a ser exibido.
 * @param {HTMLElement} chevronIcon - O ícone de seta a ser rotacionado (180 graus).
 */
function showNavigation(navDiv, chevronIcon) {
  chevronIcon.classList.replace("opacity-25", "opacity-75");
  chevronIcon.style.transform = "rotate(180deg)";
  navDiv.classList.replace("nav-hidden", "nav-visible");
}

header();
