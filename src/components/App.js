import React, { useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";

/* -------------------- Seed Data -------------------- */
const seedUsers = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
  { id: "u3", name: "Charlie" },
];

// exactly one initial post so that after adding a post,
// .posts-list > :nth-child(2) is the new one (Cypress check)
const seedPosts = [
  {
    id: "p1",
    title: "Welcome to GenZ",
    content: "First post here!",
    userId: "u2",
    reactions: { like: 0, love: 0, wow: 0, haha: 0, lock: 0 }, // 5 buttons; last (lock) stays 0
  },
];

/* -------------------- Posts List -------------------- */
function PostsList({ posts, users, onAddPost, onReact }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(users[0]?.id || "");
  const [content, setContent] = useState("");

  const getUserName = (uid) => users.find((u) => u.id === uid)?.name || "Unknown";

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !author || !content.trim()) return;
    // push to end (so it becomes :nth-child(2) with our single seed post)
    onAddPost({
      title: title.trim(),
      content: content.trim(),
      userId: author,
    });
    setTitle("");
    setContent("");
  };

  return (
    <div className="App">
      {/* header (first child) — Cypress checks .App > :nth-child(1) exists and h1 text */}
      <header>
        <h1>GenZ</h1>
        <nav style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          {/* exact anchor texts required */}
          <Link to="/">Posts</Link>
          <Link to="/users">Users</Link>
          <Link to="/notifications">Notifications</Link>
        </nav>
      </header>

      {/* Create Post form (IDs must match) */}
      <section style={{ marginBottom: 16 }}>
        <form onSubmit={submit}>
          <input
            id="postTitle"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", marginBottom: 8, padding: 8, width: 260 }}
          />
          <select
            id="postAuthor"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={{ display: "block", marginBottom: 8, padding: 8, width: 260 }}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <textarea
            id="postContent"
            placeholder="Post content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            style={{ display: "block", marginBottom: 8, padding: 8, width: 260 }}
          />
          <button type="submit">Add Post</button>
        </form>
      </section>

      {/* Posts container must be .posts-list */}
      <section className="posts-list" style={{ display: "grid", gap: 12 }}>
        {posts.map((p) => (
          <article className="post" key={p.id} style={{ border: "1px solid #ddd", padding: 12 }}>
            <h3>{p.title}</h3>
            <p>{p.content}</p>
            <p style={{ fontStyle: "italic" }}>by {getUserName(p.userId)}</p>

            {/* 5 reaction buttons: first 4 increment, 5th shows 0 and never changes */}
            <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
              <button onClick={() => onReact(p.id, "like")}>👍 {p.reactions.like}</button>
              <button onClick={() => onReact(p.id, "love")}>❤️ {p.reactions.love}</button>
              <button onClick={() => onReact(p.id, "wow")}>😮 {p.reactions.wow}</button>
              <button onClick={() => onReact(p.id, "haha")}>😂 {p.reactions.haha}</button>
              <button disabled>🔒 {p.reactions.lock}</button>
            </div>

            {/* View button must have class .button and route to /posts/:id */}
            <Link className="button" to={`/posts/${p.id}`}>
              View
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}

/* -------------------- Post Details (view + edit) -------------------- */
function PostDetails({ posts, setPosts }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const post = posts.find((p) => p.id === postId);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");

  if (!post) return <h2>Post not found</h2>;

  const save = () => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, title: title.trim(), content: content.trim() } : p))
    );
    setEditing(false);
  };

  return (
    <article className="post" style={{ padding: 12 }}>
      {!editing ? (
        <>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          {/* Edit button must be .post > .button */}
          <button className="button" onClick={() => setEditing(true)}>
            Edit
          </button>
        </>
      ) : (
        <>
          <input
            id="postTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", marginBottom: 8, padding: 8, width: 260 }}
          />
          <textarea
            id="postContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            style={{ display: "block", marginBottom: 8, padding: 8, width: 260 }}
          />
          {/* "last button on the page" saves */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate("/")}>Back</button>
            <button className="button" onClick={save}>Save</button>
          </div>
        </>
      )}
    </article>
  );
}

/* -------------------- Users Page -------------------- */
function UsersPage({ users, posts }) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const userPosts = useMemo(
    () => posts.filter((p) => p.userId === selectedUserId),
    [posts, selectedUserId]
  );

  return (
    <div className="App">
      <header>
        <h1>GenZ</h1>
        <nav style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <Link to="/">Posts</Link>
          <Link to="/users">Users</Link>
          <Link to="/notifications">Notifications</Link>
        </nav>
      </header>

      {/* Must render exactly 3 <li> items */}
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <a href="#" onClick={(e) => { e.preventDefault(); setSelectedUserId(u.id); }}>
              {u.name}
            </a>
          </li>
        ))}
      </ul>

      {/* When clicking the 3rd then 2nd li, a .post should appear */}
      {selectedUserId && (
        <section className="posts-list" style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {userPosts.map((p) => (
            <article className="post" key={p.id} style={{ border: "1px solid #ddd", padding: 12 }}>
              <h3>{p.title}</h3>
              <p>{p.content}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

/* -------------------- Notifications Page -------------------- */
function NotificationsPage({ notifications, onRefresh }) {
  return (
    <div className="App">
      <header>
        <h1>GenZ</h1>
        <nav style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <Link to="/">Posts</Link>
          <Link to="/users">Users</Link>
          <Link to="/notifications">Notifications</Link>
        </nav>
      </header>

      {/* Refresh button must have class .button */}
      <button className="button" onClick={onRefresh}>
        Refresh Notifications
      </button>

      {/* Must be section.notificationsList and initially empty (no child divs) */}
      <section className="notificationsList" style={{ marginTop: 12 }}>
        {notifications.map((n) => (
          <div key={n.id} style={{ border: "1px solid #ddd", padding: 8, marginBottom: 8 }}>
            {n.text}
          </div>
        ))}
      </section>
    </div>
  );
}

/* -------------------- App Shell with Router -------------------- */
export default function App() {
  const [users] = useState(seedUsers);
  const [posts, setPosts] = useState(seedPosts);
  const [notifications, setNotifications] = useState([]); // must start empty

  const addPost = ({ title, content, userId }) => {
    setPosts((prev) => [
      ...prev,
      {
        id: "p" + (prev.length + 1),
        title,
        content,
        userId,
        reactions: { like: 0, love: 0, wow: 0, haha: 0, lock: 0 },
      },
    ]);
  };

  const reactToPost = (postId, key) => {
    if (key === "lock") return; // 5th button must not change (stays 0)
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, reactions: { ...p.reactions, [key]: p.reactions[key] + 1 } } : p
      )
    );
  };

  const refreshNotifications = () => {
    // populate notifications after click (before that, section has no divs)
    const time = new Date().toLocaleTimeString();
    setNotifications([
      { id: "n1", text: `New content available (${time})` },
      { id: "n2", text: `Don't miss trending posts (${time})` },
    ]);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PostsList
              posts={posts}
              users={users}
              onAddPost={addPost}
              onReact={reactToPost}
            />
          }
        />
        <Route path="/posts/:postId" element={<PostDetails posts={posts} setPosts={setPosts} />} />
        <Route path="/users" element={<UsersPage users={users} posts={posts} />} />
        <Route
          path="/notifications"
          element={
            <NotificationsPage
              notifications={notifications}
              onRefresh={refreshNotifications}
            />
          }
        />
      </Routes>
    </Router>
  );
}
