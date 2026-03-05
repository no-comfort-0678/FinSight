import  { useState, useEffect, useRef } from "react";

export default function UserSearchInput({ userId, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const wrapperRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query) return setResults([]);
    fetch(`http://localhost:5000/api/v1/payments/send/search?query=${query}&current_user_id=${userId}`)
      .then((res) => res.json())
      .then(setResults)
      .catch(console.error);
  }, [query, userId]);

  return (
    <div className="form" ref={wrapperRef} style={{ position: "relative" }}>
      <label>Pay To</label>
      <input
        type="text"
        placeholder="Recipient..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <ul className="search-dropdown">
          {results.map((r) => (
            <li key={r.email} onClick={() => { onSelect(r); setQuery(r.name); setResults([]); }}>
              <span>{r.name}</span> - <span>{r.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
