{
  pkgs,
  mkShell,

  tomet,
  ...
}:
mkShell {
  buildInputs = with pkgs; [
    tomet

    nodejs
  ];

  shellHook = ''
    echo "📖 Tomet website -- npm install && npm run dev"
  '';
}
