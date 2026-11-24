"use client";
import PixelBlast from "./PixelBlast";
import Link from "next/link";
import { Brand } from "./site-ui";
import "./site-footer.css";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-pixels" aria-hidden="true">
        <PixelBlast
          color="#888888"
          accentColor="#888888"
          pixelSize={3}
          patternDensity={0.9}
          speed={0.2}
          drift={0.15}
          glow={0.15}
          twinkle={0.1}
          edgeFade={0.2}
          enableRipples={false}
          hoverEffect="reveal"
          dpr={1}
        />
      </div>
      <div className="site-footer-main">
        <Link href="/" className="site-footer-brand" aria-label="IMMRSV home">
          <Brand />
        </Link>
        <div className="site-footer-info">
          <div className="site-footer-description">
            <p>
              IMMRSV is an independent experiential production partner based in
              Salt Lake City and working around the world.
              <br />
              Let’s bring the right support to your next experience.
            </p>
          </div>
        </div>
      </div>
      <div className="site-footer-bottom mono">
        <span>SALT LAKE CITY, UT &amp; BEYOND</span>
        <nav
          className="site-footer-socials"
          aria-label="Social and email links"
        >
          <a href="mailto:nick@immrsv-exp.com" aria-label="Email Nick">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 5h18v14H3z m0 0 9 8 9-8"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/immrsv_exp"
            target="_blank"
            rel="noreferrer"
            aria-label="IMMRSV on Instagram"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/company/immrsv/"
            target="_blank"
            rel="noreferrer"
            aria-label="IMMRSV on LinkedIn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="5" r="2" />
              <path d="M3.3 9h3.4v12H3.3zM10 9h3.3v1.6c1-1.5 2.3-2 3.8-2 3.2 0 4.2 2 4.2 5V21h-3.5v-6.6c0-1.7-.4-2.8-2-2.8-1.7 0-2.3 1.2-2.3 2.8V21H10z" />
            </svg>
          </a>
        </nav>
        <div className="site-footer-credits">
          <span>© {new Date().getFullYear()} IMMRSV</span>
          <span aria-hidden="true">|</span>
          <a
            className="site-footer-studio"
            href="https://fruitstandstudios.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            BUILT BY FRUITSTAND STUDIOS
            <span className="site-footer-studio-mark" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
