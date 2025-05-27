document.addEventListener('DOMContentLoaded', () => {
    // Firebase 設定值
    const firebaseConfig = {
        apiKey: "AIzaSyCQ_gmcJKkbvWYXL6kDTBD7H1OqqN5sXTI",
        authDomain: "project-3996583197570756922.firebaseapp.com",
        databaseURL: "https://project-3996583197570756922-default-rtdb.firebaseio.com",
        projectId: "project-3996583197570756922",
        storageBucket: "project-3996583197570756922.firebasestorage.app",
        messagingSenderId: "955712813983",
        appId: "1:955712813983:web:26c173ee96656071165baa",
        measurementId: "G-KFVLR64E7C"
    };

    // 初始化 Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const scoresRef = database.ref('leaderboard_scores'); // 儲存分數的節點，可以命名為'leaderboard_scores'

    // DOM 元素
    const gameScreen = document.getElementById('game-screen');
    const levelCompleteScreen = document.getElementById('level-complete-screen');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options');
    const startChallengeBtn = document.getElementById('start-challenge-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const explanationContainer = document.getElementById('explanation-container');
    const explanationText = document.getElementById('explanation-text');
    const exampleSentence = document.getElementById('example-sentence');
    const feedbackMessage = document.getElementById('feedback');
    const finalScoreSpan = document.getElementById('final-score');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const homeBtn = document.getElementById('home-btn');
    const timerDisplay = document.getElementById('timer-display');
    const scoreDisplay = document.getElementById('score-display');
    const finalTimeSpan = document.getElementById('final-time');
    const playerNameInput = document.getElementById('playerName');
    const submitScoreButton = document.getElementById('submitScoreButton');
    const submissionFeedback = document.getElementById('submission-feedback');
    const restartGameButton = document.getElementById('restartGameButton');
    const leaderboardList = document.getElementById('leaderboard-list');

    let currentQuestionIndex = 0;
    let score = 0;
    let timer = 0;
    let timerInterval;
    let questionsForCurrentGame = []; // 儲存當前遊戲的題目

    // 題目資料 (來自你的 script.js)
    const questions = [
        {
            idiom: "畫蛇添足",
            question: "「畫蛇添足」的意思是什麼？",
            options: [
                { text: "多此一舉，反而不好", isCorrect: true },
                { text: "錦上添花", isCorrect: false },
                { text: "畫出栩栩如生的蛇", isCorrect: false },
                { text: "非常謹慎小心", isCorrect: false }
            ],
            explanation: "畫蛇添足 (huà shé tiān zú)：比喻多此一舉，反而不好。",
            example: "這份企劃書已經很完善了，你再加那些不必要的內容，簡直是畫蛇添足。"
        },
        {
            idiom: "一目了然",
            question: "下列哪個情境可以用「一目了然」來形容？",
            options: [
                { text: "文件雜亂無章，難以閱讀", isCorrect: false },
                { text: "報告內容清晰明瞭，一看就懂", isCorrect: true },
                { text: "夜晚的星空，閃爍不定", isCorrect: false },
                { text: "考試題目非常複雜，思考很久", isCorrect: false }
            ],
            explanation: "一目了然 (yī mù liǎo rán)：一眼就看得很清楚。形容事物、文章條理分明，容易看懂。",
            example: "這張圖表設計得很好，數據變化一目了然。"
        },
        {
            idiom: "杯弓蛇影",
            question: "「杯弓蛇影」指的是什麼樣的心態？",
            options: [
                { text: "勇敢面對困難", isCorrect: false },
                { text: "過於自信", isCorrect: false },
                { text: "疑神疑鬼，自相驚擾", isCorrect: true },
                { text: "樂觀開朗", isCorrect: false }
            ],
            explanation: "杯弓蛇影 (bēi gōng shé yǐng)：比喻疑神疑鬼，妄自驚擾。",
            example: "只是樹影晃動，他卻杯弓蛇影，以為有人在外面偷窺。"
        },
        {
            idiom: "刻舟求劍",
            question: "「刻舟求劍」諷刺的是哪種行為？",
            options: [
                { text: "不變通、墨守成規", isCorrect: true },
                { text: "努力不懈追求目標", isCorrect: false },
                { text: "做事考慮周全", isCorrect: false },
                { text: "善於創新改變", isCorrect: false }
            ],
            explanation: "刻舟求劍 (kè zhōu qiú jiàn)：比喻拘泥成例，不知變通。",
            example: "現代科技日新月異，如果還用老方法解決問題，簡直是刻舟求劍。"
        },
        {
            idiom: "掩耳盜鈴",
            question: "「掩耳盜鈴」最適合用來形容下列哪種行為？",
            options: [
                { text: "自欺欺人", isCorrect: true },
                { text: "聰明機智", isCorrect: false },
                { text: "膽大妄為", isCorrect: false },
                { text: "為民除害", isCorrect: false }
            ],
            explanation: "掩耳盜鈴 (yǎn ěr dào líng)：比喻欺騙自己，以為別人也不知道。",
            example: "他以為只要裝作不知道，就沒人會發現他犯的錯誤，真是掩耳盜鈴。"
        },
        {
            idiom: "狐假虎威",
            question: "成語「狐假虎威」指的是什麼？",
            options: [
                { text: "狐狸很狡猾", isCorrect: false },
                { text: "藉著有權者的威勢去欺壓別人", isCorrect: true },
                { text: "老虎被狐狸欺騙了", isCorrect: false },
                { text: "狐狸和老虎是好朋友", isCorrect: false }
            ],
            explanation: "狐假虎威 (hú jiǎ hǔ wēi)：比喻藉著有權者的威勢去欺壓別人。",
            example: "那個人仗著老闆的勢力，在公司裡狐假虎威，搞得大家怨聲載道。"
        },
        {
            idiom: "井底之蛙",
            question: "「井底之蛙」形容一個人怎樣？",
            options: [
                { text: "見識淺薄，眼界狹窄", isCorrect: true },
                { text: "生活在鄉村", isCorrect: false },
                { text: "喜歡獨處", isCorrect: false },
                { text: "很聰明", isCorrect: false }
            ],
            explanation: "井底之蛙 (jǐng dǐ zhī wā)：比喻見識淺薄，眼界狹窄的人。",
            example: "他從來不出門，對外面的世界一無所知，真是個井底之蛙。"
        },
        {
            idiom: "葉公好龍",
            question: "「葉公好龍」主要在諷刺什麼？",
            options: [
                { text: "對某事表面上愛好，實際卻害怕", isCorrect: true },
                { text: "非常喜歡龍", isCorrect: false },
                { text: "精通繪畫藝術", isCorrect: false },
                { text: "勇於面對挑戰", isCorrect: false }
            ],
            explanation: "葉公好龍 (yè gōng hào lóng)：比喻口頭上說喜歡，實際卻害怕或厭惡。",
            example: "他總是說自己喜歡挑戰，但一遇到困難就退縮，根本是葉公好龍。"
        },
        {
            idiom: "對牛彈琴",
            question: "當你向不理解的人講述高深的道理時，可以用哪個成語來形容？",
            options: [
                { text: "言簡意賅", isCorrect: false },
                { text: "對牛彈琴", isCorrect: true },
                { text: "一針見血", isCorrect: false },
                { text: "循循善誘", isCorrect: false }
            ],
            explanation: "對牛彈琴 (duì niú tán qín)：比喻對不懂道理的人講道理，白費力氣。",
            example: "我跟她解釋了半天，她還是不明白，真是對牛彈琴。"
        },
        {
            idiom: "囫圇吞棗",
            question: "「囫圇吞棗」比喻學習時怎樣？",
            options: [
                { text: "仔細研究，深入理解", isCorrect: false },
                { text: "不求甚解，籠統含糊", isCorrect: true },
                { text: "快速記憶，效率很高", isCorrect: false },
                { text: "勇於嘗試新事物", isCorrect: false }
            ],
            explanation: "囫圇吞棗 (hú lún tūn zǎo)：比喻讀書或理解事物時，不求甚解，籠統含糊地接受。",
            example: "他讀書總是囫圇吞棗，所以考試成績一直不理想。"
        },
        {
            idiom: "守株待兔",
            question: "「守株待兔」指的是什麼樣的行為？",
            options: [
                { text: "積極主動，勇於開拓", isCorrect: false },
                { text: "等待機會，不勞而獲", isCorrect: true },
                { text: "勤勞耕作，自食其力", isCorrect: false },
                { text: "墨守成規，不知變通", isCorrect: false }
            ],
            explanation: "守株待兔 (shǒu zhū dài tù)：比喻拘泥守舊，不知變通，或存僥倖心理，妄想不勞而獲。",
            example: "只會守株待兔，不積極尋找客戶，公司業績怎麼會好？"
        },
        {
            idiom: "黔驢技窮",
            question: "「黔驢技窮」形容的是什麼狀況？",
            options: [
                { text: "能力有限，沒有辦法了", isCorrect: true },
                { text: "驢子的技術高超", isCorrect: false },
                { text: "財產散盡，一無所有", isCorrect: false },
                { text: "面臨困境，仍能堅持", isCorrect: false }
            ],
            explanation: "黔驢技窮 (qián lǘ jì qióng)：比喻有限的技能已經用完，再也無計可施了。",
            example: "對手使出渾身解數，但最終還是黔驢技窮，被我們擊敗了。"
        },
        {
            idiom: "塞翁失馬",
            question: "「塞翁失馬」告訴我們什麼道理？",
            options: [
                { text: "世事變化無常，福禍難料", isCorrect: true },
                { text: "要珍惜所擁有的", isCorrect: false },
                { text: "不要輕易放棄希望", isCorrect: false },
                { text: "凡事都要小心謹慎", isCorrect: false }
            ],
            explanation: "塞翁失馬 (sài wēng shī mǎ)：比喻禍福無常，壞事可能變成好事，好事也可能變成壞事。",
            example: "雖然這次比賽失利，但塞翁失馬，焉知非福，說不定能從中學到更多。"
        },
        {
            idiom: "愚公移山",
            question: "「愚公移山」主要強調什麼精神？",
            options: [
                { text: "聰明才智，巧妙解決問題", isCorrect: false },
                { text: "持之以恆，有毅力", isCorrect: true },
                { text: "不自量力，徒勞無功", isCorrect: false },
                { text: "順應自然，不強求", isCorrect: false }
            ],
            explanation: "愚公移山 (yú gōng yí shān)：比喻只要有堅韌的毅力，即使再大的困難也可以克服。",
            example: "只要我們有愚公移山的精神，再大的困難也能克服。"
        },
        {
            idiom: "邯鄲學步",
            question: "「邯鄲學步」諷刺的是哪種行為？",
            options: [
                { text: "虛心學習，精益求精", isCorrect: false },
                { text: "盲目模仿，失去自我", isCorrect: true },
                { text: "勇於創新，獨樹一幟", isCorrect: false },
                { text: "腳踏實地，穩步前進", isCorrect: false }
            ],
            explanation: "邯鄲學步 (hán dān xué bù)：比喻模仿別人不成，反而把自己的本來面目也丟掉了。",
            example: "他想模仿名人的穿著，結果邯鄲學步，反而顯得不倫不類。"
        },
        {
            idiom: "亡羊補牢",
            question: "「亡羊補牢」的意思是什麼？",
            options: [
                { text: "迷途知返，為時已晚", isCorrect: false },
                { text: "事情發生後，及時彌補過失", isCorrect: true },
                { text: "未雨綢繆，防患未然", isCorrect: false },
                { text: "掩蓋錯誤，不承認", isCorrect: false }
            ],
            explanation: "亡羊補牢 (wáng yáng bǔ láo)：羊丟失了再去修補羊圈。比喻出了問題以後，及時想辦法補救，可以防止繼續受損失。",
            example: "雖然這次專案失敗了，但亡羊補牢，為時未晚，我們還有機會扭轉局面。"
        },
        {
            idiom: "濫竽充數",
            question: "「濫竽充數」用來形容什麼樣的人？",
            options: [
                { text: "才華洋溢，能力出眾", isCorrect: false },
                { text: "沒有真才實學，混在其中", isCorrect: true },
                { text: "謙虛好學，不恥下問", isCorrect: false },
                { text: "兢兢業業，認真負責", isCorrect: false }
            ],
            explanation: "濫竽充數 (làn yú chōng shù)：比喻沒有真才實學的人，混在行家裡充數。",
            example: "他根本不懂音樂，卻在樂隊裡濫竽充數，真讓人替他捏把冷汗。"
        },
        {
            idiom: "買櫝還珠",
            question: "「買櫝還珠」是在諷刺什麼？",
            options: [
                { text: "識貨之人，懂得珍貴", isCorrect: false },
                { text: "捨本逐末，不識貨", isCorrect: true },
                { text: "精打細算，物超所值", isCorrect: false },
                { text: "愛不釋手，珍藏寶物", isCorrect: false }
            ],
            explanation: "買櫝還珠 (mǎi dú huán zhū)：比喻捨本逐末，取捨失當。",
            example: "他買了昂貴的包裝盒，卻把裡面的鑽石丟了，簡直是買櫝還珠。"
        },
        {
            idiom: "鷸蚌相爭",
            question: "「鷸蚌相爭」的結果通常是什麼？",
            options: [
                { text: "雙方合作，共創雙贏", isCorrect: false },
                { text: "兩敗俱傷，讓第三者獲利", isCorrect: true },
                { text: "一方勝利，一方失敗", isCorrect: false },
                { text: "和平共處，互不干涉", isCorrect: false }
            ],
            explanation: "鷸蚌相爭 (yù bàng xiāng zhēng)：比喻兩個人或兩方相持不下，爭鬥不休，結果兩敗俱傷，讓第三者得到好處。",
            example: "兩家公司為了搶奪市場份額，鷸蚌相爭，最後卻讓新興公司趁虛而入。"
        },
        {
            idiom: "坐井觀天",
            question: "「坐井觀天」與哪個成語意思相近？",
            options: [
                { text: "高瞻遠矚", isCorrect: false },
                { text: "井底之蛙", isCorrect: true },
                { text: "見多識廣", isCorrect: false },
                { text: "大開眼界", isCorrect: false }
            ],
            explanation: "坐井觀天 (zuò jǐng guān tiān)：坐在井裡看天。比喻眼界狹窄，見識短淺。",
            example: "如果你只待在家裡，就好像坐井觀天一樣，永遠無法了解外面的世界。"
        },
        {
            idiom: "自相矛盾",
            question: "「自相矛盾」形容的是什麼情況？",
            options: [
                { text: "言行一致，表裡如一", isCorrect: false },
                { text: "前後說法或行為互相抵觸", isCorrect: true },
                { text: "意見相同，達成共識", isCorrect: false },
                { text: "靈活變通，隨機應變", isCorrect: false }
            ],
            explanation: "自相矛盾 (zì xiāng máo dùn)：比喻言語或行為前後不一致，互相抵觸。",
            example: "他一下說要減肥，一下又大吃大喝，真是自相矛盾。"
        },
        {
            idiom: "畫餅充飢",
            question: "「畫餅充飢」比喻什麼？",
            options: [
                { text: "實事求是，腳踏實地", isCorrect: false },
                { text: "空想不能解決實際問題", isCorrect: true },
                { text: "望梅止渴，自欺欺人", isCorrect: false },
                { text: "豐富想像力，充滿創意", isCorrect: false }
            ],
            explanation: "畫餅充飢 (huà bǐng chōng jī)：畫個餅來充飢。比喻用空想來安慰自己，不能解決實際問題。",
            example: "光靠口頭上的承諾，根本是畫餅充飢，不能解決我們現在的困境。"
        },
        {
            idiom: "緣木求魚",
            question: "「緣木求魚」是指什麼樣的行為？",
            options: [
                { text: "腳踏實地，按部就班", isCorrect: false },
                { text: "方法錯誤，徒勞無功", isCorrect: true },
                { text: "事半功倍，效率極高", isCorrect: false },
                { text: "鍥而不捨，堅持到底", isCorrect: false }
            ],
            explanation: "緣木求魚 (yuán mù qiú yú)：爬到樹上去找魚。比喻方向或方法錯誤，不可能達到目的。",
            example: "想要不勞而獲，只靠投機取巧，簡直是緣木求魚。"
        },
        {
            idiom: "一竅不通",
            question: "「一竅不通」形容一個人怎樣？",
            options: [
                { text: "精通各種學問", isCorrect: false },
                { text: "完全不懂，一無所知", isCorrect: true },
                { text: "融會貫通，舉一反三", isCorrect: false },
                { text: "謙虛好學，不懂就問", isCorrect: false }
            ],
            explanation: "一竅不通 (yī qiào bù tōng)：比喻對某事完全不懂，一無所知。",
            example: "他對電腦方面一竅不通，所以需要別人協助。"
        },
        {
            idiom: "胸有成竹",
            question: "「胸有成竹」是指什麼？",
            options: [
                { text: "心中有明確的計畫或主意", isCorrect: true },
                { text: "胸部有竹子的紋身", isCorrect: false },
                { text: "心胸寬廣，像竹子一樣高潔", isCorrect: false },
                { text: "對竹子情有獨鍾", isCorrect: false }
            ],
            explanation: "胸有成竹 (xiōng yǒu chéng zhú)：比喻在事前已有了充分的準備和把握，或心中已有了主意。",
            example: "面對這次重要的演講，他胸有成竹，絲毫不見緊張。"
        },
        {
            idiom: "捨本逐末",
            question: "「捨本逐末」最能形容哪種行為？",
            options: [
                { text: "專注核心，把握重點", isCorrect: false },
                { text: "放棄根本，追求枝微末節", isCorrect: true },
                { text: "顧全大局，深思熟慮", isCorrect: false },
                { text: "未雨綢繆，防患未然", isCorrect: false }
            ],
            explanation: "捨本逐末 (shě běn zhú mò)：比喻不顧根本，只求枝節。",
            example: "如果只追求表面功夫，卻忽略了核心問題，那就是捨本逐末。"
        },
        {
            idiom: "聲東擊西",
            question: "「聲東擊西」是指什麼策略？",
            options: [
                { text: "正面進攻，堂堂正正", isCorrect: false },
                { text: "虛張聲勢，分散對方注意，實則從另一方進攻", isCorrect: true },
                { text: "固守陣地，以不變應萬變", isCorrect: false },
                { text: "誘敵深入，設下陷阱", isCorrect: false }
            ],
            explanation: "聲東擊西 (shēng dōng jí xī)：比喻聲勢虛張，分散對方注意，實則從另一方進攻。",
            example: "敵軍聲東擊西，讓我們誤以為他們會從東邊進攻，結果卻從西邊突破防線。"
        },
        {
            idiom: "洛陽紙貴",
            question: "「洛陽紙貴」形容什麼現象？",
            options: [
                { text: "紙張價格昂貴", isCorrect: false },
                { text: "某部作品受到歡迎，搶購一空", isCorrect: true },
                { text: "洛陽的文化氣息濃厚", isCorrect: false },
                { text: "人們對紙張的需求量大增", isCorrect: false }
            ],
            explanation: "洛陽紙貴 (luò yáng zhī guì)：晉代左思的〈三都賦〉寫成後，一時傳播很廣，人們爭相抄寫，洛陽的紙張也因此而漲價。後比喻著作風行一時，流傳很廣。",
            example: "這本小說一上市就造成洛陽紙貴的盛況，可見其受歡迎的程度。"
        },
        {
            idiom: "投鼠忌器",
            question: "「投鼠忌器」是指什麼樣的顧慮？",
            options: [
                { text: "害怕得罪人", isCorrect: false },
                { text: "做事顧慮重重，怕傷害到某些人或事", isCorrect: true },
                { text: "膽小怕事，不敢行動", isCorrect: false },
                { text: "害怕失敗，不敢嘗試", isCorrect: false }
            ],
            explanation: "投鼠忌器 (tóu shǔ jì qì)：想打老鼠卻擔心打破了旁邊的器具。比喻想要懲罰壞人，卻又顧忌牽連無辜的人或事。",
            example: "對於他犯的錯誤，我們投鼠忌器，因為擔心影響到整個團隊的運作。"
        },
        {
            idiom: "臥薪嚐膽",
            question: "「臥薪嚐膽」形容什麼樣的精神？",
            options: [
                { text: "安於現狀，不思進取", isCorrect: false },
                { text: "刻苦自勵，奮發圖強", isCorrect: true },
                { text: "享樂主義，揮霍無度", isCorrect: false },
                { text: "隨遇而安，與世無爭", isCorrect: false }
            ],
            explanation: "臥薪嚐膽 (wò xīn cháng dǎn)：比喻刻苦自勵，奮發圖強。",
            example: "他為了東山再起，臥薪嚐膽，終於成功了。"
        },
        {
            idiom: "口若懸河",
            question: "「口若懸河」形容一個人怎樣？",
            options: [
                { text: "不善言辭，沉默寡言", isCorrect: false },
                { text: "口才便給，能言善道", isCorrect: true },
                { text: "說話含糊不清，語無倫次", isCorrect: false },
                { text: "言辭簡潔，一針見血", isCorrect: false }
            ],
            explanation: "口若懸河 (kǒu ruò xuán hé)：形容人說話滔滔不絕，猶如瀑布傾瀉而下。",
            example: "他的口才極佳，辯論時總是口若懸河，讓對手難以招架。"
        },
        {
            idiom: "一鳴驚人",
            question: "「一鳴驚人」形容什麼情況？",
            options: [
                { text: "初次展現才華，就獲得巨大成功", isCorrect: true },
                { text: "默默無聞，不求表現", isCorrect: false },
                { text: "平庸無奇，毫無建樹", isCorrect: false },
                { text: "聲音響亮，震耳欲聾", isCorrect: false }
            ],
            explanation: "一鳴驚人 (yī míng jīng rén)：比喻平時沒有突出的表現，一旦施展才華，就能夠做出驚人的成就。",
            example: "他平時不顯山露水，沒想到這次比賽一鳴驚人，奪得冠軍。"
        },
        {
            idiom: "入木三分",
            question: "「入木三分」最常用來形容什麼？",
            options: [
                { text: "書法筆力遒勁", isCorrect: false },
                { text: "木材堅硬不易雕刻", isCorrect: false },
                { text: "思考問題深入透徹", isCorrect: true }, // 更強調延伸義
                { text: "文字寫作簡潔有力", isCorrect: false }
            ],
            explanation: "入木三分 (rù mù sān fēn)：本形容筆力遒勁。後比喻分析問題深刻透徹，或描寫、議論入木三分。",
            example: "他的文章對社會問題分析得入木三分，令人佩服。"
        },
        {
            idiom: "水落石出",
            question: "「水落石出」比喻什麼？",
            options: [
                { text: "水勢退去，石頭顯露出來", isCorrect: false },
                { text: "事情真相大白，所有謎團都解開了", isCorrect: true },
                { text: "困難重重，前途渺茫", isCorrect: false },
                { text: "自然風景優美，令人心曠神怡", isCorrect: false }
            ],
            explanation: "水落石出 (shuǐ luò shí chū)：比喻事情的真相終於顯現出來。",
            example: "經過警方鍥而不捨的追查，終於讓整起案件水落石出。"
        },
        {
            idiom: "望梅止渴",
            question: "「望梅止渴」形容什麼？",
            options: [
                { text: "實際行動，解決問題", isCorrect: false },
                { text: "用空想或假象來安慰自己", isCorrect: true },
                { text: "面對困難，勇往直前", isCorrect: false },
                { text: "未雨綢繆，提前準備", isCorrect: false }
            ],
            explanation: "望梅止渴 (wàng méi zhǐ kě)：看著梅子來止渴。比喻用空想來安慰自己。",
            example: "光靠望梅止渴是沒有用的，我們必須付諸行動才能解決問題。"
        },
        {
            idiom: "百聞不如一見",
            question: "「百聞不如一見」強調什麼？",
            options: [
                { text: "道聽塗說不可信", isCorrect: false },
                { text: "親身經歷比聽聞更重要", isCorrect: true },
                { text: "多聽多看有益無害", isCorrect: false },
                { text: "知識學習的廣度", isCorrect: false }
            ],
            explanation: "百聞不如一見 (bǎi wén bù rú yī jiàn)：聽到一百次不如親自見到一次。比喻親身經驗比聽聞更為真確。",
            example: "這個地方的美景真是百聞不如一見，親自來到這裡才感受到它的魅力。"
        },
        {
            idiom: "開源節流",
            question: "「開源節流」是指什麼？",
            options: [
                { text: "增加收入，減少支出", isCorrect: true },
                { text: "開採水源，節約用電", isCorrect: false },
                { text: "拓寬思路，減少困擾", isCorrect: false },
                { text: "創造財富，廣結善緣", isCorrect: false }
            ],
            explanation: "開源節流 (kāi yuán jié liú)：比喻增加收入，節省開支。",
            example: "公司要發展，除了開源，更要懂得節流，才能永續經營。"
        },
        {
            idiom: "指鹿為馬",
            question: "「指鹿為馬」比喻什麼？",
            options: [
                { text: "分辨是非，明辨善惡", isCorrect: false },
                { text: "故意顛倒黑白，混淆是非", isCorrect: true },
                { text: "對事物有獨到見解", isCorrect: false },
                { text: "嚴謹考證，實事求是", isCorrect: false }
            ],
            explanation: "指鹿為馬 (zhǐ lù wéi mǎ)：比喻故意顛倒黑白，混淆是非。",
            example: "他明知道是錯的，卻還指鹿為馬，企圖欺騙大家。"
        },
        {
            idiom: "南轅北轍",
            question: "「南轅北轍」形容什麼情況？",
            options: [
                { text: "目標明確，方向一致", isCorrect: false },
                { text: "行動與目的背道而馳", isCorrect: true },
                { text: "方向感強，不會迷路", isCorrect: false },
                { text: "艱辛跋涉，長途跋涉", isCorrect: false }
            ],
            explanation: "南轅北轍 (nán yuán běi chè)：比喻行動與目的背道而馳。",
            example: "你想要學好英文，卻整天打電動，這根本是南轅北轍。"
        },
        {
            idiom: "一敗塗地",
            question: "「一敗塗地」形容什麼樣的失敗？",
            options: [
                { text: "小挫折，仍有機會", isCorrect: false },
                { text: "徹底失敗，無法挽回", isCorrect: true },
                { text: "經歷失敗，從中學習", isCorrect: false },
                { text: "險勝，僥倖成功", isCorrect: false }
            ],
            explanation: "一敗塗地 (yī bài tú dì)：形容失敗得很慘，澈底地失敗。",
            example: "這次投資失敗，讓他一敗塗地，幾乎失去所有財產。"
        },
        {
            idiom: "拋磚引玉",
            question: "「拋磚引玉」的意思是什麼？",
            options: [
                { text: "丟棄不值錢的磚頭，換取珍貴的玉石", isCorrect: false },
                { text: "先發表粗淺的意見，引出別人高明的見解", isCorrect: true },
                { text: "投機取巧，不勞而獲", isCorrect: false },
                { text: "自謙之詞，表示自己的學識淺薄", isCorrect: false }
            ],
            explanation: "拋磚引玉 (pāo zhuān yǐn yù)：比喻先提出粗淺的意見，以引發別人高明的見解。",
            example: "我先拋磚引玉，提出一些看法，希望能引發大家更多的討論。"
        },
        {
            idiom: "對症下藥",
            question: "「對症下藥」比喻什麼？",
            options: [
                { text: "盲目嘗試，隨意處理", isCorrect: false },
                { text: "找出問題的根源，並採取有效的解決方法", isCorrect: true },
                { text: "病急亂投醫，沒有章法", isCorrect: false },
                { text: "敷衍了事，不求甚解", isCorrect: false }
            ],
            explanation: "對症下藥 (duì zhèng xià yào)：比喻針對病症用藥。後比喻針對問題的根源，採取有效的措施。",
            example: "要解決公司的問題，必須對症下藥，找出真正的癥結所在。"
        },
        {
            idiom: "如魚得水",
            question: "「如魚得水」形容什麼？",
            options: [
                { text: "陷入困境，難以自拔", isCorrect: false },
                { text: "處於有利的環境，能充分發揮才能", isCorrect: true },
                { text: "離鄉背井，感到不適應", isCorrect: false },
                { text: "固步自封，不思進取", isCorrect: false }
            ],
            explanation: "如魚得水 (rú yú dé shuǐ)：比喻得到和自己很投合的人，或很適合自己發展的環境。",
            example: "他在這個新職位上如魚得水，很快就展現出卓越的能力。"
        },
        {
            idiom: "一暴十寒",
            question: "「一暴十寒」用來比喻什麼？",
            options: [
                { text: "持續努力，持之以恆", isCorrect: false },
                { text: "沒有恆心，做事時斷時續", isCorrect: true },
                { text: "循序漸進，穩紮穩打", isCorrect: false },
                { text: "專心致志，精益求精", isCorrect: false }
            ],
            explanation: "一暴十寒 (yī pù shí hán)：比喻學習或工作沒有恆心，時常中斷。",
            example: "他學習總是三天打魚，兩天曬網，一暴十寒，所以成績一直沒有進步。"
        },
        {
            idiom: "不求甚解",
            question: "「不求甚解」是指學習時怎樣？",
            options: [
                { text: "深入鑽研，探究本質", isCorrect: false },
                { text: "只求大致了解，不深入探究", isCorrect: true },
                { text: "刨根究底，追根溯源", isCorrect: false },
                { text: "實事求是，追求真理", isCorrect: false }
            ],
            explanation: "不求甚解 (bù qiú shèn jiě)：讀書或做學問時，只求大略了解，而不深入探究。",
            example: "對於這本書，他只是不求甚解地翻閱了一下，並沒有真正理解內容。"
        },
        {
            idiom: "守口如瓶",
            question: "「守口如瓶」形容什麼？",
            options: [
                { text: "說話滔滔不絕，口若懸河", isCorrect: false },
                { text: "嚴守秘密，不洩漏任何消息", isCorrect: true },
                { text: "口齒不清，說話含糊", isCorrect: false },
                { text: "能言善道，善於表達", isCorrect: false }
            ],
            explanation: "守口如瓶 (shǒu kǒu rú píng)：形容說話謹慎，嚴守秘密。",
            example: "關於這次的秘密任務，所有人都守口如瓶，沒有人透露半點消息。"
        },
        {
            idiom: "胸無點墨",
            question: "「胸無點墨」形容一個人怎樣？",
            options: [
                { text: "學富五車，才華橫溢", isCorrect: false },
                { text: "沒有學問，知識貧乏", isCorrect: true },
                { text: "心思細膩，觀察入微", isCorrect: false },
                { text: "胸襟開闊，氣度不凡", isCorrect: false }
            ],
            explanation: "胸無點墨 (xiōng wú diǎn mò)：比喻人沒有學問。",
            example: "他雖然口才很好，但卻胸無點墨，說不出什麼有深度的內容。"
        },
        {
            idiom: "一鼓作氣",
            question: "「一鼓作氣」的意思是什麼？",
            options: [
                { text: "一開始就氣勢很弱", isCorrect: false },
                { text: "趁著初起的勇氣或銳氣而一舉成功", isCorrect: true },
                { text: "多次努力才能成功", isCorrect: false },
                { text: "氣勢低落，無法振作", isCorrect: false }
            ],
            explanation: "一鼓作氣 (yī gǔ zuò qì)：比喻趁著初起的勇氣或銳氣而一舉成功。",
            example: "面對挑戰，我們必須一鼓作氣，才能取得勝利。"
        },
        {
            idiom: "名列前茅",
            question: "「名列前茅」形容什麼？",
            options: [
                { text: "考試成績很差", isCorrect: false },
                { text: "成績或名次排在前面", isCorrect: true },
                { text: "默默無聞，不為人知", isCorrect: false },
                { text: "表現平平，沒有特色", isCorrect: false }
            ],
            explanation: "名列前茅 (míng liè qián máo)：指名次排在前面。",
            example: "他在這次考試中名列前茅，獲得了獎學金。"
        },
        {
            idiom: "畫地自限",
            question: "「畫地自限」是指什麼？",
            options: [
                { text: "勇於突破，不斷創新", isCorrect: false },
                { text: "自己設限，不求進步", isCorrect: true },
                { text: "遵守規則，嚴格自律", isCorrect: false },
                { text: "腳踏實地，按部就班", isCorrect: false }
            ],
            explanation: "畫地自限 (huà dì zì xiàn)：比喻自己限制自己，不求進取。",
            example: "不要畫地自限，要勇於嘗試新事物，才能有更大的發展。"
        },
        {
            idiom: "未雨綢繆",
            question: "「未雨綢繆」的意思是什麼？",
            options: [
                { text: "事到臨頭才想辦法", isCorrect: false },
                { text: "事先做好準備，防患未然", isCorrect: true },
                { text: "杞人憂天，庸人自擾", isCorrect: false },
                { text: "順其自然，聽天由命", isCorrect: false }
            ],
            explanation: "未雨綢繆 (wèi yǔ chóu móu)：在下雨之前，把門窗修補好。比喻事先做好準備，以防患未然。",
            example: "在颱風來臨前，大家應該未雨綢繆，做好防颱準備。"
        },
        {
            idiom: "拾人牙慧",
            question: "「拾人牙慧」形容什麼？",
            options: [
                { text: "獨創思想，見解獨到", isCorrect: false },
                { text: "抄襲或模仿別人的言論", isCorrect: true },
                { text: "虛心求教，不恥下問", isCorrect: false },
                { text: "融會貫通，推陳出新", isCorrect: false }
            ],
            explanation: "拾人牙慧 (shí rén yá huì)：比喻襲取別人的言論或主張，當作自己的。",
            example: "他的文章總是拾人牙慧，缺乏自己的觀點和創意。"
        },
        {
            idiom: "一字千金",
            question: "「一字千金」形容什麼？",
            options: [
                { text: "文字數量很多", isCorrect: false },
                { text: "文章寫得好，價值極高", isCorrect: true },
                { text: "寫字速度很快", isCorrect: false },
                { text: "字跡潦草，難以辨認", isCorrect: false }
            ],
            explanation: "一字千金 (yī zì qiān jīn)：形容文章或文字的價值極高。",
            example: "這份文案的內容字字珠璣，真可謂一字千金。"
        },
        {
            idiom: "曇花一現",
            question: "「曇花一現」比喻什麼？",
            options: [
                { text: "持久不衰，長盛不衰", isCorrect: false },
                { text: "事物或景象出現時間很短暫", isCorrect: true },
                { text: "花開燦爛，色彩斑斕", isCorrect: false },
                { text: "稀有珍貴，難得一見", isCorrect: false }
            ],
            explanation: "曇花一現 (tán huā yī xiàn)：比喻事物或景象出現時間很短暫。",
            example: "有些流行事物只是曇花一現，很快就會被遺忘。"
        },
        {
            idiom: "按圖索驥",
            question: "「按圖索驥」的意思是什麼？",
            options: [
                { text: "不按常理出牌，靈活應變", isCorrect: false },
                { text: "按照線索尋找，比喻機械地依照線索尋找事物", isCorrect: true },
                { text: "憑空想像，胡亂猜測", isCorrect: false },
                { text: "舉一反三，觸類旁通", isCorrect: false }
            ],
            explanation: "按圖索驥 (àn tú suǒ jì)：比喻依照線索尋找事物。亦用於譏諷人機械地依照線索尋找事物，不知變通。",
            example: "雖然有了地圖，但如果不熟悉地形，光靠按圖索驥是很難找到寶藏的。"
        },
        {
            idiom: "天衣無縫",
            question: "「天衣無縫」形容什麼？",
            options: [
                { text: "衣物破損，需要修補", isCorrect: false },
                { text: "事物完美無缺，沒有破綻", isCorrect: true },
                { text: "設計獨特，別出心裁", isCorrect: false },
                { text: "材質柔軟，穿著舒適", isCorrect: false }
            ],
            explanation: "天衣無縫 (tiān yī wú fèng)：比喻事物完美，沒有破綻。",
            example: "這份計畫設計得天衣無縫，找不到任何可以挑剔的地方。"
        },
        {
            idiom: "班門弄斧",
            question: "「班門弄斧」比喻什麼？",
            options: [
                { text: "技藝高超，出類拔萃", isCorrect: false },
                { text: "在行家面前賣弄本領，不自量力", isCorrect: true },
                { text: "謙虛好學，向人請教", isCorrect: false },
                { text: "精通技藝，游刃有餘", isCorrect: false }
            ],
            explanation: "班門弄斧 (bān mén nòng fǔ)：在魯班門前舞弄斧頭。比喻在行家面前賣弄本領，不自量力。",
            example: "在他這位書法大師面前談論書法，簡直是班門弄斧。"
        },
        {
            idiom: "杯水車薪",
            question: "「杯水車薪」比喻什麼？",
            options: [
                { text: "資源豐富，綽綽有餘", isCorrect: false },
                { text: "所幫助的力量太微小，無法解決問題", isCorrect: true },
                { text: "節約資源，善加利用", isCorrect: false },
                { text: "積少成多，聚沙成塔", isCorrect: false }
            ],
            explanation: "杯水車薪 (bēi shuǐ chē xīn)：用一杯水去撲滅一車的火。比喻力量微薄，無濟於事。",
            example: "面對這麼大的災情，我們捐贈的這點物資根本是杯水車薪。"
        },
        {
            idiom: "臨渴掘井",
            question: "「臨渴掘井」諷刺的是哪種行為？",
            options: [
                { text: "未雨綢繆，提前準備", isCorrect: false },
                { text: "事到臨頭才想辦法，為時已晚", isCorrect: true },
                { text: "積極主動，解決問題", isCorrect: false },
                { text: "有備無患，從容應對", isCorrect: false }
            ],
            explanation: "臨渴掘井 (lín kě jué jǐng)：等到口渴才開始掘井。比喻事到臨頭才想辦法，為時已晚。",
            example: "平時不努力學習，等到考試才臨時抱佛腳，這就是臨渴掘井。"
        },
        {
            idiom: "聞雞起舞",
            question: "「聞雞起舞」形容什麼樣的精神？",
            options: [
                { text: "懶惰怠惰，不思進取", isCorrect: false },
                { text: "勤奮不懈，刻苦學習或練習", isCorrect: true },
                { text: "隨遇而安，不求名利", isCorrect: false },
                { text: "自負驕傲，目中無人", isCorrect: false }
            ],
            explanation: "聞雞起舞 (wén jī qǐ wǔ)：比喻有志者及時奮發，聞聲起舞。",
            example: "他為了實現夢想，每天聞雞起舞，刻苦練習。"
        },
        {
            idiom: "一蹴可幾",
            question: "「一蹴可幾」的意思是什麼？",
            options: [
                { text: "一步就能成功", isCorrect: true },
                { text: "需要長時間努力才能達成", isCorrect: false },
                { text: "困難重重，難以實現", isCorrect: false },
                { text: "循序漸進，穩紮穩打", isCorrect: false }
            ],
            explanation: "一蹴可幾 (yī cù kě jī)：一舉足就可到達。比喻一下子就能成功。",
            example: "學習是循序漸進的過程，不是一蹴可幾的。"
        },
        {
            idiom: "毛遂自薦",
            question: "「毛遂自薦」是指什麼？",
            options: [
                { text: "等待別人推薦", isCorrect: false },
                { text: "自己推薦自己", isCorrect: true },
                { text: "謙虛謹慎，不愛出風頭", isCorrect: false },
                { text: "被動接受安排", isCorrect: false }
            ],
            explanation: "毛遂自薦 (máo suì zì jiàn)：比喻自我推薦。",
            example: "他毛遂自薦，向公司提出了自己的專案計畫。"
        },
        {
            idiom: "洛陽紙貴",
            question: "當一部新書出版後，因為內容精彩，引起大家爭相閱讀，導致紙張需求大增，可以用哪個成語來形容？",
            options: [
                { text: "炙手可熱", isCorrect: false },
                { text: "洛陽紙貴", isCorrect: true },
                { text: "供不應求", isCorrect: false },
                { text: "一紙風行", isCorrect: false }
            ],
            explanation: "洛陽紙貴 (luò yáng zhī guì)：晉代左思的〈三都賦〉寫成後，一時傳播很廣，人們爭相抄寫，洛陽的紙張也因此而漲價。後比喻著作風行一時，流傳很廣。",
            example: "這部電影上映後票房大賣，口碑載道，可說是洛陽紙貴。"
        },
        {
            idiom: "胸有成竹",
            question: "小明對這次的報告內容非常熟悉，上台前顯得很有自信。可以用哪個成語來形容小明的心態？",
            options: [
                { text: "心亂如麻", isCorrect: false },
                { text: "手足無措", isCorrect: false },
                { text: "胸有成竹", isCorrect: true },
                { text: "忐忑不安", isCorrect: false }
            ],
            explanation: "胸有成竹 (xiōng yǒu chéng zhú)：比喻在事前已有了充分的準備和把握，或心中已有了主意。",
            example: "他對這次的考試已經胸有成竹，所以一點都不緊張。"
        },
        {
            idiom: "一蹴可幾",
            question: "成功往往不是「一蹴可幾」的，它需要什麼？",
            options: [
                { text: "僥倖和運氣", isCorrect: false },
                { text: "持之以恆的努力和付出", isCorrect: true },
                { text: "聰明才智，一步登天", isCorrect: false },
                { text: "旁門左道，投機取巧", isCorrect: false }
            ],
            explanation: "一蹴可幾 (yī cù kě jī)：一舉足就可到達。比喻一下子就能成功。",
            example: "任何偉大的成就都不是一蹴可幾的，都需要長期的努力和堅持。"
        },
        {
            idiom: "一字千金",
            question: "形容文章或文字價值極高的成語是？",
            options: [
                { text: "字字珠璣", isCorrect: false },
                { text: "一字千金", isCorrect: true },
                { text: "惜字如金", isCorrect: false },
                { text: "擲地有聲", isCorrect: false }
            ],
            explanation: "一字千金 (yī zì qiān jīn)：形容文章或文字的價值極高。",
            example: "這篇社論句句精闢，真可謂一字千金。"
        },
        {
            idiom: "按圖索驥",
            question: "小明按照說明書一步一步組裝模型，非常仔細。這可以用哪個成語來形容？",
            options: [
                { text: "靈機一動", isCorrect: false },
                { text: "舉一反三", isCorrect: false },
                { text: "按圖索驥", isCorrect: true },
                { text: "獨具匠心", isCorrect: false }
            ],
            explanation: "按圖索驥 (àn tú suǒ jì)：比喻依照線索尋找事物。亦用於譏諷人機械地依照線索尋找事物，不知變通。",
            example: "偵探按圖索驥，終於找到了失蹤的人。"
        },
        {
            idiom: "水落石出",
            question: "經過長時間的調查，案件的真相終於大白。這可以用哪個成語來形容？",
            options: [
                { text: "撲朔迷離", isCorrect: false },
                { text: "石沉大海", isCorrect: false },
                { text: "水落石出", isCorrect: true },
                { text: "霧裡看花", isCorrect: false }
            ],
            explanation: "水落石出 (shuǐ luò shí chū)：比喻事情的真相終於顯現出來。",
            example: "這起懸案經過多年調查，終於水落石出，還了受害者一個公道。"
        },
        {
            idiom: "胸無點墨",
            question: "如果一個人沒有什麼學問，知識貧乏，你會用哪個成語來形容他？",
            options: [
                { text: "滿腹經綸", isCorrect: false },
                { text: "博學多聞", isCorrect: false },
                { text: "胸無點墨", isCorrect: true },
                { text: "才華洋溢", isCorrect: false }
            ],
            explanation: "胸無點墨 (xiōng wú diǎn mò)：比喻人沒有學問。",
            example: "他雖然身居高位，但卻胸無點墨，常鬧笑話。"
        },
        {
            idiom: "未雨綢繆",
            question: "為了預防未來可能發生的災害，我們應該提早做好準備。這符合哪個成語的意思？",
            options: [
                { text: "亡羊補牢", isCorrect: false },
                { text: "臨渴掘井", isCorrect: false },
                { text: "未雨綢繆", isCorrect: true },
                { text: "杞人憂天", isCorrect: false }
            ],
            explanation: "未雨綢繆 (wèi yǔ chóu móu)：在下雨之前，把門窗修補好。比喻事先做好準備，以防患未然。",
            example: "聰明的人總是未雨綢繆，為將來做好打算。"
        },
        {
            idiom: "拋磚引玉",
            question: "當你想謙虛地提出自己的不成熟意見，希望引起別人更精闢的見解時，可以用哪個成語來表示？",
            options: [
                { text: "自賣自誇", isCorrect: false },
                { text: "拋磚引玉", isCorrect: true },
                { text: "一鳴驚人", isCorrect: false },
                { text: "班門弄斧", isCorrect: false }
            ],
            explanation: "拋磚引玉 (pāo zhuān yǐn yù)：比喻先提出粗淺的意見，以引發別人高明的見解。",
            example: "今天我先拋磚引玉，簡單介紹一下我的想法，希望大家能給出更多寶貴意見。"
        },
        {
            idiom: "病入膏肓",
            question: "「病入膏肓」形容什麼狀況？",
            options: [
                { text: "病情嚴重，無法醫治", isCorrect: true },
                { text: "病患身體虛弱，需要休養", isCorrect: false },
                { text: "疾病初期，容易痊癒", isCorrect: false },
                { text: "心情鬱悶，無精打采", isCorrect: false }
            ],
            explanation: "病入膏肓 (bìng rù gāo huāng)：比喻病情嚴重到了無法醫治的地步，也比喻事態嚴重到無法挽回。",
            example: "這家公司問題叢生，已是病入膏肓，難以挽救了。"
        },
        {
            idiom: "汗牛充棟",
            question: "「汗牛充棟」是用來形容什麼？",
            options: [
                { text: "牛隻流汗，房間堆滿草料", isCorrect: false },
                { text: "書籍非常多，堆滿了屋子", isCorrect: true },
                { text: "工作量大，疲憊不堪", isCorrect: false },
                { text: "財富豐厚，富甲一方", isCorrect: false }
            ],
            explanation: "汗牛充棟 (hàn niú chōng dòng)：比喻藏書很多。",
            example: "他家裡藏書汗牛充棟，儼然一座小型圖書館。"
        },
        {
            idiom: "焚膏繼晷",
            question: "「焚膏繼晷」形容什麼？",
            options: [
                { text: "白天點燈，晚上睡覺", isCorrect: false },
                { text: "勤奮不懈，日夜不停地工作或學習", isCorrect: true },
                { text: "浪費資源，揮霍無度", isCorrect: false },
                { text: "享受生活，追求舒適", isCorrect: false }
            ],
            explanation: "焚膏繼晷 (fén gāo jì guǐ)：點上燈燭，接續白天。比喻日夜不停地工作或學習。",
            example: "為了趕在期限前完成專案，他焚膏繼晷，犧牲了許多睡眠時間。"
        },
        {
            idiom: "罄竹難書",
            question: "「罄竹難書」常用來形容什麼？",
            options: [
                { text: "文字優美，內容豐富", isCorrect: false },
                { text: "罪狀多得寫不完，難以記述", isCorrect: true },
                { text: "書籍稀少，難以尋覓", isCorrect: false },
                { text: "筆墨枯竭，無法創作", isCorrect: false }
            ],
            explanation: "罄竹難書 (qìng zhú nán shū)：用盡所有的竹子也難以寫完。比喻罪狀太多，難以全部寫完。",
            example: "這個貪官的罪行罄竹難書，令人髮指。"
        },
        {
            idiom: "櫛風沐雨",
            question: "「櫛風沐雨」形容什麼樣的辛勞？",
            options: [
                { text: "生活優渥，無憂無慮", isCorrect: false },
                { text: "風吹雨淋，在外奔波辛勞", isCorrect: true },
                { text: "享受自然，自由自在", isCorrect: false },
                { text: "規律作息，注重養生", isCorrect: false }
            ],
            explanation: "櫛風沐雨 (jié fēng mù yǔ)：比喻辛苦奔波，歷經風雨，非常勞累。",
            example: "為了開墾這片荒地，農民們櫛風沐雨，付出了巨大的努力。"
        },
        {
            idiom: "一字褒貶",
            question: "「一字褒貶」是指什麼？",
            options: [
                { text: "文字簡潔有力，毫不拖泥帶水", isCorrect: false },
                { text: "在文字上運用恰當，帶有褒揚或貶抑的意味", isCorrect: true },
                { text: "用一個字來稱讚或批評別人", isCorrect: false },
                { text: "對文字的精確度要求極高", isCorrect: false }
            ],
            explanation: "一字褒貶 (yī zì bāo biǎn)：指在文章中，運用恰當的文字，帶有褒揚或貶抑的意味。",
            example: "史家寫史，往往於關鍵處一字褒貶，足以影響後世評價。"
        },
        {
            idiom: "言簡意賅",
            question: "「言簡意賅」形容說話或文章怎樣？",
            options: [
                { text: "話語冗長，內容繁雜", isCorrect: false },
                { text: "語言簡潔，但意思卻很完整、深刻", isCorrect: true },
                { text: "詞不達意，表達不清", isCorrect: false },
                { text: "滔滔不絕，口若懸河", isCorrect: false }
            ],
            explanation: "言簡意賅 (yán jiǎn yì gāi)：說話或文章簡潔扼要，但意思卻很完整、深刻。",
            example: "他的發言總是言簡意賅，切中要點，讓大家印象深刻。"
        },
        {
            idiom: "鳳毛麟角",
            question: "「鳳毛麟角」比喻什麼？",
            options: [
                { text: "數量龐大，隨處可見", isCorrect: false },
                { text: "稀少而珍貴的人或事物", isCorrect: true },
                { text: "外表華麗，氣勢非凡", isCorrect: false },
                { text: "體積龐大，難以移動", isCorrect: false }
            ],
            explanation: "鳳毛麟角 (fèng máo lín jiǎo)：比喻稀少而珍貴的人或事物。",
            example: "像他這樣既有才華又肯努力的年輕人，真是鳳毛麟角。"
        },
        {
            idiom: "郢書燕說",
            question: "「郢書燕說」諷刺什麼？",
            options: [
                { text: "精闢的見解，令人茅塞頓開", isCorrect: false },
                { text: "穿鑿附會，曲解原意", isCorrect: true },
                { text: "對原文進行深入的闡釋", isCorrect: false },
                { text: "言之有理，令人信服", isCorrect: false }
            ],
            explanation: "郢書燕說 (yǐng shū yān shuō)：比喻穿鑿附會，牽強解釋，或曲解原意。",
            example: "這段古文的解釋，許多人都在郢書燕說，沒有真正理解作者的本意。"
        }
    ];

    // 遊戲函數
    function showQuestion(question) {
        questionText.textContent = question.question;
        optionsContainer.innerHTML = ''; // 清除之前的選項
        explanationContainer.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
        feedbackMessage.textContent = '';

        question.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.classList.add('option-button');
            button.addEventListener('click', () => selectOption(button, option.isCorrect, question));
            optionsContainer.appendChild(button);
        });

        // 啟用所有選項按鈕
        Array.from(optionsContainer.children).forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
        scoreDisplay.textContent = score; // 更新分數顯示
    }

    function selectOption(selectedButton, isCorrect, currentQ) {
        // 選項選擇後，禁用所有選項按鈕
        Array.from(optionsContainer.children).forEach(btn => btn.disabled = true);

        if (isCorrect) {
            selectedButton.classList.add('correct');
            feedbackMessage.textContent = '答對了！';
            feedbackMessage.style.color = '#4CAF50';
            score++;
        } else {
            selectedButton.classList.add('incorrect');
            feedbackMessage.textContent = '答錯了！';
            feedbackMessage.style.color = '#d32f2f';
            // 找到並標示正確答案
            Array.from(optionsContainer.children).forEach(btn => {
                const correspondingOption = currentQ.options.find(opt => opt.text === btn.textContent);
                if (correspondingOption && correspondingOption.isCorrect) {
                    btn.classList.add('correct');
                }
            });
        }
        scoreDisplay.textContent = score; // 即時更新分數
        displayExplanation(currentQ);
        nextQuestionBtn.classList.remove('hidden');
    }

    function displayExplanation(question) {
        explanationText.textContent = question.explanation;
        exampleSentence.textContent = `例句：${question.example}`;
        explanationContainer.classList.remove('hidden');
    }

    function startGame() {
        gameScreen.classList.remove('hidden');
        levelCompleteScreen.classList.add('hidden');
        startChallengeBtn.classList.add('hidden');
        homeBtn.classList.add('hidden'); // 開始遊戲後隱藏回首頁按鈕
        currentQuestionIndex = 0;
        score = 0;
        timer = 0;
        timerDisplay.textContent = timer;
        scoreDisplay.textContent = score;
        submissionFeedback.textContent = ''; // 清除提交分數的回饋訊息
        playerNameInput.value = ''; // 清空玩家名稱輸入框

        // 隨機打亂題目順序並選取 10 題進行遊戲
        shuffleArray(questions);
        questionsForCurrentGame = questions.slice(0, 10); // 只取前10題
        
        showQuestion(questionsForCurrentGame[currentQuestionIndex]);
        startTimer();
    }

    function loadNextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questionsForCurrentGame.length) {
            showQuestion(questionsForCurrentGame[currentQuestionIndex]);
        } else {
            // 此關卡所有題目都已完成
            endGame();
        }
    }

    function endGame() {
        clearInterval(timerInterval); // 停止計時器
        gameScreen.classList.add('hidden');
        levelCompleteScreen.classList.remove('hidden');
        finalScoreSpan.textContent = `${score} / ${questionsForCurrentGame.length}`;
        finalTimeSpan.textContent = timer;
        submitScoreButton.disabled = false; // 確保提交按鈕可用
        loadLeaderboard(); // 遊戲結束時載入排行榜
    }

    function startTimer() {
        clearInterval(timerInterval); // 確保每次開始遊戲都清除舊的計時器
        timer = 0;
        timerDisplay.textContent = timer;
        timerInterval = setInterval(() => {
            timer++;
            timerDisplay.textContent = timer;
        }, 1000);
    }

    // 隨機打亂陣列的函數 (Fisher-Yates shuffle 演算法)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // 交換元素
        }
    }

    // 將分數提交到 Firebase
    function submitScore() {
        const playerName = playerNameInput.value.trim() || '匿名玩家'; // 如果玩家未輸入名稱，則為「匿名玩家」
        const scoreData = {
            name: playerName,
            score: score,
            time: timer,
            timestamp: new Date().toISOString() // 儲存 ISO 格式的時間字串
        };

        // 將資料推送到 Firebase Realtime Database
        scoresRef.push(scoreData)
            .then(() => {
                submissionFeedback.textContent = '分數提交成功！';
                submissionFeedback.style.color = '#4CAF50';
                submitScoreButton.disabled = true; // 提交後禁用按鈕
                loadLeaderboard(); // 重新載入排行榜以顯示最新分數
            })
            .catch(error => {
                submissionFeedback.textContent = `提交失敗：${error.message}`;
                submissionFeedback.style.color = '#d32f2f';
                console.error("Error writing document: ", error);
            });
    }

    // 從 Firebase 載入排行榜
    function loadLeaderboard() {
        leaderboardList.innerHTML = '<li>載入中...</li>';
        // 按照分數降序排序，取前 10 名，並監聽資料變化
        scoresRef.orderByChild('score').limitToLast(10).on('value', (snapshot) => {
            const scores = [];
            snapshot.forEach((childSnapshot) => {
                scores.push(childSnapshot.val());
            });

            // Firebase 的 orderByChild('score') with limitToLast(10) 會回傳分數最高的 10 個，
            // 但順序是從低到高。所以我們需要反轉陣列。
            scores.reverse();

            leaderboardList.innerHTML = ''; // 清空列表

            if (scores.length === 0) {
                leaderboardList.innerHTML = '<li>目前沒有排行榜資料。</li>';
                return;
            }

            scores.forEach((data, index) => {
                const listItem = document.createElement('li');
                const date = new Date(data.timestamp);
                const formattedDate = date.toLocaleString('zh-TW', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                listItem.innerHTML = `
                    <span class="player-name">${index + 1}. ${data.name}</span>
                    <span class="score-time">分數: ${data.score} / 時間: ${data.time} 秒</span>
                    <span class="timestamp">${formattedDate}</span>
                `;
                leaderboardList.appendChild(listItem);
            });
        }, (errorObject) => {
            console.log('The read failed: ' + errorObject.name);
            leaderboardList.innerHTML = '<li>載入排行榜失敗。</li>';
        });
    }


    // 事件監聽器
    startChallengeBtn.addEventListener('click', startGame);
    nextQuestionBtn.addEventListener('click', loadNextQuestion);
    submitScoreButton.addEventListener('click', submitScore);
    restartGameButton.addEventListener('click', startGame); // 重新開始遊戲
    homeBtn.addEventListener('click', () => {
        // 重設遊戲狀態並返回到首頁（即顯示開始按鈕和初始訊息）
        gameScreen.classList.remove('hidden');
        levelCompleteScreen.classList.add('hidden');
        startChallengeBtn.classList.remove('hidden');
        questionText.textContent = "點擊「開始挑戰」開始遊戲！";
        optionsContainer.innerHTML = '';
        explanationContainer.classList.add('hidden');
        nextQuestionBtn.classList.add('hidden');
        feedbackMessage.textContent = '';
        clearInterval(timerInterval); // 停止計時器
        timerDisplay.textContent = '0';
        scoreDisplay.textContent = '0';
        playerNameInput.value = '';
        submissionFeedback.textContent = '';
        submitScoreButton.disabled = false; // 確保按鈕可再次使用
        loadLeaderboard(); // 回首頁時也更新排行榜
    });

    // 初始載入時
    gameScreen.classList.remove('hidden');
    startChallengeBtn.classList.remove('hidden');
    questionText.textContent = "點擊「開始挑戰」開始遊戲！";
    loadLeaderboard(); // 頁面載入時就載入排行榜
});