// ============================================================
//  app.js  –  ExamPortal: Shared Data, Auth & Utilities
//  Version 3: Adds FILL and SHORT question types,
//  manual evaluation, and 3-warning tab-switch system.
// ============================================================

/* ──────────────────────────────────────────
   SEED DATA  –  loaded once on first visit
────────────────────────────────────────── */
const SEED = {
  users: [
    {
      id: "u_admin",
      name: "Admin User",
      email: "admin@examportal.com",
      password: "Admin@123",
      role: "admin",
      createdAt: new Date().toISOString()
    },
    {
      id: "u_s1",
      name: "Shubham Kumar",
      email: "Shubham@student.com",
      password: "Student@123",
      role: "student",
      createdAt: new Date().toISOString()
    }
  ],

  exams: [

    // ══════════════════════════════════════════════════════════════
    //  EXAM 1 – GENERAL KNOWLEDGE  (25 questions – MCQ only)
    // ══════════════════════════════════════════════════════════════
    {
      id: "exam_gk",
      title: "General Knowledge Test",
      subject: "General Knowledge",
      description: "Test your general awareness – India, world events, science & culture.",
      duration: 40,
      totalMarks: 100,
      passingMarks: 40,
      marksPerCorrect: 4,
      negativeMarks: 1,
      status: "active",
      createdAt: new Date().toISOString(),
      questions: [
        { id:"gk1",  type:"MCQ", text:"What is the capital of India?",                                           options:["Mumbai","New Delhi","Kolkata","Chennai"],                    correct:1 },
        { id:"gk2",  type:"MCQ", text:"Who wrote the Indian National Anthem 'Jana Gana Mana'?",                  options:["Bankim Chandra","Rabindranath Tagore","Mahatma Gandhi","Nehru"], correct:1 },
        { id:"gk3",  type:"MCQ", text:"Which planet is known as the Red Planet?",                               options:["Venus","Jupiter","Mars","Saturn"],                           correct:2 },
        { id:"gk4",  type:"MCQ", text:"How many states does India have (as of 2024)?",                          options:["25","26","28","29"],                                         correct:2 },
        { id:"gk5",  type:"MCQ", text:"Which river is the longest in India?",                                   options:["Yamuna","Brahmaputra","Godavari","Ganga"],                   correct:3 },
        { id:"gk6",  type:"MCQ", text:"The first Prime Minister of India was:",                                 options:["Sardar Patel","Dr. Rajendra Prasad","Jawaharlal Nehru","B.R. Ambedkar"], correct:2 },
        { id:"gk7",  type:"MCQ", text:"Which country is the largest by area?",                                  options:["USA","China","Russia","Canada"],                             correct:2 },
        { id:"gk8",  type:"MCQ", text:"Mount Everest is located in which country?",                             options:["India","China","Nepal","Bhutan"],                            correct:2 },
        { id:"gk9",  type:"MCQ", text:"The currency of Japan is:",                                              options:["Won","Yuan","Yen","Ringgit"],                                correct:2 },
        { id:"gk10", type:"MCQ", text:"Which sport is associated with the Durand Cup?",                         options:["Cricket","Football","Hockey","Badminton"],                   correct:1 },
        { id:"gk11", type:"MCQ", text:"The United Nations was founded in:",                                     options:["1944","1945","1946","1947"],                                 correct:1 },
        { id:"gk12", type:"MCQ", text:"Which element has the chemical symbol 'Au'?",                            options:["Silver","Gold","Aluminium","Argon"],                         correct:1 },
        { id:"gk13", type:"MCQ", text:"The Statue of Liberty was gifted to the USA by which country?",          options:["UK","Germany","France","Spain"],                             correct:2 },
        { id:"gk14", type:"MCQ", text:"Mahatma Gandhi was born in which city?",                                 options:["Surat","Rajkot","Porbandar","Ahmedabad"],                    correct:2 },
        { id:"gk15", type:"MCQ", text:"Which ocean is the largest in the world?",                               options:["Atlantic","Indian","Arctic","Pacific"],                      correct:3 },
        { id:"gk16", type:"MCQ", text:"Which country hosted the 2020 Summer Olympics (held in 2021)?",          options:["China","France","Japan","USA"],                              correct:2 },
        { id:"gk17", type:"MCQ", text:"The Great Wall of China was primarily built during which dynasty?",      options:["Tang","Han","Ming","Song"],                                  correct:2 },
        { id:"gk18", type:"MCQ", text:"Who is the author of 'The Discovery of India'?",                         options:["Mahatma Gandhi","Jawaharlal Nehru","Rabindranath Tagore","B.R. Ambedkar"], correct:1 },
        { id:"gk19", type:"MCQ", text:"Which is the smallest continent by area?",                              options:["Europe","Antarctica","Australia","South America"],           correct:2 },
        { id:"gk20", type:"MCQ", text:"The Nobel Peace Prize is awarded in which city?",                        options:["Stockholm","Copenhagen","Helsinki","Oslo"],                  correct:3 },
        { id:"gk21", type:"MCQ", text:"India's national animal is:",                                            options:["Lion","Elephant","Bengal Tiger","Leopard"],                  correct:2 },
        { id:"gk22", type:"MCQ", text:"Which Indian state has the longest coastline?",                          options:["Kerala","Tamil Nadu","Gujarat","Andhra Pradesh"],            correct:2 },
        { id:"gk23", type:"MCQ", text:"The headquarters of the International Criminal Court (ICC) is in:",     options:["New York","Geneva","The Hague","Brussels"],                  correct:2 },
        { id:"gk24", type:"MCQ", text:"Who was the first woman to win a Nobel Prize?",                          options:["Rosalind Franklin","Marie Curie","Dorothy Hodgkin","Irène Joliot-Curie"], correct:1 },
        { id:"gk25", type:"MCQ", text:"Which language has the most native speakers in the world?",              options:["English","Spanish","Hindi","Mandarin Chinese"],              correct:3 }
      ]
    },

    // ══════════════════════════════════════════════════════════════
    //  EXAM 2 – SCIENCE & TECHNOLOGY  (25 questions – MCQ)
    // ══════════════════════════════════════════════════════════════
    {
      id: "exam_sci",
      title: "Science & Technology Quiz",
      subject: "Science",
      description: "Physics, Chemistry and Biology fundamentals with modern tech concepts.",
      duration: 40,
      totalMarks: 100,
      passingMarks: 40,
      marksPerCorrect: 4,
      negativeMarks: 1,
      status: "active",
      createdAt: new Date().toISOString(),
      questions: [
        { id:"s1",  type:"MCQ", text:"What is the speed of light (approx.) in vacuum?",                         options:["3×10⁶ m/s","3×10⁸ m/s","3×10¹⁰ m/s","3×10⁴ m/s"],           correct:1 },
        { id:"s2",  type:"MCQ", text:"DNA stands for:",                                                          options:["Deoxyribonucleic Acid","Diribonucleic Acid","Deoxyribose Nucleic Acid","Double Nucleic Acid"], correct:0 },
        { id:"s3",  type:"MCQ", text:"Which gas is most abundant in Earth's atmosphere?",                        options:["Oxygen","Carbon dioxide","Nitrogen","Argon"],                 correct:2 },
        { id:"s4",  type:"MCQ", text:"The unit of electrical resistance is:",                                    options:["Volt","Ampere","Ohm","Watt"],                                 correct:2 },
        { id:"s5",  type:"MCQ", text:"Which organ produces insulin in the human body?",                          options:["Liver","Pancreas","Kidney","Stomach"],                        correct:1 },
        { id:"s6",  type:"MCQ", text:"The process of converting liquid water into vapour is called:",            options:["Condensation","Evaporation","Transpiration","Sublimation"],   correct:1 },
        { id:"s7",  type:"MCQ", text:"Newton's Second Law of Motion states:",                                   options:["Inertia","Force = Mass × Acceleration","Action-Reaction","Conservation of momentum"], correct:1 },
        { id:"s8",  type:"MCQ", text:"Which vitamin is produced when the human body is exposed to sunlight?",   options:["Vitamin A","Vitamin B12","Vitamin C","Vitamin D"],            correct:3 },
        { id:"s9",  type:"MCQ", text:"The atomic number of Carbon is:",                                         options:["4","6","8","12"],                                             correct:1 },
        { id:"s10", type:"MCQ", text:"HTTP stands for:",                                                        options:["HyperText Transfer Protocol","High Transfer Text Protocol","HyperText Transmission Protocol","High Text Transfer Protocol"], correct:0 },
        { id:"s11", type:"MCQ", text:"Which planet has the most moons (as of recent count)?",                  options:["Jupiter","Saturn","Uranus","Neptune"],                        correct:1 },
        { id:"s12", type:"MCQ", text:"The pH of pure water at 25°C is:",                                       options:["6","7","8","9"],                                              correct:1 },
        { id:"s13", type:"MCQ", text:"Who invented the telephone?",                                             options:["Thomas Edison","Nikola Tesla","Alexander Graham Bell","James Watt"], correct:2 },
        { id:"s14", type:"MCQ", text:"Which part of the plant is primarily responsible for photosynthesis?",    options:["Root","Stem","Leaf","Flower"],                                correct:2 },
        { id:"s15", type:"MCQ", text:"RAM stands for:",                                                        options:["Readily Accessible Memory","Random Access Memory","Read And Modify","Rapid Access Memory"], correct:1 },
        { id:"s16", type:"MCQ", text:"Which scientist proposed the Theory of General Relativity?",              options:["Isaac Newton","Niels Bohr","Albert Einstein","Stephen Hawking"], correct:2 },
        { id:"s17", type:"MCQ", text:"What is the chemical formula for water?",                                options:["HO","H₂O","H₂O₂","HO₂"],                                   correct:1 },
        { id:"s18", type:"MCQ", text:"The powerhouse of the cell is the:",                                     options:["Nucleus","Ribosome","Mitochondria","Golgi body"],             correct:2 },
        { id:"s19", type:"MCQ", text:"Which blood type is known as the universal donor?",                      options:["A+","B+","AB+","O−"],                                        correct:3 },
        { id:"s20", type:"MCQ", text:"Sound travels fastest through which medium?",                            options:["Air","Water","Vacuum","Steel"],                               correct:3 },
        { id:"s21", type:"MCQ", text:"What does CPU stand for?",                                               options:["Central Process Unit","Central Processing Unit","Computer Personal Unit","Core Processing Unit"], correct:1 },
        { id:"s22", type:"MCQ", text:"The ozone layer is found in which layer of the atmosphere?",             options:["Troposphere","Stratosphere","Mesosphere","Thermosphere"],     correct:1 },
        { id:"s23", type:"MCQ", text:"Which element is the most abundant in the human body by mass?",         options:["Carbon","Hydrogen","Nitrogen","Oxygen"],                      correct:3 },
        { id:"s24", type:"MCQ", text:"What is the SI unit of force?",                                         options:["Joule","Pascal","Newton","Watt"],                             correct:2 },
        { id:"s25", type:"MCQ", text:"Which gas is released during photosynthesis?",                          options:["Carbon dioxide","Nitrogen","Oxygen","Hydrogen"],              correct:2 }
      ]
    },

    // ══════════════════════════════════════════════════════════════
    //  EXAM 3 – MATHEMATICS  (25 questions – MCQ)
    // ══════════════════════════════════════════════════════════════
    {
      id: "exam_math",
      title: "Mathematics Fundamentals",
      subject: "Mathematics",
      description: "Arithmetic, algebra, geometry and basic number theory.",
      duration: 45,
      totalMarks: 100,
      passingMarks: 40,
      marksPerCorrect: 4,
      negativeMarks: 1,
      status: "active",
      createdAt: new Date().toISOString(),
      questions: [
        { id:"m1",  type:"MCQ", text:"What is the value of √144?",                                              options:["11","12","13","14"],                                         correct:1 },
        { id:"m2",  type:"MCQ", text:"If 2x + 3 = 11, what is x?",                                             options:["3","4","5","6"],                                             correct:1 },
        { id:"m3",  type:"MCQ", text:"The area of a circle with radius 7 cm is: (use π ≈ 22/7)",               options:["154 cm²","144 cm²","164 cm²","174 cm²"],                     correct:0 },
        { id:"m4",  type:"MCQ", text:"What is 15% of 200?",                                                     options:["25","30","35","40"],                                         correct:1 },
        { id:"m5",  type:"MCQ", text:"LCM of 12 and 18 is:",                                                   options:["24","36","48","72"],                                         correct:1 },
        { id:"m6",  type:"MCQ", text:"Which of the following is a prime number?",                               options:["21","27","37","51"],                                         correct:2 },
        { id:"m7",  type:"MCQ", text:"The sum of angles in a triangle is:",                                    options:["90°","180°","270°","360°"],                                  correct:1 },
        { id:"m8",  type:"MCQ", text:"What is 2⁸?",                                                            options:["128","256","512","64"],                                      correct:1 },
        { id:"m9",  type:"MCQ", text:"If a train travels 60 km/h for 2.5 hours, the distance covered is:",    options:["120 km","140 km","150 km","160 km"],                         correct:2 },
        { id:"m10", type:"MCQ", text:"The HCF of 24 and 36 is:",                                              options:["4","6","8","12"],                                            correct:3 },
        { id:"m11", type:"MCQ", text:"Simplify: 5/8 + 3/8 =",                                                 options:["1/2","1","8/8","3/4"],                                       correct:1 },
        { id:"m12", type:"MCQ", text:"What is the perimeter of a square with side 9 cm?",                     options:["27 cm","36 cm","45 cm","81 cm"],                             correct:1 },
        { id:"m13", type:"MCQ", text:"Solve: 3(x − 4) = 12. x = ?",                                          options:["4","6","8","10"],                                            correct:2 },
        { id:"m14", type:"MCQ", text:"A shopkeeper buys at ₹80 and sells at ₹100. The profit % is:",         options:["20%","25%","30%","15%"],                                     correct:1 },
        { id:"m15", type:"MCQ", text:"The median of {3, 7, 1, 9, 5} is:",                                    options:["3","5","7","9"],                                             correct:1 },
        { id:"m16", type:"MCQ", text:"If the simple interest on ₹5000 at 8% per annum for 2 years is:",      options:["₹400","₹600","₹800","₹1000"],                               correct:2 },
        { id:"m17", type:"MCQ", text:"What is the value of sin 90°?",                                         options:["0","1","−1","√2/2"],                                        correct:1 },
        { id:"m18", type:"MCQ", text:"The average of 10, 20, 30, 40, 50 is:",                                options:["25","30","35","40"],                                         correct:1 },
        { id:"m19", type:"MCQ", text:"A cube has a side of 4 cm. Its volume is:",                             options:["16 cm³","32 cm³","48 cm³","64 cm³"],                         correct:3 },
        { id:"m20", type:"MCQ", text:"Which is the smallest 4-digit number divisible by 9?",                 options:["1008","1017","1026","1000"],                                 correct:0 },
        { id:"m21", type:"MCQ", text:"The value of (a + b)² is:",                                            options:["a² + b²","a² + 2ab + b²","a² − 2ab + b²","2a² + 2b²"],      correct:1 },
        { id:"m22", type:"MCQ", text:"If 20% of a number is 50, what is the number?",                        options:["150","200","250","300"],                                     correct:2 },
        { id:"m23", type:"MCQ", text:"What is the slope of the line y = 3x + 7?",                            options:["7","3","1/3","−3"],                                         correct:1 },
        { id:"m24", type:"MCQ", text:"The number of diagonals in a hexagon is:",                             options:["6","8","9","12"],                                            correct:2 },
        { id:"m25", type:"MCQ", text:"A person walks 4 km East and 3 km North. The straight-line distance from the start is:", options:["5 km","6 km","7 km","8 km"],            correct:0 }
      ]
    },

    // ══════════════════════════════════════════════════════════════
    //  EXAM 4 – LOGICAL REASONING  (25 questions – MCQ)
    // ══════════════════════════════════════════════════════════════
    {
      id: "exam_reas",
      title: "Logical Reasoning & Aptitude",
      subject: "Reasoning",
      description: "Verbal reasoning, analytical thinking and logical puzzles.",
      duration: 40,
      totalMarks: 100,
      passingMarks: 40,
      marksPerCorrect: 4,
      negativeMarks: 1,
      status: "active",
      createdAt: new Date().toISOString(),
      questions: [
        { id:"r1",  type:"MCQ", text:"In a certain code, BOOK is written as CPPL. How is DESK written?",       options:["EFTI","EFTL","DFTK","EFSJ"],                                 correct:1 },
        { id:"r2",  type:"MCQ", text:"Which number comes next in the series: 2, 6, 12, 20, 30, __",           options:["40","42","44","46"],                                         correct:1 },
        { id:"r3",  type:"MCQ", text:"If all Roses are Flowers and some Flowers are Red, then:",               options:["All Roses are Red","Some Roses are Red","No Rose is Red","All Flowers are Roses"], correct:1 },
        { id:"r4",  type:"MCQ", text:"A is B's brother. B is C's sister. C is D's father. How is A related to D?", options:["Uncle","Father","Grandfather","Brother"],              correct:0 },
        { id:"r5",  type:"MCQ", text:"Odd one out: Mango, Banana, Guava, Potato, Apple",                      options:["Mango","Guava","Apple","Potato"],                            correct:3 },
        { id:"r6",  type:"MCQ", text:"The ratio of boys to girls in a class is 3:2. If there are 30 students, how many are girls?", options:["10","12","14","16"],                  correct:1 },
        { id:"r7",  type:"MCQ", text:"If a word reads LEFT → RIGHT, its mirror image reads:",                 options:["LEFT → RIGHT","RIGHT → LEFT","Upside down","Unchanged"],     correct:1 },
        { id:"r8",  type:"MCQ", text:"Pen : Writing :: Knife : __",                                           options:["Sharpening","Cutting","Metal","Handle"],                     correct:1 },
        { id:"r9",  type:"MCQ", text:"If MARCH = 43, then APRIL = ?",                                        options:["52","53","54","55"],                                         correct:0 },
        { id:"r10", type:"MCQ", text:"Find the missing term: Z, X, V, T, __",                                options:["R","S","Q","P"],                                             correct:0 },
        { id:"r11", type:"MCQ", text:"A man walks 5 km North, then 3 km East. His straight-line distance from the start is:", options:["√34 km","8 km","√25 km","6 km"],            correct:0 },
        { id:"r12", type:"MCQ", text:"If 1 January is a Monday, what day is 10 January?",                    options:["Monday","Tuesday","Wednesday","Thursday"],                   correct:2 },
        { id:"r13", type:"MCQ", text:"Which shape has the most lines of symmetry?",                          options:["Rectangle","Equilateral Triangle","Circle","Square"],         correct:2 },
        { id:"r14", type:"MCQ", text:"Blood : Body :: Sap : __",                                             options:["Flower","Leaf","Tree","Root"],                               correct:2 },
        { id:"r15", type:"MCQ", text:"If all cats are animals and no animal is a plant, then:",              options:["Some cats are plants","No cat is a plant","All plants are animals","Cats are not animals"], correct:1 },
        { id:"r16", type:"MCQ", text:"In a row of 20 students, if Ravi is 8th from the left, what is his position from the right?", options:["12th","13th","14th","15th"],         correct:1 },
        { id:"r17", type:"MCQ", text:"Find the odd one out: 8, 27, 64, 100, 125",                           options:["8","27","100","125"],                                        correct:2 },
        { id:"r18", type:"MCQ", text:"If FRIEND is coded as HUMJTK, how is CANDLE coded?",                  options:["EDRIRL","DCQFNG","ECANGL","EDPFNG"],                         correct:0 },
        { id:"r19", type:"MCQ", text:"Which number is missing? 3, 7, 13, 21, 31, __",                       options:["41","43","45","47"],                                         correct:1 },
        { id:"r20", type:"MCQ", text:"A clock shows 3:15. The angle between the hour and minute hands is:", options:["0°","7.5°","15°","22.5°"],                                   correct:1 },
        { id:"r21", type:"MCQ", text:"Doctor : Hospital :: Teacher : __",                                    options:["Book","Student","School","Chalk"],                           correct:2 },
        { id:"r22", type:"MCQ", text:"If South-East becomes North, then what does West become?",             options:["South","North-East","South-East","North-West"],              correct:1 },
        { id:"r23", type:"MCQ", text:"A shopkeeper has 200 items. He sells 25% and then 25% of the rest. How many are left?", options:["112","113","114","115"],                    correct:0 },
        { id:"r24", type:"MCQ", text:"Find the next term: AZ, BY, CX, DW, __",                             options:["EV","EU","FV","FW"],                                         correct:0 },
        { id:"r25", type:"MCQ", text:"Six people sit in a circle. If A sits opposite D, and B is to the left of A, where is E relative to A if E is opposite B?", options:["To A's left","To A's right","Opposite A","Next to D"], correct:1 }
      ]
    },

    // ══════════════════════════════════════════════════════════════
    //  EXAM 5 – HISTORY & GEOGRAPHY  (20 questions – MCQ)
    // ══════════════════════════════════════════════════════════════
    {
      id: "exam_hist",
      title: "History & Geography Challenge",
      subject: "History & Geography",
      description: "Indian and World history, physical geography, maps and important events.",
      duration: 35,
      totalMarks: 80,
      passingMarks: 32,
      marksPerCorrect: 4,
      negativeMarks: 1,
      status: "active",
      createdAt: new Date().toISOString(),
      questions: [
        { id:"h1",  type:"MCQ", text:"In which year did India gain independence?",                            options:["1945","1946","1947","1948"],                                  correct:2 },
        { id:"h2",  type:"MCQ", text:"Who was the last Viceroy of British India?",                           options:["Lord Curzon","Lord Mountbatten","Lord Wavell","Lord Irwin"],  correct:1 },
        { id:"h3",  type:"MCQ", text:"The Battle of Plassey (1757) was fought between the British and:",    options:["Marathas","Mughals","Nawab of Bengal","Hyder Ali"],           correct:2 },
        { id:"h4",  type:"MCQ", text:"Which Indian freedom fighter is associated with the slogan 'Do or Die'?", options:["Bhagat Singh","Netaji Bose","Mahatma Gandhi","Bal Gangadhar Tilak"], correct:2 },
        { id:"h5",  type:"MCQ", text:"The Indus Valley Civilisation flourished around:",                    options:["5000 BCE","3300–1300 BCE","1000 BCE","500 BCE"],              correct:1 },
        { id:"h6",  type:"MCQ", text:"The Tropic of Cancer passes through how many Indian states?",         options:["6","7","8","9"],                                             correct:2 },
        { id:"h7",  type:"MCQ", text:"Which is the longest mountain range in the world?",                   options:["Himalayas","Rockies","Alps","Andes"],                         correct:3 },
        { id:"h8",  type:"MCQ", text:"The Amazon River flows primarily through which country?",             options:["Colombia","Peru","Venezuela","Brazil"],                       correct:3 },
        { id:"h9",  type:"MCQ", text:"The Berlin Wall fell in which year?",                                 options:["1987","1988","1989","1990"],                                  correct:2 },
        { id:"h10", type:"MCQ", text:"Which ancient wonder was located in Alexandria, Egypt?",              options:["Colossus of Rhodes","Lighthouse of Alexandria","Temple of Artemis","Hanging Gardens"], correct:1 },
        { id:"h11", type:"MCQ", text:"The Sahara Desert is located in which continent?",                   options:["Asia","Australia","South America","Africa"],                  correct:3 },
        { id:"h12", type:"MCQ", text:"Who built the Taj Mahal?",                                           options:["Akbar","Humayun","Shah Jahan","Aurangzeb"],                    correct:2 },
        { id:"h13", type:"MCQ", text:"The First World War ended in:",                                      options:["1916","1917","1918","1919"],                                  correct:2 },
        { id:"h14", type:"MCQ", text:"Which country is called the 'Land of the Rising Sun'?",             options:["China","South Korea","Japan","Thailand"],                     correct:2 },
        { id:"h15", type:"MCQ", text:"The Strait of Gibraltar connects the Atlantic Ocean to the:",        options:["Red Sea","Black Sea","Mediterranean Sea","Caspian Sea"],      correct:2 },
        { id:"h16", type:"MCQ", text:"Who was the first President of the Republic of India?",             options:["Jawaharlal Nehru","Rajendra Prasad","Sardar Patel","Maulana Azad"], correct:1 },
        { id:"h17", type:"MCQ", text:"The Deccan Plateau is situated in which part of India?",            options:["Northern","Eastern","Western","Southern"],                    correct:3 },
        { id:"h18", type:"MCQ", text:"Which country has the highest number of UNESCO World Heritage Sites?", options:["China","Italy","France","Spain"],                           correct:1 },
        { id:"h19", type:"MCQ", text:"The Congress of Vienna (1814–15) was called to:",                   options:["End WW1","Reorganise Europe after Napoleon","Form the UN","Establish NATO"], correct:1 },
        { id:"h20", type:"MCQ", text:"Sundarbans, the world's largest mangrove forest, is shared between India and:", options:["Sri Lanka","Myanmar","Bangladesh","Nepal"],        correct:2 }
      ]
    },

    // ══════════════════════════════════════════════════════════════
    //  EXAM 6 – ENGLISH & VOCABULARY  (20 questions – MCQ)
    // ══════════════════════════════════════════════════════════════
    {
      id: "exam_eng",
      title: "English Language & Vocabulary",
      subject: "English",
      description: "Grammar, synonyms, antonyms, fill-in-the-blanks and reading comprehension.",
      duration: 30,
      totalMarks: 80,
      passingMarks: 32,
      marksPerCorrect: 4,
      negativeMarks: 1,
      status: "active",
      createdAt: new Date().toISOString(),
      questions: [
        { id:"e1",  type:"MCQ", text:"Choose the synonym of 'ABUNDANT':",                                    options:["Scarce","Plentiful","Mediocre","Rare"],                       correct:1 },
        { id:"e2",  type:"MCQ", text:"Choose the antonym of 'DILIGENT':",                                   options:["Hardworking","Lazy","Clever","Honest"],                      correct:1 },
        { id:"e3",  type:"MCQ", text:"Fill in the blank: She has been working here __ five years.",         options:["since","for","from","by"],                                   correct:1 },
        { id:"e4",  type:"MCQ", text:"Which sentence is grammatically correct?",                            options:["She don't like coffee.","She doesn't likes coffee.","She doesn't like coffee.","She do not likes coffee."], correct:2 },
        { id:"e5",  type:"MCQ", text:"The plural of 'analysis' is:",                                        options:["analysises","analysis","analyses","analysiss"],               correct:2 },
        { id:"e6",  type:"MCQ", text:"What is the meaning of the idiom 'Bite the bullet'?",                options:["To eat fast","To endure a painful situation","To speak rudely","To avoid work"], correct:1 },
        { id:"e7",  type:"MCQ", text:"Choose the correctly spelled word:",                                  options:["Accomodation","Accommodation","Acommodation","Acomodation"],  correct:1 },
        { id:"e8",  type:"MCQ", text:"Fill in the blank: Neither the students nor the teacher __ present.", options:["are","were","was","been"],                                   correct:2 },
        { id:"e9",  type:"MCQ", text:"Identify the noun in: 'The quick brown fox jumped over the lazy dog'.", options:["quick","jumped","fox","over"],                             correct:2 },
        { id:"e10", type:"MCQ", text:"The word 'benevolent' means:",                                        options:["Cruel","Generous and kind","Fearful","Aggressive"],          correct:1 },
        { id:"e11", type:"MCQ", text:"Which of the following is a compound sentence?",                      options:["She sings.","She sings and dances.","Although she sings, she is shy.","Because she sings well, she won."], correct:1 },
        { id:"e12", type:"MCQ", text:"The passive voice of 'The cat chased the mouse' is:",                options:["The mouse was chased by the cat.","The mouse is chased by the cat.","The mouse had been chased by the cat.","The mouse chased the cat."], correct:0 },
        { id:"e13", type:"MCQ", text:"Choose the synonym of 'EPHEMERAL':",                                 options:["Permanent","Short-lived","Abundant","Reliable"],             correct:1 },
        { id:"e14", type:"MCQ", text:"Fill in the blank: He is __ honest man.",                            options:["a","an","the","no article needed"],                          correct:1 },
        { id:"e15", type:"MCQ", text:"Which word is a conjunction?",                                        options:["Quickly","Although","Beautiful","Run"],                      correct:1 },
        { id:"e16", type:"MCQ", text:"The antonym of 'VERBOSE' is:",                                       options:["Talkative","Wordy","Concise","Fluent"],                      correct:2 },
        { id:"e17", type:"MCQ", text:"Identify the error: 'One of the student were absent.'",              options:["One of","the student","were","absent"],                      correct:2 },
        { id:"e18", type:"MCQ", text:"The figure of speech in 'The stars danced in the sky' is:",         options:["Simile","Metaphor","Personification","Alliteration"],         correct:2 },
        { id:"e19", type:"MCQ", text:"Choose the correct preposition: He is good __ mathematics.",        options:["in","at","on","for"],                                        correct:1 },
        { id:"e20", type:"MCQ", text:"The word 'loquacious' means:",                                       options:["Silent","Very talkative","Angry","Generous"],                correct:1 }
      ]
    },

    // ══════════════════════════════════════════════════════════════
    //  EXAM 7 – MIXED QUESTION TYPES DEMO (MCQ + FILL + SHORT)
    //  ← NEW: showcases all three question types
    // ══════════════════════════════════════════════════════════════
    {
      id: "exam_mixed",
      title: "Mixed Question Types – Demo Exam",
      subject: "General",
      description: "Demonstrates MCQ, Fill in the Blank, and Short Answer question types in a single exam.",
      duration: 25,
      totalMarks: 50,
      passingMarks: 20,
      marksPerCorrect: 4,
      negativeMarks: 1,
      status: "active",
      createdAt: new Date().toISOString(),
      questions: [
        // ── MCQ Questions ──
        { id:"mx1", type:"MCQ",  text:"Which planet is closest to the Sun?",
          options:["Earth","Venus","Mercury","Mars"], correct:2 },
        { id:"mx2", type:"MCQ",  text:"What is the chemical symbol for Gold?",
          options:["Go","Gd","Au","Ag"], correct:2 },
        { id:"mx3", type:"MCQ",  text:"How many sides does a pentagon have?",
          options:["4","5","6","7"], correct:1 },
        { id:"mx4", type:"MCQ",  text:"Who painted the Mona Lisa?",
          options:["Michelangelo","Raphael","Leonardo da Vinci","Donatello"], correct:2 },

        // ── Fill in the Blank Questions ──
        { id:"mx5", type:"FILL", text:"The capital city of France is ________.",
          correct_answer:"Paris", marks:4 },
        { id:"mx6", type:"FILL", text:"Water boils at ________ degrees Celsius at sea level.",
          correct_answer:"100", marks:4 },
        { id:"mx7", type:"FILL", text:"The author of 'Romeo and Juliet' is ________.",
          correct_answer:"Shakespeare", marks:4 },
        { id:"mx8", type:"FILL", text:"The largest ocean in the world is the ________ Ocean.",
          correct_answer:"Pacific", marks:4 },

        // ── Short Answer Questions ──
        { id:"mx9",  type:"SHORT", text:"Explain the difference between weather and climate in 2–3 sentences.",
          marks:5 },
        { id:"mx10", type:"SHORT", text:"Describe two important causes of the First World War.",
          marks:5 },
        { id:"mx11", type:"SHORT", text:"What is photosynthesis? Why is it important for life on Earth?",
          marks:5 },
        { id:"mx12", type:"SHORT", text:"Write a brief note on the importance of the internet in modern education.",
          marks:5 }
      ]
    },

    // ══════════════════════════════════════════════════════════════
    //  EXAM 8 – JAVA PROGRAMMING  (10 FILL + 10 SHORT = 20 questions)
    // ══════════════════════════════════════════════════════════════
    {
      id: "exam_java",
      title: "Java Programming",
      subject: "Computer Science",
      description: "Test your Java fundamentals — syntax, OOP, collections, exception handling, and core concepts. Includes Fill in the Blank and Short Answer questions evaluated by your instructor.",
      duration: 45,
      totalMarks: 100,
      passingMarks: 40,
      marksPerCorrect: 4,
      negativeMarks: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      questions: [

        // ── SECTION A: Fill in the Blank (10 questions × 4 marks = 40 marks) ──

        { id:"jv1",  type:"FILL",
          text:"In Java, the keyword used to define a class is ________.",
          correct_answer:"class", marks:4 },

        { id:"jv2",  type:"FILL",
          text:"The ________ method is the entry point of every Java application.",
          correct_answer:"main", marks:4 },

        { id:"jv3",  type:"FILL",
          text:"In Java, ________ is used to create an object of a class.",
          correct_answer:"new", marks:4 },

        { id:"jv4",  type:"FILL",
          text:"The Java keyword ________ prevents a variable from being modified after it is assigned.",
          correct_answer:"final", marks:4 },

        { id:"jv5",  type:"FILL",
          text:"________ is the parent class of all classes in Java.",
          correct_answer:"Object", marks:4 },

        { id:"jv6",  type:"FILL",
          text:"The keyword ________ is used in Java to handle exceptions at runtime.",
          correct_answer:"catch", marks:4 },

        { id:"jv7",  type:"FILL",
          text:"In Java, an interface method without a body is called an ________ method.",
          correct_answer:"abstract", marks:4 },

        { id:"jv8",  type:"FILL",
          text:"The Java collection class ________ stores key-value pairs and does not allow duplicate keys.",
          correct_answer:"HashMap", marks:4 },

        { id:"jv9",  type:"FILL",
          text:"________ is a Java feature that allows a method to be defined in a subclass with the same name and signature as in its superclass.",
          correct_answer:"Overriding", marks:4 },

        { id:"jv10", type:"FILL",
          text:"The ________ loop in Java is used when the number of iterations is not known in advance.",
          correct_answer:"while", marks:4 },

        // ── SECTION B: Short Answer (10 questions × 6 marks = 60 marks) ──

        { id:"jv11", type:"SHORT",
          text:"Explain the concept of Object-Oriented Programming (OOP) in Java. Name and briefly describe any three of its four main pillars.",
          marks:6 },

        { id:"jv12", type:"SHORT",
          text:"What is the difference between an abstract class and an interface in Java? When would you use each?",
          marks:6 },

        { id:"jv13", type:"SHORT",
          text:"Describe what method overloading is in Java and provide a simple example to illustrate it.",
          marks:6 },

        { id:"jv14", type:"SHORT",
          text:"Explain the difference between checked exceptions and unchecked exceptions in Java. Give one example of each.",
          marks:6 },

        { id:"jv15", type:"SHORT",
          text:"What is the Java Collections Framework? Name at least four commonly used collection classes and briefly describe what each is used for.",
          marks:6 },

        { id:"jv16", type:"SHORT",
          text:"Explain the concept of inheritance in Java with a real-world analogy. How does the 'extends' keyword support inheritance?",
          marks:6 },

        { id:"jv17", type:"SHORT",
          text:"What is a constructor in Java? How does it differ from a regular method? What is a default constructor?",
          marks:6 },

        { id:"jv18", type:"SHORT",
          text:"Describe the difference between '==' and the .equals() method in Java when comparing Strings. Why is it important to use .equals() for String comparison?",
          marks:6 },

        { id:"jv19", type:"SHORT",
          text:"What are access modifiers in Java? Describe the four access modifiers (public, private, protected, default) and their scope.",
          marks:6 },

        { id:"jv20", type:"SHORT",
          text:"Explain what multithreading is in Java. What are the two ways to create a thread in Java, and what is the difference between them?",
          marks:6 }
      ]
    }

  ],

  results: [],
  attempts: []
};

