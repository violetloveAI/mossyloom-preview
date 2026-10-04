import {storyCopy} from './story-copy.js?v=n04-20261004';
import {createCollection} from './collection.js?v=n04-20261004';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
const initialURL = new URL(location.href);
let lang = initialURL.searchParams.get('lang') || read('mossy-lang','en');
lang = lang === 'zh' ? 'zh' : 'en';
// Old shared design links now resolve to the one chosen brand identity.
initialURL.searchParams.delete('style');
history.replaceState(null, '', initialURL);
document.documentElement.dataset.style = '4';
const t = (en, zh) => lang === 'zh' ? zh : en;
let products = [], collection, menuOpen = false, searchOpen = false;
const productName = p => t(p.name, p.nameZh);
const routeLink = (path, label, className='') => `<a class="${className}" href="#${path}">${label}</a>`;
const photo = (p, index=0, eager=false, className='') => `<img class="${className}" src="./${esc(p.images[index] || p.images[0])}" alt="${esc(productName(p))}" width="720" height="900" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const findProduct = id => products.find(p => p.id === id);
const categories = () => ['Scarves','Hats','Gloves','Extras'].filter(c=>products.some(p=>p.category===c));
const categoryLabel = c => t(({Scarves:'Scarves',Hats:'Hats',Gloves:'Gloves',Extras:'Little extras'})[c]||c,({Scarves:'围巾',Hats:'帽子',Gloves:'手套',Extras:'小配饰'})[c]||c);
const categoryCount = c => products.filter(p=>p.category===c).length;
const icon = name => {
  const paths = {heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>', search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',check:'<path d="m5 12 4 4L20 5"/>',plus:'<path d="M12 5v14M5 12h14"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',chevron:'<path d="m8 4 8 8-8 8"/>'};
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
function toast(message) { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),4500); }
function navigate(path) { if(location.hash === '#'+path) render(true); else location.hash=path; }
function currentRoute() { try { return decodeURI(location.hash.slice(1) || '/'); } catch { return '/not-found'; } }
function brand() { return `<a class="brand" href="#/" aria-label="Mossyloom ${t('home','首页')}"><img src="./assets/brand/mossyloom-n04-original.png" alt="Mossyloom" width="1774" height="887"></a>`; }
function navLinks() { return routeLink('/shop',t('The collection','精选系列'))+routeLink('/shop?category=Scarves',t('Scarves','围巾'))+routeLink('/shop?category=Hats',t('Hats','帽子'))+routeLink('/lookbook',t('Ways to wear','搭配灵感'))+routeLink('/story',t('Our story','品牌故事')); }
function shell(content) {
  return `<div class="announcement"><span>${t('A collection in the making · Not yet open for orders','小店筹备中 · 目前尚未开放下单')}</span><button data-lang aria-label="${t('Switch to Chinese','切换为英文')}">${lang==='en'?'中文 / EN':'EN / 中文'}</button></div>
  <header class="site-header"><button class="icon-btn mobile-menu" data-menu aria-controls="mobile-nav" aria-expanded="${menuOpen}" aria-label="${t('Navigation','导航')}">${icon(menuOpen?'close':'menu')}</button>${brand()}<nav class="desktop-nav" aria-label="${t('Main navigation','主导航')}">${navLinks()}</nav><div class="header-actions"><button class="icon-btn" data-search aria-label="${t('Search the collection','搜索系列')}" aria-controls="search-panel" aria-expanded="${searchOpen}">${icon(searchOpen?'close':'search')}</button><a class="icon-btn saved-nav" href="#/saved" aria-label="${t('Saved pieces','心愿清单')} ${collection.savedCount()}">${icon('heart')}<span class="saved-count">${collection.savedCount()}</span></a></div></header>
  ${menuOpen?`<nav id="mobile-nav" class="mobile-nav" aria-label="${t('Mobile navigation','移动导航')}">${navLinks()}${routeLink('/saved',t('Saved pieces','心愿清单'))}${routeLink('/faq',t('Good to know','逛店须知'))}</nav>`:''}
  ${searchOpen?`<form id="search-panel" class="search-panel"><label for="site-search">${t('What caught your eye?','想找哪一种心动？')}</label><input id="site-search" name="q" type="search" maxlength="100" placeholder="${t('Try blue, stripes, a beanie…','试试蓝色、条纹、帽子……')}"><button class="btn">${t('Find it','找一找')}</button></form>`:''}
  <main id="main" tabindex="-1">${content}</main>${footer()}`;
}
function card(p, index=0) {
  const saved=collection.isSaved(p.id);
  const colorNames=(p.colorOptions||[]).map(c=>t(c.name,c.nameZh||c.name));
  const displayIndex=products.findIndex(item=>item.id===p.id)+1;
  return `<article class="product-card"><div class="product-visual">${routeLink('/product/'+p.id,photo(p,0,false,'product-main')+(p.images.length>1?photo(p,1,false,'product-hover'):''))}<span class="photo-number">${String(displayIndex).padStart(2,'0')}</span><button class="wish-button ${saved?'saved':''}" data-card-save="${p.id}" aria-pressed="${saved}" aria-label="${t(saved?'Remove from saved: ':'Save: ',saved?'取消收藏：':'收藏：')+esc(productName(p))}">${icon('heart')}</button><span class="photo-caption">${t('Take a closer look','看看细节')} ${icon('arrow')}</span></div><div class="product-caption"><small>${categoryLabel(p.category)}</small>${routeLink('/product/'+p.id,esc(productName(p)),'product-name')}<span>${t('Collection preview','首发预览')}<span aria-hidden="true"> · </span>${p.images.length} ${t('photos','张实拍')}</span>${colorNames.length?`<p class="card-color-preview">${colorNames.slice(0,3).map(esc).join(' / ')}${colorNames.length>3?' +'+(colorNames.length-3):''}<small>${colorNames.length} ${t('color references','款参考配色')}</small></p>`:''}</div></article>`;
}
const grid = list => `<div class="product-grid">${list.map(card).join('')}</div>`;
function sectionHeading(kicker,title,path='/shop',cta=t(`Meet all ${products.length} pieces`,`看看全部 ${products.length} 款`)) { return `<div class="section-head"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2></div>${routeLink(path,`${cta} ${icon('arrow')}`,'text-link')}</div>`; }
function homepage() {
  const hat=findProduct('foldover-beanie'), scarf=findProduct('cloud-fringe-scarf');
  const picks=['everyday-rib-scarf','cloud-fringe-scarf','color-study-scarf','foldover-beanie'].map(findProduct);
  return `<section class="boutique-hero"><div class="boutique-heading"><p class="eyebrow">${t('HELLO, FROM OUR LITTLE SHOP','你好，欢迎来到这间小店')}</p><h1>${t('Take the<br><em>scenic route.</em>','慢一点，<br><em>也很好。</em>')}</h1><p class="hero-description">${t('A favorite hat, a winding street,<br>and a little room for daydreaming.','一顶喜欢的帽子，一条弯弯的小路。<br>给今天，留一点发呆的空白。')}</p>${routeLink('/shop',t('Come on in','进来逛逛')+icon('arrow'),'btn')}<span class="shop-sign">${t(`${products.length} LITTLE FAVORITES · A WORLD OF COLOR`,`${products.length} 款日常偏爱 · 一起探索配色`)}</span></div><div class="boutique-wall"><a class="boutique-frame frame-tall" href="#/product/${hat.id}">${photo(hat,0,true)}<span>${t('for slow mornings','送给慢悠悠的早晨')}</span></a><a class="boutique-frame frame-small" href="#/product/${scarf.id}">${photo(scarf)}<span>${t('a little blue daydream','一小片蓝色的白日梦')}</span></a><div class="boutique-letter">${t('Dear you,<br>take your time.<br>Stay a little.<br><em>Love, Mossyloom</em>','亲爱的，<br>不必着急。<br>多待一会儿。<br><em>Mossyloom</em>')}</div><span class="hand-drawn-star" aria-hidden="true">✳</span></div></section>
  <nav class="shop-path" aria-label="${t('Explore our collection','探索系列')}"><a href="#/shop?category=Scarves"><span>01</span>${t('The scarf garden','围巾花园')} ${icon('arrow')}</a><a href="#/shop?category=Hats"><span>02</span>${t('A good hat day','帽子小屋')} ${icon('arrow')}</a><a href="#/shop?category=Gloves"><span>03</span>${t('Little joys, at hand','手心里的小喜欢')} ${icon('arrow')}</a></nav>
  <section class="collection-section">${sectionHeading(t('A FEW PLACES TO START','先从这些小小喜欢开始'),t('Little things to love.','小小的，很喜欢。'))}${grid(picks)}</section>
  <section class="editorial-note"><span class="note-flower" aria-hidden="true">✳</span><p>${t('For the walk you didn’t plan.<br>The coffee that turns into a whole afternoon.<br>The little things you reach for, again and again.','为了一场临时起意的散步，<br>一杯喝成整个下午的咖啡，<br>还有那些总想再戴一次的小东西。')}</p><span>MOSSYLOOM / EVERYDAY NOTES</span></section>
  <section class="category-stories"><a href="#/shop?category=Scarves" class="photo-tile">${photo(findProduct('weekend-stripe-scarf'))}<div><small>${t('A STRIPE, A CHECK, A SPLASH OF COLOR','条纹、格纹，还有一点颜色')}</small><h2>${t('A scarf for your story.','把故事，轻轻围起来。')}</h2><span>${t(`Explore ${categoryCount('Scarves')} scarves`,`看看 ${categoryCount('Scarves')} 款围巾`)} ${icon('arrow')}</span></div></a><a href="#/shop?category=Hats" class="photo-tile arch-tile">${photo(findProduct('roll-edge-beanie'))}<div><small>${t('FOLD IT. ROLL IT. MAKE IT YOURS.','翻边，卷边，各有自己的模样')}</small><h2>${t('Top off a little joy.','把好心情，戴在头顶。')}</h2><span>${t(`Meet ${categoryCount('Hats')} hats`,`认识 ${categoryCount('Hats')} 款帽子`)} ${icon('arrow')}</span></div></a></section>
  <section class="launch-note"><p class="eyebrow">${t('A NOTE BEFORE WE OPEN','开店前的一封小便笺')}</p><h2>${t('Good things take a little time.','喜欢的事，慢慢准备。')}</h2><p>${t('We’re putting together our first collection. For now, wander through the photographs, find your favorites, and keep a little list. Prices and ordering will arrive once the details are ready.','我们正在准备小店的首发系列。先翻翻实拍、看看细节，把喜欢的款式存成一张清单。待商品资料与服务准备妥当，再公布售价并开放下单。')}</p><div class="button-row">${routeLink('/saved',t('Your saved pieces','我的心愿清单'),'btn')}${routeLink('/faq',t('A few useful answers','逛店前，了解几件事'),'text-link')}</div></section>`;
}
function shop(route) {
  const query=new URLSearchParams(route.split('?')[1]||'');
  const category=categories().includes(query.get('category'))?query.get('category'):'All';
  const term=(query.get('q')||'').slice(0,100), sort=query.get('sort')||'curated';
  const list=products.filter(p=>(category==='All'||p.category===category)&&[p.name,p.nameZh,p.category,categoryLabel(p.category),...(p.colorOptions||[]).flatMap(c=>[c.name,c.nameZh]),...(p.visualTagsEn||[]),...(p.visualTagsZh||[])].join(' ').toLowerCase().includes(term.toLowerCase()));
  if(sort==='name') list.sort((a,b)=>productName(a).localeCompare(productName(b),lang==='zh'?'zh-CN':'en'));
  const title=category==='Hats'?t('A good hat day.','今天，戴上好心情。'):category==='Scarves'?t('The scarf garden.','围巾花园，慢慢逛。'):category==='Gloves'?t('Little joys, at hand.','把喜欢，握在手心。'):category==='Extras'?t('A little something extra.','多一点小小的喜欢。'):t('Good things, knitted.','好东西，一针一线。');
  return `<section class="page-heading"><p class="eyebrow">${t(`THE MOSSYLOOM EDIT / ${products.length} STYLES`,`MOSSYLOOM 精选 / ${products.length} 款小物`)}</p><h1>${title}</h1><p>${t('Thirty styles to explore. Keep a list of the pieces and colors you love.','30 个独立款式，把喜欢的款式和配色想法收进自己的清单。')}</p></section><section class="shop-area"><div class="shop-toolbar"><div class="category-tabs" role="group" aria-label="${t('Product categories','商品分类')}">${['All',...categories()].map(c=>routeLink('/shop?'+new URLSearchParams({category:c,q:term,sort}),`${c==='All'?t('All pieces','全部'):categoryLabel(c)} <span>${c==='All'?products.length:categoryCount(c)}</span>`,c===category?'active':'')).join('')}</div><form id="filter-form" class="filter-bar"><input type="hidden" name="category" value="${category}"><label class="sr-only" for="collection-search">${t('Search pieces','搜索款式')}</label><input id="collection-search" name="q" value="${esc(term)}" maxlength="100" type="search" placeholder="${t('A color, a pattern…','颜色、图案……')}"><label class="sr-only" for="collection-sort">${t('Sort pieces','排序')}</label><select id="collection-sort" name="sort"><option value="curated">${t('Our little edit','小店精选')}</option><option value="name" ${sort==='name'?'selected':''}>${t('By name','按名称')}</option></select><button class="btn">${t('Apply','筛选')}</button></form></div><div class="results-caption"><span>${list.length} ${t('pieces','款')}${term?' · '+t('Searching for ','搜索 ')+`“${esc(term)}”`:''}</span><span>${t('Collection preview · ordering opens later','首发预览 · 尚未开放下单')}</span></div>${list.length?grid(list):`<div class="empty-state"><h2>${t('Nothing in this little corner.','这个角落，暂时空着。')}</h2><p>${t('Try another color or browse the whole collection.','换一个颜色关键词，或回到全部系列看看。')}</p>${routeLink('/shop',t(`See all ${products.length} pieces`,`看看全部 ${products.length} 款`),'btn')}</div>`}</section>`;
}
const looks = [
  {id:'blue',en:'A blue-sky kind of day.',zh:'给今天，留一片蓝。',noteEn:'Play with two shades of blue. Let a simple coat do the rest.',noteZh:'试试两种不同深浅的蓝，再搭一件简单的大衣。',items:['foldover-beanie','cloud-fringe-scarf']},
  {id:'color',en:'A little color, a lot of character.',zh:'一点颜色，很多个性。',noteEn:'Let a bold stripe lead the way. A plain beanie keeps the mood easy.',noteZh:'让彩色条纹成为主角，用一顶纯色帽子把日常穿得轻松一点。',items:['color-study-scarf','roll-edge-beanie']},
  {id:'pattern',en:'A familiar coat, a fresh idea.',zh:'熟悉的外套，新的小心思。',noteEn:'A plain scarf or a stripe: two different starting points for the clothes you already love.',noteZh:'纯色或条纹，两种简单的起点，让衣橱里喜欢的外套多一种穿法。',items:['everyday-rib-scarf','weekend-stripe-scarf']}
];
function lookbook() {
  return `<section class="page-heading"><p class="eyebrow">MOSSYLOOM / OUTFIT NOTES</p><h1>${t('No rules.<br><em>Just little ideas.</em>','穿搭没有标准答案，<br><em>只有一点小灵感。</em>')}</h1><p>${t('A few ways to start. Add the rest of you.','从这里开始，再加上你自己的日常。')}</p></section><div class="lookbook">${looks.map((look,i)=>`<section class="look-row"><div class="look-copy"><span class="look-number">0${i+1}</span><h2>${t(look.en,look.zh)}</h2><p>${t(look.noteEn,look.noteZh)}</p><button class="btn btn-outline" data-save-look="${look.id}">${t('Save these two pieces','收藏这两款')} ${icon('heart')}</button><small>${t('Style inspiration. Pieces are shown separately; no set is offered for sale.','仅为搭配灵感，照片分别展示单款，不作为套装售卖。')}</small></div><div class="look-images">${look.items.map(id=>{const p=findProduct(id);return `<a href="#/product/${p.id}">${photo(p)}<span>${esc(productName(p))} ${icon('arrow')}</span></a>`;}).join('')}</div></section>`).join('')}</div>`;
}
function story() {
  const copy=lang==='zh'?storyCopy.about.zh:storyCopy.about.en;
  return `<section class="page-heading story-heading"><p class="eyebrow">MOSSYLOOM / THE LITTLE STROLL</p><h1>${t('For your kind<br><em>of everyday.</em>','为你的，<br><em>那一种日常。</em>')}</h1><p>${esc(t(storyCopy.footer.en,storyCopy.footer.zh))}</p></section><section class="story-grid"><div class="story-picture">${photo(findProduct('everyday-rib-scarf'))}<span>${t('a familiar coat, a little something new','熟悉的外套，一点新的心思')}</span></div><div class="story-copy"><p class="eyebrow">${t('A LITTLE ROOM TO BE YOURSELF','留一点自己的样子')}</p><h2>${t('Take your time.<br>Find your thing.','慢慢逛，<br>找到你喜欢的。')}</h2>${copy.map(text=>`<p>${esc(text)}</p>`).join('')}${routeLink('/shop',t('Find a little favorite','找一件日常偏爱')+icon('arrow'),'text-link')}</div></section><section class="brand-pillars">${storyCopy.pillars.map((pillar,i)=>`<article><span>0${i+1}</span><h2>${esc(t(pillar.en,pillar.zh))}</h2><p>${esc(t(pillar.bodyEn,pillar.bodyZh))}</p></article>`).join('')}</section><section class="story-photo-note"><div>${photo(findProduct('cloud-fringe-scarf'))}</div><div><p class="eyebrow">${t('ONE PIECE. MORE THAN ONE MOOD.','同一款小物，不止一种心情')}</p><h2>${t('Start with<br>a little color.','就从一点<br>颜色开始。')}</h2><p>${t('Quiet or bright, a familiar shape or an unexpected stripe. Explore our selection and keep the colors that catch your eye in your own little list.','安静或鲜明，熟悉的轮廓，意外的条纹。把喜欢的款式和配色存进自己的清单，下一次出门前，多一个小灵感。')}</p>${routeLink('/lookbook',t('A few ways to begin','看看搭配灵感')+icon('arrow'),'text-link')}</div></section>`;
}
function faq() {
  const questions = [
    ['Can I place an order yet?','现在可以下单吗？','Not just yet. This is a collection and website preview. There is no checkout or payment collection. We’ll publish confirmed prices and service information before orders open.','还不能。这是系列与网站筹备展示版，没有开放结账或收款。开售前会先公布确认后的售价和服务信息。'],
    ['What does saving a piece do?','收藏以后会发生什么？','It keeps a list of pieces and color preferences in this browser. You can copy or download it to share yourself. It does not reserve stock, place an order, or send anything to the shop. No account is needed.','收藏会在当前浏览器保存款式和配色意向，方便你自行复制、下载和分享。不会锁定库存、生成订单或发送给店铺，也不需要注册。'],
    ['Are these real photographs?','这里用的是真实照片吗？','Yes. These are supplier product photographs, resized and compressed for this preview. Products and models have not been replaced with AI-generated images. Photos can include colors that may not be in the final collection.','是的，使用供应商商品实拍，只为网页展示调整图片尺寸并压缩文件，没有用 AI 替换商品或模特。照片可能包含最终不会上架的颜色。'],
    ['Are materials, fit and colors final?','材质、尺寸和颜色都确定了吗？','We’re still checking samples and matching final color options to the photographs. Please treat the gallery as a visual reference. Confirmed composition and measurements will be provided before purchase is possible.','目前还在核验样品，并逐一对应照片和最终颜色选项。图库先作为外观参考，成分与尺寸会在开放购买前明确。'],
    ['How do I hear about the launch?','怎样了解开售消息？','Please revisit this page. A launch date and a customer contact channel have not been announced. We are not collecting email subscriptions at this stage.','可以稍后再来看看。目前尚未公布开售日期和正式客服渠道，也暂未收集邮箱订阅。'],
    ['Where will you deliver?','以后会配送到哪里？','The initial delivery plan is being reviewed, starting with the United States. Destinations, customer shipping charges and returns will be published before orders open.','目前正优先评估美国配送。实际配送地区、顾客运费和退换安排，会在开放下单前公布。']
  ];
  return infoPage(t('A few useful answers.','逛店前，了解几件事。'),questions);
}
function infoPage(title, questions) { return `<section class="info-page"><p class="eyebrow">MOSSYLOOM / GOOD TO KNOW</p><h1>${title}</h1><div class="info-intro">${t('Our little shop is taking shape. Here’s where things stand.','小店正在准备中，先把当前能做的事说清楚。')}</div>${questions.map(([en,zh,ae,az],i)=>`<details ${i===0?'open':''}><summary>${t(en,zh)}</summary><p>${t(ae,az)}</p></details>`).join('')}<div class="button-row">${routeLink('/shop',t('Back to the collection','回到首发系列'),'btn')}${routeLink('/saved',t('Your saved pieces','心愿清单'),'text-link')}</div></section>`; }
function shipping() { return infoPage(t('Delivery, in the making.','配送，正在认真准备。'),[
  ['Where are you planning to deliver?','计划配送到哪里？','We’re assessing a United States launch first. No delivery destination is open for ordering yet.','我们正在优先评估美国市场，当前还未开放任何地区的下单。'],
  ['How long will delivery take?','配送需要多久？','The carrier service under review lists a reference transit time of 5–8 business days. This is not a customer delivery promise. Processing time, destination coverage, customs and final terms still need to be confirmed.','正在评估的承运商线路标注参考运输时效为 5–8 个工作日。这不是向顾客承诺的送达时间，备货时间、配送范围、清关和最终条款仍需确认。'],
  ['What will shipping cost?','顾客需要支付多少运费？','Customer shipping charges have not been set. Final packed weights and service terms are being checked. There is currently no free-shipping or express-delivery offer.','顾客运费尚未定案，需先确认打包后的计费重和线路条款。目前没有已生效的包邮或加急配送承诺。'],
  ['What about returns?','退换货怎么处理？','A returns policy, return address and customer support channel will be published before purchase is enabled. There are no active orders or returns on this preview.','正式开放购买前，会公布退换政策、退货地址和客服渠道。当前展示站尚未产生真实订单或退货。']
  ]); }
function privacy() {
  return `<section class="info-page"><p class="eyebrow">MOSSYLOOM / YOUR BROWSER</p><h1>${t('Your little list, explained.','你的清单，保存在哪里。')}</h1><p>${t('Last updated: October 3, 2026. This notice describes the current preview only.','更新于 2026 年 10 月 3 日。本说明仅描述当前展示版。')}</p><h2>${t('What stays on this device','保存在此设备的内容')}</h2><p>${t('Your language choice, saved product IDs and color preferences are kept in this browser’s local storage, if available. They do not sync to other devices. No name, email, address, password or payment details are requested by this site.','语言偏好、收藏的商品编号和配色意向会保存在当前浏览器的本地存储中（如可用），不会跨设备同步。本站不要求填写姓名、邮箱、地址、密码或支付资料。')}</p><h2>${t('Hosting and sharing','托管与分享')}</h2><p>${t('This site uses no analytics, advertising pixels, external fonts or email service. GitHub Pages serves the website and may retain normal hosting logs, including visitor IP addresses. Copying or downloading a list stays on your device until you choose where to share it.','本站未接入统计分析、广告追踪、外部字体或邮件服务。网站由 GitHub Pages 托管，托管方可能按其政策记录访问 IP 等日志。复制或下载清单后，只有你自行选择分享对象才会分享出去。')} <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">${t('GitHub privacy statement','GitHub 隐私声明')} ↗</a></p><h2>${t('Clear your browser data','清除本店本地数据')}</h2><p>${t('This clears saved pieces, color preferences, language preferences and any remaining data from the earlier shop demo in this browser. It does not affect other websites or another device.','这会清除此浏览器内的本店收藏、配色意向、语言偏好，以及早期演示版遗留的本店数据，不影响其他网站和其他设备。')}</p><button class="btn btn-outline" data-reset>${t('Clear Mossyloom data','清除 Mossyloom 本地数据')}</button><p class="small-note">${t('If you use private browsing or block storage, your list may only last for this visit.','如使用无痕模式或禁用存储，清单可能只保留到本次访问结束。')}</p></section>`;
}
function footer() { return `<footer class="site-footer"><div class="footer-top"><div class="footer-brand">${brand()}<p>${t('Little accessories.<br>Room to be yourself.','小小配饰，<br>留一点自己的样子。')}</p><span class="eyebrow">THE LITTLE STROLL</span><a href="#/story" class="footer-story-link">${t('A note from Mossyloom','读一封小店的信')} ↗</a></div><div><h3>${t('Wander a little','慢慢逛')}</h3>${routeLink('/shop',t('The collection','精选系列'))}${routeLink('/lookbook',t('Ways to wear','搭配灵感'))}${routeLink('/story',t('Our story','品牌故事'))}</div><div><h3>${t('Good to know','逛店须知')}</h3>${routeLink('/faq',t('Questions & answers','常见问题'))}${routeLink('/shipping',t('Delivery & returns','配送与退换'))}${routeLink('/privacy',t('Privacy & saved data','隐私与本地数据'))}</div><div class="footer-note"><h3>${t('Keep a little list','留一张小小清单')}</h3><p>${t('Save what you love.<br>Come back whenever you like.','喜欢的，先收好。<br>想起来时，再来看看。')}</p>${routeLink('/saved',t('Your saved pieces','打开心愿清单')+icon('arrow'),'text-link')}</div></div><div class="footer-bottom"><span>© 2026 MOSSYLOOM</span><span>${t('Collection preview · Not open for orders','系列筹备展示 · 尚未开放下单')}</span><span>${t('For your kind of everyday.','为你的，那一种日常。')}</span></div></footer>`; }
function render(focusMain=false) {
  document.documentElement.lang=lang==='zh'?'zh-CN':'en';
  const route=currentRoute();
  let content=collection.render(route);
  if(content==null) {
    if(route==='/') content=homepage();
    else if(route==='/shop'||route.startsWith('/shop?')) content=shop(route);
    else if(route==='/lookbook') content=lookbook();
    else if(route==='/story') content=story();
    else if(route==='/faq'||route==='/guide') content=faq();
    else if(route==='/shipping') content=shipping();
    else if(route==='/privacy') content=privacy();
    else content=`<section class="empty-state"><p class="eyebrow">404 / A LITTLE DETOUR</p><h1>${t('A little lost?','好像，走岔了一条小路。')}</h1><p>${t('That page may have moved as our collection takes shape.','随着首发系列整理，这个页面可能已经调整。')}</p>${routeLink('/shop',t('Find the collection','回到首发系列'),'btn')}</section>`;
  }
  $('#app').innerHTML=shell(content);
  const product=route.startsWith('/product/')?findProduct(route.split('/')[2]):null;
  const label=product?productName(product):route.startsWith('/shop')?t('The collection','精选系列'):route==='/saved'?t('Saved pieces','心愿清单'):t('The Little Stroll','慢游小店');
  document.title=`${label} · Mossyloom`;
  bind(); collection.bind(document);
  if(focusMain) { window.scrollTo(0,0); $('#main')?.focus({preventScroll:true}); }
}
function bind() {
  document.querySelectorAll('.mobile-nav a,.brand').forEach(anchor=>anchor.addEventListener('click',event=>{if(anchor.getAttribute('href')==='#'+currentRoute()){event.preventDefault();menuOpen=searchOpen=false;render(true);}}));
  $('[data-lang]')?.addEventListener('click',()=>{lang=lang==='en'?'zh':'en'; write('mossy-lang',lang);const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);render();$('[data-lang]')?.focus();});
  $('[data-menu]')?.addEventListener('click',()=>{menuOpen=!menuOpen;searchOpen=false;render();$('[data-menu]')?.focus();});
  $('[data-search]')?.addEventListener('click',()=>{searchOpen=!searchOpen;menuOpen=false;render();(searchOpen?$('#site-search'):$('[data-search]'))?.focus();});
  $('#search-panel')?.addEventListener('submit',event=>{event.preventDefault();searchOpen=false;navigate('/shop?q='+encodeURIComponent(new FormData(event.target).get('q')||''));});
  $('#filter-form')?.addEventListener('submit',event=>{event.preventDefault();navigate('/shop?'+new URLSearchParams(new FormData(event.target)));});
  document.querySelectorAll('[data-card-save]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.cardSave;collection.toggleSave(id);render();document.querySelector(`[data-card-save="${id}"]`)?.focus({preventScroll:true});}));
  document.querySelectorAll('[data-save-look]').forEach(button=>button.addEventListener('click',()=>{const look=looks.find(l=>l.id===button.dataset.saveLook);look.items.forEach(id=>{if(!collection.isSaved(id))collection.toggleSave(id);});render();toast(t('Both pieces are on your saved list.','两款都已加入心愿清单。'));document.querySelector(`[data-save-look="${look.id}"]`)?.focus({preventScroll:true});}));
  $('[data-reset]')?.addEventListener('click',()=>{if(!confirm(t('Clear this shop’s saved pieces and previous demo data from this browser?','清除此浏览器中的本店收藏和旧演示数据？')))return;try{Object.keys(localStorage).filter(key=>key.startsWith('mossy')).forEach(key=>localStorage.removeItem(key));}catch{}location.href=location.pathname+'#/privacy';location.reload();});
}
document.querySelector('.skip-link')?.addEventListener('click',event=>{event.preventDefault();$('#main')?.focus();$('#main')?.scrollIntoView();});
window.addEventListener('hashchange',()=>{menuOpen=searchOpen=false;render(true);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(menuOpen||searchOpen)){const wasSearch=searchOpen;menuOpen=searchOpen=false;render();$(wasSearch?'[data-search]':'[data-menu]')?.focus();}});
try {
  const response=await fetch('./data/catalog.json?v=n04-20261004');if(!response.ok)throw Error('Catalog unavailable');
  products=await response.json();
  if(!Array.isArray(products)||!products.length)throw Error('The collection is unavailable');
  collection=createCollection({products,t,navigate,rerender:()=>render(),toast,icon,getLang:()=>lang});
  render();
} catch(error) {
  console.error(error);
  $('#app').innerHTML=`<section class="empty-state"><h1>Mossyloom</h1><p>The collection couldn’t load. Please try again.<br>系列暂未加载成功，请刷新重试。</p><button class="btn" id="retry">Retry / 重试</button></section>`;
  $('#retry').addEventListener('click',()=>location.reload());
}
