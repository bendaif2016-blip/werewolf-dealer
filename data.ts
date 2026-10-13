export type Lang='en'|'ar';
export type Dict=Record<string,any>;
export type Role={id:string;n:string;e:string;t:'v'|'w';max:number;d:string;o?:number;f?:number;s?:string};
export const R:Role[]=[
{id:'villager',n:'Villager',e:'🧑‍🌾',t:'v',max:99,d:'No power. Uses discussion and the daily vote to find the wolves.'},
{id:'werewolf',n:'Werewolf',e:'🐺',t:'w',max:99,d:'Wakes each night with the pack to choose a victim. Wolves win when they equal the village.',o:5,s:'Werewolves, wake up and choose a victim.'},
{id:'alpha',n:'Alpha Werewolf',e:'👑',t:'w',max:1,d:'A werewolf who can once turn a Villager into a werewolf.',o:5.1,s:'Alpha, once per game: convert a Villager? (The pack stays awake.)'},
{id:'seer',n:'Seer',e:'🔮',t:'v',max:1,d:'Each night, points at a player and learns whether they are a werewolf.',o:3,s:'Seer, wake up and point at a player. Show a thumb up or down.'},
{id:'apprentice',n:'Apprentice Seer',e:'📖',t:'v',max:1,d:'A Villager until the Seer dies, then becomes the new Seer.',o:3.1,s:'Apprentice Seer: wake only if the Seer has died.'},
{id:'doctor',n:'Doctor',e:'🩺',t:'v',max:1,d:'Protects one player from the werewolves each night.',o:4,s:'Doctor, wake up and point at a player to protect.'},
{id:'witch',n:'Witch',e:'🧪',t:'v',max:1,d:'Has one save potion and one poison for the whole game.',o:6,s:'Witch, wake up. Show tonight\'s victim. Save, poison, or pass.'},
{id:'hunter',n:'Hunter',e:'🏹',t:'v',max:1,d:'When he dies, he immediately eliminates one player of his choice.'},
{id:'cupid',n:'Cupid',e:'💘',t:'v',max:1,d:'On the first night, chooses two players to become lovers.',o:1,f:1,s:'Cupid, wake up and choose two lovers. Then the lovers wake and see each other.'},
{id:'mason',n:'Mason',e:'🧱',t:'v',max:3,d:'Masons know each other from the start, so they can trust one another.',o:2,f:1,s:'Masons, wake up and recognise each other.'}
];;
export const AR:Record<string,{n:string;d:string;s?:string}>={
villager:{n:'قروي',d:'بلا قوة خاصة. يستخدم النقاش والتصويت اليومي لكشف الذئاب.'},
werewolf:{n:'مستذئب',d:'يستيقظ كل ليلة مع القطيع لاختيار ضحية. يفوز الذئاب عندما يتساوون مع القرويين.',s:'أيها المستذئبون، استيقظوا واختاروا ضحية.'},
alpha:{n:'الذئب الأكبر',d:'مستذئب يستطيع مرة واحدة تحويل قروي إلى مستذئب.',s:'أيها الذئب الأكبر، مرة واحدة في اللعبة: هل تحوّل قرويًا؟ (يبقى القطيع مستيقظًا.)'},
seer:{n:'العرّاف',d:'كل ليلة يشير إلى لاعب ويعرف إن كان مستذئبًا.',s:'أيها العرّاف، استيقظ وأشر إلى لاعب. أرِه إبهامًا لأعلى أو لأسفل.'},
apprentice:{n:'مساعد العرّاف',d:'قروي حتى يموت العرّاف، ثم يصبح العرّاف الجديد.',s:'مساعد العرّاف: لا يستيقظ إلا إذا مات العرّاف.'},
doctor:{n:'الطبيب',d:'يحمي لاعبًا واحدًا من المستذئبين كل ليلة.',s:'أيها الطبيب، استيقظ وأشر إلى لاعب لتحميه.'},
witch:{n:'الساحرة',d:'تملك جرعة إنقاذ واحدة وسمًّا واحدًا طوال اللعبة.',s:'أيتها الساحرة، استيقظي. أرِها ضحية الليلة. أنقذي أو سمّمي أو تجاوزي.'},
hunter:{n:'الصياد',d:'عندما يموت يقتل فورًا لاعبًا يختاره.'},
cupid:{n:'كيوبيد',d:'في الليلة الأولى يختار لاعبَين ليصبحا عاشقين.',s:'كيوبيد، استيقظ واختر عاشقين. ثم يستيقظ العاشقان ويريان بعضهما.'},
mason:{n:'البنّاء',d:'البنّاؤون يعرفون بعضهم من البداية فيثقون ببعض.',s:'أيها البنّاؤون، استيقظوا وتعارفوا.'}};;
export const I18N:Record<Lang,Dict>={en:{sub:'Set the table, then pass the phone. Each player sees only their own card.',players:'Players',pb:'Beginner',pc:'Classic',px:'Surprise me',roles:'Roles',tagW:'Wolves',tagV:'Village',less:'Fewer',more:'More',
bal:(w:number,v:number,n:number)=>`${w} wolves, ${v} village. A balanced table has about ${n}.`,w1:'More special cards than players.',w2:'Add at least one werewolf.',w3:'Wolves already equal the village.',names:'Player names (optional)',player:'Player',tm:'Show teammates on wolf and Mason cards',
deal:(n:number)=>`Deal ${n} cards`,cardOf:(i:number,n:number)=>`Card ${i} of ${n}`,passTo:(n:number)=>`Pass to ${n}`,noLook:'Make sure nobody else can see the screen.',im:(n:number)=>`I'm ${n}`,hold:'Hold to reveal',holdSub:'Let go to hide. It hides itself after 5 seconds.',holdAria:'Hold to reveal your role',hideNext:'Hide and pass on',finish:'Finish',
pack:'Your pack',masons:'Fellow Masons',none:'none, you are alone',doneH:'Everyone knows their role',doneP:'Put the phone down. The narrator can start the first night.',nar:'Narrator guide',redeal:'Deal again, same setup',home:'Change setup',
nightH:'Night guide',nightP:'Everyone closes their eyes. Wake roles in this order.',first:'first night only',noNight:'No night roles in this deck.',thenDay:'Then: day, discussion, and a vote.',close:'Close',themeH:'Theme',langBtn:'العربية',rolesH:'Choose the roles',back:'Back',auto:'auto',nextRoles:'Next: roles',playersH:'Who is playing?',subP:'How many players? Names are optional.',subR:(n:number)=>`Pick roles for ${n} players. Villagers fill the rest.`,namesHint:'Names appear on the pass screen. Leave empty to use Player 1, 2, 3…',replay:(n:number)=>`Replay last game (${n} players)`,trim:(n:number)=>`The player count dropped, so ${n} role card${n>1?'s were':' was'} removed. Check the list.`,leaveH:'Leave this deal?',leaveP:'The cards already dealt will be lost and you will need to deal again.',leave:'Leave',keep:'Keep dealing'},
ar:{sub:'جهّز الطاولة ثم مرّر الهاتف. كل لاعب يرى بطاقته فقط.',players:'اللاعبون',pb:'مبتدئ',pc:'كلاسيكي',px:'فاجئني',roles:'الأدوار',tagW:'الذئاب',tagV:'القرية',less:'تقليل',more:'زيادة',
bal:(w:number,v:number,n:number)=>`${w} ذئاب، ${v} قرويين. الطاولة المتوازنة تحتاج نحو ${n}.`,w1:'عدد الأدوار الخاصة أكبر من عدد اللاعبين.',w2:'أضف مستذئبًا واحدًا على الأقل.',w3:'الذئاب تساوي القرويين بالفعل.',names:'أسماء اللاعبين (اختياري)',player:'لاعب',tm:'أظهر الزملاء على بطاقات الذئاب والبنّائين',
deal:(n:number)=>`وزّع ${n} بطاقات`,cardOf:(i:number,n:number)=>`البطاقة ${i} من ${n}`,passTo:(n:number)=>`مرّر إلى ${n}`,noLook:'تأكد أن لا أحد غيرك يرى الشاشة.',im:(n:number)=>`أنا ${n}`,hold:'اضغط مطوّلًا للكشف',holdSub:'اترك للإخفاء. تختفي تلقائيًا بعد 5 ثوانٍ.',holdAria:'اضغط مطوّلًا لكشف دورك',hideNext:'أخفِ ومرّر',finish:'إنهاء',
pack:'فريقك',masons:'رفاقك البنّاؤون',none:'لا أحد، أنت وحدك',doneH:'الجميع عرف دوره',doneP:'ضع الهاتف جانبًا. يمكن للراوي بدء الليلة الأولى.',nar:'دليل الراوي',redeal:'وزّع مجددًا بنفس الإعداد',home:'تغيير الإعداد',
nightH:'دليل الليل',nightP:'يغمض الجميع أعينهم. أيقظ الأدوار بهذا الترتيب.',first:'الليلة الأولى فقط',noNight:'لا أدوار ليلية في هذه المجموعة.',thenDay:'ثم: النهار، النقاش، والتصويت.',close:'إغلاق',themeH:'المظهر',langBtn:'English',rolesH:'اختر الأدوار',back:'رجوع',auto:'تلقائي',nextRoles:'التالي: الأدوار',playersH:'من سيلعب؟',subP:'كم عدد اللاعبين؟ الأسماء اختيارية.',subR:(n:number)=>`اختر أدوارًا لـ ${n} لاعبين. القرويون يملؤون الباقي.`,namesHint:'تظهر الأسماء عند تمرير الهاتف. اتركها فارغة لاستخدام لاعب 1، 2، 3…',replay:(n:number)=>`أعد اللعبة الأخيرة (${n} لاعبين)`,trim:(n:number)=>`انخفض عدد اللاعبين فأُزيلت ${n} من بطاقات الأدوار. راجع القائمة.`,leaveH:'مغادرة هذا التوزيع؟',leaveP:'ستضيع البطاقات الموزعة وسيلزم التوزيع من جديد.',leave:'مغادرة',keep:'تابع التوزيع'}};;
export const SK:{id:string;n:[string,string];c:string[];f:string}[]=[{id:'moon',n:['Moonlight','ضوء القمر'],c:['#14151f','#e0b45a','#d8473c','#8fb59a'],f:'Fraunces'},
{id:'blood',n:['Blood Moon','قمر الدم'],c:['#140a0c','#e8793a','#ff4b3e','#c9b48a'],f:'Playfair Display'},
{id:'forest',n:['Deep Forest','الغابة العميقة'],c:['#0f1a14','#d9c26a','#e0644f','#7fd1a0'],f:'Spectral'},
{id:'parchment',n:['Parchment','ورق قديم'],c:['#f1ecdf','#9a6c10','#b3261e','#3f7050'],f:'Spectral'},
{id:'neon',n:['Neon Night','ليل النيون'],c:['#0a0b14','#ff4fd8','#ff5a5a','#38f0c4'],f:'Space Grotesk'}];;
