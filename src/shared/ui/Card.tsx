import type { Item } from "../api/mockApi";

export default function Card({ item }: { item: Item }) {
    return (
        <div
            style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 12,
                padding: 12,
                display: "grid",
                gap: 8,
            }}
        >
            <div style={{ fontWeight: 600 }}>{item.title}</div>
            <div style={{ opacity: 0.75, fontSize: 14 }}>{item.subtitle}</div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {item.keywords.slice(0, 6).map((k) => (
                    <span
                        key={k}
                        style={{
                            fontSize: 12,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "rgba(0,0,0,0.06)",
                        }}
                    >
            {k}
          </span>
                ))}
            </div>

            <div style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.35 }}>
                {item.blob.slice(0, 180)}…
            </div>
        </div>
    );
}
