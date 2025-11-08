const API_URL = "http://localhost:4000/api/users";

export async function getAllUsers() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function getUser(uid: string) {
  const res = await fetch(`${API_URL}/${uid}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

export async function addUser(uid: string, passwordHash: string) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, passwordHash }),
  });
  return res.json();
}
