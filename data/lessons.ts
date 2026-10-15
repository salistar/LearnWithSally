import { LanguageCode, Lesson, Phrase, VocabularyItem } from "@/types/learning";

// Compact helpers so the content below stays readable.
const v = (word: string, translation: string, pronunciation: string): VocabularyItem => ({
  word,
  translation,
  pronunciation,
});
const p = (text: string, translation: string, pronunciation: string): Phrase => ({
  text,
  translation,
  pronunciation,
});

type LessonInput = Omit<Lesson, "id" | "unitId" | "languageCode" | "order" | "xpReward"> & {
  xpReward?: number;
};

function unit(languageCode: LanguageCode, unitOrder: number, lessons: LessonInput[]): Lesson[] {
  return lessons.map((lesson, index) => ({
    ...lesson,
    id: `${languageCode}-${unitOrder}-${index + 1}`,
    unitId: `${languageCode}-${unitOrder}`,
    languageCode,
    order: index + 1,
    xpReward: lesson.xpReward ?? 10,
  }));
}

// ─── Spanish ────────────────────────────────────────────────────────────────
const SPANISH = unit("es", 1, [
  {
    title: "Greetings & Introductions",
    description: "Say hello and goodbye in Spanish",
    icon: "👋",
    goals: ["Greet someone at any time of day", "Say goodbye politely"],
    vocabulary: [
      v("Hola", "Hello", "OH-lah"),
      v("Adiós", "Goodbye", "ah-DYOHS"),
      v("Buenos días", "Good morning", "BWEH-nohs DEE-ahs"),
      v("Buenas noches", "Good night", "BWEH-nahs NOH-chehs"),
    ],
    phrases: [
      p("¿Cómo estás?", "How are you?", "KOH-moh ehs-TAHS"),
      p("Estoy bien, gracias.", "I'm fine, thank you.", "ehs-TOY byehn GRAH-syahs"),
    ],
    topics: ["greetings", "farewells", "how are you"],
    introMessage: "¡Hola! I'm Sally — let's learn how to greet people in Spanish!",
  },
  {
    title: "Daily Life",
    description: "Talk about yourself and where you're from",
    icon: "🙋",
    goals: ["Say your name", "Say where you are from"],
    vocabulary: [
      v("Me llamo", "My name is", "meh YAH-moh"),
      v("Soy de", "I am from", "soy deh"),
      v("Mucho gusto", "Nice to meet you", "MOO-choh GOOS-toh"),
      v("Trabajo", "I work", "trah-BAH-hoh"),
    ],
    phrases: [
      p("¿Cómo te llamas?", "What's your name?", "KOH-moh teh YAH-mahs"),
      p("¿De dónde eres?", "Where are you from?", "deh DOHN-deh EH-rehs"),
    ],
    topics: ["introductions", "origin", "daily routine"],
    introMessage: "¡Hola otra vez! Today you'll learn to introduce yourself in Spanish.",
  },
  {
    title: "At the Café",
    description: "Order a drink and something to eat",
    icon: "☕",
    goals: ["Order a coffee", "Ask for the bill"],
    vocabulary: [
      v("Un café", "A coffee", "oon kah-FEH"),
      v("Agua", "Water", "AH-gwah"),
      v("Por favor", "Please", "por fah-VOR"),
      v("La cuenta", "The bill", "lah KWEN-tah"),
    ],
    phrases: [
      p("Quisiera un café, por favor.", "I would like a coffee, please.", "kee-SYEH-rah oon kah-FEH por fah-VOR"),
      p("¿Cuánto cuesta?", "How much does it cost?", "KWAN-toh KWES-tah"),
    ],
    topics: ["ordering", "café", "prices"],
    introMessage: "¡Bienvenido al café! Let's practise ordering in Spanish.",
  },
  {
    title: "Travel & Directions",
    description: "Ask where things are",
    icon: "🧭",
    goals: ["Ask where a place is", "Understand left and right"],
    vocabulary: [
      v("¿Dónde está…?", "Where is…?", "DOHN-deh ehs-TAH"),
      v("A la izquierda", "To the left", "ah lah ees-KYEHR-dah"),
      v("A la derecha", "To the right", "ah lah deh-REH-chah"),
      v("Todo recto", "Straight ahead", "TOH-doh REK-toh"),
    ],
    phrases: [
      p("¿Dónde está la estación?", "Where is the station?", "DOHN-deh ehs-TAH lah ehs-tah-SYOHN"),
      p("Está cerca.", "It's close.", "ehs-TAH SEHR-kah"),
    ],
    topics: ["directions", "travel", "places in town"],
    introMessage: "¡Vamos! Let's learn how to find your way in Spanish.",
  },
  {
    title: "Shopping",
    description: "Numbers and buying things",
    icon: "🛍️",
    goals: ["Count from one to five", "Ask for a price"],
    vocabulary: [
      v("Uno, dos, tres", "One, two, three", "OO-noh, dohs, trehs"),
      v("Cuatro, cinco", "Four, five", "KWAH-troh, SEEN-koh"),
      v("Barato", "Cheap", "bah-RAH-toh"),
      v("Caro", "Expensive", "KAH-roh"),
    ],
    phrases: [
      p("Me lo llevo.", "I'll take it.", "meh loh YEH-voh"),
      p("¿Tiene otro color?", "Do you have another colour?", "TYEH-neh OH-troh koh-LOR"),
    ],
    topics: ["numbers", "shopping", "prices"],
    introMessage: "¡Hola! Today we're going shopping — in Spanish!",
  },
]);

