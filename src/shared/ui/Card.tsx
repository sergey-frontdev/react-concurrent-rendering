import type { Item } from "../api/mockApi";

export default function Card({ item }: { item: Item }) {
    return (
        <div
            style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 12,
                padding: 12,
                display: "grid",
                gap: 6,
            }}
        >
            <div style={{ fontWeight: 600 }}>{item.title}</div>
            <div style={{ opacity: 0.75, fontSize: 14 }}>{item.subtitle}</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.8 }}>
                id: {item.id}
            </div>
        </div>
    );
}
