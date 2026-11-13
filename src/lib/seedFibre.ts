/**
 * Dietary fibre (g per 100 g) for the built-in foods, keyed by food id without
 * the "sl-" prefix.
 *
 * Values marked USDA come from USDA SR Legacy (nutrient 291, "Fiber, total
 * dietary"). The rest are estimates from typical ingredients: lentils, coconut,
 * vegetables and wholegrain flours add fibre; meat, fish, eggs, oil and sugar
 * have none.
 */
export const SEED_FIBRE: Record<string, number> = {
  "white-rice-cooked": 0.4, // USDA
  "red-rice-cooked": 1.6, // USDA
  "basmati-rice-cooked": 0.4, // USDA
  "egg-boiled": 0, // USDA
  "egg-fried": 0, // USDA
  "egg-white": 0, // USDA
  "omelette": 0, // USDA
  "chicken-breast-grilled": 0, // USDA
  "tuna-canned-in-brine": 0, // USDA
  "banana": 2.6, // USDA
  "red-banana": 2.6, // USDA
  "papaya": 1.7, // USDA
  "mango": 1.6, // USDA
  "pineapple": 1.4, // USDA
  "avocado": 6.7, // USDA
  "watermelon": 0.4, // USDA
  "guava": 5.4, // USDA
  "orange": 2.4, // USDA
  "apple": 2.4, // USDA
  "grapes": 0.9, // USDA
  "rambutan": 0.9, // USDA
  "jackfruit-ripe": 1.5, // USDA
  "passion-fruit": 10.4, // USDA
  "mangosteen": 1.8, // USDA
  "soursop": 3.3, // USDA
  "custard-apple": 2.4, // USDA
  "durian": 3.8, // USDA
  "pomegranate": 4, // USDA
  "sapodilla": 5.3, // USDA
  "star-fruit": 2.8, // USDA
  "dates": 8, // USDA
  "coconut-fresh-grated": 9, // USDA
  "coconut-milk-thick": 2.2, // USDA
  "coconut-oil": 0, // USDA
  "chickpeas-boiled-kadala": 7.6, // USDA
  "mung-beans-boiled": 7.6, // USDA
  "cowpea-boiled": 6.5, // USDA
  "red-lentils-dry-raw": 10.8, // USDA
  "green-gram-sprouted": 1.8, // USDA
  "sweet-potato-boiled": 2.5, // USDA
  "potato-boiled": 1.8, // USDA
  "manioc-cassava-boiled": 1.8, // USDA
  "corn-on-the-cob-boiled": 2.4, // USDA
  "breadfruit-boiled": 4.9, // USDA
  "pumpkin-boiled": 1.1, // USDA
  "spinach-cooked": 2.4, // USDA
  "green-beans-boiled": 3.2, // USDA
  "carrot-raw": 2.8, // USDA
  "cucumber": 0.5, // USDA
  "tomato": 1.2, // USDA
  "white-bread": 2.7, // USDA
  "roast-paan": 2.9, // USDA
  "oats-cooked-with-water": 1.7, // USDA
  "fresh-milk": 0, // USDA
  "butter": 0, // USDA
  "condensed-milk": 0, // USDA
  "cheese-slice": 0, // USDA
  "milk-powder-full-cream": 0, // USDA
  "peanuts-roasted": 8.4, // USDA
  "cashews-fried-salted": 3.3, // USDA
  "sugar": 0, // USDA
  "jaggery": 0, // USDA
  "vanilla-ice-cream": 0.7, // USDA
  "milk-chocolate": 3.4, // USDA
  "potato-chips": 3.1, // USDA
  "cream-soda-cola": 0, // USDA
  "beer": 0, // USDA
  "fresh-orange-juice": 0.2, // USDA
  "ginger-beer": 0, // USDA
  "cream-cracker": 2.3, // USDA
  "marie-biscuit": 0.8, // USDA
  "king-coconut-water": 1.1, // USDA
  "chicken-sausage": 0, // USDA
  "yogurt-non-fat-plain": 0, // USDA
  "yogurt-low-fat-plain": 0, // USDA
  "yogurt-whole-milk-plain": 0, // USDA
  "yogurt-non-fat-fruit": 0, // USDA
  "yogurt-non-fat-vanilla": 0, // USDA
  "yogurt-low-fat-fruit": 0, // USDA
  "greek-yogurt-non-fat-plain": 0, // USDA
  "greek-yogurt-low-fat-plain": 0, // USDA
  "greek-yogurt-whole-milk-plain": 0, // USDA
  "greek-yogurt-non-fat-fruit": 0.6, // USDA
  "kiribath-milk-rice": 0.5,
  "yellow-rice": 0.6,
  "fried-rice-chicken": 1,
  "fried-rice-egg-vegetable": 1.2,
  "chicken-biryani": 1,
  "rice-and-curry-mixed-plate": 2,
  "string-hoppers": 1,
  "string-hopper-kottu-pilau": 1.5,
  "hopper-plain": 1,
  "egg-hopper": 0.6,
  "milk-hopper": 0.8,
  "pittu": 2.5,
  "coconut-roti-pol-roti": 4,
  "godamba-roti-paratha": 1.5,
  "thosai-dosa": 1.5,
  "idli": 1,
  "chicken-kottu": 1.5,
  "egg-vegetable-kottu": 1.8,
  "cheese-kottu": 1.4,
  "fried-noodles": 1.5,
  "kola-kenda-herbal-porridge": 1,
  "red-string-hoppers": 2,
  "kurakkan-string-hoppers": 3,
  "kurakkan-roti": 5,
  "kurakkan-pittu": 4,
  "red-rice-pittu": 3,
  "dhal-roti": 3,
  "chapati": 4,
  "masala-thosai": 2,
  "uppuma": 2,
  "mung-kiribath": 2,
  "lamprais": 1.5,
  "mutton-biryani": 1,
  "seafood-fried-rice": 1,
  "nasi-goreng": 1,
  "dolphin-kottu": 1.5,
  "instant-noodles-cooked": 0.8,
  "tea-bun": 2,
  "kimbula-bun": 1.5,
  "jackfruit-seeds-boiled": 1.5,
  "dhal-curry-parippu": 3,
  "chicken-curry": 0.5,
  "beef-curry": 0.5,
  "fish-curry": 0.5,
  "fish-ambul-thiyal": 0.3,
  "pork-curry": 0.5,
  "mutton-curry": 0.5,
  "prawn-curry": 0.5,
  "cuttlefish-curry": 0.5,
  "canned-fish-curry": 0.5,
  "egg-curry": 0.5,
  "potato-curry-ala-kiri-hodi": 1.5,
  "tempered-potato-ala-thel-dala": 1.8,
  "pumpkin-curry": 1.5,
  "green-bean-curry": 2.5,
  "beetroot-curry": 2.2,
  "carrot-curry": 2.5,
  "okra-curry": 3,
  "ash-plantain-curry": 2,
  "polos-curry-young-jackfruit": 3.5,
  "kiri-kos-jackfruit-curry": 2.5,
  "breadfruit-curry": 3.5,
  "cashew-curry": 2,
  "soya-meat-curry": 4,
  "mushroom-curry": 1.5,
  "brinjal-moju": 2.5,
  "kiri-hodi-coconut-milk-gravy": 0.5,
  "chicken-white-curry": 0.5,
  "chicken-liver-curry": 0.5,
  "duck-curry": 0.5,
  "fish-red-curry-mirisata": 0.5,
  "crab-curry": 0.3,
  "dried-fish-curry": 0.8,
  "devilled-prawns": 1,
  "devilled-beef": 1,
  "devilled-pork": 1,
  "devilled-fish": 1,
  "devilled-sausages": 1,
  "hot-butter-cuttlefish": 0.8,
  "jackfruit-seed-curry": 2,
  "bitter-gourd-curry": 2.5,
  "snake-gourd-curry": 1.2,
  "ash-gourd-curry": 1,
  "drumstick-curry": 3,
  "long-bean-curry": 2.5,
  "winged-bean-curry": 2.5,
  "leeks-tempered": 2,
  "lotus-root-curry": 3,
  "kohila-curry": 3,
  "banana-blossom-curry": 4,
  "mixed-vegetable-curry": 2.5,
  "dhal-with-spinach": 3.5,
  "fried-chicken": 0.5,
  "devilled-chicken": 0.8,
  "fried-fish": 0.2,
  "dried-fish-tempered": 0.5,
  "sprats-fried": 0.3,
  "grilled-fish-seer-tuna": 0,
  "prawns-fried": 0.3,
  "bbq-chicken": 0.2,
  "dried-fish-fried": 0,
  "pol-sambol": 6,
  "seeni-sambol": 2,
  "lunu-miris-katta-sambol": 2,
  "gotukola-sambol": 3,
  "mukunuwenna-mallum": 3.5,
  "cabbage-mallum": 3.5,
  "kankun-tempered": 2.5,
  "papadam-fried": 6,
  "malay-pickle": 2,
  "lime-pickle": 3,
  "coconut-chutney": 5,
  "mint-sambol": 4,
  "tomato-sambol": 1.5,
  "bitter-gourd-sambol": 3,
  "kathurumurunga-mallum": 3,
  "thampala-mallum": 3,
  "fried-onions": 2,
  "chickpeas-tempered": 7,
  "mixed-vegetables-boiled": 3,
  "salad-onion-tomato-cucumber": 1.2,
  "soya-meat-boiled": 5,
  "fish-roll": 1.5,
  "fish-cutlet": 1,
  "fish-patty": 1.2,
  "fish-bun-maalu-paan": 2,
  "vegetable-roti": 2.5,
  "egg-roti": 1.5,
  "ulundu-vadai": 4,
  "parippu-vadai": 6,
  "samosa": 2.5,
  "chicken-roll": 1.2,
  "vegetable-roll": 2,
  "chicken-patty": 1,
  "chicken-cutlet": 0.8,
  "sausage-bun": 1.8,
  "egg-bun": 2,
  "seeni-sambol-bun": 2.5,
  "isso-vadai": 5,
  "chicken-shawarma": 1.8,
  "murukku": 4,
  "spicy-mixture": 6,
  "roasted-gram-kadala": 12,
  "banana-fritter": 1.5,
  "wood-apple": 5,
  "ambarella": 2.5,
  "dragon-fruit": 3,
  "bael-fruit": 3,
  "gooseberry-nelli": 4.3,
  "kavum-oil-cake": 1,
  "kokis": 1,
  "lavariya": 2.5,
  "watalappan": 0.5,
  "milk-toffee": 0,
  "kithul-treacle": 0,
  "kalu-dodol": 2,
  "aluwa": 1,
  "pani-walalu": 3,
  "aasmi": 0.5,
  "athirasa": 1,
  "mung-kavum": 2,
  "bibikkan": 3,
  "butter-cake": 0.7,
  "love-cake": 2,
  "coconut-toffee": 4,
  "thala-guli": 8,
  "kurakkan-halapa": 3,
  "coconut-pancake": 2,
  "tea-plain-with-sugar": 0,
  "milk-tea-with-sugar": 0,
  "tea-no-sugar": 0,
  "curd-buffalo": 0,
  "curd-and-treacle": 0,
  "faluda": 0.5,
  "wood-apple-juice": 2,
  "lime-juice-sweetened": 0.1,
  "milo-with-milk": 0.5,
  "coffee-with-milk-and-sugar": 0,
  "black-coffee-no-sugar": 0,
  "ginger-tea-with-sugar": 0,
  "mango-juice-packet": 0.3,
  "papaya-juice": 0.6,
  "avocado-juice-with-milk": 2,
  "sweet-lassi": 0,
  "set-yoghurt-sweetened": 0,
};
