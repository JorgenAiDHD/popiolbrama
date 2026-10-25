---
name: game-audio-sfx
description: Dźwięk w Popiółbramie: efekty, warianty, mikser, muzyka i ambient, bez plików audio. WHEN: dźwięk, SFX, muzyka, ambient, mikser, głośność, wariant dźwięku, mute, audio na telefonie, odblokowanie audio.
---

# Audio

- Własny syntezator (Web Audio). Pliki audio nie są potrzebne; build zostaje w jednym pliku.
- Każdy często grany efekt ma 3-5 wariantów (losowa wysokość +-6%, filtr, szum). Powtórzenia męczą najszybciej.
- Priorytety i limit głosów: trafienia tłumu skracane/zliczane, bossy i niebezpieczeństwo zawsze słyszalne.
- Mikser: grupy (muzyka, SFX, ambient, UI), kompresor na wyjściu, ducking muzyki pod ważnymi zdarzeniami.
- Informacja dźwiękiem: telegraf bossa ma własny, rozpoznawalny dźwięk przed uderzeniem; niski HP = wyraźny sygnał.
- Przeglądarki i telefony odblokowują audio dopiero po geście: wznów `AudioContext` przy pierwszym dotyku/kliknięciu.
- Mute w menu zapisany w `meta`. Testy działają z mute (`popiolbrama.meta2.mute = true`).
- Gdy potrzebne gotowe SFX: generator ZzFX/jsfxr (patrz `docs/REPOZYTORIA.md`), wynik jako parametry w kodzie, nie pliki.
