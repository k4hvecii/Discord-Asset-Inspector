namespace DAI {
  export const STYLES = `
:host {
  all: initial !important;
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483646 !important;
  display: block !important;
  width: 100vw !important;
  height: 100vh !important;
  pointer-events: none !important;
}

.dai-root {
  position: fixed;
  pointer-events: auto;
  inset: 0;
  z-index: 2147483646;
  color: #e7e9ee;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.dai-root * { box-sizing: border-box; }

.dai-root .dai-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(6, 8, 12, .72);
  backdrop-filter: blur(8px);
}

.dai-root .dai-panel {
  position: absolute;
  inset: 4vh 3vw;
  max-width: 1500px;
  margin: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 18px;
  background: #17191f;
  box-shadow: 0 28px 90px rgba(0,0,0,.46);
}

.dai-root .dai-head {
  min-height: 70px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  background: #181a20;
}

.dai-root .dai-brand { min-width: 230px; }
.dai-root .dai-title { font-size: 15px; font-weight: 720; letter-spacing: -.15px; }
.dai-root .dai-sub { margin-top: 3px; color: #7f8795; font-size: 10px; }
.dai-root .dai-spacer { flex: 1; }

.dai-root button,
.dai-root input,
.dai-root select {
  font: inherit;
}

.dai-root button {
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 9px;
  background: #22252c;
  color: #dfe2e8;
  padding: 8px 11px;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease;
}

.dai-root button:hover {
  background: #292d35;
  border-color: rgba(255,255,255,.14);
}

.dai-root button:disabled {
  opacity: .42;
  cursor: default;
}

.dai-root .dai-primary {
  background: #5865f2;
  border-color: #6772f4;
  color: white;
}

.dai-root .dai-primary:hover { background: #626ef3; }

.dai-root .dai-close {
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 18px;
}

.dai-root .dai-tools {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 150px 150px 150px;
  gap: 8px;
  padding: 12px 18px 9px;
}

.dai-root input,
.dai-root select {
  width: 100%;
  height: 36px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 9px;
  background: #20232a;
  color: #e4e7ec;
  padding: 0 10px;
  outline: none;
}

.dai-root input::placeholder { color: #666e7c; }

.dai-root input:focus,
.dai-root select:focus {
  border-color: rgba(88,101,242,.72);
}

.dai-root .dai-kinds {
  display: flex;
  gap: 4px;
  padding: 0 18px 9px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid rgba(255,255,255,.055);
}

.dai-root .dai-kinds::-webkit-scrollbar { display: none; }

.dai-root .dai-kinds button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-color: transparent;
  border-radius: 7px;
  background: transparent;
  color: #858d9a;
  font-size: 10px;
}

.dai-root .dai-kinds button b {
  min-width: 18px;
  color: #626a77;
  font-size: 9px;
  font-weight: 650;
  text-align: right;
}

.dai-root .dai-kinds button:hover {
  background: #20232a;
  color: #cdd2da;
}

.dai-root .dai-kinds button.is-active {
  background: #242832;
  color: #eef0f4;
  box-shadow: inset 0 -2px #5865f2;
}

.dai-root .dai-bulk {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  border-bottom: 1px solid rgba(255,255,255,.055);
}

.dai-root .dai-bulk button {
  padding: 6px 9px;
  font-size: 10px;
}

.dai-root .dai-bulk button.is-active {
  border-color: rgba(88,101,242,.5);
  background: rgba(88,101,242,.13);
  color: #dfe2ff;
}

.dai-root .dai-content-toggle {
  color: #8f97a4;
}

.dai-root .dai-content-toggle.is-active {
  border-color: rgba(250,166,26,.34);
  background: rgba(250,166,26,.09);
  color: #f2c26f;
}

.dai-root .dai-bulk select {
  width: 126px;
  height: 31px;
  font-size: 10px;
}

.dai-root .dai-progress {
  height: 2px;
  background: rgba(255,255,255,.04);
  overflow: hidden;
}

.dai-root .dai-progress > i {
  display: block;
  width: var(--p, 0%);
  height: 100%;
  background: #5865f2;
  transition: width .15s linear;
}

.dai-root .dai-status {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 34px;
  padding: 8px 18px;
  color: #858d9a;
  font-size: 10.5px;
  border-bottom: 1px solid rgba(255,255,255,.05);
}

.dai-root .dai-status strong { color: #e4e7ec; }

.dai-root .dai-grid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px 18px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  align-content: start;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: #555b66 transparent;
}

.dai-root .dai-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.075);
  border-radius: 13px;
  background: #1c1f25;
  transition: border-color .14s ease, background .14s ease, transform .14s ease;
}

.dai-root .dai-card:hover {
  border-color: rgba(255,255,255,.14);
  background: #1e2128;
  transform: translateY(-1px);
}

.dai-root .dai-card.is-selected {
  border-color: rgba(88,101,242,.82);
  box-shadow: inset 0 0 0 1px rgba(88,101,242,.16);
}

.dai-root .dai-preview {
  position: relative;
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    linear-gradient(45deg, rgba(255,255,255,.015) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255,255,255,.015) 25%, transparent 25%),
    #111318;
  background-size: 18px 18px;
}

.dai-root .dai-preview img,
.dai-root .dai-preview video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dai-root .dai-preview-top {
  position: absolute;
  inset: 8px 8px auto 8px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  pointer-events: none;
}

.dai-root .dai-badges {
  display: flex;
  gap: 5px;
  min-width: 0;
}

.dai-root .dai-kind-badge,
.dai-root .dai-ext-badge {
  padding: 4px 6px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 6px;
  background: rgba(13,15,19,.78);
  color: #d7dbe2;
  backdrop-filter: blur(6px);
  font-size: 8px;
  font-weight: 650;
  letter-spacing: .025em;
}

.dai-root .dai-ext-badge {
  color: #8f98a6;
  font-weight: 600;
}

.dai-root .dai-select {
  width: 27px;
  height: 27px;
  flex: 0 0 27px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 50%;
  background: rgba(13,15,19,.72);
  color: white;
  opacity: .55;
  pointer-events: auto;
  backdrop-filter: blur(6px);
}

.dai-root .dai-card:hover .dai-select,
.dai-root .dai-card.is-selected .dai-select {
  opacity: 1;
}

.dai-root .dai-card.is-selected .dai-select {
  border-color: #6d78f4;
  background: #5865f2;
}

.dai-root .dai-select span {
  font-size: 13px;
  line-height: 1;
}

.dai-root .dai-filetype,
.dai-root .dai-fonttype {
  display: grid;
  place-items: center;
  gap: 4px;
  color: #6d7582;
  text-transform: uppercase;
}

.dai-root .dai-filetype b {
  color: #929aa7;
  font-size: 18px;
  letter-spacing: .08em;
}

.dai-root .dai-filetype span,
.dai-root .dai-fonttype span {
  font-size: 8px;
  letter-spacing: .08em;
}

.dai-root .dai-fonttype b {
  color: #aeb4be;
  font-family: Georgia, serif;
  font-size: 36px;
  font-weight: 500;
  text-transform: none;
}

.dai-root .dai-body {
  padding: 11px 11px 10px;
}

.dai-root .dai-name {
  overflow: hidden;
  color: #e6e9ee;
  font-size: 12px;
  font-weight: 680;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dai-root .dai-location {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  margin-top: 5px;
  color: #707986;
  font-size: 9.5px;
  white-space: nowrap;
}

.dai-root .dai-host {
  min-width: 0;
  overflow: hidden;
  color: #858e9c;
  text-overflow: ellipsis;
}

.dai-root .dai-dot { color: #4f5662; }

.dai-root .dai-footer {
  display: grid;
  gap: 9px;
  margin-top: 10px;
}

.dai-root .dai-chips {
  min-height: 19px;
  display: flex;
  gap: 5px;
  overflow: hidden;
}

.dai-root .dai-chip {
  flex: 0 0 auto;
  padding: 3px 6px;
  border-radius: 6px;
  background: rgba(255,255,255,.055);
  color: #9da5b1;
  font-size: 8.5px;
}

.dai-root .dai-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 5px;
}

.dai-root .dai-actions button {
  min-width: 0;
  padding: 6px 5px;
  border-radius: 7px;
  background: #22252c;
  color: #abb2bd;
  font-size: 9.5px;
}

.dai-root .dai-actions button:hover {
  color: #eef0f4;
}

.dai-root .dai-actions .dai-download {
  border-color: rgba(88,101,242,.3);
  color: #cfd3ff;
  background: rgba(88,101,242,.1);
}

.dai-root .dai-actions .dai-download:hover {
  background: rgba(88,101,242,.18);
}

.dai-root .dai-empty {
  grid-column: 1 / -1;
  padding: 70px 20px;
  color: #747d8b;
  text-align: center;
}

.dai-load-more {
  grid-column: 1 / -1;
  display: grid;
  place-items: center;
  gap: 7px;
  padding: 18px 0 8px;
}

.dai-load-more button {
  min-width: 180px;
  padding: 9px 14px;
}

.dai-load-more button span {
  color: #8f98ff;
  margin-left: 4px;
}

.dai-load-more small {
  color: #68717f;
  font-size: 9px;
}

@media (max-width: 1000px) {
  .dai-root .dai-panel { inset: 2vh 2vw; }
  .dai-root .dai-tools { grid-template-columns: 1fr 1fr; }
  .dai-root .dai-tools input { grid-column: 1 / -1; }
  .dai-root .dai-brand { min-width: 0; }
  .dai-root .dai-head .dai-secondary { display: none; }
  .dai-root .dai-grid { grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
}

@media (max-width: 700px) {
  .dai-root .dai-head { padding: 12px; }
  .dai-root .dai-tools { padding-left: 12px; padding-right: 12px; }
  .dai-root .dai-kinds { padding-left: 12px; padding-right: 12px; }
  .dai-root .dai-bulk { padding-left: 12px; padding-right: 12px; flex-wrap: wrap; }
  .dai-root .dai-bulk .dai-spacer { display: none; }
  .dai-root .dai-status { padding-left: 12px; padding-right: 12px; overflow-x: auto; white-space: nowrap; }
  .dai-root .dai-grid { padding: 12px; }
}

@media (max-width: 560px) {
  .dai-root .dai-panel { inset: 0; border-radius: 0; }
  .dai-root .dai-tools { grid-template-columns: 1fr; }
  .dai-root .dai-tools input { grid-column: auto; }
  .dai-root .dai-bulk select,
  .dai-root .dai-bulk button[data-action="json"] { display: none; }
  .dai-root .dai-grid { grid-template-columns: 1fr; }
}
`;
}
