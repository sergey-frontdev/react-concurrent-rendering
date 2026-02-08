import { useEffect, useMemo, useState } from "react";
import Card from "../shared/ui/Card";
import { fetchItems, type Item } from "../shared/api/mockApi";

export default function InputPage() {
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    // для нагрузки
    const count = 10000;

    useEffect(() => {
        const ac = new AbortController();

        setLoading(true);

        fetchItems({
            count,
            query: query.trim(),
            signal: ac.signal,
            minDelayMs: 250,
            maxDelayMs: 750,
        })
            .then((data) => setItems(data))
            .catch((e: unknown) => {
                if (e instanceof DOMException && e.name === "AbortError") return;
                // можно добавить error state, но держим максимально просто
                setItems([]);
            })
            .finally(() => setLoading(false));

        return () => ac.abort();
    }, [query]);

    const cards = useMemo(() => {
        return items.map((item) => <Card key={item.id} item={item} />);
    }, [items]);

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <h2 style={{ margin: 0 }}>Input</h2>
                {loading && <span style={{ opacity: 0.7 }}>Fetching…</span>}
            </div>

            <input
                value={query}
                onChange={(e) => {
                    // сюда легко вставить startTransition / useTransition
                    setQuery(e.target.value);
                }}
                placeholder='Type to "search" (mock)'
                style={{
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.2)",
                    outline: "none",
                }}
            />

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                {cards}
            </div>
        </div>
    );
}
