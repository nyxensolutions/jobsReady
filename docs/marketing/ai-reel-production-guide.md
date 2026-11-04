# Making the Launch Reels with AI (Gemini / ChatGPT)

How to produce the six reels in `launch-reels-hindi.md` without a camera. Copy-paste
prompts, voiceover, assembly, and the three rules that keep this from backfiring.

**Time:** about 2 hours per reel the first time, under 1 hour once you have the look.
**Cost:** one Gemini AI Pro or ChatGPT Plus subscription. CapCut free. Optionally
ElevenLabs for Hindi voice (free tier is enough for six reels).

---

## 1. One decision first: is there a person on screen?

**Route A — no presenter (recommended).** Hindi voiceover over AI b-roll, real screen
recordings, and text cards. Nothing claims to be a person it isn't. Everything in this
guide works for Route A.

**Route B — AI presenter.** A generated person delivers the lines.

I'd push you to Route A, and here's the honest reason. R2 is a reel where someone looks
into the camera and says "trust us, we're not the fake ones." If that someone is
AI-generated and a viewer notices — and in this audience, on this topic, someone will —
the single asset carrying your entire positioning becomes the proof you're fake. The
downside isn't a weak reel; it's the brand. R1, R2 and R5 all have this problem. R6 has it
worst, because you're asking a shop owner to trust you with their hiring.

Route A dodges it completely and is *easier* to make: no character consistency problem, no
lip-sync, no uncanny faces. A Hindi voice over real job listings is a perfectly normal reel
format in this category.

If you still want a presenter, §7 covers it.

---

## 2. The three rules

**Rule 1 — AI never renders Hindi text.** Image and video models mangle Devanagari.
Matras land wrong, letters invert, words become non-words. Generate every visual
*without text*, then add all Hindi text in CapCut or Canva where you control it. This is
not a quality preference; an AI-rendered Hindi word that reads as gibberish to a native
speaker tells them instantly that nobody at this company speaks their language.

**Rule 2 — the product is always real.** Every screen showing Jobs24India is a real screen
recording of the real site in Hindi with real live jobs. Never an AI-generated or mocked-up
interface. Someone will open the app and compare.

**Rule 3 — no AI person is ever presented as a real person.** No AI "hires," no AI
testimonials, no AI employer saying how well it went, no AI face next to a real name. P5
proof content is real people with written consent or it does not get posted. A brand whose
promise is "we are the verified one" cannot fake its own evidence.

Within those three, generate freely — streets, warehouses, hands, bikes, atmosphere,
abstract motion. That's b-roll, and nobody mistakes b-roll for evidence.

---

## 3. The pipeline

```
1. Video clips      → Gemini (Veo) or ChatGPT (Sora)   — 5–8 second silent b-roll
2. Screen recording → your phone, real site, Hindi     — the product shots
3. Still cards      → Canva                            — job cards, numbers, end card
4. Voiceover        → your voice, or ElevenLabs Hindi  — the whole script
5. Assembly         → CapCut                           — cut to VO, burn Hindi subtitles
6. Export           → 1080×1920, H.264                 — upload as Reel
```

**Plan around 8 seconds.** Veo generates roughly 8-second clips; Sora runs about 4–12
seconds (longer on Pro tiers, via storyboard). Both support 9:16. Limits move — check the
current app before you plan a shot list. This suits us: the reels already cut every 3
seconds, so each clip covers two or three cuts. A 30-second reel needs 4–6 generated clips.

**Generate silent.** Both tools can produce audio, but Hindi dialogue from a video model is
unreliable and lip-sync drift is obvious. Generate visuals only and lay your own Hindi VO
over the top. You also get a clean, consistent voice across all six reels that way.

---

## 4. Prompt recipe

Every video prompt follows the same skeleton. Filling all six slots is what separates a
usable clip from a generic one.

```
[SHOT TYPE] of [SUBJECT] in [SPECIFIC INDIAN LOCATION],
[ACTION], [CAMERA MOVE],
[LIGHT], [MOOD],
vertical 9:16, documentary style, natural colours, no text, no on-screen writing.
```

Three things to always include:

- **"no text, no on-screen writing, no signage with words"** — or the model invents
  broken Devanagari signboards.
- **"Indian"** and a real place type (Okhla industrial area, Delhi loading dock, NCR
  street). Without it you get generic Western stock footage that looks instantly wrong.
- **"documentary, handheld, natural light"** — the polished-advert look reads as fake to
  this audience. Slightly rough is more credible.

Add **"no faces visible"** or **"face out of frame"** to most shots. Hands, backs, mid-body
and over-the-shoulder shots are faster to generate, never land in the uncanny valley, and
keep you clear of Rule 3.

---

## 5. Clip prompts, reel by reel

Copy-paste these. Generate 2–3 variants of each and keep the best.

### R1 — Launch announcement

**R1-a · opening hook (3s used)**
```
Handheld documentary shot of a busy industrial street in Okhla, Delhi, early morning.
Workers walking to a shift, auto-rickshaws passing, small factory shutters opening.
Slow forward camera move at chest height. Warm morning light, dust in the air.
Vertical 9:16, natural colours, no text, no readable signage, no faces in focus.
```

