import { useEffect, useMemo, useState } from "react";
import Card from "../shared/ui/Card";
import { fetchItems, type Item } from "../shared/api/mockApi";

export default function CardsPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // можно менять count, чтобы увеличивать нагрузку
    const count = 610;

    useEffect(() => {
        const ac = new AbortController();

        setLoading(true);
        setError(null);

        fetchItems({ count, signal: ac.signal })
            .then((data) => setItems(data))
            .catch((e: unknown) => {
                if (e instanceof DOMException && e.name === "AbortError") return;
                setError("Failed to load");
            })
            .finally(() => setLoading(false));

        return () => ac.abort();
    }, []);

    const content = useMemo(() => {
        return items.map((item) => <Card key={item.id} item={item} />);
    }, [items]);

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <h2 style={{ margin: 0 }}>Cards</h2>
                {loading && <span style={{ opacity: 0.7 }}>Loading…</span>}
                {error && <span style={{ color: "crimson" }}>{error}</span>}
            </div>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                {content}
            </div>
        </div>
    );
}
