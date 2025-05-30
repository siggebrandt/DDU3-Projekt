# DDU3-Projekt

**Projekt, Digital Design och Utveckling 3, Malmö Universitet, Vårterminen 2025**

Det här projektet är ett frågesportspel där användaren kan skapa ett konto, logga in och spela quiz inom olika kategorier och svårighetsgrader. Frågorna hämtas automatiskt från en öppen databas (OpenTDB) och sparas i den lokala databasen tillsammans med användarens resultat.

Applikationen är uppbyggd med Deno och har ett eget API som hanterar allt från registrering och inloggning till att skapa quiz och spara statistik. Informationen lagras i en JSON-fil.

När man kör projektet lokalt startas en server som lyssnar på förfrågningar från gränssnittet. Användaren kan då registrera sig, välja svårighetsgrad och kategori, besvara frågorna och se sitt resultat sparas automatiskt.
