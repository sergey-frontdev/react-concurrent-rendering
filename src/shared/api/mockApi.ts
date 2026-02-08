export type Item = {
    id: string;
    title: string;
    subtitle: string;
    score: number;
};

type FetchItemsParams = {
    count: number;
    query?: string;
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

function generateItems(count: number, query: string): Item[] {
    const rnd = mulberry32(hashString(query || "seed"));
    const items: Item[] = [];

    for (let i = 0; i < count; i++) {
        const score = Math.floor(rnd() * 1000);
        const id = `${query || "all"}-${i}-${score}`;

        items.push({
            id,
            title: `Item #${i + 1} ${query ? `• "${query}"` : ""}`.trim(),
            subtitle: `Mock data • score=${score}`,
            score,
        });
    }

    items.sort((a, b) => b.score - a.score);
    return items;
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

    return generateItems(count, query);
}
