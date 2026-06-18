{ pkgs, ... }:

{
  # Next.js reads .env directly; don't let devenv cache env vars in
  # .devenv/shell-*.sh (those go stale and have bitten the Jang project).
  dotenv.enable = false;
  dotenv.disableHint = true;

  # Node 24 LTS + pnpm, scoped to this project (matches the Dockerfile's
  # node:24 base). System Node is unaffected inside the devenv shell.
  languages.javascript.enable = true;
  languages.javascript.package = pkgs.nodejs_24;
  languages.javascript.pnpm.enable = true;

  # Small CLI helpers used during dev. No Postgres service — storage is a
  # single SQLite file, so there's nothing to run.
  packages = [
    pkgs.jq
    pkgs.sqlite     # `sqlite3` CLI for poking at the db / .backup
    pkgs.litestream # continuous SQLite replication to Spaces (prod parity)
  ];

  enterShell = ''
    echo ""
    echo "Bookmarks dev shell"
    echo "  node : $(node -v 2>/dev/null || echo unavailable)"
    echo "  pnpm : $(pnpm -v 2>/dev/null || echo unavailable)"
    echo "  sqlite: $(sqlite3 --version 2>/dev/null | awk '{print $1}' || echo unavailable)"
    echo ""
    echo "Dev server : pnpm dev   (http://localhost:3001)"
    echo "DB file    : ./data/bookmarks.db"
    echo ""
  '';
}