/* ──────────────────────────────────────────
   STORAGE HELPERS
────────────────────────────────────────── */
function dbGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch(e) { return null; }
}

function dbSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ──────────────────────────────────────────
   INITIALISE  –  versioned seed
   Bump DB_VERSION whenever you change seed data.
────────────────────────────────────────── */
const DB_VERSION = 5;   // ← bumped: added Subject Management

/* Default subjects seeded on first run */
const SEED_SUBJECTS = [
  { id: "sub_gk",   name: "General Knowledge" },
  { id: "sub_sci",  name: "Science & Technology" },
  { id: "sub_math", name: "Mathematics" },
  { id: "sub_reas", name: "Reasoning & Aptitude" },
  { id: "sub_hist", name: "History & Geography" },
  { id: "sub_eng",  name: "English & Vocabulary" },
  { id: "sub_cs",   name: "Computer Science" },
];

function initDB() {
  const storedVer = dbGet("ep_db_version");
  if (storedVer !== DB_VERSION) {
    const existingUsers    = dbGet("ep_users")    || SEED.users;
    const existingResults  = dbGet("ep_results")  || [];
    const existingSubjects = dbGet("ep_subjects") || SEED_SUBJECTS;
    dbSet("ep_users",      existingUsers);
    dbSet("ep_exams",      SEED.exams);
    dbSet("ep_results",    existingResults);
    dbSet("ep_attempts",   SEED.attempts);
    dbSet("ep_subjects",   existingSubjects);
    dbSet("ep_initialised", true);
    dbSet("ep_db_version",  DB_VERSION);
  }
}

