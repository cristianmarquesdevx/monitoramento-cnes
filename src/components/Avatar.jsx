const AVATAR_COLORS = [
  '#003c7d', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
  '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#0056a8'
];

function getInitials(nome) {
  if (!nome) return '?';
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Avatar({ nome, size = 28 }) {
  const iniciais = getInitials(nome);
  const colorIndex = nome
    ? nome.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
    : 0;

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: AVATAR_COLORS[colorIndex],
      }}
      title={nome}
    >
      {iniciais}
    </div>
  );
}
