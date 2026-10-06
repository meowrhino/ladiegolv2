/* La página de un proyecto, todo en una pantalla: arriba el visor (el video
   de vimeo o el still elegido), debajo la tira de miniaturas para ir pasando
   y la ficha. Las flechas del teclado también pasan. */

import { href, still } from "./config.js";
import { el, link } from "./dom.js";

export function project(p) {
  const wrap = el("article", "project");
  const visor = el("div", "visor");
  const tira = el("div", "tira");

  // cada miniatura sabe qué pintar en el visor al elegirla.
  // "viva" = sigue en la tira (las de fotos que no existen se quitan solas)
  const pases = [];
  const viva = (x) => x.thumb.parentNode;
  const elegir = (pase) => {
    pases.forEach((x) => x.thumb.classList.toggle("is-on", x === pase));
    visor.replaceChildren(pase.pintar());
  };
  const añadir = (thumb, pintar) => {
    const pase = { thumb, pintar };
    pases.push(pase);
    thumb.addEventListener("click", () => elegir(pase));
    tira.append(thumb);
  };

  // primero los videos, con un ▶ en la miniatura
  (p.vimeo || []).forEach((id, i) => {
    // el primer video lleva la portada; los siguientes, los stills que vienen después
    const n = i === 0 ? p.portada || 1 : Math.min(i + 1, p.stills || 1);
    const t = miniatura(p, n, `video ${i + 1}`);
    t.append(el("span", "tira__play", "▶"));
    añadir(t, () => player(id, p, n));
  });

  // luego los stills
  for (let n = 1; n <= (p.stills || 0); n++) {
    añadir(miniatura(p, n, `still ${n}`), () => {
      const img = el("img", "visor__still");
      img.src = still(p.slug, n);
      img.alt = `${p.titulo} — still ${n}`;
      return img;
    });
  }

  const head = el("div", "project__head");
  head.append(el("h1", "project__title", p.titulo));
  const ficha = [p.cliente, p.tipo].filter(Boolean).join(" · ");
  if (ficha) head.append(el("p", "project__meta", ficha));

  wrap.append(visor, tira, head, link("back", href(), "← back"));
  if (pases.length) elegir(pases[0]);

  // ← → pasan al anterior / siguiente, en bucle
  const teclas = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const vivos = pases.filter(viva);
    if (!vivos.length) return;
    const ahora = vivos.findIndex((x) => x.thumb.classList.contains("is-on"));
    const paso = e.key === "ArrowRight" ? 1 : -1;
    elegir(vivos[(ahora + paso + vivos.length) % vivos.length]);
  };

  return {
    node: wrap,
    mounted: () => {
      addEventListener("keydown", teclas);
      return () => removeEventListener("keydown", teclas);
    },
  };
}

function miniatura(p, n, etiqueta) {
  const b = el("button", "tira__thumb");
  b.type = "button";
  b.setAttribute("aria-label", etiqueta);
  const img = el("img");
  img.src = still(p.slug, n);
  img.alt = "";
  img.loading = "lazy";
  img.decoding = "async";
  // si "stills" dice más fotos de las que hay, las que faltan desaparecen
  img.onerror = () => b.remove();
  b.append(img);
  return b;
}

/* Portada + play: el iframe de vimeo solo se crea al clicar, así la página
   no carga el reproductor (ni sus cookies) sin que nadie lo pida. */
function player(id, p, n) {
  const box = el("div", "player");
  box.setAttribute("role", "button");
  box.tabIndex = 0;
  box.setAttribute("aria-label", `play ${p.titulo}`);

  const poster = el("img");
  poster.src = still(p.slug, n);
  poster.alt = "";
  box.append(poster, el("div", "player__play", "▶"));

  const open = () => {
    const iframe = el("iframe");
    iframe.src = `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.title = p.titulo;
    box.replaceChildren(iframe);
  };

  box.addEventListener("click", open);
  box.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });
  return box;
}
