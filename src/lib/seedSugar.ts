/**
 * Total sugar (g per 100 g) for the built-in foods, keyed by food id without
 * the "sl-" prefix.
 *
 * Values marked USDA come from USDA SR Legacy (nutrient 269, "Sugars, total").
 * The rest are estimates from typical recipes: sugar in tea and sweets,
 * treacle, jaggery, ketchup in devilled dishes, and natural sugars in
 * vegetables, coconut and milk. Total sugar includes natural sugars (fruit,
 * milk), not only added sugar.
 */
export const SEED_SUGAR: Record<string, number> = {
  // ── Rice & staples ──
  "white-rice-cooked": 0.1, // USDA
  "red-rice-cooked": 0.2, // USDA (brown rice)
  "basmati-rice-cooked": 0.1, // USDA
  "kiribath-milk-rice": 0.5,
  "yellow-rice": 0.5,
  "fried-rice-chicken": 1,
  "fried-rice-egg-vegetable": 1.2,
  "chicken-biryani": 1.5,
  "rice-and-curry-mixed-plate": 1.5,
  "string-hoppers": 0.2,
  "string-hopper-kottu-pilau": 1.5,
  "hopper-plain": 3,
  "egg-hopper": 1.5,
  "milk-hopper": 4,
  pittu: 0.8,
  "coconut-roti-pol-roti": 1.5,
  "godamba-roti-paratha": 1.5,
  "thosai-dosa": 0.8,
  idli: 0.5,
  "chicken-kottu": 1.5,
  "egg-vegetable-kottu": 1.8,
  "cheese-kottu": 1.8,
  "fried-noodles": 2,
  "white-bread": 5.7, // USDA
  "manioc-cassava-boiled": 1.7, // USDA (raw cassava)
  "sweet-potato-boiled": 5.7, // USDA
  "kola-kenda-herbal-porridge": 0.5,
  "oats-cooked-with-water": 0.3, // USDA
  "red-string-hoppers": 0.3,
  "kurakkan-string-hoppers": 0.5,
  "kurakkan-roti": 1.5,
  "kurakkan-pittu": 0.8,
  "red-rice-pittu": 0.8,
  "dhal-roti": 1.5,
  chapati: 1,
  "masala-thosai": 1.5,
  uppuma: 1.5,
  "mung-kiribath": 1,
  lamprais: 2,
  "mutton-biryani": 1.5,
  "seafood-fried-rice": 1,
  "nasi-goreng": 2.5,
  "dolphin-kottu": 1.5,
  "instant-noodles-cooked": 1,
  "roast-paan": 6.2, // USDA (toasted white bread)
  "tea-bun": 15,
  "kimbula-bun": 14,
  "breadfruit-boiled": 11, // USDA (raw breadfruit)
  "jackfruit-seeds-boiled": 2,
  "corn-on-the-cob-boiled": 4.5, // USDA
  "potato-boiled": 0.9, // USDA

  // ── Curries ──
  "dhal-curry-parippu": 1.5,
  "chicken-curry": 1.5,
  "beef-curry": 1.5,
  "fish-curry": 1.2,
  "fish-ambul-thiyal": 0.5,
  "pork-curry": 1.5,
  "mutton-curry": 1.5,
  "prawn-curry": 1.5,
  "cuttlefish-curry": 1.5,
  "canned-fish-curry": 1.5,
  "egg-curry": 1.5,
  "potato-curry-ala-kiri-hodi": 1.5,
  "tempered-potato-ala-thel-dala": 1.5,
  "pumpkin-curry": 3,
  "green-bean-curry": 2.5,
  "beetroot-curry": 6,
  "carrot-curry": 4,
  "okra-curry": 1.5,
  "ash-plantain-curry": 2,
  "polos-curry-young-jackfruit": 2,
  "kiri-kos-jackfruit-curry": 4,
  "breadfruit-curry": 5,
  "cashew-curry": 3,
  "soya-meat-curry": 2,
  "mushroom-curry": 1.5,
  "brinjal-moju": 10,
  "kiri-hodi-coconut-milk-gravy": 1.5,
  "chicken-white-curry": 1.5,
  "chicken-liver-curry": 1.5,
  "duck-curry": 1.5,
  "fish-red-curry-mirisata": 1.5,
  "crab-curry": 1.5,
  "dried-fish-curry": 2,
  "devilled-prawns": 5,
  "devilled-beef": 5,
  "devilled-pork": 5,
  "devilled-fish": 5,
  "devilled-sausages": 6,
  "hot-butter-cuttlefish": 4,
  "jackfruit-seed-curry": 2,
  "bitter-gourd-curry": 3,
  "snake-gourd-curry": 2,
  "ash-gourd-curry": 2,
  "drumstick-curry": 1.5,
  "long-bean-curry": 2,
  "winged-bean-curry": 1.5,
  "leeks-tempered": 3,
  "lotus-root-curry": 1.5,
  "kohila-curry": 1,
  "banana-blossom-curry": 2,
  "mixed-vegetable-curry": 2.5,
  "dhal-with-spinach": 1.5,

  // ── Meat, fish & eggs ──
  "egg-boiled": 1.1, // USDA
  "egg-fried": 0.4, // USDA
  omelette: 0.3, // USDA
  "chicken-breast-grilled": 0, // USDA
  "fried-chicken": 0.5,
  "devilled-chicken": 5,
  "fried-fish": 0.3,
  "dried-fish-tempered": 2,
  "sprats-fried": 1.5,
  "grilled-fish-seer-tuna": 0,
  "tuna-canned-in-brine": 0, // USDA
  "egg-white": 0.7, // USDA
  "chicken-sausage": 1.9, // USDA
  "prawns-fried": 0.5,
  "bbq-chicken": 1.5,
  "dried-fish-fried": 0,

  // ── Sambols & sides ──
  "pol-sambol": 3,
  "seeni-sambol": 15,
  "lunu-miris-katta-sambol": 4,
  "gotukola-sambol": 2.5,
  "mukunuwenna-mallum": 1,
  "cabbage-mallum": 3,
  "kankun-tempered": 1,
  "papadam-fried": 1,
  "coconut-fresh-grated": 6.2, // USDA
  "coconut-milk-thick": 3.3, // USDA
  "coconut-oil": 0, // USDA
  "malay-pickle": 30,
  "lime-pickle": 8,
  "coconut-chutney": 4,
  "mint-sambol": 3,
  "tomato-sambol": 4,
  "bitter-gourd-sambol": 4,
  "kathurumurunga-mallum": 1,
  "thampala-mallum": 0.5,
  "fried-onions": 10,

  // ── Vegetables & pulses ──
  "chickpeas-boiled-kadala": 4.8, // USDA
  "chickpeas-tempered": 4.5,
  "mung-beans-boiled": 2, // USDA
  "cowpea-boiled": 3.3, // USDA
  "mixed-vegetables-boiled": 3,
  "salad-onion-tomato-cucumber": 3,
  "carrot-raw": 4.7, // USDA
  cucumber: 1.7, // USDA
  tomato: 2.6, // USDA
  "red-lentils-dry-raw": 2,
  "pumpkin-boiled": 2.1, // USDA
  "spinach-cooked": 0.4, // USDA
  "green-beans-boiled": 3.6, // USDA
  "soya-meat-boiled": 3,
  "green-gram-sprouted": 4.1, // USDA

  // ── Short eats ──
  "fish-roll": 2,
  "fish-cutlet": 1.5,
  "fish-patty": 2,
  "fish-bun-maalu-paan": 6,
  "vegetable-roti": 2,
  "egg-roti": 2,
  "ulundu-vadai": 1,
  "parippu-vadai": 1.5,
  samosa: 2,
  "cream-cracker": 8.2, // USDA (standard crackers)
  "marie-biscuit": 20.2, // USDA (butter cookies)
  "peanuts-roasted": 4.9, // USDA
  "chicken-roll": 2,
  "vegetable-roll": 2.5,
  "chicken-patty": 2,
  "chicken-cutlet": 1.5,
  "sausage-bun": 6,
  "egg-bun": 6,
  "seeni-sambol-bun": 12,
  "isso-vadai": 1,
  "chicken-shawarma": 3,
  murukku: 1,
  "spicy-mixture": 3,
  "roasted-gram-kadala": 5,
  "cashews-fried-salted": 5, // USDA
  "potato-chips": 0.3, // USDA
  "banana-fritter": 10,

  // ── Fruits ──
  banana: 12.2, // USDA
  papaya: 7.8, // USDA
  mango: 13.7, // USDA
  pineapple: 9.9, // USDA
  avocado: 0.7, // USDA
  watermelon: 6.2, // USDA
  guava: 8.9, // USDA
  orange: 9.4, // USDA
  apple: 10.4, // USDA
  grapes: 15.5, // USDA
  rambutan: 16,
  "jackfruit-ripe": 19.1, // USDA
  "wood-apple": 7,
  "passion-fruit": 11.2, // USDA
  mangosteen: 16,
  soursop: 13.5, // USDA
  "custard-apple": 18,
  durian: 12,
  pomegranate: 13.7, // USDA
  sapodilla: 14,
  "star-fruit": 4, // USDA
  ambarella: 9,
  "dragon-fruit": 8,
  dates: 63.4, // USDA
  "bael-fruit": 12,
  "gooseberry-nelli": 5,
  "red-banana": 12.2, // USDA (banana)

  // ── Sweets ──
  "kavum-oil-cake": 25,
  kokis: 8,
  lavariya: 25,
  watalappan: 25,
  "milk-toffee": 60,
  jaggery: 94, // just under its carbs (95 g); brown sugar is ~97
  "kithul-treacle": 68,
  sugar: 99.8, // USDA
  "kalu-dodol": 40,
  aluwa: 45,
  "pani-walalu": 40,
  aasmi: 35,
  athirasa: 30,
  "mung-kavum": 25,
  bibikkan: 35,
  "butter-cake": 30,
  "love-cake": 35,
  "coconut-toffee": 55,
  "thala-guli": 35,
  "kurakkan-halapa": 20,
  "coconut-pancake": 20,
  "vanilla-ice-cream": 21.2, // USDA
  "milk-chocolate": 51.5, // USDA

  // ── Drinks & dairy ──
  "tea-plain-with-sugar": 2.5,
  "milk-tea-with-sugar": 6.5,
  "tea-no-sugar": 0,
  "king-coconut-water": 2.6, // USDA (coconut water)
  "fresh-milk": 5.1, // USDA
  "milk-powder-full-cream": 38.4, // USDA
  "curd-buffalo": 5,
  "curd-and-treacle": 13,
  faluda: 18,
  "wood-apple-juice": 14,
  "lime-juice-sweetened": 9.8,
  butter: 0.1, // USDA
  "milo-with-milk": 10,
  "coffee-with-milk-and-sugar": 6.5,
  "black-coffee-no-sugar": 0,
  "ginger-tea-with-sugar": 3,
  "fresh-orange-juice": 8.4, // USDA
  "mango-juice-packet": 13,
  "papaya-juice": 11,
  "avocado-juice-with-milk": 13,
  "sweet-lassi": 13,
  "set-yoghurt-sweetened": 13,
  "ginger-beer": 8.9, // USDA (ginger ale)
  "cream-soda-cola": 9.9, // USDA
  "condensed-milk": 54.4, // USDA
  "cheese-slice": 5.6, // USDA
  beer: 0, // USDA
  "yogurt-non-fat-plain": 7.7, // USDA
  "yogurt-low-fat-plain": 7, // USDA
  "yogurt-whole-milk-plain": 4.7, // USDA
  "yogurt-non-fat-fruit": 19, // USDA
  "yogurt-non-fat-vanilla": 5.9, // USDA
  "yogurt-low-fat-fruit": 18.6, // USDA
  "greek-yogurt-non-fat-plain": 3.2, // USDA
  "greek-yogurt-low-fat-plain": 3.6, // USDA
  "greek-yogurt-whole-milk-plain": 4, // USDA
  "greek-yogurt-non-fat-fruit": 11.3, // USDA
};
