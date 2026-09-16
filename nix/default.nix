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
    {
      devShells.default = pkgs.callPackage ./dev.nix {
        tomet = inputs.tomet.packages.${pkgs.stdenv.hostPlatform.system}.tomet;
        twrit = inputs.twrit.packages.${pkgs.stdenv.hostPlatform.system}.twrit;
      };

      treefmt = import ./formatter.nix {
        tomet = inputs.tomet.packages.${pkgs.stdenv.hostPlatform.system}.tomet;
      };
    };
}
