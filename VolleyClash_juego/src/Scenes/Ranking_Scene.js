// Ranking_Scene.js
import Phaser from "phaser";
import { createIconButton } from "../UI/Buttons.js";

export class Ranking_Scene extends Phaser.Scene {
  constructor() {
    super("Ranking_Scene");
    this.rankingLines = [];  
  }

  preload() {
    this.load.image("botonVolver", "ASSETS/UI/BOTONES/FLECHA_VOLVER.png");
    this.load.image("fondoMenuPrincipal", "ASSETS/FONDOS/MENU_PRINCIPAL.png");
    this.load.audio("sonidoClick", "ASSETS/SONIDO/SonidoBoton.mp3");
  }

  async create() {
    const { width, height } = this.scale;

    const style = this.game.globals?.defaultTextStyle ?? {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
    };

    // fondo
    this.add
      .image(0, 0, "fondoMenuPrincipal")
      .setOrigin(0)
      .setDepth(-2)
      .setDisplaySize(width, height);

    // capa oscura por encima
    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0).setDepth(-1);

    // tarjeta del ranking
    const cardWidth = width * 0.42;
    const cardHeight = height * 0.56;
    const cardX = width * 0.75;
    const cardY = height * 0.50;

    const card = this.add.rectangle(cardX, cardY, cardWidth, cardHeight, 0x111111, 0.7).setOrigin(0.5);
    card.setStrokeStyle(2, 0xffffff, 0.2);

    // título
    this.add
      .text(cardX, height * 0.1, "Ranking", {
        ...style,
        fontSize: "42px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // subtítulo
    this.add
      .text(cardX, cardY - cardHeight * 0.42, "TOP 5 por partidas ganadas", {
        ...style,
        fontFamily: "VT323",
        fontSize: "34px",
        color: "#f5d76e",
      })
      .setOrigin(0.5);

    // texto del ranking (se actualiza tras el fetch)
    this.rankingText = this.add
      .text(cardX, cardY - cardHeight * 0.30, "Cargando...", {
        ...style,
        fontFamily: "VT323",
        fontSize: "30px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 10,
      })
      .setOrigin(0.5, 0);

    // botón volver 
    createIconButton(this, {
      x: width * 0.06,
      y: height * 0.08,
      texture: "botonVolver",
      scale: 1,
      hoverScale: 1.1,
      onClick: () => this.scene.start("Menu_Scene"),
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    // cargar ranking
    await this.loadRanking();

    // Refresco automático cada 10 segundos 
    this.rankingTimer = this.time.addEvent({
      delay: 10000,
      callback: () => this.loadRanking(),
      loop: true
    });
  }

  async loadRanking() {
    try {
        
      const res = await fetch("/api/topPlayers", { cache: "no-store" });
      const data = await res.json();

      const topPlayers = data.topPlayers ?? [];
      if (!Array.isArray(topPlayers) || topPlayers.length === 0) {
        this.rankingText.setText("Todavía no hay datos.");
        return;
      }

      // Formato tipo: "1. Marco — 5W (10J / 5L)"
      const lines = topPlayers.map((p, i) => {
        const wins = p.partidasGanadas ?? 0;
        const played = p.partidaJugadas ?? 0;
        const losses = p.partidasPerdidas ?? 0;

        return `${i + 1}. ${p.username} — ${wins}W (${played}J / ${losses}L)`;
      });

      this.rankingText.setText(lines.join("\n"));
    } catch (err) {
      console.error("Error cargando ranking:", err);
      this.rankingText.setText("Error cargando ranking.");
    }
  }

  shutdown() {
    if (this.rankingTimer) {
      this.rankingTimer.remove(false);
      this.rankingTimer = null;
    }
  }
}