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

* {
  box-sizing: border-box;
}

.app {
  position: fixed;
  inset: 0;
  pointer-events: auto;
  color: #e6e9ef;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 7, 10, .72);
  backdrop-filter: blur(7px);
}

.panel {
  position: absolute;
  inset: 3vh 2.5vw;
  max-width: 1540px;
  margin: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 16px;
  background: #17191f;
  box-shadow: 0 26px 90px rgba(0,0,0,.5);
}

button,
input,
select {
  font: inherit;
}

button {
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 8px;
  background: #22252c;
  color: #dce0e7;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease;
}

button:hover {
  background: #2a2e36;
  border-color: rgba(255,255,255,.15);
}

button:disabled {
  opacity: .42;
  cursor: default;
}

.header {
  min-height: 66px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  background: #181a20;
}

.brand {
  display: grid;
  gap: 3px;
  min-width: 220px;
}

.brand strong {
  font-size: 14px;
  font-weight: 720;
  letter-spacing: -.1px;
}

.brand span {
  color: #7d8593;
  font-size: 10px;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 7px;
}

.header-actions button {
  min-height: 34px;
  padding: 0 11px;
}

.header-actions .primary {
  border-color: #6c76f3;
  background: #5865f2;
  color: white;
}

.header-actions .primary:hover {
  background: #6671f3;
}

.icon-button {
  width: 34px;
  min-width: 34px;
  padding: 0 !important;
  font-size: 17px;
}

.filters {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 150px 150px 170px;
  gap: 8px;
  padding: 12px 16px 9px;
}

input,
select {
  width: 100%;
  height: 36px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 8px;
  outline: none;
  background: #20232a;
  color: #e4e7ec;
  padding: 0 10px;
}

input::placeholder {
  color: #666e7b;
}

input:focus,
select:focus {
  border-color: rgba(88,101,242,.72);
}

.kinds {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 0 16px 9px;
  border-bottom: 1px solid rgba(255,255,255,.055);
  scrollbar-width: none;
}

.kinds::-webkit-scrollbar {
  display: none;
}

.kinds button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 9px;
  border-color: transparent;
  background: transparent;
  color: #8c94a1;
  font-size: 10px;
}

.kinds button:hover {
  background: #20232a;
  color: #d0d5dc;
}

.kinds button.active {
  border-color: rgba(88,101,242,.24);
  background: rgba(88,101,242,.13);
  color: #eef0ff;
}

.kinds b {
  color: #69717f;
  font-size: 9px;
  font-weight: 650;
}

.bulk {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-bottom: 1px solid rgba(255,255,255,.055);
}

.bulk button {
  min-height: 30px;
  padding: 0 9px;
  font-size: 10px;
}

.bulk select {
  width: 125px;
  height: 30px;
  font-size: 10px;
}

.grow {
  flex: 1;
}

.progress {
  height: 2px;
  background: rgba(255,255,255,.04);
  overflow: hidden;
}

.progress i {
  display: block;
  width: 0;
  height: 100%;
  background: #5865f2;
  transition: width .14s linear;
}

.statusbar {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  color: #858e9b;
  font-size: 10px;
  white-space: nowrap;
  overflow-x: auto;
}

.statusbar b {
  color: #e4e7ec;
}

.statusbar .status {
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  align-content: start;
  gap: 12px;
  padding: 14px 16px 20px;
  scrollbar-width: thin;
  scrollbar-color: #555b66 transparent;
}

.card {
  min-width: 0;
  height: 286px;
  display: grid;
  grid-template-rows: 148px 138px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 13px;
  background: #1d2026;
  transition: border-color .14s ease, transform .14s ease;
}

.card:hover {
  border-color: rgba(255,255,255,.15);
  transform: translateY(-1px);
}

.card.selected {
  border-color: rgba(88,101,242,.86);
  box-shadow: inset 0 0 0 1px rgba(88,101,242,.16);
}

.preview {
  position: relative;
  min-width: 0;
  min-height: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #111318;
}

.preview img,
.preview video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-meta {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 5px;
  pointer-events: none;
}

.preview-meta span {
  padding: 4px 6px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 6px;
  background: rgba(12,14,18,.8);
  color: #cbd0d8;
  font-size: 8px;
  font-weight: 650;
  backdrop-filter: blur(5px);
}

.select {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 27px;
  height: 27px;
  padding: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(12,14,18,.78);
  color: white;
}

.card.selected .select {
  border-color: #6f79f4;
  background: #5865f2;
}

.card-body {
  min-width: 0;
  display: grid;
  grid-template-rows: 20px 18px 24px 32px;
  gap: 5px;
  padding: 10px;
}

.filename {
  overflow: hidden;
  color: #e8ebf0;
  font-size: 11.5px;
  font-weight: 680;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
  color: #747d8b;
  font-size: 9px;
  white-space: nowrap;
}

.meta span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-row {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
}

.source-chip {
  flex: 0 0 auto;
  padding: 3px 6px;
  border-radius: 6px;
  background: rgba(255,255,255,.055);
  color: #9ca4b0;
  font-size: 8.5px;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 5px;
}

.card-actions button {
  min-width: 0;
  height: 32px;
  padding: 0 5px;
  color: #b3bac5;
  font-size: 9.5px;
}

.card-actions button:hover {
  color: white;
}

.card-actions .download {
  border-color: rgba(88,101,242,.3);
  background: rgba(88,101,242,.1);
  color: #d0d4ff;
}

.file-preview {
  display: grid;
  place-items: center;
  gap: 5px;
  color: #7f8794;
  text-transform: uppercase;
}

.file-preview b {
  color: #a5acb7;
  font-size: 22px;
  letter-spacing: .06em;
}

.file-preview span {
  font-size: 8px;
  letter-spacing: .06em;
}

.font-preview b {
  font-family: Georgia, serif;
  font-size: 36px;
  font-weight: 500;
  text-transform: none;
}

.empty {
  grid-column: 1 / -1;
  min-height: 220px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  color: #737c89;
  text-align: center;
}

.empty strong {
  color: #c7ccd4;
  font-size: 13px;
}

.empty span {
  font-size: 10px;
}

.load-more {
  grid-column: 1 / -1;
  display: grid;
  place-items: center;
  gap: 6px;
  padding: 14px 0 4px;
}

.load-more button {
  min-width: 190px;
  min-height: 34px;
  padding: 0 12px;
}

.load-more span {
  color: #6f7886;
  font-size: 9px;
}

@media (max-width: 1000px) {
  .panel {
    inset: 2vh 2vw;
  }

  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .filters input {
    grid-column: 1 / -1;
  }

  .header-actions button:not(.primary):not(.icon-button) {
    display: none;
  }
}

@media (max-width: 700px) {
  .panel {
    inset: 0;
    border-radius: 0;
  }

  .header {
    padding: 10px 12px;
  }

  .brand span {
    display: none;
  }

  .filters {
    grid-template-columns: 1fr;
    padding-left: 12px;
    padding-right: 12px;
  }

  .filters input {
    grid-column: auto;
  }

  .kinds,
  .bulk,
  .statusbar {
    padding-left: 12px;
    padding-right: 12px;
  }

  .bulk {
    flex-wrap: wrap;
  }

  .bulk .grow {
    display: none;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    padding: 12px;
  }
}

@media (max-width: 520px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .bulk select {
    display: none;
  }
}
`;
}
