/* eslint-disable @next/next/no-img-element -- Kullanıcı yüklemelerinin hostu Supabase proje ayarından gelir. */
import type { PublishedEditorialContent } from "@/lib/editorial/contracts";
import { renderPublishedArticle } from "@/lib/editorial/render";

export function WikiArticle({ content }: { content: PublishedEditorialContent }) {
  const inlineMedia = content.media.map((media) => ({
    mediaId: media.mediaId,
    publicUrl: media.publicUrl,
    alternativeTextTr: media.alternativeTextTr,
    captionTr: media.captionTr,
  }));
  const html = renderPublishedArticle(content.revision.document, inlineMedia);
  const cover = content.media.find((media) => media.role === "cover" || media.role === "portrait");
  const gallery = content.media.filter((media) => media.role === "gallery");

  return (
    <section className="wiki-article" aria-labelledby="wiki-makalesi-baslik">
      <div className="section-heading">
        <p className="eyebrow">Editoryal wiki</p>
        <h2 id="wiki-makalesi-baslik">Makale</h2>
      </div>

      {cover ? (
        <figure className="wiki-article-cover">
          <img
            src={cover.publicUrl}
            alt={cover.alternativeTextTr}
            width={cover.width ?? undefined}
            height={cover.height ?? undefined}
          />
          <figcaption>
            {cover.captionTr && <span>{cover.captionTr}</span>}
            <small>{cover.creatorCredit} · {cover.sourceLabel}</small>
          </figcaption>
        </figure>
      ) : null}

      <article className="wiki-prose" dangerouslySetInnerHTML={{ __html: html }} />

      {gallery.length > 0 ? (
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
                <small>{media.creatorCredit} · {media.sourceLabel}</small>
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
