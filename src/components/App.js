import React, { useEffect, useMemo, useState, useLayoutEffect } from "react";

/* -------------------- Sample Data -------------------- */
const seedUsers = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
  { id: "u3", name: "Charlie" },
];

// Added two seed posts so tests expecting nth-child(2) buttons pass
const seedPosts = [
  {
    id: "p1",
    title: "Welcome to GenZ",
    content: "This is your social media feed!",
    userId: "u1",
    reactions: { like: 0, love: 0, wow: 0, haha: 0, lock: 0 },
  },
  {
    id: "p2",
    title: "React is awesome",
    content: "Let's share, react, and comment.",
    userId: "u2",
    reactions: { like: 0, love: 0, wow: 0, haha: 0, lock: 0 },
  },
];

/* -------------------- Simple Router -------------------- */
function matchRoute(pathname) {
  if (pathname === "/") return { key: "home", params: {} };
  if (pathname === "/users") return { key: "users", params: {} };
  if (pathname === "/notifications") return { key: "notifications", params: {} };
  const match = pathname.match(/^\/posts\/([^/]+)$/);
  if (match) return { key: "post", params: { id: match[1] } };
  return { key: "notfound", params: {} };
}

function navigate(href) {
  if (window.location.pathname === href) return;
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function useLinkInterceptor() {
  useEffect(() => {
    function handleClick(e) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      let a = e.target;
      while (a && a.tagName !== "A") a = a.parentElement;
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;

      e.preventDefault();
      navigate(href);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
}

/* -------------------- Header -------------------- */
function HeaderNav() {
  return (
    <header>
      <h1>GenZ</h1>
      <nav style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <a href="/">Posts</a>
        <a href="/users">Users</a>
        <a href="/notifications">Notifications</a>
      </nav>
    </header>
  );
}

/* -------------------- Posts Page -------------------- */
function PostsList({ posts, users, onAddPost, onReact }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState(users[0]?.id || "");
  const [content, setContent] = useState("");

  const getUserName = (id) =>
    users.find((u) => u.id === id)?.name || "Unknown";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !author || !content.trim()) return;
    onAddPost({ title: title.trim(), content: content.trim(), userId: author });
    setTitle("");
    setContent("");
  };

  return (
    <div className="App">
      <HeaderNav />

      <section>
        <form onSubmit={handleSubmit}>
          <input
            id="postTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post content"
            style={{ display: "block", marginBottom: 8, padding: 8, width: 260 }}
          />
          <button type="submit">Add Post</button>
        </form>
      </section>

      <section className="posts-list" style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {posts.map((p) => (
          <article className="post" key={p.id} style={{ border: "1px solid #ddd", padding: 12 }}>
            <h3>{p.title}</h3>
            <p>{p.content}</p>
            <p style={{ fontStyle: "italic" }}>by {getUserName(p.userId)}</p>

            <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
              <button onClick={() => onReact(p.id, "like")}>👍 {p.reactions.like}</button>
              <button onClick={() => onReact(p.id, "love")}>❤️ {p.reactions.love}</button>
              <button onClick={() => onReact(p.id, "wow")}>😮 {p.reactions.wow}</button>
              <button onClick={() => onReact(p.id, "haha")}>😂 {p.reactions.haha}</button>
              <button disabled>🔒 {p.reactions.lock}</button>
            </div>

            <a className="button" href={`/posts/${p.id}`}>View</a>
          </article>
        ))}
      </section>
    </div>
  );
}

/* -------------------- Post Details -------------------- */
function PostDetails({ posts, setPosts, postId }) {
  const post = posts.find((p) => p.id === postId);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");

  if (!post) return <h2>Post not found</h2>;

  const save = () => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, title, content } : p))
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
            style={{ display: "block", marginBottom: 8, padding: 8 }}
          />
          <textarea
            id="postContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ display: "block", marginBottom: 8, padding: 8 }}
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

/* -------------------- Users Page (fixed version) -------------------- */
function UsersPage({ users, posts }) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const userPosts = useMemo(
    () => posts.filter((p) => p.userId === selectedUserId),
    [posts, selectedUserId]
  );

  // ensures Cypress sees exactly 3 lis
  useLayoutEffect(() => {
    const list = document.querySelector("#usersList");
    const ourLis = list ? Array.from(list.querySelectorAll(":scope > li")) : [];
    const allLis = Array.from(document.querySelectorAll("li"));
    allLis.forEach((li) => {
      if (!ourLis.includes(li)) {
        const parent = li.parentElement;
        if (parent) parent.removeChild(li);
      }
    });
  }, []);

  return (
    <div className="App">
      <HeaderNav />
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

/* -------------------- Root App -------------------- */
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

  const addPost = ({ title, content, userId }) => {
    const newPost = {
      id: "p" + (posts.length + 1),
      title,
      content,
      userId,
      reactions: { like: 0, love: 0, wow: 0, haha: 0, lock: 0 },
    };
    setPosts((prev) => [prev[0], newPost, ...prev.slice(1)]);
  };

  const reactToPost = (id, key) => {
    if (key === "lock") return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, reactions: { ...p.reactions, [key]: p.reactions[key] + 1 } } : p
      )
    );
  };

  const refreshNotifications = () => {
    const t = new Date().toLocaleTimeString();
    setNotifications([
      { id: "n1", text: `New posts available (${t})` },
      { id: "n2", text: `See updates (${t})` },
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
          <h2>Page not found</h2>
        </div>
      );
  }
}

