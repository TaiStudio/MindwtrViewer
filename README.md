# Mindwtr Viewer

Site Next.js pour visualiser `data/tasks.json` sous plusieurs angles : **tableau (kanban)**, **calendrier**, **roadmap** et **liste de tâches**, avec les avancements (checklists) partout.

## Démarrage

```bash
npm install   # ou pnpm install
npm run dev
```

Puis ouvrez <http://localhost:3000>.

## Données dynamiques

Le site relit **`data/tasks.json`** et **`data/config.json`** à chaque requête de page (`/` et `/api/data`, rendus bloquants donc jamais mis en cache), puis le navigateur rafraîchit automatiquement (par défaut toutes les 4 secondes, et au retour sur l'onglet).

👉 Vous pouvez modifier `data/tasks.json` à n'importe quel moment : les changements s'affichent seuls, sans redémarrer le serveur.

`tasks.json` est tolérant sur le format : tableau de `{ tasks: [...] }` (format actuel), objet `{ tasks: [...] }`, tableau plat de tâches, ou `{ projects: [{ tasks }] }`.

Chaque tâche est affichée avec :
- son **statut** (`today`, `next`, `someday`, `done`, … — les statuts inconnus sont affichés tels quels),
- son **avancement** : `checklist` complétée / total, sinon 100 % si le statut est « terminé »,
- ses dates de création / mise à jour, tags, description, pièces jointes.

## Configuration — `data/config.json`

```jsonc
{
  "siteName": "Mindwtr Viewer",          // string ou { "fr": ..., "en": ... }
  "language": "fr",                       // code d'une langue de lib/i18n/ — langue par défaut
  "theme": "moderne",                     // id d'un thème de lib/themes/ — thème par défaut
  "refreshIntervalMs": 4000,              // fréquence de rechargement (500–60000)
  "calendar": { "dateField": "updatedAt" } // "createdAt" | "updatedAt"
}
```

- Un fichier `config.json` **vide ou partiel** fonctionne : les valeurs manquantes prennent les défauts internes (`lib/defaults.ts`).
- **Les langues et les thèmes ne se déclarent plus ici** : ils sont découverts dans les dossiers dédiés (voir ci-dessous). Ce fichier ne fait que choisir les défauts.
- La langue et le thème choisis dans l'interface sont mémorisés dans le navigateur (`localStorage`) et priment sur `config.json`.

## Ajouter une langue — `lib/i18n/*.ts`

**Créez un fichier, c'est tout.** Aucun index à mettre à jour : le serveur relit le dossier à chaque requête et le nouveau fichier apparaît dans le sélecteur de langue à la prochaine actualisation.

```ts
// lib/i18n/de.ts
import type { Locale } from "@/lib/i18n/locale";

const de: Locale = {
  code: "de",            // doit correspondre au nom du fichier
  name: "Deutsch",       // affiché dans le sélecteur
  intl: "de-DE",         // formatage des dates/ nombres (défaut : code)
  weekStart: 1,          // 0 = dimanche, 1 = lundi (défaut : 1)
  dict: {
    tabBoard: "Board",
    tabCalendar: "Kalender",
    // … un sous-ensemble suffit
  },
};

export default de;
```

- Les clés manquantes **tombent automatiquement sur l'anglais** : un fichier peut commencer avec 3 chaînes.
- La liste des clés est dans `lib/i18n/dictionary.ts`. Pour une nouvelle chaîne d'interface : ajoutez la clé là, puis sa traduction dans chaque fichier de langue.
- `lib/i18n/{index,locale,dictionary}.ts` sont réservés à l'infrastructure et ignorés par la découverte.

## Ajouter un thème — `lib/themes/*.ts`

Même principe : **créez le fichier, c'est tout.**

```ts
// lib/themes/neon.ts
import type { ThemeInput } from "@/lib/types";

const neon: ThemeInput = {
  name: { fr: "Néon", en: "Neon" },   // chaîne simple possible aussi
  mode: "dark",                        // "light" | "dark"
  colors: { bg: "#05050a", accent: "#22d3ee" }, // partial : le reste prend le thème par défaut
};

export default neon;
```

- Seul `colors` est requis. L'`id` vaut le nom du fichier, `mode` vaut `"light"` par défaut.
- Les couleurs non fournies sont complétées par une palette de repli : un fichier de 2 lignes suffit.
- Les jetons disponibles : `bg`, `surface`, `surface2`, `border`, `text`, `textMuted`, `accent`, `accentText`, `accentSoft`, `success`, `warning`, `danger`, `info`, `shadow` → variables CSS `--c-bg`, `--c-text-muted`, …

### Thèmes livrés

| fichier | nom |
| --- | --- |
| `moderne.ts` | Moderne & minimaliste (**défaut**, clair) |
| `minuit.ts` | Minuit (sombre) |
| `aurore.ts` | Aurore (doux, accent terracotta) |

### Langues livrées

| fichier | nom |
| --- | --- |
| `fr.ts` | Français (**défaut**) |
| `en.ts` | English (repli de toutes les autres langues) |

## Structure

```
app/
  page.tsx            # rendu bloquant : lit data/*.json à chaque requête → <Viewer />
  layout.tsx          # polices Geist + métadonnées
  globals.css         # variables de couleur pilotées par le thème
  api/data/route.ts   # relit data/*.json à chaque appel (jamais mis en cache)
components/
  Viewer.tsx          # en-tête, onglets, thème, langue, rafraîchissement auto
  BoardView.tsx       # kanban par statut + avancement par colonne
  CalendarView.tsx    # mois complet, tâches par jour, panneau latéral
  RoadmapView.tsx     # timeline horizontale (barres création → mise à jour)
  TasksView.tsx       # liste filtrable (recherche, statut, étiquettes)
  ui.tsx              # barres d'avancement, pastilles, cartes, détails
lib/
  data.ts             # lecture disque de data/*.json + découverte des langues/thèmes
  discover.ts         # scan de lib/i18n/ et lib/themes/ (nouveau fichier = nouvelle entrée)
  derive.ts           # normalisation des tâches, statuts, dates, agrégats
  defaults.ts         # config par défaut + fusion avec config.json
  prefs.ts            # langue / thème / vue mémorisés (localStorage)
  types.ts            # types partagés (ThemeInput, DataSet, …)
  i18n/
    dictionary.ts     # toutes les clés de texte de l'interface
    locale.ts         # types Locale / ResolvedLocale
    index.ts          # formatDate, formatMonth, statusLabel, fmt, resolveDict…
    fr.ts             # Français (défaut)
    en.ts             # English (repli)
  themes/
    moderne.ts        # thème par défaut
    minuit.ts         # sombre
    aurore.ts         # doux
```

## Vue roadmap

Faute de dates d'échéance dans `tasks.json`, chaque barre couvre **`createdAt` → `updatedAt`**, sa couleur vient du statut et son **remplissage = avancement de la checklist**. Les lignes (lanes) sont les statuts, avec un avancement moyen par statut et un repère « aujourd'hui ».
