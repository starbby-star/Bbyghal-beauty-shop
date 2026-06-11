export interface DeliveryEstimate {
  /** Mid-point estimate added to order total */
  amount: number;
  min: number;
  max: number;
  zone: 'nairobi' | 'regional' | 'distance';
  rangeLabel: string;
  note: string;
}

/** Greater Nairobi — delivery typically KSh 150–200 */
const NAIROBI_AREA = new Set(['Nairobi', 'Kiambu', 'Kajiado', 'Machakos']);

/** Closer counties — KSh 200–350 */
const REGIONAL_NEAR = new Set([
  'Nakuru', 'Nyeri', "Murang'a", 'Kirinyaga', 'Embu', 'Mururui', 'Nyandarua',
  'Laikipia', 'Narok', 'Kitui', 'Makueni', 'Kajiado',
]);

/** Major towns — KSh 250–400 */
const REGIONAL_MID = new Set([
  'Kisumu', 'Uasin Gishu', 'Meru', 'Kakamega', 'Nandi', 'Bungoma', 'Busia',
  'Kisii', 'Kericho', 'Bomet', 'Trans Nzoia', 'Elgeyo-Marakwet',
]);

export function getDeliveryEstimate(county: string): DeliveryEstimate | null {
  if (!county.trim()) return null;

  if (NAIROBI_AREA.has(county)) {
    return {
      amount: 175,
      min: 150,
      max: 200,
      zone: 'nairobi',
      rangeLabel: 'KSh 150–200',
      note: 'Around Nairobi: KSh 150–200 depending on your exact area. Delivery fee can be negotiated on Connect.',
    };
  }

  if (REGIONAL_NEAR.has(county)) {
    return {
      amount: 275,
      min: 200,
      max: 350,
      zone: 'regional',
      rangeLabel: 'KSh 200–350',
      note: 'Near Nairobi region: KSh 200–350 based on distance. Final amount can be negotiated with our team.',
    };
  }

  if (REGIONAL_MID.has(county)) {
    return {
      amount: 325,
      min: 250,
      max: 400,
      zone: 'regional',
      rangeLabel: 'KSh 250–400',
      note: 'County delivery: KSh 250–400 depending on distance. We will confirm exact fee — negotiable.',
    };
  }

  return {
    amount: 350,
    min: 200,
    max: 500,
    zone: 'distance',
    rangeLabel: 'KSh 200–500',
    note: 'Outside Nairobi: KSh 200–500 according to county and distance. Exact fee confirmed on Connect — negotiable.',
  };
}

export function formatDeliveryLine(estimate: DeliveryEstimate): string {
  return `Delivery (${estimate.rangeLabel}, est. KSh ${estimate.amount.toLocaleString()}): negotiable`;
}
