"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Stars, Heart, Sparkles, SlidersHorizontal, Baby, Calendar, MapPin, Clock, Info, Search, BookOpenCheck, Globe2, Laugh, Plus, Minus, ListFilter, Wand2, X, CheckCircle2 } from "lucide-react";

/**
 * NamAstra — One‑stop Hindu Baby Naming UI
 * -----------------------------------------------------------
 * This is a fully-interactive front-end prototype with:
 *  - Two entry paths: Quick Pick & Vedic Mode
 *  - Free-text wishes → structured filters (mock LLM parser)
 *  - Deterministic search over a local names dataset (mock)
 *  - Gorgeous, contemporary styling (Tailwind + shadcn/ui)
 *  - Name cards, compare drawer, detail dialog, save shortlist
 *  - Stubs for future back-end integrations (OpenAI + Astro)
 *
 * To wire real back-end:
 *  - Replace mock tools (parseWishesLLM, getNakshatra, searchNames)
 *  - Hit your /api endpoints or server actions
 */

// ---------- Types ----------
const THEMES = ["Virtue", "Nature", "Royal", "Modern", "Traditional", "Scholarly", "Warrior", "Music"] as const;
const DEITIES = ["None", "Vishnu", "Shiva", "Devi", "Ganesha", "Murugan", "Rama", "Krishna", "Multiple"] as const;
const SOURCES = ["Vedas", "Upanishads", "Puranas", "Epics", "Sahasranama", "Regional", "Sanskrit", "None"] as const;
const SCRIPTS = ["Latin", "Devanagari", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Gurmukhi", "Bengali-Assamese"] as const;
const GENDERS = ["boy", "girl", "unisex"] as const;

type Theme = typeof THEMES[number];
type Deity = typeof DEITIES[number];
type Source = typeof SOURCES[number];
type Script = typeof SCRIPTS[number];
type Gender = typeof GENDERS[number];

type WishFilters = {
  gender: Gender;
  syllables?: number;
  script?: Script;
  deity?: Deity;
  sources?: Source[];
  themes?: Theme[];
  startLetters?: string[];
  vibe?: "soft" | "strong" | "any";
  lengthMax?: number | null;
  globalPronounce?: boolean;
  birth?: { date?: string; time?: string; place?: string } | null;
  vedicMode?: boolean;
  startSounds?: string[]; // from Nakshatra → Pada
};

type NameRecord = {
  id: string;
  name: string;
  gender: Gender;
  scripts: Partial<Record<Script, string>>;
  syllables: number;
  phoneticStart: string; // e.g., "Va", "Vi"
  deityAffinity: Deity | "Multiple" | "None";
  sources: Source[];
  meaning: string;
  language: string; // Sanskrit/Tamil/etc.
  regionTags: string[];
  modernity: 1 | 2 | 3 | 4 | 5;
  globalPronounce: 1 | 2 | 3 | 4 | 5;
  nicknames: string[];
  related: string[];
  popularity?: "rare" | "uncommon" | "common";
};

// ---------- Mock dataset (tiny slice; expand in DB later) ----------
const MOCK_NAMES: NameRecord[] = [
  {
    id: "1",
    name: "Vihaan",
    gender: "boy",
    scripts: { Latin: "Vihaan", Devanagari: "विहान" },
    syllables: 2,
    phoneticStart: "Vi",
    deityAffinity: "Vishnu",
    sources: ["Sahasranama", "Puranas"],
    meaning: "Dawn; the first ray of sun",
    language: "Sanskrit",
    regionTags: ["Pan-India"],
    modernity: 4,
    globalPronounce: 4,
    nicknames: ["Vii", "Han"],
    related: ["Vivaan", "Vihan"],
    popularity: "common",
  },
  {
    id: "2",
    name: "Vedant",
    gender: "boy",
    scripts: { Latin: "Vedant", Devanagari: "वेदान्त" },
    syllables: 2,
    phoneticStart: "Ve",
    deityAffinity: "None",
    sources: ["Upanishads"],
    meaning: "The end/culmination of the Veda; knowledge of the Self",
    language: "Sanskrit",
    regionTags: ["Pan-India"],
    modernity: 3,
    globalPronounce: 3,
    nicknames: ["Ved"],
    related: ["Vedanta", "Vedan"],
    popularity: "common",
  },
  {
    id: "3",
    name: "Vasu",
    gender: "boy",
    scripts: { Latin: "Vasu", Devanagari: "वसु" },
    syllables: 2,
    phoneticStart: "Va",
    deityAffinity: "Vishnu",
    sources: ["Sahasranama", "Puranas"],
    meaning: "Wealthy; one of the eight Vasus; an epithet of Vishnu",
    language: "Sanskrit",
    regionTags: ["North", "South"],
    modernity: 3,
    globalPronounce: 4,
    nicknames: ["Vas"],
    related: ["Vasudev", "Vasuman"],
    popularity: "uncommon",
  },
  {
    id: "4",
    name: "Hriday",
    gender: "boy",
    scripts: { Latin: "Hriday", Devanagari: "हृदय" },
    syllables: 2,
    phoneticStart: "Hri/Hr",
    deityAffinity: "None",
    sources: ["Sanskrit"],
    meaning: "Heart; core",
    language: "Sanskrit",
    regionTags: ["Pan-India"],
    modernity: 3,
    globalPronounce: 2,
    nicknames: ["Hri"],
    related: ["Hridaya"],
    popularity: "uncommon",
  },
  {
    id: "5",
    name: "Harish",
    gender: "boy",
    scripts: { Latin: "Harish", Devanagari: "हरीश" },
    syllables: 2,
    phoneticStart: "Ha",
    deityAffinity: "Vishnu",
    sources: ["Puranas"],
    meaning: "Lord Vishnu; lord of Hari",
    language: "Sanskrit",
    regionTags: ["Pan-India"],
    modernity: 2,
    globalPronounce: 4,
    nicknames: ["Hari"],
    related: ["Harishchandra", "Haridas"],
    popularity: "common",
  },
];

// ---------- Mock tools (replace with real API calls later) ----------
async function parseWishesLLM(text: string) {
  const r = await fetch("/api/parse-wishes", { method: "POST", body: JSON.stringify({ text }) });
  return await r.json();
}


async function getNakshatra(birth: NonNullable<WishFilters["birth"]>): Promise<{ nakshatra: string; pada: number; startSounds: string[] }> {
  // Placeholder: return a plausible mapping (e.g., Pushya-3)
  const sounds = ["Hu", "He", "Ho", "Da"]; // Pushya example
  return { nakshatra: "Pushya", pada: 3, startSounds: sounds };
}

async function searchNames(filters: WishFilters): Promise<NameRecord[]> {
  // Deterministic filter over MOCK_NAMES
  let out = [...MOCK_NAMES].filter(n => n.gender === (filters.gender || n.gender));
  if (filters.syllables) out = out.filter(n => n.syllables === filters.syllables);
  if (filters.deity && filters.deity !== "None") out = out.filter(n => n.deityAffinity === filters.deity || n.deityAffinity === "Multiple");
  if (filters.sources && filters.sources.length) out = out.filter(n => n.sources.some(s => filters.sources!.includes(s)));
  if (filters.startLetters?.length) out = out.filter(n => filters.startLetters!.some(s => n.name.toLowerCase().startsWith(s.toLowerCase())));
  if (filters.startSounds?.length) out = out.filter(n => filters.startSounds!.some(s => n.phoneticStart.toLowerCase().startsWith(s.toLowerCase())));
  return out.slice(0, 40);
}

// ---------- Niceties ----------
const FancyHeadline: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center space-y-2">
    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="text-4xl md:text-6xl font-extrabold tracking-tight">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500">{title}</span>
    </motion.h1>
    {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

// ---------- Name Card ----------
const NameCard: React.FC<{
  rec: NameRecord;
  onCompareToggle: (id: string) => void;
  inCompare: boolean;
}> = ({ rec, onCompareToggle, inCompare }) => {
  return (
    <Card className="group hover:shadow-xl transition-shadow rounded-2xl border-muted/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> {rec.name}
          </CardTitle>
          <Badge variant="secondary" className="rounded-full">{rec.syllables} syllables</Badge>
        </div>
        <CardDescription className="flex flex-wrap gap-2 pt-2">
          {rec.scripts?.Devanagari && <Badge variant="outline">{rec.scripts.Devanagari}</Badge>}
          {rec.deityAffinity !== "None" && <Badge variant="outline">{rec.deityAffinity}</Badge>}
          {rec.sources.slice(0, 2).map(s => (<Badge key={s} variant="outline">{s}</Badge>))}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{rec.meaning}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{rec.language}</Badge>
          <Badge variant="secondary">{rec.regionTags.join(" · ")}</Badge>
          {rec.popularity && <Badge variant="outline">{rec.popularity}</Badge>}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Info className="h-4 w-4" /> Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl"><Sparkles className="h-5 w-5" /> {rec.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Start: {rec.phoneticStart}</Badge>
                <Badge variant="outline">{rec.syllables} syllables</Badge>
                {rec.deityAffinity !== "None" && <Badge variant="outline">{rec.deityAffinity}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{rec.meaning}</p>
              <div>
                <Label>Nicknames</Label>
                <div className="flex flex-wrap gap-2 mt-1">{rec.nicknames.map(n => <Badge key={n} variant="secondary">{n}</Badge>)}</div>
              </div>
              <div>
                <Label>Related</Label>
                <div className="flex flex-wrap gap-2 mt-1">{rec.related.map(n => <Badge key={n} variant="outline">{n}</Badge>)}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button onClick={() => onCompareToggle(rec.id)} variant={inCompare ? "secondary" : "default"} size="sm" className="gap-2 rounded-full">
          {inCompare ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />} Compare
        </Button>
      </CardFooter>
    </Card>
  );
};

// ---------- Compare Drawer ----------
const CompareDrawer: React.FC<{
  items: NameRecord[];
  onRemove: (id: string) => void;
}> = ({ items, onRemove }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full gap-2"><ListFilter className="h-4 w-4" /> Compare ({items.length})</Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Stars className="h-5 w-5" /> Compare shortlist</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">No names added yet.</div>
          )}
          {items.map(n => (
            <div key={n.id} className="border rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-lg">{n.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{n.meaning}</div>
                <div className="flex gap-2 mt-2 text-xs">
                  <Badge variant="outline">{n.syllables} syllables</Badge>
                  <Badge variant="outline">Start {n.phoneticStart}</Badge>
                  {n.deityAffinity !== "None" && <Badge variant="outline">{n.deityAffinity}</Badge>}
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => onRemove(n.id)}><X className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <SheetFooter>
          <Button className="w-full rounded-full gap-2"><CheckCircle2 className="h-4 w-4" /> Save & Share</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// ---------- Main App ----------
export default function NamAstraApp() {
  const [tab, setTab] = useState<"quick" | "vedic">("quick");
  const [wishes, setWishes] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<WishFilters>({ gender: "boy", script: "Latin", vibe: "any", vedicMode: false, lengthMax: null, globalPronounce: true });
  const [results, setResults] = useState<NameRecord[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const compareItems = useMemo(() => results.filter(r => compareIds.includes(r.id)), [results, compareIds]);

  useEffect(() => {
    // Run a default search on mount
    (async () => {
      const r = await searchNames(filters);
      setResults(r);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runParseAndSearch = async () => {
    setLoading(true);
    try {
      const parsed = await parseWishesLLM(wishes);
      const merged: WishFilters = { ...filters, ...parsed } as WishFilters;
      if (merged.vedicMode && merged.birth?.date && merged.birth?.time && merged.birth?.place) {
        const astro = await getNakshatra(merged.birth);
        merged.startSounds = astro.startSounds;
      }
      const r = await searchNames(merged);
      setFilters(merged);
      setResults(r);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = async () => {
    setLoading(true);
    try {
      const merged = { ...filters } as WishFilters;
      if (tab === "vedic" && merged.birth?.date && merged.birth?.time && merged.birth?.place) {
        const astro = await getNakshatra(merged.birth);
        merged.startSounds = astro.startSounds;
      }
      const r = await searchNames(merged);
      setResults(r);
    } finally { setLoading(false); }
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div initial={{ rotate: -12, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 grid place-items-center shadow-md">
              <Baby className="text-white h-5 w-5" />
            </motion.div>
            <div>
              <div className="font-extrabold tracking-tight text-xl">NamAstra</div>
              <div className="text-xs text-muted-foreground -mt-1">Auspicious, modern Hindu baby names</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CompareDrawer items={compareItems} onRemove={(id) => setCompareIds(prev => prev.filter(x => x !== id))} />
            <Button className="rounded-full gap-2" variant="secondary"><Heart className="h-4 w-4" /> Saved</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-6">
        <FancyHeadline title="Find a name you’ll love — and your elders will bless" subtitle="Blend tradition with taste. Start simple, switch to Vedic Mode anytime." />
        <div className="mt-8 grid md:grid-cols-3 gap-4 items-start">
          <Card className="md:col-span-2 rounded-3xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5" /> Natural language wishes</CardTitle>
              <CardDescription>Type anything — we’ll parse it into filters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={wishes} onChange={e => setWishes(e.target.value)} placeholder="e.g., Baby boy, 2 syllables, from Vishnu Sahasranama, modern vibe, easy to pronounce globally" className="min-h-[88px]" />
              <div className="flex items-center gap-2">
                <Button onClick={runParseAndSearch} disabled={loading} className="rounded-full gap-2">
                  <BookOpenCheck className="h-4 w-4" /> Parse & Search
                </Button>
                <Button onClick={() => setWishes("")} variant="ghost" className="rounded-full">Clear</Button>
                {loading && <span className="text-xs text-muted-foreground">Working…</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5" /> Quick filters</CardTitle>
              <CardDescription>Adjust and search directly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gender */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={filters.gender} onValueChange={(v: Gender) => setFilters(s => ({ ...s, gender: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Syllables</Label>
                  <Select value={String(filters.syllables ?? "any")} onValueChange={(v) => setFilters(s => ({ ...s, syllables: v === "any" ? undefined : Number(v) }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {[1, 2, 3].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Script</Label>
                  <Select value={filters.script} onValueChange={(v: Script) => setFilters(s => ({ ...s, script: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{SCRIPTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Deity & Source */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Deity</Label>
                  <Select value={filters.deity ?? "None"} onValueChange={(v: Deity) => setFilters(s => ({ ...s, deity: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{DEITIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary source</Label>
                  <Select value={(filters.sources?.[0] ?? "None") as any} onValueChange={(v: Source) => setFilters(s => ({ ...s, sources: v === "None" ? [] : [v] }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Start letters (comma-separated)</Label>
                <Input placeholder="e.g., Va, Vi, Ve" value={(filters.startLetters ?? []).join(", ")}
                  onChange={(e) => setFilters(s => ({ ...s, startLetters: e.target.value.split(",").map(x => x.trim()).filter(Boolean) }))} className="rounded-xl" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Globe2 className="h-4 w-4" /><Label>Global pronunciation</Label></div>
                <Switch checked={!!filters.globalPronounce} onCheckedChange={(v) => setFilters(s => ({ ...s, globalPronounce: v }))} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Laugh className="h-4 w-4" /><Label>Max length</Label></div>
                  <span className="text-xs text-muted-foreground">{filters.lengthMax ?? "no limit"}</span>
                </div>
                <Slider defaultValue={[filters.lengthMax ?? 0]} max={12} step={1} onValueChange={(v) => setFilters(s => ({ ...s, lengthMax: v[0] === 0 ? null : v[0] }))} />
              </div>

              <Button className="w-full rounded-full gap-2" onClick={onSearch}><Search className="h-4 w-4" /> Search</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tabs: Quick vs Vedic */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
          <TabsList className="rounded-full">
            <TabsTrigger value="quick" className="rounded-full">Quick Pick</TabsTrigger>
            <TabsTrigger value="vedic" className="rounded-full">Vedic Mode</TabsTrigger>
          </TabsList>
          <TabsContent value="quick" className="mt-4">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Quick Pick</CardTitle>
                <CardDescription>Use the filters above or natural language to refine results.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Nothing else to configure here — you’re good to go!</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vedic" className="mt-4">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Birth details</CardTitle>
                <CardDescription>We’ll compute Nakshatra → Pada → starting sounds (you can override anytime).</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" className="rounded-xl" onChange={(e) => setFilters(s => ({ ...s, vedicMode: true, birth: { ...(s.birth || {}), date: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" className="rounded-xl" onChange={(e) => setFilters(s => ({ ...s, vedicMode: true, birth: { ...(s.birth || {}), time: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Place</Label>
                  <Input placeholder="City, Country" className="rounded-xl" onChange={(e) => setFilters(s => ({ ...s, vedicMode: true, birth: { ...(s.birth || {}), place: e.target.value } }))} />
                </div>
                <div className="md:col-span-3 flex items-center gap-2">
                  <Button onClick={onSearch} className="rounded-full gap-2"><Search className="h-4 w-4" /> Compute & Search</Button>
                  <span className="text-xs text-muted-foreground">We’ll suggest starting sounds like <i>Hu, He, Ho, Da</i> for Pushya.</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">Results</h3>
            <Badge variant="secondary">{results.length}</Badge>
          </div>
          <div className="text-xs text-muted-foreground">Deterministic filtering first; gentle AI re‑ranking later</div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(r => (
            <NameCard key={r.id} rec={r} onCompareToggle={toggleCompare} inCompare={compareIds.includes(r.id)} />
          ))}
        </div>

        {results.length === 0 && (
          <Card className="mt-6">
            <CardContent className="p-8 text-center text-muted-foreground">No names found. Try relaxing a filter or remove the starting letters.</CardContent>
          </Card>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-4 items-center">
          <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} NamAstra. Tradition, taste, clarity.</div>
          <div className="text-center text-sm">
            <span className="font-semibold">Built for families</span> · respectful & inclusive
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="ghost" className="rounded-full">Privacy</Button>
            <Button size="sm" variant="ghost" className="rounded-full">About</Button>
            <Button size="sm" className="rounded-full">Get Started <ChevronRight className="ml-1 h-4 w-4" /></Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