/* ──────────────────────────────────────────
   SUBJECT FUNCTIONS
────────────────────────────────────────── */
function getSubjects()     { return dbGet("ep_subjects") || []; }
function getSubject(id)    { return getSubjects().find(s => s.id === id) || null; }
function getSubjectName(id){ return id ? (getSubject(id)?.name || "—") : "—"; }

function saveSubject(subject) {
  const subjects = getSubjects();
  const idx = subjects.findIndex(s => s.id === subject.id);
  if (idx >= 0) subjects[idx] = subject; else subjects.push(subject);
  dbSet("ep_subjects", subjects);
}

function deleteSubject(id) {
  dbSet("ep_subjects", getSubjects().filter(s => s.id !== id));
}

/* ──────────────────────────────────────────
   AUTH FUNCTIONS
────────────────────────────────────────── */
function login(email, password) {
  const users = dbGet("ep_users") || [];
  const user  = users.find(u => u.email === email && u.password === password);
  if (!user) return { ok: false, msg: "Invalid email or password." };
  const session = { userId: user.id, name: user.name, email: user.email, role: user.role, loginAt: Date.now() };
  dbSet("ep_session", session);
  return { ok: true, user: session };
}

function signup(name, email, password) {
  const users = dbGet("ep_users") || [];
  if (users.find(u => u.email === email)) return { ok: false, msg: "Email already registered." };
  const newUser = { id: "u_" + Date.now(), name, email, password, role: "student", createdAt: new Date().toISOString() };
  users.push(newUser);
  dbSet("ep_users", users);
  const session = { userId: newUser.id, name, email, role: "student", loginAt: Date.now() };
  dbSet("ep_session", session);
  return { ok: true, user: session };
}

