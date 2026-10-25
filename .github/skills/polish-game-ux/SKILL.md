---
name: polish-game-ux
description: Zasady tekstów i interfejsu Popiółbramy (polski, krótki, cielesny styl). WHEN: tekst w UI, opis karty, przycisk, komunikat, HUD, ekran dotykowy, safe-area, tłumaczenie.
---

# UX po polsku

- Teksty krótkie, 1-3 słowa na etykietach, cielesny/mroczny ton (żar, krew, popiół).
- Zakazane słowa: "loot", "skill", "epic", "tutorial" – używaj: łup/zdobycz, umiejętność/moc, wspaniały/legendarny, podpowiedź.
- W walce nic na środku ekranu poza celami; panele przy krawędziach, `env(safe-area-inset-*)`.
- Przyciski dotykowe >= 44 px; na telefonie wirtualny drążek, bez myszy.
- Menu pokazuje "Wykryto: <urządzenie · kontekst>" z `platform.label`.
- Stałe sprawdzenie: nowy tekst musi zmieścić się na ekranie 360x640.
