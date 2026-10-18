{
  pkgs,
  mkShell,

  tools,
  ...
}:
mkShell {
  buildInputs = with pkgs; [
    #= Develop
    tools
    just
    deno

    #= Runtime
    nodejs
  ];

  shellHook = ''
    echo "📖 Tomet"
  '';
}
