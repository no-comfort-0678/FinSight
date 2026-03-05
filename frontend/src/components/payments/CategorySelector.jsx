

export default function CategorySelector({ categories, selected, onSelect }) {
  return (
    <div className="category-grid">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`cat-btn ${selected === cat ? "selected" : ""}`}
          onClick={() => onSelect(selected === cat ? null : cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
