e-Dziennik Demo (client-only)
===========================

To jest prosty demo e-dziennika działający całkowicie w przeglądarce (no backend).
Możesz odpalić to na telefonie na trzy sposoby:

1) Otwórz plik index.html w przeglądarce telefonu (np. skopiuj ZIP na telefon i rozpakuj).
2) Wrzucić zawartość na hosting statyczny (GitHub Pages, Vercel, Netlify) — działa od razu.
3) Uruchomić lokalny serwer i wejść z telefonu pod IP komputera (np. `python -m http.server 8000`) i wejść na http://<IP-komputera>:8000

Funkcje demo:
- Logowanie symulowane (lokalnie) i role: Nauczyciel, Rodzic, Uczeń, Admin.
- Przegląd ocen i frekwencji dla klasy i ucznia.
- Nauczyciel może dodawać oceny i frekwencję (zapis w localStorage).
- Prosty system wiadomości (lokalny).
- PWA: installable na ekran startowy.

Pliki:
- index.html — główny plik
- app.js — logika aplikacji
- styles.css — styl
- manifest.json — PWA manifest
- sw.js — prosty service worker
- README.md — ten plik

Powodzenia! — jeśli chcesz, mogę rozbudować to o backend (Node + PostgreSQL) i przygotować pełne repo z Docker Compose.
