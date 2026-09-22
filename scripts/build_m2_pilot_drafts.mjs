import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const evidenceDir = join(root, 'editorial_work', 'evidence');
const draftsDir = join(root, 'editorial_work', 'drafts');
const outputDir = join(root, 'editorial_work');

const stableStringify = (value) => JSON.stringify(value, null, 2) + '\n';
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function textPart(text, entityId) {
  const node = { type: 'text', text };
  if (entityId) node.marks = [{ type: 'link', attrs: { entityId, href: `/entity/${entityId}` } }];
  return node;
}

function paragraph(...parts) {
  return {
    type: 'paragraph',
    content: parts.flatMap((part) => {
      if (typeof part === 'string') return [textPart(part)];
      if (part && typeof part.text === 'string') return [textPart(part.text, part.entityId)];
      return [];
    }),
  };
}

function heading(level, text) {
  return { type: 'heading', attrs: { level }, content: [textPart(text)] };
}

const link = (text, entityId) => ({ text, entityId });

const pilots = [
  {
    entityId: 'NPC-0006',
    period: null,
    blocks: [
      {
        node: paragraph(
          'Akmer Sütçüoğlu, ', link("Sütçüoğlu Ailesi'nin prensesi ve varisi", 'FAM-0004'),
          ' olarak kaydedilen ve Ancestral Guardian sınıfında barbar bir savaşçı olarak tanımlanan bir kişidir.',
        ),
        claim: 'Akmer’in kimliği, aile konumu ve sınıfı.',
        evidence: [{ kind: 'fact', id: 'FCT-b45182c07aaaeacc' }, { kind: 'fact', id: 'FCT-af2bb16c32a8c9c3' }],
      },
      {
        node: heading(2, 'Geçmişi ve kaçışı'),
      },
      {
        node: paragraph(
          'Kaynaklara göre ailesinden, ailenin ineklerini ve süt kompleksini özgürleştirmek amacıyla kaçtı. Bu kaçışın ardından kendisinin canlı getirilmesi şartıyla bir ödül kondu.',
        ),
        claim: 'Akmer’in aileden kaçışının amacı ve arama durumu.',
        evidence: [{ kind: 'fact', id: 'FCT-1efd5129ffe4eb4c' }, { kind: 'fact', id: 'FCT-851279b81724ea28' }, { kind: 'event', id: 'EVT-0002' }],
      },
      {
        node: heading(2, 'Karapancar yolculuğu'),
      },
      {
        node: paragraph(
          'Revanya’dan ayrılırken ', link('Karapancar', 'SHP-0001'), ' gemisine 27,5 altın karşılığında bindi. Gemide ', link('Adnan Körkapak', 'NPC-0046'), ' ile yaşanan çatışmanın ardından idareyi ele geçirip kendisini yeni kaptan ilan etti.',
        ),
        claim: 'Akmer’in Karapancar’a katılması ve gemi idaresini ele geçirmesi.',
        evidence: [{ kind: 'fact', id: 'FCT-8327c28fc816f220' }, { kind: 'fact', id: 'FCT-cc19efe4c86f193d' }, { kind: 'event', id: 'EVT-0005' }, { kind: 'relationship', id: 'REL-0392' }],
      },
      {
        node: heading(2, 'Şifa zindanı ve Yaz Helvası'),
      },
      {
        node: paragraph(
          'Şifa zindanı sürecinde Akmer, ', link('Kalender Tütüncüoğlu', 'NPC-0051'), ' ile dostane bir düello yaptı ve zindandaki olayların ardından ekip ile birlikte ', link('Yaz Helvası Şehri', 'CIT-0006'), ' bağlamına çıktı. Bu kayıtlar, karşılaşmaların ve bulunulan yerlerin dönemini her olay için ayrı tutar.',
        ),
        claim: 'Akmer’in Şifa zindanı ve Yaz Helvası bağlamındaki doğrulanmış olay bağlantıları.',
        evidence: [{ kind: 'fact', id: 'FCT-88d3976387985c90' }, { kind: 'event', id: 'EVT-0026' }, { kind: 'event', id: 'EVT-0028' }, { kind: 'relationship', id: 'REL-0114' }],
      },
      {
        node: heading(2, 'Eşyalar ve sonraki olaylar'),
      },
      {
        node: paragraph(
          'Akmer, Şifa zindanındaki üç nesneden ', link('Yeniden Yaşam Yüzüğü', 'ITM-0031'), 'nü seçip taktı. Daha sonra Demirci Rando’dan ', link('Helvacıoğlu Baltası', 'ITM-0012'), 'nı aldı; Durgunluk Buhurdanı’nı ise çölde öfkeyle fırlattığı kaynaklarda yer alır.',
        ),
        claim: 'Akmer’in önemli eşya seçimleri, baltayı edinmesi ve buhurdanın kaybı.',
        evidence: [{ kind: 'fact', id: 'FCT-1deeb407f37a1a61' }, { kind: 'fact', id: 'FCT-3686936dcaae1ebe' }, { kind: 'fact', id: 'FCT-6bf530b2148fc19b' }, { kind: 'event', id: 'EVT-0084' }, { kind: 'event', id: 'EVT-0046' }],
      },
      {
        node: heading(2, 'Kaynak sınırları'),
      },
      {
        node: paragraph(
          'Akmer’in bazı seyahat kayıtlarında başlangıç, varış veya yol arkadaşlarının kimliği kesinleştirilemez. Bu belirsizlikler burada kapatılmamış, ilgili kaynak çatışmalarıyla birlikte korunmuştur.',
        ),
        claim: 'Akmer’e bağlı bazı seyahat uçlarının çözülememiş olması.',
        evidence: [{ kind: 'conflict', id: 'CNF-0150' }, { kind: 'conflict', id: 'CNF-0175' }, { kind: 'conflict', id: 'CNF-0182' }, { kind: 'conflict', id: 'CNF-0183' }, { kind: 'conflict', id: 'CNF-0184' }],
        confidence: 'qualified',
        conflictIds: ['CNF-0150', 'CNF-0175', 'CNF-0182', 'CNF-0183', 'CNF-0184'],
      },
    ],
  },
  {
    entityId: 'NPC-0051',
    period: null,
    blocks: [
      {
        node: paragraph(
          'Kalender Tütüncüoğlu, Pastırman inancına bağlı bir Paladin savaşçısı olarak tanıtılır. Bebekken katledilen bir tütüncü ailenin sepetinde bulunmuş ve yetimhanede büyümüştür; ', link('İto İtoğlu', 'NPC-0046'), 'nu da yetimhaneden beri koruyup kolladığı aktarılır.',
        ),
        claim: 'Kalender’in başlangıç öyküsü, sınıfı, inancı ve İto ile ilişkisi.',
        evidence: [{ kind: 'fact', id: 'FCT-72f0bae9af59e0a4' }, { kind: 'fact', id: 'FCT-ff3a8f3cccf878eb' }, { kind: 'fact', id: 'FCT-49db3cc8957c9ef4' }],
      },
      {
        node: heading(2, 'Mehdi unvanı ve gerçeklik sınırı'),
      },
      {
        node: paragraph(
          'Çöl Şehri’nde yaptığı şifa ve mucize gösterileri sonrasında halk tarafından “Mehdi” ilan edildi. Proje sahibinin doğruladığı kanonik açıklama, Kalender’in gerçek Mehdi olmadığını; bu unvanın halkın ona taktığı bir ad olduğunu belirtir.',
        ),
        claim: 'Kalender’in halk tarafından Mehdi ilan edilmesi ile gerçek kimliği arasındaki ayrım.',
        evidence: [{ kind: 'fact', id: 'FCT-0ad499b80749bf93' }, { kind: 'fact', id: 'FCT-4df6be6f6880b9c5' }, { kind: 'normalization_decision', index: 4 }],
        confidence: 'owner_confirmation',
      },
      {
        node: heading(2, 'Çemenin Kılıcı ve güç kaybı'),
      },
      {
        node: paragraph(
          'Kalender, ', link('Çemenin Kılıcı', 'ITM-0036'), 'nı savaş yemini ettikten sonra Kavurhan’dan aldı. Kılıç geçici olarak +2 Strength ve Rage özelliği sağladı; Kalender savaştan vazgeçip kılıçtan kurtulduktan sonra bu güçlerin ve Paladin yeteneklerinin kaybı anlatıldı. EP21’den itibaren macerasına Fighter, yani “Düz Adam”, olarak devam ettiği kaydedilir.',
        ),
        claim: 'Çemenin Kılıcı’nın geçici etkileri, yemin krizi ve Kalender’in sonraki sınıfı.',
        evidence: [{ kind: 'fact', id: 'FCT-b93e74c00d3f0eee' }, { kind: 'fact', id: 'FCT-ae7f1eb4f80229eb' }, { kind: 'fact', id: 'FCT-eeb543cc84f9add3' }, { kind: 'fact', id: 'FCT-fbd41e0726a4a886' }, { kind: 'fact', id: 'FCT-1d9d9dcff172a76f' }, { kind: 'fact', id: 'FCT-777c45ee863ebc47' }, { kind: 'event', id: 'EVT-0043' }, { kind: 'event', id: 'EVT-0048' }],
        confidence: 'owner_confirmation',
      },
      {
        node: heading(2, 'Eşyalar ve bağlantılar'),
      },
      {
        node: paragraph(
          'Yeniden Yaşam Yüzüğü’nün Kalender’in elinden hiç çıkmadığı doğrulanmıştır. Helvacıoğlu Baltası kaydında ise Kalender’in eşyanın önceki sahibi olduğu ve daha sonra Akmer’e geçtiği yönlü ilişki bulunur.',
        ),
        claim: 'Kalender’in yüzük üzerindeki sürekli sahipliği ve Helvacıoğlu Baltası ile önceki sahiplik ilişkisi.',
        evidence: [{ kind: 'fact', id: 'FCT-99fa1d2b453be4fa' }, { kind: 'relationship', id: 'REL-0527' }, { kind: 'normalization_decision', index: 2 }],
        confidence: 'owner_confirmation',
      },
      {
        node: heading(2, 'Belirsizlikler'),
      },
      {
        node: paragraph(
          'Kalender’in bazı seyahat uçları ve dönem bağlamları kaynaklarda kesin değildir. Bu taslak, açık çatışmaları çözülmüş gerçekler gibi sunmak yerine ilgili kayıtları incelemeye bırakır.',
        ),
        claim: 'Kalender’e bağlı seyahat ve dönem belirsizlikleri.',
        evidence: [{ kind: 'conflict', id: 'CNF-0145' }, { kind: 'conflict', id: 'CNF-0171' }, { kind: 'conflict', id: 'CNF-0172' }, { kind: 'conflict', id: 'CNF-0174' }, { kind: 'conflict', id: 'CNF-0175' }],
        confidence: 'qualified',
        conflictIds: ['CNF-0145', 'CNF-0171', 'CNF-0172', 'CNF-0174', 'CNF-0175'],
      },
    ],
  },
  {
    entityId: 'KNG-0008',
    period: '1300 civarı',
    blocks: [
      {
        node: paragraph(
          'Yaz Helvası Krallığı, kaynaklarda Helvanar Kıtası / Helva Adası bağlamında, Gümüş Tanrısının 1673 yılına ait geçmiş dünyada bulunan; çöl, kum taşı mimarisi, yaz helvası üretimi ve ticaretiyle tanınan bir krallık olarak anlatılır.',
        ),
        claim: 'Yaz Helvası Krallığı’nın tarihsel bağlamı, coğrafi çerçevesi ve ekonomik niteliği.',
        evidence: [{ kind: 'fact', id: 'FCT-1071aa5c0763c8a7' }, { kind: 'fact', id: 'FCT-ed1301b207446641' }, { kind: 'relationship', id: 'REL-0458' }],
        periods: ['1300 civarı'],
      },
      {
        node: heading(2, 'Yaz Helvası Şehri ve katmanlı yapı'),
      },
      {
        node: paragraph(
          'Kaynaklarda “Çöl Şehri” diye geçen siyasal ve askerî bağlam Yaz Helvası Krallığı’nı ifade eder; Yaz Helvası Şehri ise krallığın üç şehirli kentsel yapısı olarak ayrı tutulur. Bu şehirler ve katlar surlar ile güvenlik kapılarıyla ayrılır. Krallığın üç kademeli yapısında ilk kat alt gelir grupları ve pazar çevresiyle, ikinci kat orta mahallelerle, üçüncü kat ise saray, Gümüş Ejderha Tapınağı ve ', link('Arifler Okulu', 'ORG-0001'), ' ile ilişkilendirilir.',
        ),
        claim: 'Çöl Şehri/Yaz Helvası Krallığı ayrımı ve üç kademeli şehir savunması.',
        evidence: [{ kind: 'fact', id: 'FCT-0e7697ef7558656c' }, { kind: 'fact', id: 'FCT-095de8c840f1eaf5' }, { kind: 'fact', id: 'FCT-3c8462fe519d1206' }, { kind: 'fact', id: 'FCT-f4de705c7d317ea3' }, { kind: 'normalization_decision', index: 0 }],
        confidence: 'owner_confirmation',
        periods: ['1300 civarı'],
      },
      {
        node: heading(2, 'Başkent ve siyasi bağlantılar'),
      },
      {
        node: paragraph(
          'Krallığın başkenti ', link('Yaz Helvası Şehri', 'CIT-0006'), ' olarak gösterilir ve krallık ', link('Helvanar Kıtası', 'CON-0001'), ' içinde konumlandırılır. İlişki kayıtları ayrıca krallığın Un Helvası ve İrmik Helvası krallıklarıyla düşmanlık içinde olduğunu belirtir.',
        ),
        claim: 'Yaz Helvası Krallığı’nın başkent, kıta ve siyasi düşmanlık bağlantıları.',
        evidence: [{ kind: 'relationship', id: 'REL-0457' }, { kind: 'relationship', id: 'REL-0458' }, { kind: 'relationship', id: 'REL-0155' }, { kind: 'relationship', id: 'REL-0156' }],
        periods: ['1300 civarı'],
      },
      {
        node: heading(2, 'Kuşatma ve bilinmeyen sonuç'),
      },
      {
        node: paragraph(
          'Yaz Helvası Krallığı, Kırmızı Ejderha desteğiyle Un Helvası ve İrmik Helvası ittifakının kuşatması altındaydı. Kaynakların son gözleminde birinci şehrin surları düşmüş ve kuşatma ordusu içeri girmiştir; karakterler bölgeden ayrıldığı için kuşatmanın nihai sonucu bilinmemektedir.',
        ),
        claim: 'Kuşatmanın tarafları, son gözlenen durum ve sonuç üzerindeki belirsizlik.',
        evidence: [{ kind: 'fact', id: 'FCT-5c7911a006b5ab0b' }, { kind: 'fact', id: 'FCT-d6cdf1677a10149b' }, { kind: 'event', id: 'EVT-0030' }],
        confidence: 'qualified',
        periods: ['1300 civarı'],
      },
    ],
  },
  {
    entityId: 'ITM-0012',
    period: null,
    blocks: [
      {
        node: paragraph(
          'Helvacıoğlu Baltası, Helvacıoğlu Hanedanı’yla ilişkilendirilen kadim bir savaş eşyasıdır. Bir kaynakta uzun siyah saplı, bakır işlemeli, 2d6 hasarlı ve +1 bonuslu bir balta olarak; Rando’nun Akmer’e hediyesi şeklinde anlatılır.',
        ),
        claim: 'Helvacıoğlu Baltası’nın temel fiziksel ve oyun içi özellikleri ile Akmer’e hediye edilmesi.',
        evidence: [{ kind: 'fact', id: 'FCT-89f5cf415154c094' }, { kind: 'relationship', id: 'REL-0261' }, { kind: 'event', id: 'EVT-0084' }],
      },
      {
        node: heading(2, 'Kristal Kılıç’tan dönüşüm'),
      },
      {
        node: paragraph(
          'Owner doğrulamasıyla korunan sıra şöyledir: Kalender, Kristal Kılıç olarak aldığı eşyayı Akmer’e verdi; ertesi sabah kılıç Helvacıoğlu Baltası’na dönüştü. Dönüşüm, Akmer’in kanı ve öfkesiyle ortaya çıkan, kadim ejderha kemiğinden dövülmüş ve onun canına bağlanan baltayla ilişkilendirilir.',
        ),
        claim: 'Kristal Kılıç’ın Akmer’e geçişi ve ertesi sabah Helvacıoğlu Baltası’na dönüşmesi.',
        evidence: [{ kind: 'fact', id: 'FCT-0b91acc8602a908c' }, { kind: 'normalization_decision', index: 0 }, { kind: 'normalization_decision', index: 3 }],
        confidence: 'owner_confirmation',
      },
      {
        node: heading(2, 'Sahiplik ve kullanımlar'),
      },
      {
        node: paragraph(
          'Sonraki kayıtlar baltayı Akmer’in taşıdığını ve Kalender’in önceki sahibi olduğunu gösterir. Eşya, Ejderhalar Sofrası Harabeleri’nde kan akıtılan ritüel denemesinde kullanıldı; daha sonra Gavurdağı Golemi’ni yararak Ametist Kristali’ni açığa çıkardığı ve Ejder Öldürücü özelliğiyle anıldığı kaydedildi.',
        ),
        claim: 'Baltanın sahiplik geçişi ve sonraki kullanımları.',
        evidence: [{ kind: 'fact', id: 'FCT-794112dadd3a1e7d' }, { kind: 'fact', id: 'FCT-d0027970e463dec5' }, { kind: 'fact', id: 'FCT-9d3cde8b1ab6a6eb' }, { kind: 'relationship', id: 'REL-0527' }, { kind: 'relationship', id: 'REL-0531' }, { kind: 'event', id: 'EVT-0087' }, { kind: 'event', id: 'EVT-0061' }],
      },
      {
        node: heading(2, 'Kaynakların birlikte okunması'),
      },
      {
        node: paragraph(
          'EP15 kayıtlarında Akmer’e verilen bir Helvacıoğlu Baltası ile Kalender’e teslim edilen ejder kemiği kılıcı ayrı betimlenir. Bu taslak, bu betimleri silmeden owner tarafından doğrulanan Kristal Kılıç → Helvacıoğlu Baltası dönüşüm sırasını ayrıca belirtir; kaynak anlatımlarının ayrıntıları tek bir cümlede zorla birleştirilmez.',
        ),
        claim: 'Ayrı kaynak betimlerinin korunması ve dönüşüm kararının açıkça nitelenmesi.',
        evidence: [{ kind: 'fact', id: 'FCT-89f5cf415154c094' }, { kind: 'fact', id: 'FCT-c191db9edb759aa1' }, { kind: 'normalization_decision', index: 3 }],
        confidence: 'qualified',
      },
    ],
  },
  {
    entityId: 'ORG-0001',
    period: null,
    blocks: [
      {
        node: paragraph(
          'Arifler Okulu, uzgörü (divination) ve kader araştırmaları yapan bir büyü okulu/locasıdır. Kaynaklarda ', link('Yaz Helvası Şehri', 'CIT-0006'), 'nin üçüncü katı veya üçüncü bölgesiyle ilişkilendirilir.',
        ),
        claim: 'Arifler Okulu’nun kurumsal türü, uzmanlık alanı ve şehir içindeki bağlamı.',
        evidence: [{ kind: 'fact', id: 'FCT-797cf8ccf97c9d39' }, { kind: 'fact', id: 'FCT-9e2b4abcce046651' }, { kind: 'relationship', id: 'REL-0422' }],
      },
      {
        node: heading(2, 'Yerleşke ve mekânlar'),
      },
      {
        node: paragraph(
          'Okulun serinletilen bir bahçesi, havuzu, gül bahçesi, kütüphanesi, öğrenci misafirhanesi ve hamamı bulunur. Subira’nın büyülü demirhanesi/atölyesi de okulun fiziksel mekânları arasında anılır. ', link('Arifler Okulu Yerleşkesi', 'BLD-0023'), ' kurumdan ayrı fiziksel bina kimliği olarak tutulur.',
        ),
        claim: 'Arifler Okulu’nun doğrulanmış mekânları ve kurum-yerleşke ayrımı.',
        evidence: [{ kind: 'fact', id: 'FCT-4eb1a8707fa727e6' }, { kind: 'fact', id: 'FCT-9e2b4abcce046651' }, { kind: 'fact', id: 'FCT-11ef80668ee90ce1' }, { kind: 'fact', id: 'FCT-97cee8ed1ec0706e' }, { kind: 'normalization_decision', index: 1 }],
        confidence: 'owner_confirmation',
      },
      {
        node: heading(2, 'Üyeler ve olaylar'),
      },
      {
        node: paragraph(
          'İlişki kayıtları Arif Bey’in okulu yönettiğini, Subira’nın okulun büyülü eşya/rün uzmanlarından biri olduğunu ve çeşitli öğrenciler ile görevlilerin kuruma bağlı bulunduğunu gösterir. Ammon Hoca’nın kütüphanede ders verdiği; okul bahçesinde ise Siyah Ejderha canlı bomba saldırısının yaşandığı kaydedilmiştir.',
        ),
        claim: 'Arifler Okulu’nun yöneticileri, üyeleri, eğitim faaliyeti ve bahçedeki saldırı olayı.',
        evidence: [{ kind: 'relationship', id: 'REL-0148' }, { kind: 'relationship', id: 'REL-0203' }, { kind: 'fact', id: 'FCT-2f61f0c7a5783052' }, { kind: 'fact', id: 'FCT-578fc192ed265758' }],
      },
      {
        node: heading(2, 'Dönem sınırı'),
      },
      {
        node: paragraph(
          'Okulun kimlik kaydında tek bir tarihsel dönem atanmış değildir. Bu nedenle bu pilot, okulu iki döneme otomatik olarak yaymaz; bölümlerdeki tekil olayların dönem bilgisi kendi kanıtıyla birlikte okunmalıdır.',
        ),
        claim: 'Arifler Okulu’nun genel kimliğinde dönem atamasının belirlenmemiş olması.',
        evidence: [{ kind: 'normalization_decision', index: 1 }, { kind: 'event', id: 'EVT-0028' }, { kind: 'event', id: 'EVT-0031' }],
        confidence: 'qualified',
      },
    ],
  },
  {
    entityId: 'DEI-0001',
    period: null,
    blocks: [
      {
        node: paragraph(
          'Alafğöğüs (Alaf Göğüs), şehirlerde popüler olduğu söylenen şehvet, intikam ve hilekârlık tanrısıdır.',
        ),
        claim: 'Alafğöğüs’ün kaynakta verilen tanımı.',
        evidence: [{ kind: 'fact', id: 'FCT-a2115685f85d197a' }],
      },
      {
        node: paragraph(
          'Mevcut kayıtlarda bu tanrının tarihi, takipçileri, ibadet yerleri veya başka olaylardaki rolü hakkında doğrulanmış ek bilgi bulunmaz. Bu nedenle madde kısa tutulmuştur.',
        ),
        claim: 'Alafğöğüs hakkında mevcut kanıtın sınırlı olması.',
        evidence: [{ kind: 'fact', id: 'FCT-a2115685f85d197a' }],
        confidence: 'qualified',
      },
    ],
  },
];

