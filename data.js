// ebay-brand-research データ定義
// 内蔵の「目安」データ（★需要・USD価格帯）は日本セラーの中古品が eBay US で売れる相場の大まかな参考値です。
// ブックマークレットで取り込んだ実測データがあれば、必ずそちらが優先されます。

const CATS = [
  { id: 'bag',        ja: 'ハンドバッグ',       kw: 'handbag',                                        ship: 4000 },
  { id: 'shoulder',   ja: 'ショルダー/クロスボディ', kw: '(shoulder bag,crossbody)',                  ship: 3500 },
  { id: 'tote',       ja: 'トート',             kw: 'tote',                                           ship: 4500 },
  { id: 'backpack',   ja: 'リュック/バックパック', kw: 'backpack',                                     ship: 4500 },
  { id: 'wallet',     ja: '財布',               kw: 'wallet',                                         ship: 1500 },
  { id: 'small',      ja: '小物（ポーチ・カード・コイン・キー）', kw: '(pouch,card case,coin purse,key case,key holder)', ship: 1300 },
  { id: 'acc',        ja: 'チャーム/キーリング', kw: '(bag charm,keyring,key ring,key chain)',         ship: 1200 },
  { id: 'belt',       ja: 'ベルト',             kw: 'belt',                                           ship: 1800 },
  { id: 'scarf',      ja: 'スカーフ/ストール',  kw: '(scarf,stole,shawl)',                            ship: 1500 },
  { id: 'shoes',      ja: '靴',                 kw: '(shoes,sneakers,loafers,pumps,boots,sandals)',   ship: 4500 },
  { id: 'apparel',    ja: '衣類',               kw: '(jacket,coat,shirt,dress,sweater,cardigan)',     ship: 4000 },
  { id: 'watch',      ja: '時計',               kw: 'watch',                                          ship: 3000 },
  { id: 'jewelry',    ja: 'ジュエリー',         kw: '(necklace,ring,bracelet,earrings,pendant)',      ship: 1500 },
  { id: 'sunglasses', ja: 'サングラス/眼鏡',    kw: '(sunglasses,eyeglasses)',                        ship: 1500 },
];