function logout() {
  localStorage.removeItem("ep_session");
  window.location.href = "index.html";
}

function getCurrentUser() { return dbGet("ep_session"); }

function requireAuth(requiredRole) {
  const u = getCurrentUser();
  if (!u) { window.location.href = "index.html"; return null; }
  if (requiredRole && u.role !== requiredRole && u.role !== "admin") {
    window.location.href = "dashboard.html"; return null;
  }
  return u;
}

/* ──────────────────────────────────────────
   EXAM FUNCTIONS
────────────────────────────────────────── */
function getExams()   { return dbGet("ep_exams") || []; }
function getExam(id)  { return getExams().find(e => e.id === id) || null; }

function saveExam(exam) {
  const exams = getExams();
  const idx   = exams.findIndex(e => e.id === exam.id);
  if (idx >= 0) exams[idx] = exam; else exams.push(exam);
  dbSet("ep_exams", exams);
}

function deleteExam(id) {
  dbSet("ep_exams", getExams().filter(e => e.id !== id));
}

/* ──────────────────────────────────────────
   ATTEMPT TRACKING  (prevent re-attempt)
────────────────────────────────────────── */
function hasAttempted(userId, examId) {
  const results = dbGet("ep_results") || [];
  return results.some(r => r.userId === userId && r.examId === examId);
}