**R1-b · the search (4s)**
```
Close-up of an Indian man's hands holding an inexpensive Android phone, scrolling.
Shot from over the shoulder, phone screen not readable. Standing outside a small
factory gate. Natural daylight, slightly handheld. Vertical 9:16, documentary style,
no text, no faces visible.
```

**R1-c · the categories montage (6s, cut into 3 beats)**
```
Three quick documentary shots in one sequence: a delivery rider strapping a bag onto a
motorbike; a warehouse worker taping a cardboard box; a security guard opening a gate.
All in an Indian industrial area, natural daylight, handheld, mid-body framing,
faces not visible. Vertical 9:16, natural colours, no text.
```

**R1-d · end atmosphere (3s)**
```
Wide shot of an Indian industrial neighbourhood at golden hour, workers walking home,
shallow depth of field. Slow push in. Vertical 9:16, warm light, documentary,
no text, no readable signage.
```

Plus: real screen recording of the Hindi job list, and the Canva end card.

### R2 — The promise

Keep this one visually spare. Restraint reads as seriousness, and the line is doing the
work.

**R2-a · the scam, implied (5s)**
```
Close-up of Indian rupee notes being counted and passed from one hand to another across
a small desk, shot from the side, both faces out of frame. Dim indoor office light,
slightly cramped room. Handheld, documentary, tense mood. Vertical 9:16, no text.
```

**R2-b · the turn (4s)**
```
Close-up of an Indian man's hand refusing, palm raised, pushing money back across a desk.
Faces out of frame. Dim indoor light. Handheld, documentary. Vertical 9:16, no text.
```

**R2-c · relief (4s)**
```
Handheld shot from behind an Indian worker in a blue uniform walking out of a factory
gate into bright daylight, confident stride. Face not visible. Natural light, warm.
Vertical 9:16, documentary, no text.
```

The rest of R2 is text cards on near-black and a screen recording of an application going
through with no payment step.

### R3 — Salary sach

Mostly motion graphics; it's a numbers reel.

**R3-a · hook (4s)**
```
Close-up of a delivery rider's hands gripping motorbike handlebars, Indian city street,
morning. Insulated delivery bag visible behind. Handheld, slight motion blur.
Vertical 9:16, documentary, no text, no brand logos, no readable signage.
```

**R3-b · the cost (4s)**
```
Close-up of a fuel nozzle filling a motorbike tank at an Indian petrol pump.
Hands only, face out of frame. Natural daylight, shallow depth of field.
Vertical 9:16, documentary, no text, no brand logos, no readable price display.
```

**R3-c · end (3s)**
```
Indian delivery rider seen from behind, sitting on a parked motorbike at the roadside,
checking a phone, early evening. Face not visible. Warm light, handheld.
Vertical 9:16, documentary, no text.
```

Numbers (₹18,000 → −₹3,500 → −₹800 → ₹13,700) are Canva cards animated in CapCut. Build
them as a stack that subtracts line by line — far clearer than cutting between cards.
**Note "no brand logos" in every prompt here**; models love inventing food-delivery livery,
and you can't publish a competitor's brand.

### R4 — आज की 5 नौकरियाँ

Almost no AI needed, which is the point — this is the one you'll automate.

- Title card: Canva
- 5 job cards: Canva template, filled from real live listings
- Optional 2-second category b-roll between cards, reuse R1-c
- End card: the standard one

Build the job card as a **Canva template with five editable text fields** (role, salary,
area, shift, verified tick). Tomorrow's version is then a 4-minute job, and when you
automate it, the template is already the spec for the generator.

### R5 — आपकी भाषा में

**R5-a · hook (4s)**
```
Close-up of an older Indian man in a worn shirt squinting at a phone screen, confused,
shot from the side so his face is partly out of frame, in a small shop doorway.
Natural daylight, handheld, documentary, empathetic mood. Vertical 9:16, no text.
```

**R5-b · relief (4s)**
```
Same setting, the man's shoulders relaxing as he reads the phone, slight smile,
shot from the side, face mostly out of frame. Warm natural light, handheld.
Vertical 9:16, documentary, no text.
```

The core of R5 is a **real screen recording** of the language switcher changing the UI
live — Hindi to Bangla to Tamil. That shot is the entire argument and it must be genuine.
Record it slowly, pausing a beat on each language.

### R6 — Employer reel

**R6-a · the problem (5s)**
```
Handheld shot inside a small Indian garment factory or workshop, two or three empty
workstations with machines idle, one worker busy in the background out of focus.
Natural light through dusty windows. Documentary, vertical 9:16, no text, no faces in focus.
```

**R6-b · the fix (5s)**
```
Close-up of an Indian shop owner's hands typing a message on a phone while standing at a
counter, face out of frame. Natural daylight, handheld, documentary.
Vertical 9:16, no text, phone screen not readable.
```

