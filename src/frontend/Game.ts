import io from "socket.io-client";
import type { Game, GamePlayer } from "../shared/types";

const socket = io();

// Get GAME_ID 
declare global {
  interface Window {
    GAME_ID: number;
    PLAYER_HAND: string[];
    CURRENT_USER_ID: number;
    GAME_STATE: string;
  }
}

interface CurrentGame extends Partial<Game> {
  myHand: string[];
  players: (GamePlayer & { current_turn?: boolean })[];
}

const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

//Game State
let currentGame: CurrentGame;

// Helper function for card strings
function parseCard(card: string): { rank: string; suit: string } {
  if (card.length < 2) return { rank: card, suit: "" };
  
  const rankMap: { [key: string]: string } = {
    "A": "A", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
    "J": "J", "Q": "Q", "K": "K",
  };
  
  const suitMap: { [key: string]: string } = {
    "H": "♥", "D": "♦", "C": "♣", "S": "♠",
  };
  
  const rank = card.slice(0, -1);
  const suit = card.slice(-1).toUpperCase();
  
  return {
    rank: rankMap[rank] || rank,
    suit: suitMap[suit] || suit,
  };
}

function getNextValidRanks(currentRank: string | null): string[] {
  if (!currentRank || !RANKS.includes(currentRank)) {
    return RANKS;
  }
  const idx = RANKS.indexOf(currentRank);
  const up = RANKS[(idx + 1) % RANKS.length];
  const down = RANKS[(idx - 1 + RANKS.length) % RANKS.length];
  return [up, down];
}

function normalizeRank(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim().toUpperCase();
  const map: Record<string, string> = {
    "ACE": "A", "A": "A",
    "KING": "K", "K": "K",
    "QUEEN": "Q", "Q": "Q",
    "JACK": "J", "J": "J",
  };

  if (map[trimmed]) return map[trimmed];
  if (RANKS.includes(trimmed)) return trimmed;
  return null;
}

function promptForDeclaredRank(selectedCards: string[]): string | null {
  const validNextRanks = getNextValidRanks(currentGame.current_rank);
  const defaultRank = parseCard(selectedCards[0]).rank;
  const instruction = currentGame.last_played_by
    ? `(Hint: Play ${validNextRanks.join(" or ")} - or bullshit!)`
    : "(First play - any card)";
  
  const input = window.prompt(
    `What card are you claiming? ${instruction}\n${RANKS.join(", ")}`,
    defaultRank
  );

  const normalized = normalizeRank(input);
  if (!normalized) {
    alert("Please enter a valid card (A, 2-10, J, Q, K)");
    return null;
  }
  
  return normalized;
}

// Initialize game 
document.addEventListener("DOMContentLoaded", async () => {
  currentGame = {
    id: typeof window.GAME_ID !== "undefined" ? window.GAME_ID : 0,
    myHand: [], players: [], current_turn: null, current_rank: null, state: "waiting", pile: [], last_played_count: 0, last_played_by: null,
  };
    
  // Fetch the  game state and hand from 
  try {
    const response = await fetch(`/games/${window.GAME_ID}/state`);
    if (response.ok) {
      const data = await response.json();
      currentGame.myHand = data.playerHand || [];
      currentGame.players = data.players || [];
      currentGame.state = data.game.state;
      currentGame.pile = data.game.pile || [];
      currentGame.current_turn = data.game.current_turn;
      currentGame.current_rank = data.game.current_rank;
      currentGame.last_played_count = data.game.last_played_count;
      currentGame.last_played_by = data.game.last_played_by;
      
      console.log("Game state loaded:", currentGame);
      console.log("Hand loaded with", currentGame.myHand.length, "cards");
    }
  } catch (error) {
    console.error("Failed to fetch game state:", error);
  }
  
  initializeGame();
});

