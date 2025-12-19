// Import main styles
import "./styles.css";

import "./Game.ts";

// App initialization
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("start-game-btn");
  if (btn) {
    //start a game when a player clicks "start game"
    btn.addEventListener("submit", async (e) => {
      e.preventDefault;
      try {
      const retVal = await fetch(`/games/${GAME_ID}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
      });

      if (!retVal.ok) {
        alert("Failed to start the game...");
        return;
      }
      //preventing double clicking
      btn.disabled = true;

      //refresh to be in the newly started game
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Problem while starting the game...");
    }
    
    });
  }
  // Add any global initialization logic here
});