// c: { カテゴリID: [需要★1〜5, 目安下限USD, 目安上限USD] }
// models: タイトルから自動判定するモデル名（英語）。lines: ライン/素材名
const BRANDS = [
  {
    id: 'lv', n: 'Louis Vuitton', ja: 'ルイ・ヴィトン', kw: 'Louis Vuitton', al: ['LV', 'ヴィトン', 'Vuitton'], grp: 'lux',
    note: '海外需要No.1。廃盤モデル（Papillon・Ellipse・Looping・Multicolore）はヴィンテージ需要が強い。日付コード・製造刻印・内側の状態（ベタつき）の写真が必須。',
    c: { bag: [5, 200, 900], shoulder: [5, 250, 900], tote: [5, 300, 1200], backpack: [4, 300, 1200], wallet: [5, 80, 350], small: [5, 60, 260], acc: [4, 80, 300], belt: [3, 100, 300], scarf: [3, 80, 300], shoes: [3, 100, 400], apparel: [2, 150, 700], watch: [2, 600, 3000], jewelry: [3, 150, 600], sunglasses: [2, 120, 350] },
    models: ['Speedy Bandouliere', 'Speedy', 'Neverfull', 'Alma', 'Keepall Bandouliere', 'Keepall', 'Pochette Accessoires', 'Multi Pochette', 'Mini Pochette', 'Pochette Metis', 'Pochette Florentine', 'Zippy', 'Sarah', 'Petit Noe', 'Neonoe', 'Noe', 'Bucket', 'Papillon', 'Ellipse', 'Musette', 'Cabas Piano', 'Cabas Mezzo', 'Cabas Alto', 'Trocadero', 'Saumur', 'Boulogne', 'Looping', 'Batignolles', 'Palermo', 'Artsy', 'Delightful', 'Totally', 'Favorite', 'Eva', 'Montaigne', 'Capucines', 'OnTheGo', 'On The Go', 'Twist', 'Felicie', 'Coussin', 'Petite Malle', 'Croissant', 'Sologne', 'Pallas', 'Turenne', 'Galliera', 'Tivoli', 'Retiro', 'Manhattan', 'Hampstead', 'Berkeley', 'Brea', 'Melrose', 'Roxbury', 'Wilshire', 'Rosewood', 'Bellevue', 'Josephine', 'Nano', 'Mini HL', 'Danube', 'Amazone', 'Reporter', 'Nile', 'Chantilly', 'Marly', 'Saint Cloud', 'Sac Plat', 'Vavin', 'Deauville', 'Trouville', 'Riveli', 'Vanity', 'Dauphine', 'Loop', 'Porte Monnaie', 'Portefeuille', 'Clemence', 'Emilie', 'Victorine', 'Key Pouch', 'Cles', 'Multicles', 'Brazza', 'Marco', 'Slender', 'Multiple', 'Toiletry', 'Trousse', 'Cosmetic Pouch', 'Bumbag', 'Christopher', 'Montsouris', 'Palm Springs', 'Bosphore', 'Michael', 'Josh', 'Discovery', 'Sirius', 'Pegase', 'Carryall', 'Steamer', 'Lockit', 'Odeon', 'Menilmontant', 'Abbesses', 'Bastille', 'Naviglio', 'Tambourin', 'Sac Chien', 'Bandouliere', 'Agenda', 'Wapity', 'Tambour'],
    lines: ['Monogram Multicolore', 'Multicolore', 'Monogram Empreinte', 'Empreinte', 'Monogram Vernis', 'Vernis', 'Monogram Mat', 'Monogram Eclipse', 'Eclipse', 'Monogram Reverse', 'Monogram Giant', 'Monogram Denim', 'Denim', 'Monogram Idylle', 'Idylle', 'Mini Lin', 'Monogram', 'Damier Ebene', 'Damier Azur', 'Damier Graphite', 'Damier Infini', 'Damier', 'Epi', 'Taiga', 'Mahina', 'Suhali', 'Utah', 'Nomade', 'Antheia', 'Cerises', 'Murakami', 'Graffiti', 'Perfo', 'Dentelle', 'Escale', 'Game On', 'Bandana', 'Cuir', 'Vintage'],
  },
  {
    id: 'chanel', n: 'Chanel', ja: 'シャネル', kw: 'Chanel', al: ['CHANEL', 'シャネル'], grp: 'lux',
    note: '高単価。$500以上のバッグは eBay Authenticity Guarantee 対象。シリアルシール・ギャランティカードの有無で価格が大きく変わる。ヴィンテージ（ココマーク・マトラッセ）の需要が非常に強い。',
    c: { bag: [5, 800, 4500], shoulder: [5, 900, 4500], tote: [4, 700, 3000], backpack: [3, 800, 3500], wallet: [4, 150, 700], small: [4, 120, 600], acc: [4, 100, 500], belt: [3, 200, 800], scarf: [3, 100, 400], shoes: [3, 150, 600], apparel: [3, 300, 2000], watch: [3, 800, 4000], jewelry: [5, 150, 900], sunglasses: [3, 120, 400] },
    models: ['Classic Flap', 'Double Flap', 'Single Flap', '2.55', 'Reissue', 'Boy', 'Chevron', 'Matelasse', 'Coco Handle', 'Gabrielle', 'Chanel 19', 'WOC', 'Wallet on Chain', 'Deauville', 'Cambon', 'Vanity', 'Timeless', 'Cabas', 'Camera Bag', 'Diana', 'Trendy CC', 'Business Affinity', 'Grand Shopping', 'GST', 'PST', 'Petite Shopping', 'Jumbo', 'Maxi', 'Mini Flap', 'Square Mini', 'Rectangular Mini', 'Coco Mark', 'CC Logo', 'Camellia', 'Tweed', 'Cosmetic Case', 'Zip Wallet', 'Long Wallet', 'Bifold', 'Trifold', 'Card Holder', 'Coin Purse', 'Brooch', 'Earrings', 'Necklace', 'Bracelet', 'J12', 'Premiere', 'Boy.Friend', 'Sport Line', 'Travel Line', 'Chocolate Bar', 'Wild Stitch', 'Triple Coco', 'Bicolore', 'Mademoiselle', 'Turnlock', 'Chain Tote', 'Executive Tote', 'Medallion', 'Cerf', 'Kelly', 'Tote'],
    lines: ['Caviar', 'Lambskin', 'Calfskin', 'Patent', 'Tweed', 'Denim', 'Canvas', 'Vintage', 'Gold Hardware', 'Silver Hardware', 'GHW', 'SHW', 'Quilted', 'Bicolore'],
  },
  {
    id: 'hermes', n: 'Hermès', ja: 'エルメス', kw: 'Hermes', al: ['Hermès', 'エルメス'], grp: 'lux',
    note: '最高単価帯。刻印（製造年）と付属品を必ず記載。カレ（スカーフ）・ロデオチャーム・Clic H など小物の回転が速く、参入しやすい。',
    c: { bag: [5, 1500, 15000], shoulder: [5, 1200, 8000], tote: [5, 900, 4000], backpack: [3, 800, 3000], wallet: [4, 250, 1500], small: [4, 120, 900], acc: [5, 150, 700], belt: [4, 250, 900], scarf: [5, 150, 600], shoes: [3, 200, 900], apparel: [2, 200, 1500], watch: [3, 600, 3000], jewelry: [4, 250, 1200], sunglasses: [2, 150, 400] },
    models: ['Birkin', 'Mini Kelly', 'Kelly Danse', 'Kelly Depeches', 'Kelly Dog', 'Kelly Watch', 'Kelly', 'Constance', 'Evelyne', 'Picotin', 'Garden Party', 'Herbag', 'Mini Lindy', 'Lindy', 'Bolide Pouch', 'Bolide', 'Trim', 'Jige', 'Bearn', 'Azap', 'Dogon', 'Silk In', "Silk'in", 'Calvi', 'Bastia', 'Rodeo', 'Twilly', 'Carre', 'Carré', 'Clic H', 'Clic Clac', "Chaine d'Ancre", 'Collier de Chien', 'CDC', 'Halzan', 'Verrou', 'Roulis', 'Cabag', 'Fourre Tout', 'Cabasellier', 'Victoria', 'Plume', 'Sac a Depeches', 'Vespa', 'Marwari', 'Toolbox', 'Evercolor', 'Heure H', 'Cape Cod', 'Clipper', 'Arceau', 'Apple Watch', 'Oran', 'Chypre', 'Izmir', 'Bouclerie', 'Cadena', 'Petit H', 'Paddock', 'Glenan', 'Farming', 'Tiny Kelly', 'Aline', 'Berline', 'Steve', 'Citynews', 'Yeoh', 'Karo', 'Zip Pouch', 'Ulysse', 'Agenda', 'Serie', 'Ex Libris'],
    lines: ['Togo', 'Epsom', 'Clemence', 'Swift', 'Box Calf', 'Chevre', 'Ostrich', 'Croc', 'Crocodile', 'Lizard', 'Toile', 'Canvas', 'Silk', 'Cashmere', 'Gold Hardware', 'Palladium', 'PHW', 'GHW', 'Vintage'],
  },
  {
    id: 'gucci', n: 'Gucci', ja: 'グッチ', kw: 'Gucci', al: ['グッチ'], grp: 'lux',
    note: 'オールドグッチ（シェリーライン・旧ロゴ）が海外で根強い。GGキャンバスは内側のベタつき（加水分解）を必ず確認・記載。',
    c: { bag: [4, 120, 600], shoulder: [4, 150, 700], tote: [4, 120, 500], backpack: [3, 150, 500], wallet: [4, 50, 250], small: [4, 40, 180], acc: [3, 60, 200], belt: [4, 100, 320], scarf: [2, 60, 200], shoes: [3, 80, 350], apparel: [3, 100, 600], watch: [3, 100, 400], jewelry: [3, 100, 400], sunglasses: [2, 80, 250] },
    models: ['GG Marmont', 'Marmont', 'Ophidia', 'Dionysus', 'Jackie', 'Horsebit Loafer', 'Horsebit', 'Soho', 'Bamboo', 'Sherry Line', 'Sherry', 'GG Supreme', 'GG Canvas', 'Sylvie', 'Padlock', 'Diana', 'Blondie', 'Boston', 'Abbey', 'Sukey', 'Bree', 'Joy', 'Eden', 'Guccissima', 'Interlocking G', 'Web', 'Princy', 'Britt', 'Swing', 'Chain Tote', 'Old Gucci', 'Vintage', 'Bardot', 'Aphrodite', 'Attache', 'Tiger', 'Bee', 'Kingsnake', 'Flora', 'Micro GG', 'Neo Vintage', 'Zumi', 'Rajah', 'Ace Sneaker', 'Ace', 'Rhyton', 'Jordaan', 'Brixton', 'Princetown', 'Double G', 'Long Wallet', 'Bifold', 'Zip Around', 'Card Case', 'Coin Case', 'Key Case', 'Belt Bag', 'Duffle', 'Messenger', 'Pouch', 'G-Timeless', 'Grip', 'Dive', 'Signature', 'Change'],
    lines: ['GG Supreme', 'GG Canvas', 'Guccissima', 'Signature', 'Microguccissima', 'Sherry', 'Web', 'Jumbo GG', 'Vintage', 'Old Gucci', 'PVC', 'Leather', 'Suede', 'Velvet', 'Denim', 'Nylon', 'Ophidia'],
  },
  {
    id: 'prada', n: 'Prada', ja: 'プラダ', kw: 'Prada', al: ['プラダ'], grp: 'lux',
    note: 'ナイロン（テスート）バッグはY2K人気で回転が速い。三角ロゴプレートの状態とギャランティカードの有無を記載。',
    c: { bag: [4, 100, 500], shoulder: [4, 120, 600], tote: [4, 120, 600], backpack: [4, 150, 550], wallet: [3, 50, 220], small: [3, 40, 180], acc: [2, 50, 200], belt: [2, 60, 200], scarf: [1, 40, 150], shoes: [3, 80, 350], apparel: [3, 100, 700], watch: [1, 80, 300], jewelry: [2, 80, 300], sunglasses: [3, 80, 250] },
    models: ['Re-Edition 2005', 'Re-Edition 2000', 'Re-Edition', 'Re Edition', 'Galleria', 'Saffiano', 'Tessuto', 'Nylon', 'Vela', 'Cahier', 'Cleo', 'Triangle', 'Symbole', 'Bandoliera', 'Bowling', 'Double Bag', 'Cargo', 'Duet', 'Panier', 'Etiquette', 'Pionniere', 'Esplanade', 'Monochrome', 'Sidonie', 'Odette', 'Mini Hobo', 'Hobo', 'Pocono', 'Vitello', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Holder', 'Coin Purse', 'Key Case', 'Pouch', 'Cosmetic', 'Linea Rossa', 'Sport', 'Cloudbust', "America's Cup", 'Monolith', 'Brushed', 'Backpack', 'Belt Bag', 'Tote', 'Shopper'],
    lines: ['Tessuto', 'Nylon', 'Saffiano', 'Vitello Daino', 'Vitello Move', 'Vitello', 'Spazzolato', 'Re-Nylon', 'Vintage', 'Leather', 'Canvas', 'Denim', 'Linea Rossa'],
  },
  {
    id: 'celine', n: 'Celine', ja: 'セリーヌ', kw: 'Celine', al: ['セリーヌ', 'Céline'], grp: 'lux',
    note: '旧セリーヌ「マカダム柄」「馬車金具」のヴィンテージ需要が非常に強い。現行トリオンフも人気。',
    c: { bag: [4, 150, 900], shoulder: [4, 150, 1000], tote: [4, 150, 800], backpack: [2, 150, 500], wallet: [3, 60, 300], small: [3, 50, 250], acc: [2, 50, 200], belt: [2, 80, 250], scarf: [2, 60, 200], shoes: [2, 100, 400], apparel: [3, 150, 900], watch: [1, 80, 300], jewelry: [2, 100, 400], sunglasses: [3, 100, 300] },
    models: ['Nano Luggage', 'Micro Luggage', 'Luggage', 'Trapeze', 'Belt Bag', 'Teen Triomphe', 'Cuir Triomphe', 'Triomphe', 'Ava', 'Macadam', 'Classic Box', 'Box Bag', 'Vertical Cabas', 'Cabas', 'Phantom', 'Trio', 'Big Bag', 'Bucket', 'Sangle', 'Seau', 'Frame', 'Clasp', 'C Bag', 'Sixteen', 'Romy', 'Folco', 'Besace', 'Horse Carriage', 'Carriage', 'Blazon', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Holder', 'Coin Purse', 'Pouch', 'Compact Wallet', 'Chain Wallet', 'Strap Wallet', 'Vintage', 'Old Celine', 'Boston', 'Tote'],
    lines: ['Macadam', 'Triomphe Canvas', 'Triomphe', 'Vintage', 'Old Celine', 'Leather', 'Canvas', 'Suede', 'Calfskin', 'Grained'],
  },
  {
    id: 'dior', n: 'Dior', ja: 'ディオール', kw: 'Dior', al: ['Christian Dior', 'ディオール'], grp: 'lux',
    note: 'トロッター柄ヴィンテージ（サドル・ブックトート・ヴィンテージ小物）とレディディオールが強い。',
    c: { bag: [4, 200, 1500], shoulder: [4, 250, 1800], tote: [4, 300, 1800], backpack: [2, 200, 800], wallet: [3, 80, 400], small: [3, 60, 350], acc: [3, 80, 350], belt: [2, 100, 350], scarf: [2, 60, 250], shoes: [3, 120, 500], apparel: [3, 150, 1200], watch: [2, 150, 800], jewelry: [3, 100, 500], sunglasses: [3, 100, 350] },
    models: ['Saddle', 'Mini Lady', 'Lady Dior', 'Book Tote', 'Trotter', 'Oblique', 'Honeycomb', 'Diorama', '30 Montaigne', 'Caro', 'Bobby', 'Diorissimo', 'Cannage', 'Malice', 'Street Chic', 'Rasta', 'Romantique', 'Flight', 'Girly', 'Boston', 'Vanity', 'Pouch', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Holder', 'Coin Purse', 'Key Case', 'Belt Bag', 'Bucket', 'My ABCDior', 'Diorstar', 'Dior Addict', 'Miss Dior', 'Granville', 'Panarea', 'Diorling', 'Dior Tribales', 'Tribales', 'Rose des Vents', 'CD Logo', "J'adior", 'Cruise', 'Walk n Dior', 'B23', 'B22', 'B27', 'Vintage'],
    lines: ['Trotter', 'Oblique', 'Cannage', 'Honeycomb', 'Lambskin', 'Patent', 'Canvas', 'Vintage', 'Leather', 'Denim', 'Nylon'],
  },
  {
    id: 'fendi', n: 'Fendi', ja: 'フェンディ', kw: 'Fendi', al: ['フェンディ'], grp: 'lux',
    note: 'ズッカ柄・ズッキーノ柄のヴィンテージが人気。バゲット・ピーカブーは高値安定。',
    c: { bag: [4, 100, 700], shoulder: [4, 120, 800], tote: [3, 100, 500], backpack: [2, 120, 500], wallet: [3, 50, 250], small: [3, 40, 200], acc: [3, 60, 300], belt: [2, 80, 250], scarf: [2, 50, 200], shoes: [2, 80, 350], apparel: [2, 100, 700], watch: [2, 100, 400], jewelry: [2, 80, 300], sunglasses: [2, 80, 250] },
    models: ['Mama Baguette', 'Mini Baguette', 'Chain Baguette', 'Baguette', 'Peekaboo', 'Zucca', 'Zucchino', 'By The Way', 'Spy', 'Kan I', 'Kan U', 'Sunshine', 'Mon Tresor', 'FF Logo', 'Pequin', 'Selleria', 'Dotcom', '2Jours', '3Jours', 'Chameleon', 'Roll Bag', 'Bag Bugs', 'Monster', 'Karlito', 'Boston', 'Croissant', 'Vanity', 'Camera Case', 'Pouch', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Holder', 'Coin Purse', 'Key Case', 'Belt Bag', 'Bucket', 'Hobo', 'Tote', 'Vintage', 'Shopper', 'Forever Fendi'],
    lines: ['Zucca', 'Zucchino', 'Pequin', 'Selleria', 'FF', 'Canvas', 'Leather', 'Nylon', 'Vintage', 'Fur', 'Suede'],
  },
  {
    id: 'bottega', n: 'Bottega Veneta', ja: 'ボッテガ・ヴェネタ', kw: 'Bottega Veneta', al: ['ボッテガ', 'Bottega'], grp: 'lux',
    note: 'イントレチャート（編み込み）財布・小物は定番で回転が速い。角スレと編み込みのほつれを記載。',
    c: { bag: [3, 150, 900], shoulder: [3, 150, 1000], tote: [3, 150, 700], backpack: [2, 150, 600], wallet: [4, 60, 300], small: [4, 40, 220], acc: [2, 50, 200], belt: [2, 80, 250], scarf: [1, 50, 200], shoes: [2, 100, 400], apparel: [2, 100, 600], watch: [1, 100, 400], jewelry: [2, 100, 400], sunglasses: [2, 80, 250] },
    models: ['Intrecciato', 'Chain Cassette', 'Cassette', 'Mini Jodie', 'Jodie', 'Pouch', 'Arco', 'Cabat', 'Knot', 'Roma', 'Olimpia', 'Veneta', 'Hobo', 'Loop', 'Andiamo', 'Sardine', 'Point', 'Marie', 'Padded', 'Candy', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Key Ring', 'Clutch', 'Messenger', 'Briefcase', 'Tote', 'Backpack', 'Belt Bag', 'Vintage'],
    lines: ['Intrecciato', 'Nappa', 'Lambskin', 'Calfskin', 'Cassette', 'Padded', 'Vintage', 'Leather'],
  },
  {
    id: 'balenciaga', n: 'Balenciaga', ja: 'バレンシアガ', kw: 'Balenciaga', al: ['バレンシアガ'], grp: 'lux',
    note: 'シティ・ファースト（モーターサイクル）の旧型と、Triple S などのスニーカーが強い。',
    c: { bag: [3, 150, 700], shoulder: [3, 150, 700], tote: [3, 150, 600], backpack: [2, 150, 500], wallet: [3, 60, 250], small: [3, 40, 200], acc: [2, 50, 200], belt: [2, 80, 250], scarf: [1, 50, 200], shoes: [3, 120, 450], apparel: [3, 120, 700], watch: [1, 100, 400], jewelry: [1, 80, 300], sunglasses: [2, 80, 250] },
    models: ['Mini City', 'City', 'First', 'Motorcycle', 'Papier', 'Hourglass', 'Neo Classic', 'Neo Cagole', 'Navy Cabas', 'Le Cagole', 'Everyday', 'Explorer', 'Triple S', 'Track', 'Speed', 'Runner', 'Defender', 'Giant', 'Classic', 'Town', 'Work', 'Part Time', 'Velo', 'Day', 'Hip', 'Ville', 'Bazar', 'Shopping', 'Cash', 'Crush', 'Souvenir', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Holder', 'Coin Purse', 'Key Case', 'Belt Bag', 'Backpack', 'Tote', 'Hoodie', 'T-Shirt', 'Cap', 'Vintage'],
    lines: ['Giant', 'Classic', 'Agneau', 'Chevre', 'Lambskin', 'Nylon', 'Canvas', 'Leather', 'Vintage'],
  },
  {
    id: 'ysl', n: 'Saint Laurent', ja: 'サンローラン', kw: 'Saint Laurent', al: ['YSL', 'Yves Saint Laurent', 'サンローラン', 'イヴサンローラン'], grp: 'lux',
    note: 'ルルー・ケイトなど現行チェーンバッグと、ヴィンテージYSL（旧ロゴ）の両方に需要がある。',
    c: { bag: [3, 200, 900], shoulder: [4, 250, 1000], tote: [3, 150, 700], backpack: [2, 150, 500], wallet: [3, 60, 300], small: [3, 50, 250], acc: [2, 50, 200], belt: [2, 80, 250], scarf: [2, 50, 200], shoes: [2, 100, 400], apparel: [2, 100, 700], watch: [1, 100, 400], jewelry: [2, 80, 300], sunglasses: [2, 80, 250] },
    models: ['Loulou', 'Kate', 'Sac de Jour', 'Envelope', 'Niki', 'Cassandra', 'Cassandre', 'Monogram', 'Vintage YSL', 'Cabas Rive Gauche', 'Rive Gauche', 'Solferino', 'Le 5 a 7', 'Le 5 à 7', 'Manhattan', 'Sunset', 'College', 'Baby Duffle', 'Muse', 'Downtown', 'Tribute', 'Lou Camera', 'Camera Bag', 'Jamie', 'Puffer', 'Gaby', 'Icare', 'Hobo', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Belt Bag', 'Tote', 'Backpack', 'Vintage'],
    lines: ['Monogram', 'Matelasse', 'Chevron', 'Grain de Poudre', 'Suede', 'Croc Embossed', 'Leather', 'Canvas', 'Vintage'],
  },
  {
    id: 'burberry', n: 'Burberry', ja: 'バーバリー', kw: 'Burberry', al: ['Burberrys', 'バーバリー', 'バーバリーズ'], grp: 'lux',
    note: '「Burberrys」旧ロゴのヴィンテージ、ノバチェック、日本限定のブルーレーベル/ブラックレーベル（三陽商会）は海外で希少扱いされ需要が高い。トレンチコート・カシミヤマフラーも定番。',
    c: { bag: [3, 60, 350], shoulder: [3, 60, 350], tote: [3, 60, 300], backpack: [2, 80, 300], wallet: [3, 30, 150], small: [3, 25, 120], acc: [2, 30, 120], belt: [2, 40, 150], scarf: [4, 60, 280], shoes: [2, 60, 250], apparel: [4, 80, 500], watch: [2, 60, 250], jewelry: [1, 40, 150], sunglasses: [1, 60, 200] },
    models: ['Nova Check', 'Haymarket', 'House Check', 'Trench Coat', 'Trench', 'TB Monogram', 'Burberrys', 'Blue Label', 'Black Label', 'Prorsum', 'Brit', 'London', 'Vintage Check', 'Horseferry', 'Lola', 'Pocket Bag', 'Title', 'Olympia', 'Note', 'Banner', 'Belt Bag', 'Duffle Coat', 'Duffle', 'Cashmere Scarf', 'Cashmere', 'Muffler', 'Stole', 'Quilted Jacket', 'Harrington', 'Polo', 'Shirt', 'Cardigan', 'Sweater', 'Skirt', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Tote', 'Backpack', 'Vintage'],
    lines: ['Nova Check', 'Haymarket', 'House Check', 'Vintage Check', 'TB Monogram', 'Blue Label', 'Black Label', 'Prorsum', 'Brit', 'London', 'Burberrys', 'Cashmere', 'Wool', 'Cotton', 'Leather', 'PVC', 'Canvas', 'Vintage'],
  },
  {
    id: 'loewe', n: 'Loewe', ja: 'ロエベ', kw: 'Loewe', al: ['ロエベ'], grp: 'lux',
    note: 'パズル・ハンモックなど現行モデルは高値安定。アナグラム柄ヴィンテージも人気上昇中。',
    c: { bag: [4, 200, 1200], shoulder: [4, 200, 1200], tote: [4, 200, 1000], backpack: [2, 200, 700], wallet: [3, 60, 300], small: [3, 50, 250], acc: [3, 60, 250], belt: [2, 80, 250], scarf: [2, 60, 250], shoes: [2, 100, 400], apparel: [2, 150, 800], watch: [1, 100, 400], jewelry: [1, 80, 300], sunglasses: [2, 80, 250] },
    models: ['Mini Puzzle', 'Puzzle Fold', 'Puzzle', 'Hammock', 'Gate', 'Flamenco Clutch', 'Flamenco', 'Anagram', 'Amazona', 'Basket', 'Cubi', 'Barcelona', 'Balloon', "Paula's Ibiza", 'Elephant', 'Bunny', 'Animal', 'Luna', 'Goya', 'Squeeze', 'Pebble', 'Knot', 'Heel', 'Vertical Wallet', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Backpack', 'Belt Bag', 'Vintage'],
    lines: ['Anagram', 'Calfskin', 'Nappa', 'Raffia', 'Canvas', 'Leather', 'Suede', 'Vintage'],
  },
  {
    id: 'goyard', n: 'Goyard', ja: 'ゴヤール', kw: 'Goyard', al: ['ゴヤール'], grp: 'lux',
    note: '流通量が少なく高値安定。サンルイ・アルトワのトートと財布・カードケースが定番。偽物多発ジャンルなので購入証明があると強い。',
    c: { bag: [5, 500, 2000], shoulder: [4, 500, 1800], tote: [5, 600, 2000], backpack: [2, 500, 1500], wallet: [4, 200, 700], small: [4, 150, 500], acc: [2, 100, 400], belt: [1, 150, 400], scarf: [1, 80, 250], shoes: [1, 100, 400], apparel: [1, 100, 500], watch: [1, 100, 400], jewelry: [1, 80, 300], sunglasses: [1, 80, 250] },
    models: ['Saint Louis', 'St Louis', 'Artois', 'Anjou', 'Belvedere', 'Saint Sulpice', 'Matignon', 'Senat', 'Boheme', 'Bellechasse', 'Cap Vert', 'Rouette', 'Saigon', 'Alpin', 'Cassiopee', 'Croisiere', 'Boeing', 'Vendome', 'Varenne', 'Plumet', 'Minaudiere', 'Richelieu', 'Saint Pierre', 'Saint Marc', 'Victoire', 'Card Holder', 'Zip Around', 'Long Wallet', 'Bifold', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Backpack', 'Vintage'],
    lines: ['Goyardine', 'Chevron', 'Canvas', 'Leather', 'Vintage'],
  },
  {
    id: 'coach', n: 'Coach', ja: 'コーチ', kw: 'Coach', al: ['コーチ'], grp: 'affordable',
    note: '単価が低く送料負けしやすい。Vintage Made in USA（ウィリス・ステーションバッグ等）は根強い需要。現行はタビー・ロウグが人気。',
    c: { bag: [3, 40, 180], shoulder: [3, 40, 200], tote: [3, 40, 150], backpack: [3, 50, 180], wallet: [3, 20, 80], small: [2, 15, 60], acc: [2, 15, 60], belt: [1, 20, 70], scarf: [1, 20, 60], shoes: [2, 40, 150], apparel: [2, 40, 200], watch: [2, 40, 150], jewelry: [1, 20, 80], sunglasses: [1, 30, 100] },
    models: ['Pillow Tabby', 'Tabby', 'Rogue', 'Willis', 'Dinky', 'Swagger', 'Cassie', 'Signature', 'Vintage', 'Made in USA', 'Court', 'Station Bag', 'Duffle', 'Sac', 'Kristin', 'Poppy', 'Legacy', 'Madison', 'Chelsea', 'Parker', 'Rambler', 'Bleecker', 'Ergo', 'Soho', 'Hampton', 'City Bag', 'Brooklyn', 'Charlie', 'Field Tote', 'Willow', 'Kacey', 'Lana', 'Bandit', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Wristlet', 'Tote', 'Backpack', 'Belt Bag', 'Crossbody'],
    lines: ['Signature', 'Glovetanned', 'Pebble Leather', 'Vintage', 'Made in USA', 'Canvas', 'Leather', 'Suede'],
  },
  {
    id: 'miumiu', n: 'Miu Miu', ja: 'ミュウミュウ', kw: 'Miu Miu', al: ['ミュウミュウ', 'MiuMiu'], grp: 'lux',
    note: 'マテラッセ（ギャザー）バッグと財布がY2K人気で上昇中。',
    c: { bag: [3, 100, 500], shoulder: [3, 100, 600], tote: [2, 100, 400], backpack: [2, 100, 400], wallet: [3, 50, 220], small: [3, 40, 180], acc: [2, 40, 150], belt: [1, 50, 200], scarf: [1, 40, 150], shoes: [3, 100, 400], apparel: [3, 100, 600], watch: [1, 80, 300], jewelry: [2, 60, 250], sunglasses: [2, 80, 250] },
    models: ['Matelasse', 'Matelassé', 'Wander', 'Arcadie', 'Vitello Lux', 'Vitello', 'Madras', 'Bow Bag', 'Coffer', 'Crystal', 'Nappa', 'Beau', 'Lady Bag', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Backpack', 'Belt Bag', 'Ballet', 'Loafer', 'Vintage'],
    lines: ['Matelasse', 'Vitello', 'Nappa', 'Madras', 'Leather', 'Canvas', 'Vintage'],
  },
  {
    id: 'ferragamo', n: 'Salvatore Ferragamo', ja: 'フェラガモ', kw: 'Ferragamo', al: ['Salvatore Ferragamo', 'フェラガモ'], grp: 'lux',
    note: 'ガンチーニ金具のバッグ・財布と、ヴァラ/ヴァリナのパンプスが定番。単価は中程度。',
    c: { bag: [3, 80, 350], shoulder: [3, 80, 400], tote: [2, 80, 300], backpack: [1, 100, 300], wallet: [3, 40, 180], small: [2, 30, 120], acc: [2, 30, 120], belt: [3, 60, 200], scarf: [2, 40, 150], shoes: [4, 60, 250], apparel: [1, 60, 300], watch: [2, 100, 400], jewelry: [1, 40, 150], sunglasses: [1, 50, 150] },
    models: ['Gancini', 'Gancio', 'Varina', 'Vara', 'Viva', 'Sofia', 'Trifolio', 'Studio', 'Margot', 'Amy', 'Fiamma', 'Boxyz', 'Reversible Belt', 'Belt', 'Loafer', 'Pumps', 'Ballet', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Vintage'],
    lines: ['Gancini', 'Vara', 'Calfskin', 'Patent', 'Suede', 'Leather', 'Canvas', 'Vintage'],
  },
  {
    id: 'chloe', n: 'Chloé', ja: 'クロエ', kw: 'Chloe', al: ['Chloé', 'クロエ'], grp: 'lux',
    note: 'パディントン・マーシー・ドリューなど。See by Chloé と混同しないよう検索語に注意。',
    c: { bag: [3, 100, 500], shoulder: [3, 100, 600], tote: [2, 100, 400], backpack: [2, 100, 350], wallet: [3, 50, 200], small: [2, 40, 150], acc: [2, 40, 150], belt: [1, 50, 150], scarf: [1, 40, 150], shoes: [2, 80, 300], apparel: [2, 80, 500], watch: [1, 80, 300], jewelry: [1, 50, 200], sunglasses: [2, 60, 200] },
    models: ['Paddington', 'Marcie', 'Drew', 'Faye', 'Nile', 'Tess', 'Woody', 'Alphabet', 'Roy', 'Hudson', 'Lily', 'Paraty', 'Edith', 'Bay', 'Silverado', 'Elsie', 'Georgia', 'Pixie', 'Daria', 'Kiss', 'Sally', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Backpack', 'Vintage'],
    lines: ['Calfskin', 'Suede', 'Leather', 'Canvas', 'Vintage'],
  },
  {
    id: 'givenchy', n: 'Givenchy', ja: 'ジバンシィ', kw: 'Givenchy', al: ['ジバンシー', 'ジバンシィ'], grp: 'lux',
    note: 'アンティゴナ・パンドラの中古が中心。ヴィンテージ（旧ロゴ4G）の小物にも需要。',
    c: { bag: [3, 150, 700], shoulder: [3, 150, 700], tote: [2, 120, 500], backpack: [2, 150, 500], wallet: [2, 50, 200], small: [2, 40, 150], acc: [2, 40, 150], belt: [1, 50, 150], scarf: [2, 40, 150], shoes: [2, 80, 300], apparel: [2, 80, 500], watch: [1, 80, 300], jewelry: [1, 50, 200], sunglasses: [1, 60, 200] },
    models: ['Antigona', 'Pandora', 'Nightingale', 'GV3', 'Bambi', 'Shark Lock', 'Obsedia', 'Mystic', 'Cut Out', 'Whip', 'Bond', '4G', 'Kenny', 'Voyou', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Backpack', 'Vintage'],
    lines: ['4G', 'Calfskin', 'Leather', 'Canvas', 'Nylon', 'Vintage'],
  },
  {
    id: 'valentino', n: 'Valentino', ja: 'ヴァレンティノ', kw: 'Valentino Garavani', al: ['Valentino', 'ヴァレンティノ', 'バレンチノ'], grp: 'lux',
    note: 'ロックスタッズ（バッグ・靴）とVロゴ。「Valentino」だけだと他ブランドが混ざるので Garavani 付きで検索。',
    c: { bag: [3, 150, 700], shoulder: [3, 150, 700], tote: [2, 150, 500], backpack: [2, 150, 500], wallet: [2, 60, 250], small: [2, 40, 200], acc: [2, 40, 150], belt: [2, 80, 250], scarf: [1, 40, 150], shoes: [3, 100, 400], apparel: [2, 100, 600], watch: [1, 80, 300], jewelry: [1, 50, 200], sunglasses: [1, 60, 200] },
    models: ['Rockstud Spike', 'Rockstud', 'VLogo', 'V Logo', 'VSling', 'Loco', 'Roman Stud', 'Candystud', 'Glam Lock', 'Garavani', 'Vring', 'Supervee', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Backpack', 'Pumps', 'Sneaker', 'Sandals', 'Vintage'],
    lines: ['Rockstud', 'VLogo', 'Calfskin', 'Leather', 'Canvas', 'Vintage'],
  },
  {
    id: 'mcm', n: 'MCM', ja: 'エムシーエム', kw: 'MCM', al: ['MCM'], grp: 'affordable',
    note: 'ヴィセトス柄（旧ドイツ製ヴィンテージ含む）のバックパック・ポーチが海外で人気。',
    c: { bag: [3, 80, 350], shoulder: [3, 80, 350], tote: [3, 80, 300], backpack: [4, 120, 450], wallet: [3, 40, 150], small: [3, 30, 120], acc: [2, 30, 100], belt: [2, 50, 150], scarf: [1, 30, 100], shoes: [1, 60, 200], apparel: [1, 60, 250], watch: [1, 60, 200], jewelry: [1, 30, 100], sunglasses: [1, 40, 120] },
    models: ['Visetos', 'Stark', 'Boston', 'Klara', 'Patricia', 'Anya', 'Millie', 'Aren', 'Liz', 'Cognac', 'Vintage', 'Germany', 'Speedy', 'Duffle', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Backpack', 'Belt Bag', 'Crossbody'],
    lines: ['Visetos', 'Cognac', 'Leather', 'Canvas', 'Vintage', 'Germany'],
  },
  {
    id: 'longchamp', n: 'Longchamp', ja: 'ロンシャン', kw: 'Longchamp', al: ['ロンシャン'], grp: 'affordable',
    note: 'ル・プリアージュ一択。単価が低く送料負けしやすいので、限定色・キュイール（革）を狙う。',
    c: { bag: [2, 40, 150], shoulder: [2, 40, 180], tote: [3, 40, 150], backpack: [2, 50, 150], wallet: [1, 30, 100], small: [1, 20, 80], acc: [1, 20, 60], belt: [1, 30, 100], scarf: [1, 30, 100], shoes: [1, 40, 150], apparel: [1, 40, 200], watch: [1, 40, 150], jewelry: [1, 20, 80], sunglasses: [1, 30, 100] },
    models: ['Le Pliage', 'Pliage', 'Cuir', 'Roseau', 'Neo', 'Energy', 'Club', 'Green', 'Xtra', 'Filet', 'Mailbox', 'Le Foulonne', 'Foulonne', 'Boxford', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Backpack', 'Vintage'],
    lines: ['Le Pliage', 'Cuir', 'Nylon', 'Leather', 'Canvas', 'Vintage'],
  },
  {
    id: 'vivienne', n: 'Vivienne Westwood', ja: 'ヴィヴィアン・ウエストウッド', kw: 'Vivienne Westwood', al: ['ヴィヴィアン', 'Vivienne'], grp: 'jp',
    note: '日本発の定番。オーブのアクセサリー（ネックレス・リング・ピアス）と財布・バッグの回転が非常に速い。単価は低〜中。',
    c: { bag: [3, 60, 250], shoulder: [3, 60, 250], tote: [2, 50, 200], backpack: [2, 60, 200], wallet: [4, 40, 150], small: [3, 25, 100], acc: [3, 30, 120], belt: [2, 40, 150], scarf: [2, 30, 120], shoes: [3, 80, 350], apparel: [4, 60, 400], watch: [2, 80, 300], jewelry: [5, 50, 300], sunglasses: [1, 40, 150] },
    models: ['Petite Orb', 'Orb', 'Mini Bas Relief', 'Bas Relief', 'Mayfair', 'Nano Solid', 'Armour Ring', 'Armour', 'Saturn', 'Pearl Necklace', 'Choker', 'Heart', 'Squiggle', 'Rocking Horse', 'Pirate Boots', 'Melissa', 'Anglomania', 'Red Label', 'Gold Label', 'Man', 'Derby', 'Yasmine', 'Grace', 'Matlock', 'Ella', 'Tartan', 'Harris Tweed', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Backpack', 'Vintage'],
    lines: ['Orb', 'Bas Relief', 'Tartan', 'Harris Tweed', 'Leather', 'Canvas', 'Vintage', 'Red Label', 'Gold Label', 'Anglomania'],
  },
  {
    id: 'cdg', n: 'Comme des Garçons', ja: 'コム デ ギャルソン', kw: 'Comme des Garcons', al: ['Comme des Garçons', 'ギャルソン', 'CDG'], grp: 'jp',
    note: '財布（ラウンドジップ・二つ折り・ポリカドット・クラシックレザー）が海外でロングセラー。PLAY のハート衣類も人気。',
    c: { bag: [2, 60, 250], shoulder: [2, 60, 250], tote: [2, 50, 200], backpack: [1, 60, 200], wallet: [5, 60, 200], small: [4, 40, 150], acc: [2, 30, 100], belt: [1, 40, 150], scarf: [1, 40, 150], shoes: [3, 80, 300], apparel: [4, 60, 500], watch: [1, 60, 200], jewelry: [1, 40, 150], sunglasses: [1, 40, 150] },
    models: ['Play', 'Heart', 'Classic Leather', 'Classic', 'Polka Dot', 'Dots', 'Luxury', 'Huge Logo', 'Star Embossed', 'Colour Inside', 'Zip Around', 'Round Zip', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Tote', 'Homme Plus', 'Homme', 'Shirt', 'Black', 'Girl', 'Converse', 'Chuck Taylor', 'Cardigan', 'Sweater', 'T-Shirt', 'Jacket', 'Vintage', 'Wallet'],
    lines: ['Play', 'Classic Leather', 'Polka Dot', 'Luxury', 'Homme Plus', 'Homme', 'Shirt', 'Black', 'Vintage'],
  },
  {
    id: 'issey', n: 'Issey Miyake', ja: 'イッセイ ミヤケ', kw: 'Issey Miyake', al: ['BAO BAO', 'Bao Bao', 'Pleats Please', 'イッセイミヤケ', 'バオバオ', 'プリーツプリーズ'], grp: 'jp',
    note: 'BAO BAO（バオバオ）バッグと PLEATS PLEASE の衣類が海外で人気。国内定価と海外価格の差が大きい。',
    c: { bag: [4, 100, 450], shoulder: [4, 100, 450], tote: [4, 120, 450], backpack: [3, 120, 400], wallet: [3, 50, 200], small: [3, 40, 180], acc: [2, 30, 120], belt: [1, 40, 120], scarf: [2, 40, 200], shoes: [1, 60, 250], apparel: [4, 80, 500], watch: [2, 80, 300], jewelry: [1, 30, 120], sunglasses: [1, 60, 200] },
    models: ['Bao Bao', 'BaoBao', 'Prism', 'Lucent', 'Platinum', 'Distortion', 'Crispy', 'Tonneau', 'Carton', 'Pleats Please', 'Homme Plisse', 'Homme Plissé', 'Me Issey', 'Cauliflower', 'Twist', 'Tokujin', 'Ova', 'Kuro', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Pouch', 'Tote', 'Backpack', 'Pants', 'Skirt', 'Top', 'Cardigan', 'Dress', 'Jacket', 'Vintage'],
    lines: ['Bao Bao', 'Pleats Please', 'Homme Plisse', 'Me', 'Prism', 'Lucent', 'Platinum', 'Vintage'],
  },
  {
    id: 'porter', n: 'Porter (Yoshida)', ja: 'ポーター（吉田カバン）', kw: 'Porter Yoshida', al: ['Porter', 'ポーター', '吉田カバン', 'Yoshida'], grp: 'jp',
    note: 'タンカー・スモーキー・ヒートが定番。海外では入手しづらく、新品同様品は定価超えも。単価は中程度。',
    c: { bag: [3, 60, 250], shoulder: [4, 60, 250], tote: [3, 60, 220], backpack: [3, 80, 300], wallet: [3, 40, 150], small: [3, 30, 120], acc: [2, 30, 100], belt: [1, 30, 100], scarf: [1, 30, 100], shoes: [1, 40, 150], apparel: [1, 60, 250], watch: [1, 60, 200], jewelry: [1, 20, 80], sunglasses: [1, 30, 100] },
    models: ['Tanker', 'Smoky', 'Heat', 'Force', 'Hybrid', 'Flying Ace', 'Current', 'Frame', 'Shine', 'Beat', 'Union', 'Wonder', 'Girl', 'Free Style', 'Freestyle', 'Counter Shade', 'Draft', 'Hexaria', 'Booth Pack', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Case', 'Key Case', 'Pouch', 'Tote', 'Backpack', 'Shoulder', 'Helmet Bag', 'Waist Bag', 'Vintage'],
    lines: ['Tanker', 'Smoky', 'Heat', 'Force', 'Hybrid', 'Nylon', 'Leather', 'Canvas', 'Vintage'],
  },
  {
    id: 'bape', n: 'A Bathing Ape', ja: 'ア ベイシング エイプ', kw: 'Bape', al: ['A Bathing Ape', 'BAPE', 'エイプ', 'アベイシングエイプ'], grp: 'jp',
    note: '海外ストリート需要が非常に強い。シャークパーカー・カモ柄・BAPESTA。偽物が多いのでタグ・品質表示の写真必須。',
    c: { bag: [2, 50, 250], shoulder: [2, 50, 250], tote: [2, 40, 200], backpack: [3, 60, 300], wallet: [2, 30, 120], small: [2, 25, 100], acc: [2, 25, 100], belt: [1, 30, 100], scarf: [1, 30, 100], shoes: [4, 100, 400], apparel: [5, 60, 500], watch: [2, 80, 300], jewelry: [1, 30, 100], sunglasses: [1, 40, 120] },
    models: ['Shark Hoodie', 'Shark', 'Full Zip', 'ABC Camo', '1st Camo', 'Color Camo', 'Cloud Camo', 'City Camo', 'Space Camo', 'Camo', 'Bapesta', 'Bape Sta', 'Sk8 Sta', 'College', 'Ape Head', 'Baby Milo', 'Milo', 'Tiger', 'Hoodie', 'Sweatshirt', 'Tee', 'T-Shirt', 'Varsity', 'Jacket', 'Shorts', 'Pants', 'Cap', 'Sneaker', 'Backpack', 'Tote', 'Pouch', 'Wallet', 'Vintage', 'Nigo', 'OG'],
    lines: ['ABC Camo', '1st Camo', 'Color Camo', 'Cloud Camo', 'City Camo', 'Space Camo', 'Tiger', 'Shark', 'Baby Milo', 'Vintage', 'OG', 'Nigo'],
  },
  {
    id: 'supreme', n: 'Supreme', ja: 'シュプリーム', kw: 'Supreme', al: ['シュプリーム'], grp: 'jp',
    note: 'ボックスロゴ・コラボ（LV/Nike/TNF）。日本限定品や旧作に海外プレミアム。偽物多発。',
    c: { bag: [3, 50, 250], shoulder: [3, 50, 250], tote: [2, 40, 200], backpack: [3, 60, 300], wallet: [2, 40, 150], small: [2, 30, 120], acc: [3, 30, 150], belt: [2, 40, 150], scarf: [1, 30, 120], shoes: [3, 100, 400], apparel: [5, 60, 800], watch: [1, 60, 300], jewelry: [1, 30, 150], sunglasses: [1, 40, 150] },
    models: ['Box Logo', 'Bogo', 'Motion Logo', 'Photo Tee', 'North Face', 'TNF', 'Nike', 'Louis Vuitton', 'Hoodie', 'Sweatshirt', 'Crewneck', 'Tee', 'T-Shirt', 'Varsity', 'Jacket', 'Shorts', 'Pants', 'Camp Cap', 'Cap', 'Beanie', 'Backpack', 'Shoulder Bag', 'Waist Bag', 'Duffle', 'Tote', 'Wallet', 'Keychain', 'Sticker', 'Skateboard', 'Deck', 'Vintage'],
    lines: ['Box Logo', 'Collab', 'Cordura', 'Vintage'],
  },
  {
    id: 'moncler', n: 'Moncler', ja: 'モンクレール', kw: 'Moncler', al: ['モンクレール'], grp: 'lux',
    note: 'ダウンジャケットの秋冬需要。サイズ表記（サイズ0〜6）と QR コード・タグの写真が必須。偽物多発。',
    c: { bag: [1, 80, 300], shoulder: [1, 80, 300], tote: [1, 80, 300], backpack: [2, 100, 400], wallet: [1, 50, 200], small: [1, 40, 150], acc: [2, 40, 150], belt: [1, 60, 200], scarf: [2, 60, 250], shoes: [2, 100, 400], apparel: [5, 300, 1500], watch: [1, 100, 300], jewelry: [1, 40, 150], sunglasses: [2, 80, 250] },
    models: ['Maya', 'Bady', 'Hermine', 'Cluny', 'Montgenevre', 'Montgenèvre', 'Grenoble', 'Gamme Bleu', 'Gamme Rouge', 'Genius', 'Fragment', 'Moka', 'Sauvage', 'Bramant', 'Flammette', 'Vest', 'Gilet', 'Down Jacket', 'Puffer', 'Cardigan', 'Sweater', 'Polo', 'T-Shirt', 'Hoodie', 'Cap', 'Beanie', 'Vintage'],
    lines: ['Down', 'Nylon Laque', 'Wool', 'Genius', 'Grenoble', 'Vintage'],
  },
  {
    id: 'cartier', n: 'Cartier', ja: 'カルティエ', kw: 'Cartier', al: ['カルティエ'], grp: 'jewelry',
    note: 'ジュエリー（ラブ・トリニティ・ジュストアンクル）と時計が主力。マストラインのヴィンテージ小物（ボルドー）も需要あり。高額品は Authenticity Guarantee 対象。',
    c: { bag: [3, 100, 600], shoulder: [3, 120, 600], tote: [2, 100, 500], backpack: [1, 100, 400], wallet: [3, 60, 300], small: [3, 50, 250], acc: [3, 60, 300], belt: [2, 80, 300], scarf: [2, 50, 200], shoes: [1, 100, 300], apparel: [1, 80, 300], watch: [5, 800, 8000], jewelry: [5, 500, 5000], sunglasses: [3, 150, 500] },
    models: ['Love', 'Trinity', 'Juste un Clou', 'Panthere', 'Panthère', 'Tank Francaise', 'Tank Must', 'Tank Solo', 'Tank Americaine', 'Tank Louis', 'Tank', 'Santos', 'Ballon Bleu', 'Must de Cartier', 'Must', 'Pasha', 'Roadster', 'Baignoire', 'Ronde', 'Calibre', 'Drive', 'Cle', 'Clé', 'Vendome', 'Happy Birthday', 'Marcello', 'Sapphire', 'Ecrou', 'C de Cartier', 'Double C', 'Diabolo', 'Lighter', 'Pen', 'Cufflinks', 'Money Clip', 'Key Ring', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Pouch', 'Bracelet', 'Ring', 'Necklace', 'Earrings', 'Vintage'],
    lines: ['Must Line', 'Must', 'Bordeaux', 'Yellow Gold', 'White Gold', 'Rose Gold', '18K', '750', 'Diamond', 'Stainless', 'Vermeil', 'Silver 925', 'Leather', 'Vintage'],
  },
  {
    id: 'tiffany', n: 'Tiffany & Co.', ja: 'ティファニー', kw: 'Tiffany', al: ['Tiffany & Co', 'ティファニー'], grp: 'jewelry',
    note: 'シルバー925のリターントゥ・オープンハート・ビーン・アトラスなどは回転が非常に速い。変色・磨き状態と刻印の写真が重要。',
    c: { bag: [1, 60, 300], shoulder: [1, 60, 300], tote: [1, 60, 250], backpack: [1, 80, 300], wallet: [2, 40, 200], small: [2, 30, 150], acc: [3, 40, 200], belt: [1, 50, 200], scarf: [1, 40, 150], shoes: [1, 60, 200], apparel: [1, 60, 200], watch: [2, 300, 2500], jewelry: [5, 80, 900], sunglasses: [2, 80, 250] },
    models: ['Return to Tiffany', 'Open Heart', 'Elsa Peretti', 'Bean', 'Atlas', 'Tiffany T', 'Hardwear', '1837', 'Bone Cuff', 'Teardrop', 'Infinity', 'Key', 'Heart Tag', 'Toggle', 'Venetian', 'Somerset', 'Mesh', 'Paloma Picasso', 'Loving Heart', 'Olive Leaf', 'Sugar Stacks', 'Twist', 'Knot', 'Victoria', 'Soleste', 'Legacy', 'Schlumberger', 'Bow', 'Padlock', 'Ball', 'Diamonds by the Yard', 'Bracelet', 'Necklace', 'Ring', 'Earrings', 'Pendant', 'Bangle', 'Cufflinks', 'Spoon', 'Baby', 'Vintage'],
    lines: ['Sterling Silver', '925', 'Silver', '18K', 'Yellow Gold', 'Rose Gold', 'Rubedo', 'Titanium', 'Diamond', 'Enamel', 'Vintage'],
  },
  {
    id: 'bvlgari', n: 'Bvlgari', ja: 'ブルガリ', kw: 'Bvlgari', al: ['Bulgari', 'ブルガリ'], grp: 'jewelry',
    note: 'B.zero1・セルペンティのジュエリー、ブルガリブルガリ時計。財布・小物も需要あり。',
    c: { bag: [2, 100, 500], shoulder: [2, 120, 600], tote: [1, 100, 400], backpack: [1, 100, 350], wallet: [3, 60, 250], small: [2, 50, 200], acc: [2, 50, 250], belt: [1, 80, 250], scarf: [1, 50, 200], shoes: [1, 80, 250], apparel: [1, 60, 250], watch: [3, 500, 3500], jewelry: [4, 300, 3000], sunglasses: [2, 80, 300] },
    models: ['B.zero1', 'Bzero1', 'B Zero', 'Serpenti', 'Tubogas', 'Divas Dream', "Diva's Dream", 'Bvlgari Bvlgari', 'Bulgari Bulgari', 'Diagono', 'Octo', 'Lucea', 'Solotempo', 'Rettangolo', 'Ergon', 'Assioma', 'Parentesi', 'Fiorever', 'Save the Children', 'Doppio', 'Monete', 'Logomania', 'Weekend', 'Leoni', 'Isabella Rossellini', 'Zip Around', 'Long Wallet', 'Bifold', 'Card Case', 'Coin Purse', 'Key Case', 'Key Ring', 'Pouch', 'Tote', 'Ring', 'Necklace', 'Bracelet', 'Earrings', 'Vintage'],
    lines: ['Yellow Gold', 'White Gold', 'Rose Gold', '18K', '750', 'Diamond', 'Stainless', 'Ceramic', 'Silver 925', 'Leather', 'Canvas', 'Vintage'],
  },
  {
    id: 'rolex', n: 'Rolex', ja: 'ロレックス', kw: 'Rolex', al: ['ロレックス'], grp: 'jewelry',
    note: '最高額帯。詐欺・チャージバックリスクが高く、Authenticity Guarantee と付属品（箱・保証書）が前提。初心者は箱・空箱・付属品単体から。',
    c: { bag: [1, 100, 500], shoulder: [1, 100, 500], tote: [1, 100, 400], backpack: [1, 100, 400], wallet: [1, 100, 400], small: [2, 60, 300], acc: [3, 60, 400], belt: [1, 100, 300], scarf: [1, 50, 200], shoes: [1, 100, 300], apparel: [1, 60, 300], watch: [5, 3000, 20000], jewelry: [1, 200, 2000], sunglasses: [1, 100, 300] },
    models: ['Lady Datejust', 'Datejust', 'Submariner', 'Oyster Perpetual', 'Daytona', 'GMT-Master', 'GMT Master', 'Explorer', 'Air-King', 'Air King', 'Oysterquartz', 'Cellini', 'Day-Date', 'Day Date', 'Sea-Dweller', 'Yacht-Master', 'Milgauss', 'Oysterdate', 'Precision', 'Tudor', 'Empty Box', 'Box', 'Papers', 'Warranty', 'Booklet', 'Tag', 'Jubilee', 'Oyster', 'Bracelet', 'Clasp', 'Bezel', 'Dial', 'Vintage'],
    lines: ['Stainless', 'Two Tone', 'Yellow Gold', 'White Gold', 'Rose Gold', '18K', 'Jubilee', 'Oyster', 'Vintage'],
  },
  {
    id: 'omega', n: 'Omega', ja: 'オメガ', kw: 'Omega', al: ['オメガ'], grp: 'jewelry',
    note: 'スピードマスター・シーマスターの中古とヴィンテージ（ジュネーブ・コンステレーション・デビル）が安定。Authenticity Guarantee 対象額に注意。',
    c: { bag: [1, 50, 200], shoulder: [1, 50, 200], tote: [1, 50, 200], backpack: [1, 50, 200], wallet: [1, 50, 200], small: [1, 40, 150], acc: [2, 40, 200], belt: [1, 50, 150], scarf: [1, 30, 100], shoes: [1, 50, 150], apparel: [1, 40, 150], watch: [5, 500, 6000], jewelry: [1, 100, 500], sunglasses: [1, 50, 150] },
    models: ['Speedmaster', 'Seamaster 300', 'Diver 300M', 'Seamaster', 'Constellation', 'De Ville', 'Deville', 'Geneve', 'Genève', 'Dynamic', 'Moonwatch', 'Professional', 'Planet Ocean', 'Aqua Terra', 'Railmaster', 'Chronostop', 'Cosmic', 'Ladymatic', 'Bond', 'Box', 'Bracelet', 'Vintage'],
    lines: ['Stainless', 'Gold Plated', 'Gold Cap', '18K', 'Two Tone', 'Vintage', 'Automatic', 'Manual', 'Quartz'],
  },
];

// 色・サイズなど汎用タグ（タイトルから抽出）
const COLORS = ['Black', 'Brown', 'Beige', 'White', 'Red', 'Pink', 'Blue', 'Navy', 'Green', 'Gold', 'Silver', 'Grey', 'Gray', 'Purple', 'Orange', 'Yellow', 'Ivory', 'Bordeaux', 'Burgundy', 'Camel', 'Cream', 'Tan', 'Khaki', 'Multicolor', 'Multi'];
const SIZES = ['Nano', 'Mini', 'Micro', 'PM', 'MM', 'GM', 'BB', 'Small', 'Medium', 'Large', 'Jumbo', 'Maxi', 'Compact', '25', '30', '35', '40', '45', '50', '55', 'XS', 'XL', 'XXL'];

// 仕入先リンク（日本国内）。{q} をキーワードに置換
const SOURCES = [
  { n: 'メルカリ',          u: 'https://jp.mercari.com/search?keyword={q}&status=on_sale' },
  { n: 'メルカリ売切',      u: 'https://jp.mercari.com/search?keyword={q}&status=sold_out' },
  { n: 'ヤフオク',          u: 'https://auctions.yahoo.co.jp/search/search?p={q}' },
  { n: 'ヤフオク落札相場',  u: 'https://auctions.yahoo.co.jp/closedsearch/closedsearch?p={q}' },
  { n: 'ラクマ',            u: 'https://fril.jp/s?query={q}' },
  { n: 'セカスト',          u: 'https://www.2ndstreet.jp/search?keyword={q}' },
  { n: 'オフモール',        u: 'https://netmall.hardoff.co.jp/search/?q={q}' },
];

// 「モデル名」ではなく商品の種類を表す語。モデル判定では固有モデル名を優先し、これらは後回しにする
const GENERIC = new Set(['Long Wallet', 'Bifold', 'Trifold', 'Zip Around', 'Round Zip', 'Zip Wallet', 'Card Holder', 'Card Case', 'Coin Purse', 'Coin Case', 'Key Case', 'Key Pouch', 'Key Ring', 'Pouch', 'Tote', 'Backpack', 'Belt Bag', 'Hobo', 'Boston', 'Bucket', 'Messenger', 'Duffle', 'Clutch', 'Wristlet', 'Crossbody', 'Shopper', 'Vanity', 'Cosmetic', 'Cosmetic Case', 'Cosmetic Pouch', 'Camera Bag', 'Wallet', 'Compact Wallet', 'Chain Wallet', 'Strap Wallet', 'Vertical Wallet', 'Bracelet', 'Necklace', 'Ring', 'Earrings', 'Pendant', 'Bangle', 'Brooch', 'Cufflinks', 'Hoodie', 'Sweatshirt', 'Crewneck', 'Tee', 'T-Shirt', 'Jacket', 'Varsity', 'Shorts', 'Pants', 'Cap', 'Beanie', 'Cardigan', 'Sweater', 'Polo', 'Shirt', 'Skirt', 'Dress', 'Top', 'Vest', 'Gilet', 'Down Jacket', 'Puffer', 'Loafer', 'Pumps', 'Ballet', 'Sneaker', 'Sandals', 'Belt', 'Stole', 'Muffler', 'Cashmere', 'Box', 'Empty Box', 'Papers', 'Warranty', 'Booklet', 'Tag', 'Clasp', 'Bezel', 'Dial', 'Vintage', 'Old Gucci', 'Old Celine', 'Made in USA', 'Germany', 'Shoulder', 'Shoulder Bag', 'Waist Bag', 'Helmet Bag', 'Briefcase', 'Agenda', 'Toiletry', 'Trousse', 'Mini Pochette', 'Keychain', 'Sticker', 'Nano', 'Mini Flap', 'Square Mini', 'Rectangular Mini', 'Jumbo', 'Maxi', 'Automatic', 'Professional', 'Precision', 'Date', 'Lighter', 'Pen', 'Money Clip', 'Spoon', 'Baby', 'Change', 'Grip', 'Dive', 'Sport']);