function initializeGame() {
  // Join the game room
  socket.emit("joinGameRoom", window.GAME_ID);
  
  // check for player joined 
  socket.on("playerJoined", () => {
    console.log("Player joined, reloading page");
    setTimeout(() => window.location.reload(), 500);
  });

  // Check for game start
  socket.on("gameStarted", () => {
    console.log("Game started, reloading page");
    setTimeout(() => window.location.reload(), 500);
  });
  
  // Check for game updates
  socket.on("gameUpdate", async (data: { game: Partial<Game>; players: GamePlayer[] }) => {
    console.log("Received game update:", data);
    
    // Fetch updated hand
    try {
      const response = await fetch(`/games/${window.GAME_ID}/state`);
      if (response.ok) {
        const updatedData = await response.json();
        currentGame.myHand = updatedData.playerHand || [];
        currentGame.players = updatedData.players || [];
        currentGame.state = updatedData.game.state;
        currentGame.pile = updatedData.game.pile || [];
        currentGame.current_turn = updatedData.game.current_turn;
        currentGame.current_rank = updatedData.game.current_rank;
        currentGame.last_played_count = updatedData.game.last_played_count;
        currentGame.last_played_by = updatedData.game.last_played_by;
        
        console.log("Game state refreshed, my hand:", currentGame.myHand.length, "cards");
        renderGameState();
      }
    } catch (error) {
      console.error("Failed to refresh game state:", error);
    }
  });

  socket.on("playerAction", (action: { type: string; data?: any }) => {
    handlePlayerAction(action);
  });

  socket.on("gameEnded", (result: { winner: string }) => {
    handleGameEnd(result);
  });

  socket.on("error", (error: string | Error) => {
    console.error("Game error:", error);
    const errorMsg = typeof error === "string" ? error : error.message;
    alert(`Error: ${errorMsg}`);
  });

  setupGameButtons();
  
  renderGameState();
}

function setupGameButtons() {
  // Play card button
  const playButton = document.getElementById("play-card-btn");
  if (playButton) {
    playButton.onclick = playCard;
  }

  // Challenge button
  const challengeButton = document.getElementById("challenge-btn");
  if (challengeButton) {
    challengeButton.onclick = challengePlay;
  }

  // Card select
  const handContainer = document.getElementById("player-hand");
  if (handContainer) {
    handContainer.onclick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest(".card");
      if (card) {
        card.classList.toggle("selected");
        updatePlayButtonState();
      }
    };
  }
}

function updatePlayButtonState() {
  const selectedCards = document.querySelectorAll(".card.selected");
  const playButton = document.getElementById("play-card-btn") as HTMLButtonElement | null;
  const isMyTurn = currentGame.current_turn === window.CURRENT_USER_ID;
  
  if (playButton) {
    playButton.disabled = selectedCards.length === 0 || !isMyTurn;
    playButton.textContent = `🃏 Play Cards (${selectedCards.length} selected)`;
  }
}

function playCard() {
  // Get selected cards
  const selectedCards = document.querySelectorAll(".card.selected");
  if (selectedCards.length === 0) {
    alert("Please select cards to play");
    return;
  }

  const cards = Array.from(selectedCards).map((el) => {
    const htmlEl = el as HTMLElement;
    return htmlEl.dataset.card || "";
  }).filter(c => c);

  const declaredRank = promptForDeclaredRank(cards);
  if (!declaredRank) {
    return;
  }

  // Send play action 
  socket.emit("playCards", {
    id: currentGame.id,
    cards: cards,
    declaredRank,
  });

  // Clear
  selectedCards.forEach((card) => card.classList.remove("selected"));
  updatePlayButtonState();
}

function challengePlay() {
  socket.emit("challenge", {
    id: currentGame.id,
  });
}

function handlePlayerAction(action: { type: string; [key: string]: any }) {
  console.log("Player action:", action);

  if (action.type === "challengeResult") {
    const { liar, challengerName, challengedName, declaredRank, revealed } = action;
    const verdict = liar ? `${challengedName} was bullshitting!` : `${challengerName} guessed wrong.`;
    const revealText = Array.isArray(revealed) ? `Revealed: ${revealed.join(", ")}` : "";
    alert(`${challengerName} challenged ${challengedName} on ${declaredRank}. ${verdict} ${revealText}`);
  }

  // Update Interface 
  renderGameState();
}

