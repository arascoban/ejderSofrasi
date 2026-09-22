/* eslint-disable @next/next/no-img-element -- Kullanıcı yüklemelerinin hostu Supabase proje ayarından gelir. */
import type { PublishedEditorialContent } from "@/lib/editorial/contracts";
import { renderPublishedArticle } from "@/lib/editorial/render";
import { periodLabel } from "@/lib/domain/labels";
import type { Period } from "@/lib/domain/types";

export function WikiArticle({ content, selectedPeriod = null }: { content: PublishedEditorialContent; selectedPeriod?: Period | null }) {
  const articlePeriodMatches = !selectedPeriod || content.revision.period === null || content.revision.period === selectedPeriod;
  const visibleMedia = content.media.filter((media) => !selectedPeriod || content.revision.period === null || media.period === null || media.period === selectedPeriod);
  const inlineMedia = visibleMedia.map((media) => ({
    mediaId: media.mediaId,
    publicUrl: media.publicUrl,
    alternativeTextTr: media.alternativeTextTr,
    captionTr: media.captionTr,
  }));
  const html = articlePeriodMatches ? renderPublishedArticle(content.revision.document, inlineMedia) : "";
  const cover = visibleMedia.find((media) => media.role === "cover" || media.role === "portrait");
  const gallery = visibleMedia.filter((media) => media.role === "gallery");

  return (
    <section className="wiki-article" aria-labelledby="wiki-makalesi-baslik">
      <div className="section-heading">
        <p className="eyebrow">Editoryal wiki</p>
        <h2 id="wiki-makalesi-baslik">Makale</h2>
      </div>

      {selectedPeriod && content.revision.period === null && (
        <p className="wiki-period-note">Bu makale belirli bir döneme atanmadı; seçili döneme aitmiş gibi yorumlanmamalıdır.</p>
      )}
      {selectedPeriod && !articlePeriodMatches && (
        <p className="wiki-period-note">Bu makale {periodLabel(content.revision.period)} kaydıdır; seçili döneme otomatik olarak aktarılmadı.</p>
      )}

      {cover && articlePeriodMatches ? (
        <figure className="wiki-article-cover">
          <img
            src={cover.publicUrl}
            alt={cover.alternativeTextTr}
            width={cover.width ?? undefined}
            height={cover.height ?? undefined}
          />
          <figcaption>
            {cover.captionTr && <span>{cover.captionTr}</span>}
            <small>{cover.period ? periodLabel(cover.period) : "Dönemi belirtilmemiş"} · {cover.creatorCredit} · {cover.sourceLabel}</small>
          </figcaption>
        </figure>
      ) : null}

      {articlePeriodMatches ? <article className="wiki-prose" dangerouslySetInnerHTML={{ __html: html }} /> : null}

      {articlePeriodMatches && gallery.length > 0 ? (
        <div className="wiki-gallery" aria-label="Görsel galerisi">
          {gallery.map((media) => (
            <figure key={media.mediaId}>
              <img
                src={media.publicUrl}
                alt={media.alternativeTextTr}
                width={media.width ?? undefined}
                height={media.height ?? undefined}
                loading="lazy"
              />
              <figcaption>
                {media.captionTr && <span>{media.captionTr}</span>}
                <small>{media.period ? periodLabel(media.period) : "Dönemi belirtilmemiş"} · {media.creatorCredit} · {media.sourceLabel}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      <p className="wiki-revision-note">
        Makale sürümü {content.revision.revisionNumber.toLocaleString("tr-TR")} · {new Intl.DateTimeFormat("tr-TR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(content.revision.publishedAt))}
      </p>
    </section>
  );
}
