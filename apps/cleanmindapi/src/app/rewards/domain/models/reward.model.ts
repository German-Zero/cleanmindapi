export interface RewardSummary {
  balance: number;
  earnedThisMonth: number;
  monthlyLimit: number;
  remainingThisMonth: number;
}

export interface RewardGrant extends RewardSummary {
  pointsAwarded: number;
}

export type RewardedResponse<T> = T & {
  reward: RewardGrant;
};

export interface PointsTotals {
  balance: number;
  earnedThisMonth: number;
}

export enum StoreItemCategory {
  PALETTE = 'PALETTE',
  BACKGROUND = 'BACKGROUND',
  BORDER = 'BORDER',
  EFFECT = 'EFFECT',
  POMODORO = 'POMODORO',
  CALENDAR = 'CALENDAR',
}

export enum StoreItemId {
  PALETTE_LAVENDER_NIGHT = 'PALETTE_LAVENDER_NIGHT',
  PALETTE_CLEAR_SAGE = 'PALETTE_CLEAR_SAGE',
  PALETTE_ABYSS_CORAL = 'PALETTE_ABYSS_CORAL',
  PALETTE_COFFEE_BLOOM = 'PALETTE_COFFEE_BLOOM',
  PALETTE_ARCTIC_BERRY = 'PALETTE_ARCTIC_BERRY',
  PALETTE_CITRUS_PAPER = 'PALETTE_CITRUS_PAPER',
  BACKGROUND_FIREFLY_GARDEN = 'BACKGROUND_FIREFLY_GARDEN',
  BACKGROUND_COSMIC_RIBBONS = 'BACKGROUND_COSMIC_RIBBONS',
  BACKGROUND_RAINY_WINDOW = 'BACKGROUND_RAINY_WINDOW',
  BACKGROUND_FLOATING_BLOOMS = 'BACKGROUND_FLOATING_BLOOMS',
  BORDER_AURORA = 'BORDER_AURORA',
  BORDER_SUNSET = 'BORDER_SUNSET',
  BORDER_OCEAN_PULSE = 'BORDER_OCEAN_PULSE',
  BORDER_GILDED_MOSS = 'BORDER_GILDED_MOSS',
  EFFECT_SERENE_GLASS = 'EFFECT_SERENE_GLASS',
  EFFECT_SOFT_GLOW = 'EFFECT_SOFT_GLOW',
  EFFECT_PAPER_GRAIN = 'EFFECT_PAPER_GRAIN',
  POMODORO_BLOOM_RING = 'POMODORO_BLOOM_RING',
  CALENDAR_TIDAL_WAVE = 'CALENDAR_TIDAL_WAVE',
}

export interface StoreItemDefinition {
  id: StoreItemId;
  category: StoreItemCategory;
  name: string;
  description: string;
  cost: number;
  colors: readonly string[];
}

export interface StoreItem {
  id: StoreItemId;
  category: StoreItemCategory;
  name: string;
  description: string;
  cost: number;
  colors: string[];
  owned: boolean;
  canAfford: boolean;
  equipped: boolean;
}

export interface StorefrontResponse {
  summary: RewardSummary;
  items: StoreItem[];
}

export interface StorePurchaseResponse {
  summary: RewardSummary;
  item: StoreItem;
  purchased: boolean;
}

