import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:3000";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="ghost" onClick={onClose}>
            ×
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("student");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [newStudent, setNewStudent] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  const studentCount = useMemo(() => students.length, [students]);

  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/students`);
      if (!res.ok) throw new Error("Could not load students");
      const result = await res.json();
      if (!result.success) throw new Error("Could not load students");
      setStudents(result.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleAddStudent = async (event) => {
    event.preventDefault();
    if (!newStudent.name.trim() || !newStudent.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Create failed: ${body || res.statusText}`);
      }
      const result = await res.json();
      if (!result.success) throw new Error("Create failed");
      const created = result.data;
      setStudents((prev) => [...prev, created]);
      setShowAdd(false);
      setNewStudent({ name: "", email: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not create student");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!showDelete) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/students/${showDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Delete failed: ${body || res.statusText}`);
      }
      const result = await res.json();
      if (!result.success) throw new Error("Delete failed");
      setStudents((prev) => prev.filter((s) => s.id !== showDelete.id));
      setShowDelete(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not delete student");
    } finally {
      setSaving(false);
    }
  };

  const pageContent = (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Students</p>
          <h1>Student CRUD</h1>
          <p className="muted">
            Connected to API at <code>{API_BASE}</code>
          </p>
        </div>
        <button className="btn primary" onClick={() => setShowAdd(true)}>
          + Add Student
        </button>
      </div>

      {error && <div className="alert">{error}</div>}
      {loading ? (
        <div className="card">Loading student list...</div>
      ) : (
        <div className="card">
          <div className="subhead">Total students: {studentCount}</div>
          {students.length === 0 ? (
            <div className="empty">No students yet. Add one to begin.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id ?? student._id ?? student.email}>
                    <td>{student.name ?? "Unnamed"}</td>
                    <td>{student.email ?? "No email"}</td>
                    <td>
                      <button
                        className="btn ghost"
                        onClick={() => setShowDelete(student)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Student"
      >
        <form className="form" onSubmit={handleAddStudent}>
          <label>
            Name
            <input
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent((s) => ({ ...s, name: e.target.value }))
              }
              placeholder="Full name"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent((s) => ({ ...s, email: e.target.value }))
              }
              placeholder="email@example.com"
            />
          </label>
          <div className="actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(showDelete)}
        onClose={() => setShowDelete(null)}
        title="Confirm delete"
      >
        <p>
          Delete <strong>{showDelete?.name ?? "this student"}</strong>{" "}
          permanently?
        </p>
        <div className="actions">
          <button className="btn ghost" onClick={() => setShowDelete(null)}>
            Cancel
          </button>
          <button
            className="btn danger"
            onClick={handleDeleteStudent}
            disabled={saving}
          >
            {saving ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">CoachBucket SPA</div>
        <nav>
          <button
            className={page === "student" ? "active" : ""}
            onClick={() => setPage("student")}
          >
            Student
          </button>
        </nav>
      </aside>
      <main className="content">
        {page === "student" ? pageContent : <div>Not Found</div>}
      </main>
    </div>
  );
}

export default App;
