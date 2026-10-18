{
  flake-parts,
  ...
}@inputs:
flake-parts.lib.mkFlake { inherit inputs; } {
  systems = [
    "x86_64-linux"
    "aarch64-linux"
    "aarch64-darwin"
  ];
  imports = [
    inputs.treefmt-nix.flakeModule
  ];

  perSystem =
    { pkgs, ... }:
    let
      system = pkgs.stdenv.hostPlatform.system;
      sisho = inputs.sisho.packages.${system};
      sishoLib = inputs.sisho.legacyPackages.${system};
    in
    {
      devShells.default = pkgs.callPackage ./dev.nix {
        # sisho, tomet and twrit, with the language server.
        tools = sishoLib.combine [
          sisho.toolchain
          sisho.tomet-lsp
        ];
      };

      treefmt = import ./formatter.nix {
        tomet = sisho.tomet;
      };
    };
}
