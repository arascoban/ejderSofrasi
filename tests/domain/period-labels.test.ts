import { describe, expect, it } from "vitest";

import { periodFromUrl, periodLabel, periodLabels, PERIOD_OPTIONS } from "@/lib/domain/labels";

describe("hikâye dönemlerinin ziyaretçi etiketleri", () => {
  it("kaynak anahtarlarını yeni Türkçe dönem adlarına çevirir", () => {
    expect(periodLabel("1600 civarı")).toBe("Günümüz");
    expect(periodLabel("1300 civarı")).toBe("Gümüş Tanrısının 1673 yılı");
    expect(periodLabels(["1600 civarı", "1300 civarı"])).toBe("Günümüz · Gümüş Tanrısının 1673 yılı");
  });

  it("yeni URL tokenlarını kabul ederken eski bağlantıları da korur", () => {
    expect(periodFromUrl("present")).toBe("1600 civarı");
    expect(periodFromUrl("silver-god-1673")).toBe("1300 civarı");
    expect(periodFromUrl("1600 civarı")).toBe("1600 civarı");
    expect(periodFromUrl("1300 civarı")).toBe("1300 civarı");
    expect(PERIOD_OPTIONS.map((option) => option.label)).toEqual(["Günümüz", "Gümüş Tanrısının 1673 yılı"]);
  });
});
