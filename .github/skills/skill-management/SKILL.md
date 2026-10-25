---
name: skill-management
description: Tworzenie, utrzymanie i przegląd skilli i instrukcji agenta w tym projekcie. WHEN: nowy skill, popraw skill, skill się nie uruchamia, za dużo skilli, AGENTS.md, instrukcje agenta, przegląd skilli, SKILL.md.
---

# Zarządzanie skillami

- Lokalizacja: `.github/skills/<nazwa>/SKILL.md`; nazwa = nazwa folderu, małe litery i myślniki.
- Frontmatter: `name`, `description` (do 1024 znaków, z frazami WHEN). Opis decyduje o tym, czy skill się załaduje.
- Treść krótka, konkretna: komendy, progi, pułapki. Szczegóły w `docs/` i linkuj.
- Dodaj skill dopiero gdy ta wiedza wróciła trzeci raz. Jedna odpowiedzialność na skill.
- Zawsze aktywne zasady trafiają do `AGENTS.md`, nie do skilla.
- Przegląd co kilka sesji: usuń martwe, scal duplikaty, popraw opisy które nie wyzwalają się.
- Skille zewnętrzne: `npx skills add <repo> --skill <nazwa>`; przed instalacją przeczytaj SKILL.md i skrypty (to kod wykonywany przez agenta). Przypnij wersję.
- Skill nie jest dokumentacją użytkownika. Dla użytkownika służy `docs/PREZENTACJA.md`.
- Aby skille się ładowały, otwórz `c:\Users\creat\popiolbrama` jako workspace w VS Code.
