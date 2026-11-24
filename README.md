# Mindwtr Viewer

Site Next.js pour visualiser `data/tasks.json` sous plusieurs angles : **tableau (kanban)**, **calendrier**, **roadmap**, **liste de tâches** et **références**, avec les avancements (checklists) partout.

Cliquez n'importe quelle tâche (carte, ligne, barre de roadmap, entrée de référence) pour l'ouvrir dans une **modale** : description en **Markdown** rendue proprement (titres, tableaux, listes, liens…), checklist, métadonnées et **pièces jointes** avec aperçu image.

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
  "calendar": { "dateField": "updatedAt" }, // "createdAt" | "updatedAt"

  "references": {                         // onglet Références (voir ci-dessous)
    "label": null,                        //   nom de l'onglet
    "hideEmpty": true,                    //   masquer groupes vides + entrées à 0 tâche
    "groups": {                           //   un bloc par groupe :
      "tasks":    { "hidden": false, "label": null },   // Tâches de référence
      "areas":    { "hidden": false, "label": null },   // Domaines
      "people":   { "hidden": false, "label": null },   // Personnes
      "projects": { "hidden": false, "label": null },   // Projets
      "sections": { "hidden": false, "label": null },   // Sections
      "contexts": { "hidden": false, "label": null }    // Contextes
    }
  },

  "hideDeleted": true,                    // masquer les tâches avec deletedAt (défaut)
  "hideArchived": false                   // masquer les tâches avec archivedAt
}
```

- Un fichier `config.json` **vide ou partiel** fonctionne : les valeurs manquantes prennent les défauts internes (`lib/defaults.ts`).
- **Les langues et les thèmes ne se déclarent plus ici** : ils sont découverts dans les dossiers dédiés (voir ci-dessous). Ce fichier ne fait que choisir les défauts.
- La langue et le thème choisis dans l'interface sont mémorisés dans le navigateur (`localStorage`) et priment sur `config.json`.
- `label` accepte une **chaîne fixe** (`"…"`) ou une **carte par langue** (`{ "fr": "…", "en": "…" }`) ; `null` garde le libellé traduit des fichiers de langue.

### Exemple : renommer + masquer

```jsonc
{
  "references": {
    "label": { "fr": "Bibliothèque", "en": "Library" },  // nom de l'onglet
    "hideEmpty": true,                                    // rien d'affiché à 0
    "groups": {
      "people":   { "hidden": true },                     // groupe masqué
      "projects": { "label": { "fr": "Projets de jeu" } } // groupe renommé
    }
  }
}
```

Chaque `label` de groupe suit la même règle que l'onglet : `null` → libellé traduit (`refAreas`, `refPeople`, …).

## Onglet Références

Six groupes issus de `data/tasks.json`, avec nombre de tâches et avancement :

| groupe | id de config | source | compté par |
| --- | --- | --- | --- |
| **Tâches de référence** | `tasks` | tâches au statut `reference` | clic → modale de la tâche |
| **Contextes** | `contexts` | `settings.taxonomy.contexts` ∪ contextes employés par les tâches | clic → filtre global |
| **Domaines** | `areas` | `areas[]` | `task.areaId`, ou `project.areaId` de son projet |
| **Personnes** | `people` | `people[]` | `task.assignedTo` (même nom) |
| **Projets** | `projects` | `projects[]` | `task.projectId` — chaque projet liste ses sections |
| **Sections** | `sections` | `sections[]` | `task.sectionId`, regroupées par projet |

Deux règles de visibilité, réglables dans `references` :

- **`groups.<id>.hidden: true`** → le groupe entier disparaît.
- **`hideEmpty: true`** → un groupe **vide** disparaît, et dans chaque groupe une **entrée à 0 tâche** disparaît aussi (un projet sans tâche, un contexte inutilisé…). Un projet ne gardant plus que des sections vides disparaît lui aussi.

## Filtre par contexte

Le sélecteur **Contexte** de l'en-tête (à côté du thème) filtre **toutes les vues** : tableau, calendrier, roadmap, tâches et références. Le choix est mémorisé dans le navigateur.

Depuis l'onglet Références, cliquer une pastille de contexte active le même filtre (recliquer la désactive).

## Modale de tâche, Markdown, pièces jointes

- **Modale** : chaque tâche est cliquable (cartes du tableau, lignes des tâches, barres de la roadmap, entrées « Tâches de référence ») et s'ouvre dans une fenêtre modale — `Échap`, la croix ou le clic en dehors la ferment.
- **Markdown** : la `description` est interprétée par un rendu maison (`components/Markdown.tsx`, aucun `dangerouslySetInnerHTML`) — titres, tableaux, listes imbriquées, citations, code, liens, images et front-matter YAML.
- **Pièces jointes** : les fichiers déclarés dans `tasks.json` sont servis depuis **`public/`** (`cloudKey` → `/attachments/…`, les `uri` externes tels quels). Les images ont un aperçu, les PDF un badge ; un fichier absent de `public/` affiche un badge « manquant » au lieu d'une image cassée. Copiez vos fichiers dans `public/attachments/` — ils apparaissent sans redémarrer.

## Tâches supprimées / archivées

- **`hideDeleted: true`** (défaut) : les tâches portant `deletedAt` n'apparaissent dans **aucune** vue. Passez-le à `false` pour les afficher quand même.
- **`hideArchived: false`** (défaut) : idem pour `archivedAt` si vous activez cette option.

## Ajouter une langue — `lib/i18n/*.ts`

**Créez un fichier, c'est tout.** Aucun index à mettre à jour : le serveur relit le dossier à chaque requête et le nouveau fichier apparaît dans le sélecteur de langue à la prochaine actualisation.

> Les deux dossiers sont lus **à chaque requête**, jamais mis en cache : créer un fichier, en supprimer un, ou **modifier le contenu d'un fichier existant** (une couleur, une traduction…) est pris en compte sans redémarrer ni recompiler.

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
  Viewer.tsx          # en-tête, onglets, thème, langue, filtre contexte, rafraîchissement auto, modale de tâche
  BoardView.tsx       # kanban par statut + avancement par colonne
  CalendarView.tsx    # mois complet, tâches par jour, panneau latéral
  RoadmapView.tsx     # timeline horizontale (barres création → mise à jour)
  TasksView.tsx       # liste filtrable (recherche, statut, étiquettes)
  ReferencesView.tsx  # références, domaines, personnes, projets, sections, contextes
  TaskModal.tsx       # modale de tâche (Échap / croix / clic extérieur)
  Markdown.tsx        # rendu Markdown (titres, tableaux, listes, liens…)
  ui.tsx              # barres d'avancement, pastilles, cartes, détails, pièces jointes
lib/
  data.ts             # lecture disque de data/*.json + découverte des langues/thèmes
  discover.ts         # scan de lib/i18n/ et lib/themes/ (nouveau fichier = nouvelle entrée)
  derive.ts           # normalisation des tâches, statuts, dates, filtres, agrégats
  references.ts       # extraction de areas/people/projects/sections/contextes
  defaults.ts         # config par défaut + fusion avec config.json
  prefs.ts            # langue / thème / vue / contexte mémorisés (localStorage)
  types.ts            # types partagés (ThemeInput, DataSet, ReferenceData, …)
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
