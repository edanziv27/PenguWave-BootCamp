const API_URL = "http://localhost:3001";

// SECURITY: never put API tokens or secrets in frontend source — it ships to
// every browser and is trivially extractable. Auth uses a per-user session
// token returned by the backend on login and stored client-side.

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let message = "Invalid email or password";
    try {
      const err = await res.json();
      if (err?.error) message = err.error;
    } catch {
      // Non-JSON error body — keep the default message.
    }
    throw new Error(message);
  }

  const data = await res.json();
  if (!data?.token) {
    throw new Error("Login failed: no token returned");
  }
  localStorage.setItem("token", data.token);
  return data;
}

export async function getEvents() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getUsers() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createUser(user: { email: string; password: string; role: string }) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(user),
  });
  return res.json();
}

export async function deleteUser(id: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
