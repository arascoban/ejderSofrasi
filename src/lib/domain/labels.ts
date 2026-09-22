import type { Confidence, EntityType, Period, PeriodUrlToken } from "./types";

/**
 * The source database keeps its reviewed legacy period keys. These labels are
 * the only visitor-facing names, so existing imports and revisions stay valid.
 */
export const PERIOD_OPTIONS: readonly { value: Period; urlToken: PeriodUrlToken; label: string }[] = [
  { value: "1600 civarı", urlToken: "present", label: "Günümüz" },
  { value: "1300 civarı", urlToken: "silver-god-1673", label: "Gümüş Tanrısının 1673 yılı" },
];

const PERIOD_LABELS: Record<Period, string> = Object.fromEntries(
  PERIOD_OPTIONS.map((option) => [option.value, option.label]),
) as Record<Period, string>;

export function periodLabel(period: Period | null | undefined): string {
  return period ? PERIOD_LABELS[period] : "Dönemi belirtilmemiş";
}

export function periodLabels(periods: readonly Period[]): string {
  return periods.length ? periods.map((period) => periodLabel(period)).join(" · ") : "Dönemi belirtilmemiş";
}

/** Accept old shared URLs while writing only the new public tokens. */
export function periodFromUrl(value: string | null | undefined): Period | null {
  if (value === "present" || value === "1600" || value === "1600 civarı") return "1600 civarı";
  if (value === "silver-god-1673" || value === "1300" || value === "1300 civarı") return "1300 civarı";
  return null;
}

export function periodUrlToken(period: Period): PeriodUrlToken {
  return PERIOD_OPTIONS.find((option) => option.value === period)?.urlToken ?? "present";
}

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  PERSON: "Kişi",
  FAMILY: "Aile",
  DYNASTY: "Hanedan",
  FACTION: "Fraksiyon",
  ORGANIZATION: "Kuruluş",
  MILITARY_UNIT: "Askerî birlik",
  CONTINENT: "Kıta",
  KINGDOM: "Krallık",
  STATE: "Devlet",
  REGION: "Bölge",
  DISTRICT: "Semt / bölge",
  CITY: "Şehir",
  TOWN: "Kasaba",
  VILLAGE: "Köy",
  ISLAND: "Ada",
  PORT: "Liman",
  BUILDING: "Yapı",
  TAVERN: "Han / meyhane",
  TEMPLE: "Tapınak",
  NATURAL_FEATURE: "Doğal oluşum",
  SHIP: "Gemi",
  CREATURE: "Yaratık",
  DEITY: "Tanrı / tanrıça",
  DRAGON: "Ejderha",
  PLANT: "Bitki",
  ITEM: "Eşya",
  HISTORICAL_EVENT: "Tarihsel olay",
  HISTORICAL_ERA: "Tarihsel dönem",
  OTHER: "Diğer",
};

const RELATION_LABELS: Record<string, string> = {
  AFFILIATED_WITH: "Bağlı olduğu",
  ALLIED_WITH: "Müttefiki",
  ASSOCIATED_WITH: "İlişkili olduğu",
  BETWEEN: "Arasında bulunduğu",
  BORDERS: "Sınır komşusu",
  BORN_IN: "Doğum yeri",
  CAPITAL_OF: "Başkenti olduğu",
  CAPTAIN_OF: "Kaptanı olduğu",
  CHILD_OF: "Çocuğu olduğu",
  COMMANDS: "Komuta ettiği",
  CONNECTED_BY_RIVER: "Nehirle bağlı olduğu",
  CONNECTED_BY_ROAD: "Yolla bağlı olduğu",
  CONNECTED_TO: "Bağlantılı olduğu",
  DESTROYED_IN: "Yok edildiği olay",
  DIED_IN: "Öldüğü yer",
  EAST_OF: "Doğusunda olduğu",
  ENEMY_OF: "Düşmanı",
  FOUGHT_IN: "Savaştığı olay",
  FROM: "Geldiği yer",
  FUGITIVE_FROM: "Kaçtığı yer veya topluluk",
  HISTORICALLY_ASSOCIATED_WITH: "Tarihsel olarak ilişkili olduğu",
  INSIDE: "İçinde bulunduğu",
  LEADS: "Liderlik ettiği",
  LIVES_IN: "Yaşadığı yer",
  LOCATED_IN: "Bulunduğu yer",
  MARRIED_TO: "Eşi",
  MEMBER_OF: "Üyesi olduğu",
  MENTIONED_WITH: "Birlikte anıldığı",
  NEAR: "Yakınındaki",
  NORTHEAST_OF: "Kuzeydoğusunda olduğu",
  NORTHWEST_OF: "Kuzeybatısında olduğu",
  NORTH_OF: "Kuzeyinde olduğu",
  ON_COAST_OF: "Kıyısında olduğu",
  ON_RIVER: "Üzerinde bulunduğu nehir",
  OPERATES: "İşlettiği",
  OTHER: "Diğer ilişki",
  OWNS: "Sahibi olduğu",
  PARENT_OF: "Ebeveyni olduğu",
  PART_OF: "Parçası olduğu",
  POSSESSES: "Elinde bulundurduğu",
  PRESENT_IN: "Bulunduğu kaydedilen yer",
  RELATED_TO: "Akrabası / ilişkili olduğu",
  RENTS: "Kiraladığı",
  RULES: "Yönettiği",
  SERVES: "Hizmet ettiği",
  SIBLING_OF: "Kardeşi",
  SOUTHEAST_OF: "Güneydoğusunda olduğu",
  SOUTHWEST_OF: "Güneybatısında olduğu",
  SOUTH_OF: "Güneyinde olduğu",
  TEMPLE_OF: "Adandığı varlık",
  USES: "Kullandığı",
  VISITED: "Ziyaret ettiği",
  WANTED_BY: "Arandığı topluluk",
  WEST_OF: "Batısında olduğu",
  WORKS_IN: "Çalıştığı yer",
  WORSHIPS: "İbadet ettiği",
};

