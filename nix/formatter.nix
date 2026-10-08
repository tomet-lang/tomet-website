{ tomet, ... }:
{
  projectRootFile = "flake.nix";
  programs = {
    #= Nix
    nixfmt.enable = true;
    statix.enable = true;
    deadnix.enable = true;
    #= Shell
    shfmt.enable = true;
    shellcheck.enable = true;

    #= Web
    prettier.enable = true;
  };
  settings = {
    # https://github.com/numtide/treefmt-nix/issues/171
    global.excludes = [
      "dist/*"
      "package-lock.json"
    ];

    formatter = {
      tomet = {
        command = "${tomet}/bin/tomet";
        options = [
          "format"
          "-i"
        ];
        includes = [ "*.tmt" ];
      };
    };

    shfmt = {
      includes = [ "*.sh" ];
    };
    prettier = {
      includes = [
        "*.astro"
        "*.css"
        "*.js"
        "*.mjs"
        "*.ts"
        "*.json"
      ];
    };
  };
}
