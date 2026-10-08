{
  description = "Tomet documentation site (Astro, rendered by the tomet CLI)";

  nixConfig = {
    extra-substituters = [ "https://tomet.cachix.org" ];
    extra-trusted-public-keys = [ "tomet.cachix.org-1:9c/iO8Tb6YOM+3r55t12W3fOJK+66itPEaIe8Rs9MDw=" ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    #= Tool
    tomet.url = "github:tomet-lang/tomet";
    twrit.url = "github:tomet-lang/tomet-writ";
  };

  outputs = inputs: import ./nix inputs;
}
