export default function Modal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <p>{message}</p>
        <button className="btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
