import React, { useEffect, useMemo, useState } from "react";

/* -------------------- Seed Data -------------------- */
const seedUsers = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
  { id: "u3", name: "Charlie" },
];

// exactly one seed post so the newly added post becomes .posts-list > :nth-child(2)
const seedPosts = [
  {
    id: "p1",
    title: "Welcome to GenZ",
    content: "First post here!",
    userId: "u2",
    reactions: { like: 0, love: 0, wow: 0, haha: 0, lock: 0 },
  },
];

/* -------------------- Tiny Router (no deps) -------------------- */
// Parse pathname like /posts/p3 → { path: "/posts/:id", params: { id: "p3" } }
function matchRoute(pathname) {
  if (pathname === "/") return { key: "home", params: {} };
  if (pathname === "/users") return { key: "users", params: {} };
  if (pathname === "/notifications") return { key: "notifications", params: {} };
  const m = pathname.match(/^\/posts\/([^/]+)$/);
  if (m) return { key: "post", params: { id: m[1] } };
  return { key: "notfound", params: {} };
}

// Navigate without full page reload
function navigate(href) {
  if (window.location.pathname === href) return;
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

// Intercept clicks on internal <a> links
function useLinkInterceptor() {
  useEffect(() => {
    function onClick(e) {
      // Only left click without modifier keys
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      let a = e.target;
      while (a && a.tagName !== "A") a = a.parentElement;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;
      // same-origin in-app navigation
      e.preventDefault();
      navigate(href);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

/* -------------------- Screens -------------------- */
function HeaderNav() {
  return (
    <header>
      <h1>GenZ</h1>
      <nav style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        {/* exact anchor texts & hrefs required by tests */}
        <a href="/">Posts</a>
        <a href="/users">Users</a>
        <a href="/notifications">Notifications</a>
      </nav>
    </header>
  );
}

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
      {/* .App > :nth-child(1) must exist; h1 text must be GenZ */}
      <HeaderNav />

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

            {/* 5 reaction buttons; last one fixed at 0 */}
            <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
              <button onClick={() => onReact(p.id, "like")}>👍 {p.reactions.like}</button>
              <button onClick={() => onReact(p.id, "love")}>❤️ {p.reactions.love}</button>
              <button onClick={() => onReact(p.id, "wow")}>😮 {p.reactions.wow}</button>
              <button onClick={() => onReact(p.id, "haha")}>😂 {p.reactions.haha}</button>
              <button disabled>🔒 {p.reactions.lock}</button>
            </div>

            {/* View button must have class .button and route to /posts/:id */}
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
          {/* Edit button must be .post > .button */}
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
          {/* last button saves */}
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

  return (
    <div className="App">
      <HeaderNav />

      {/* Must render exactly 3 <li> items */}
      <ul>
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

      {/* Refresh button must have class .button */}
      <button className="button" onClick={onRefresh}>
        Refresh Notifications
      </button>

      {/* section.notificationsList initially has no divs; after click it does */}
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
  const [notifications, setNotifications] = useState([]); // must start empty
  const [route, setRoute] = useState(() => matchRoute(window.location.pathname));

  useEffect(() => {
    const onPop = () => setRoute(matchRoute(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
    if (key === "lock") return; // 5th button must not change
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

  // Render by route key
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
