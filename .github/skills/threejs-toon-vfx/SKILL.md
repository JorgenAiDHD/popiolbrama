---
name: threejs-toon-vfx
description: Wzorce grafiki toon/painted i efektów w Three.js dla Popiółbramy. WHEN: VFX, efekt, telegraf, pocisk, cząsteczki, obrys, sylwetka wroga, shader, instancing, wydajność renderu.
---

# Grafika i VFX

- Modele: materiał toon (gradient 3-4 stopni) + obrys (odwrócona powłoka) – wzory w `src/models.ts`.
- Wróg musi mieć czytelną sylwetkę i kolor odmienny od tła; elita = większa + poświata.
- Telegrafy ataków: pulsujący dysk/pierścień na ziemi, czas ostrzeżenia >= 0.6 s, kolor czerwony/pomarańczowy.
- Efekty przez pulę (`FxPool`), nie twórz obiektów w pętli. Limit 36 pocisków naraz.
- Świat (drzewa, kamienie) przez `InstancedMesh`. Adaptacyjna jakość `adapt()` obniża pxCap i efekty przy spadku FPS.
- Budżet: 8 wrogów ok. 42 draw calli, 200 wrogów ok. 300.
- Dźwięk: warianty SFX (losowa wysokość), ambient w tle; mute z menu.
