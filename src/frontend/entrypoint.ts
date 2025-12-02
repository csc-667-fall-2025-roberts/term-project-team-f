// Import main styles
import "./styles.css";

const button: Element | null = document.querySelector("#test-button");

button?.addEventListener("click", (e) => {
  e.preventDefault();

  setTimeout(() => {
    alert("you clicked 1 sec ago");
  }, 1000);
});
