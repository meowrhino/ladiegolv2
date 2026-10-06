/* La home: un grid con un proyecto por casilla. */

import { href, still as stillSrc } from "./config.js";
import { el, link } from "./dom.js";
import { meta, visibles } from "./data.js";
import { makeLoop, wireLoops } from "./loops.js";

export function home() {
  const grid = el("div", "grid");
  let bigs = 0;

  visibles().forEach((p) => {
    const tile = link("tile", href(p.slug));
    tile.setAttribute("aria-label", `${p.cliente} — ${p.titulo}`);

    if (p.destacado) {
      tile.classList.add("tile--big");
      // alternamos el lado de la casilla grande, como en el diseño
      if (bigs % 2 === 1) tile.classList.add("tile--right");
      bigs++;
    }

    // el rótulo va encima de la imagen, no sobre ella
    const meta = el("div", "tile__meta");
    meta.append(el("span", null, p.cliente));
    // si el título repite el nombre del cliente (coches.net) no lo ponemos dos veces
    if (p.titulo.toLowerCase() !== p.cliente.toLowerCase()) {
      meta.append(el("span", null, p.titulo));
    }

    const media = el("div", "tile__media");
    const still = el("img", "tile__still");
    still.onload = () => still.classList.add("is-loaded"); // entra con fundido
    still.src = stillSrc(p.slug, p.portada || 1);
    still.alt = `${p.cliente} — ${p.titulo}`;
    still.loading = "lazy";
    still.decoding = "async";
    media.append(still);
    if (p.loop !== false) media.append(makeLoop(p.slug));

    tile.append(meta, media);

    grid.append(tile);
  });

  // la frase de presentación (meta.frase) y el enlace al about, justo antes
  // del grid y scrolleando con él
  const wrap = el("div", "home");
  const intro = el("div", "home__intro");
  if (meta().frase) intro.append(el("p", "home__frase", meta().frase));
  intro.append(link("home__about", href("about"), "→ see about"));
  wrap.append(intro, grid);

  return { node: wrap, mounted: () => wireLoops(grid) };
}
