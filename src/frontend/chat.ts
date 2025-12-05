import socketIo from "socket.io-client";
import type { ChatMessage } from "../shared/types";
import * as messageKeys from "../shared/chat-keys";

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

  socket.on(
    messageKeys.CHAT_LISTING(),
    ({ messages }: { messages: ChatMessage[] }) => {
      messages.forEach((msg) => {
        appendMessage(msg.username, msg.created_at, msg.message);
      });
    },
  );

  socket.on(messageKeys.CHAT_MESSAGE(), (msg: ChatMessage) => {
    appendMessage(msg.username, msg.created_at, msg.message);
  });

  const sendMessage = () => {
    const message = messageText.value.trim();

    if (message.length > 0) {
      fetch("/chat/", {
        method: "POST",
        body: JSON.stringify({ message }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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