function saveResult(result) {
  const results = dbGet("ep_results") || [];
  results.push(result);
  dbSet("ep_results", results);
}

function updateResult(result) {
  const results = dbGet("ep_results") || [];
  const idx = results.findIndex(r => r.id === result.id);
  if (idx >= 0) results[idx] = result;
  dbSet("ep_results", results);
}

function getResultsForUser(userId) {
  return (dbGet("ep_results") || []).filter(r => r.userId === userId);
}

function getAllResults() { return dbGet("ep_results") || []; }

/* ──────────────────────────────────────────
   SHORT ANSWER EVALUATION
   Called by admin to assign marks manually
────────────────────────────────────────── */
function evaluateShortAnswer(resultId, questionId, marks, feedback) {
  const results = dbGet("ep_results") || [];
  const result  = results.find(r => r.id === resultId);
  if (!result) return false;

  if (!result.shortAnswerDetails) result.shortAnswerDetails = {};
  result.shortAnswerDetails[questionId] = {
    ...(result.shortAnswerDetails[questionId] || {}),
    marks:    parseFloat(marks) || 0,
    feedback: feedback || "",
    status:   "evaluated",
    evaluatedAt: new Date().toISOString()
  };

  // Recalculate total score
  const shortTotal = Object.values(result.shortAnswerDetails)
    .filter(s => s.status === "evaluated")
    .reduce((sum, s) => sum + (s.marks || 0), 0);

  result.shortAnswerMarksTotal = shortTotal;
  result.finalScore = result.score + shortTotal;

  // Check if all short answers in that exam have been evaluated
  const exam = getExam(result.examId);
  if (exam) {
    const shortQIds = exam.questions
      .filter(q => (q.type || "MCQ") === "SHORT")
      .map(q => q.id);
    // Only count short answers that were actually attempted (not skipped)
    const attemptedShortIds = shortQIds.filter(qId => {
      const ans = result.answers ? result.answers[qId] : null;
      return ans && ans.trim && ans.trim() !== "";
    });
    result.allShortEvaluated = attemptedShortIds.every(qId =>
      result.shortAnswerDetails[qId] && result.shortAnswerDetails[qId].status === "evaluated"
    );
  }

  dbSet("ep_results", results);
  return true;
}