function renderGameState() {
  // Render hand
  const handContainer = document.getElementById("player-hand");
  if (handContainer && currentGame.myHand) {
    handContainer.innerHTML = currentGame.myHand
      .map((card) => {
        const { rank, suit } = parseCard(card);
        const suitClass = suit === "♥" || suit === "♦" ? "red" : "black";
        return `<div class="card ${suitClass}" data-card="${card}" style="cursor: pointer; padding: 12px 10px; margin: 4px; border: 3px solid #333; border-radius: 8px; background: white; color: black; min-width: 60px; text-align: center; transition: all 0.2s; user-select: none;">
          <span style="font-weight: bold; font-size: 1.2em;">${rank}</span>
          <br/>
          <span style="font-size: 1.5em;">${suit}</span>
        </div>`;
      })
      .join("");
    
    //button handlers
    setupGameButtons();
  }

  // Update card count
  const cardCountBadge = document.getElementById("card-count");
  if (cardCountBadge) {
    cardCountBadge.textContent = `${currentGame.myHand?.length || 0} cards`;
  }

  // Render pile
  const pileContainer = document.getElementById("pile");
  if (pileContainer) {
    pileContainer.innerHTML = `
      <div class="pile-count">${currentGame.pile?.length || 0}</div>
      <div class="pile-label">cards in pile</div>
    `;
  }

  const rankContainer = document.getElementById("current-rank");
  if (rankContainer) {
    const claimed = currentGame.current_rank || "No claim yet";
    const count = currentGame.last_played_count || 0;
    const countText = count > 0 ? ` (${count} card${count === 1 ? "" : "s"})` : "";
    const lastPlayer = (currentGame.players || []).find((p) => p.user_id === currentGame.last_played_by);
    const byText = lastPlayer?.username ? ` by ${lastPlayer.username}` : "";
    rankContainer.textContent = `Declared: ${claimed}${countText}${byText}`;
  }

  const hintContainer = document.getElementById("next-rank-hint");
  if (hintContainer) {
    const validNextRanks = getNextValidRanks(currentGame.current_rank);
    const isMyTurn = currentGame.current_turn === window.CURRENT_USER_ID;
    
    if (isMyTurn) {
      hintContainer.textContent = `📋 Your turn! Play ${validNextRanks.join(" or ")} next`;
      hintContainer.style.color = "#4CAF50";
      hintContainer.style.fontWeight = "bold";
    } else if (currentGame.last_played_by) {
      const nextPlayer = (currentGame.players || []).find((p) => p.user_id === currentGame.current_turn);
      const nextName = nextPlayer?.username || "Next player";
      hintContainer.textContent = `⏳ ${nextName} must play ${validNextRanks.join(" or ")}`;
      hintContainer.style.color = "#ffd700";
      hintContainer.style.fontWeight = "normal";
    } else {
      hintContainer.textContent = "";
    }
  }

  // Render players
  const playersContainer = document.getElementById("players-list");
  if (playersContainer) {
    playersContainer.innerHTML = (currentGame.players || [])
      .map(
        (player) =>
          `<div class="player-item ${player.user_id === currentGame.current_turn ? "current-turn" : ""}">
        ${player.username}: ${player.hand?.length || 0} cards
      </div>`
      )
      .join("");
  }

  // Update game status
  const statusContainer = document.getElementById("game-status");
  if (statusContainer) {
    const isMyTurn = currentGame.current_turn === window.CURRENT_USER_ID;
    const turnText = isMyTurn ? "Your turn!" : "Waiting for other player...";
    console.log("Turn check - current_turn:", currentGame.current_turn, "my ID:", window.CURRENT_USER_ID, "isMyTurn:", isMyTurn);
    statusContainer.textContent = `Status: ${currentGame.state} - ${turnText}`;
  }

  // button states
  const isMyTurn = currentGame.current_turn === window.CURRENT_USER_ID;
  const playButton = document.getElementById("play-card-btn") as HTMLButtonElement | null;
  const challengeButton = document.getElementById("challenge-btn") as HTMLButtonElement | null;
  const passButton = document.getElementById("pass-btn") as HTMLButtonElement | null;
  
  if (playButton) {
    playButton.disabled = !isMyTurn;
  }
  if (challengeButton) {
    challengeButton.disabled = !isMyTurn;
  }
  
  updatePlayButtonState();
}

function handleGameEnd(result: { winner: string }) {
  console.log("Game ended:", result);
  alert(`Game Over! Winner: ${result.winner}`);
  window.location.href = "/lobby";
}

export { socket, currentGame };
