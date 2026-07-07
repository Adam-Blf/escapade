import { describe, expect, it } from "vitest";
import { parseText } from "@/lib/parse";

describe("parseText · budget", () => {
  it("lit un montant suivi de €", () => {
    expect(parseText("envie de mer, 300€").budget).toBe(300);
  });

  it("lit un montant en euros ou en balles", () => {
    expect(parseText("j'ai 450 euros").budget).toBe(450);
    expect(parseText("250 balles max").budget).toBe(250);
  });

  it("lit « budget de N » sans symbole", () => {
    expect(parseText("budget de 500 pour la semaine").budget).toBe(500);
    expect(parseText("budget max 200").budget).toBe(200);
  });

  it("infère 300 pour « pas riche » et assimilés", () => {
    expect(parseText("je suis pas riche mais je veux la mer").budget).toBe(300);
    expect(parseText("complètement fauché ce mois-ci").budget).toBe(300);
  });

  it("null quand aucun budget", () => {
    expect(parseText("une semaine à la montagne").budget).toBeNull();
  });
});

describe("parseText · voyageurs", () => {
  it("solo", () => {
    expect(parseText("citytrip solo en décembre").travelers).toBe(1);
    expect(parseText("je pars toute seule").travelers).toBe(1);
  });

  it("nombre explicite en chiffre ou en lettres", () => {
    expect(parseText("on est 4 potes").travelers).toBe(4);
    expect(parseText("nous sommes trois").travelers).toBe(3);
  });

  it("en couple → 2", () => {
    expect(parseText("week-end en couple").travelers).toBe(2);
  });

  it("ambigu « seule ou à 2 » → null (les deux formules affichées)", () => {
    expect(parseText("fin août, seule ou à 2").travelers).toBeNull();
  });

  it("null quand rien n'est précisé", () => {
    expect(parseText("la mer en juin").travelers).toBeNull();
  });
});

describe("parseText · vibes", () => {
  it("détecte mer via plage, baignade, falaise", () => {
    expect(parseText("bronzer à la plage").vibes).toContain("mer");
    expect(parseText("voir les falaises").vibes).toContain("mer");
  });

  it("détecte montagne via rando, alpes", () => {
    expect(parseText("une rando dans les alpes").vibes).toContain("montagne");
  });

  it("détecte ville et lac", () => {
    expect(parseText("citytrip musées").vibes).toContain("ville");
    expect(parseText("me baigner dans un lac").vibes).toContain("lac");
  });

  it("plusieurs vibes cumulées", () => {
    const v = parseText("mer ou montagne peu importe").vibes;
    expect(v).toContain("mer");
    expect(v).toContain("montagne");
  });
});

describe("parseText · mois", () => {
  it("détecte un mois nommé, accents ignorés", () => {
    expect(parseText("fin août si possible").month).toBe(8);
    expect(parseText("plutôt en fevrier").month).toBe(2);
  });

  it("« mais » ne matche pas mai", () => {
    expect(parseText("pas riche mais motivée").month).toBeNull();
  });
});

describe("parseText · nuits", () => {
  it("défaut 4 nuits", () => {
    expect(parseText("envie de mer").nights).toBe(4);
  });

  it("nuits explicites prioritaires", () => {
    expect(parseText("3 nuits sur place, 5 jours de libre").nights).toBe(3);
  });

  it("jours → jours - 1", () => {
    expect(parseText("5 jours en montagne").nights).toBe(4);
  });

  it("une semaine → 6, deux semaines → 13, week-end → 2", () => {
    expect(parseText("une semaine de rando").nights).toBe(6);
    expect(parseText("deux semaines au calme").nights).toBe(13);
    expect(parseText("un week-end pas cher").nights).toBe(2);
  });

  it("clamp à 14 max et 1 min", () => {
    expect(parseText("30 jours de folie").nights).toBe(14);
    expect(parseText("1 jour seulement").nights).toBe(1);
  });
});

describe("parseText · profil", () => {
  it("capture la phrase quand elle décrit le groupe", () => {
    const input = "deux étudiantes fauchées, envie de mer";
    expect(parseText(input).profile).toBe(input);
  });

  it("null sinon", () => {
    expect(parseText("la mer en juin, 300€").profile).toBeNull();
  });
});
