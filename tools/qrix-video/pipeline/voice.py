"""QRix content factory — voice module.

Edge TTS gives neural voices for free but has no SSML style control, so the
intonation has to come from somewhere else: every phrase carries its own rate
and pitch, and the gaps between them carry the pacing. A slow, lower line after
a fast, bright one reads as emphasis — that contrast is the whole trick.

Two things this module exists to survive:
  * Edge TTS rate-limits bursts. Seven back-to-back requests returned five empty
    files. Hence the spacing and the retry with growing backoff; a file under
    2 KB is a failure even when no exception was raised.
  * The video needs to know when each phrase starts. Rendering captions from a
    guess drifts within a few seconds, so the assembled timeline is written out
    as voice.json and Remotion reads the real numbers.

Usage:  python pipeline/voice.py scripts/<name>.json
"""
import asyncio, json, os, subprocess, sys, tempfile

GAP_DEFAULT = 0.18          # seconds of silence after a phrase
SPACING = 4.0               # seconds between TTS requests (rate-limit safety)
MIN_BYTES = 2000            # below this the service returned nothing usable


def probe_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path],
        capture_output=True, text=True).stdout.strip()
    return float(out) if out else 0.0


async def synth(text, voice, rate, pitch, out, tries=5):
    """Synthesise one phrase, reusing an existing good file.

    A run of this can die halfway — the session that first wrote these clips
    was killed between the last synthesis and the timeline write. Re-paying for
    eighteen requests to recover one JSON file is the kind of waste that makes
    people stop using the tool, so an existing clip above the size floor is
    taken as done."""
    import edge_tts
    if os.path.exists(out) and os.path.getsize(out) > MIN_BYTES:
        return True
    for i in range(tries):
        try:
            await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(out)
            if os.path.getsize(out) > MIN_BYTES:
                return True
        except Exception:
            pass
        await asyncio.sleep(2.0 * (i + 1))
    return False


async def build(script_path):
    script = json.load(open(script_path, encoding="utf-8"))
    base = os.path.dirname(os.path.dirname(os.path.abspath(script_path)))
    audio_dir = os.path.join(base, "public", "audio", script["id"])
    os.makedirs(audio_dir, exist_ok=True)

    clips, failed = [], []
    for n, p in enumerate(script["phrases"], 1):
        voice = script["voices"][p["who"]]
        out = os.path.join(audio_dir, f"{n:02d}.mp3")
        reused = os.path.exists(out) and os.path.getsize(out) > MIN_BYTES
        ok = await synth(p["text"], voice["id"],
                         p.get("rate", voice.get("rate", "+0%")),
                         p.get("pitch", voice.get("pitch", "+0Hz")), out)
        if not ok:
            failed.append(p["text"][:40])
        clips.append({**p, "file": out, "n": n,
                      "gap": p.get("gap", GAP_DEFAULT),
                      "dur": probe_duration(out) if ok else 0.0})
        print(("OK  " if ok else "FAIL") + f"  {n:02d}  {p['text'][:52]}")
        if ok and not reused and n < len(script["phrases"]):
            await asyncio.sleep(SPACING)

    if failed:
        print(f"\n{len(failed)} phrase(s) failed; not assembling.", file=sys.stderr)
        return 1

    # Edge TTS pads every clip with its own leading and trailing silence —
    # enough that the one-word line "Всё." measured 1.87 seconds. Left in, the
    # cut drags and the pacing written into the script never reaches the
    # viewer, so each phrase is trimmed back to speech and only then padded
    # with the gap the script actually asked for. Durations are measured after
    # the trim, because that is what the captions have to line up against.
    with tempfile.TemporaryDirectory() as tmp:
        trim = ("silenceremove=start_periods=1:start_duration=0.02:"
                "start_threshold=-45dB:detection=peak,areverse,"
                "silenceremove=start_periods=1:start_duration=0.02:"
                "start_threshold=-45dB:detection=peak,areverse")
        listing = os.path.join(tmp, "list.txt")
        with open(listing, "w", encoding="utf-8") as fh:
            for c in clips:
                bare = os.path.join(tmp, f"{c['n']:02d}-bare.wav")
                subprocess.run(
                    ["ffmpeg", "-y", "-v", "error", "-i", c["file"],
                     "-af", trim, "-ar", "48000", "-ac", "1", bare], check=True)
                c["dur"] = probe_duration(bare)
                wav = os.path.join(tmp, f"{c['n']:02d}.wav")
                subprocess.run(
                    ["ffmpeg", "-y", "-v", "error", "-i", bare,
                     "-af", f"apad=pad_dur={c['gap']}", wav], check=True)
                fh.write(f"file '{wav.replace(chr(92), '/')}'\n")
        out_mp3 = os.path.join(base, "public", "audio", f"{script['id']}.mp3")
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
             "-i", listing, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
             "-b:a", "192k", out_mp3], check=True)

    t, timeline = 0.0, []
    for c in clips:
        timeline.append({"n": c["n"], "who": c["who"], "text": c["text"],
                         "start": round(t, 3), "end": round(t + c["dur"], 3)})
        t += c["dur"] + c["gap"]

    meta = {"id": script["id"], "title": script.get("title", ""),
            "total": round(t, 3), "audio": f"audio/{script['id']}.mp3",
            "phrases": timeline}
    json.dump(meta, open(os.path.join(base, "public", "audio",
                                      f"{script['id']}.json"), "w",
                         encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"\n{out_mp3}\n{t:.2f}s, {len(clips)} phrases")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(build(sys.argv[1])))