/* ──────────────────────────────────────────
   SCORE CALCULATOR  – supports all 3 types
   answers: { questionId: value }
     MCQ  → integer option index (or -1)
     FILL → string (or "")
     SHORT→ string (or "")
────────────────────────────────────────── */
function calculateScore(exam, answers) {
  let score = 0, correct = 0, wrong = 0, skipped = 0, pendingCount = 0;
  const shortAnswerDetails = {};

  exam.questions.forEach(q => {
    const type = q.type || "MCQ";
    const ans  = answers[q.id];

    if (type === "MCQ") {
      if (ans === undefined || ans === -1 || ans === null) {
        skipped++;
      } else if (ans === q.correct) {
        score += exam.marksPerCorrect;
        correct++;
      } else {
        score -= exam.negativeMarks;
        wrong++;
      }

    } else if (type === "FILL") {
      const filled = typeof ans === "string" ? ans.trim() : "";
      if (!filled) {
        skipped++;
      } else {
        // Case-insensitive exact match
        const expected = (q.correct_answer || "").trim().toLowerCase();
        if (filled.toLowerCase() === expected) {
          score += q.marks || exam.marksPerCorrect;
          correct++;
        } else {
          // No negative marking for fill-in-the-blank
          wrong++;
        }
      }

    } else if (type === "SHORT") {
      const typed = typeof ans === "string" ? ans.trim() : "";
      if (!typed) {
        skipped++;
      } else {
        pendingCount++;
        shortAnswerDetails[q.id] = {
          answer:   typed,
          status:   "pending",
          marks:    0,
          maxMarks: q.marks || exam.marksPerCorrect,
          feedback: ""
        };
      }
    }
  });

  const autoScore = Math.max(0, score);
  return {
    score:               autoScore,       // auto-evaluated score only
    finalScore:          autoScore,       // will increase after manual evaluation
    correct,
    wrong,
    skipped,
    pendingCount,
    total:               exam.questions.length,
    maxScore:            exam.totalMarks,
    passed:              autoScore >= exam.passingMarks,
    shortAnswerDetails,
    shortAnswerMarksTotal: 0,
    allShortEvaluated:   pendingCount === 0
  };
}