const INCOMING_RELATION_LABELS: Record<string, string> = {
  AFFILIATED_WITH: "Bağlantılı kayıt",
  ALLIED_WITH: "Müttefiki",
  ASSOCIATED_WITH: "İlişkili kayıt",
  BETWEEN: "Arasında yer alan",
  BORDERS: "Sınır komşusu",
  BORN_IN: "Burada doğan",
  CAPITAL_OF: "Başkenti",
  CAPTAIN_OF: "Kaptanı",
  CHILD_OF: "Çocuğu",
  COMMANDS: "Komutanı",
  CONNECTED_BY_RIVER: "Nehirle bağlı yer",
  CONNECTED_BY_ROAD: "Yolla bağlı yer",
  CONNECTED_TO: "Bağlantılı yer",
  DESTROYED_IN: "Bu olayda yok edilen",
  DIED_IN: "Burada ölen",
  EAST_OF: "Doğusundaki yer",
  ENEMY_OF: "Düşmanı",
  FOUGHT_IN: "Bu olayda savaşan",
  FROM: "Buradan gelen",
  FUGITIVE_FROM: "Kaçağı",
  HISTORICALLY_ASSOCIATED_WITH: "Tarihsel olarak ilişkili kayıt",
  INSIDE: "İçinde bulunan",
  LEADS: "Lideri",
  LIVES_IN: "Burada yaşayan",
  LOCATED_IN: "İçinde bulunan",
  MARRIED_TO: "Eşi",
  MEMBER_OF: "Üyesi",
  MENTIONED_WITH: "Birlikte anılan",
  NEAR: "Yakınındaki",
  NORTHEAST_OF: "Kuzeydoğusundaki yer",
  NORTHWEST_OF: "Kuzeybatısındaki yer",
  NORTH_OF: "Kuzeyindeki yer",
  ON_COAST_OF: "Kıyısında bulunan",
  ON_RIVER: "Üzerinde bulunan",
  OPERATES: "İşleteni",
  OWNS: "Sahibi",
  PARENT_OF: "Ebeveyni",
  PART_OF: "Parçası",
  POSSESSES: "Elinde bulunduran",
  PRESENT_IN: "Burada bulunduğu kaydedilen",
  RELATED_TO: "Akrabası / ilişkili kayıt",
  RENTS: "Kiracısı",
  RULES: "Yöneticisi",
  SERVES: "Hizmet eden",
  SIBLING_OF: "Kardeşi",
  SOUTHEAST_OF: "Güneydoğusundaki yer",
  SOUTHWEST_OF: "Güneybatısındaki yer",
  SOUTH_OF: "Güneyindeki yer",
  TEMPLE_OF: "Tapınağı",
  USES: "Kullanan",
  VISITED: "Ziyaret eden",
  WANTED_BY: "Aradığı kişi",
  WEST_OF: "Batısındaki yer",
  WORKS_IN: "Burada çalışan",
  WORSHIPS: "İbadet eden",
};

export function entityTypeLabel(type: EntityType): string {
  return ENTITY_TYPE_LABELS[type];
}

export function relationLabel(relation: string): string {
  return RELATION_LABELS[relation] ?? relation.toLocaleLowerCase("tr-TR").replaceAll("_", " ");
}

export function incomingRelationLabel(relation: string): string {
  return INCOMING_RELATION_LABELS[relation] ?? "İlişkinin kaynağı";
}

export function confidenceLabel(confidence: Confidence): string {
  if (confidence === "canon_name_only") return "Yalnızca kanonik ad doğrulandı";
  if (confidence === "disputed") return "Tartışmalı";
  return "Kaynak destekli";
}

const TEMPORAL_BASIS_LABELS: Record<string, string> = {
  episode_scene: "Bölüm sahnesi",
  explicit_statement: "Açık kaynak ifadesi",
  not_established: "Zamanı belirlenmemiş",
  owner_confirmation: "Evren sahibi doğrulaması",
  reviewed_narrative_scene: "İncelenmiş anlatı sahnesi",
  reviewed_source_context: "İncelenmiş kaynak bağlamı",
};

export function temporalBasisLabel(value: string): string {
  return TEMPORAL_BASIS_LABELS[value] ?? "Zamansal dayanak belirtilmemiş";
}
