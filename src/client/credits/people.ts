export interface FeaturedPerson {
  name: string;
  roleKey: string;
  url?: string;
}

// Names and roles must be confirmed by the OpenFront maintainers.
export const featuredPeople: readonly FeaturedPerson[] = [];