// ─── French ─────────────────────────────────────────────────────────────────
const FRENCH = unit("fr", 1, [
  {
    title: "Greetings",
    description: "Say hello and goodbye in French",
    icon: "👋",
    goals: ["Greet someone politely", "Say goodbye"],
    vocabulary: [
      v("Bonjour", "Hello / Good morning", "bohn-ZHOOR"),
      v("Bonsoir", "Good evening", "bohn-SWAHR"),
      v("Salut", "Hi (informal)", "sah-LÜ"),
      v("Au revoir", "Goodbye", "oh ruh-VWAHR"),
    ],
    phrases: [
      p("Comment ça va ?", "How are you?", "koh-MAHN sah VAH"),
      p("Ça va bien, merci.", "I'm fine, thanks.", "sah vah BYAN mehr-SEE"),
    ],
    topics: ["greetings", "farewells", "formal vs informal"],
    introMessage: "Bonjour ! I'm Sally — let's start with French greetings!",
  },
  {
    title: "Introductions",
    description: "Introduce yourself in French",
    icon: "🙋",
    goals: ["Say your name", "Say where you live"],
    vocabulary: [
      v("Je m'appelle", "My name is", "zhuh mah-PEL"),
      v("J'habite à", "I live in", "zhah-BEET ah"),
      v("Enchanté", "Nice to meet you", "ahn-shahn-TAY"),
      v("Je suis", "I am", "zhuh SWEE"),
    ],
    phrases: [
      p("Comment tu t'appelles ?", "What's your name?", "koh-MAHN tü tah-PEL"),
      p("Tu viens d'où ?", "Where are you from?", "tü vyan DOO"),
    ],
    topics: ["introductions", "name", "city"],
    introMessage: "Re-bonjour ! Let's learn to introduce yourself in French.",
  },
  {
    title: "Au café",
    description: "Order at a French café",
    icon: "☕",
    goals: ["Order a drink", "Ask for the bill"],
    vocabulary: [
      v("Un café", "A coffee", "uhn kah-FAY"),
      v("Un croissant", "A croissant", "uhn krwah-SAHN"),
      v("S'il vous plaît", "Please", "seel voo PLEH"),
      v("L'addition", "The bill", "lah-dee-SYOHN"),
    ],
    phrases: [
      p("Je voudrais un café, s'il vous plaît.", "I'd like a coffee, please.", "zhuh voo-DREH uhn kah-FAY seel voo PLEH"),
      p("C'est combien ?", "How much is it?", "seh kohm-BYAN"),
    ],
    topics: ["ordering", "café", "politeness"],
    introMessage: "Bienvenue au café ! Let's order something in French.",
  },
  {
    title: "Directions",
    description: "Find your way around town",
    icon: "🧭",
    goals: ["Ask where a place is", "Understand simple directions"],
    vocabulary: [
      v("Où est… ?", "Where is…?", "oo EH"),
      v("À gauche", "To the left", "ah GOHSH"),
      v("À droite", "To the right", "ah DRWAHT"),
      v("Tout droit", "Straight ahead", "too DRWAH"),
    ],
    phrases: [
      p("Où est la gare ?", "Where is the station?", "oo eh lah GAHR"),
      p("C'est tout près.", "It's very close.", "seh too PREH"),
    ],
    topics: ["directions", "travel", "town"],
    introMessage: "Allons-y ! Let's learn directions in French.",
  },
  {
    title: "Numbers",
    description: "Count and talk about prices",
    icon: "🔢",
    goals: ["Count from one to five", "Understand a price"],
    vocabulary: [
      v("Un, deux, trois", "One, two, three", "uhn, duh, trwah"),
      v("Quatre, cinq", "Four, five", "KAH-truh, sank"),
      v("Euro", "Euro", "uh-ROH"),
      v("Cher", "Expensive", "SHEHR"),
    ],
    phrases: [
      p("Ça coûte cinq euros.", "It costs five euros.", "sah KOOT sank uh-ROH"),
      p("C'est trop cher !", "It's too expensive!", "seh troh SHEHR"),
    ],
    topics: ["numbers", "prices", "shopping"],
    introMessage: "Bonjour ! Today we'll count in French — un, deux, trois!",
  },
]);

