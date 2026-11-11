export interface FeaturedPerson {
  name: string;
  roleKey: string;
  url?: string;
}

// Additional names and roles must be confirmed by the OpenFront maintainers.
export const featuredPeople: readonly FeaturedPerson[] = [
  {
    name: "Evan Pelle",
    roleKey: "credits.roles.maintainer",
    url: "https://github.com/evanpelle",
  },
];
