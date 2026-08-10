import { ChoiceId, choices, getScene, levels, sceneMeta, StoryLine } from '../data/narrative';

type Save = { scene:number; line:number; choice:ChoiceId; clues:string[]; completed:number[] };
const KEY = 'seiran-detectives-graybox-v1';
const fresh = (): Save => ({ scene:0, line:0, choice:'A', clues:[], completed:[] });
const tokens = ['◈','✦','●','◆','✿','▣'];

export class AnimeDetectiveApp {
  private save: Save = fresh();
  private story: StoryLine[] = [];
  constructor(private root: HTMLElement) {}

  mount() { this.renderMenu(); }

  private load() {
    try { this.save = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { this.save = fresh(); }
  }
  private persist() { localStorage.setItem(KEY, JSON.stringify(this.save)); }

  private shell(content:string) {
    this.root.innerHTML = `<main class="phone">${content}</main>`;
  }

  private renderMenu() {
    this.load();
    const hasSave = this.save.scene > 0 || this.save.line > 0 || this.save.completed.length > 0;
    this.shell(`<section class="menu">
      <div class="crest">S</div><p class="eyebrow">SEIRAN COLLEGE</p>
      <h1>Детективы<br><span>класса U</span></h1>
      <p class="tagline">Комедийная visual novel × match‑3</p>
      <div class="menu-actions">
        <button id="new" class="primary">Новая игра</button>
        <button id="continue" ${hasSave?'':'disabled'}>Продолжить</button>
        <button id="episodes">Выбор сцены <small>graybox</small></button>
      </div>
      <footer>ANM‑004 · Narrative Graybox</footer>
    </section>`);
    this.root.querySelector('#new')?.addEventListener('click',()=>{ this.save=fresh(); this.persist(); this.openScene(0,0); });
    this.root.querySelector('#continue')?.addEventListener('click',()=>this.openScene(this.save.scene,this.save.line));
    this.root.querySelector('#episodes')?.addEventListener('click',()=>this.renderSceneSelect());
  }

  private renderSceneSelect() {
    this.shell(`<section class="panel"><button class="back">← Меню</button><p class="eyebrow">GRAYBOX TOOLS</p><h2>Выбор сцены</h2><div class="scene-list">${sceneMeta.map((m,i)=>`<button data-scene="${i}"><b>${i}. ${m[0]}</b><small>${m[1]}</small></button>`).join('')}</div></section>`);
    this.root.querySelector('.back')?.addEventListener('click',()=>this.renderMenu());
    this.root.querySelectorAll<HTMLElement>('[data-scene]').forEach(b=>b.addEventListener('click',()=>this.openScene(Number(b.dataset.scene),0)));
  }

  private openScene(scene:number,line=0) {
    this.save.scene=scene; this.save.line=line; this.story=getScene(scene,this.save.choice); this.persist(); this.renderVN();
  }

  private renderVN() {
    const meta=sceneMeta[this.save.scene];
    const entry=this.story[Math.min(this.save.line,this.story.length-1)];
    if (!entry) return this.advanceScene();
    const direction=entry.speaker==='РЕЖИССУРА' || entry.speaker==='СИСТЕМА';
    this.shell(`<section class="vn bg-${this.save.scene}">
      <header><button id="menu">☰</button><div><small>СЦЕНА ${this.save.scene}</small><b>${meta[1]}</b></div><button id="dossier">Досье <i>${this.save.clues.length}</i></button></header>
      <div class="stage"><div class="sprite left"><span>${this.initialFor(entry.speaker)}</span></div><div class="location-card">GRAYBOX BACKGROUND<br><b>${meta[1]}</b></div></div>
      <div class="dialogue ${direction?'direction':''}" id="next">
        <div class="name">${direction?'ПОСТАНОВКА':entry.speaker}<em>${entry.emotion}</em></div>
        <p>${entry.text}</p><span class="line-id">${entry.id}</span><span class="tap">▼</span>
      </div>
    </section>`);
    this.root.querySelector('#menu')?.addEventListener('click',e=>{e.stopPropagation();this.renderMenu();});
    this.root.querySelector('#dossier')?.addEventListener('click',e=>{e.stopPropagation();this.renderDossier();});
    this.root.querySelector('#next')?.addEventListener('click',()=>this.nextLine());
  }

  private initialFor(s:string) { const map:Record<string,string>={'МИКУ':'M','МИКУ (МЫСЛИ)':'M','ОНОЭ':'O','АЮКИ':'A','ЭМИ':'E','КЭНТАРО':'K','НОРИХИРО':'N','МАЮ':'М'}; return map[s] || '…'; }

  private nextLine() {
    const entry=this.story[this.save.line];
    if (this.save.scene===1 && entry?.id==='VN0040') return this.renderChoice();
    this.save.line++; this.persist();
    if (this.save.line>=this.story.length) this.advanceScene(); else this.renderVN();
  }

  private renderChoice() {
    this.shell(`<section class="choice-screen"><p class="eyebrow">CHOICE_00</p><h2>С чего начать?</h2>${(Object.keys(choices) as ChoiceId[]).map(id=>`<button data-choice="${id}"><i>${id}</i><b>${choices[id].title}</b><small>${choices[id].effect}</small></button>`).join('')}</section>`);
    this.root.querySelectorAll<HTMLElement>('[data-choice]').forEach(b=>b.addEventListener('click',()=>{
      this.save.choice=b.dataset.choice as ChoiceId; this.story=getScene(1,this.save.choice);
      this.save.line=this.story.findIndex(l=>l.id===`VN0041${this.save.choice}`); this.persist(); this.renderVN();
    }));
  }

  private advanceScene() {
    if ([1,3,5,7].includes(this.save.scene)) return this.startMatch(Math.floor(this.save.scene/2));
    if (this.save.scene===8) return this.renderEnding();
    this.openScene(this.save.scene+1,0);
  }

  private startMatch(levelIndex:number) {
    const level=levels[levelIndex]; let moves=level.moves, score=0, selected=-1;
    let board=Array.from({length:64},()=>Math.floor(Math.random()*tokens.length));
    const render=()=>{
      this.shell(`<section class="match"><header><button id="quit">←</button><div><small>РАССЛЕДОВАНИЕ ${levelIndex+1}/4</small><b>${level.title}</b></div><button id="dossier">Досье</button></header>
        <div class="objectives"><span>Ходы <b>${moves}</b></span><span>Наблюдения <b>${score}/${level.target}</b></span></div>
        <div class="board">${board.map((v,i)=>`<button data-cell="${i}" class="t${v} ${selected===i?'selected':''}">${tokens[v]}</button>`).join('')}</div>
        <p class="hint">Меняй соседние жетоны. В graybox засчитывается каждый собранный ряд.</p>
      </section>`);
      this.root.querySelector('#quit')?.addEventListener('click',()=>this.openScene(this.save.scene,this.story.length-1));
      this.root.querySelector('#dossier')?.addEventListener('click',()=>this.renderDossier());
      this.root.querySelectorAll<HTMLElement>('[data-cell]').forEach(c=>c.addEventListener('click',()=>click(Number(c.dataset.cell))));
    };
    const adjacent=(a:number,b:number)=>Math.abs(a-b)===8 || (Math.floor(a/8)===Math.floor(b/8)&&Math.abs(a-b)===1);
    const matches=()=>{ const hit=new Set<number>(); for(let r=0;r<8;r++)for(let c=0;c<6;c++){const i=r*8+c;if(board[i]===board[i+1]&&board[i]===board[i+2]){hit.add(i);hit.add(i+1);hit.add(i+2);}} for(let c=0;c<8;c++)for(let r=0;r<6;r++){const i=r*8+c;if(board[i]===board[i+8]&&board[i]===board[i+16]){hit.add(i);hit.add(i+8);hit.add(i+16);}} return hit;};
    const click=(i:number)=>{ if(selected<0){selected=i;return render();} if(!adjacent(selected,i)){selected=i;return render();} [board[selected],board[i]]=[board[i],board[selected]]; selected=-1; moves--; const hit=matches(); if(hit.size){score+=hit.size;hit.forEach(x=>board[x]=Math.floor(Math.random()*tokens.length));} if(score>=level.target)return win(); if(moves<=0)return lose(); render(); };
    const win=()=>{ if(!this.save.completed.includes(levelIndex))this.save.completed.push(levelIndex); if(!this.save.clues.includes(level.clue))this.save.clues.push(level.clue); this.persist(); this.renderResult(true,levelIndex); };
    const lose=()=>this.renderResult(false,levelIndex);
    render();
  }

  private renderResult(won:boolean,index:number) {
    const level=levels[index]; this.shell(`<section class="result"><div class="result-icon">${won?'✓':'↻'}</div><p class="eyebrow">${won?'УЛИКА НАЙДЕНА':'ХОДЫ ЗАКОНЧИЛИСЬ'}</p><h2>${won?level.clue:'Версия требует повторной проверки'}</h2><button class="primary" id="go">${won?'Вернуться к расследованию':'Повторить уровень'}</button></section>`);
    this.root.querySelector('#go')?.addEventListener('click',()=>won?this.openScene(index*2+2,0):this.startMatch(index));
  }

  private renderDossier() {
    const back=()=>this.openScene(this.save.scene,this.save.line);
    this.shell(`<section class="panel dossier"><button id="back" class="back">← Назад</button><p class="eyebrow">ДЕЛО 001</p><h2>Серийные пропажи</h2><div class="tabs"><b>Улики</b><span>Подозреваемые</span><span>Хронология</span><span>Связи</span></div><div class="clues">${this.save.clues.length?this.save.clues.map((c,i)=>`<article><i>0${i+1}</i><p>${c}</p></article>`).join(''):'<p class="empty">Улик пока нет. Продолжайте расследование.</p>'}</div><button id="reset">Сбросить прогресс graybox</button></section>`);
    this.root.querySelector('#back')?.addEventListener('click',back);
    this.root.querySelector('#reset')?.addEventListener('click',()=>{this.save=fresh();this.persist();this.renderMenu();});
  }

  private renderEnding() {
    this.save.scene=8;this.save.line=this.story.length;this.persist();
    this.shell(`<section class="ending"><div class="thread">⌁</div><p class="eyebrow">КОНЕЦ ВЕРТИКАЛЬНОГО СРЕЗА</p><h1>Это не ткань.</h1><p>Под сервисной биркой спрятана проводящая серебристая нить. След ведёт в центральную прачечную.</p><div class="summary">Выбор: <b>${choices[this.save.choice].title}</b><br>Найдено улик: <b>${this.save.clues.length}/4</b></div><button class="primary" id="menu">В главное меню</button><button id="replay">Начать заново</button></section>`);
    this.root.querySelector('#menu')?.addEventListener('click',()=>this.renderMenu());
    this.root.querySelector('#replay')?.addEventListener('click',()=>{this.save=fresh();this.persist();this.openScene(0,0);});
  }
}
