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

const MORE_ROWS: Row[] = [
  // ── Rice & staples ────────────────────────────────────────────────
  ["Red string hoppers", "Rice & staples", [125, 2.6, 27, 0.6], [p("piece", 22), p("serving (10 pieces)", 220)], ["rathu indi appa", "red idiyappam"]],
  ["Kurakkan string hoppers", "Rice & staples", [130, 3, 27, 0.9], [p("piece", 22), p("serving (10 pieces)", 220)], ["finger millet", "ragi"]],
  ["Kurakkan roti", "Rice & staples", [260, 7, 44, 6.5], [p("piece", 70)], ["finger millet roti", "ragi roti"]],
  ["Kurakkan pittu", "Rice & staples", [195, 4.5, 34, 4.5], [p("piece (cylinder)", 100), p("cup", 130)], ["ragi pittu"]],
  ["Red rice pittu", "Rice & staples", [205, 3.8, 36, 5], [p("piece (cylinder)", 100), p("cup", 130)], ["rathu pittu"]],
  ["Dhal roti", "Rice & staples", [270, 8, 40, 8.5], [p("piece", 70)], ["parippu roti"]],
  ["Chapati", "Rice & staples", [300, 9, 46, 9], [p("piece", 40)], ["chapathi"]],
  ["Masala thosai", "Rice & staples", [175, 4, 26, 6.5], [p("piece", 150)], ["masala dosa"]],
  ["Uppuma", "Rice & staples", [150, 3.5, 22, 5.5], [p("cup", 200), p("serving", 150)], ["upma", "rava"]],
  ["Mung kiribath", "Rice & staples", [165, 4.5, 27, 4.5], [p("piece", 100)], ["mung eta kiribath"]],
  ["Lamprais", "Rice & staples", [185, 8, 20, 8], [p("packet", 400)], ["lump rice"]],
  ["Mutton biryani", "Rice & staples", [195, 9, 21, 8.5], RICE, ["mutton buriyani"]],
  ["Seafood fried rice", "Rice & staples", [170, 7, 23, 5.5], RICE],
  ["Nasi goreng", "Rice & staples", [180, 7, 22, 7], [p("plate", 400), p("cup", 180)]],
  ["Dolphin kottu", "Rice & staples", [200, 8, 22, 9], [p("full portion", 450), p("half portion", 250)], ["dolphin koththu"]],
  ["Instant noodles, cooked", "Rice & staples", [140, 3.5, 19, 5.5], [p("packet (cooked)", 300), p("cup", 180)], ["maggi", "noodles"]],
  ["Roast paan", "Rice & staples", [280, 9, 52, 3.5], [p("slice", 40), p("quarter", 120)], ["roast bread"]],
  ["Tea bun", "Rice & staples", [320, 8, 55, 7.5], [p("piece", 70)], ["sweet bun", "seeni banis"]],
  ["Kimbula bun", "Rice & staples", [380, 7, 52, 16], [p("piece", 60)], ["crocodile bun"]],
  ["Breadfruit, boiled", "Rice & staples", [100, 1.1, 25, 0.3], [p("cup", 150), p("piece", 60)], ["del tambapu"]],
  ["Jackfruit seeds, boiled", "Rice & staples", [185, 7, 38, 0.4], [p("tablespoon", 15), p("cup", 140)], ["kos ata"]],
  ["Corn on the cob, boiled", "Rice & staples", [96, 3.4, 21, 1.5], [p("cob", 120)], ["bada iringu", "corn"]],
  ["Potato, boiled", "Rice & staples", [87, 1.9, 20, 0.1], [p("medium", 150), p("cup", 150)], ["ala"]],

  // ── Curries ───────────────────────────────────────────────────────
  ["Chicken white curry", "Curries", [170, 14, 3, 11.5], [p("piece with gravy", 80), ...CURRY], ["kukul mas kiri hodi"]],
  ["Chicken liver curry", "Curries", [170, 17, 4, 9.5], CURRY],
  ["Duck curry", "Curries", [220, 15, 3, 16.5], CURRY, ["thara"]],
  ["Fish red curry (mirisata)", "Curries", [130, 17, 3, 5.5], [p("piece with gravy", 70), ...CURRY], ["malu mirisata", "tuna curry", "balaya"]],
  ["Crab curry", "Curries", [110, 12, 3, 5.5], CURRY, ["kakuluwo", "jaffna crab"]],
  ["Dried fish curry", "Curries", [150, 15, 4, 8], CURRY, ["karawala hodi", "karawala curry"]],
  ["Devilled prawns", "Curries", [150, 15, 8, 6.5], CURRY, ["prawn devilled", "isso devilled"]],
  ["Devilled beef", "Curries", [215, 18, 8, 12], CURRY, ["beef devilled"]],
  ["Devilled pork", "Curries", [260, 15, 8, 19], CURRY, ["pork devilled"]],
  ["Devilled fish", "Curries", [190, 16, 9, 10], CURRY, ["fish devilled"]],
  ["Devilled sausages", "Curries", [260, 10, 10, 20], CURRY],
  ["Hot butter cuttlefish", "Curries", [240, 13, 20, 12], CURRY, ["hot butter squid"]],
  ["Jackfruit seed curry", "Curries", [150, 4, 20, 6], CURRY, ["kos ata curry"]],
  ["Bitter gourd curry", "Curries", [95, 1.8, 8, 6.5], VEG, ["karawila curry"]],
  ["Snake gourd curry", "Curries", [65, 1.2, 5, 4.5], VEG, ["pathola"]],
  ["Ash gourd curry", "Curries", [55, 0.7, 5, 3.5], VEG, ["puhul"]],
  ["Drumstick curry", "Curries", [85, 2.3, 7, 5.5], VEG, ["murunga"]],
  ["Long bean curry", "Curries", [80, 2.3, 7, 5], VEG, ["ma karal", "me karal"]],
  ["Winged bean curry", "Curries", [80, 2.5, 6, 5.5], VEG, ["dambala"]],
  ["Leeks, tempered", "Curries", [95, 1.5, 9, 6], VEG, ["leeks thel dala"]],
  ["Lotus root curry", "Curries", [100, 2, 12, 5], VEG, ["nelum ala"]],
  ["Kohila curry", "Curries", [105, 2, 14, 5], VEG],
  ["Banana blossom curry", "Curries", [95, 2, 9, 6], VEG, ["kesel muwa"]],
  ["Mixed vegetable curry", "Curries", [90, 1.8, 8, 6], VEG, ["elawalu"]],
  ["Dhal with spinach", "Curries", [110, 6, 13, 4], CURRY, ["parippu nivithi"]],

  // ── Meat, fish & eggs ─────────────────────────────────────────────
  ["Grilled fish (seer / tuna)", "Meat, fish & eggs", [140, 25, 0, 4], [p("piece", 100)], ["thora", "balaya", "grilled fish"]],
  ["Tuna, canned in brine", "Meat, fish & eggs", [116, 26, 0, 0.8], [p("can (drained)", 120), p("tablespoon", 15)]],
  ["Egg white", "Meat, fish & eggs", [52, 11, 0.7, 0.2], [p("piece", 33)]],
  ["Chicken sausage", "Meat, fish & eggs", [230, 12, 6, 18], [p("piece", 40)], ["sausages"]],
  ["Prawns, fried", "Meat, fish & eggs", [240, 20, 10, 13], [p("serving", 100), p("piece", 12)], ["isso bedum"]],
  ["BBQ chicken", "Meat, fish & eggs", [190, 27, 2, 8], [p("piece", 120), p("serving", 100)], ["grilled chicken", "tandoori"]],
  ["Dried fish, fried", "Meat, fish & eggs", [300, 45, 3, 12], SAMBOL, ["karawala bedum"]],

  // ── Sambols & sides ───────────────────────────────────────────────
  ["Malay pickle", "Sambols & sides", [210, 1.5, 38, 6], SAMBOL, ["malay achcharu", "achcharu"]],
  ["Lime pickle", "Sambols & sides", [180, 1, 20, 11], [p("teaspoon", 8), p("tablespoon", 15)], ["dehi achcharu"]],
  ["Coconut chutney", "Sambols & sides", [220, 3, 10, 19], SAMBOL, ["pol chutney"]],
  ["Mint sambol", "Sambols & sides", [150, 3, 8, 12], SAMBOL, ["minchi sambol"]],
  ["Tomato sambol", "Sambols & sides", [80, 1.5, 7, 5], SAMBOL, ["thakkali sambol"]],
  ["Bitter gourd sambol", "Sambols & sides", [110, 2, 9, 7.5], SAMBOL, ["karawila sambol"]],
  ["Kathurumurunga mallum", "Sambols & sides", [95, 3.5, 7, 6], VEG, ["kathurumurunga"]],
  ["Thampala mallum", "Sambols & sides", [90, 3, 6, 6], VEG, ["thampala", "amaranth"]],
  ["Fried onions", "Sambols & sides", [340, 4, 30, 23], SAMBOL],

  // ── Vegetables & pulses ───────────────────────────────────────────
  ["Red lentils, dry (raw)", "Vegetables & pulses", [358, 24, 63, 2.2], [p("cup (raw)", 190), p("tablespoon", 12)], ["mysore dhal", "masoor"]],
  ["Pumpkin, boiled", "Vegetables & pulses", [26, 1, 6.5, 0.1], [p("cup", 150)]],
  ["Spinach, cooked", "Vegetables & pulses", [23, 3, 3.8, 0.3], [p("cup", 180)], ["nivithi"]],
  ["Green beans, boiled", "Vegetables & pulses", [35, 1.9, 7.9, 0.3], [p("cup", 125)], ["bonchi"]],
  ["Soya meat, boiled", "Vegetables & pulses", [110, 16, 9, 0.6], [p("cup", 100), p("serving", 60)], ["soya chunks"]],
  ["Green gram, sprouted", "Vegetables & pulses", [30, 3, 6, 0.2], [p("cup", 105)], ["bean sprouts"]],

  // ── Short eats ────────────────────────────────────────────────────
  ["Chicken roll", "Short eats", [255, 9, 27, 12.5], [p("piece", 70)], ["chinese roll"]],
  ["Vegetable roll", "Short eats", [240, 5, 30, 11], [p("piece", 70)], ["veg roll"]],
  ["Chicken patty", "Short eats", [300, 8, 28, 17], [p("piece", 50)], ["chicken pastry"]],
  ["Chicken cutlet", "Short eats", [235, 11, 18, 13], [p("piece", 35)]],
  ["Sausage bun", "Short eats", [310, 10, 38, 13], [p("piece", 90)]],
  ["Egg bun", "Short eats", [260, 9, 35, 9], [p("piece", 100)]],
  ["Seeni sambol bun", "Short eats", [300, 7, 48, 9], [p("piece", 90)], ["seeni sambal paan"]],
  ["Isso vadai", "Short eats", [270, 12, 25, 14], [p("piece", 45)], ["prawn vadai", "isso wade"]],
  ["Chicken shawarma", "Short eats", [215, 12, 22, 9], [p("wrap", 300)], ["shawarma"]],
  ["Murukku", "Short eats", [520, 9, 55, 30], [p("piece", 15), p("handful", 30)]],
  ["Spicy mixture", "Short eats", [510, 14, 45, 31], [p("tablespoon", 10), p("handful", 30)], ["bombay mix"]],
  ["Roasted gram (kadala)", "Short eats", [360, 20, 58, 6], [p("handful", 30), p("tablespoon", 10)], ["kadala parippu", "roasted chickpeas"]],
  ["Cashews, fried & salted", "Short eats", [580, 16, 30, 46], [p("handful", 30), p("piece", 1.5)], ["cadju", "kaju"]],
  ["Potato chips", "Short eats", [536, 7, 53, 34], [p("small packet", 25), p("handful", 20)], ["crisps"]],
  ["Banana fritter", "Short eats", [260, 3, 34, 13], [p("piece", 60)], ["kesel bajji"]],

  // ── Fruits ────────────────────────────────────────────────────────
  ["Mangosteen", "Fruits", [73, 0.4, 18, 0.6], [p("piece (flesh)", 30)], ["mangus"]],
  ["Soursop", "Fruits", [66, 1, 17, 0.3], [p("cup", 225)], ["katu anoda"]],
  ["Custard apple", "Fruits", [101, 1.7, 25, 0.6], [p("piece (flesh)", 100)], ["seeni anoda"]],
  ["Durian", "Fruits", [147, 1.5, 27, 5.3], [p("pod", 40), p("cup", 240)], ["duriyan"]],
  ["Pomegranate", "Fruits", [83, 1.7, 19, 1.2], [p("cup (seeds)", 175), p("half", 140)], ["delum"]],
  ["Sapodilla", "Fruits", [83, 0.4, 20, 1.1], [p("piece", 150)], ["sapathilla", "chikku"]],
  ["Star fruit", "Fruits", [31, 1, 6.7, 0.3], [p("piece", 90)], ["kamaranga"]],
  ["Ambarella", "Fruits", [46, 0.2, 12, 0.1], [p("piece", 70)], ["ambarella"]],
  ["Dragon fruit", "Fruits", [60, 1.2, 13, 0], [p("half", 200), p("cup", 220)]],
  ["Dates", "Fruits", [282, 2.5, 75, 0.4], [p("piece", 8)], ["rata indi"]],
  ["Bael fruit", "Fruits", [137, 1.8, 32, 0.3], [p("cup (pulp)", 150)], ["beli"]],
  ["Gooseberry (nelli)", "Fruits", [44, 0.9, 10, 0.6], [p("piece", 10)], ["nelli", "amla"]],
  ["Red banana", "Fruits", [90, 1.2, 23, 0.3], [p("piece", 120)], ["rathambala", "rath kesel"]],

  // ── Sweets ────────────────────────────────────────────────────────
  ["Kalu dodol", "Sweets", [390, 3, 62, 15], [p("piece", 25)], ["dodol"]],
  ["Aluwa", "Sweets", [400, 4, 75, 10], [p("piece", 25)], ["rice flour aluwa"]],
  ["Pani walalu", "Sweets", [410, 4, 55, 20], [p("piece", 30)], ["undu walalu"]],
  ["Aasmi", "Sweets", [450, 3, 65, 20], [p("piece", 30)], ["asmi"]],
  ["Athirasa", "Sweets", [420, 4, 60, 18], [p("piece", 40)], ["athirasa"]],
  ["Mung kavum", "Sweets", [380, 6, 55, 15], [p("piece", 30)], ["mun kevum"]],
  ["Bibikkan", "Sweets", [360, 4, 58, 13], [p("slice", 60)]],
  ["Butter cake", "Sweets", [420, 5, 52, 21], [p("slice", 50)], ["cake"]],
  ["Love cake", "Sweets", [430, 6, 48, 24], [p("piece", 40)]],
  ["Coconut toffee", "Sweets", [450, 2, 65, 20], [p("piece", 15)], ["pol toffee"]],
  ["Thala guli", "Sweets", [480, 10, 50, 27], [p("piece", 15)], ["sesame balls"]],
  ["Kurakkan halapa", "Sweets", [220, 3, 40, 5.5], [p("piece", 70)], ["halapa"]],
  ["Coconut pancake", "Sweets", [270, 4, 40, 10.5], [p("piece", 60)], ["pani pol pancake", "pancake"]],
  ["Vanilla ice cream", "Sweets", [207, 3.5, 24, 11], [p("scoop", 65), p("cup", 130)], ["ice cream"]],
  ["Milk chocolate", "Sweets", [535, 7.6, 59, 30], [p("square", 6), p("small bar", 40)], ["chocolate"]],

  // ── Drinks & dairy ────────────────────────────────────────────────
  ["Milo with milk", "Drinks & dairy", [80, 3.5, 11, 2.5], DRINK, ["milo"]],
  ["Coffee with milk and sugar", "Drinks & dairy", [45, 1.2, 7, 1.4], DRINK, ["nescafe", "kopi"]],
  ["Black coffee, no sugar", "Drinks & dairy", [2, 0.1, 0, 0], DRINK, ["kopi"]],
  ["Ginger tea with sugar", "Drinks & dairy", [12, 0, 3, 0], DRINK, ["inguru the", "ginger tea"]],
  ["Fresh orange juice", "Drinks & dairy", [45, 0.7, 10.4, 0.2], [p("glass", 250)]],
  ["Mango juice (packet)", "Drinks & dairy", [55, 0.1, 13.5, 0], [p("packet", 200), p("glass", 250)]],
  ["Papaya juice", "Drinks & dairy", [50, 0.5, 12, 0.1], [p("glass", 250)]],
  ["Avocado juice with milk", "Drinks & dairy", [120, 2.5, 15, 6], [p("glass", 300)], ["avocado shake"]],
  ["Sweet lassi", "Drinks & dairy", [90, 3, 14, 2.5], [p("glass", 250)]],
  ["Set yoghurt, sweetened", "Drinks & dairy", [95, 3.5, 15, 2.5], [p("cup", 80)], ["yoghurt cup", "yogurt"]],
  ["Ginger beer", "Drinks & dairy", [40, 0, 10, 0], [p("bottle", 400), p("glass", 250)], ["egb"]],
  ["Cream soda / cola", "Drinks & dairy", [43, 0, 10.8, 0], [p("bottle", 400), p("can", 330), p("glass", 250)], ["soda", "coke", "soft drink"]],
  ["Condensed milk", "Drinks & dairy", [321, 8, 54, 8.7], [p("tablespoon", 20), p("teaspoon", 7)]],
  ["Cheese slice", "Drinks & dairy", [300, 18, 4, 24], [p("slice", 20)]],
  ["Beer", "Drinks & dairy", [43, 0.5, 3.6, 0], [p("bottle", 625), p("can", 500), p("glass", 250)]],
];

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Bump when adding foods; existing accounts receive only the newer ones. */
export const SEED_VERSION = 2;

const tag = (rows: Row[], version: number) => rows.map((row) => ({ row, version }));

export const SEED_FOODS: (Food & { seedVersion: number })[] = [...tag(ROWS, 1), ...tag(MORE_ROWS, 2)].map(
  ({ row: [name, category, [calories, protein, carbs, fat], portions, aliases], version }) => ({
  id: `sl-${slug(name)}`,
  name,
  aliases: aliases ?? [],
  category,
  per100g: { calories, protein, carbs, fat },
  portions,
  estimated: true,
  source: "seed",
  seedVersion: version,
}));