function collectSourceRefs(values) {
  const refs = [];
  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    if (typeof value.source_id === 'string') {
      const ref = { source_id: value.source_id };
      if (value.pointer !== undefined && value.pointer !== '') ref.pointer = value.pointer;
      if (value.line !== undefined) ref.line = value.line;
      refs.push(ref);
    }
    Object.values(value).forEach(visit);
  };
  values.forEach(visit);
  const seen = new Set();
  return refs.filter((ref) => {
    const key = JSON.stringify(ref);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function recordFor(packageData, descriptor) {
  if (descriptor.kind === 'fact') return packageData.facts.find((record) => record.id === descriptor.id);
  if (descriptor.kind === 'relationship') {
    return [...packageData.relationships.outgoing, ...packageData.relationships.incoming]
      .find((record) => record.id === descriptor.id);
  }
  if (descriptor.kind === 'event') return packageData.timeline.events.find((record) => record.event_id === descriptor.id);
  if (descriptor.kind === 'travel') return packageData.travel.find((record) => record.id === descriptor.id);
  if (descriptor.kind === 'conflict') return packageData.conflicts.find((record) => record.id === descriptor.id);
  if (descriptor.kind === 'normalization_decision') return packageData.normalization_decisions[descriptor.index];
  throw new Error(`Bilinmeyen kanıt türü: ${descriptor.kind}`);
}

function assertionRefs(descriptor, record) {
  if (descriptor.kind === 'fact') {
    return (record.assertions ?? []).map((assertion, assertionIndex) => ({
      assertion_index: assertionIndex,
      period: assertion.period ?? null,
      temporal_basis: assertion.temporal_basis ?? null,
      confidence: assertion.confidence ?? null,
      source_refs: assertion.source_refs ?? [],
    }));
  }
  if (descriptor.kind === 'relationship') {
    return (record.assertions ?? []).map((assertion, assertionIndex) => ({
      assertion_index: assertionIndex,
      period: record.period ?? null,
      temporal_basis: assertion.temporal_basis ?? null,
      confidence: assertion.confidence ?? record.confidence ?? null,
      source_refs: assertion.source_refs ?? [],
    }));
  }
  if (descriptor.kind === 'normalization_decision') {
    return [{
      decision_index: descriptor.index,
      decision_kind: record.kind,
      temporal_basis: record.kind?.startsWith('owner_') ? 'owner_confirmation' : 'reviewed_normalization',
      confidence: 'reviewed',
      source_refs: record.source_refs ?? [],
    }];
  }
  if (descriptor.kind === 'conflict') {
    return [{
      status: record.status,
      temporal_basis: 'unresolved_conflict',
      confidence: 'open',
      source_refs: record.source_refs ?? [],
    }];
  }
  return [{
    period: record.period ?? null,
    temporal_basis: record.event_status ?? record.temporal_basis ?? null,
    confidence: record.confidence ?? null,
    source_refs: record.source_refs ?? [],
  }];
}

function resolveEvidence(packageData, descriptor) {
  const record = recordFor(packageData, descriptor);
  if (!record) {
    throw new Error(`${packageData.entity.id} için kanıt bulunamadı: ${JSON.stringify(descriptor)}`);
  }
  const evidenceId = descriptor.kind === 'normalization_decision'
    ? `normalization_decision:${descriptor.index}`
    : descriptor.id;
  return {
    kind: descriptor.kind,
    id: evidenceId,
    source_refs: collectSourceRefs([record]),
    assertion_refs: assertionRefs(descriptor, record),
  };
}

function buildDraft(definition, packageData, sourceHash, coreReleaseId) {
  const content = [];
  const claims = [];
  for (const block of definition.blocks) {
    const blockIndex = content.length;
    content.push(block.node);
    if (block.claim) {
      claims.push({
        claim_id: `CLM-${definition.entityId}-${String(claims.length + 1).padStart(2, '0')}`,
        block_path: `/content/${blockIndex}`,
        claim: block.claim,
        evidence: block.evidence.map((descriptor) => resolveEvidence(packageData, descriptor)),
        periods: block.periods ?? [],
        confidence: block.confidence ?? 'source_supported',
        conflict_ids: block.conflictIds ?? [],
      });
    }
  }
  const document = { type: 'doc', content };
  const documentHash = sha256(stableStringify(document));
  return {
    schema_version: 'editorial-draft-v1',
    entity_id: definition.entityId,
    language: 'tr',
    base_core_release_id: coreReleaseId,
    source_hash: sourceHash,
    document_hash: documentHash,
    document,
    period: definition.period,
    claims,
    review_status: 'pilot_review',
    publication_status: 'not_published',
    existing_editorial_state: 'not_checked',
    editorial_import: 'dry_run_only',
    pilot: true,
    notes: [
      'M2 pilot taslağıdır; Supabase editörüne aktarılmamış ve yayımlanmamıştır.',
      'Metin ve kanıt defteri kaynak incelemesinden sonra insan editör tarafından gözden geçirilmelidir.',
    ],
  };
}

async function readEvidence(entityId) {
  return JSON.parse(await readFile(join(evidenceDir, `${entityId}.json`), 'utf8'));
}

async function main() {
  const coverage = JSON.parse(await readFile(join(outputDir, 'coverage.json'), 'utf8'));
  const entitiesRaw = await readFile(join(root, 'data', 'entities.json'), 'utf8');
  const coreReleaseId = `core-${sha256(entitiesRaw).slice(0, 16)}`;
  const packageData = new Map();
  for (const definition of pilots) packageData.set(definition.entityId, await readEvidence(definition.entityId));
  await mkdir(draftsDir, { recursive: true });
  const drafts = pilots.map((definition) => buildDraft(
    definition,
    packageData.get(definition.entityId),
    coverage.source_inventory_sha256,
    coreReleaseId,
  ));
  await Promise.all(drafts.map((draft) => writeFile(join(draftsDir, `${draft.entity_id}.json`), stableStringify(draft), 'utf8')));
  const manifest = {
    schema_version: 'editorial-manifest-v1',
    language: 'tr',
    stage: 'M2',
    base_core_release_id: coreReleaseId,
    source_hash: coverage.source_inventory_sha256,
    draft_count: drafts.length,
    drafts: drafts.map((draft) => ({
      entity_id: draft.entity_id,
      path: `drafts/${draft.entity_id}.json`,
      document_hash: draft.document_hash,
      period: draft.period,
      claim_count: draft.claims.length,
      review_status: draft.review_status,
      publication_status: draft.publication_status,
    })),
    review_status: 'pilot_review',
    publication_status: 'none',
    existing_editorial_state: 'not_checked',
    import_mode: 'dry_run_only',
  };
  await writeFile(join(outputDir, 'manifest.json'), stableStringify(manifest), 'utf8');
  console.log(JSON.stringify({ status: 'ok', stage: 'M2', drafts: drafts.length, manifest: 'editorial_work/manifest.json' }, null, 2));
}

await main();