export const STORE_CATALOG: readonly StoreItemDefinition[] = [
  {
    id: StoreItemId.PALETTE_LAVENDER_NIGHT,
    category: StoreItemCategory.PALETTE,
    name: 'Cobre Nocturno',
    description: 'Carbón, terracota y cobre para un ambiente cálido y profundo.',
    cost: 45,
    colors: ['#0A1820', '#193846', '#F0A35C'],
  },
  {
    id: StoreItemId.PALETTE_CLEAR_SAGE,
    category: StoreItemCategory.PALETTE,
    name: 'Melocotón Papel',
    description: 'Crema, durazno y arcilla con una luminosidad suave.',
    cost: 45,
    colors: ['#FFF5EC', '#F2D3BC', '#B7654A'],
  },
  {
    id: StoreItemId.PALETTE_ABYSS_CORAL,
    category: StoreItemCategory.PALETTE,
    name: 'Abismo Coral',
    description: 'Azul tinta y coral para un contraste oscuro más expresivo.',
    cost: 50,
    colors: ['#0A1220', '#263B52', '#FF7A7A'],
  },
  {
    id: StoreItemId.PALETTE_COFFEE_BLOOM,
    category: StoreItemCategory.PALETTE,
    name: 'Café en Flor',
    description: 'Café tostado y rosa arcilla para sesiones tranquilas.',
    cost: 50,
    colors: ['#17110F', '#382823', '#D89A76'],
  },
  {
    id: StoreItemId.PALETTE_ARCTIC_BERRY,
    category: StoreItemCategory.PALETTE,
    name: 'Baya Ártica',
    description: 'Blancos fríos, azul hielo y un acento de frutos rojos.',
    cost: 50,
    colors: ['#F4F7FB', '#D9E4F2', '#B05A8C'],
  },
  {
    id: StoreItemId.PALETTE_CITRUS_PAPER,
    category: StoreItemCategory.PALETTE,
    name: 'Papel Cítrico',
    description: 'Marfil, amarillo suave y naranja tostado para una vista clara.',
    cost: 50,
    colors: ['#FFF9E8', '#F3E1A6', '#D8793B'],
  },
  {
    id: StoreItemId.BACKGROUND_FIREFLY_GARDEN,
    category: StoreItemCategory.BACKGROUND,
    name: 'Jardín de Luciérnagas',
    description: 'Pequeñas luces cálidas que flotan lentamente en el fondo.',
    cost: 60,
    colors: ['#0B1020', '#77E8B5', '#FFD978'],
  },
  {
    id: StoreItemId.BACKGROUND_COSMIC_RIBBONS,
    category: StoreItemCategory.BACKGROUND,
    name: 'Cintas Cósmicas',
    description: 'Velos de color que cruzan el espacio con un movimiento lento.',
    cost: 65,
    colors: ['#090D1F', '#6F63FF', '#E46FD8'],
  },
  {
    id: StoreItemId.BACKGROUND_RAINY_WINDOW,
    category: StoreItemCategory.BACKGROUND,
    name: 'Ventana Lluviosa',
    description: 'Gotas tenues que descienden sobre un fondo azul profundo.',
    cost: 65,
    colors: ['#0C1724', '#4C8FB8', '#A9D8E8'],
  },
  {
    id: StoreItemId.BACKGROUND_FLOATING_BLOOMS,
    category: StoreItemCategory.BACKGROUND,
    name: 'Pétalos Flotantes',
    description: 'Pétalos abstractos que recorren la pantalla sin distraer.',
    cost: 65,
    colors: ['#1B1020', '#E58AAE', '#F6C9B8'],
  },
  {
    id: StoreItemId.BORDER_AURORA,
    category: StoreItemCategory.BORDER,
    name: 'Borde Aurora',
    description: 'Un degradado frío y sutil para paneles y tarjetas.',
    cost: 35,
    colors: ['#68D5C8', '#9B8CFF', '#E993C8'],
  },
  {
    id: StoreItemId.BORDER_SUNSET,
    category: StoreItemCategory.BORDER,
    name: 'Borde Ocaso',
    description: 'Un degradado cálido con coral, violeta y azul profundo.',
    cost: 35,
    colors: ['#FFB36B', '#F073A6', '#7768E8'],
  },
  {
    id: StoreItemId.BORDER_OCEAN_PULSE,
    category: StoreItemCategory.BORDER,
    name: 'Pulso Oceánico',
    description: 'Azules eléctricos y turquesa con un brillo contenido.',
    cost: 40,
    colors: ['#3B82F6', '#22D3EE', '#5EEAD4'],
  },
  {
    id: StoreItemId.BORDER_GILDED_MOSS,
    category: StoreItemCategory.BORDER,
    name: 'Musgo Dorado',
    description: 'Verde bosque, oliva y oro para un acabado natural.',
    cost: 40,
    colors: ['#2F6B55', '#8DAA65', '#E4C76A'],
  },
  {
    id: StoreItemId.EFFECT_SERENE_GLASS,
    category: StoreItemCategory.EFFECT,
    name: 'Cristal Sereno',
    description: 'Superficies translúcidas con desenfoque suave y limpio.',
    cost: 50,
    colors: ['#FFFFFF', '#BBDDF6', '#A79AFF'],
  },
  {
    id: StoreItemId.EFFECT_SOFT_GLOW,
    category: StoreItemCategory.EFFECT,
    name: 'Resplandor Suave',
    description: 'Una luz ambiental tenue alrededor de tarjetas y controles.',
    cost: 55,
    colors: ['#86E7D4', '#8EA7FF', '#D8A6FF'],
  },
  {
    id: StoreItemId.EFFECT_PAPER_GRAIN,
    category: StoreItemCategory.EFFECT,
    name: 'Grano de Papel',
    description: 'Una textura fina que reduce la apariencia plana de la interfaz.',
    cost: 55,
    colors: ['#F5EBD8', '#BDAF9A', '#756A5B'],
  },
  {
    id: StoreItemId.POMODORO_BLOOM_RING,
    category: StoreItemCategory.POMODORO,
    name: 'Corona de Flores',
    description: 'Pequeñas flores suaves alrededor del cronómetro Pomodoro.',
    cost: 70,
    colors: ['#F3A6C8', '#BFA8FF', '#82D8C2'],
  },
  {
    id: StoreItemId.CALENDAR_TIDAL_WAVE,
    category: StoreItemCategory.CALENDAR,
    name: 'Marea Serena',
    description: 'Una oleada de agua recorre el calendario cada cierto tiempo.',
    cost: 120,
    colors: ['#4FC3D7', '#5B8DEF', '#A6E3F0'],
  },
] as const;
