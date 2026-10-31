/* The film's timeline as staging hands it to the page, its edition and the choice of each edition's words. */

export const film = window.FILM;
export const en = film.edition === "en";
export const L = (zh, english) => (en ? english : zh);
