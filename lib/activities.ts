import type { Vibe } from "./types";

export interface Activity {
  name: string;
  /** Prix indicatif par personne, 0 = gratuit */
  price: number;
  vibe?: Vibe;
  note?: string;
}

/**
 * Activités curatées par destination, prix indicatifs 2026.
 * Volontairement un mix gratuit / petit budget : l'app cible les étudiants.
 */
export const activities: Record<string, Activity[]> = {
  dieppe: [
    { name: "Falaises de Pourville à pied", price: 0, vibe: "mer" },
    { name: "Baignade et front de mer", price: 0, vibe: "mer" },
    { name: "Château-musée de Dieppe", price: 5 },
    { name: "Kayak de mer (2h)", price: 25, vibe: "mer" },
    { name: "Marché du samedi", price: 0 },
  ],
  "le-treport": [
    { name: "Funiculaire et panorama des falaises", price: 0, vibe: "mer" },
    { name: "Baignade plage de galets", price: 0, vibe: "mer" },
    { name: "Mers-les-Bains et villas 1900", price: 0 },
    { name: "Sortie pêche en mer (3h)", price: 35, vibe: "mer" },
  ],
  etretat: [
    { name: "Arche et Aiguille par le GR21", price: 0, vibe: "mer" },
    { name: "Jardins d'Étretat", price: 12 },
    { name: "Vélo-rail de la valleuse", price: 20 },
    { name: "Coucher de soleil falaise d'Amont", price: 0, vibe: "mer" },
  ],
  deauville: [
    { name: "Les Planches et bains de mer", price: 0, vibe: "mer" },
    { name: "Criée de Trouville", price: 0 },
    { name: "Location paddle (1h)", price: 15, vibe: "mer" },
    { name: "Casino (entrée libre)", price: 0 },
    { name: "Vélo le long de la Touques", price: 12 },
  ],
  "saint-malo": [
    { name: "Tour des remparts", price: 0, vibe: "mer" },
    { name: "Grand Bé à marée basse", price: 0, vibe: "mer" },
    { name: "Navette maritime Dinard", price: 9 },
    { name: "Char à voile (initiation)", price: 35, vibe: "mer" },
    { name: "Aquarium de Saint-Malo", price: 18 },
  ],
  "la-rochelle": [
    { name: "Les trois tours du Vieux-Port", price: 10, vibe: "ville" },
    { name: "Île de Ré à vélo (journée)", price: 15, vibe: "mer" },
    { name: "Marché central", price: 0 },
    { name: "Aquarium La Rochelle", price: 17 },
    { name: "Plage des Minimes", price: 0, vibe: "mer" },
  ],
  biarritz: [
    { name: "Cours de surf (1h30)", price: 40, vibe: "mer" },
    { name: "Rocher de la Vierge", price: 0, vibe: "mer" },
    { name: "Côte des Basques au coucher", price: 0, vibe: "mer" },
    { name: "Saint-Jean-de-Luz en TER", price: 8 },
    { name: "Cité de l'Océan", price: 15 },
  ],
  marseille: [
    { name: "Calanque de Sormiou (bus + marche)", price: 2, vibe: "mer" },
    { name: "Le Panier et Vieux-Port", price: 0, vibe: "ville" },
    { name: "MuCEM (gratuit -26 ans UE)", price: 0, vibe: "ville" },
    { name: "Plages du Prado", price: 0, vibe: "mer" },
    { name: "Navette Frioul ou Château d'If", price: 12 },
  ],
  cassis: [
    { name: "Calanques d'En-Vau et Port-Pin à pied", price: 0, vibe: "mer" },
    { name: "Bateau les 5 calanques (1h)", price: 22, vibe: "mer" },
    { name: "Route des Crêtes (Cap Canaille)", price: 0 },
    { name: "Dégustation au port", price: 10 },
  ],
  sete: [
    { name: "Lido à vélo (12 km de plage)", price: 10, vibe: "mer" },
    { name: "Mont Saint-Clair au coucher", price: 0, vibe: "mer" },
    { name: "Halles et tielles", price: 8 },
    { name: "Musée Paul Valéry", price: 6 },
    { name: "Paddle sur l'étang de Thau", price: 18, vibe: "lac" },
  ],
  collioure: [
    { name: "Château royal", price: 4, vibe: "mer" },
    { name: "Sentier littoral vers Port-Vendres", price: 0, vibe: "mer" },
    { name: "Chemin du Fauvisme", price: 0, vibe: "ville" },
    { name: "Snorkeling réserve de Cerbère (sortie)", price: 30, vibe: "mer" },
  ],
  nice: [
    { name: "Promenade des Anglais à l'aube", price: 0, vibe: "mer" },
    { name: "Colline du Château", price: 0, vibe: "ville" },
    { name: "Villefranche-sur-Mer en TER", price: 4, vibe: "mer" },
    { name: "Musées de Nice (pass 24h)", price: 15, vibe: "ville" },
    { name: "Socca au marché du cours Saleya", price: 5 },
  ],
  annecy: [
    { name: "Baignade au Pâquier", price: 0, vibe: "lac" },
    { name: "Tour du lac à vélo (42 km)", price: 18, vibe: "lac" },
    { name: "Gorges du Fier", price: 6, vibe: "montagne" },
    { name: "Paddle sur le lac (1h)", price: 15, vibe: "lac" },
    { name: "Vieille ville et canaux", price: 0, vibe: "ville" },
  ],
  gerardmer: [
    { name: "Tour du lac à pied", price: 0, vibe: "lac" },
    { name: "Pédalo (1h)", price: 12, vibe: "lac" },
    { name: "Cascades du Saut des Cuves", price: 0, vibe: "montagne" },
    { name: "Luge d'été", price: 8, vibe: "montagne" },
  ],
  chamonix: [
    { name: "Lac Blanc (rando journée)", price: 0, vibe: "montagne" },
    { name: "Mer de Glace (Montenvers AR)", price: 39, vibe: "montagne" },
    { name: "Aiguille du Midi (téléphérique AR)", price: 75, vibe: "montagne", note: "le gros budget, vue à 3842 m" },
    { name: "Petit balcon sud", price: 0, vibe: "montagne" },
  ],
  lyon: [
    { name: "Traboules du Vieux Lyon", price: 0, vibe: "ville" },
    { name: "Musée des Confluences", price: 9, vibe: "ville" },
    { name: "Pentes de la Croix-Rousse", price: 0, vibe: "ville" },
    { name: "Berges du Rhône à vélo", price: 4, vibe: "ville" },
    { name: "Bouchon le midi", price: 18 },
  ],
  lille: [
    { name: "Vieux-Lille à pied", price: 0, vibe: "ville" },
    { name: "Palais des Beaux-Arts", price: 7, vibe: "ville" },
    { name: "Marché de Wazemmes (dimanche)", price: 0 },
    { name: "Gand ou Bruges en train (journée)", price: 20, vibe: "ville" },
    { name: "Estaminet · welsh et bière locale", price: 15 },
  ],
  strasbourg: [
    { name: "Petite France et ponts couverts", price: 0, vibe: "ville" },
    { name: "Plateforme de la cathédrale", price: 8, vibe: "ville" },
    { name: "Batorama (bateau 1h10)", price: 16 },
    { name: "Vélo jusqu'à Kehl (Allemagne)", price: 4, vibe: "ville" },
    { name: "Winstub · tarte flambée", price: 12 },
  ],
};

export function activitiesOf(slug: string): Activity[] {
  return activities[slug] ?? [];
}
