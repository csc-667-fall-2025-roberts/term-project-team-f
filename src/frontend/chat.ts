import socketIo from "socket.io-client";
import type { ChatMessage } from "../shared/types";
import * as messageKeys from "../shared/chat-keys";

// Use GAME_ID from window (same as Game.ts)
declare global {
  interface Window {
    GAME_ID?: number;
  }
}

const socket = socketIo();

const listing = document.querySelector<HTMLDivElement>("#message-listing");
const messageText = document.querySelector<HTMLInputElement>(
  "#messsage-submit input",
);
const submitButton = document.querySelector<HTMLButtonElement>(
  "#messsage-submit button",
);

// Guard clause - exit if elements don't exist (e.g., on pages without chat)
if (!listing || !messageText || !submitButton) {
  // Chat elements not found on this page
} else {
  let isFirstMessage = true;
  let socketListenersInitialized = false;

  const appendMessage = (username: string, timestamp: Date, message: string) => {
    // Clear placeholder on first message
    if (isFirstMessage) {
      listing.innerHTML = "";
      isFirstMessage = false;
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";

    const time = new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageDiv.innerHTML = `
      <div class="chat-message-content">
        <div class="chat-message-author">${username}</div>
        <span>${message}</span>
        <span style="font-size: 0.75rem; color: var(--color-gray-500); margin-left: 0.5rem;">${time}</span>
      </div>
    `;
    listing.appendChild(messageDiv);
    listing.scrollTop = listing.scrollHeight;
  };

  // Join appropriate room (lobby or game) and load existing messages
  // GAME_ID is always defined (0 for lobby, game.id for game pages)
  const gameId = typeof window.GAME_ID !== "undefined" ? window.GAME_ID : 0;
  
  // Always join room and load messages (lobby uses gameId = 0)
  socket.emit("joinGameRoom", gameId);
  
  // Only register socket listeners once to prevent duplicates
  if (!socketListenersInitialized) {
    socketListenersInitialized = true;
    
    socket.on(
      messageKeys.CHAT_LISTING(gameId),
      ({ messages }: { messages: ChatMessage[] }) => {
        messages.forEach((msg) => {
          appendMessage(msg.username, msg.created_at, msg.message);
        });
      },
    );

    socket.on(messageKeys.CHAT_MESSAGE(gameId), (msg: ChatMessage) => {
      appendMessage(msg.username, msg.created_at, msg.message);
    });
  }
  
  // Load existing messages
  fetch(`/chat/${gameId}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load messages: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      if (data.messages && Array.isArray(data.messages)) {
        data.messages.forEach((msg: ChatMessage) => {
          appendMessage(msg.username, msg.created_at, msg.message);
        });
      }
    })
    .catch((err) => console.error("Failed to load messages:", err));

  const sendMessage = () => {
    const message = messageText.value.trim();

    if (message.length > 0) {
      fetch(`/chat/${gameId}`, {
        method: "POST",
        body: JSON.stringify({ message }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (!res.ok) {
            console.error("Failed to send message:", res.status);
          }
        })
        .catch((err) => {
          console.error("Error sending message:", err);
        });
      messageText.value = "";
    }
  };

  submitButton.addEventListener("click", (event) => {
    event.preventDefault();
    sendMessage();
  });

  messageText.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
}
