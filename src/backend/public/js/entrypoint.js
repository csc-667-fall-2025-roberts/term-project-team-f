const t = document.querySelector("#test-button");
t?.addEventListener("click", (e) => {
  (e.preventDefault(),
    setTimeout(() => {
      alert("you clicked 1 sec ago");
    }, 1e3));
});
//# sourceMappingURL=entrypoint.js.map