/* ──────────────────────────────────────────
   DATE FORMATTER
────────────────────────────────────────── */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"
  });
}

/* ──────────────────────────────────────────
   TOAST NOTIFICATION
────────────────────────────────────────── */
function toast(msg, type = "info") {
  const colors = { success:"#059669", error:"#DC2626", warning:"#D97706", info:"#2563EB" };
  const icons  = { success:"✓", error:"✕", warning:"⚠", info:"ℹ" };
  const el = document.createElement("div");
  el.innerHTML = `<span style="font-size:1.1rem">${icons[type]}</span> ${msg}`;
  Object.assign(el.style, {
    position:"fixed", bottom:"1.5rem", right:"1.5rem",
    background: colors[type], color:"#fff",
    padding:"0.8rem 1.4rem", borderRadius:"10px",
    boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
    fontFamily:"inherit", fontSize:"0.9rem",
    display:"flex", alignItems:"center", gap:"0.5rem",
    zIndex:"99999", opacity:"0",
    transition:"opacity 0.3s ease, transform 0.3s ease",
    transform:"translateY(10px)"
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; });
  setTimeout(() => {
    el.style.opacity = "0"; el.style.transform = "translateY(10px)";
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* ──────────────────────────────────────────
   AUTO-RUN INIT
────────────────────────────────────────── */
initDB();
