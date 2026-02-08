import { useEffect, useMemo, useState } from "react";
import Card from "../shared/ui/Card";
import { fetchItems, type Item } from "../shared/api/mockApi";

function normalize(s: string): string {
    return s
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// Оценка релевантности — специально "дорогая": несколько includes + весовые коэффициенты
function scoreMatch(item: Item, q: string): number {
    if (!q) return 0;

    const t = normalize(item.title);
    const k = item.keywords.join(" ");
    const b = item.blob; // blob уже большой, нормализовать его на каждый матч — слишком жестко
    // поэтому смешанный подход: title нормализуем, keywords как есть, blob includes (как есть) — всё равно не дёшево

    let s = 0;
    if (t.includes(q)) s += 50;
    if (k.includes(q)) s += 20;
    if (b.includes(q)) s += 10;

    // Добавим “шум” по score чтобы сортировка была стабильнее и тяжелее
    s += item.score % 7;

    return s;
}

export default function InputPage() {
    // Input A: дергает мок-запрос (серверная генерация/фильтр)
    const [serverQuery, setServerQuery] = useState("");

    // Input B: без дебаунса фильтрует уже полученный массив (клиентская нагрузка)
    const [clientFilter, setClientFilter] = useState("");

    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    // Параметры нагрузки
    const count = 5000;     // стартуй с 5k; если надо — 15k+
    const limit = 600;      // ограничим DOM, иначе упремся в layout/paint, а не в вычисления

    useEffect(() => {
        const ac = new AbortController();

        setLoading(true);

        fetchItems({
            count,
            query: serverQuery,
            signal: ac.signal,
            minDelayMs: 200,
            maxDelayMs: 600,
        })
            .then((data) => setItems(data))
            .catch((e: unknown) => {
                if (e instanceof DOMException && e.name === "AbortError") return;
                setItems([]);
            })
            .finally(() => setLoading(false));

        return () => ac.abort();
    }, [serverQuery]);

    const derived = useMemo(() => {
        const q = normalize(clientFilter);

        // Тяжелый пайплайн:
        // 1) map -> scoring
        // 2) filter
        // 3) sort by match score + base score
        // 4) slice (чтобы DOM был ограничен)
        const scored = items.map((it) => ({
            it,
            m: scoreMatch(it, q),
        }));

        const filtered = q ? scored.filter((x) => x.m > 0) : scored;

        filtered.sort((a, b) => {
            // сначала match score, потом base score
            if (b.m !== a.m) return b.m - a.m;
            return b.it.score - a.it.score;
        });

        return {
            total: items.length,
            shown: Math.min(filtered.length, limit),
            list: filtered.slice(0, limit).map((x) => x.it),
            matches: filtered.length,
        };
    }, [items, clientFilter]);

    const cards = useMemo(() => {
        return derived.list.map((item) => <Card key={item.id} item={item} />);
    }, [derived.list]);

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <h2 style={{ margin: 0 }}>Input (Server + Client filters)</h2>
                <div style={{ opacity: 0.75, fontSize: 14 }}>
                    {loading ? "Fetching…" : "Idle"} • total={derived.total} • matches={derived.matches} • shown={derived.shown}
                </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 13, opacity: 0.8 }}>Server query (triggers mock fetch)</span>
                    <input
                        value={serverQuery}
                        onChange={(e) => {
                            // сюда удобно вставить startTransition/useTransition
                            setServerQuery(e.target.value);
                        }}
                        placeholder='e.g. "react", "alpha", "transition"'
                        style={{
                            padding: 10,
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.2)",
                            outline: "none",
                        }}
                    />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 13, opacity: 0.8 }}>Client filter (NO debounce, heavy compute)</span>
                    <input
                        value={clientFilter}
                        onChange={(e) => {
                            // этот инпут специально "живой", без дебаунса
                            // сюда идеально ложится useDeferredValue(clientFilter)
                            setClientFilter(e.target.value);
                        }}
                        placeholder='type fast here to stress filtering'
                        style={{
                            padding: 10,
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.2)",
                            outline: "none",
                        }}
                    />
                </label>
            </div>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                {cards}
            </div>
        </div>
    );
}
