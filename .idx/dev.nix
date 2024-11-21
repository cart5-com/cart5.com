# To learn more about how to use Nix to configure your environment
# see: https: //developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https: //search.nixos.org/packages to find packages
  packages = [ pkgs.nodejs_20 pkgs.pnpm pkgs.caddy pkgs.turso-cli pkgs.ansible ];
  # Sets environment variables in the workspace
  env = { };
  idx = {
    # Search for the extensions you want on https: //open-vsx.org/ and use "publisher.id"
    extensions = [ "astro-build.astro-vscode" "Vue.volar" ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        install = ''pnpm install && cp .env.example .env'';
        # Open editors for the following files by default, if they exist:
        default.openFiles = [
          # "apps/web-astro/src/pages/index.astro"
        ];
      };
      # To run something each time the workspace is (re)started, use the `onStart` hook
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          #   command = [ "pnpm" "run" "dev" ];
          command = [ "pnpm" "run" "dev" ];
          manager = "web";
        };
      };
    };
  };
}