// ─── Japanese ───────────────────────────────────────────────────────────────
const JAPANESE = unit("ja", 1, [
  {
    title: "Greetings",
    description: "Essential Japanese greetings",
    icon: "🙇",
    goals: ["Greet at different times of day", "Say thank you"],
    vocabulary: [
      v("こんにちは", "Hello", "kon-nee-chee-wah"),
      v("おはよう", "Good morning", "oh-hah-yoh"),
      v("こんばんは", "Good evening", "kon-bahn-wah"),
      v("ありがとう", "Thank you", "ah-ree-gah-toh"),
    ],
    phrases: [
      p("お元気ですか？", "How are you?", "oh-GEN-kee dess-kah"),
      p("元気です。", "I'm fine.", "GEN-kee dess"),
    ],
    topics: ["greetings", "politeness", "thanks"],
    introMessage: "こんにちは！ I'm Sally — let's learn your first Japanese greetings!",
  },
  {
    title: "Introductions",
    description: "Introduce yourself politely",
    icon: "🙋",
    goals: ["Say your name", "Use はじめまして"],
    vocabulary: [
      v("はじめまして", "Nice to meet you", "hah-jee-meh-mah-shteh"),
      v("わたしは", "I am (topic)", "wah-tah-shee wah"),
      v("です", "am / is (polite)", "dess"),
      v("よろしく", "Pleased to meet you", "yoh-roh-shee-koo"),
    ],
    phrases: [
      p("わたしはアレックスです。", "I'm Alex.", "wah-tah-shee wah A-rek-koos dess"),
      p("よろしくおねがいします。", "Nice to meet you (polite).", "yoh-roh-shee-koo oh-neh-gai-shee-mass"),
    ],
    topics: ["introductions", "self-introduction", "politeness"],
    introMessage: "はじめまして！ Today you'll introduce yourself in Japanese.",
  },
  {
    title: "At the Café",
    description: "Order a drink in Japanese",
    icon: "🍵",
    goals: ["Order politely", "Ask the price"],
    vocabulary: [
      v("コーヒー", "Coffee", "koh-hee"),
      v("おちゃ", "Tea", "oh-chah"),
      v("ください", "Please (give me)", "koo-dah-sai"),
      v("いくら", "How much", "ee-koo-rah"),
    ],
    phrases: [
      p("コーヒーをください。", "A coffee, please.", "koh-hee oh koo-dah-sai"),
      p("いくらですか？", "How much is it?", "ee-koo-rah dess-kah"),
    ],
    topics: ["ordering", "café", "prices"],
    introMessage: "いらっしゃいませ！ Let's order at a Japanese café.",
  },
  {
    title: "Directions",
    description: "Ask where things are",
    icon: "🧭",
    goals: ["Ask where a place is", "Understand left and right"],
    vocabulary: [
      v("どこ", "Where", "doh-koh"),
      v("えき", "Station", "eh-kee"),
      v("みぎ", "Right", "mee-gee"),
      v("ひだり", "Left", "hee-dah-ree"),
    ],
    phrases: [
      p("えきはどこですか？", "Where is the station?", "eh-kee wah doh-koh dess-kah"),
      p("まっすぐです。", "It's straight ahead.", "mahs-soo-goo dess"),
    ],
    topics: ["directions", "travel", "station"],
    introMessage: "Let's find our way around Tokyo — in Japanese!",
  },
  {
    title: "Numbers",
    description: "Count from one to five",
    icon: "🔢",
    goals: ["Count from one to five", "Say a price in yen"],
    vocabulary: [
      v("いち、に、さん", "One, two, three", "ee-chee, nee, sahn"),
      v("よん、ご", "Four, five", "yohn, goh"),
      v("えん", "Yen", "en"),
      v("たかい", "Expensive", "tah-kai"),
    ],
    phrases: [
      p("ごひゃくえんです。", "It's 500 yen.", "goh-hyah-koo en dess"),
      p("たかいですね。", "That's expensive.", "tah-kai dess neh"),
    ],
    topics: ["numbers", "prices", "yen"],
    introMessage: "いち、に、さん！ Let's count together in Japanese.",
  },
]);

