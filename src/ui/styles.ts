namespace DAI {
  export const STYLES = `
#${ROOT_ID} { position: fixed; inset: 0; z-index: 2147483646; font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #e7e9ee; }
#${ROOT_ID} * { box-sizing: border-box; }
#${ROOT_ID} .dai-backdrop { position: absolute; inset: 0; background: rgba(8,10,14,.68); backdrop-filter: blur(7px); }
#${ROOT_ID} .dai-panel { position: absolute; inset: 5vh 4vw; max-width: 1440px; margin: auto; display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(255,255,255,.10); border-radius: 20px; background: #17191f; box-shadow: 0 30px 100px rgba(0,0,0,.45); }
#${ROOT_ID} .dai-head { display: flex; align-items: center; gap: 14px; padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,.08); }
#${ROOT_ID} .dai-brand { min-width: 220px; }
#${ROOT_ID} .dai-title { font-size: 16px; font-weight: 720; letter-spacing: -.2px; }
#${ROOT_ID} .dai-sub { margin-top: 3px; color: #9299a8; font-size: 11px; }
#${ROOT_ID} .dai-spacer { flex: 1; }
#${ROOT_ID} button, #${ROOT_ID} input, #${ROOT_ID} select { font: inherit; }
#${ROOT_ID} button { border: 1px solid rgba(255,255,255,.10); border-radius: 10px; background: #23262e; color: #e7e9ee; padding: 9px 12px; cursor: pointer; }
#${ROOT_ID} button:hover { background: #2b2f38; }
#${ROOT_ID} button:disabled { opacity: .5; cursor: default; }
#${ROOT_ID} .dai-primary { background: #5865f2; border-color: #6672f4; color: white; }
#${ROOT_ID} .dai-primary:hover { background: #6571f3; }
#${ROOT_ID} .dai-close { width: 38px; height: 38px; padding: 0; font-size: 18px; }
#${ROOT_ID} .dai-tools { display: grid; grid-template-columns: minmax(240px, 1fr) 150px 150px 150px; gap: 10px; padding: 14px 20px 10px; }
#${ROOT_ID} input, #${ROOT_ID} select { width: 100%; height: 38px; border: 1px solid rgba(255,255,255,.10); border-radius: 10px; background: #20232a; color: #e7e9ee; padding: 0 11px; outline: none; }
#${ROOT_ID} input:focus, #${ROOT_ID} select:focus { border-color: rgba(88,101,242,.7); }
#${ROOT_ID} .dai-status { display: flex; align-items: center; gap: 14px; padding: 10px 20px; color: #9ca3b0; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,.06); }
#${ROOT_ID} .dai-status strong { color: #eef0f4; }
#${ROOT_ID} .dai-grid { flex: 1; overflow: auto; padding: 16px 20px 22px; display: grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); align-content: start; gap: 12px; }
#${ROOT_ID} .dai-card { position: relative; min-width: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #1d2027; transition: border-color .14s ease, transform .14s ease; }\n#${ROOT_ID} .dai-card:hover { border-color: rgba(255,255,255,.15); transform: translateY(-1px); }\n#${ROOT_ID} .dai-card.is-selected { border-color: rgba(88,101,242,.82); box-shadow: inset 0 0 0 1px rgba(88,101,242,.2); }\n#${ROOT_ID} .dai-select { position: absolute; z-index: 2; top: 8px; right: 8px; width: 26px; height: 26px; padding: 0; border-radius: 7px; background: rgba(15,17,22,.86); }\n#${ROOT_ID} .dai-card.is-selected .dai-select { background: #5865f2; border-color: #7580f4; }
#${ROOT_ID} .dai-preview { height: 136px; display: grid; place-items: center; background: #12141a; overflow: hidden; }
#${ROOT_ID} .dai-preview img, #${ROOT_ID} .dai-preview video { width: 100%; height: 100%; object-fit: contain; }
#${ROOT_ID} .dai-filetype, #${ROOT_ID} .dai-fonttype { display: grid; place-items: center; gap: 5px; color: #737b8c; text-transform: uppercase; }\n#${ROOT_ID} .dai-filetype b { color: #929aaa; font-size: 19px; letter-spacing: .08em; }\n#${ROOT_ID} .dai-filetype span, #${ROOT_ID} .dai-fonttype span { font-size: 9px; letter-spacing: .08em; }\n#${ROOT_ID} .dai-fonttype b { color: #aab0bb; font-family: Georgia,serif; font-size: 34px; font-weight: 500; text-transform: none; }
#${ROOT_ID} .dai-body { padding: 12px; }\n#${ROOT_ID} .dai-card-meta { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 7px; color: #727b89; font-size: 8px; text-transform: uppercase; letter-spacing: .06em; }\n#${ROOT_ID} .dai-card-meta span:first-child { padding: 3px 5px; border-radius: 5px; background: rgba(255,255,255,.055); }
#${ROOT_ID} .dai-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; font-weight: 650; }
#${ROOT_ID} .dai-url { margin-top: 5px; color: #858d9c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 10px; }
#${ROOT_ID} .dai-chips { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 9px; min-height: 19px; }
#${ROOT_ID} .dai-chip { padding: 3px 6px; border-radius: 6px; background: rgba(255,255,255,.06); color: #aeb4c0; font-size: 9px; }
#${ROOT_ID} .dai-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 11px; }
#${ROOT_ID} .dai-actions button { padding: 7px 6px; font-size: 10px; }
#${ROOT_ID} .dai-empty { grid-column: 1 / -1; text-align: center; color: #858d9c; padding: 70px 20px; }

#${ROOT_ID} .dai-kinds { display: flex; gap: 5px; padding: 0 20px 10px; overflow-x: auto; border-bottom: 1px solid rgba(255,255,255,.06); }
#${ROOT_ID} .dai-kinds button { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 7px; padding: 7px 9px; border-radius: 8px; background: transparent; color: #8e96a4; font-size: 10px; }
#${ROOT_ID} .dai-kinds button b { color: #66707e; font-size: 9px; font-weight: 650; }
#${ROOT_ID} .dai-kinds button:hover, #${ROOT_ID} .dai-kinds button.is-active { background: #24272f; color: #eef0f4; }
#${ROOT_ID} .dai-kinds button.is-active { box-shadow: inset 0 -2px #5865f2; }
#${ROOT_ID} .dai-bulk { min-height: 43px; display: flex; align-items: center; gap: 7px; padding: 7px 20px; border-bottom: 1px solid rgba(255,255,255,.06); }
#${ROOT_ID} .dai-bulk button { padding: 7px 9px; font-size: 10px; }
#${ROOT_ID} .dai-bulk button.is-active { border-color: rgba(88,101,242,.58); background: rgba(88,101,242,.16); color: #dfe2ff; }
#${ROOT_ID} .dai-bulk select { width: 125px; height: 32px; font-size: 10px; }
\n#${ROOT_ID} .dai-progress { height: 3px; background: rgba(255,255,255,.06); overflow: hidden; }
#${ROOT_ID} .dai-progress > i { display: block; height: 100%; width: var(--p,0%); background: #5865f2; transition: width .15s linear; }
@media (max-width: 850px) { #${ROOT_ID} .dai-panel { inset: 2vh 2vw; } #${ROOT_ID} .dai-tools { grid-template-columns: 1fr 1fr; } #${ROOT_ID} .dai-tools input { grid-column: 1 / -1; } #${ROOT_ID} .dai-brand { min-width: 0; } #${ROOT_ID} .dai-head .dai-secondary { display: none; } #${ROOT_ID} .dai-bulk { flex-wrap: wrap; } #${ROOT_ID} .dai-bulk .dai-spacer { display: none; } }\n@media (max-width: 560px) { #${ROOT_ID} .dai-panel { inset: 0; border-radius: 0; } #${ROOT_ID} .dai-tools { grid-template-columns: 1fr; } #${ROOT_ID} .dai-tools input { grid-column: auto; } #${ROOT_ID} .dai-kinds { padding-left: 12px; padding-right: 12px; } #${ROOT_ID} .dai-bulk { padding-left: 12px; padding-right: 12px; } #${ROOT_ID} .dai-bulk select, #${ROOT_ID} .dai-bulk button[data-action="json"] { display: none; } }
`;
}
