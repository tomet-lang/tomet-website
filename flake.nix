{
  description = "Tomet documentation site (Astro, rendered by the tomet CLI)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix.url = "github:numtide/treefmt-nix";

    #[ Dev ]
    tomet.url = "git+https://github.com/tomet-lang/tomet.git";
  };

  outputs = inputs: import ./nix inputs;
}