// ─── Korean ─────────────────────────────────────────────────────────────────
const KOREAN = unit("ko", 1, [
  {
    title: "Greetings",
    description: "Say hello in Korean",
    icon: "🙇",
    goals: ["Greet politely", "Say thank you"],
    vocabulary: [
      v("안녕하세요", "Hello (polite)", "an-nyeong-ha-se-yo"),
      v("안녕", "Hi (casual)", "an-nyeong"),
      v("감사합니다", "Thank you", "gam-sa-ham-ni-da"),
      v("네", "Yes", "ne"),
    ],
    phrases: [
      p("잘 지냈어요?", "How have you been?", "jal ji-nae-sseo-yo"),
      p("잘 지냈어요.", "I've been well.", "jal ji-nae-sseo-yo"),
    ],
    topics: ["greetings", "politeness", "thanks"],
    introMessage: "안녕하세요! I'm Sally — let's say hello in Korean!",
  },
  {
    title: "Introductions",
    description: "Introduce yourself in Korean",
    icon: "🙋",
    goals: ["Say your name", "Say nice to meet you"],
    vocabulary: [
      v("저는", "I (topic, polite)", "jeo-neun"),
      v("이에요 / 예요", "am / is", "i-e-yo / ye-yo"),
      v("반갑습니다", "Nice to meet you", "ban-gap-seum-ni-da"),
      v("이름", "Name", "i-reum"),
    ],
    phrases: [
      p("저는 알렉스예요.", "I'm Alex.", "jeo-neun al-lek-seu-ye-yo"),
      p("이름이 뭐예요?", "What's your name?", "i-reu-mi mwo-ye-yo"),
    ],
    topics: ["introductions", "names"],
    introMessage: "반갑습니다! Today you'll introduce yourself in Korean.",
  },
  {
    title: "At the Café",
    description: "Order a drink in Korean",
    icon: "☕",
    goals: ["Order politely", "Ask the price"],
    vocabulary: [
      v("커피", "Coffee", "keo-pi"),
      v("물", "Water", "mul"),
      v("주세요", "Please give me", "ju-se-yo"),
      v("얼마예요?", "How much is it?", "eol-ma-ye-yo"),
    ],
    phrases: [
      p("커피 주세요.", "A coffee, please.", "keo-pi ju-se-yo"),
      p("이거 얼마예요?", "How much is this?", "i-geo eol-ma-ye-yo"),
    ],
    topics: ["ordering", "café"],
    introMessage: "어서 오세요! Let's order at a café in Seoul.",
  },
  {
    title: "Directions",
    description: "Ask for directions",
    icon: "🧭",
    goals: ["Ask where a place is", "Understand left and right"],
    vocabulary: [
      v("어디", "Where", "eo-di"),
      v("역", "Station", "yeok"),
      v("오른쪽", "Right", "o-reun-jjok"),
      v("왼쪽", "Left", "oen-jjok"),
    ],
    phrases: [
      p("역이 어디예요?", "Where is the station?", "yeo-gi eo-di-ye-yo"),
      p("저기예요.", "It's over there.", "jeo-gi-ye-yo"),
    ],
    topics: ["directions", "travel"],
    introMessage: "Let's find our way around Seoul in Korean!",
  },
  {
    title: "Numbers",
    description: "Sino-Korean numbers one to five",
    icon: "🔢",
    goals: ["Count from one to five", "Understand a price in won"],
    vocabulary: [
      v("일, 이, 삼", "One, two, three", "il, i, sam"),
      v("사, 오", "Four, five", "sa, o"),
      v("원", "Won", "won"),
      v("비싸요", "It's expensive", "bi-ssa-yo"),
    ],
    phrases: [
      p("오천 원이에요.", "It's 5,000 won.", "o-cheon wo-ni-e-yo"),
      p("너무 비싸요!", "Too expensive!", "neo-mu bi-ssa-yo"),
    ],
    topics: ["numbers", "prices"],
    introMessage: "일, 이, 삼! Let's count in Korean together.",
  },
]);