**R6-c · result (4s)**
```
Handheld shot of a small Indian workshop with every workstation occupied and busy,
movement and activity, shot from the doorway. Natural light, documentary, optimistic mood.
Vertical 9:16, no text, faces not in focus.
```

Plus a real screen recording of the employer dashboard and a real WhatsApp conversation
(use a test thread — never a real employer's chat).

---

## 6. Hindi voiceover

**Your own voice is better than any TTS**, even recorded on a phone in a quiet room with a
blanket over your head. This audience hears synthetic Hindi immediately; it's the single
clearest "this is an ad" signal there is. One hour records all six.

If you'd rather not: ElevenLabs has the best Hindi voices. Pick **one male voice, use it
for all six**, and write the script phonetically where it matters (numbers especially —
"solah hazaar" not "16,000", or you'll get "sixteen thousand" read in English).

Either way:

- Read the **Spoken (Hinglish)** column from `launch-reels-hindi.md` exactly. It's written
  for the ear, not the page.
- Record each reel in one take. Re-record the whole thing rather than patching a line;
  spliced VO has an audible seam.
- Slightly faster than feels natural. Reel pacing is quick.
- In CapCut: Normalize, then a gentle noise reduction. Nothing else.

**Cut the video to the voiceover, not the other way round.** Lay the VO on the timeline
first, then place clips against it. Trying to fit narration into pre-cut video is where
amateur reels fall apart.

---

## 7. If you want an AI presenter anyway (Route B)

Three things make or break it:

1. **Consistency.** Generate one portrait you like, save it, and use it as the reference
   image for every clip in every reel. Veo's reference-image workflow exists for this.
   A presenter whose face shifts between reels is worse than no presenter.
2. **No lip-sync.** Don't generate speaking footage. Generate the person *doing* things —
   walking the street, looking at a phone, gesturing — and run your VO over it. Hindi
   lip-sync is the most obvious tell, and you avoid it entirely by never showing a talking
   mouth in close-up.
3. **Never name them.** No "मैं राहुल हूँ, Jobs24India से." An unnamed presenter is a
   stylistic choice. A named one is a fabricated employee, and that's Rule 3.

Switch to Route A for R2 regardless. Of all six, that's the one where a synthetic face
costs you the most.

---

## 8. Assembly in CapCut

1. New project, 9:16, 1080×1920.
2. Drop the VO on the audio track first. Mark where each line ends.
3. Place clips against the VO. Hard cuts only. Nothing longer than 3 seconds on screen.
4. Text: Devanagari, one of Noto Sans Devanagari / Mukta / Hind. **Font size large enough
   to read on a cracked 5-inch screen in sunlight** — bigger than looks right on your
   laptop. White text, dark semi-transparent box behind it, never white-on-light.
5. Subtitles burnt in for the whole VO. CapCut's auto-captions handle Hindi reasonably;
   proofread every line, it will get names and numbers wrong.
6. Music: one track, 10–15% volume, no lyrics, under the VO. Add it inside Instagram
   rather than in the edit if you want a trending audio — only then does the reel get
   attached to that audio's feed.
7. Export 1080×1920, H.264, high quality.

**Watch it once on a phone, with sound off, at arm's length, before posting.** That's how
it will actually be seen. If the first two seconds don't tell you where and how much, redo
the hook.

---

## 9. Build order

Don't make all six before posting any. Make R4 first — it's the simplest and it tells you
whether the Canva template and the look are right. Then R2, because it's the most
important. Then the rest.

| Order | Reel | Why |
|---|---|---|
| 1 | R4 | Simplest, almost no AI, establishes the template |
| 2 | R2 | The positioning. Make it when you're fresh, not last |
| 3 | R1 | Launch post |
| 4 | R3 | Highest organic reach potential |
| 5 | R5 | Differentiator |
| 6 | R6 | Employer side, needs the dashboard recording |

Post R1 first even though it's made third. Build order and publish order are different.

## 10. Reusable assets

Build these once; they go into every reel from here on and into the automated pipeline
later:

- **End card** — 2 seconds: logo, `jobs24india.com`, "नौकरी के लिए पैसे कभी नहीं"
- **Job card template** — Canva, five editable fields
- **Lower-third** — for salary numbers and area names
- **Colour and type** — brand navy `#1a3461`, Noto Sans Devanagari, locked in a Canva brand kit
- **B-roll library** — every generated clip, named and kept. By reel three you'll be
  reusing more than you generate, and the account starts looking like it has a house style.

Sources for the model limits in §3: [TechCrunch on Veo 3.1 vertical video](https://www.techcrunch.com/2026/01/13/googles-update-for-veo-3-1-lets-users-create-vertical-videos-through-reference-images/), [Veo 3 9:16 and 1080p in the Gemini API](https://alternativeto.net/news/2025/9/veo-3-and-veo-3-fast-now-in-gemini-api-with-9-16-and-1080p-support), [Sora usage guide](https://dupple.com/learn/how-to-use-sora-ai), [Sora 2 specifications](https://videogen.io/sora-2).
