const USERNAME = "MADUSANKA";
const PASSWORD = "damith";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username !== USERNAME || password !== PASSWORD) {
        document.getElementById("loginMessage").textContent =
            "❌ Invalid username or password";
        return;
    }

    // Login accepted
    localStorage.setItem("adminLoggedIn", "true");

    document.getElementById("loginMessage").textContent =
        "✅ Login successful!";

    setTimeout(() => {
        window.location.href = "admin-panel.html";
    }, 700);
});
