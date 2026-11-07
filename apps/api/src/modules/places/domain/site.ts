export interface SiteProps {
  /** Mot court, lisible dans l'adresse : `diamniadio`. */
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Un site d'épreuve des JOJ, point de départ du visiteur. Les sites viennent de la liste
 * préparée par l'équipe : ils sont seulement relus, jamais créés par l'application.
 */
export class Site {
  private constructor(private readonly props: SiteProps) {}

  static restore(props: SiteProps): Site {
    return new Site({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get latitude(): number {
    return this.props.latitude;
  }

  get longitude(): number {
    return this.props.longitude;
  }
}
