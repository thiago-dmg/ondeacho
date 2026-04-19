/** Onde o profissional sugerido costuma atender (só aplicável a targetType = profissional). */
export enum ProfessionalSuggestionAttendance {
  /** Atende em clínica/centro de terceiros — endereço próprio do profissional não é pedido. */
  AT_CLINIC = "at_clinic",
  /** Consultório próprio — endereço completo opcional no formulário. */
  OWN_OFFICE = "own_office",
  /** Sem vínculo fixo ou outro local — endereço completo opcional. */
  OTHER_LOCATION = "other_location"
}
