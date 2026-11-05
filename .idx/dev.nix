# Archivo de configuración: .idx/dev.nix
{ pkgs, ... }: {
  
  # Usamos el canal estable de Nix
  channel = "stable-24.05"; 

  # 1. PAQUETES DEL SISTEMA
  packages = [
    pkgs.nodejs_20
    pkgs.jdk17        # Para Firebase Emulators
    pkgs.playwright   # <--- EL NAVEGADOR ROBOT (Pre-instalado)
  ];

  # 2. VARIABLES DE ENTORNO (¡AQUÍ ESTÁ EL ARREGLO!)
    # Configuración de Emuladores para Entorno "Zero-Cost"
    FIRESTORE_EMULATOR_HOST = "0.0.0.0:8080";
    FIREBASE_AUTH_EMULATOR_HOST = "0.0.0.0:9099";
    GCLOUD_PROJECT = "demo-buca";
  };

  # 3. CONFIGURACIÓN DEL EDITOR (IDX)
  idx = {
    # Extensiones útiles para ti
    extensions = [
      "svelte.svelte-vscode"
      "vue.volar"
      "esbenp.prettier-vscode"
      "dbaeumer.vscode-eslint"
    ];

    # Configuración de la Vista Previa (Tus "Ojos")
    previews = {
      enable = true;
      previews = {
        web = {
          # Ejecuta Vite exponiendo el host (0.0.0.0) y usando el puerto dinámico
          command = ["npm" "run" "dev" "--prefix" "buca-app-modular" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
          #cwd = "buca-app-ui"; # Descomenta esto solo si ya creaste la carpeta nueva
        };
      };
    };

    # 4. COMANDOS AUTOMÁTICOS AL INICIAR
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        # Si tienes scripts de inicio, van aquí
      };
    };
  };
}