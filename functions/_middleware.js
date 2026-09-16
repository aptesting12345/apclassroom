const PROTECTED_PAGES = new Set([
  "/wordle.html",
  "/snake.html",
  "/connections.html",
  "/crossword.html",
  "/minesweeper.html",
  "/2048.html",
  "/tetris.html",
  "/sudoku.html",
  "/games/v1.2.5/index.html"
]);

const PROTECTED_PREFIXES = [
  "/games/v1.2.5/",
  "/games/JavaScript/"
];

function hasCalculatorAccess(request) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.split(";").some(part => part.trim() === "calc_ready=1");
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const isProtected =
    PROTECTED_PAGES.has(url.pathname) ||
    PROTECTED_PREFIXES.some(prefix => url.pathname.startsWith(prefix));

  if (isProtected && !hasCalculatorAccess(context.request)) {
    return Response.redirect(`${url.origin}/index.html`, 302);
  }

  return context.next();
}
