window.MATRIX_LEARNING={
  version:'2026-08-30-source-modules-v1',
  trafficLight:{green:{min:80,label:'HIJAU',action:'Teruskan / kukuhkan dengan latihan campuran.'},yellow:{min:60,label:'KUNING',action:'Ulang topik dalam 2-3 hari.'},red:{min:0,label:'MERAH',action:'Masuk Buku Silap Saya dan baiki segera.'}},
  days:{
    1:{theme:'Kenal Tahap Saya',goal:'Diagnostic Day untuk kenal topik kuat/lemah tanpa tekanan.',target:'Math 80% • Science 80% • BM 80% • English 75%',modules:[
      {id:'d1-math-diagnostic',subject:'Math',title:'Mathematics DLP — Diagnostic',type:'quiz',topics:['nombor bulat','operasi','pecahan','perpuluhan','wang','masa','ukuran'],target:80,desc:'Uji asas Tahun 4. Tunjuk jalan kerja dan semak selepas blok.',questions:[
        {topic:'Whole Numbers',bm:'Nilai digit 7 dalam 72,419 ialah?',en:'What is the value of digit 7 in 72,419?',a:['700','7,000','70,000','72,000'],c:2},
        {topic:'Addition',bm:'24,638 + 13,425 = ?',en:'24,638 + 13,425 = ?',a:['37,063','38,063','38,053','39,063'],c:1},
        {topic:'Fractions',bm:'1/4 + 2/4 = ?',en:'1/4 + 2/4 = ?',a:['2/8','3/4','3/8','1/2'],c:1},
        {topic:'Money',bm:'RM20.00 - RM7.65 = ?',en:'RM20.00 - RM7.65 = ?',a:['RM11.35','RM12.25','RM12.35','RM13.35'],c:2}
      ]},
      {id:'d1-science-diagnostic',subject:'Science',title:'Science DLP — Diagnostic',type:'quiz',topics:['scientific skills','humans','animals','plants','light','sound','energy'],target:80,desc:'Jawab dalam BM/English dan bezakan pemerhatian dengan inferens.',questions:[
        {topic:'Scientific Skills',bm:'Yang manakah pemerhatian?',en:'Which is an observation?',a:['Daun berwarna hijau','Daun sihat kerana hijau','Pokok akan tumbuh tinggi','Pokok suka cahaya'],c:0},
        {topic:'Breathing',bm:'Organ utama manusia untuk bernafas ialah...',en:'The main organ for human breathing is...',a:['Jantung','Paru-paru / lungs','Perut','Buah pinggang'],c:1},
        {topic:'Plants',bm:'Proses tumbuhan hijau membuat makanan ialah...',en:'The process green plants use to make food is...',a:['Respiration','Photosynthesis / fotosintesis','Germination','Excretion'],c:1}
      ]},
      {id:'d1-bm',subject:'BM',title:'Bahasa Melayu — Diagnostik',type:'quiz',topics:['kefahaman','tatabahasa','ayat lengkap'],target:80,desc:'Baca arahan teliti dan jawab dengan ayat yang lengkap.',questions:[
        {topic:'Tatabahasa',bm:'Pilih ayat yang betul.',en:'',a:['Aina sedang membaca buku.','Aina buku sedang membaca.','Sedang Aina buku membaca.'],c:0}
      ]},
      {id:'d1-english',subject:'English',title:'English — Diagnostic + Vocabulary',type:'quiz',topics:['vocabulary','grammar','reading'],target:75,desc:'Use simple Year 4 English and check sentence structure.',questions:[
        {topic:'Grammar',bm:'',en:'Choose the correct sentence.',a:['She go to school.','She goes to school.','She going to school.'],c:1}
      ]},
      {id:'d1-mistake-book',subject:'Activity',title:'Buku Silap Saya — Mula Rekod',type:'activity',topics:['kesalahan','sebab salah','jawapan betul'],desc:'Catat kesalahan penting, sebab salah dan apa yang perlu dibuat semula.'}
    ]},
    2:{theme:'Bahasa & Nombor',goal:'Kukuhkan nombor bulat, operasi, kefahaman bahasa dan DLP ringan.',target:'Math 80% • BM 80% • English 75% • Science 80%',modules:[
      {id:'d2-math-number',subject:'Math',title:'Mathematics DLP — Nombor Bulat',type:'quiz',topics:['nilai tempat','bentuk cerakin','susunan','pembundaran'],target:80,desc:'Nombor bulat hingga 100,000 dalam BM + English.',questions:[
        {topic:'Place Value',bm:'Apakah nilai digit 8 dalam 84,215?',en:'What is the value of digit 8 in 84,215?',a:['8','800','8,000','80,000'],c:3},
        {topic:'Rounding',bm:'67,483 dibundarkan kepada ratus terdekat ialah...',en:'Round 67,483 to the nearest hundred.',a:['67,400','67,500','67,480','68,000'],c:1}
      ]},
      {id:'d2-math-operation',subject:'Math',title:'Mathematics DLP — Operasi',type:'quiz',topics:['tambah','tolak','darab','bahagi'],target:80,desc:'Utamakan ketepatan dan tunjuk langkah pengiraan.',questions:[
        {topic:'Multiply',bm:'246 × 3 = ?',en:'246 × 3 = ?',a:['628','738','748','836'],c:1},
        {topic:'Divide',bm:'864 ÷ 4 = ?',en:'864 ÷ 4 = ?',a:['206','214','216','224'],c:2}
      ]},
      {id:'d2-bm-reading',subject:'BM',title:'Bahasa Melayu — Kefahaman',type:'activity',topics:['bukti dalam petikan','ayat lengkap'],desc:'Baca petikan, cari bukti dan jawab menggunakan ayat lengkap.'},
      {id:'d2-english',subject:'English',title:'English — Vocabulary, Grammar & Reading',type:'quiz',topics:['subject-verb agreement','reading','study routine'],target:75,desc:'Gunakan BM sebagai bantuan, kemudian jawab dalam English.',questions:[
        {topic:'Grammar',bm:'',en:'Choose: Alya ___ every morning.',a:['read','reads','reading','are read'],c:1},
        {topic:'Vocabulary',bm:'',en:'Which word means “kesalahan”?',a:['mistake','break','answer','routine'],c:0}
      ]},
      {id:'d2-science-review',subject:'Science',title:'Science DLP — Quick Review',type:'quiz',topics:['observation','inference','breathing','gills','photosynthesis','light','sound','energy'],target:80,desc:'Sebut istilah English dan BM.',questions:[
        {topic:'Animals',bm:'Ikan bernafas menggunakan...',en:'Fish mainly breathe using...',a:['lungs','gills / insang','spiracles','skin only'],c:1},
        {topic:'Plants',bm:'Pucuk tumbuhan bergerak balas ke arah...',en:'A plant shoot responds toward...',a:['air','tanah','cahaya / light','bunyi'],c:2}
      ]},
      {id:'d2-writing',subject:'English',title:'English Writing — My Study Day',type:'activity',topics:['80-100 words','routine','breaks','help at home','exercise'],desc:'Tulis 80-100 words tentang rutin belajar, rehat, membantu di rumah dan aktiviti fizikal.'}
    ]},
    3:{theme:'Malaysia, Sejarah & Sains',goal:'Kukuhkan Sejarah/patriotisme, kemahiran proses sains dan Life Science.',target:'Latihan utama sekurang-kurangnya 80%',modules:[
      {id:'d3-history',subject:'Activity',title:'Sejarah — Konsep Sejarah & Patriotisme',type:'activity',topics:['kronologi','sumber sejarah','patriotisme'],desc:'Faham kronologi, sumber sejarah dan sebab menghargai sejarah keluarga/negara.'},
      {id:'d3-science-skills',subject:'Science',title:'Science DLP — Scientific Process Skills',type:'quiz',topics:['observation','inference','prediction','classification','fair test','variables'],target:80,desc:'Gunakan istilah English dahulu, kemudian BM.',questions:[
        {topic:'Fair Test',bm:'Dalam ujian adil, berapa pemboleh ubah dimanipulasikan patut diubah pada satu masa?',en:'In a fair test, how many manipulated variables should change at one time?',a:['0','1','2','Semua'],c:1},
        {topic:'Inference',bm:'Inferens ialah...',en:'An inference is...',a:['apa yang dilihat','penjelasan kepada pemerhatian','ramalan masa depan sahaja','ukuran panjang'],c:1}
      ]},
      {id:'d3-life-science',subject:'Science',title:'Science DLP — Humans, Animals & Plants',type:'quiz',topics:['breathing','animal groups','photosynthesis','plant response'],target:80,desc:'Life Science dalam BM + English.',questions:[
        {topic:'Photosynthesis',bm:'Yang manakah diperlukan untuk fotosintesis?',en:'Which is needed for photosynthesis?',a:['Cahaya matahari','Bunyi','Plastik','Pasir sahaja'],c:0},
        {topic:'Plants',bm:'Klorofil berfungsi untuk...',en:'Chlorophyll helps to...',a:['menyerap cahaya','menghasilkan bunyi','menyimpan udara','mengeringkan akar'],c:0}
      ]},
      {id:'d3-math-mixed',subject:'Math',title:'Mathematics DLP — Mixed Maintenance',type:'quiz',topics:['whole numbers','operations','fractions','money'],target:80,desc:'Latihan campuran supaya kemahiran nombor kekal kukuh.',questions:[
        {topic:'Mixed',bm:'90,000 - 24,578 = ?',en:'90,000 - 24,578 = ?',a:['64,422','65,422','65,432','66,422'],c:1}
      ]},
      {id:'d3-bm-english',subject:'Activity',title:'BM + English — Kefahaman & Vocabulary',type:'activity',topics:['kefahaman','tatabahasa','Science/History vocabulary'],desc:'Latihan sederhana; kesalahan penting terus masuk Buku Silap Saya.'}
    ]},
    4:{theme:'Math Power Day',goal:'Mathematics DLP intensif dengan problem solving 4 langkah.',target:'Math keseluruhan 85% • bahagian lain 80%',modules:[
      {id:'d4-number-operation',subject:'Math',title:'Math Power — Nombor & Operasi',type:'quiz',topics:['nilai tempat','pembundaran','tambah','tolak','darab','bahagi','operasi bergabung'],target:85,desc:'Tunjuk kerja, semak unit dan jawapan.',questions:[
        {topic:'Combined Operations',bm:'34,567 + 12,890 - 5,678 = ?',en:'34,567 + 12,890 - 5,678 = ?',a:['40,779','41,779','42,779','43,779'],c:1},
        {topic:'Rounding',bm:'92,451 kepada ribu terdekat ialah...',en:'Round 92,451 to the nearest thousand.',a:['92,000','92,500','93,000','90,000'],c:0}
      ]},
      {id:'d4-fdp',subject:'Math',title:'Math Power — Pecahan, Perpuluhan & Peratus',type:'quiz',topics:['fractions','decimals','percent'],target:80,desc:'Banding, tambah dan hubungkan pecahan-perpuluhan-peratus.',questions:[
        {topic:'Percent',bm:'75% bersamaan...',en:'75% is equal to...',a:['3/4','1/4','3/5','7/10'],c:0},
        {topic:'Decimal',bm:'Yang manakah lebih besar?',en:'Which is greater?',a:['0.65','0.70','Sama','Tidak boleh banding'],c:1}
      ]},
      {id:'d4-measurement',subject:'Math',title:'Math Power — Wang, Masa & Ukuran',type:'quiz',topics:['money','time','length','mass','liquid volume'],target:80,desc:'Gunakan unit yang betul.',questions:[
        {topic:'Mass',bm:'2 kg 500 g bersamaan...',en:'2 kg 500 g equals...',a:['250 g','2,050 g','2,500 g','25,000 g'],c:2},
        {topic:'Time',bm:'180 minit bersamaan...',en:'180 minutes equals...',a:['2 jam','2 jam 30 min','3 jam','3 jam 30 min'],c:2}
      ]},
      {id:'d4-geometry-data',subject:'Math',title:'Math Power — Geometri & Data',type:'quiz',topics:['perimeter','area','angles','coordinates','data'],target:80,desc:'Baca rajah/data dengan teliti.',questions:[
        {topic:'Area',bm:'Luas segi empat tepat 8 cm × 5 cm ialah...',en:'Area of an 8 cm × 5 cm rectangle is...',a:['13 cm²','26 cm²','40 cm²','80 cm²'],c:2}
      ]},
      {id:'d4-problem-solving',subject:'Math',title:'Problem Solving — 4 Langkah',type:'activity',topics:['underline information','identify question','choose operation','check answer'],desc:'1 Gariskan maklumat penting • 2 Kenal pasti soalan • 3 Pilih operasi & tunjuk kerja • 4 Semak dan tulis ayat jawapan.'},
      {id:'d4-science-light',subject:'Science',title:'Science DLP — Quick Maintenance',type:'quiz',topics:['scientific skills','life science'],target:80,desc:'Ulang kaji pendek supaya Science kekal aktif.',questions:[{topic:'Scientific Skills',bm:'Pemboleh ubah bergerak balas ialah perkara yang...',en:'The responding variable is what you...',a:['ubah','ukur/perhatikan','kekalkan','abaikan'],c:1}]}
    ]},
    5:{theme:'English + Science DLP',goal:'English power day bersama Humans, Animals, Plants dan Scientific Skills.',target:'Science ≥80% • English 75-80%',modules:[
      {id:'d5-english-vocab-grammar',subject:'English',title:'English — Vocabulary + Grammar',type:'quiz',topics:['vocabulary','tenses','subject-verb agreement','pronouns'],target:75,desc:'Read slowly, underline keywords, answer before checking.',questions:[
        {topic:'SVA',bm:'',en:'Choose: The plant ___ sunlight.',a:['need','needs','needing','are need'],c:1},
        {topic:'Editing',bm:'',en:'Correct: “The boys plays football.”',a:['The boys play football.','The boys plays football.','The boy play football.','The boys playing football.'],c:0}
      ]},
      {id:'d5-english-reading',subject:'English',title:'English — Reading Comprehension',type:'activity',topics:['main idea','detail','reason','complete answer'],desc:'Read, find evidence and answer in complete sentences.'},
      {id:'d5-english-writing',subject:'English',title:'English — Sentence Construction & Writing',type:'activity',topics:['8-10 sentences','science activity','80-100 words'],desc:'Write clearly using correct tense and science vocabulary.'},
      {id:'d5-science-humans',subject:'Science',title:'Science DLP — Humans / Manusia',type:'quiz',topics:['breathing','excretion','response'],target:80,desc:'Human body concepts dalam English + BM.',questions:[
        {topic:'Breathing',bm:'Gas yang disedut manusia untuk pernafasan ialah...',en:'Humans breathe in mainly...',a:['carbon dioxide','oxygen','nitrogen only','water vapour'],c:1}
      ]},
      {id:'d5-science-animals',subject:'Science',title:'Science DLP — Animals / Haiwan',type:'quiz',topics:['breathing organs','vertebrate groups'],target:80,desc:'Bezakan gills, spiracles, moist skin dan vertebrate groups.',questions:[
        {topic:'Animals',bm:'Serangga bernafas menggunakan...',en:'Insects breathe using...',a:['gills','lungs','spiracles','roots'],c:2}
      ]},
      {id:'d5-science-plants',subject:'Science',title:'Science DLP — Plants / Tumbuhan',type:'quiz',topics:['photosynthesis','plant response'],target:80,desc:'Fahami keperluan fotosintesis dan gerak balas tumbuhan.',questions:[
        {topic:'Plants',bm:'Akar biasanya bergerak balas ke arah...',en:'Roots commonly respond toward...',a:['cahaya sahaja','air/water dan graviti','bunyi','haba sahaja'],c:1}
      ]},
      {id:'d5-scientific-skills',subject:'Science',title:'Scientific Skills',type:'quiz',topics:['observation','inference','prediction','fair test'],target:80,desc:'Gunakan evidence / bukti ketika menerangkan.',questions:[{topic:'Observation',bm:'Pemerhatian dibuat menggunakan...',en:'An observation is made using...',a:['senses or measurements','guesses only','answers only','memory only'],c:0}]},
      {id:'d5-bm',subject:'BM',title:'Bahasa Melayu — Kefahaman, Tatabahasa & Penulisan',type:'activity',topics:['kefahaman','tatabahasa','penulisan ringkas'],desc:'Latihan BM ringkas dan teliti.'}
    ]},
    6:{theme:'STEM Investigation Day',goal:'Science, STEM dan measurement power day.',target:'Science ≥80% • Math ≥80% • DLP ≥20 istilah',modules:[
      {id:'d6-light',subject:'Science',title:'Science DLP — Light / Cahaya',type:'quiz',topics:['reflection','refraction','shadow','transparent','translucent','opaque'],target:80,desc:'Gunakan istilah dua bahasa.',questions:[
        {topic:'Light',bm:'Pantulan cahaya ialah...',en:'Reflection of light is...',a:['cahaya membengkok','cahaya melantun','cahaya hilang','cahaya jadi bunyi'],c:1},
        {topic:'Materials',bm:'Bahan legap / opaque...',en:'An opaque material...',a:['allows all light through','allows some light','blocks light','creates light'],c:2}
      ]},
      {id:'d6-sound',subject:'Science',title:'Science DLP — Sound / Bunyi',type:'quiz',topics:['vibration','sound travel','noise reduction'],target:80,desc:'Sound is produced by vibration.',questions:[{topic:'Sound',bm:'Bunyi dihasilkan oleh...',en:'Sound is produced by...',a:['pantulan','getaran / vibration','cahaya','graviti'],c:1}]},
      {id:'d6-energy',subject:'Science',title:'Science DLP — Energy / Tenaga',type:'quiz',topics:['forms of energy','energy change','renewable energy'],target:80,desc:'Kenal bentuk dan perubahan tenaga.',questions:[{topic:'Energy',bm:'Panel solar menggunakan sumber tenaga...',en:'A solar panel uses...',a:['angin','cahaya matahari','petroleum','bunyi'],c:1}]},
      {id:'d6-materials',subject:'Science',title:'Science DLP — Materials / Bahan',type:'quiz',topics:['absorbency','waterproof','heat conductor','material properties'],target:80,desc:'Pilih bahan berdasarkan sifat dan fungsi.',questions:[{topic:'Materials',bm:'Bahan terbaik untuk baju hujan perlu bersifat...',en:'A good raincoat material should be...',a:['absorbent','waterproof','fragile','transparent only'],c:1}]},
      {id:'d6-stem',subject:'Activity',title:'STEM Investigation — Absorbency / Daya Serapan',type:'activity',topics:['aim','materials','fair test','manipulated variable','responding variable','observation','conclusion'],desc:'Jalankan ujian adil membandingkan bahan menyerap air. Ubah satu pemboleh ubah sahaja.'},
      {id:'d6-math',subject:'Math',title:'Math DLP — Measurement, Money & Time',type:'quiz',topics:['money','time','length','mass','liquid volume'],target:80,desc:'Tulis unit pada setiap jawapan.',questions:[
        {topic:'Liquid Volume',bm:'3 L 250 mL bersamaan...',en:'3 L 250 mL equals...',a:['325 mL','3,025 mL','3,250 mL','32,500 mL'],c:2}
      ]},
      {id:'d6-english-writing',subject:'English',title:'English Writing — My Science Experiment',type:'activity',topics:['80-100 words','materials','aim','steps','observation','result','conclusion'],desc:'Write 80-100 words explaining a simple science experiment.'},
      {id:'d6-dlp-translation',subject:'Activity',title:'DLP Translation — Science Sentences',type:'activity',topics:['BM ↔ English','light','sound','energy','materials','fair test'],desc:'Terjemah ayat Science dua hala dengan istilah yang tepat.'}
    ]},
    7:{theme:'Akhlak, Keluarga & Consolidation',goal:'Baiki topik merah, konsolidasi akademik dan seimbangkan keluarga/nilai.',target:'HIJAU 80-100 • KUNING 60-79 • MERAH <60',modules:[
      {id:'d7-red-math',subject:'Math',title:'Mathematics DLP — Topik Merah',type:'quiz',topics:['whole numbers','add/subtract','multiply/divide','fractions','decimals','percent','money/time','measurement','problem solving'],target:80,desc:'Pilih topik Math paling lemah dan ulang sehingga ≥80%.',questions:[
        {topic:'Whole Numbers',bm:'48,305 dalam bentuk perkataan bermula dengan...',en:'48,305 in words begins with...',a:['forty-eight thousand','four thousand','eighty-four thousand','forty-three thousand'],c:0},
        {topic:'Fraction',bm:'3/5 + 1/5 = ?',en:'3/5 + 1/5 = ?',a:['4/10','4/5','3/10','2/5'],c:1}
      ]},
      {id:'d7-red-science',subject:'Science',title:'Science DLP — Topik Merah',type:'quiz',topics:['scientific skills','humans','animals','plants','light','sound','energy','materials','earth','machines'],target:80,desc:'Ulang topik Science merah dengan penjelasan sebab.',questions:[
        {topic:'Light',bm:'Bayang terbentuk apabila cahaya dihalang oleh objek...',en:'A shadow forms when light is blocked by an...',a:['transparent object','opaque object','light source','sound source'],c:1},
        {topic:'Machines',bm:'Mesin ringkas membantu manusia dengan...',en:'Simple machines help by...',a:['menambah kerja','mengurangkan usaha','menghapus graviti','menghasilkan makanan'],c:1}
      ]},
      {id:'d7-bm',subject:'BM',title:'Bahasa Melayu — Consolidation',type:'quiz',topics:['imbuhan','penjodoh bilangan','kata sendi','kata hubung','simpulan bahasa'],target:80,desc:'Latihan tatabahasa dan penggunaan bahasa.',questions:[
        {topic:'Imbuhan',bm:'Aina sedang ______ buku di rak. (susun)',en:'',a:['susun','menyusun','disusun','tersusun sahaja'],c:1},
        {topic:'Kata Sendi',bm:'Aina pergi ____ perpustakaan.',en:'',a:['di','ke','dari','daripada'],c:1}
      ]},
      {id:'d7-english',subject:'English',title:'English — Consolidation',type:'quiz',topics:['pronouns','tenses','SVA','articles','prepositions','adjectives','adverbs'],target:75,desc:'Mixed English correction and short responses.',questions:[
        {topic:'Tense',bm:'',en:'Yesterday we ___ badminton.',a:['play','played','plays','playing'],c:1},
        {topic:'Adjective',bm:'',en:'Aina is a ___ girl.',a:['helpful','helpfully','help','helped'],c:0}
      ]},
      {id:'d7-history-rbt',subject:'Activity',title:'Sejarah + RBT Mini Project',type:'activity',topics:['kronologi','sumber sejarah','susun meja belajar'],desc:'Ulang konsep sejarah dan jalankan projek susun meja belajar lebih cekap.'},
      {id:'d7-family-reflection',subject:'Activity',title:'Akhlak, Keluarga & Refleksi',type:'activity',topics:['2 kebaikan','1 tugas rumah','aktiviti fizikal','refleksi'],desc:'Catat satu perkara baik, aktiviti fizikal dan satu kesalahan yang tidak mahu diulang.'}
    ]},
    8:{theme:'Mini MATRIX Exam + Back to School',goal:'Simulasi akhir: cuba ikut masa, semak selepas tamat dan pilih topik merah keutamaan.',target:'HIJAU 80-100 • KUNING 60-79 • MERAH <60',modules:[
      {id:'d8-mini-math',subject:'Math',title:'Mini MATRIX — Mathematics DLP',type:'quiz',topics:['whole numbers','operations','fractions','decimals','percent','money','time','measurement','geometry','coordinates','ratio','data','problem solving'],target:80,desc:'Set berjangka masa. Jangan semak ketika menjawab.',questions:[
        {topic:'Division',bm:'936 ÷ 4 = ?',en:'936 ÷ 4 = ?',a:['224','234','244','264'],c:1},
        {topic:'Measurement',bm:'435 cm bersamaan...',en:'435 cm equals...',a:['4 m 35 cm','43 m 5 cm','3 m 45 cm','4 m 53 cm'],c:0},
        {topic:'Area',bm:'Segi empat 7 cm × 7 cm mempunyai luas...',en:'A 7 cm × 7 cm square has area...',a:['14 cm²','28 cm²','49 cm²','56 cm²'],c:2}
      ]},
      {id:'d8-mini-science',subject:'Science',title:'Mini MATRIX — Science DLP',type:'quiz',topics:['scientific skills','breathing','excretion','animals','plants','light','sound','energy','materials','earth','machines','data'],target:80,desc:'Final Science set dalam BM + English.',questions:[
        {topic:'Scientific Skills',bm:'Dalam ujian bahan menyerap air, jenis bahan ialah pemboleh ubah...',en:'In an absorbency test, material type is the...',a:['manipulated','responding','constant only','conclusion'],c:0},
        {topic:'Energy',bm:'Satu sumber tenaga boleh baharu ialah...',en:'One renewable energy source is...',a:['petroleum','coal','solar','diesel'],c:2},
        {topic:'Earth',bm:'Mengapa sumber semula jadi perlu digunakan secara bijak?',en:'Why should natural resources be used wisely?',a:['Supaya cepat habis','Untuk generasi akan datang dan alam sekitar','Supaya lebih mahal','Tiada sebab'],c:1}
      ]},
      {id:'d8-bm',subject:'BM',title:'Bahasa Melayu — Final Practice',type:'quiz',topics:['kefahaman','tatabahasa','imbuhan','ejaan','nilai'],target:80,desc:'Jawab dengan ayat lengkap dan tanda baca betul.',questions:[
        {topic:'Kata Sendi',bm:'Buku dimasukkan ____ dalam beg.',en:'',a:['ke','di','dari','daripada'],c:0}
      ]},
      {id:'d8-english',subject:'English',title:'English — Final Practice',type:'quiz',topics:['grammar','tenses','reading','translation','writing'],target:75,desc:'Complete sentences and correct grammar.',questions:[
        {topic:'Grammar',bm:'',en:'She ___ her answers before submitting.',a:['check','checks','checking','are check'],c:1}
      ]},
      {id:'d8-red-plan',subject:'Activity',title:'Topik Merah — Pelan Selepas Cuti',type:'activity',topics:['pilih maksimum 3 topik','5 soalan contoh','semak sebab salah','5 soalan baru','naik taraf ≥80%'],desc:'Pilih maksimum 3 topik utama. Baca nota ringkas → 5 soalan contoh → faham kesalahan → 5 soalan baru → jika ≥80%, tukar HIJAU.'},
      {id:'d8-reflection',subject:'Activity',title:'Refleksi 8 Hari + Sasaran Oktober',type:'activity',topics:['perkara dibanggakan','subjek meningkat','topik sukar','tabiat belajar','sasaran markah'],desc:'Rumusan akhir dan pelan sambungan selepas sekolah dibuka.'},
      {id:'d8-back-school',subject:'Activity',title:'Back-to-School Checklist',type:'activity',topics:['beg','buku','alat tulis','uniform','kasut','tidur awal'],desc:'Sediakan semua keperluan sekolah dan tidur awal.'}
    ]}
  }
};
