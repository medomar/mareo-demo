export type Property = {
  readonly name: string;
  readonly rooms: number;
};

export type HotelGroup = {
  readonly name: string;
  readonly properties: readonly Property[];
};

export type Hotel = {
  readonly name: string;
  readonly rooms: number;
  readonly category: number;
  readonly location: string;
  readonly group: HotelGroup;
};

export const HOTEL: Hotel = {
  name: 'Royal Thalassa Monastir',
  rooms: 260,
  category: 5,
  location: 'Skanès, Monastir, Tunisia',
  group: {
    name: 'Thalassa Hotels Tunisia',
    properties: [
      { name: 'Royal Thalassa Monastir', rooms: 260 },
      { name: 'Thalassa Sousse', rooms: 483 },
      { name: 'Thalassa Mahdia', rooms: 257 },
    ],
  },
};
