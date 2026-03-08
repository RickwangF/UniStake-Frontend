export function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base layer */}
      <div className="absolute inset-0 bg-[var(--bg-page)]" />

      {/* Mesh gradient layer - multiple radial gradients blended */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 10% 20%, #EFF6FF 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 10%, #E0F2FE 0%, transparent 50%),
            radial-gradient(ellipse 70% 60% at 50% 50%, #F0F9FF 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 30% 80%, #DBEAFE 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 90% 70%, #EDE9FE 0%, transparent 45%),
            radial-gradient(ellipse 50% 50% at 70% 40%, #F5F3FF 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 50%, #E0F2FE 0%, transparent 45%)
          `,
        }}
      />

      {/* Radial glow overlays */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle 600px at 15% 25%, rgba(59, 130, 246, 0.12) 0%, transparent 70%),
            radial-gradient(circle 500px at 85% 75%, rgba(147, 197, 253, 0.1) 0%, transparent 70%),
            radial-gradient(circle 400px at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 70%)
          `,
        }}
      />
    </div>
  );
}
