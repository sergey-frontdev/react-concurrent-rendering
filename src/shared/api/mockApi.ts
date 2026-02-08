export type Item = {
    id: string;
    title: string;
    subtitle: string;
    score: number;
    // тяжелые поля для фильтра/поиска
    keywords: string[];
    blob: string; // большой текст
};

type FetchItemsParams = {
    count: number;
    query?: string;          // "серверный" запрос
    minDelayMs?: number;
    maxDelayMs?: number;
    signal?: AbortSignal;
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        const t = setTimeout(resolve, ms);

        if (!signal) return;

        const onAbort = () => {
            clearTimeout(t);
            reject(new DOMException("Aborted", "AbortError"));
        };

        if (signal.aborted) onAbort();
        signal.addEventListener("abort", onAbort, { once: true });
    });
}

function mulberry32(seed: number) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function hashString(input: string): number {
    let h = 2166136261;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

const WORDS = [
    "alpha","bravo","charlie","delta","echo","foxtrot","gamma","hotel","india","juliet",
    "kilo","lima","micro","nano","omega","pixel","quantum","react","router","state",
    "signal","stream","cache","render","commit","fiber","hook","closure","scheduler",
    "concurrent","transition","deferred","batch","priority","token","session","shard",
];

function pickWords(rnd: () => number, n: number): string[] {
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
        out.push(WORDS[Math.floor(rnd() * WORDS.length)]);
    }
    return out;
}

function makeBlob(rnd: () => number, size: number): string {
    // большой “текст”, чтобы поиск был дороже
    const parts: string[] = [];
    while (parts.join(" ").length < size) {
        parts.push(...pickWords(rnd, 24));
    }
    return parts.join(" ").slice(0, size);
}

function generateItems(count: number, query: string): Item[] {
    const rnd = mulberry32(hashString(query || "seed"));
    const items: Item[] = [];

    for (let i = 0; i < count; i++) {
        const score = Math.floor(rnd() * 100000);
        const kws = pickWords(rnd, 12);
        const blob = makeBlob(rnd, 1200 + Math.floor(rnd() * 800)); // 1.2–2.0KB текста

        const title = `Item #${i + 1} ${kws[0]} ${kws[1]} ${query ? `• "${query}"` : ""}`.trim();
        const subtitle = `kws=${kws.slice(0, 5).join(", ")} • score=${score}`;

        items.push({
            id: `${query || "all"}-${i}-${score}`,
            title,
            subtitle,
            score,
            keywords: kws,
            blob,
        });
    }

    items.sort((a, b) => b.score - a.score);
    return items;
}

function normalize(s: string): string {
    return s
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export async function fetchItems(params: FetchItemsParams): Promise<Item[]> {
    const {
        count,
        query = "",
        minDelayMs = 350,
        maxDelayMs = 900,
        signal,
    } = params;

    const delay = Math.floor(minDelayMs + Math.random() * (maxDelayMs - minDelayMs));
    await sleep(delay, signal);

    const data = generateItems(count, query);

    // "серверная" фильтрация (без дебаунса — будет дергать часто)
    const q = normalize(query);
    if (!q) return data;

    // Делаем фильтр НЕ бесплатным: проверяем и title, и keywords, и blob
    // (blob includes по большой строке добавляет заметную стоимость)
    return data.filter((it) => {
        const hay = normalize(it.title) + " " + it.keywords.join(" ") + " " + it.blob;
        return hay.includes(q);
    });
}
