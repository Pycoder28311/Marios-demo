import { geoImage } from '../lib/images'

// Image with a numbered, journal-style caption ("Εικ. 3 — …").
export default function Figure({ file, number, caption, className = '', imgClassName = '', style }) {
  return (
    <figure className={`flex flex-col ${className}`} style={style}>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-(--geo-radius-md) bg-(--geo-surface-alt)">
        <img src={geoImage(file)} alt={caption ?? ''} loading="lazy" className={`h-full w-full object-cover ${imgClassName}`} />
      </div>
      {(number || caption) && (
        <figcaption className="mt-2 text-[12px] leading-snug text-(--geo-muted)">
          {number && <span className="mr-1 font-semibold text-(--geo-brass)">Εικ. {number}</span>}
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
