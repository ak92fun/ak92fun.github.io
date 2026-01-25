// js/site.js
(function () {
  const externalLinks = document.querySelectorAll('a.external');

  for (const link of externalLinks) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
})();

