import { about } from "../data/content";
import { ProjectMedia } from "./ProjectMedia";

export function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="shell about__grid">
        <div className="about__story reveal">
          <p className="label">About</p>
          <h2 id="about-title">{about.title}</h2>
          {about.paragraphs.map((text) => (
            <p key={text.slice(0, 24)}>{text}</p>
          ))}
        </div>

        <figure className="about__video reveal">
          <ProjectMedia
            media={{
              kind: "video",
              src: about.video.src,
              poster: about.video.poster,
              alt: about.video.alt,
            }}
          />
          <figcaption>{about.video.caption}</figcaption>
        </figure>

        <ol className="principles">
          {about.principles.map((item, index) => (
            <li className="principle reveal" key={item.title}>
              <span className="principle__step" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
