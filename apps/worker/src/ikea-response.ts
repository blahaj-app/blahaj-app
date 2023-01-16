export interface IkeaResponse {
  availabilities: null;
  data: Availability[];
  timestamp: string;
  traceId: string;
}

interface Availability {
  isInCashAndCarryRange: boolean | null;
  isInHomeDeliveryRange: boolean;
  availableStocks?: AvailableStock[];
  classUnitKey: ClassUnitKey;
  itemKey: ItemKey;
}

interface AvailableStock {
  type: string;
  quantity: number;
  updateDateTime: string;
  probabilities: Probability[];
  restocks?: Restock[];
}

interface Probability {
  type: string;
  updateDateTime: string;
  communication: Communication;
}

interface Communication {
  colour: string;
  messageType: "HIGH_IN_STOCK" | "LOW_IN_STOCK" | "MEDIUM_IN_STOCK" | "OUT_OF_STOCK";
}

interface Restock {
  type: "DELIVERY" | "INTERNAL";
  quantity: number;
  earliestDate: string;
  latestDate: string;
  updateDateTime: string;
  reliability: string;
}

interface ClassUnitKey {
  classUnitCode: string;
  classUnitType: string;
}

interface ItemKey {
  itemNo: string;
  itemType: string;
}
