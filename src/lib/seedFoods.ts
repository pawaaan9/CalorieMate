import type { Food, Portion } from "./types";

/**
 * Built-in Sri Lankan food database.
 *
 * Values are per 100 g of the prepared food and are ESTIMATES: home recipes
 * vary a lot in coconut milk, oil and sugar. They are copied into the user's
 * Firestore `foods` collection on first sign-in, where they can be edited.
 */

const p = (label: string, grams: number): Portion => ({ label, grams });

const CURRY = [p("serving spoon", 45), p("tablespoon", 15), p("cup", 200), p("serving", 100)];
const VEG = [p("serving spoon", 40), p("tablespoon", 15), p("cup", 150), p("serving", 80)];
const SAMBOL = [p("tablespoon", 15), p("serving spoon", 30), p("serving", 40)];
const RICE = [p("cup", 160), p("serving spoon", 60), p("plate", 300), p("serving", 200)];
const DRINK = [p("cup", 200), p("glass", 250), p("tablespoon", 15)];

type Row = [
  name: string,
  category: string,
  nutrients: [kcal: number, protein: number, carbs: number, fat: number],
  portions: Portion[],
  aliases?: string[],
];

const ROWS: Row[] = [
  // ── Rice & staples ────────────────────────────────────────────────
  ["White rice, cooked", "Rice & staples", [130, 2.7, 28, 0.3], RICE, ["bath", "samba", "nadu", "sudu bath"]],
  ["Red rice, cooked", "Rice & staples", [122, 2.7, 25.5, 0.9], RICE, ["rathu kekulu", "rathu bath", "brown rice"]],
  ["Basmati rice, cooked", "Rice & staples", [121, 3.5, 25, 0.4], RICE],
  ["Kiribath (milk rice)", "Rice & staples", [170, 3, 28, 5], [p("piece", 100), p("cup", 180)], ["kiri bath"]],
  ["Yellow rice", "Rice & staples", [165, 3, 28, 4.5], RICE, ["kaha bath", "ghee rice"]],
  ["Fried rice, chicken", "Rice & staples", [175, 6.5, 24, 6], RICE, ["chicken fried rice"]],
  ["Fried rice, egg / vegetable", "Rice & staples", [165, 4.5, 25, 5.5], RICE, ["egg fried rice", "vegetable fried rice"]],
  ["Chicken biryani", "Rice & staples", [180, 8, 22, 6.5], RICE, ["biriyani", "buriyani"]],
  ["Rice and curry (mixed plate)", "Rice & staples", [150, 5.5, 22, 4.5], [p("plate", 450), p("small plate", 320), p("lunch packet", 500)], ["bath packet", "lunch packet"]],
  ["String hoppers", "Rice & staples", [125, 2.3, 28, 0.3], [p("piece", 22), p("serving (10 pieces)", 220)], ["idiyappam", "indi appa", "idi appa"]],
  ["String hopper kottu / pilau", "Rice & staples", [170, 6, 24, 5.5], [p("cup", 180), p("plate", 350)], ["indi appa kottu", "string hopper biryani"]],
  ["Hopper, plain", "Rice & staples", [200, 3.5, 36, 4.5], [p("piece", 45)], ["appa", "aappa", "hoppers"]],
  ["Egg hopper", "Rice & staples", [175, 8, 19, 7.5], [p("piece", 95)], ["biththara appa", "bittara appa"]],
  ["Milk hopper", "Rice & staples", [215, 3.5, 36, 6.5], [p("piece", 55)], ["kiri appa"]],
  ["Pittu", "Rice & staples", [215, 3.5, 38, 5.5], [p("piece (cylinder)", 100), p("cup", 130)], ["puttu", "pitu"]],
  ["Coconut roti (pol roti)", "Rice & staples", [300, 6, 45, 11], [p("piece", 70), p("small piece", 45)], ["pol roti", "roti"]],
  ["Godamba roti / paratha", "Rice & staples", [300, 7, 45, 10], [p("piece", 80)], ["godamba", "parata", "paratha"]],
  ["Thosai (dosa)", "Rice & staples", [170, 4, 29, 3.7], [p("piece", 80)], ["dosa", "dosai", "those"]],
  ["Idli", "Rice & staples", [130, 4, 26, 0.6], [p("piece", 40)]],
  ["Chicken kottu", "Rice & staples", [190, 9, 22, 7], [p("full portion", 450), p("half portion", 250), p("cup", 200)], ["kottu roti", "koththu"]],
  ["Egg / vegetable kottu", "Rice & staples", [175, 6.5, 23, 6], [p("full portion", 450), p("half portion", 250), p("cup", 200)], ["kottu roti", "koththu"]],
  ["Cheese kottu", "Rice & staples", [215, 10, 21, 10], [p("full portion", 450), p("half portion", 250), p("cup", 200)], ["koththu"]],
  ["Fried noodles", "Rice & staples", [170, 5, 24, 6], [p("cup", 160), p("plate", 300)], ["noodles"]],
  ["White bread", "Rice & staples", [265, 9, 49, 3.2], [p("slice", 30), p("quarter loaf", 110)], ["paan", "roast paan"]],
  ["Manioc (cassava), boiled", "Rice & staples", [125, 1, 30, 0.2], [p("piece", 60), p("cup", 150)], ["manyokka", "mannokka"]],
  ["Sweet potato, boiled", "Rice & staples", [76, 1.4, 17.7, 0.1], [p("piece", 100), p("cup", 150)], ["bathala"]],
  ["Kola kenda (herbal porridge)", "Rice & staples", [60, 1.2, 9, 2.2], [p("cup", 240), p("bowl", 300)], ["kola kanda", "herbal porridge"]],
  ["Oats, cooked with water", "Rice & staples", [71, 2.5, 12, 1.5], [p("cup", 235), p("bowl", 300)], ["porridge"]],

  // ── Curries ───────────────────────────────────────────────────────
  ["Dhal curry (parippu)", "Curries", [115, 6, 14, 4], CURRY, ["parippu", "dal", "lentil curry"]],
  ["Chicken curry", "Curries", [165, 15, 3, 10.5], [p("piece with gravy", 80), ...CURRY], ["kukul mas"]],
  ["Beef curry", "Curries", [185, 18, 3, 11.5], CURRY, ["harak mas"]],
  ["Fish curry", "Curries", [125, 15, 2.5, 6], [p("piece with gravy", 70), ...CURRY], ["malu curry", "maalu", "kiri malu"]],
  ["Fish ambul thiyal", "Curries", [135, 23, 2, 4], [p("piece", 40), p("serving", 80)], ["ambulthiyal", "sour fish curry"]],
  ["Pork curry", "Curries", [240, 15, 3, 19], CURRY, ["uru mas", "black pork curry"]],
  ["Mutton curry", "Curries", [195, 16, 3, 13], CURRY, ["elu mas"]],
  ["Prawn curry", "Curries", [120, 14, 3, 6], CURRY, ["isso curry"]],
  ["Cuttlefish curry", "Curries", [130, 14, 4, 6.5], CURRY, ["dallo", "squid curry"]],
  ["Canned fish curry", "Curries", [150, 17, 2.5, 8], CURRY, ["salmon curry", "tin fish", "mackerel curry"]],
  ["Egg curry", "Curries", [150, 9, 3, 11], [p("egg with gravy", 80), ...CURRY], ["biththara curry"]],
  ["Potato curry (ala kiri hodi)", "Curries", [105, 1.8, 14, 4.8], CURRY, ["ala hodi", "ala curry"]],
  ["Tempered potato (ala thel dala)", "Curries", [150, 2.2, 20, 7], VEG, ["ala thel dala", "devilled potato"]],
  ["Pumpkin curry", "Curries", [75, 1.2, 8, 4.5], VEG, ["wattakka"]],
  ["Green bean curry", "Curries", [80, 2, 7, 5], VEG, ["bonchi"]],
  ["Beetroot curry", "Curries", [85, 1.6, 9, 4.8], VEG],
  ["Carrot curry", "Curries", [80, 1, 8, 5], VEG],
  ["Okra curry", "Curries", [80, 1.8, 7, 5], VEG, ["bandakka", "ladies fingers"]],
  ["Ash plantain curry", "Curries", [110, 1.2, 18, 4], VEG, ["alu kesel"]],
  ["Polos curry (young jackfruit)", "Curries", [95, 2, 11, 5], CURRY, ["polos ambula", "baby jackfruit"]],
  ["Kiri kos (jackfruit curry)", "Curries", [130, 2.5, 20, 5], CURRY, ["kos"]],
  ["Breadfruit curry", "Curries", [110, 1.5, 17, 4.5], CURRY, ["del"]],
  ["Cashew curry", "Curries", [270, 7, 14, 21], VEG, ["kaju maluwa", "cadju curry"]],
  ["Soya meat curry", "Curries", [140, 12, 8, 6.5], VEG, ["soya"]],
  ["Mushroom curry", "Curries", [85, 2.5, 5, 6], VEG, ["hathu"]],
  ["Brinjal moju", "Curries", [190, 1.5, 14, 14.5], SAMBOL, ["wambatu moju", "eggplant"]],
  ["Kiri hodi (coconut milk gravy)", "Curries", [95, 1, 3, 9], [p("tablespoon", 15), p("serving spoon", 45), p("cup", 220)], ["sodhi", "hodi"]],

  // ── Meat, fish & eggs ─────────────────────────────────────────────
  ["Egg, boiled", "Meat, fish & eggs", [155, 12.6, 1.1, 10.6], [p("piece", 50)], ["biththara"]],
  ["Egg, fried", "Meat, fish & eggs", [196, 13.6, 0.8, 15], [p("piece", 46)], ["bullseye"]],
  ["Omelette", "Meat, fish & eggs", [180, 11, 1.5, 14], [p("one-egg omelette", 60), p("two-egg omelette", 115)]],
  ["Chicken breast, grilled", "Meat, fish & eggs", [165, 31, 0, 3.6], [p("piece", 120), p("serving", 100)]],
  ["Fried chicken", "Meat, fish & eggs", [260, 22, 9, 15], [p("piece", 100)]],
  ["Devilled chicken", "Meat, fish & eggs", [200, 16, 8, 11.5], CURRY, ["chicken devilled"]],
  ["Fried fish", "Meat, fish & eggs", [200, 22, 3, 11], [p("piece", 60), p("serving", 100)], ["malu bedum"]],
  ["Dried fish, tempered", "Meat, fish & eggs", [250, 35, 4, 10], SAMBOL, ["karawala", "karola"]],
  ["Sprats, fried", "Meat, fish & eggs", [280, 35, 5, 13], SAMBOL, ["haal messo", "halmasso"]],

  // ── Sambols & sides ───────────────────────────────────────────────
  ["Pol sambol", "Sambols & sides", [285, 3.2, 12, 25], SAMBOL, ["coconut sambol", "pol sambola"]],
  ["Seeni sambol", "Sambols & sides", [220, 2, 28, 11], SAMBOL, ["onion sambol"]],
  ["Lunu miris / katta sambol", "Sambols & sides", [80, 5, 10, 2], [p("teaspoon", 6), p("tablespoon", 15)], ["katta sambal"]],
  ["Gotukola sambol", "Sambols & sides", [90, 2.5, 6, 6.5], VEG, ["gotu kola"]],
  ["Mukunuwenna mallum", "Sambols & sides", [95, 3, 6, 6.5], VEG, ["mallung", "mukunuwenna"]],
  ["Cabbage mallum", "Sambols & sides", [85, 1.8, 6, 6], VEG, ["gova mallung"]],
  ["Kankun, tempered", "Sambols & sides", [90, 2.6, 4, 7], VEG, ["kangkung"]],
  ["Papadam, fried", "Sambols & sides", [430, 17, 45, 20], [p("piece", 5)], ["papadum", "pappadam"]],
  ["Coconut, fresh grated", "Sambols & sides", [354, 3.3, 15, 33.5], [p("tablespoon", 8), p("cup", 90)], ["pol"]],
  ["Coconut milk, thick", "Sambols & sides", [200, 2, 3.5, 21], [p("tablespoon", 15), p("cup", 240)], ["pol kiri"]],
  ["Coconut oil", "Sambols & sides", [892, 0, 0, 100], [p("teaspoon", 4.5), p("tablespoon", 13.5)], ["pol thel"]],

  // ── Vegetables & pulses ───────────────────────────────────────────
  ["Chickpeas, boiled (kadala)", "Vegetables & pulses", [164, 8.9, 27.4, 2.6], [p("cup", 160), p("serving", 100)], ["kadala"]],
  ["Chickpeas, tempered", "Vegetables & pulses", [185, 8.5, 26, 5.5], [p("cup", 160), p("serving", 100)], ["kadala thel dala"]],
  ["Mung beans, boiled", "Vegetables & pulses", [105, 7, 19, 0.4], [p("cup", 200), p("serving", 100)], ["mun eta", "green gram"]],
  ["Cowpea, boiled", "Vegetables & pulses", [116, 7.7, 20.8, 0.5], [p("cup", 170), p("serving", 100)], ["kawpi"]],
  ["Mixed vegetables, boiled", "Vegetables & pulses", [50, 2, 9, 0.3], [p("cup", 150), p("serving", 100)]],
  ["Salad (onion, tomato, cucumber)", "Vegetables & pulses", [25, 1, 5, 0.2], [p("cup", 120), p("serving", 80)]],
  ["Carrot, raw", "Vegetables & pulses", [41, 0.9, 9.6, 0.2], [p("piece", 60), p("cup", 120)]],
  ["Cucumber", "Vegetables & pulses", [15, 0.7, 3.6, 0.1], [p("piece", 200), p("cup", 120)], ["pipingha"]],
  ["Tomato", "Vegetables & pulses", [18, 0.9, 3.9, 0.2], [p("piece", 90)], ["thakkali"]],

  // ── Short eats ────────────────────────────────────────────────────
  ["Fish roll", "Short eats", [250, 7, 28, 12], [p("piece", 70)], ["chinese roll", "rolls"]],
  ["Fish cutlet", "Short eats", [230, 9, 20, 13], [p("piece", 35)], ["cutlets"]],
  ["Fish patty", "Short eats", [300, 7, 30, 17], [p("piece", 50)], ["patties", "pattis"]],
  ["Fish bun (maalu paan)", "Short eats", [280, 9, 42, 8.5], [p("piece", 90)], ["malu pan"]],
  ["Vegetable roti", "Short eats", [220, 5, 32, 8], [p("piece", 100)], ["elawalu roti"]],
  ["Egg roti", "Short eats", [230, 8, 28, 9.5], [p("piece", 130)]],
  ["Ulundu vadai", "Short eats", [290, 9, 30, 15], [p("piece", 45)], ["wade", "vada"]],
  ["Parippu vadai", "Short eats", [280, 11, 28, 14], [p("piece", 35)], ["dhal wade", "masala vadai"]],
  ["Samosa", "Short eats", [260, 5, 30, 13], [p("piece", 50)]],
  ["Cream cracker", "Short eats", [450, 9, 68, 15], [p("piece", 8)], ["biscuit"]],
  ["Marie biscuit", "Short eats", [440, 7, 75, 12], [p("piece", 6)]],
  ["Peanuts, roasted", "Short eats", [585, 24, 20, 50], [p("tablespoon", 9), p("handful", 30)], ["rata kaju"]],

  // ── Fruits ────────────────────────────────────────────────────────
  ["Banana", "Fruits", [89, 1.1, 22.8, 0.3], [p("small (ambul)", 60), p("medium", 100)], ["kesel", "ambul", "kolikuttu", "seeni kesel"]],
  ["Papaya", "Fruits", [43, 0.5, 10.8, 0.3], [p("slice", 120), p("cup", 145)], ["gaslabu", "papaw"]],
  ["Mango", "Fruits", [60, 0.8, 15, 0.4], [p("piece", 200), p("cup", 165)], ["amba"]],
  ["Pineapple", "Fruits", [50, 0.5, 13, 0.1], [p("slice", 85), p("cup", 165)], ["annasi"]],
  ["Avocado", "Fruits", [160, 2, 8.5, 14.7], [p("half", 100), p("tablespoon", 15)], ["alipera"]],
  ["Watermelon", "Fruits", [30, 0.6, 7.6, 0.2], [p("slice", 280), p("cup", 150)], ["komadu"]],
  ["Guava", "Fruits", [68, 2.6, 14.3, 1], [p("piece", 90)], ["pera"]],
  ["Orange", "Fruits", [47, 0.9, 11.8, 0.1], [p("piece", 130)], ["dodam"]],
  ["Apple", "Fruits", [52, 0.3, 13.8, 0.2], [p("piece", 180)]],
  ["Grapes", "Fruits", [69, 0.7, 18, 0.2], [p("cup", 150), p("piece", 5)], ["midi"]],
  ["Rambutan", "Fruits", [82, 0.7, 20.9, 0.2], [p("piece", 15)]],
  ["Jackfruit, ripe", "Fruits", [95, 1.7, 23, 0.6], [p("bulb", 30), p("cup", 165)], ["waraka", "wela"]],
  ["Wood apple", "Fruits", [120, 3, 25, 1], [p("piece (pulp)", 150), p("tablespoon", 20)], ["divul", "diwul"]],
  ["Passion fruit", "Fruits", [97, 2.2, 23, 0.7], [p("piece (pulp)", 18)]],

  // ── Sweets ────────────────────────────────────────────────────────
  ["Kavum (oil cake)", "Sweets", [400, 3, 55, 19], [p("piece", 40)], ["konda kavum", "kevum"]],
  ["Kokis", "Sweets", [480, 5, 55, 27], [p("piece", 15)]],
  ["Lavariya", "Sweets", [230, 3, 42, 6], [p("piece", 60)], ["levariya"]],
  ["Watalappan", "Sweets", [220, 5, 30, 9], [p("serving", 100), p("tablespoon", 20)], ["wattalapam"]],
  ["Milk toffee", "Sweets", [420, 5, 70, 14], [p("piece", 20)], ["kiri toffee"]],
  ["Jaggery", "Sweets", [380, 0.4, 95, 0.1], [p("piece", 15)], ["hakuru"]],
  ["Kithul treacle", "Sweets", [290, 0, 72, 0], [p("tablespoon", 20), p("teaspoon", 7)], ["kithul pani", "treacle"]],
  ["Sugar", "Sweets", [387, 0, 100, 0], [p("teaspoon", 4), p("tablespoon", 12)], ["seeni"]],

  // ── Drinks & dairy ────────────────────────────────────────────────
  ["Tea, plain with sugar", "Drinks & dairy", [10, 0, 2.5, 0], DRINK, ["plain tea", "kahata"]],
  ["Milk tea with sugar", "Drinks & dairy", [45, 1.2, 7, 1.4], DRINK, ["kiri the", "tea"]],
  ["Tea, no sugar", "Drinks & dairy", [1, 0, 0.2, 0], DRINK],
  ["King coconut water", "Drinks & dairy", [20, 0.2, 4.5, 0.1], [p("one king coconut", 350), p("glass", 250)], ["thambili", "kurumba"]],
  ["Fresh milk", "Drinks & dairy", [62, 3.2, 4.8, 3.3], DRINK, ["kiri"]],
  ["Milk powder, full cream", "Drinks & dairy", [496, 26, 38, 27], [p("tablespoon", 8), p("teaspoon", 3)], ["kiri piti"]],
  ["Curd (buffalo)", "Drinks & dairy", [115, 4.5, 5, 8.5], [p("tablespoon", 20), p("cup", 200), p("serving", 100)], ["mee kiri", "yoghurt"]],
  ["Curd and treacle", "Drinks & dairy", [150, 3.8, 17, 7.2], [p("serving", 130)], ["kiri pani"]],
  ["Faluda", "Drinks & dairy", [110, 2.5, 20, 2.5], [p("glass", 300)]],
  ["Wood apple juice", "Drinks & dairy", [70, 1, 16, 0.5], [p("glass", 250)], ["divul kiri"]],
  ["Lime juice, sweetened", "Drinks & dairy", [40, 0.1, 10, 0], [p("glass", 250)], ["dehi"]],
  ["Butter", "Drinks & dairy", [717, 0.9, 0.1, 81], [p("teaspoon", 5), p("tablespoon", 14)]],
];

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const SEED_FOODS: Food[] = ROWS.map(([name, category, [calories, protein, carbs, fat], portions, aliases]) => ({
  id: `sl-${slug(name)}`,
  name,
  aliases: aliases ?? [],
  category,
  per100g: { calories, protein, carbs, fat },
  portions,
  estimated: true,
  source: "seed",
}));
