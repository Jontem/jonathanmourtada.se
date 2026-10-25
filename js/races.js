/*
  Mina lopp. Lägg till nya lopp längst ner i listan.

  date:  "ÅÅÅÅ-MM-DD"
  name:  loppets namn
  km:    distans (10, 21.1, 30 ...). 10 och 21.1 visas i grafen.
  time:  officiell tid, "mm:ss" eller "h:mm:ss"
  place: placering (valfritt)
  note:  kort kommentar (valfritt)

  Personbästa och grafen räknas ut automatiskt från listan.
*/
window.RACES = [
  { date: "2022-04-18", name: "Varvetmilen", km: 10, time: "39:25" },
  { date: "2022-05-21", name: "Göteborgsvarvet", km: 21.1, time: "1:29:25" },

  { date: "2023-04-10", name: "Varvetmilen", km: 10, time: "38:14" },
  { date: "2023-05-13", name: "Göteborgsvarvet", km: 21.1, time: "1:26:27" },
  { date: "2023-05-26", name: "Eksjö stadslopp", km: 10, time: "37:28" },
  { date: "2023-10-07", name: "Å-stadsloppet", km: 21.1, time: "1:24:29" },

  { date: "2024-04-01", name: "Varvetmilen", km: 10, time: "35:57" },
  { date: "2024-04-28", name: "Landsjön runt", km: 12.2, time: "45:01", place: 11 },
  { date: "2024-05-18", name: "Göteborgsvarvet", km: 21.1, time: "1:21:41" },
  { date: "2024-05-31", name: "Eksjö stadslopp", km: 10, time: "36:16" },
  { date: "2024-07-06", name: "Örebro parkrun", km: 5, time: "17:48" },
  { date: "2024-08-13", name: "Blodomloppet", km: 10, time: "35:55" },
  { date: "2024-10-19", name: "Å-stadsloppet", km: 21.1, time: "1:17:24", place: 12 },
  { date: "2024-10-26", name: "Terräng-SM, veteranklass", km: 8, time: "29:58" },

  { date: "2025-03-29", name: "Premiärmilen", km: 10, time: "34:52" },
  { date: "2025-05-17", name: "Göteborgsvarvet", km: 21.1, time: "1:18:19" },
  { date: "2025-05-30", name: "Eksjö stadslopp", km: 10, time: "34:57", place: 13 },
  { date: "2025-07-26", name: "Falkenbergs stadslopp", km: 10, time: "34:00" },
  { date: "2025-08-12", name: "Blodomloppet", km: 10, time: "34:17", place: 5 },
  { date: "2025-08-30", name: "Jönköpings halvmaraton", km: 21.1, time: "1:16:38", place: 3 },
  { date: "2025-09-07", name: "Löprallarn", km: 15, time: "55:26", place: 2 },
  { date: "2025-10-11", name: "Å-stadsloppet", km: 21.1, time: "1:15:04", place: 9 },
  { date: "2025-10-18", name: "Jönköping 10k", km: 10, time: "33:41" },

  { date: "2026-03-28", name: "Premiärmilen", km: 10, time: "33:56" },
  { date: "2026-04-06", name: "Varvetmilen", km: 10, time: "33:37", place: 10 },
  { date: "2026-04-26", name: "Landsjön runt", km: 12.2, time: "41:48", place: 4 },
  { date: "2026-05-23", name: "Göteborgsvarvet", km: 21.1, time: "1:15:13" },
  { date: "2026-06-24", name: "Karlstad stadslopp", km: 10, time: "34:41" },
  { date: "2026-07-25", name: "Falkenbergs stadslopp", km: 10, time: "34:05" },
  { date: "2026-08-29", name: "Jönköpings halvmaraton", km: 21.1, time: "1:15:25", place: 3 },
  { date: "2026-09-26", name: "Lidingöloppet", km: 30, time: "1:57:39" }
];