// ─── German ─────────────────────────────────────────────────────────────────
const GERMAN = unit("de", 1, [
  {
    title: "Greetings",
    description: "Say hello and goodbye in German",
    icon: "👋",
    goals: ["Greet someone", "Say goodbye"],
    vocabulary: [
      v("Hallo", "Hello", "HAH-loh"),
      v("Guten Morgen", "Good morning", "GOO-ten MOR-gen"),
      v("Tschüss", "Bye", "chüss"),
      v("Danke", "Thank you", "DAHN-kuh"),
    ],
    phrases: [
      p("Wie geht's?", "How are you?", "vee GAYTS"),
      p("Mir geht's gut, danke.", "I'm fine, thanks.", "meer gayts GOOT DAHN-kuh"),
    ],
    topics: ["greetings", "farewells"],
    introMessage: "Hallo! I'm Sally — let's start with German greetings!",
  },
  {
    title: "Introductions",
    description: "Introduce yourself in German",
    icon: "🙋",
    goals: ["Say your name", "Say where you're from"],
    vocabulary: [
      v("Ich heiße", "My name is", "ikh HY-suh"),
      v("Ich komme aus", "I come from", "ikh KOM-uh ows"),
      v("Freut mich", "Nice to meet you", "froyt mikh"),
      v("Ich bin", "I am", "ikh bin"),
    ],
    phrases: [
      p("Wie heißt du?", "What's your name?", "vee HYST doo"),
      p("Woher kommst du?", "Where are you from?", "voh-HAIR komst doo"),
    ],
    topics: ["introductions", "origin"],
    introMessage: "Hallo nochmal! Let's introduce ourselves in German.",
  },
  {
    title: "Im Café",
    description: "Order at a German café",
    icon: "☕",
    goals: ["Order a drink", "Pay the bill"],
    vocabulary: [
      v("Einen Kaffee", "A coffee", "EYE-nen KAH-feh"),
      v("Wasser", "Water", "VAH-ser"),
      v("Bitte", "Please", "BIT-uh"),
      v("Die Rechnung", "The bill", "dee REKH-noong"),
    ],
    phrases: [
      p("Ich hätte gern einen Kaffee.", "I'd like a coffee.", "ikh HET-uh gairn EYE-nen KAH-feh"),
      p("Was kostet das?", "How much is that?", "vahs KOS-tet dahs"),
    ],
    topics: ["ordering", "café"],
    introMessage: "Willkommen im Café! Let's order in German.",
  },
  {
    title: "Directions",
    description: "Find your way in German",
    icon: "🧭",
    goals: ["Ask where something is", "Understand left and right"],
    vocabulary: [
      v("Wo ist…?", "Where is…?", "voh ist"),
      v("Links", "Left", "links"),
      v("Rechts", "Right", "rekhts"),
      v("Geradeaus", "Straight ahead", "geh-RAH-deh-ows"),
    ],
    phrases: [
      p("Wo ist der Bahnhof?", "Where is the station?", "voh ist dair BAHN-hohf"),
      p("Es ist nicht weit.", "It's not far.", "es ist nikht VYT"),
    ],
    topics: ["directions", "travel"],
    introMessage: "Los geht's! Let's learn directions in German.",
  },
  {
    title: "Numbers",
    description: "Count and talk about prices",
    icon: "🔢",
    goals: ["Count from one to five", "Understand a price"],
    vocabulary: [
      v("Eins, zwei, drei", "One, two, three", "eyns, tsvy, dry"),
      v("Vier, fünf", "Four, five", "feer, fünf"),
      v("Euro", "Euro", "OY-roh"),
      v("Teuer", "Expensive", "TOY-er"),
    ],
    phrases: [
      p("Das kostet fünf Euro.", "That costs five euros.", "dahs KOS-tet fünf OY-roh"),
      p("Das ist zu teuer!", "That's too expensive!", "dahs ist tsoo TOY-er"),
    ],
    topics: ["numbers", "prices"],
    introMessage: "Eins, zwei, drei! Let's count in German.",
  },
]);

