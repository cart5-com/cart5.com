# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.pnpm
  ];
  # Sets environment variables in the workspace
  env = {
    PORT = "3002";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [ 
      "astro-build.astro-vscode" 
      "Vue.volar"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        # install = ''
        #   npm ci --prefer-offline --no-audit --no-progress --timing || npm i --no-audit --no-progress --timing
        #   yes | npx astro add tailwind'';
        install = ''pnpm i'';
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "package.json" ];
      };
      # To run something each time the workspace is (re)started, use the `onStart` hook
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command =
            [ "pnpm" "dev" ];
          manager = "web";
        };
      };
    };
  };
}
