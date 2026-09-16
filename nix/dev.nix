{
  pkgs,
  mkShell,

  tomet,
  twrit,
  ...
}:
mkShell {
  buildInputs = with pkgs; [
    tomet
    twrit

    nodejs
  ];

  shellHook = ''
    echo "📖 Tomet"
  '';
}
