{
  description = "Tomet documentation site (Astro, rendered by the tomet CLI)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    #= Tool
    tomet = {
      url = "github:tomet-lang/tomet";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    twrit = {
      url = "github:tomet-lang/tomet-writ";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.tomet.follows = "tomet";
    };
  };

  outputs = inputs: import ./nix inputs;
}
