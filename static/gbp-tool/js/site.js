const { DISCLAIMER_TEXT, OFFICIAL_LINKS } = window.SiteContent;

function renderDisclaimerBlocks() {
  document.querySelectorAll("[data-disclaimer]").forEach((element) => {
    if (element.textContent.trim()) {
      return;
    }

    const variant = element.dataset.disclaimer;
    element.textContent =
      variant === "short" ? DISCLAIMER_TEXT.short : DISCLAIMER_TEXT.full;
  });
}

function renderOfficialLinkContainers() {
  document.querySelectorAll("[data-official-links]").forEach((element) => {
    if (element.children.length) {
      return;
    }

    const key = element.dataset.officialLinks;
    const links = OFFICIAL_LINKS[key] ?? [];

    element.innerHTML = links
      .map(
        (link) => `
          <li class="link-list__item">
            <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>
            <p>${link.description}</p>
          </li>
        `,
      )
      .join("");
  });
}

function renderYear() {
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = `${new Date().getFullYear()}`;
  });
}

renderDisclaimerBlocks();
renderOfficialLinkContainers();
renderYear();
