# Archivo de configuración: .idx/dev.nix (B.U.C.A. AI - Vanilla JS + Vite + Supabase)
{ pkgs, ... }: {
  
  # Canal estable de Nix
  channel = "stable-24.05";

  # 1. PAQUETES DEL SISTEMA
  packages = [
    pkgs.nodejs_20
  ];

  # 2. VARIABLES DE ENTORNO
  env = {
    NODE_ENV = "development";
  };

  # 3. CONFIGURACIÓN DEL EDITOR (IDX)
  idx = {
    # Extensiones útiles estrictamente alineadas con CERO FRAMEWORKS (Vanilla JS + SCSS)
    extensions = [
      "esbenp.prettier-vscode"
      "dbaeumer.vscode-eslint"
      "stylelint.vscode-stylelint"
    ];

    # Configuración de la Vista Previa
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };

    # 4. COMANDOS AUTOMÁTICOS AL INICIAR
    workspace = {
      onCreate = {
        npm-install = "npm ci";
      };
      onStart = {
        # Scripts de arranque si aplica
      };
    };
  };
}
