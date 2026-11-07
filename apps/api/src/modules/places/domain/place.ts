export interface PlaceProps {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Temps conseillé sur place, en minutes. */
  visitMinutes: number;
}

/**
 * Un lieu à visiter. Les lieux viennent de la liste préparée par l'équipe : ils sont seulement
 * relus, jamais créés par l'application.
 */
export class Place {
  private constructor(private readonly props: PlaceProps) {}

  static restore(props: PlaceProps): Place {
    return new Place({ ...props });
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

  get visitMinutes(): number {
    return this.props.visitMinutes;
  }
}
