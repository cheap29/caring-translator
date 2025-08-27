(async function () {
  const keyInput = document.getElementById("key");
  const status = document.getElementById("status");
  const saveBtn = document.getElementById("save");

  const { OPENAI_API_KEY } = await chrome.storage.sync.get("OPENAI_API_KEY");
  if (OPENAI_API_KEY) keyInput.value = OPENAI_API_KEY;

  saveBtn.addEventListener("click", async () => {
    const v = keyInput.value.trim();
    await chrome.storage.sync.set({ OPENAI_API_KEY: v });
    status.textContent = "保存しました。";
    setTimeout(() => (status.textContent = ""), 1500);
  });
})();
