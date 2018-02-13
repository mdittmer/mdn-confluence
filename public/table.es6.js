let q = window.location.search;
if (!q) {
  q = window.location.search = '?confluence';
}
let script = document.createElement('script');
script.src = `${q.substr(1)}.es6.js`;
document.body.appendChild(script);
