/** Non-transactional collection browsing. Saved styles stay in this browser. */
export function createCollection(ctx) {
  const { products, t, navigate, rerender, toast } = ctx;
  const STORAGE_KEY = 'mossyloom-saved-v1';
  const MAX_SAVED = 8;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const find = id => products.find(product => String(product.id) === String(id));
  const name = p => ctx.getLang() === 'zh' ? p.nameZh || p.name : p.name;
  const localized = (p, en, zh, fallback='') => ctx.getLang() === 'zh' ? p[zh] || p[en] || fallback : p[en] || fallback;
  const photos = p => (Array.isArray(p.images) ? p.images : []).filter(src => typeof src === 'string' && src);
  const category = p => t(p.category,({Hats:'帽子',Scarves:'围巾',Gloves:'手套',Sets:'套装'})[p.category] || p.category);
  let storageUnavailable = false;
  let saved = [];
  let shareFallback = false;
  const selectedPhotos = new Map();
  const bound = new WeakSet();
  let currentRoute = '';
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved = [...new Set((Array.isArray(stored) ? stored : []).filter(id => typeof id === 'string' && find(id)))].slice(0,MAX_SAVED);
  } catch (error) {
    if (!(error instanceof SyntaxError)) storageUnavailable = true;
  }
  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));storageUnavailable=false; }
    catch { storageUnavailable=true; }
  };
  const say = (en,zh) => toast(t(en,zh));
  const link = (path,text,cls='') => `<a class="${cls}" href="#${escape(path)}" data-collection="navigate" data-path="${escape(path)}">${text}</a>`;
  const photo = (p,index=0,cls='',lazy=true) => {
    const src=photos(p)[index] || photos(p)[0];
    return src ? `<img class="${cls}" src="${escape(src)}" alt="${escape(name(p))} — ${t('photograph','照片')} ${index+1}" width="900" height="1125" ${lazy?'loading="lazy"':'fetchpriority="high"'} decoding="async">` : `<div class="collection-photo-unavailable">${t('Photograph not available','暂未提供照片')}</div>`;
  };
  const storageNote = () => storageUnavailable ? `<p class="collection-storage-warning" role="status">${t('Browser storage is unavailable. Your list works for this visit, but will be lost when you refresh or close this page. Copy or download it to keep it.','浏览器存储不可用。清单本次仍可使用，但刷新或关闭页面后会丢失；可复制或下载留存。')}</p>` : '';
  const saveButton = (p,compact=false) => `<button type="button" class="${compact?'collection-save-icon':'collection-button'} ${saved.includes(String(p.id))?'is-saved':''}" data-collection="save" data-id="${escape(p.id)}" aria-pressed="${saved.includes(String(p.id))}" aria-label="${escape((saved.includes(String(p.id))?t('Remove from saved styles: ','取消收藏：'):t('Save style: ','收藏款式：'))+name(p))}"><span aria-hidden="true">${saved.includes(String(p.id))?'♥':'♡'}</span>${compact?'':`<span>${saved.includes(String(p.id))?t('Saved to your list','已加入搭配清单'):t('Save this style','收藏这个款式')}</span>`}</button>`;
  const header = (eyebrow,title,copy='') => `<header class="collection-heading"><p class="collection-eyebrow">${eyebrow}</p><h1>${title}</h1>${copy?`<p>${copy}</p>`:''}</header>`;
  const empty = (title,copy) => `<div class="collection-empty"><span aria-hidden="true" class="collection-flower">✳</span><h2>${title}</h2><p>${copy}</p>${link('/shop',t('Wander through the collection ↗','去系列里逛逛 ↗'),'collection-button')}</div>`;
  const productCard = p => `<article class="collection-card"><div class="collection-card-photo">${link('/product/'+encodeURIComponent(p.id),photo(p))}${saveButton(p,true)}</div><div class="collection-card-copy"><small>${escape(category(p))}</small><h3>${link('/product/'+encodeURIComponent(p.id),escape(name(p)))}</h3>${link('/product/'+encodeURIComponent(p.id),t('Take a closer look ↗','看看细节 ↗'),'collection-text-link')}</div></article>`;
  function toggleSave(id) {
    const p=find(id);if(!p)return false;id=String(p.id);
    if(saved.includes(id)) {
      saved=saved.filter(value=>value!==id);persist();rerender();say('Removed from your style list.','已从搭配清单中移除。');return false;
    }
    if(saved.length>=MAX_SAVED) {say('Your list holds up to 8 styles. Remove one before adding another.','搭配清单最多收藏 8 款，先移除一款即可继续添加。');return false;}
    saved.push(id);persist();rerender();say('Saved for your own reference. Nothing was sent to the shop.','已存入你的搭配清单，没有发送给店铺。');return true;
  }
  function publicLink(id) {
    try {
      const canonical=typeof document!=='undefined'?(document.querySelector('link[rel="canonical"]')?.href || document.querySelector('meta[property="og:url"]')?.content):null;
      const url=new URL(canonical || globalThis.location.href);
      url.search='';url.hash='/product/'+encodeURIComponent(id);
      return url.href;
    } catch { return '#/product/'+encodeURIComponent(id); }
  }
  function shareText() {
    return [t('My Mossyloom style list','我的 Mossyloom 搭配清单'),t('A personal style list, not an order. This list has not been sent to the shop.','这是一份个人搭配清单，不是订单，也没有发送给店铺。'),' ',...saved.map((id,index)=>{const p=find(id);return `${index+1}. ${name(p)}\n${publicLink(id)}`;}),' ',t('Collection preview. Prices, stock, specifications and purchase options are not confirmed.','系列预览：价格、库存、商品规格与购买方式尚未确认。')].join('\n');
  }
  function renderProduct(id) {
    const p=find(id);
    if(!p)return `<section class="collection">${empty(t('This path needs a little detour.','这一条小路，暂时没有找到。'),t('That style is not in the current collection. Browse the pieces we have introduced so far.','当前系列没有这个款式，可以去看看已经公开的款式。'))}</section>`;
    const allPhotos=photos(p);
    const index=Math.min(selectedPhotos.get(String(p.id))||0,Math.max(0,allPhotos.length-1));
    const details=localized(p,'detailsEn','detailsZh',[]);
    const tags=localized(p,'visualTagsEn','visualTagsZh',[]);
    const related=products.filter(item=>item.id!==p.id).sort((a,b)=>Number(b.category===p.category)-Number(a.category===p.category)).slice(0,3);
    return `<section class="collection collection-product"><nav class="collection-breadcrumb" aria-label="${t('Breadcrumb','当前位置')}">${link('/',t('The little shop','小店首页'))}<span>/</span>${link('/shop',t('The collection','浏览系列'))}<span>/</span><span>${escape(name(p))}</span></nav><div class="collection-product-grid"><div class="collection-gallery"><button type="button" class="collection-main-photo" data-collection="open-photo" data-id="${escape(p.id)}" aria-label="${escape(t('Enlarge photograph of ','放大查看：')+name(p))}" ${allPhotos.length?'':'disabled'}>${photo(p,index,'',false)}<span class="collection-photo-zoom">${t('A closer look','放大看看')} <span aria-hidden="true">↗</span></span></button>${allPhotos.length>1?`<div class="collection-thumbnails" aria-label="${t('Choose a photograph','选择照片')}">${allPhotos.map((src,i)=>`<button type="button" class="${i===index?'is-active':''}" data-collection="thumbnail" data-id="${escape(p.id)}" data-index="${i}" aria-label="${t('Photograph','照片')} ${i+1} / ${allPhotos.length}" aria-pressed="${i===index}"><img src="${escape(src)}" alt="" loading="lazy" width="90" height="112"></button>`).join('')}</div>`:''}<p class="collection-photo-note">${t('Photographs show the style. Colours shown are visual references, not available colour options.','照片用于展示款式，图中颜色仅供视觉参考，不代表可选或在售颜色。')}</p></div><div class="collection-product-info"><p class="collection-eyebrow">MOSSYLOOM / ${escape(category(p))}</p><h1>${escape(name(p))}</h1><p class="collection-product-description">${escape(localized(p,'description','descriptionZh'))}</p>${Array.isArray(tags)&&tags.length?`<div class="collection-visual-tags" aria-label="${t('Visual details','视觉特点')}">${tags.map(tag=>`<span>${escape(tag)}</span>`).join('')}</div>`:''}<section class="collection-detail-notes"><h2>${t('A few things to notice','可以细看的小地方')}</h2>${Array.isArray(details)&&details.length?`<ul>${details.map(detail=>`<li>${escape(detail)}</li>`).join('')}</ul>`:`<p>${t('Explore the photographs for the shape, knit and styling of this piece.','可以通过照片，看看这件款式的轮廓、针织纹理与搭配方式。')}</p>`}</section><div class="collection-availability"><span class="collection-status-dot" aria-hidden="true"></span><div><strong>${t('For the collection, for now.','先看看款式，慢慢确定。')}</strong><p>${t('Not on sale yet. Pricing, availability, fibre content, measurements and colour options are still being confirmed.','目前尚未开售。售价、库存、成分、尺寸与可选颜色仍待确认。')}</p></div></div><div class="collection-product-actions">${saveButton(p)}${link('/saved',t('Visit your style list ↗','看看搭配清单 ↗'),'collection-text-link')}</div><p class="collection-save-explainer">${t('Keep up to 8 styles on this browser. Saving a style is not a reservation or an order.','最多保存 8 款，保留在当前浏览器。收藏不代表预留库存或下单。')}</p>${storageNote()}<details class="collection-disclosure"><summary>${t('What this preview includes','关于这个预览')}<span aria-hidden="true">+</span></summary><p>${t('You can browse photographs, save styles, and copy or download your own list. No account, payment, personal-information form, or message to the shop is involved.','你可以浏览实拍、收藏款式、复制或下载自己的清单。这里不包含账号、支付、个人信息表单，也不会向店铺发送消息。')}</p></details></div></div>${related.length?`<section class="collection-related"><div class="collection-section-heading"><div><p class="collection-eyebrow">${t('A FEW GOOD COMPANIONS','也许会想一起搭配')}</p><h2>${t('Lovely company.','一起搭，也很好。')}</h2></div>${link('/shop',t('All the pieces ↗','查看整个系列 ↗'),'collection-text-link')}</div><div class="collection-card-grid">${related.map(productCard).join('')}</div></section>`:''}<dialog class="collection-lightbox" id="collection-lightbox" aria-label="${escape(t('Photographs of ','商品照片：')+name(p))}" data-product-id="${escape(p.id)}"><div class="collection-lightbox-bar"><div><strong>${escape(name(p))}</strong><span data-photo-counter>${index+1} / ${allPhotos.length}</span></div><button type="button" data-collection="close-photo" class="collection-lightbox-close" aria-label="${t('Close enlarged photograph','关闭放大照片')}">×</button></div><div class="collection-lightbox-stage"><button type="button" data-collection="lightbox-prev" class="collection-lightbox-arrow" aria-label="${t('Previous photograph','上一张照片')}" ${allPhotos.length<2?'disabled':''}>←</button><div data-lightbox-image>${photo(p,index,'',false)}</div><button type="button" data-collection="lightbox-next" class="collection-lightbox-arrow" aria-label="${t('Next photograph','下一张照片')}" ${allPhotos.length<2?'disabled':''}>→</button></div><p class="collection-lightbox-hint">${t('Use ← → to explore. Press Escape to close. Colours shown are visual references.','使用 ← → 切换，按 Escape 关闭。照片颜色仅供视觉参考。')}</p></dialog></section>`;
  }
  function renderSaved() {
    const list=saved.map(find).filter(Boolean);
    return `<section class="collection collection-saved">${header(t('A LITTLE LIST, JUST FOR YOU','留给自己的小清单'),t('Your style notes.','你的搭配清单。'),t('Gather the pieces you would like to see together.','把想一起搭配的款式，先放在这里。'))}${storageNote()}<div class="collection-list-note"><span aria-hidden="true">♡</span><p>${t('This is your personal list, saved on this browser. It is not an order and is never sent to the shop.','这是保存在当前浏览器的个人清单，不是订单，也不会发送给店铺。')}</p><strong>${list.length} / ${MAX_SAVED}</strong></div>${list.length?`<div class="collection-saved-grid"><div class="collection-saved-items">${list.map((p,i)=>`<article class="collection-saved-row"><span class="collection-saved-number">${String(i+1).padStart(2,'0')}</span>${link('/product/'+encodeURIComponent(p.id),photo(p),'collection-saved-photo')}<div><small>${escape(category(p))}</small><h2>${link('/product/'+encodeURIComponent(p.id),escape(name(p)))}</h2><button type="button" class="collection-text-button" data-collection="save" data-id="${escape(p.id)}">${t('Remove from my list','从清单移除')}</button></div><a class="collection-saved-open" href="#/product/${escape(encodeURIComponent(p.id))}" data-collection="navigate" data-path="/product/${escape(encodeURIComponent(p.id))}" aria-label="${escape(t('View style: ','查看款式：')+name(p))}">↗</a></article>`).join('')}<div class="collection-list-bottom">${link('/shop',t('← Keep wandering','← 再逛一会儿'),'collection-text-link')}<button type="button" data-collection="clear" class="collection-text-button">${t('Clear my list','清空清单')}</button></div></div><aside class="collection-list-tools"><p class="collection-eyebrow">${t('KEEP YOUR LITTLE NOTES','把这份喜欢，留一份')}</p><h2>${t('Take your list<br>with you.','把清单，<br>带在身边。')}</h2><p>${t('Copy the names and links, or download a plain-text copy for yourself.','可以复制款式名称与链接，或下载一份文本清单留存。')}</p><button type="button" class="collection-button" data-collection="copy"><span aria-hidden="true">⧉</span>${t('Copy my list','复制我的清单')}</button><button type="button" class="collection-button collection-button-outline" data-collection="download"><span aria-hidden="true">↓</span>${t('Download list (.txt)','下载清单（.txt）')}</button><small>${t('These buttons do not contact the shop. You decide whether and where to share the file or text.','这两个按钮不会联系店铺。是否分享、分享给谁，由你自己决定。')}</small>${shareFallback?`<div class="collection-copy-fallback"><label for="collection-copy-text">${t('Select and copy your list below.','可以直接选中并复制下方清单。')}</label><textarea id="collection-copy-text" readonly rows="9">${escape(shareText())}</textarea><button type="button" class="collection-text-button" data-collection="select-copy">${t('Select all text','全选文本')}</button></div>`:''}</aside></div>`:empty(t('A few favorites belong here.','留一点喜欢，在这里。'),t('Tap the heart on a style to start your own little collection.','在心仪款式上点一下爱心，就能开始你的搭配清单。'))}</section>`;
  }
  function renderNotOpen() {
    return `<section class="collection collection-not-open">${header(t('A COLLECTION IN THE MAKING','小店，正在慢慢准备'),t('Good things take a little time.','美好的事，值得慢慢准备。'))}<div class="collection-not-open-card"><span class="collection-flower" aria-hidden="true">✳</span><h2>${t('We are not taking orders yet.','目前尚未开售。')}</h2><p>${t('This is a collection preview. Prices, stock, product specifications and payment arrangements have not been confirmed, so there is no checkout or customer account here.','这是商品系列预览。售价、库存、商品规格与支付安排尚未确认，因此目前没有下单、支付或顾客账号功能。')}</p><p>${t('You can still explore the photographs and keep a personal style list in your browser.','你仍然可以浏览实拍，在自己的浏览器里保存一份搭配清单。')}</p><div>${link('/shop',t('Explore the collection ↗','去逛逛系列 ↗'),'collection-button')}${link('/saved',t('My saved styles','我的搭配清单'),'collection-text-link')}</div></div></section>`;
  }
  function render(route) {
    currentRoute=String(route||'').split('?')[0];
    if(currentRoute.startsWith('/product/')) {let id;try{id=decodeURIComponent(currentRoute.slice(9));}catch{id='';}return renderProduct(id);}
    if(currentRoute==='/saved'||currentRoute==='/wishlist')return renderSaved();
    if(/^\/(cart|checkout|account|orders|order|login)(\/|$)/.test(currentRoute))return renderNotOpen();
    return null;
  }
  function lightboxStep(dialog,change) {
    const p=find(dialog?.dataset.productId);if(!p)return;
    const total=photos(p).length;if(!total)return;
    const index=((selectedPhotos.get(String(p.id))||0)+change+total)%total;
    selectedPhotos.set(String(p.id),index);
    dialog.querySelector('[data-lightbox-image]').innerHTML=photo(p,index,'',false);
    dialog.querySelector('[data-photo-counter]').textContent=`${index+1} / ${total}`;
  }
  const focusHeading = root => {const heading=root.querySelector('.collection-heading h1') || root.querySelector('main');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}};
  const focusCopy = root => {const field=root.querySelector('#collection-copy-text');field?.focus({preventScroll:true});field?.select();};
  function bind(root) {
    if(bound.has(root))return;bound.add(root);
    root.addEventListener('click',async event=>{
      const button=event.target.closest('[data-collection]');if(!button||button.disabled)return;
      const action=button.dataset.collection;event.preventDefault();
      if(action==='navigate')navigate(button.dataset.path);
      else if(action==='save'){const wasSavedList=Boolean(button.closest('.collection-saved-items'));const index=[...root.querySelectorAll('.collection-saved-items [data-collection="save"]')].indexOf(button);const id=button.dataset.id;toggleSave(id);if(wasSavedList){const remaining=[...root.querySelectorAll('.collection-saved-items [data-collection="save"]')];if(remaining.length)remaining[Math.min(Math.max(0,index),remaining.length-1)].focus({preventScroll:true});else focusHeading(root);}else [...root.querySelectorAll('[data-collection="save"]')].find(el=>el.dataset.id===id)?.focus({preventScroll:true});}
      else if(action==='thumbnail'){const p=find(button.dataset.id),index=Number(button.dataset.index);if(p&&Number.isInteger(index)&&index>=0&&index<photos(p).length){selectedPhotos.set(String(p.id),index);rerender();root.querySelector(`[data-collection="thumbnail"][data-index="${index}"]`)?.focus({preventScroll:true});}}
      else if(action==='open-photo'){const dialog=root.querySelector('#collection-lightbox');if(dialog?.showModal)dialog.showModal();else say('Your browser cannot open the enlarged view. The full photograph remains on this page.','当前浏览器无法打开灯箱，完整照片仍可在页面中查看。');}
      else if(action==='close-photo'){button.closest('dialog')?.close();rerender();root.querySelector('[data-collection="open-photo"]')?.focus({preventScroll:true});}
      else if(action==='lightbox-prev'||action==='lightbox-next')lightboxStep(button.closest('dialog'),action==='lightbox-prev'?-1:1);
      else if(action==='clear'){saved=[];shareFallback=false;persist();rerender();const main=root.querySelector('main');if(main){main.setAttribute('tabindex','-1');main.focus({preventScroll:true});}else focusHeading(root);say('Your personal list has been cleared.','你的个人搭配清单已清空。');}
      else if(action==='copy'){
        try{if(!globalThis.navigator?.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(shareText());say('Copied. Nothing was sent to the shop.','已复制，没有发送给店铺。');}
        catch{shareFallback=true;rerender();focusCopy(root);say('Your list is ready below. Select the text to copy it.','清单已显示在下方，可选中文本复制。');}
      }
      else if(action==='select-copy'){const field=root.querySelector('#collection-copy-text');field?.focus();field?.select();}
      else if(action==='download'){
        let url;
        try{const blob=new Blob([shareText()],{type:'text/plain;charset=utf-8'});url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Mossyloom-my-style-list.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Your personal list is ready to download. Nothing was sent to the shop.','个人清单已准备下载，没有发送给店铺。');}
        catch{if(url)URL.revokeObjectURL(url);shareFallback=true;rerender();focusCopy(root);say('Please copy the list below to keep it.','请复制下方清单留存。');}
      }
    });
    root.addEventListener('keydown',event=>{
      const dialog=root.querySelector('#collection-lightbox[open]');if(!dialog)return;
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();lightboxStep(dialog,event.key==='ArrowLeft'?-1:1);}
      if(event.key==='Escape'){event.preventDefault();dialog.close();rerender();root.querySelector('[data-collection="open-photo"]')?.focus({preventScroll:true});}
    });
  }
  return {render,bind,savedCount:()=>saved.length,isSaved:id=>saved.includes(String(id)),toggleSave,selectedIds:()=>[...saved]};
}
