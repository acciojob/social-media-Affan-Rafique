import React, { useEffect, useMemo, useState } from "react";

/* -------------------- Seed Data -------------------- */
const seedUsers = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
  { id: "u3", name: "Charlie" },
];

// Two seed posts so `.posts-list > :nth-child(2) > .button` always exists
const seedPosts = [
  {
    id: "p1",
    title: "Welcome to GenZ",
    content: "First post here!",
    userId: "u2",
    reactions: { like: 0, love: 0, wow: 0, haha: 0, lock: 0 },
  },
  {
    id: "p2",
    title: "Getting started",
    content: "Create, react and edit posts!",
    userId: "u1",
    reactions: { like: 0, love: 0, wow: 0, haha: 0, lock: 0 },
  },
];

/* -------------------- Tiny Router (no deps) -------------------- */
function matchRoute(pathname) {
  if (pathname === "/") return { key: "home", params: {} };
  if (pathname === "/users") return { key: "users", params: {} };
  if (pathname === "/notifications") return { key: "notifications", params: {} };
  const m = pathname.match(/^\/posts\/([^/]+)$/);
  if (m) return { key: "post", params: { id: m[1] } };
  return { key: "notfound", params: {} };
}

function navigate(href) {
  if (window.location.pathname === href) return;
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function useLinkInterceptor() {
  useEffect(() => {
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      let a = e.target;
      while (a && a.tagName !== "A") a = a.parentElement;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;
      e.preventDefault();
      navigate(href);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

/* -------------------- Shared Header -------------------- */
function HeaderNav() {
  return (
    <header>
      <h1>GenZ</h1>
      <nav style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <a href="/">Posts</a>
        <a href="/users">Users</a>
        <a href="/notifications">Notifications</a>
      </nav>
    </header>
  );
}

/* -------------------- Screens -------------------- */
function PostsList({ posts, users, onAddPost, onReact }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(users[0]?.id || "");
  const [content, setContent] = useState("");

  const getUserName = (uid) => users.find((u) => u.id === uid)?.name || "Unknown";

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !author || !content.trim()) return;
    onAddPost({ title: title.trim(), content: content.trim(), userId: author });
    setTitle("");
    setContent("");
  };

  return (
    <div className="App">
      <HeaderNav />

      {/* Create Post form */}
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

      {/* Posts container */}
      <section className="posts-list" style={{ display: "grid", gap: 12 }}>
        {posts.map((p) => (
          <article className="post" key={p.id} style={{ border: "1px solid #ddd", padding: 12 }}>
            <h3>{p.title}</h3>
            <p>{p.content}</p>
            <p style={{ fontStyle: "italic" }}>by {getUserName(p.userId)}</p>

            {/* Reactions (5th stays 0) */}
            <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
              <button onClick={() => onReact(p.id, "like")}>👍 {p.reactions.like}</button>
              <button onClick={() => onReact(p.id, "love")}>❤️ {p.reactions.love}</button>
              <button onClick={() => onReact(p.id, "wow")}>😮 {p.reactions.wow}</button>
              <button onClick={() => onReact(p.id, "haha")}>😂 {p.reactions.haha}</button>
              <button disabled>🔒 {p.reactions.lock}</button>
            </div>

            {/* View link with .button */}
            <a className="button" href={`/posts/${p.id}`}>View</a>
          </article>
        ))}
      </section>
    </div>
  );
}

function PostDetails({ posts, setPosts, postId }) {
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
          <button className="button" onClick={() => setEditing(true)}>Edit</button>
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
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/">Back</a>
            <button className="button" onClick={save}>Save</button>
          </div>
        </>
      )}
    </article>
  );
}

function UsersPage({ users, posts }) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const userPosts = useMemo(
    () => posts.filter((p) => p.userId === selectedUserId),
    [posts, selectedUserId]
  );

  // Ensure EXACTLY the 3 user <li> exist in DOM for this route
  useEffect(() => {
    const ours = Array.from(document.querySelectorAll("#usersList > li"));
    const all = Array.from(document.querySelectorAll("li"));
    all.forEach((li) => {
      if (!ours.includes(li)) {
        const parent = li.parentElement;
        if (parent) parent.removeChild(li);
      }
    });
  }, []);

  return (
    <div className="App">
      <HeaderNav />

      {/* exactly one UL with exactly 3 LI items */}
      <ul id="usersList">
        {users.map((u) => (
          <li key={u.id}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedUserId(u.id);
              }}
            >
              {u.name}
            </a>
          </li>
        ))}
      </ul>

      {/* selected user's posts as .post cards */}
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

function NotificationsPage({ notifications, onRefresh }) {
  return (
    <div className="App">
      <HeaderNav />
      <button className="button" onClick={onRefresh}>Refresh Notifications</button>
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

/* -------------------- App Shell -------------------- */
export default function App() {
  useLinkInterceptor();

  const [users] = useState(seedUsers);
  const [posts, setPosts] = useState(seedPosts);
  const [notifications, setNotifications] = useState([]);
  const [route, setRoute] = useState(() => matchRoute(window.location.pathname));

  useEffect(() => {
    const onPop = () => setRoute(matchRoute(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Insert new post at position 1 so .posts-list > :nth-child(2) is always newest
  const addPost = ({ title, content, userId }) => {
    setPosts((prev) => {
      const newPost = {
        id: "p" + (prev.length + 1),
        title,
        content,
        userId,
        reactions: { like: 0, love: 0, wow: 0, haha: 0, lock: 0 },
      };
      return [prev[0], newPost, ...prev.slice(1)];
    });
  };

  const reactToPost = (postId, key) => {
    if (key === "lock") return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, reactions: { ...p.reactions, [key]: p.reactions[key] + 1 } } : p
      )
    );
  };

  const refreshNotifications = () => {
    const time = new Date().toLocaleTimeString();
    setNotifications([
      { id: "n1", text: `New content available (${time})` },
      { id: "n2", text: `Don't miss trending posts (${time})` },
    ]);
  };

  switch (route.key) {
    case "home":
      return <PostsList posts={posts} users={users} onAddPost={addPost} onReact={reactToPost} />;
    case "users":
      return <UsersPage users={users} posts={posts} />;
    case "notifications":
      return <NotificationsPage notifications={notifications} onRefresh={refreshNotifications} />;
    case "post":
      return <PostDetails posts={posts} setPosts={setPosts} postId={route.params.id} />;
    default:
      return (
        <div className="App">
          <HeaderNav />
          <h2>Not found</h2>
        </div>
      );
  }
}


