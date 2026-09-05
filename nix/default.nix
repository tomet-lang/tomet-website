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
      tomet = inputs.tomet.packages.${pkgs.system}.tomet;
    in
    {
      devShells.default = pkgs.callPackage ./dev.nix {
        inherit tomet;
      };

      treefmt = import ./formatter.nix { inherit tomet; };
    };
}
