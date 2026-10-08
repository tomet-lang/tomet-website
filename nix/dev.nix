{
  pkgs,
  mkShell,

  tomet,
  tomet-lsp,
  twrit,
  ...
}:
mkShell {
  buildInputs = with pkgs; [
    #= Develop
    tomet
    tomet-lsp
    twrit
    just
    deno

    #= Runtime
    nodejs
  ];

  shellHook = ''
    echo "📖 Tomet"
  '';
}