// ─── Mandarin Chinese ───────────────────────────────────────────────────────
const CHINESE = unit("zh", 1, [
  {
    title: "Greetings",
    description: "Say hello in Mandarin",
    icon: "👋",
    goals: ["Greet someone", "Say thank you"],
    vocabulary: [
      v("你好", "Hello", "nǐ hǎo"),
      v("早上好", "Good morning", "zǎo shang hǎo"),
      v("再见", "Goodbye", "zài jiàn"),
      v("谢谢", "Thank you", "xiè xie"),
    ],
    phrases: [
      p("你好吗？", "How are you?", "nǐ hǎo ma"),
      p("我很好，谢谢。", "I'm fine, thanks.", "wǒ hěn hǎo, xiè xie"),
    ],
    topics: ["greetings", "tones", "thanks"],
    introMessage: "你好！ I'm Sally — let's say hello in Mandarin!",
  },
  {
    title: "Introductions",
    description: "Introduce yourself in Mandarin",
    icon: "🙋",
    goals: ["Say your name", "Ask someone's name"],
    vocabulary: [
      v("我叫", "My name is", "wǒ jiào"),
      v("我是", "I am", "wǒ shì"),
      v("认识你很高兴", "Nice to meet you", "rèn shi nǐ hěn gāo xìng"),
      v("名字", "Name", "míng zi"),
    ],
    phrases: [
      p("你叫什么名字？", "What's your name?", "nǐ jiào shén me míng zi"),
      p("我叫亚历克斯。", "My name is Alex.", "wǒ jiào yà lì kè sī"),
    ],
    topics: ["introductions", "names"],
    introMessage: "你好！ Today you'll introduce yourself in Mandarin.",
  },
  {
    title: "At the Café",
    description: "Order a drink in Mandarin",
    icon: "🍵",
    goals: ["Order a drink", "Ask the price"],
    vocabulary: [
      v("咖啡", "Coffee", "kā fēi"),
      v("茶", "Tea", "chá"),
      v("我要", "I want", "wǒ yào"),
      v("多少钱", "How much", "duō shǎo qián"),
    ],
    phrases: [
      p("我要一杯咖啡。", "I want a cup of coffee.", "wǒ yào yì bēi kā fēi"),
      p("多少钱？", "How much is it?", "duō shǎo qián"),
    ],
    topics: ["ordering", "café", "prices"],
    introMessage: "欢迎！ Let's order a drink in Mandarin.",
  },
  {
    title: "Directions",
    description: "Ask where things are",
    icon: "🧭",
    goals: ["Ask where a place is", "Understand left and right"],
    vocabulary: [
      v("在哪儿", "Where is", "zài nǎr"),
      v("地铁站", "Metro station", "dì tiě zhàn"),
      v("左边", "Left side", "zuǒ bian"),
      v("右边", "Right side", "yòu bian"),
    ],
    phrases: [
      p("地铁站在哪儿？", "Where is the metro station?", "dì tiě zhàn zài nǎr"),
      p("一直走。", "Go straight ahead.", "yì zhí zǒu"),
    ],
    topics: ["directions", "travel"],
    introMessage: "Let's find our way around Beijing in Mandarin!",
  },
  {
    title: "Numbers",
    description: "Count from one to five",
    icon: "🔢",
    goals: ["Count from one to five", "Understand a price"],
    vocabulary: [
      v("一、二、三", "One, two, three", "yī, èr, sān"),
      v("四、五", "Four, five", "sì, wǔ"),
      v("块", "Yuan (spoken)", "kuài"),
      v("太贵了", "Too expensive", "tài guì le"),
    ],
    phrases: [
      p("五块钱。", "Five yuan.", "wǔ kuài qián"),
      p("便宜一点吧。", "A bit cheaper, please.", "pián yi yì diǎn ba"),
    ],
    topics: ["numbers", "tones", "prices"],
    introMessage: "一、二、三！ Let's count in Mandarin together.",
  },
]);

export const LESSONS: Lesson[] = [
  ...SPANISH,
  ...FRENCH,
  ...JAPANESE,
  ...KOREAN,
  ...GERMAN,
  ...CHINESE,
];

export function getLesson(id: string | undefined): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getLessonsForUnit(unitId: string): Lesson[] {
  return LESSONS.filter((l) => l.unitId === unitId).sort((a, b) => a.order - b.order);
}

export function getLessonsForLanguage(code: LanguageCode): Lesson[] {
  return LESSONS.filter((l) => l.languageCode === code);
}
