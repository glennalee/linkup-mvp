export default function StarRating({ value, onChange, disabled }) {
  return (
    <div style={{ fontSize: "28px" }}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          style={{
            cursor: disabled ? "default" : "pointer",
            color: star <= value ? "#f5c518" : "#ccc",
            marginRight: "6px"
          }}
          onClick={() => !disabled && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
