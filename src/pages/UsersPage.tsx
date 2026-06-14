import { useState } from "react";
import { User } from "../types";
import { getCurrentUser, nameFromEmail } from "../currentUser";
import RoleBadge from "../components/RoleBadge";
import Tabs from "../components/Tabs";

const TABS = [
  { id: "users", label: "Users" },
  { id: "add", label: "Add User" },
];

export default function UsersPage() {
  // NOTE: demo-only management UI. There is no backend, so this is local state
  // and the page is not access-controlled (no real auth in this track).
  const currentUser = getCurrentUser();

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "admin@penguwave.io", role: "admin", status: "active" },
    { id: "2", email: "analyst@penguwave.io", role: "analyst", status: "active" },
    { id: "3", email: "viewer@penguwave.io", role: "viewer", status: "disabled" },
  ]);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("analyst");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    // The password is collected to send to a backend on creation, but is never
    // stored in client state or rendered back to the screen.
    const newUser: User = {
      id: String(Date.now()),
      email: newEmail,
      role: newRole,
      status: "active",
    };

    setUsers([...users, newUser]);
    setNewEmail("");
    setNewPassword("");
    setNewRole("analyst");
    setActiveTab("users");
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p className="page-subtitle">Signed in as {currentUser.name}</p>
        </div>
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === "users" && (
        <>
          <p className="table-meta">{users.length} users</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{nameFromEmail(user.email)}</td>
                  <td className="cell-mono">{user.email}</td>
                  <td>
                    <RoleBadge role={user.role} />
                  </td>
                  <td>
                    <span className={`status-dot status-${user.status}`}>{user.status}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && <p className="no-results">No users.</p>}
        </>
      )}

      {activeTab === "add" && (
        <div className="form-card">
          <h3>New User</h3>
          <form onSubmit={handleAddUser}>
            <div className="form-field">
              <label htmlFor="new-email">Email</label>
              <input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@penguwave.io"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="new-password">Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="new-role">Role</label>
              <select id="new-role" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Create User
              </button>
              <button type="button" className="btn-secondary" onClick={() => setActiveTab("users")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
